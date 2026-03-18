import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  EmptyStateBody,
  Label,
  PageSection,
  PageSectionVariants,
  SearchInput,
  Timestamp,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import emptyStateImgUrl from '../../assets/Components.svg';
import PageLayout from '~/components/PageLayout/PageLayout';
import AppEmptyState from '~/shared/components/empty-state/AppEmptyState';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { useNamespace } from '~/shared/providers/Namespace';
import { GITOPS_EDIT_PATH, GITOPS_REGISTER_PATH } from '~/routes/paths';
import { USE_MOCK_DATA, mockGitOpsRepos } from '~/hooks/__mock__/mock-data';
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
  const navigate = useNavigate();

  // Placeholder: In a real implementation, this would fetch from the GitOps Registration Service API
  const [repos, setRepos] = React.useState<GitOpsRepo[]>(USE_MOCK_DATA ? mockGitOpsRepos : []);
  const [nameFilter, setNameFilter] = React.useState<string>('');

  const filteredRepos = React.useMemo(
    () =>
      nameFilter
        ? repos.filter((r) => r.name.toLowerCase().includes(nameFilter.toLowerCase()))
        : repos,
    [repos, nameFilter],
  );

  const handleDelete = React.useCallback(
    (repoName: string) => {
      // TODO: Call the GitOps Registration Service API to delete
      setRepos((prev) => prev.filter((r) => r.name !== repoName));
    },
    [],
  );

  const getRowActions = React.useCallback(
    (repo: GitOpsRepo): IAction[] => [
      {
        title: 'Edit',
        onClick: () => {
          if (namespace) {
            navigate(
              GITOPS_EDIT_PATH.createPath({
                workspaceName: namespace,
                gitopsRepoName: repo.name,
              }),
            );
          }
        },
      },
      {
        isSeparator: true,
      },
      {
        title: 'Delete',
        onClick: () => {
          // TODO: Add confirmation modal
          handleDelete(repo.name);
        },
        style: { color: 'var(--pf-v5-global--danger-color--100)' },
      },
    ],
    [namespace, navigate, handleDelete],
  );

  const registerButton = (
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
  );

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
            {registerButton}
          </AppEmptyState>
        ) : (
          <div className="gitops-registration__list">
            <Toolbar
              data-test="gitops-list-toolbar"
              usePageInsets
              clearAllFilters={() => setNameFilter('')}
            >
              <ToolbarContent>
                <ToolbarItem className="pf-v5-u-ml-0">
                  <SearchInput
                    name="nameInput"
                    data-test="name-input-filter"
                    type="search"
                    aria-label="name filter"
                    placeholder="Filter by name..."
                    onChange={(_, value) => setNameFilter(value)}
                    value={nameFilter}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  {registerButton}
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Table aria-label="GitOps repositories" variant="compact">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Repository URL</Th>
                  <Th>Namespace</Th>
                  <Th>Sync Status</Th>
                  <Th>Last Synced</Th>
                  <Th>Registered</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {filteredRepos.length === 0 ? (
                  <Tr>
                    <Td colSpan={7}>
                      <div className="pf-v5-u-text-align-center pf-v5-u-py-lg">
                        No repositories match the filter.
                      </div>
                    </Td>
                  </Tr>
                ) : (
                  filteredRepos.map((repo) => (
                    <Tr key={repo.name}>
                      <Td dataLabel="Name">
                        <Link
                          to={
                            namespace
                              ? GITOPS_EDIT_PATH.createPath({
                                  workspaceName: namespace,
                                  gitopsRepoName: repo.name,
                                })
                              : '#'
                          }
                        >
                          {repo.name}
                        </Link>
                      </Td>
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
                      <Td isActionCell>
                        <ActionsColumn items={getRowActions(repo)} />
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>
        )}
      </PageSection>
    </PageLayout>
  );
};
