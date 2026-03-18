import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bullseye, Button, Spinner } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { APPLICATION_LIST_PATH } from '@routes/paths';
import { RouterParams } from '../../../routes/utils';
import { NamespaceKind } from '../../../types';
import ErrorEmptyState from '../../components/empty-state/ErrorEmptyState';
import { createNamespaceQueryOptions, getLastUsedNamespace, setLastUsedNamespace } from './utils';

export type NamespaceContextData = {
  namespace: string;
  namespaceResource: NamespaceKind | undefined;
  namespacesLoaded: boolean;
  lastUsedNamespace: string;
  namespaces: NamespaceKind[];
};

export const NamespaceContext = React.createContext<NamespaceContextData>({
  namespace: '',
  namespaceResource: undefined,
  namespacesLoaded: false,
  namespaces: [],
  lastUsedNamespace: getLastUsedNamespace(),
});

const MOCK_NAMESPACE: NamespaceKind = {
  apiVersion: 'v1',
  kind: 'Namespace',
  metadata: {
    name: 'mock-namespace',
    uid: 'mock-uid-1234',
    creationTimestamp: new Date().toISOString(),
  },
  spec: {},
  status: { phase: 'Active' },
} as NamespaceKind;

export const NamespaceProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const useMockData = process.env.NODE_ENV === 'development';

  const { data: namespaces, isLoading: namespaceLoading } = useQuery({
    ...createNamespaceQueryOptions(),
    enabled: !useMockData,
    ...(useMockData ? { initialData: [MOCK_NAMESPACE] } : {}),
  });
  const params = useParams<RouterParams>();
  const navigate = useNavigate();

  const activeNamespaceName: string = params.workspaceName ?? (useMockData ? 'mock-namespace' : getLastUsedNamespace());

  const homeNamespace = React.useMemo(
    () =>
      !namespaceLoading ? namespaces.find((n) => n.metadata.name === activeNamespaceName) : null,
    [namespaces, namespaceLoading, activeNamespaceName],
  );

  const {
    data: namespaceResource,
    isLoading: activeNamespaceLoading,
    error,
  } = useQuery({
    ...createNamespaceQueryOptions(activeNamespaceName),
    retry: false,
    enabled: !activeNamespaceName && !useMockData,
    ...(useMockData ? { initialData: MOCK_NAMESPACE } : {}),
  });

  React.useEffect(() => {
    if (!error && getLastUsedNamespace() !== activeNamespaceName) {
      setLastUsedNamespace(activeNamespaceName);
    }
  }, [activeNamespaceName, error]);

  if (error) {
    return (
      <ErrorEmptyState
        title={`Unable to access namespace ${activeNamespaceName ?? ''}`}
        body={error.message}
      >
        {homeNamespace ? (
          <Button
            variant="primary"
            onClick={() => {
              setLastUsedNamespace(homeNamespace.metadata.name);
              navigate(
                APPLICATION_LIST_PATH.createPath({ workspaceName: homeNamespace.metadata.name }),
              );
            }}
          >
            Go to {homeNamespace.metadata.name} namespace
          </Button>
        ) : null}
      </ErrorEmptyState>
    );
  }

  return (
    <NamespaceContext.Provider
      value={{
        namespace: activeNamespaceName,
        namespaceResource,
        namespaces,
        namespacesLoaded: useMockData || !(namespaceLoading && activeNamespaceLoading),
        lastUsedNamespace: getLastUsedNamespace(),
      }}
    >
      {useMockData || !(namespaceLoading || activeNamespaceLoading) ? (
        children
      ) : (
        <Bullseye>
          <Spinner />
        </Bullseye>
      )}
    </NamespaceContext.Provider>
  );
};
