import * as React from 'react';
import { Card, CardBody, CardTitle, Label, Truncate } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { StatusIcon } from '~/components/StatusIcon/StatusIcon';
import { runStatus } from '~/consts/pipelinerun';
import { PipelineRunKind } from '~/types';
import { pipelineRunStatus, getLabelColorFromStatus } from '~/utils/pipeline-utils';

type RecentActivityCardProps = {
  buildPLRs: PipelineRunKind[];
  testPLRs: PipelineRunKind[];
  loaded: boolean;
};

const formatTimeAgo = (timestamp: string): string => {
  const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
  if (diff < 60) return '< 1m ago';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const formatDuration = (startTime?: string, completionTime?: string): string => {
  if (!startTime || !completionTime) return '-';
  const seconds = (new Date(completionTime).getTime() - new Date(startTime).getTime()) / 1000;
  if (seconds <= 0) return '< 1s';
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  if (min === 0) return `${sec}s`;
  return `${min}m ${sec}s`;
};

const getFailureReason = (plr: PipelineRunKind): string | null => {
  const status = pipelineRunStatus(plr);
  if (status !== runStatus.Failed && status !== runStatus.FailedToStart) return null;
  const cond = plr.status?.conditions?.find((c) => c.type === 'Succeeded');
  const msg = cond?.message || cond?.reason;
  if (!msg) return null;
  return msg.length > 60 ? `${msg.substring(0, 57)}...` : msg;
};

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ buildPLRs, testPLRs, loaded }) => {
  const recentPLRs = React.useMemo(() => {
    const all = [...buildPLRs, ...testPLRs];
    all.sort(
      (a, b) =>
        new Date(b.metadata.creationTimestamp).getTime() -
        new Date(a.metadata.creationTimestamp).getTime(),
    );
    return all.slice(0, 10);
  }, [buildPLRs, testPLRs]);

  return (
    <Card data-test="recent-activity-card">
      <CardTitle>Recent Activity</CardTitle>
      <CardBody>
        {!loaded ? (
          <div style={{ height: 200 }} />
        ) : recentPLRs.length === 0 ? (
          <p>No recent pipeline runs.</p>
        ) : (
          <Table aria-label="Recent pipeline runs" variant="compact">
            <Thead>
              <Tr>
                <Th>Status</Th>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Application</Th>
                <Th>Time</Th>
                <Th>Duration</Th>
                <Th>Reason</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentPLRs.map((plr) => {
                const status = pipelineRunStatus(plr);
                const plrType =
                  plr.metadata.labels?.['pipelines.appstudio.openshift.io/type'] || '-';
                const app =
                  plr.metadata.labels?.['appstudio.openshift.io/application'] || '-';
                const failureReason = getFailureReason(plr);
                const labelColor = getLabelColorFromStatus(status);

                return (
                  <Tr key={plr.metadata.uid} data-test={`activity-row-${plr.metadata.name}`}>
                    <Td>
                      <StatusIcon status={status} />
                    </Td>
                    <Td>
                      <Truncate content={plr.metadata.name} />
                    </Td>
                    <Td>
                      <Label color={plrType === 'build' ? 'blue' : 'purple'} isCompact>
                        {plrType}
                      </Label>
                    </Td>
                    <Td>{app}</Td>
                    <Td>{formatTimeAgo(plr.metadata.creationTimestamp)}</Td>
                    <Td>
                      {formatDuration(plr.status?.startTime, plr.status?.completionTime)}
                    </Td>
                    <Td>
                      {failureReason ? (
                        <Label color={labelColor} isCompact>
                          {failureReason}
                        </Label>
                      ) : (
                        '-'
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentActivityCard;
