import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Bullseye, EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';
import { usePipelineRunV2 } from '~/hooks/usePipelineRunsV2';
import { RouterParams } from '~/routes/utils';
import { useNamespace } from '~/shared/providers/Namespace';

const PipelineRunEventsTab: React.FC = () => {
  const { pipelineRunName } = useParams<RouterParams>();
  const namespace = useNamespace();
  const [pipelineRun, loaded] = usePipelineRunV2(namespace, pipelineRunName);

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (!pipelineRun) {
    return (
      <EmptyState>
        <EmptyStateBody>PipelineRun not found.</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <EmptyState>
      <EmptyStateBody>No events available for this PipelineRun.</EmptyStateBody>
    </EmptyState>
  );
};

export default PipelineRunEventsTab;
