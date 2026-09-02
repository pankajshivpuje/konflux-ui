import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Alert, AlertVariant, Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import { RouterParams } from '@routes/utils';
import { FilterContextProvider } from '~/components/Filter/generic/FilterContext';
import { AppVulnerabilityRow } from '~/components/Vulnerabilities/vulnerabilities-table-config';
import { useVulnerabilityReport } from '~/components/Vulnerabilities/useVulnerabilityReport';
import { VulnerabilitiesTable } from '~/components/Vulnerabilities/VulnerabilitiesTable';
import { useTaskRunV2 } from '~/hooks/useTaskRunsV2';
import { useNamespace } from '~/shared/providers/Namespace';
import { getErrorState } from '~/shared/utils/error-utils';
import { TektonResourceLabel } from '~/types';

const TaskRunVulnerabilitiesTabContent: React.FC = () => {
  const { taskRunName } = useParams<RouterParams>();
  const namespace = useNamespace();
  const [taskRun, loaded, error] = useTaskRunV2(namespace, taskRunName);
  const { images, status } = useVulnerabilityReport(taskRun);

  const rows = React.useMemo<AppVulnerabilityRow[]>(() => {
    const plrName = taskRun?.metadata?.labels?.[TektonResourceLabel.pipelinerun] ?? '';
    return images.flatMap((image) =>
      image.vulnerabilities.map((v) => ({
        ...v,
        imageDigest: image.digest,
        imagePullSpec: image.pullSpec,
        platform: image.platform,
        pipelineRunName: plrName,
        taskRunName: taskRunName ?? '',
      })),
    );
  }, [images, taskRun, taskRunName]);

  const multiImage = images.length > 1;

  if (error) {
    return getErrorState(error, loaded, 'vulnerabilities');
  }
  if (!loaded || status === 'running') {
    return (
      <PageSection>
        <Bullseye>
          <Spinner size="xl" aria-label="Loading vulnerabilities" />
        </Bullseye>
      </PageSection>
    );
  }
  if (status === 'failed') {
    return (
      <PageSection>
        <Alert
          variant={AlertVariant.danger}
          isInline
          title="Scan failed"
          data-test="vuln-scan-failed"
        >
          The image scan did not complete, so vulnerabilities cannot be shown for this task run.
        </Alert>
      </PageSection>
    );
  }

  return (
    <PageSection isFilled>
      <VulnerabilitiesTable
        rows={rows}
        loaded={loaded}
        showImage={multiImage}
        ariaLabel="Task run vulnerabilities"
      />
    </PageSection>
  );
};

const TaskRunVulnerabilitiesTab: React.FC = () => (
  <FilterContextProvider filterParams={['cveId', 'severity', 'package', 'status', 'image']}>
    <TaskRunVulnerabilitiesTabContent />
  </FilterContextProvider>
);

export default TaskRunVulnerabilitiesTab;
