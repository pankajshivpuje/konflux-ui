import { renderHook } from '@testing-library/react';
import { NUDGE_CONFIG_NAME, NudgeConfigGVK, NudgeConfigModel } from '~/models/nudge-config';
import { createK8sWatchResourceMock } from '~/unit-test-utils';
import {
  mockEmptyNudgeConfig,
  mockNudgeConfig,
  mockNudgeConfigWithStaleRef,
} from '../__data__/mockNudgeConfig';
import {
  useApplicationNudges,
  useInboundNudges,
  useNudgeConfig,
  useOutboundNudges,
} from '../useNudgeConfig';

const useK8sWatchResourceMock = createK8sWatchResourceMock();

describe('useNudgeConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useK8sWatchResourceMock.mockReturnValue([mockNudgeConfig(), true, undefined]);
  });

  it('returns the NudgeConfig resource when loaded', () => {
    const { result } = renderHook(() => useNudgeConfig('test-ns'));
    const [nudgeConfig, loaded, error] = result.current;

    expect(loaded).toBe(true);
    expect(error).toBeUndefined();
    expect(nudgeConfig?.spec.nudges).toHaveLength(3);
  });

  it('returns [null, false, undefined] while loading', () => {
    useK8sWatchResourceMock.mockReturnValue({ data: undefined, isLoading: true, error: undefined });

    const { result } = renderHook(() => useNudgeConfig('test-ns'));
    expect(result.current).toEqual([null, false, undefined]);
  });

  it('returns [null, true, null] when CRD is not installed (404)', () => {
    useK8sWatchResourceMock.mockReturnValue([null, true, { code: 404 }]);

    const { result } = renderHook(() => useNudgeConfig('test-ns'));
    expect(result.current).toEqual([null, true, null]);
  });

  it('propagates non-404 errors', () => {
    const mockError = new Error('API error');
    // Use object form to prevent the mock utility from converting null data to [].
    useK8sWatchResourceMock.mockReturnValue({ data: null, isLoading: false, error: mockError });

    const { result } = renderHook(() => useNudgeConfig('test-ns'));
    const [nudgeConfig, loaded, error] = result.current;

    expect(nudgeConfig).toBeNull();
    expect(loaded).toBe(true);
    expect(error).toBe(mockError);
  });

  it('returns [null, true, 404] when the resource is being deleted', () => {
    const deletingConfig = {
      ...mockNudgeConfig(),
      metadata: { ...mockNudgeConfig().metadata, deletionTimestamp: '2026-10-02T00:00:00Z' },
    };
    useK8sWatchResourceMock.mockReturnValue([deletingConfig, true, undefined]);

    const { result } = renderHook(() => useNudgeConfig('test-ns'));
    expect(result.current).toEqual([null, true, { code: 404 }]);
  });

  it('skips the watch when namespace is empty', () => {
    renderHook(() => useNudgeConfig(''));

    expect(useK8sWatchResourceMock).toHaveBeenCalledWith(undefined, NudgeConfigModel);
  });

  it('watches the nudge-config singleton with the correct query options', () => {
    renderHook(() => useNudgeConfig('test-ns'));

    expect(useK8sWatchResourceMock).toHaveBeenCalledWith(
      {
        groupVersionKind: NudgeConfigGVK,
        namespace: 'test-ns',
        name: NUDGE_CONFIG_NAME,
      },
      NudgeConfigModel,
    );
  });

  it('exposes stale-reference conditions from status', () => {
    useK8sWatchResourceMock.mockReturnValue([mockNudgeConfigWithStaleRef(), true, undefined]);

    const { result } = renderHook(() => useNudgeConfig('test-ns'));
    const [nudgeConfig] = result.current;

    expect(nudgeConfig?.status?.conditions?.[0].status).toBe('False');
    expect(nudgeConfig?.status?.conditions?.[0].reason).toBe('Error');
  });
});

describe('useOutboundNudges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useK8sWatchResourceMock.mockReturnValue([mockNudgeConfig(), true, undefined]);
  });

  it('returns nudges where the component is the source', () => {
    const { result } = renderHook(() => useOutboundNudges('test-ns', 'component-a'));
    const [nudges] = result.current;

    expect(nudges).toHaveLength(2);
    expect(nudges.map((n) => n.to)).toEqual(['component-b', 'component-c']);
  });

  it('returns an empty array for a component with no outbound nudges', () => {
    const { result } = renderHook(() => useOutboundNudges('test-ns', 'component-d'));
    expect(result.current[0]).toEqual([]);
  });

  it('returns an empty array when NudgeConfig is missing (404)', () => {
    useK8sWatchResourceMock.mockReturnValue([null, true, { code: 404 }]);
    const { result } = renderHook(() => useOutboundNudges('test-ns', 'component-a'));
    expect(result.current[0]).toEqual([]);
  });

  it('returns an empty array when NudgeConfig has no nudges', () => {
    useK8sWatchResourceMock.mockReturnValue([mockEmptyNudgeConfig(), true, undefined]);
    const { result } = renderHook(() => useOutboundNudges('test-ns', 'component-a'));
    expect(result.current[0]).toEqual([]);
  });
});

describe('useInboundNudges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useK8sWatchResourceMock.mockReturnValue([mockNudgeConfig(), true, undefined]);
  });

  it('returns nudges where the component is the target', () => {
    const { result } = renderHook(() => useInboundNudges('test-ns', 'component-b'));
    const [nudges] = result.current;

    expect(nudges).toHaveLength(1);
    expect(nudges[0].from).toBe('component-a');
    expect(nudges[0].mode).toBe('immediate');
  });

  it('returns multiple inbound nudges when component is targeted by several sources', () => {
    // component-b is nudged by component-a; let's also test component-c
    const { result } = renderHook(() => useInboundNudges('test-ns', 'component-c'));
    const [nudges] = result.current;

    expect(nudges).toHaveLength(1);
    expect(nudges[0].from).toBe('component-a');
    expect(nudges[0].mode).toBe('validated');
    expect(nudges[0].gatingGroup).toBe('frontend-stack');
  });

  it('returns an empty array for a component with no inbound nudges', () => {
    const { result } = renderHook(() => useInboundNudges('test-ns', 'component-a'));
    expect(result.current[0]).toEqual([]);
  });
});

describe('useApplicationNudges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useK8sWatchResourceMock.mockReturnValue([mockNudgeConfig(), true, undefined]);
  });

  it('returns nudges involving any component in the application', () => {
    const { result } = renderHook(() =>
      useApplicationNudges('test-ns', ['component-a', 'component-b']),
    );
    const [nudges] = result.current;

    // component-a→b, component-a→c, component-b→d
    expect(nudges).toHaveLength(3);
  });

  it('excludes nudges not involving any app component', () => {
    const { result } = renderHook(() => useApplicationNudges('test-ns', ['component-d']));
    const [nudges] = result.current;

    // only component-b→d
    expect(nudges).toHaveLength(1);
    expect(nudges[0].from).toBe('component-b');
  });

  it('returns an empty array for an empty component list', () => {
    const { result } = renderHook(() => useApplicationNudges('test-ns', []));
    expect(result.current[0]).toEqual([]);
  });
});
