import * as React from 'react';
import { Bullseye, Content, ContentVariants } from '@patternfly/react-core';
import ColumnManagement from '~/components/ColumnManagement/ColumnManagement';
import FilteredEmptyState from '~/shared/components/empty-state/FilteredEmptyState';
import { FilterToolbar, useFilteredData, useFilterState } from '~/shared/components/Filter';
import { ColumnDefinition, Table, TableContainer } from '~/shared/components/TableV2';
import {
  AppVulnerabilityRow,
  buildFilterConfigs,
  getBaseColumns,
  severityFilterOptions,
  statusFilterOptions,
  VULNERABILITIES_LIST_COLUMN_STATE_KEY,
} from './vulnerabilities-table-config';

export type VulnerabilitiesTableProps = {
  rows: AppVulnerabilityRow[];
  loaded: boolean;
  showImage?: boolean;
  showPipelineRun?: boolean;
  extraColumns?: ColumnDefinition<AppVulnerabilityRow>[];
  columnStateKey?: string;
  ariaLabel?: string;
};

const uniq = (values: (string | undefined)[]): string[] =>
  Array.from(new Set(values.filter((v): v is string => !!v)));

export const VulnerabilitiesTable: React.FC<VulnerabilitiesTableProps> = ({
  rows,
  loaded,
  showImage = false,
  showPipelineRun = false,
  extraColumns = [],
  columnStateKey = VULNERABILITIES_LIST_COLUMN_STATE_KEY,
  ariaLabel = 'Vulnerabilities',
}) => {
  const filterConfigs = React.useMemo(
    () => buildFilterConfigs(showImage, showPipelineRun),
    [showImage, showPipelineRun],
  );

  const { clientFilterValues, isFiltered, clearAll } = useFilterState(filterConfigs);
  const { filteredData } = useFilteredData(filterConfigs, rows, clientFilterValues);

  const columns = React.useMemo(
    () => [...getBaseColumns(showImage), ...extraColumns],
    [showImage, extraColumns],
  );

  const filterOptions = React.useMemo(
    () => ({
      package: uniq(rows.map((r) => r.packageName)).map((v) => ({ label: v, value: v })),
      status: statusFilterOptions,
      severity: severityFilterOptions,
      image: uniq(rows.map((r) => r.platform ?? r.imagePullSpec ?? r.imageDigest)).map((v) => ({
        label: v,
        value: v,
      })),
      pipelinerun: uniq(rows.map((r) => r.pipelineRunName)).map((v) => ({ label: v, value: v })),
    }),
    [rows],
  );

  return (
    <TableContainer
      data={filteredData}
      unfilteredData={rows}
      loaded={loaded}
      emptyState={<FilteredEmptyState onClearFilters={clearAll} />}
      noDataState={
        <Bullseye>
          <Content component={ContentVariants.p}>No vulnerabilities found</Content>
        </Bullseye>
      }
      toolbar={
        isFiltered || rows.length > 0 ? (
          <FilterToolbar configs={filterConfigs} options={filterOptions}>
            <ColumnManagement<AppVulnerabilityRow>
              columns={columns}
              columnStateKey={columnStateKey}
              showColumnManagement
            />
          </FilterToolbar>
        ) : undefined
      }
    >
      <Table
        data={filteredData}
        columns={columns}
        getRowId={(row) =>
          `${row.taskRunName}-${row.imageDigest}-${row.packageName}-${row.packageVersion}-${row.cveId}`
        }
        aria-label={ariaLabel}
        enableSorting
        columnStateKey={columnStateKey}
      />
    </TableContainer>
  );
};

export default VulnerabilitiesTable;
