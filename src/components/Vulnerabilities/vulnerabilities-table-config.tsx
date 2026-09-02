import * as React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { t_global_color_status_success_100 as greenColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_100';
import {
  CriticalIcon,
  HighIcon,
  LowIcon,
  MediumIcon,
  UnknownIcon,
} from '~/components/PipelineRun/ScanDetailStatus';
import { TASKRUN_DETAILS_PATH } from '~/routes/paths';
import { ExternalLink } from '~/shared';
import { defineFilters } from '~/shared/components/Filter';
import { ColumnDefinition } from '~/shared/components/TableV2';
import { VulnerabilityEntry, VulnerabilitySeverity } from '~/utils/scan/scan-utils';
import { textMatch } from '~/utils/text-filter-utils';

export const VULNERABILITIES_LIST_COLUMN_STATE_KEY = 'vulnerabilities-list';

/** A CVE row flattened out of a single image's report. */
export type FlatVulnerability = VulnerabilityEntry & {
  imageDigest: string;
  imagePullSpec?: string;
  platform?: string;
};

/** A CVE row on the application Security page, carrying its full source. */
export type AppVulnerabilityRow = FlatVulnerability & {
  pipelineRunName: string;
  taskRunName: string;
  buildComponentName?: string;
};

export const SEVERITY_META: Record<
  VulnerabilitySeverity,
  { label: string; order: number; Icon: React.FC }
> = {
  critical: { label: 'Critical', order: 0, Icon: CriticalIcon },
  important: { label: 'Important', order: 1, Icon: HighIcon },
  moderate: { label: 'Moderate', order: 2, Icon: MediumIcon },
  low: { label: 'Low', order: 3, Icon: LowIcon },
  unknown: { label: 'Unknown', order: 4, Icon: UnknownIcon },
};

export const STATUS_VALUES = {
  WITH_FIX: 'with-fix',
  WITHOUT_FIX: 'without-fix',
} as const;

export const cveUrl = (cveId: string) => `https://access.redhat.com/security/cve/${cveId}`;

const imageLabel = (row: AppVulnerabilityRow): string =>
  row.platform ?? row.imagePullSpec ?? row.imageDigest;

/**
 * Filter configs for the shared table. `showImage` / `showPipelineRun` add the
 * image and pipeline-run multiselects (app page only). Callers pass
 * `AppVulnerabilityRow`; taskrun-tab rows omit the app-only fields, which the
 * pipeline-run filter simply never matches when hidden.
 */
export const buildFilterConfigs = (showImage: boolean, showPipelineRun: boolean) =>
  defineFilters<AppVulnerabilityRow>()([
    {
      type: 'search',
      param: 'cveId',
      label: 'CVE ID',
      placeholder: 'Search by CVE ID',
      filterFn: (item, value) => textMatch(item.cveId, value),
    },
    {
      type: 'multiSelect',
      param: 'package',
      label: 'Package',
      filterFn: (item, selected) => selected.includes(item.packageName),
    },
    {
      type: 'multiSelect',
      param: 'status',
      label: 'Status',
      filterFn: (item, selected) =>
        selected.includes(item.fixedInVersion ? STATUS_VALUES.WITH_FIX : STATUS_VALUES.WITHOUT_FIX),
    },
    {
      type: 'multiSelect',
      param: 'severity',
      label: 'Severity',
      filterFn: (item, selected) => selected.includes(item.severity),
    },
    ...(showImage
      ? [
          {
            type: 'multiSelect' as const,
            param: 'image',
            label: 'Image',
            filterFn: (item: AppVulnerabilityRow, selected: string[]) =>
              selected.includes(imageLabel(item)),
          },
        ]
      : []),
    ...(showPipelineRun
      ? [
          {
            type: 'multiSelect' as const,
            param: 'pipelinerun',
            label: 'Pipeline run',
            filterFn: (item: AppVulnerabilityRow, selected: string[]) =>
              selected.includes(item.pipelineRunName),
          },
        ]
      : []),
  ]);

export const statusFilterOptions = [
  { label: 'With fixes', value: STATUS_VALUES.WITH_FIX },
  { label: 'Without fixes', value: STATUS_VALUES.WITHOUT_FIX },
];

export const severityFilterOptions = (
  Object.keys(SEVERITY_META) as VulnerabilitySeverity[]
).map((value) => ({ label: SEVERITY_META[value].label, value }));

/** Base columns shared by both surfaces. Image column is added when showImage. */
export const getBaseColumns = (showImage: boolean): ColumnDefinition<AppVulnerabilityRow>[] => [
  {
    id: 'cveId',
    header: 'CVE ID',
    accessorFn: (row) => row.cveId,
    size: 2,
    sortable: true,
    nonHidable: true,
    cell: (info) => {
      const cveId = info.getValue() as string;
      return <ExternalLink href={cveUrl(cveId)} text={cveId} dataTestID={`cve-link-${cveId}`} />;
    },
  },
  {
    id: 'severity',
    header: 'Severity',
    accessorFn: (row) => row.severity,
    size: 2,
    sortable: true,
    sortFn: (a, b) =>
      SEVERITY_META[a.original.severity].order - SEVERITY_META[b.original.severity].order,
    cell: (info) => {
      const severity = info.getValue() as VulnerabilitySeverity;
      const { label, Icon } = SEVERITY_META[severity];
      return (
        <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
          <Icon />
          <span className="pf-v6-u-ml-sm">{label}</span>
        </span>
      );
    },
  },
  {
    id: 'package',
    header: 'Package',
    accessorFn: (row) => row.packageName,
    size: 3,
    sortable: true,
  },
  {
    id: 'packageVersion',
    header: 'Package version',
    accessorFn: (row) => row.packageVersion,
    size: 2,
  },
  {
    id: 'fixedInVersion',
    header: 'Fixed in version',
    accessorFn: (row) => row.fixedInVersion ?? '',
    size: 2,
    cell: (info) => {
      const fixedIn = info.getValue() as string;
      if (!fixedIn) {
        return <span className="pf-v6-u-color-200">No fix available</span>;
      }
      return (
        <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
          <CheckCircleIcon color={greenColor.value} />
          <span className="pf-v6-u-ml-sm">{fixedIn}</span>
        </span>
      );
    },
  },
  ...(showImage
    ? [
        {
          id: 'image',
          header: 'Image',
          accessorFn: (row: AppVulnerabilityRow) => imageLabel(row),
          size: 2,
          sortable: true,
        } as ColumnDefinition<AppVulnerabilityRow>,
      ]
    : []),
];

/** Source column for the app Security page: build component + PLR, linking to the TaskRun tab. */
export const getSourceColumn = (
  namespace: string,
  applicationName: string,
): ColumnDefinition<AppVulnerabilityRow> => ({
  id: 'source',
  header: 'Source',
  accessorFn: (row) => row.buildComponentName ?? row.pipelineRunName,
  size: 3,
  cell: (info) => {
    const row = info.row.original;
    return (
      <Link
        to={`${TASKRUN_DETAILS_PATH.createPath({
          workspaceName: namespace,
          applicationName,
          taskRunName: row.taskRunName,
        })}/vulnerabilities`}
        data-test={`vuln-source-${row.taskRunName}`}
      >
        {row.buildComponentName ?? row.pipelineRunName}
      </Link>
    );
  },
});
