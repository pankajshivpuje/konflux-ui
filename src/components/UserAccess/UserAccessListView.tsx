import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Bullseye,
  Button,
  Divider,
  EmptyStateActions,
  EmptyStateBody,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  ToolbarItem,
} from '@patternfly/react-core';
import { USER_ACCESS_GRANT_PAGE } from '@routes/paths';
import { getErrorState } from '~/shared/utils/error-utils';
import { FilterIcon } from '@patternfly/react-icons/dist/esm/icons';
import emptyStateImgUrl from '../../assets/Integration-test.svg';
import { useRoleBindings } from '../../hooks/useRoleBindings';
import { RoleBindingModel } from '../../models';
import { Table, useDeepCompareMemoize } from '../../shared';
import AppEmptyState from '../../shared/components/empty-state/AppEmptyState';
import FilteredEmptyState from '../../shared/components/empty-state/FilteredEmptyState';
import { useNamespace } from '../../shared/providers/Namespace';
import { RoleBinding } from '../../types';
import { useAccessReviewForModel } from '../../utils/rbac';
import { ButtonWithAccessTooltip } from '../ButtonWithAccessTooltip';
import { FilterContext } from '../Filter/generic/FilterContext';
import { BaseTextFilterToolbar } from '../Filter/toolbars/BaseTextFIlterToolbar';
import { createRawModalLauncher } from '../modal/createModalLauncher';
import { useModalLauncher } from '../modal/ModalProvider';
import { BulkChangeRoleModal } from './BulkChangeRoleModal';
import { isGroupedRoleBinding } from './group-utils';
import { createRBListHeader } from './RBListHeader';
import { RBListRow } from './RBListRow';
import { useRBSelection } from './useRBSelection';

const UserAccessEmptyState: React.FC<
  React.PropsWithChildren<{
    canCreateRB: boolean;
  }>
> = ({ canCreateRB }) => {
  const namespace = useNamespace();

  return (
    <AppEmptyState
      data-test="user-access__empty"
      emptyStateImg={emptyStateImgUrl}
      title="Grant user access"
    >
      <EmptyStateBody>
        See a list of all the users that have access to your namespace.
      </EmptyStateBody>
      <EmptyStateActions>
        <ButtonWithAccessTooltip
          variant="primary"
          component={(props) => (
            <Link {...props} to={USER_ACCESS_GRANT_PAGE.createPath({ workspaceName: namespace })} />
          )}
          isDisabled={!canCreateRB}
          tooltip="You cannot grant access in this namespace"
          analytics={{
            link_name: 'grant-access',
            namespace,
          }}
        >
          Grant access
        </ButtonWithAccessTooltip>
      </EmptyStateActions>
    </AppEmptyState>
  );
};

const bulkChangeRoleModalLauncher = (rbs: RoleBinding[]) =>
  createRawModalLauncher(BulkChangeRoleModal, {
    'data-test': 'bulk-change-role-modal',
    title: 'Change role',
  })({ rbs });

