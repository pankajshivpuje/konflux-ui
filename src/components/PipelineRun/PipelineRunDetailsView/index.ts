import { isFeatureFlagOn } from '~/feature-flags/utils';
import { EventModel, PipelineRunModel, TaskRunModel } from '~/models';
import { RouterParams } from '~/routes/utils';
import { QueryPipelineRun, QueryPipelineRunWithKubearchive } from '~/utils/pipelinerun-utils';
import { createLoaderWithAccessCheck } from '~/utils/rbac';

export const pipelineRunDetailsViewLoader = createLoaderWithAccessCheck(
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
    { model: EventModel, verb: 'list' },
  ],
);

export { default as PipelineRunDetailsLayout } from './PipelineRunDetailsView';
export { default as PipelineRunDetailsTab } from './tabs/PipelineRunDetailsTab';
export { default as PipelineRunDetailsLogsTab } from './tabs/PipelineRunLogsTab';
export { default as PipelineRunTaskRunsTab } from './tabs/PipelineRunTaskRunsTab';
export { default as PipelineRunEventsTab } from './tabs/PipelineRunEventsTab';
export { PipelineRunSecurityTab } from './tabs/PipelineRunSecurityTab';
