import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { useEventsByPipelineRun } from '~/hooks/useEventsByPipelineRun';
import { EventKind } from '~/types';
import { mockUseNamespaceHook } from '~/unit-test-utils/mock-namespace';
import { createUseParamsMock, routerRenderer } from '~/unit-test-utils/mock-react-router';
import PipelineRunEventsTab from '../PipelineRunEventsTab';

jest.mock('~/hooks/useEventsByPipelineRun', () => ({
  useEventsByPipelineRun: jest.fn(),
}));

const mockUseEventsByPipelineRun = useEventsByPipelineRun as jest.Mock;

const mockEvents: EventKind[] = [
  {
    apiVersion: 'v1',
    kind: 'Event',
    metadata: {
      name: 'test-pipeline-run.abc123',
      namespace: 'test-namespace',
      uid: 'event-uid-1',
      creationTimestamp: '2026-04-14T10:00:00Z',
    },
    involvedObject: {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      name: 'test-pipeline-run',
      namespace: 'test-namespace',
    },
    reason: 'Started',
    message: 'PipelineRun started',
    type: 'Normal',
    lastTimestamp: '2026-04-14T10:00:00Z',
    firstTimestamp: '2026-04-14T10:00:00Z',
    source: { component: 'tekton-pipelines-controller' },
  },
  {
    apiVersion: 'v1',
    kind: 'Event',
    metadata: {
      name: 'test-task-run.def456',
      namespace: 'test-namespace',
      uid: 'event-uid-2',
      creationTimestamp: '2026-04-14T10:01:00Z',
    },
    involvedObject: {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      name: 'test-pipeline-run-fetch-repo',
      namespace: 'test-namespace',
    },
    reason: 'Running',
    message: 'TaskRun is running',
    type: 'Normal',
    lastTimestamp: '2026-04-14T10:01:00Z',
    firstTimestamp: '2026-04-14T10:01:00Z',
    source: { component: 'kubelet' },
  },
  {
    apiVersion: 'v1',
    kind: 'Event',
    metadata: {
      name: 'test-pod.ghi789',
      namespace: 'test-namespace',
      uid: 'event-uid-3',
      creationTimestamp: '2026-04-14T10:02:00Z',
    },
    involvedObject: {
      apiVersion: 'v1',
      kind: 'Pod',
      name: 'test-pipeline-run-fetch-repo-pod',
      namespace: 'test-namespace',
    },
    reason: 'BackOff',
    message: 'Back-off pulling image "quay.io/test:latest"',
    type: 'Warning',
    lastTimestamp: '2026-04-14T10:02:00Z',
    firstTimestamp: '2026-04-14T10:02:00Z',
    source: { component: 'kubelet' },
  },
];

describe('PipelineRunEventsTab', () => {
  const mockNamespace = 'test-namespace';
  const mockPipelineRunName = 'test-pipeline-run';

  const useNamespaceMock = mockUseNamespaceHook(mockNamespace);
  const useParamsMock = createUseParamsMock();

  beforeEach(() => {
    jest.clearAllMocks();
    useNamespaceMock.mockReturnValue(mockNamespace);
    useParamsMock.mockReturnValue({ pipelineRunName: mockPipelineRunName });
  });

  it('should render loading spinner when events are loading', () => {
    mockUseEventsByPipelineRun.mockReturnValue([[], false, undefined]);

    routerRenderer(<PipelineRunEventsTab />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should call useEventsByPipelineRun with correct parameters', () => {
    mockUseEventsByPipelineRun.mockReturnValue([[], true, undefined]);

    routerRenderer(<PipelineRunEventsTab />);

    expect(mockUseEventsByPipelineRun).toHaveBeenCalledWith(mockNamespace, mockPipelineRunName);
  });

  it('should render empty state when there are no events', () => {
    mockUseEventsByPipelineRun.mockReturnValue([[], true, undefined]);

    routerRenderer(<PipelineRunEventsTab />);

    expect(screen.getByTestId('events-empty-state')).toBeInTheDocument();
    expect(
      screen.getByText('No events found. Events are short-lived and may have expired.'),
    ).toBeInTheDocument();
  });

  it('should render event stream with events when data is loaded', () => {
    mockUseEventsByPipelineRun.mockReturnValue([mockEvents, true, undefined]);

    const { container } = routerRenderer(<PipelineRunEventsTab />);

    // Should render the streaming event stream container
    const stream = container.querySelector('.co-sysevent-stream');
    expect(stream).toBeInTheDocument();

    // Should render event rows with co-sysevent class
    const eventRows = container.querySelectorAll('.co-sysevent');
    expect(eventRows.length).toBe(3);

    // Should show streaming status
    expect(screen.getByText('Streaming events...')).toBeInTheDocument();

    // Should show event count
    expect(screen.getByText('Showing 3 events')).toBeInTheDocument();
  });

  it('should render warning events with warning styling', () => {
    mockUseEventsByPipelineRun.mockReturnValue([mockEvents, true, undefined]);

    const { container } = routerRenderer(<PipelineRunEventsTab />);

    // The third event is a Warning type
    const warningEvents = container.querySelectorAll('.co-sysevent--warning');
    expect(warningEvents.length).toBe(1);

    // Should have the warning data-test attribute
    expect(screen.getByTestId('event-warning')).toBeInTheDocument();
  });

  it('should render event messages', () => {
    mockUseEventsByPipelineRun.mockReturnValue([mockEvents, true, undefined]);

    routerRenderer(<PipelineRunEventsTab />);

    expect(screen.getByText('PipelineRun started')).toBeInTheDocument();
    expect(screen.getByText('TaskRun is running')).toBeInTheDocument();
    expect(screen.getByText('Back-off pulling image "quay.io/test:latest"')).toBeInTheDocument();
  });

  it('should render resource names with kind icons', () => {
    mockUseEventsByPipelineRun.mockReturnValue([mockEvents, true, undefined]);

    routerRenderer(<PipelineRunEventsTab />);

    // Resource names should appear in the event rows
    expect(screen.getByText('test-pipeline-run')).toBeInTheDocument();
    expect(screen.getByText('test-pipeline-run-fetch-repo')).toBeInTheDocument();
    expect(screen.getByText('test-pipeline-run-fetch-repo-pod')).toBeInTheDocument();
  });

  it('should render source component information', () => {
    mockUseEventsByPipelineRun.mockReturnValue([mockEvents, true, undefined]);

    routerRenderer(<PipelineRunEventsTab />);

    expect(screen.getByText('Generated from tekton-pipelines-controller')).toBeInTheDocument();
    // "kubelet" appears in multiple events
    const kubeletSources = screen.getAllByText('Generated from kubelet');
    expect(kubeletSources.length).toBe(2);
  });
});
