import * as React from 'react';
import {
  Bullseye,
  EmptyStateBody,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';
import { getErrorState } from '~/shared/utils/error-utils';
import emptyStateImgUrl from '../../assets/Application.svg';
import { useApplications } from '../../hooks/useApplications';
import { useSortedResources } from '../../hooks/useSortedResources';
import { Table, useDeepCompareMemoize } from '../../shared';
import AppEmptyState from '../../shared/components/empty-state/AppEmptyState';
import FilteredEmptyState from '../../shared/components/empty-state/FilteredEmptyState';
import { useNamespace } from '../../shared/providers/Namespace';
import { ApplicationKind } from '../../types';
import { FilterContext } from '../Filter/generic/FilterContext';
import { BaseTextFilterToolbar } from '../Filter/toolbars/BaseTextFIlterToolbar';
import PageLayout from '../PageLayout/PageLayout';
import getApplicationListHeader, { SortableHeaders } from './ApplicationListHeader';
import ApplicationListRow from './ApplicationListRow';

const sortPaths: Record<SortableHeaders, string> = {
  [SortableHeaders.name]: 'metadata.name',
};

const ApplicationListView: React.FC<React.PropsWithChildren<unknown>> = () => {
  const namespace = useNamespace();
  const { filters: unparsedFilters, setFilters, onClearFilters } = React.useContext(FilterContext);
  const filters = useDeepCompareMemoize({
    name: unparsedFilters.name ? (unparsedFilters.name as string) : '',
  });
  const { name: nameFilter } = filters;

  const [activeSortIndex, setActiveSortIndex] = React.useState<number>(SortableHeaders.name);
  const [activeSortDirection, setActiveSortDirection] = React.useState<SortByDirection>(
    SortByDirection.asc,
  );

  const ApplicationListHeader = React.useMemo(
    () =>
      getApplicationListHeader(activeSortIndex, activeSortDirection, (_, index, direction) => {
        setActiveSortIndex(index);
        setActiveSortDirection(direction);
      }),
    [activeSortDirection, activeSortIndex],
  );

  const [applications, loaded, error] = useApplications(namespace);
  const filteredApplications = React.useMemo(() => {
    const lowerCaseNameFilter = nameFilter.toLowerCase();
    return applications?.filter(
      (app) =>
        app.spec.displayName?.toLowerCase().includes(lowerCaseNameFilter) ??
        app.metadata.name.includes(lowerCaseNameFilter),
    );
  }, [nameFilter, applications]);

  const sortedApplications = useSortedResources(
    filteredApplications,
    activeSortIndex,
    activeSortDirection,
    sortPaths,
  );

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (error) {
    return getErrorState(error, loaded, 'applications');
  }

  return (
    <>
      <PageLayout
        title="Applications"
        description="An application is 1 or more components running together for building and releasing."
      >
        <PageSection
          padding={{ default: 'noPadding' }}
          variant={PageSectionVariants.light}
          isFilled
        >
          {!applications || applications.length === 0 ? (
            <AppEmptyState
              className="pf-v5-u-mx-lg"
              isXl
              emptyStateImg={emptyStateImgUrl}
              title="No applications found"
            >
              <EmptyStateBody>
                Applications are onboarded via GitOps. Configure your applications, components, and
                other resources in your GitOps repository, and they will be automatically
                synchronized to this namespace.
              </EmptyStateBody>
            </AppEmptyState>
          ) : (
            <>
              <BaseTextFilterToolbar
                text={nameFilter}
                label="name"
                setText={(name) => setFilters({ name })}
                onClearFilters={onClearFilters}
                dataTest="application-list-toolbar"
              />
              {sortedApplications.length !== 0 ? (
                <Table
                  data={sortedApplications}
                  aria-label="Application List"
                  Header={ApplicationListHeader}
                  Row={ApplicationListRow}
                  loaded
                  getRowProps={(obj: ApplicationKind) => ({
                    id: obj.metadata?.name,
                  })}
                />
              ) : (
                <FilteredEmptyState onClearFilters={() => onClearFilters()} />
              )}
            </>
          )}
        </PageSection>
      </PageLayout>
    </>
  );
};

export default ApplicationListView;
