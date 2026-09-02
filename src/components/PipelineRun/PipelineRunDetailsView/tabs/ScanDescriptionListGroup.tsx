import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  ButtonVariant,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Popover,
} from '@patternfly/react-core';
import { TASKRUN_LOGS_PATH, TASKRUN_VULNERABILITIES_PATH } from '@routes/paths';
import { useIsOnFeatureFlag } from '~/feature-flags/hooks';
import { useNamespace } from '~/shared/providers/Namespace';
import { getTaskRunDetailsPath } from '~/utils/pipeline-run-routes';
import { PipelineRunLabel } from '../../../../consts/pipelinerun';
import { getScanResults } from '../../../../hooks/useScanResults';
import { PipelineRunKind, TaskRunKind, TektonResourceLabel } from '../../../../types';
import { ScanDetailStatus } from '../../ScanDetailStatus';

import './ScanDescriptionListGroup.scss';

type Props = {
  taskRuns: TaskRunKind[];
  pipelineRun?: PipelineRunKind;
  showLogsLink?: boolean;
  /**
   * When set (PipelineRun details view only), the scan link points at the
   * TaskRun's Vulnerabilities tab and reads "View vulnerabilities" — but only
   * while the `security-vulnerabilities` feature flag is on. With the flag off
   * it falls back to the existing "View logs" behavior.
   */
  showVulnerabilitiesLink?: boolean;
  hideIfNotFound?: boolean;
  popoverAppendTo?: boolean;
  errorState?: React.ReactNode | null;
};

const ScanDescriptionListGroup: React.FC<React.PropsWithChildren<Props>> = ({
  taskRuns,
  pipelineRun,
  hideIfNotFound,
  showLogsLink,
  showVulnerabilitiesLink,
  popoverAppendTo = true,
  errorState,
}) => {
  const namespace = useNamespace();
  const isVulnFlagOn = useIsOnFeatureFlag('security-vulnerabilities');
  const [scanResults, scanTaskRuns] = taskRuns ? getScanResults(taskRuns) : [null, []];

  if (!scanTaskRuns?.length && hideIfNotFound) {
    return null;
  }

  const linkToVulns = showVulnerabilitiesLink && isVulnFlagOn;
  const linkLabel = linkToVulns ? 'View vulnerabilities' : 'View logs';
  const scanLinkPath = (applicationName: string, taskRunName: string) =>
    linkToVulns
      ? TASKRUN_VULNERABILITIES_PATH.createPath({
          workspaceName: namespace,
          applicationName,
          taskRunName,
        })
      : TASKRUN_LOGS_PATH.createPath({
          workspaceName: namespace,
          applicationName,
          taskRunName,
        });

  const renderLogsLink = () => {
    if (!showLogsLink) {
      return null;
    }
    const logTasks = scanTaskRuns.filter((task) =>
      getTaskRunDetailsPath(task, namespace, pipelineRun),
    );
    if (!logTasks.length) return null;
    if (logTasks.length === 1) {
      return (
        <Link
          to={scanLinkPath(
            logTasks[0].metadata.labels?.[PipelineRunLabel.APPLICATION] ?? '',
            logTasks[0].metadata.name,
          )}
          className="pf-v6-u-font-weight-normal"
        >
          {linkLabel}
        </Link>
      );
    }

    return (
      <Popover
        appendTo={
          popoverAppendTo ? () => document.querySelector('#hacDev-modal-container') : undefined
        }
        className="scan-description-list__popover"
        data-test="scan-description-list-popover-test-id"
        bodyContent={
          <div className="scan-description-list__tooltip">
            <div className="scan-description-list__tooltip-title">{linkLabel}</div>
            <div className="scan-description-list__tooltip-description">
              {linkToVulns
                ? 'View vulnerabilities for each task run individually'
                : 'View logs for each task run individually'}
            </div>
            {logTasks.map((scanTaskRun) => (
              <div
                key={scanTaskRun.metadata.uid ?? scanTaskRun.metadata.name}
                className="scan-description-list__tooltip-task"
              >
                {scanTaskRun.metadata?.labels?.[TektonResourceLabel.pipelineTask] ||
                  scanTaskRun.metadata.name}
                <Link
                  to={scanLinkPath(
                    scanTaskRun.metadata.labels?.[PipelineRunLabel.APPLICATION] ?? '',
                    scanTaskRun.metadata.name,
                  )}
                  className="pf-v6-u-font-weight-normal scan-description-list__tooltip-link"
                >
                  <span
                    data-test={`${
                      scanTaskRun.metadata?.labels?.[TektonResourceLabel.pipelineTask] ||
                      scanTaskRun.metadata.name
                    }-link-test-id`}
                  >
                    {linkLabel}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        }
      >
        <Button
          variant={ButtonVariant.link}
          className="pf-v6-u-px-0"
          data-test="view-logs-popover-trigger-test-id"
        >
          {linkLabel}
        </Button>
      </Popover>
    );
  };

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Fixable vulnerabilities scan</DescriptionListTerm>
      <DescriptionListDescription>
        {errorState ? (
          errorState
        ) : (
          <>
            {scanResults?.vulnerabilities ? <ScanDetailStatus scanResults={scanResults} /> : '-'}
            {scanResults?.vulnerabilities ? renderLogsLink() : null}
          </>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default ScanDescriptionListGroup;
