import React from 'react';
import { EmptyStateBody } from '@patternfly/react-core';
import emptyStateImgUrl from '../../assets/Commit.svg';
import AppEmptyState from '../../shared/components/empty-state/AppEmptyState';

type CommitsEmptyStateProps = {
  applicationName: string;
};

const CommitsEmptyState: React.FC<React.PropsWithChildren<CommitsEmptyStateProps>> = () => {
  return (
    <AppEmptyState
      emptyStateImg={emptyStateImgUrl}
      title="Monitor your CI/CD activity in one place"
    >
      <EmptyStateBody>
        Monitor any activity that happens once you push a commit. We&apos;ll build and test your
        source code, for both pull requests and merged code.
        <br />
        Components are managed via your GitOps repository. Once components are onboarded, commits
        will appear here.
      </EmptyStateBody>
    </AppEmptyState>
  );
};

export default CommitsEmptyState;
