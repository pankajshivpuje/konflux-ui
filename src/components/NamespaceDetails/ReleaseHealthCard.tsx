import * as React from 'react';
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
  Label,
  Skeleton,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { runStatus } from '~/consts/pipelinerun';
import { useReleases } from '~/hooks/useReleases';
import { getReleaseStatus } from '~/hooks/useReleaseStatus';
import { ReleaseKind } from '~/types';
import { getMockReleasesForNamespace, useMockData } from './mock-dashboard-data';

type ReleaseHealthCardProps = {
  namespace: string;
};

const STATUS_LABEL_COLORS: Record<string, 'green' | 'red' | 'blue' | 'gold' | 'grey'> = {
  [runStatus.Succeeded]: 'green',
  [runStatus.Failed]: 'red',
  [runStatus['In Progress']]: 'blue',
  [runStatus.Running]: 'blue',
  [runStatus.Pending]: 'grey',
  [runStatus.Unknown]: 'grey',
};

const formatTimeAgo = (timestamp: string): string => {
  const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
  if (diff < 60) return '< 1m ago';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const ReleaseHealthCard: React.FC<ReleaseHealthCardProps> = ({ namespace }) => {
  const isMock = useMockData();
  const [hookData, hookLoaded] = useReleases(namespace);

  const releases: ReleaseKind[] = React.useMemo(() => {
    if (isMock) return getMockReleasesForNamespace(namespace);
    return hookData ?? [];
  }, [isMock, hookData, namespace]);

  const loaded = isMock || hookLoaded;

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    releases.forEach((release) => {
      const status = getReleaseStatus(release);
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [releases]);

  const total = releases.length;
  const succeeded = statusCounts[runStatus.Succeeded] || 0;
  const failed = statusCounts[runStatus.Failed] || 0;
  const inProgress = statusCounts[runStatus['In Progress']] || 0;
  const failureRate = total > 0 ? ((failed / total) * 100).toFixed(1) : '0';

  const lastSucceeded = React.useMemo(() => {
    const succeededReleases = releases.filter(
      (r) => getReleaseStatus(r) === runStatus.Succeeded,
    );
    if (succeededReleases.length === 0) return null;
    succeededReleases.sort(
      (a, b) =>
        new Date(b.metadata.creationTimestamp).getTime() -
        new Date(a.metadata.creationTimestamp).getTime(),
    );
    return succeededReleases[0];
  }, [releases]);

  return (
    <Card data-test="release-health-card">
      <CardTitle>Release Health</CardTitle>
      <CardBody>
        {!loaded ? (
          <Skeleton height="150px" />
        ) : total === 0 ? (
          <TextContent>
            <Text component="small">No releases found.</Text>
          </TextContent>
        ) : (
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
            <FlexItem>
              <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                <FlexItem>
                  <Label color={STATUS_LABEL_COLORS[runStatus.Succeeded]} isCompact>
                    {succeeded} Released
                  </Label>
                </FlexItem>
                {inProgress > 0 && (
                  <FlexItem>
                    <Label color={STATUS_LABEL_COLORS[runStatus['In Progress']]} isCompact>
                      {inProgress} In Progress
                    </Label>
                  </FlexItem>
                )}
                {failed > 0 && (
                  <FlexItem>
                    <Label color={STATUS_LABEL_COLORS[runStatus.Failed]} isCompact>
                      {failed} Failed
                    </Label>
                  </FlexItem>
                )}
              </Flex>
            </FlexItem>
            <FlexItem>
              <DescriptionList isHorizontal isCompact>
                <DescriptionListGroup>
                  <DescriptionListTerm>Failure rate</DescriptionListTerm>
                  <DescriptionListDescription>{failureRate}%</DescriptionListDescription>
                </DescriptionListGroup>
                {lastSucceeded && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Last release</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatTimeAgo(lastSucceeded.metadata.creationTimestamp)}
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

export default ReleaseHealthCard;
