import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createK8sWatchResourceMock, createTestQueryClient } from '~/utils/test-utils';
import { EventKind, TaskRunKind } from '../../types';
import { useEventsByPipelineRun } from '../useEventsByPipelineRun';
import { useTaskRunsForPipelineRuns } from '../useTaskRunsV2';

jest.mock('../useTaskRunsV2', () => ({
  useTaskRunsForPipelineRuns: jest.fn(),
}));

const mockUseTaskRunsForPipelineRuns = useTaskRunsForPipelineRuns as jest.Mock;
const useK8sWatchResourceMock = createK8sWatchResourceMock();

const mockTaskRuns: TaskRunKind[] = [
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: {
      name: 'my-pipeline-run-fetch-repo',
      namespace: 'test-ns',
      uid: 'tr-uid-1',
    },
    spec: {},
    status: {
      podName: 'my-pipeline-run-fetch-repo-pod',
    },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: {
      name: 'my-pipeline-run-build',
      namespace: 'test-ns',
      uid: 'tr-uid-2',
    },
    spec: {},
    status: {
      podName: 'my-pipeline-run-build-pod',
    },
  },
];

const mockEvents: EventKind[] = [
  {
    apiVersion: 'v1',
    kind: 'Event',
    metadata: {
      name: 'event-1',
      namespace: 'test-ns',
      uid: 'ev-uid-1',
      creationTimestamp: '2026-04-14T10:00:00Z',
    },
    involvedObject: {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      name: 'my-pipeline-run',
      namespace: 'test-ns',
    },
    reason: 'Started',
    message: 'PipelineRun started',
    type: 'Normal',
    lastTimestamp: '2026-04-14T10:00:00Z',
  },
  {
    apiVersion: 'v1',
    kind: 'Event',
    metadata: {
      name: 'event-2',
      namespace: 'test-ns',
      uid: 'ev-uid-2',
      creationTimestamp: '2026-04-14T10:01:00Z',
    },
    involvedObject: {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      name: 'my-pipeline-run-fetch-repo',
      namespace: 'test-ns',
    },
    reason: 'Running',
    message: 'TaskRun is running',
    type: 'Normal',
    lastTimestamp: '2026-04-14T10:01:00Z',
  },
  {
    apiVersion: 'v1',
    kind: 'Event',
    metadata: {
      name: 'event-3',
      namespace: 'test-ns',
      uid: 'ev-uid-3',
      creationTimestamp: '2026-04-14T10:02:00Z',
    },
    involvedObject: {
      apiVersion: 'v1',
      kind: 'Pod',
      name: 'my-pipeline-run-fetch-repo-pod',
      namespace: 'test-ns',
    },
    reason: 'Pulling',
    message: 'Pulling image',
    type: 'Normal',
    lastTimestamp: '2026-04-14T10:02:00Z',
  },
  {
    apiVersion: 'v1',
    kind: 'Event',
    metadata: {
      name: 'event-unrelated',
      namespace: 'test-ns',
      uid: 'ev-uid-4',
      creationTimestamp: '2026-04-14T10:03:00Z',
    },
    involvedObject: {
      apiVersion: 'v1',
      kind: 'Pod',
      name: 'some-other-pod',
      namespace: 'test-ns',
    },
    reason: 'Scheduled',
    message: 'Unrelated pod event',
    type: 'Normal',
    lastTimestamp: '2026-04-14T10:03:00Z',
  },
];

describe('useEventsByPipelineRun', () => {
  let queryClient: QueryClient;

  const renderHookWithQueryClient = (namespace: string, pipelineRunName: string) => {
    return renderHook(() => useEventsByPipelineRun(namespace, pipelineRunName), {
      wrapper: ({ children }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children),
    });
  };

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();

    mockUseTaskRunsForPipelineRuns.mockReturnValue([
      mockTaskRuns,
      true,
      undefined,
      jest.fn(),
      { hasNextPage: false, isFetchingNextPage: false },
    ]);
  });

  it('should return loading state when events are loading', () => {
    useK8sWatchResourceMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHookWithQueryClient('test-ns', 'my-pipeline-run');
    const [events, loaded, error] = result.current;

    expect(loaded).toBe(false);
    expect(events).toEqual([]);
    expect(error).toBeNull();
  });

  it('should filter events to only include related resources', () => {
    useK8sWatchResourceMock.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    const { result } = renderHookWithQueryClient('test-ns', 'my-pipeline-run');
    const [events, loaded] = result.current;

    expect(loaded).toBe(true);
    // Should include PipelineRun, TaskRun, and Pod events but not the unrelated pod
    expect(events).toHaveLength(3);
    expect(events.map((e) => e.metadata.name)).toEqual(['event-3', 'event-2', 'event-1']);
  });

  it('should exclude events for unrelated resources', () => {
    useK8sWatchResourceMock.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    const { result } = renderHookWithQueryClient('test-ns', 'my-pipeline-run');
    const [events] = result.current;

    const unrelatedEvent = events.find((e) => e.involvedObject.name === 'some-other-pod');
    expect(unrelatedEvent).toBeUndefined();
  });

  it('should sort events by lastTimestamp descending', () => {
    useK8sWatchResourceMock.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    const { result } = renderHookWithQueryClient('test-ns', 'my-pipeline-run');
    const [events] = result.current;

    expect(events[0].lastTimestamp).toBe('2026-04-14T10:02:00Z');
    expect(events[1].lastTimestamp).toBe('2026-04-14T10:01:00Z');
    expect(events[2].lastTimestamp).toBe('2026-04-14T10:00:00Z');
  });

  it('should include events for pods created by task runs', () => {
    useK8sWatchResourceMock.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    const { result } = renderHookWithQueryClient('test-ns', 'my-pipeline-run');
    const [events] = result.current;

    const podEvent = events.find((e) => e.involvedObject.name === 'my-pipeline-run-fetch-repo-pod');
    expect(podEvent).toBeDefined();
    expect(podEvent.reason).toBe('Pulling');
  });

  it('should return empty array when no events match', () => {
    useK8sWatchResourceMock.mockReturnValue({
      data: [mockEvents[3]], // only the unrelated event
      isLoading: false,
      error: null,
    });

    const { result } = renderHookWithQueryClient('test-ns', 'my-pipeline-run');
    const [events, loaded] = result.current;

    expect(loaded).toBe(true);
    expect(events).toEqual([]);
  });

  it('should return error state on failure', () => {
    const mockError = new Error('Failed to fetch events');
    useK8sWatchResourceMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHookWithQueryClient('test-ns', 'my-pipeline-run');
    const [, , error] = result.current;

    expect(error).toBe(mockError);
  });

  it('should pass watch: false to useTaskRunsForPipelineRuns', () => {
    useK8sWatchResourceMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderHookWithQueryClient('test-ns', 'my-pipeline-run');

    expect(mockUseTaskRunsForPipelineRuns).toHaveBeenCalledWith(
      'test-ns',
      'my-pipeline-run',
      undefined,
      false,
    );
  });
});
