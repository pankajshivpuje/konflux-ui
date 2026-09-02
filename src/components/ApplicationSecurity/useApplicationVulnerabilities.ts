import * as React from 'react';
import { PipelineRunLabel } from '~/consts/pipelinerun';
import { useComponents } from '~/hooks/useComponents';
import { useTaskRunsV2 } from '~/hooks/useTaskRunsV2';
import { useNamespace } from '~/shared/providers/Namespace';
import type { TaskRunKind } from '~/types';
import { TektonResourceLabel } from '~/types/coreTekton';
import { isTaskV1Beta1 } from '~/utils/pipeline-utils';
import {
  CVE_SCAN_REPORT,
  getScanStatus,
  hasVulnerabilityReport,
  parseVulnerabilityReport,
  ScanStatus,
  VulnerabilitySeverity,
} from '~/utils/scan/scan-utils';
import { AppVulnerabilityRow } from '~/components/Vulnerabilities/vulnerabilities-table-config';

/** Multiplier for per-component TaskRun headroom in the bounded batch (arch variants, retries). */
const BATCH_LIMIT_PER_COMPONENT = 3;
/** Minimum batch size so the first fetch stays bounded before components finish loading. */
const BATCH_LIMIT_FLOOR = 10;

export type ComponentScanStatus = {
  componentName: string;
  status: ScanStatus;
  pipelineRunName?: string;
};

const emptyCounts = (): Record<VulnerabilitySeverity, number> => ({
  critical: 0,
  important: 0,
  moderate: 0,
  low: 0,
  unknown: 0,
});

export type ApplicationVulnerabilities = {
  rows: AppVulnerabilityRow[];
  counts: Record<VulnerabilitySeverity, number>;
  componentStatuses: ComponentScanStatus[];
  totalComponents: number;
  totalScanned: number;
  loaded: boolean;
  settling: boolean;
  error?: unknown;
};

const pickNewest = (a: TaskRunKind | undefined, b: TaskRunKind): TaskRunKind => {
  if (!a) return b;
  const at = a.metadata?.creationTimestamp ?? '';
  const bt = b.metadata?.creationTimestamp ?? '';
  if (at !== bt) return bt > at ? b : a;
  return (b.metadata?.name ?? '') > (a.metadata?.name ?? '') ? b : a;
};

const readImages = (tr: TaskRunKind) => {
  const results = isTaskV1Beta1(tr) ? tr?.status?.taskResults : tr?.status?.results;
  const raw = results?.find((r) => r?.name === CVE_SCAN_REPORT)?.value;
  return parseVulnerabilityReport(raw).images;
};

export const useApplicationVulnerabilities = (
  applicationName: string,
): ApplicationVulnerabilities => {
  const namespace = useNamespace();
  const [appComponents, componentsLoaded, componentsError] = useComponents(
    namespace,
    applicationName,
  );

  const batchLimit = React.useMemo(
    () =>
      Math.max(
        (componentsLoaded ? appComponents.length : 0) * BATCH_LIMIT_PER_COMPONENT,
        BATCH_LIMIT_FLOOR,
      ),
    [appComponents.length, componentsLoaded],
  );

  const selector = React.useMemo(
    () =>
      namespace?.length
        ? { matchLabels: { [PipelineRunLabel.APPLICATION]: applicationName } }
        : null,
    [namespace, applicationName],
  );

  const [taskRuns, taskRunsLoaded, taskRunsError] = useTaskRunsV2(
    namespace,
    selector ? { selector, limit: batchLimit } : undefined,
    { staleTime: Infinity },
  );

  return React.useMemo((): ApplicationVulnerabilities => {
    const loaded = Boolean(namespace?.length && componentsLoaded && taskRunsLoaded);
    const error = componentsError ?? taskRunsError;

    // latest scan TaskRun per component
    const latestByComponent = new Map<string, TaskRunKind>();
    for (const tr of taskRuns ?? []) {
      if (!hasVulnerabilityReport(tr)) continue;
      const comp = tr.metadata?.labels?.[PipelineRunLabel.COMPONENT];
      if (!comp) continue;
      latestByComponent.set(comp, pickNewest(latestByComponent.get(comp), tr));
    }

    const counts = emptyCounts();
    const seen = new Set<string>();
    const rows: AppVulnerabilityRow[] = [];

    for (const [comp, tr] of latestByComponent.entries()) {
      const plrName = tr.metadata?.labels?.[TektonResourceLabel.pipelinerun] ?? '';
      const trName = tr.metadata?.name ?? '';
      for (const image of readImages(tr)) {
        for (const v of image.vulnerabilities) {
          const key = `${comp}|${image.digest}|${v.packageName}|${v.packageVersion}|${v.cveId}`;
          if (seen.has(key)) continue;
          seen.add(key);
          counts[v.severity] += 1;
          rows.push({
            ...v,
            imageDigest: image.digest,
            imagePullSpec: image.pullSpec,
            platform: image.platform,
            pipelineRunName: plrName,
            taskRunName: trName,
            buildComponentName: comp,
          });
        }
      }
    }

    const componentStatuses: ComponentScanStatus[] = (appComponents ?? []).map((c) => {
      const name = c.metadata?.name ?? '';
      const tr = latestByComponent.get(name);
      return {
        componentName: name,
        status: getScanStatus(tr),
        pipelineRunName: tr?.metadata?.labels?.[TektonResourceLabel.pipelinerun],
      };
    });

    const totalComponents = componentStatuses.length;
    const totalScanned = componentStatuses.filter((c) => c.status === 'complete').length;

    return {
      rows,
      counts,
      componentStatuses,
      totalComponents,
      totalScanned,
      loaded,
      settling: false,
      error,
    };
  }, [
    namespace,
    componentsLoaded,
    taskRunsLoaded,
    componentsError,
    taskRunsError,
    taskRuns,
    appComponents,
  ]);
};
