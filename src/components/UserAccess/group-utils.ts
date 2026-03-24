import { RoleBinding } from '../../types';

export const KONFLUX_GROUP_LABEL = 'konflux.dev/group';

export type KonfluxGroup = {
  name: string;
  role: string;
  members: string[];
  roleBindings: RoleBinding[];
};

export const isGroupedRoleBinding = (rb: RoleBinding): boolean =>
  !!rb.metadata?.labels?.[KONFLUX_GROUP_LABEL];

export const getGroupName = (rb: RoleBinding): string | undefined =>
  rb.metadata?.labels?.[KONFLUX_GROUP_LABEL];

export const aggregateGroups = (roleBindings: RoleBinding[]): KonfluxGroup[] => {
  const groupMap = new Map<string, RoleBinding[]>();
  for (const rb of roleBindings) {
    const groupName = getGroupName(rb);
    if (groupName) {
      const list = groupMap.get(groupName) ?? [];
      list.push(rb);
      groupMap.set(groupName, list);
    }
  }
  return Array.from(groupMap.entries()).map(([name, rbs]) => ({
    name,
    role: rbs[0].roleRef.name,
    members: rbs.flatMap(
      (rb) => rb.subjects?.filter((s) => s.kind === 'User').map((s) => s.name) ?? [],
    ),
    roleBindings: rbs,
  }));
};
