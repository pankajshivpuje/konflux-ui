import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentKind } from '../../../../types';
import { mockNamespaceHooks } from '../../../../unit-test-utils/mock-namespace';
import { routerRenderer } from '../../../../utils/test-utils';
import { mockNudgeConfig, mockNudgeConfigWithStaleRef, mockEmptyNudgeConfig } from '../../__data__/mockNudgeConfig';
import ComponentNudgesDependencies from '../ComponentNudgesDependencies';

const mockComponent = {
  metadata: { name: 'component-a' },
  spec: { application: 'application' },
} as ComponentKind;

const mockAllComponents = [
  { metadata: { name: 'component-b' }, spec: { application: 'app1' } },
  { metadata: { name: 'component-c' }, spec: { application: 'app2' } },
  { metadata: { name: 'component-d' }, spec: { application: 'app1' } },
] as ComponentKind[];

jest.mock('../../../../hooks/useComponents', () => ({
  useAllComponents: jest.fn(() => [mockAllComponents, true, undefined]),
}));

jest.mock('../../useNudgeConfig', () => ({
  useNudgeConfig: jest.fn(),
  useOutboundNudges: jest.fn(),
  useInboundNudges: jest.fn(),
}));

mockNamespaceHooks('useNamespace', 'test-ns');

const { useNudgeConfig, useOutboundNudges, useInboundNudges } = jest.requireMock('../../useNudgeConfig');

describe('ComponentNudgesDependencies', () => {
  beforeEach(() => {
    const cfg = mockNudgeConfig();
    useNudgeConfig.mockReturnValue([cfg, true, undefined]);
    useOutboundNudges.mockReturnValue([cfg.spec.nudges.filter((n) => n.from === 'component-a'), true, undefined]);
    useInboundNudges.mockReturnValue([[], true, undefined]);
  });

  it('renders empty state when no dependencies', () => {
    const emptyCfg = mockEmptyNudgeConfig();
    useNudgeConfig.mockReturnValue([emptyCfg, true, undefined]);
    useOutboundNudges.mockReturnValue([[], true, undefined]);
    useInboundNudges.mockReturnValue([[], true, undefined]);

    routerRenderer(<ComponentNudgesDependencies component={mockComponent} />);
    expect(screen.getByTestId('nudges-empty-state')).toBeInTheDocument();
  });

  it('renders outbound nudges (Nudges tab)', async () => {
    routerRenderer(<ComponentNudgesDependencies component={mockComponent} />);
    fireEvent.click(screen.getByTestId('nudges-radio'));
    await waitFor(() => {
      expect(screen.getByText('component-b')).toBeInTheDocument();
      expect(screen.getByText('component-c')).toBeInTheDocument();
    });
  });

  it('renders connectors for each outbound nudge', () => {
    routerRenderer(<ComponentNudgesDependencies component={mockComponent} />);
    fireEvent.click(screen.getByTestId('nudges-radio'));
    expect(screen.getAllByTestId('nudges-connector')).toHaveLength(2);
  });

  it('renders links to the related component detail pages', () => {
    routerRenderer(<ComponentNudgesDependencies component={mockComponent} />);
    fireEvent.click(screen.getByTestId('nudges-radio'));
    const links = screen.getAllByTestId('nudges-cmp-link');
    expect(links[0]).toHaveAttribute('href', '/ns/test-ns/applications/app1/components/component-b');
  });

  it('renders mode badges for each nudge', async () => {
    routerRenderer(<ComponentNudgesDependencies component={mockComponent} />);
    fireEvent.click(screen.getByTestId('nudges-radio'));
    await waitFor(() => {
      expect(screen.getByTestId('nudge-mode-badge-immediate')).toBeInTheDocument();
      expect(screen.getByTestId('nudge-mode-badge-validated')).toBeInTheDocument();
    });
  });

  it('renders inbound nudges (Is nudged by tab)', async () => {
    useInboundNudges.mockReturnValue([
      [{ from: 'component-b', to: 'component-a', mode: 'immediate' }],
      true,
      undefined,
    ]);

    routerRenderer(<ComponentNudgesDependencies component={mockComponent} />);
    fireEvent.click(screen.getByTestId('nudged-by-radio'));
    await waitFor(() => {
      expect(screen.getByText('component-b')).toBeInTheDocument();
    });
  });

  it('shows a warning when NudgeConfig has stale conditions', () => {
    const staleCfg = mockNudgeConfigWithStaleRef();
    useNudgeConfig.mockReturnValue([staleCfg, true, undefined]);

    routerRenderer(<ComponentNudgesDependencies component={mockComponent} />);
    expect(screen.getByTestId('nudge-stale-warning')).toBeInTheDocument();
    expect(screen.getByText(/component-d.*does not exist/i)).toBeInTheDocument();
  });

  it('shows an error alert when outbound nudges fail to load', () => {
    useOutboundNudges.mockReturnValue([[], true, new Error('API error')]);

    routerRenderer(<ComponentNudgesDependencies component={mockComponent} />);
    expect(screen.getByTestId('nudge-load-error')).toBeInTheDocument();
  });

  it('returns null when component is not provided', () => {
    const { container } = routerRenderer(
      <ComponentNudgesDependencies component={null as unknown as ComponentKind} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
