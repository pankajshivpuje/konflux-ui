import { defer, type LoaderFunctionArgs } from 'react-router-dom';
import { mockIntegrationTestPipelineRuns } from '~/components/IntegrationTests/IntegrationTestDetails/tabs/__data__/mockIntegrationTestPipelineRuns';
import { isFeatureFlagOn } from '~/feature-flags/utils';
import { PipelineRunModel, TaskRunModel } from '~/models';
import { RouterParams } from '~/routes/utils';
import { QueryPipelineRun, QueryPipelineRunWithKubearchive } from '~/utils/pipelinerun-utils';
import { createLoaderWithAccessCheck } from '~/utils/rbac';

const USE_MOCK_DATA = true;

const findMockPipelineRun = (name: string) => {
  for (const runs of Object.values(mockIntegrationTestPipelineRuns)) {
    const found = runs.find((r) => r.metadata?.name === name);
    if (found) return found;
  }
  return undefined;
};

const realLoader = createLoaderWithAccessCheck(
  ({ params }) => {
    const ns = params[RouterParams.workspaceName];
    const pipelineRunName = params[RouterParams.pipelineRunName];

    if (isFeatureFlagOn('pipelineruns-kubearchive')) {
      return QueryPipelineRunWithKubearchive(ns, pipelineRunName);
    }

    return QueryPipelineRun(ns, pipelineRunName);
  },
  [
    { model: PipelineRunModel, verb: 'list' },
    { model: TaskRunModel, verb: 'list' },
  ],
);

export const pipelineRunDetailsViewLoader = (args: LoaderFunctionArgs) => {
  const pipelineRunName = args.params[RouterParams.pipelineRunName];
  if (USE_MOCK_DATA && findMockPipelineRun(pipelineRunName)) {
    return defer({ accessCheck: true, data: Promise.resolve(null) });
  }
  return realLoader(args);
};

export { default as PipelineRunDetailsLayout } from './PipelineRunDetailsView';
export { default as PipelineRunDetailsTab } from './tabs/PipelineRunDetailsTab';
export { default as PipelineRunDetailsLogsTab } from './tabs/PipelineRunLogsTab';
export { default as PipelineRunTaskRunsTab } from './tabs/PipelineRunTaskRunsTab';
export { PipelineRunSecurityTab } from './tabs/PipelineRunSecurityTab';
