import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Bullseye,
  Divider,
  EmptyStateActions,
  EmptyStateBody,
  Spinner,
} from '@patternfly/react-core';
import { GROUP_CREATE_PAGE } from '@routes/paths';
import { getErrorState } from '~/shared/utils/error-utils';
import emptyStateImgUrl from '../../assets/Integration-test.svg';
import { useRoleBindings } from '../../hooks/useRoleBindings';
import { RoleBindingModel } from '../../models';
import { Table, useDeepCompareMemoize } from '../../shared';
import AppEmptyState from '../../shared/components/empty-state/AppEmptyState';
import FilteredEmptyState from '../../shared/components/empty-state/FilteredEmptyState';
import { useNamespace } from '../../shared/providers/Namespace';
import { useAccessReviewForModel } from '../../utils/rbac';
import { ButtonWithAccessTooltip } from '../ButtonWithAccessTooltip';
import { FilterContext } from '../Filter/generic/FilterContext';
import { BaseTextFilterToolbar } from '../Filter/toolbars/BaseTextFIlterToolbar';
import { aggregateGroups, isGroupedRoleBinding, KonfluxGroup } from './group-utils';
import { groupListHeader } from './GroupListHeader';
import { GroupListRow } from './GroupListRow';

const GroupEmptyState: React.FC<
  React.PropsWithChildren<{ canCreateRB: boolean }>
> = ({ canCreateRB }) => {
  const namespace = useNamespace();

  return (
    <AppEmptyState
      data-test="group-access__empty"
      emptyStateImg={emptyStateImgUrl}
      title="Create a group"
    >
      <EmptyStateBody>
        Create groups to manage access for multiple users at once.
      </EmptyStateBody>
      <EmptyStateActions>
        <ButtonWithAccessTooltip
          variant="primary"
          component={(props) => (
            <Link {...props} to={GROUP_CREATE_PAGE.createPath({ workspaceName: namespace })} />
          )}
          isDisabled={!canCreateRB}
          tooltip="You cannot create groups in this namespace"
          analytics={{
            link_name: 'create-group',
            namespace,
          }}
        >
          Create group
        </ButtonWithAccessTooltip>
      </EmptyStateActions>
    </AppEmptyState>
  );
};

export const GroupListView: React.FC<React.PropsWithChildren<unknown>> = () => {
  const namespace = useNamespace();
  const [canCreateRB] = useAccessReviewForModel(RoleBindingModel, 'create');
  const { filters: unparsedFilters, setFilters, onClearFilters } = React.useContext(FilterContext);
  const filters = useDeepCompareMemoize({
    groupname: unparsedFilters.groupname ? (unparsedFilters.groupname as string) : '',
  });
  const { groupname: groupNameFilter } = filters;
  const [allRoleBindings, loaded, error] = useRoleBindings(namespace);

  const groups = React.useMemo(() => {
    const groupedRBs = allRoleBindings.filter(isGroupedRoleBinding);
    return aggregateGroups(groupedRBs);
  }, [allRoleBindings]);

  const filteredGroups = React.useMemo(
    () =>
      groups.filter(
        (g) =>
          !groupNameFilter ||
          g.name.toLowerCase().includes(groupNameFilter.toLowerCase()),
      ),
    [groups, groupNameFilter],
  );

  const hasActiveFilters = !!groupNameFilter;

  if (error) {
    return getErrorState(error, loaded, 'groups');
  }

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (!groups.length && !hasActiveFilters) {
    return <GroupEmptyState canCreateRB={canCreateRB} />;
  }

  return (
    <>
      <BaseTextFilterToolbar
        text={groupNameFilter}
        label="group name"
        setText={(value) => setFilters({ groupname: value })}
        onClearFilters={onClearFilters}
        dataTest="group-list-toolbar"
      >
        <ButtonWithAccessTooltip
          variant="primary"
          component={(props) => (
            <Link {...props} to={GROUP_CREATE_PAGE.createPath({ workspaceName: namespace })} />
          )}
          isDisabled={!canCreateRB}
          tooltip="You cannot create groups in this namespace"
          analytics={{
            link_name: 'create-group',
            namespace,
          }}
        >
          Create group
        </ButtonWithAccessTooltip>
      </BaseTextFilterToolbar>
      <Divider style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }} />
      {filteredGroups.length ? (
        <Table
          data={filteredGroups}
          aria-label="Group list"
          Header={groupListHeader}
          Row={GroupListRow}
          loaded
          getRowProps={(obj: KonfluxGroup) => ({
            id: obj.name,
          })}
        />
      ) : (
        <FilteredEmptyState onClearFilters={() => onClearFilters()} />
      )}
    </>
  );
};
