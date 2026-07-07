import * as React from 'react';
import { ChartDonut } from '@patternfly/react-charts';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Skeleton,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { PipelineRunLabel, PipelineRunType, runStatus } from '~/consts/pipelinerun';
import { useK8sWatchResource } from '~/k8s';
import { PipelineRunGroupVersionKind, PipelineRunModel } from '~/models';
import { PipelineRunKind } from '~/types';
import { pipelineRunStatus } from '~/utils/pipeline-utils';
import {
  getMockBuildPLRsForNamespace,
  getMockTestPLRsForNamespace,
  useMockData,
} from './mock-dashboard-data';

type PipelineHealthCardProps = {
  namespace: string;
  pipelineType: PipelineRunType.BUILD | PipelineRunType.TEST;
  onPLRsLoaded?: (plrs: PipelineRunKind[]) => void;
};

const STATUS_COLORS: Record<string, string> = {
  [runStatus.Succeeded]: 'var(--pf-t--chart--color--green--100)',
  [runStatus.Failed]: 'var(--pf-t--chart--color--red--100)',
  [runStatus.Running]: 'var(--pf-t--chart--color--blue--100)',
  [runStatus['In Progress']]: 'var(--pf-t--chart--color--blue--100)',
  [runStatus.Pending]: 'var(--pf-t--chart--color--black--100)',
  [runStatus.Cancelled]: 'var(--pf-t--chart--color--gold--100)',
};

const getStatusCounts = (plrs: PipelineRunKind[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  plrs.forEach((plr) => {
    const status = pipelineRunStatus(plr);
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
};

const getDurationSeconds = (plr: PipelineRunKind): number | null => {
  const start = plr.status?.startTime;
  const end = plr.status?.completionTime;
  if (!start || !end) return null;
  return (new Date(end).getTime() - new Date(start).getTime()) / 1000;
};

const formatDuration = (seconds: number): string => {
  if (seconds <= 0) return '< 1s';
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  if (min === 0) return `${sec}s`;
  return `${min}m ${sec}s`;
};

const formatTimeAgo = (timestamp: string): string => {
  const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
  if (diff < 60) return '< 1m ago';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const PipelineHealthCard: React.FC<PipelineHealthCardProps> = ({
  namespace,
  pipelineType,
  onPLRsLoaded,
}) => {
  const isMock = useMockData();

  const { data, isLoading } = useK8sWatchResource<PipelineRunKind[]>(
    {
      groupVersionKind: PipelineRunGroupVersionKind,
      namespace,
      isList: true,
      selector: {
        matchLabels: {
          [PipelineRunLabel.PIPELINE_TYPE]: pipelineType,
        },
      },
      limit: 50,
    },
    PipelineRunModel,
  );

  const plrs = React.useMemo(() => {
    if (isMock) {
      const getter =
        pipelineType === PipelineRunType.BUILD
          ? getMockBuildPLRsForNamespace
          : getMockTestPLRsForNamespace;
      return getter(namespace);
    }
    return data ?? [];
  }, [isMock, data, namespace, pipelineType]);

  const loaded = isMock || !isLoading;

  const onPLRsLoadedRef = React.useRef(onPLRsLoaded);
  onPLRsLoadedRef.current = onPLRsLoaded;

  React.useEffect(() => {
    if (loaded) {
      onPLRsLoadedRef.current?.(plrs);
    }
  }, [loaded, plrs]);

  const title =
    pipelineType === PipelineRunType.BUILD ? 'Build Health' : 'Integration Test Health';
  const statusCounts = React.useMemo(() => getStatusCounts(plrs), [plrs]);
  const total = plrs.length;

  const succeeded = statusCounts[runStatus.Succeeded] || 0;
  const failed =
    (statusCounts[runStatus.Failed] || 0) + (statusCounts[runStatus.FailedToStart] || 0);
  const running =
    (statusCounts[runStatus.Running] || 0) + (statusCounts[runStatus['In Progress']] || 0);
  const failureRate =
    succeeded + failed > 0 ? ((failed / (succeeded + failed)) * 100).toFixed(1) : '0';

  const avgDuration = React.useMemo(() => {
    const durations = plrs.map(getDurationSeconds).filter((d): d is number => d !== null);
    if (durations.length === 0) return null;
    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }, [plrs]);

  const lastFailure = React.useMemo(() => {
    const failedPLRs = plrs.filter((plr) => {
      const s = pipelineRunStatus(plr);
      return s === runStatus.Failed || s === runStatus.FailedToStart;
    });
    if (failedPLRs.length === 0) return null;
    failedPLRs.sort(
      (a, b) =>
        new Date(b.metadata.creationTimestamp).getTime() -
        new Date(a.metadata.creationTimestamp).getTime(),
    );
    return failedPLRs[0].metadata.creationTimestamp;
  }, [plrs]);

  const donutData = React.useMemo(() => {
    const entries: { x: string; y: number }[] = [];
    const colorScale: string[] = [];
    Object.entries(statusCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .forEach(([status, count]) => {
        entries.push({ x: `${status}: ${count}`, y: count });
        colorScale.push(STATUS_COLORS[status] || 'var(--pf-t--chart--color--black--100)');
      });
    return { entries, colorScale };
  }, [statusCounts]);

  return (
    <Card data-test={`${pipelineType}-health-card`}>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        {!loaded ? (
          <Skeleton height="200px" />
        ) : total === 0 ? (
          <TextContent>
            <Text component="small">No pipeline runs found.</Text>
          </TextContent>
        ) : (
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
            <FlexItem>
              <Flex
                justifyContent={{ default: 'justifyContentCenter' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                <FlexItem>
                  <div style={{ width: 200, height: 200 }}>
                    <ChartDonut
                      data={donutData.entries}
                      colorScale={donutData.colorScale}
                      title={`${total}`}
                      subTitle="Total"
                      constrainToVisibleArea
                      labels={({ datum }) => `${datum.x}`}
                      padding={{ bottom: 0, left: 0, right: 0, top: 0 }}
                      width={200}
                      height={200}
                    />
                  </div>
                </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <DescriptionList isHorizontal isCompact>
                <DescriptionListGroup>
                  <DescriptionListTerm>Succeeded</DescriptionListTerm>
                  <DescriptionListDescription>{succeeded}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Failed</DescriptionListTerm>
                  <DescriptionListDescription>{failed}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Running</DescriptionListTerm>
                  <DescriptionListDescription>{running}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Failure rate</DescriptionListTerm>
                  <DescriptionListDescription>{failureRate}%</DescriptionListDescription>
                </DescriptionListGroup>
                {avgDuration !== null && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Avg duration</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatDuration(avgDuration)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {lastFailure && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Last failure</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatTimeAgo(lastFailure)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </FlexItem>
          </Flex>
        )}
      </CardBody>
    </Card>
  );
};

export default PipelineHealthCard;
