import * as React from 'react';
import { EmptyStateBody } from '@patternfly/react-core';
import emptyStateImgUrl from '../../assets/Pipeline.svg';
import AppEmptyState from '../../shared/components/empty-state/AppEmptyState';

interface PipelineRunEmptyStateProps {
  applicationName: string;
}

const PipelineRunEmptyState: React.FC<React.PropsWithChildren<PipelineRunEmptyStateProps>> = () => {
  return (
    <AppEmptyState emptyStateImg={emptyStateImgUrl} title="Keep tabs on components and activity">
      <EmptyStateBody>
        Monitor your components with pipelines and oversee CI/CD activity.
        <br />
        Components are managed via your GitOps repository. Once components are onboarded, pipeline
        runs will appear here.
      </EmptyStateBody>
    </AppEmptyState>
  );
};

export default PipelineRunEmptyState;
