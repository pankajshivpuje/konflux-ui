import { runStatus } from '../../consts/pipelinerun';
import { TaskRunKind, TektonResultsRun } from '../../types';
import { isTaskV1Beta1, taskRunStatus } from '../pipeline-utils';

export const SCAN_RESULT = 'CLAIR_SCAN_RESULT';
export const SCAN_RESULTS = 'CLAIR_SCAN_RESULTS';
export const CVE_SCAN_RESULT = 'CVE_SCAN_RESULT';
export const TEKTON_SCAN_RESULTS = 'TEKTON_SCAN_RESULTS';
export const SCAN_OUTPUT = 'SCAN_OUTPUT';

export const CVE_SCAN_RESULT_FIELDS = [
  SCAN_RESULT,
  SCAN_RESULTS,
  CVE_SCAN_RESULT,
  TEKTON_SCAN_RESULTS,
  SCAN_OUTPUT,
];

export const isCVEScanResult = (taskRunResults: TektonResultsRun) =>
  CVE_SCAN_RESULT_FIELDS.includes(taskRunResults?.name);

export type ScanResults = {
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    unknown: number;
  };
};

/**
 * Result field carrying the detailed, per-image CVE scan report (as opposed to
 * the aggregate severity counts in {@link CVE_SCAN_RESULT_FIELDS}). Produced by
 * the Red Hat Advanced Cluster Security (roxctl) image-scan task; the value is a
 * JSON-stringified {@link CVEScanReport}.
 *
 * TODO(real-source): the production roxctl-scan task does NOT emit this list as
 * a Tekton result. The full CVE list is an OCI artifact
 * (media type application/vnd.redhat.rox-report+json, CVE array under
 * `roxctl_new`) reachable via the `REPORTS` result (image digest -> report
 * digest) and the OCI referrers API. When wiring the real source, read `REPORTS`
 * off the scan TaskRun and fetch one report per image digest inside
 * `useVulnerabilityReport`; the shapes below already model that per-image layout,
 * so no consumer changes are needed.
 */
export const CVE_SCAN_REPORT = 'CVE_SCAN_REPORT';

/** Severity levels reported by the ACS/roxctl image scan, mapped to CVSS bands. */
export type VulnerabilitySeverity = 'critical' | 'important' | 'moderate' | 'low' | 'unknown';

/** A single vulnerability (CVE) affecting an OS package inside a scanned image. */
export type VulnerabilityEntry = {
  cveId: string;
  severity: VulnerabilitySeverity;
  packageName: string;
  packageVersion: string;
  /** Version the fix landed in. Absent means no fix is available yet. */
  fixedInVersion?: string;
};

/** One scanned image. A build PipelineRun may produce several (multi-arch / multi-component). */
export type VulnerabilityScanImage = {
  digest: string;
  pullSpec?: string;
  platform?: string;
  vulnerabilities: VulnerabilityEntry[];
};

export type CVEScanReport = {
  images: VulnerabilityScanImage[];
};

/** Derived scan lifecycle state so a missing/failed scan never reads as "clean". */
export type ScanStatus = 'not-scanned' | 'running' | 'failed' | 'complete';

const getResults = (taskRun: TaskRunKind): TektonResultsRun[] | undefined =>
  isTaskV1Beta1(taskRun) ? taskRun?.status?.taskResults : taskRun?.status?.results;

/**
 * Pure, safe parser for a `CVE_SCAN_REPORT` result value. Returns
 * `{ images: [] }` on missing or malformed JSON. Used by the mock path of
 * {@link useVulnerabilityReport}.
 */
export const parseVulnerabilityReport = (rawValue: string | undefined): CVEScanReport => {
  if (!rawValue) {
    return { images: [] };
  }
  try {
    const report = JSON.parse(rawValue) as CVEScanReport;
    return { images: Array.isArray(report?.images) ? report.images : [] };
  } catch {
    return { images: [] };
  }
};

/** True when the TaskRun carries a detailed CVE report (drives the Vulnerabilities tab). */
export const hasVulnerabilityReport = (taskRun: TaskRunKind): boolean =>
  !!getResults(taskRun)?.some((result) => result?.name === CVE_SCAN_REPORT);

/**
 * All TaskRuns that carry a `CVE_SCAN_REPORT` result. Result-based detection
 * survives the clair -> roxctl task rename (do not match on task name).
 */
export const getScanTaskRuns = (taskRuns: TaskRunKind[]): TaskRunKind[] =>
  (taskRuns ?? []).filter(hasVulnerabilityReport);

/** Derive {@link ScanStatus} from run status + presence of the TaskRun. */
export const getScanStatus = (taskRun: TaskRunKind | undefined): ScanStatus => {
  if (!taskRun) {
    return 'not-scanned';
  }
  const status = taskRunStatus(taskRun);
  if (status === runStatus.Running || status === runStatus.Pending) {
    return 'running';
  }
  if (status === runStatus.Failed || status === runStatus.Cancelled) {
    return 'failed';
  }
  return 'complete';
};
