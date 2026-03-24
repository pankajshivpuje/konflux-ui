import * as React from 'react';
import { Checkbox, Skeleton } from '@patternfly/react-core';
import { useRoleMap } from '../../hooks/useRole';
import { RowFunctionArgs, TableData } from '../../shared';
import ActionMenu from '../../shared/components/action-menu/ActionMenu';
import { RoleBinding } from '../../types';
import { rbTableColumnClasses } from './RBListHeader';
import { useRBActions } from './user-access-actions';
import { RBSelectionCustomData } from './useRBSelection';

export const RBListRow: React.FC<
  React.PropsWithChildren<RowFunctionArgs<RoleBinding, RBSelectionCustomData>>
> = ({ obj, customData }) => {
  const actions = useRBActions(obj);
  const [roleMap, loaded] = useRoleMap();
  const hasUserSubject = obj.subjects?.some((s) => s.kind === 'User');

  return (
    <>
      <TableData className={rbTableColumnClasses.checkbox}>
        {customData && hasUserSubject ? (
          <Checkbox
            id={`select-rb-${obj.metadata.name}`}
            isChecked={customData.isSelected(obj.metadata.name)}
            onChange={() => customData.toggleSelection(obj.metadata.name)}
            aria-label={`Select ${obj.subjects?.[0]?.name ?? obj.metadata.name}`}
          />
        ) : null}
      </TableData>
      <TableData className={rbTableColumnClasses.username}>
        {obj.subjects ? obj.subjects[0]?.name : '-'}
      </TableData>
      <TableData className={rbTableColumnClasses.role}>
        {!loaded ? <Skeleton width="200px" height="20px" /> : roleMap?.roleMap[obj.roleRef.name]}
      </TableData>
      <TableData className={rbTableColumnClasses.rolebinding}>{obj.metadata.name}</TableData>
      <TableData className={rbTableColumnClasses.kebab}>
        <ActionMenu actions={actions} />
      </TableData>
    </>
  );
};
