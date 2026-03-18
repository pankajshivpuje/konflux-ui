import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  EmptyStateBody,
  Label,
  PageSection,
  PageSectionVariants,
  Timestamp,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import emptyStateImgUrl from '../../assets/Components.svg';
import PageLayout from '~/components/PageLayout/PageLayout';
import AppEmptyState from '~/shared/components/empty-state/AppEmptyState';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { useNamespace } from '~/shared/providers/Namespace';
import { GITOPS_REGISTER_PATH } from '~/routes/paths';
import { ButtonWithAccessTooltip } from '../ButtonWithAccessTooltip';
import './GitOpsRegistration.scss';

export interface GitOpsRepo {
  name: string;
  repoUrl: string;
  namespace: string;
  status: 'Synced' | 'OutOfSync' | 'Pending' | 'Error';
  lastSynced?: string;
  registeredAt: string;
}

const statusLabelColor = (status: GitOpsRepo['status']) => {
  switch (status) {
    case 'Synced':
      return 'green';
    case 'OutOfSync':
      return 'orange';
    case 'Pending':
      return 'blue';
    case 'Error':
      return 'red';
    default:
      return 'grey';
  }
};

export const GitOpsRegistrationPage: React.FC = () => {
  useDocumentTitle('GitOps Registration | Konflux');
  const namespace = useNamespace();

  // Placeholder: In a real implementation, this would fetch from the GitOps Registration Service API
  const [repos] = React.useState<GitOpsRepo[]>([]);

  return (
    <PageLayout
      title="GitOps Registration"
      description="Register and manage GitOps repositories as tenant configuration sources."
    >
      <PageSection
        padding={{ default: 'noPadding' }}
        variant={PageSectionVariants.light}
        isFilled
      >
        {!repos || repos.length === 0 ? (
          <AppEmptyState
            className="pf-v5-u-mx-lg"
            isXl
            emptyStateImg={emptyStateImgUrl}
            title="Register your GitOps repository"
          >
            <EmptyStateBody>
              Use Git as the single source of truth for your tenant configuration.
              <br />
              Register a repository containing your applications, components, integration tests,
              release plans, and RBAC configuration as declarative YAML.
            </EmptyStateBody>
            <ButtonWithAccessTooltip
              variant="primary"
              component={(props) => (
                <Link
                  {...props}
                  to={
                    namespace
                      ? GITOPS_REGISTER_PATH.createPath({ workspaceName: namespace })
                      : '#'
                  }
                />
              )}
              isDisabled={!namespace}
              tooltip="You don't have access to register a repository"
              analytics={{
                link_name: 'register-gitops-repo',
                namespace,
              }}
            >
              Register a repository
            </ButtonWithAccessTooltip>
          </AppEmptyState>
        ) : (
          <div className="gitops-registration__list">
            <Table aria-label="GitOps repositories" variant="compact">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Repository URL</Th>
                  <Th>Namespace</Th>
                  <Th>Sync Status</Th>
                  <Th>Last Synced</Th>
                  <Th>Registered</Th>
                </Tr>
              </Thead>
              <Tbody>
                {repos.map((repo) => (
                  <Tr key={repo.name}>
                    <Td dataLabel="Name">{repo.name}</Td>
                    <Td dataLabel="Repository URL">
                      <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer">
                        {repo.repoUrl}
                      </a>
                    </Td>
                    <Td dataLabel="Namespace">{repo.namespace}</Td>
                    <Td dataLabel="Sync Status">
                      <Label color={statusLabelColor(repo.status)}>{repo.status}</Label>
                    </Td>
                    <Td dataLabel="Last Synced">
                      {repo.lastSynced ? <Timestamp date={new Date(repo.lastSynced)} /> : '—'}
                    </Td>
                    <Td dataLabel="Registered">
                      <Timestamp date={new Date(repo.registeredAt)} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        )}
      </PageSection>
    </PageLayout>
  );
};