export const UserAccessListView: React.FC<React.PropsWithChildren<unknown>> = () => {
  const namespace = useNamespace();
  const showModal = useModalLauncher();
  const [canCreateRB] = useAccessReviewForModel(RoleBindingModel, 'create');
  const [canUpdateRB] = useAccessReviewForModel(RoleBindingModel, 'update');
  const { filters: unparsedFilters, setFilters, onClearFilters } = React.useContext(FilterContext);
  const filters = useDeepCompareMemoize({
    username: unparsedFilters.username ? (unparsedFilters.username as string) : '',
    rolebinding: unparsedFilters.rolebinding ? (unparsedFilters.rolebinding as string) : '',
  });
  const { username: usernameFilter, rolebinding: rolebindingFilter } = filters;
  const [allRoleBindings, loaded, error] = useRoleBindings(namespace);
  const roleBindings = React.useMemo(
    () => allRoleBindings.filter((rb) => !isGroupedRoleBinding(rb)),
    [allRoleBindings],
  );
  const [isFilterTypeOpen, setIsFilterTypeOpen] = React.useState(false);
  const filterTypes = ['username', 'role binding'] as const;
  type FilterType = (typeof filterTypes)[number];
  const [activeFilterType, setActiveFilterType] = React.useState<FilterType>('username');

  const activeTextFilter = activeFilterType === 'username' ? usernameFilter : rolebindingFilter;

  const filterRBs = React.useMemo(
    () =>
      roleBindings.filter((rb) => {
        const matchesUsername =
          !usernameFilter ||
          (!rb.subjects && !usernameFilter) ||
          rb.subjects?.some((subject) =>
            subject.name.toLowerCase().includes(usernameFilter.toLowerCase()),
          );
        const matchesRolebinding =
          !rolebindingFilter ||
          rb.metadata.name.toLowerCase().includes(rolebindingFilter.toLowerCase());
        return matchesUsername && matchesRolebinding;
      }),
    [roleBindings, usernameFilter, rolebindingFilter],
  );

  const hasActiveFilters = !!usernameFilter || !!rolebindingFilter;

  const {
    selectedCount,
    selectedRoleBindings,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  } = useRBSelection(filterRBs);

  const selectionData = React.useMemo(
    () => ({ isSelected, toggleSelection, selectAll, clearSelection, isAllSelected, isSomeSelected }),
    [isSelected, toggleSelection, selectAll, clearSelection, isAllSelected, isSomeSelected],
  );

  const Header = React.useMemo(() => createRBListHeader(selectionData), [selectionData]);

  const handleBulkChangeRole = React.useCallback(() => {
    showModal(bulkChangeRoleModalLauncher(selectedRoleBindings)).closed.then((result) => {
      if ((result as { submitClicked?: boolean })?.submitClicked) {
        clearSelection();
      }
    });
  }, [showModal, selectedRoleBindings, clearSelection]);

  if (error) {
    return getErrorState(error, loaded, 'role bindings');
  }

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (!filterRBs.length && !hasActiveFilters) {
    return <UserAccessEmptyState canCreateRB={canCreateRB} />;
  }

  return (
    <>
      <BaseTextFilterToolbar
        text={activeTextFilter}
        label={activeFilterType}
        setText={(value) =>
          setFilters(activeFilterType === 'username' ? { username: value } : { rolebinding: value })
        }
        onClearFilters={onClearFilters}
        dataTest="user-access-list-toolbar"
        showSearchInput={false}
      >
        <InputGroup>
          <InputGroupItem>
            <Select
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  icon={<FilterIcon />}
                  isExpanded={isFilterTypeOpen}
                  onClick={() => setIsFilterTypeOpen(!isFilterTypeOpen)}
                  data-test="filter-type-toggle"
                >
                  {activeFilterType === 'username' ? 'Username' : 'Role Binding'}
                </MenuToggle>
              )}
              onSelect={(_e, val) => {
                setActiveFilterType(val as FilterType);
                setIsFilterTypeOpen(false);
              }}
              selected={activeFilterType}
              isOpen={isFilterTypeOpen}
              onOpenChange={setIsFilterTypeOpen}
            >
              <SelectList>
                {filterTypes.map((ft) => (
                  <SelectOption key={ft} value={ft}>
                    {ft === 'username' ? 'Username' : 'Role Binding'}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </InputGroupItem>
          <InputGroupItem isFill>
            <SearchInput
              data-test={`${activeFilterType}-input-filter`}
              aria-label={`${activeFilterType} filter`}
              placeholder={`Filter by ${activeFilterType}...`}
              onChange={(_e, value) =>
                setFilters(
                  activeFilterType === 'username'
                    ? { username: value }
                    : { rolebinding: value },
                )
              }
              onClear={() =>
                setFilters(
                  activeFilterType === 'username'
                    ? { username: '' }
                    : { rolebinding: '' },
                )
              }
              value={activeTextFilter}
            />
          </InputGroupItem>
        </InputGroup>
        {selectedCount > 0 && (
          <ToolbarItem>
            <span style={{ marginRight: 'var(--pf-v5-global--spacer--sm)' }}>
              {selectedCount} selected
            </span>
            <Button
              variant="primary"
              isDisabled={!canUpdateRB}
              onClick={handleBulkChangeRole}
              data-test="bulk-change-role-btn"
            >
              Change role
            </Button>
          </ToolbarItem>
        )}
        <ButtonWithAccessTooltip
          variant="primary"
          component={(props) => (
            <Link {...props} to={USER_ACCESS_GRANT_PAGE.createPath({ workspaceName: namespace })} />
          )}
          isDisabled={!canCreateRB}
          tooltip="You cannot grant access in this namespace"
          analytics={{
            link_name: 'grant-access',
            namespace,
          }}
        >
          Grant access
        </ButtonWithAccessTooltip>
      </BaseTextFilterToolbar>
      <Divider style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }} />
      {filterRBs.length ? (
        <Table
          data={filterRBs}
          aria-label="User access list"
          Header={Header}
          Row={RBListRow}
          loaded
          customData={selectionData}
          getRowProps={(obj: RoleBinding) => ({
            id: obj.metadata.name,
          })}
        />
      ) : (
        <FilteredEmptyState onClearFilters={() => onClearFilters()} />
      )}
    </>
  );
};
