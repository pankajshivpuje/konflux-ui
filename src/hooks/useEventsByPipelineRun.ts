import * as React from 'react';
import { useK8sWatchResource } from '../k8s';
import { EventGroupVersionKind, EventModel } from '../models';
import { EventKind, TaskRunKind } from '../types';
import { USE_MOCK_DATA, mockEventsByPipelineRun } from './__mock__/mock-data';
import { useTaskRunsForPipelineRuns } from './useTaskRunsV2';

/**
 * Hook for fetching Kubernetes events related to a PipelineRun and its child resources.
 *
 * Fetches all events in the namespace and filters client-side to include events
 * for the PipelineRun itself, its TaskRuns, and their Pods.
 */
export const useEventsByPipelineRun = (
  namespace: string,
  pipelineRunName: string,
): [EventKind[], boolean, unknown] => {
  if (USE_MOCK_DATA) {
    const events = mockEventsByPipelineRun[pipelineRunName] || [];
    return [events, true, null];
  }
  const [taskRuns, taskRunsLoaded] = useTaskRunsForPipelineRuns(
    namespace,
    pipelineRunName,
    undefined,
    false,
  );

  const relatedNames = React.useMemo(() => {
    const names = new Set<string>();
    if (pipelineRunName) {
      names.add(pipelineRunName);
    }
    if (taskRunsLoaded && taskRuns) {
      taskRuns.forEach((tr: TaskRunKind) => {
        if (tr.metadata?.name) {
          names.add(tr.metadata.name);
        }
        // Pods created by TaskRuns have the same name as the TaskRun
        const podName = tr.status?.podName;
        if (podName) {
          names.add(podName);
        }
      });
    }
    return names;
  }, [pipelineRunName, taskRuns, taskRunsLoaded]);

  const {
    data: allEvents,
    isLoading,
    error,
  } = useK8sWatchResource<EventKind[]>(
    namespace
      ? {
          groupVersionKind: EventGroupVersionKind,
          namespace,
          isList: true,
          watch: true,
        }
      : null,
    EventModel,
  );

  const filteredEvents = React.useMemo(() => {
    if (!allEvents || !relatedNames.size) return [];

    return allEvents
      .filter((event) => event.involvedObject?.name && relatedNames.has(event.involvedObject.name))
      .sort((a, b) =>
        (b.lastTimestamp || b.metadata?.creationTimestamp || '').localeCompare(
          a.lastTimestamp || a.metadata?.creationTimestamp || '',
        ),
      );
  }, [allEvents, relatedNames]);

  return [filteredEvents, !isLoading, error];
};
