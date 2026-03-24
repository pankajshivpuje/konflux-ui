import * as React from 'react';
import { Skeleton } from '@patternfly/react-core';
import { useRoleMap } from '../../hooks/useRole';
import { RowFunctionArgs, TableData } from '../../shared';
import ActionMenu from '../../shared/components/action-menu/ActionMenu';
import { KonfluxGroup } from './group-utils';
import { groupTableColumnClasses } from './GroupListHeader';
import { useGroupActions } from './group-actions';

export const GroupListRow: React.FC<
  React.PropsWithChildren<RowFunctionArgs<KonfluxGroup>>
> = ({ obj }) => {
  const actions = useGroupActions(obj);
  const [roleMap, loaded] = useRoleMap();

  return (
    <>
      <TableData className={groupTableColumnClasses.groupName}>
        {obj.name}
      </TableData>
      <TableData className={groupTableColumnClasses.members}>
        {obj.members.length} {obj.members.length === 1 ? 'user' : 'users'}
      </TableData>
      <TableData className={groupTableColumnClasses.role}>
        {!loaded ? <Skeleton width="200px" height="20px" /> : roleMap?.roleMap[obj.role]}
      </TableData>
      <TableData className={groupTableColumnClasses.kebab}>
        <ActionMenu actions={actions} />
      </TableData>
    </>
  );
};
