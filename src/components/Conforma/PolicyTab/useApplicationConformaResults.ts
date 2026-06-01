import * as React from 'react';
import { PipelineRunLabel, PipelineRunType } from '~/consts/pipelinerun';
import { CONFORMA_TASK, EC_TASK } from '~/consts/security';
import { usePipelineRunsV2 } from '~/hooks/usePipelineRunsV2';
import { PipelineRunKind } from '~/types';
import { CONFORMA_RESULT_STATUS, UIConformaData } from '~/types/conforma';
import { isResourceEnterpriseContract } from '~/utils/conforma-utils';
import { isTaskRunInPipelineRun } from '~/utils/pipeline-utils';
import { useConformaResultFromLogs, mapConformaResultData } from '../useConformaResult';
import { mockPolicyResults } from './__data__/mockPolicyData';

const USE_MOCK_DATA = true;

export type PolicySummary = {
  violations: number;
  warnings: number;
  successes: number;
  ecpWarnings: number;
  componentStatuses: Record<string, { violations: number; warnings: number; successes: number }>;
};

const computeSummary = (data: UIConformaData[]): PolicySummary => {
  const componentStatuses: PolicySummary['componentStatuses'] = {};
  let violations = 0;
  let warnings = 0;
  let successes = 0;
  let ecpWarnings = 0;

  for (const item of data) {
    if (!componentStatuses[item.component]) {
      componentStatuses[item.component] = { violations: 0, warnings: 0, successes: 0 };
    }
    if (item.warningType) {
      ecpWarnings++;
    }
    switch (item.status) {
      case CONFORMA_RESULT_STATUS.violations:
        violations++;
        componentStatuses[item.component].violations++;
        break;
      case CONFORMA_RESULT_STATUS.warnings:
        warnings++;
        componentStatuses[item.component].warnings++;
        break;
      case CONFORMA_RESULT_STATUS.successes:
        successes++;
        componentStatuses[item.component].successes++;
        break;
    }
  }

  return { violations, warnings, successes, ecpWarnings, componentStatuses };
};

const getCompletionTime = (pr: PipelineRunKind): number => {
  const ts = pr.status?.completionTime ?? pr.status?.startTime ?? pr.metadata?.creationTimestamp;
  return ts ? new Date(ts).getTime() : 0;
};

const hasConformaTask = (pr: PipelineRunKind): boolean =>
  isResourceEnterpriseContract(pr) ||
  isTaskRunInPipelineRun(pr, CONFORMA_TASK) ||
  isTaskRunInPipelineRun(pr, EC_TASK);

// eslint-disable-next-line react-hooks/rules-of-hooks -- USE_MOCK_DATA is a build-time constant;
// the branch taken is always the same at runtime, matching the pattern used by usePipelineRunsV2 etc.
export const useApplicationConformaResults = (
  namespace: string,
  applicationName: string,
): [UIConformaData[], PolicySummary, boolean, unknown] => {
  if (USE_MOCK_DATA) {
    const data = mockPolicyResults[applicationName] ?? [];
    return [data, computeSummary(data), true, undefined];
  }

  const [pipelineRuns, prsLoaded, prsError] = usePipelineRunsV2(
    namespace,
    React.useMemo(
      () => ({
        selector: {
          matchLabels: {
            [PipelineRunLabel.APPLICATION]: applicationName,
            [PipelineRunLabel.PIPELINE_TYPE]: PipelineRunType.TEST,
          },
        },
      }),
      [applicationName],
    ),
  );

  const latestConformaPRName = React.useMemo(() => {
    if (!prsLoaded || !pipelineRuns?.length) return '';
    const conformaPRs = pipelineRuns.filter(hasConformaTask);
    if (!conformaPRs.length) return '';

    const byComponent = new Map<string, PipelineRunKind>();
    for (const pr of conformaPRs) {
      const comp = pr.metadata?.labels?.[PipelineRunLabel.COMPONENT] ?? '';
      const existing = byComponent.get(comp);
      if (!existing || getCompletionTime(pr) > getCompletionTime(existing)) {
        byComponent.set(comp, pr);
      }
    }

    const latest = [...byComponent.values()].sort(
      (a, b) => getCompletionTime(b) - getCompletionTime(a),
    );
    return latest[0]?.metadata?.name ?? '';
  }, [pipelineRuns, prsLoaded]);

  const [conformaResults, crLoaded, crError] = useConformaResultFromLogs(latestConformaPRName);

  const data = React.useMemo(() => {
    if (!conformaResults?.length) return [];
    return mapConformaResultData(conformaResults);
  }, [conformaResults]);

  const summary = React.useMemo(() => computeSummary(data), [data]);

  const loaded = prsLoaded && (latestConformaPRName ? crLoaded : true);
  const error = prsError ?? (latestConformaPRName ? crError : undefined);

  return [data, summary, loaded, error];
};
