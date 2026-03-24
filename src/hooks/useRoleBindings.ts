import React from 'react';
import { useK8sWatchResource } from '../k8s';
import { RoleBindingGroupVersionKind, RoleBindingModel } from '../models';
import { RoleBinding } from '../types';
import { USE_MOCK_DATA } from './__mock__/mock-data';
import { useRoleMap } from './useRole';

const MOCK_NAMESPACE = 'mock-namespace';

const mockRoleBindings: RoleBinding[] = [
  {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: 'admin-binding',
      namespace: MOCK_NAMESPACE,
      uid: 'rb-uid-001',
      creationTimestamp: '2025-11-01T10:00:00Z',
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'konflux-admin',
    },
    subjects: [
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'admin-user@example.com' },
    ],
  },
  {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: 'contributor-binding',
      namespace: MOCK_NAMESPACE,
      uid: 'rb-uid-002',
      creationTimestamp: '2025-12-15T14:30:00Z',
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'konflux-contributor',
    },
    subjects: [
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'dev-user@example.com' },
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'dev2-user@example.com' },
    ],
  },
  {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: 'viewer-binding',
      namespace: MOCK_NAMESPACE,
      uid: 'rb-uid-003',
      creationTimestamp: '2026-01-20T09:00:00Z',
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'konflux-viewer',
    },
    subjects: [
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'viewer@example.com' },
    ],
  },
  {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: 'contributor-binding-2',
      namespace: MOCK_NAMESPACE,
      uid: 'rb-uid-004',
      creationTimestamp: '2026-02-10T11:00:00Z',
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'konflux-contributor',
    },
    subjects: [
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'contributor3@example.com' },
    ],
  },
  {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: 'contributor-binding-3',
      namespace: MOCK_NAMESPACE,
      uid: 'rb-uid-005',
      creationTimestamp: '2026-02-15T09:30:00Z',
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'konflux-contributor',
    },
    subjects: [
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'contributor4@example.com' },
    ],
  },
  // Group-labeled RoleBindings (frontend-team)
  {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: 'konflux-contributor-alice-frontend-team-group',
      namespace: MOCK_NAMESPACE,
      uid: 'rb-uid-006',
      creationTimestamp: '2026-03-01T10:00:00Z',
      labels: { 'konflux.dev/group': 'frontend-team' },
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'konflux-contributor',
    },
    subjects: [
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'alice@example.com' },
    ],
  },
  {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: 'konflux-contributor-bob-frontend-team-group',
      namespace: MOCK_NAMESPACE,
      uid: 'rb-uid-007',
      creationTimestamp: '2026-03-01T10:00:00Z',
      labels: { 'konflux.dev/group': 'frontend-team' },
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'konflux-contributor',
    },
    subjects: [
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'bob@example.com' },
    ],
  },
  // Group-labeled RoleBindings (devops-team)
  {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: 'konflux-admin-carol-devops-team-group',
      namespace: MOCK_NAMESPACE,
      uid: 'rb-uid-008',
      creationTimestamp: '2026-03-05T12:00:00Z',
      labels: { 'konflux.dev/group': 'devops-team' },
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'konflux-admin',
    },
    subjects: [
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'carol@example.com' },
    ],
  },
  {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: 'konflux-admin-dave-devops-team-group',
      namespace: MOCK_NAMESPACE,
      uid: 'rb-uid-009',
      creationTimestamp: '2026-03-05T12:00:00Z',
      labels: { 'konflux.dev/group': 'devops-team' },
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'konflux-admin',
    },
    subjects: [
      { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: 'dave@example.com' },
    ],
  },
];

const useRoleBindingsLive = (namespace: string): [RoleBinding[], boolean, unknown] => {
  const {
    data: bindings,
    isLoading,
    error,
  } = useK8sWatchResource<RoleBinding[]>(
    {
      groupVersionKind: RoleBindingGroupVersionKind,
      namespace,
      isList: true,
    },
    RoleBindingModel,
  );
  const [roleMap, loaded, roleMapError] = useRoleMap();
  const konfluxRBs: RoleBinding[] = React.useMemo(
    () =>
      !roleMapError && !isLoading && loaded && Array.isArray(bindings) && roleMap?.roleMap
        ? bindings?.filter((rb) => Object.keys(roleMap?.roleMap).includes(rb?.roleRef?.name))
        : [],
    [bindings, isLoading, roleMap, loaded, roleMapError],
  );

  return [konfluxRBs, !isLoading, error || roleMapError];
};

export const useRoleBindings = USE_MOCK_DATA
  ? (_namespace: string): [RoleBinding[], boolean, unknown] => [mockRoleBindings, true, undefined]
  : useRoleBindingsLive;

const useRoleBindingLive = (
  namespace: string,
  name: string,
  watch?: boolean,
): [RoleBinding, boolean, unknown] => {
  const {
    data: binding,
    isLoading,
    error,
  } = useK8sWatchResource<RoleBinding>(
    {
      groupVersionKind: RoleBindingGroupVersionKind,
      namespace,
      name,
      watch,
    },
    RoleBindingModel,
  );
  const [roleMap, loaded, roleMapError] = useRoleMap();
  const konfluxRB: RoleBinding | undefined = React.useMemo(
    () =>
      !roleMapError &&
      !isLoading &&
      loaded &&
      roleMap?.roleMap &&
      Object.keys(roleMap?.roleMap).includes(binding?.roleRef?.name)
        ? binding
        : undefined,
    [binding, isLoading, roleMap, loaded, roleMapError],
  );

  return [konfluxRB, !isLoading, error || roleMapError];
};

export const useRoleBinding = USE_MOCK_DATA
  ? (_namespace: string, name: string, _watch?: boolean): [RoleBinding, boolean, unknown] => {
      const rb = mockRoleBindings.find((r) => r.metadata.name === name);
      return [rb, true, rb ? undefined : { code: 404 }];
    }
  : useRoleBindingLive;
