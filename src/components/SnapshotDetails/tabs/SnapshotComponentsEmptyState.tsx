import React from 'react';
import { EmptyStateBody } from '@patternfly/react-core';
import emptyStateImgUrl from '../../../assets/Commit.svg';
import AppEmptyState from '../../../shared/components/empty-state/AppEmptyState';

type SnapshotComponentsEmptyStateProps = {
  applicationName: string;
};

const SnapshotComponentsEmptyState: React.FC<
  React.PropsWithChildren<SnapshotComponentsEmptyStateProps>
> = () => {
  return (
    <AppEmptyState emptyStateImg={emptyStateImgUrl} title="Component builds in this snapshot">
      <EmptyStateBody>
        No components found attached to this snapshot.
        <br />
        Components are managed via your GitOps repository. Once components are onboarded and builds
        are triggered, they will appear here.
      </EmptyStateBody>
    </AppEmptyState>
  );
};

export default SnapshotComponentsEmptyState;
