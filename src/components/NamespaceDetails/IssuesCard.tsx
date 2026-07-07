import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Label,
  Skeleton,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { useIsOnFeatureFlag } from '~/feature-flags/hooks';
import { useIssueCountsBySeverity } from '~/kite/kite-hooks';
import { useMockData, getMockIssueCountsForNamespace } from './mock-dashboard-data';

export type SeverityCounts = {
  critical: number;
  major: number;
  minor: number;
  info: number;
};

type IssuesCardProps = {
  namespace: string;
};

const IssuesCard: React.FC<IssuesCardProps> = ({ namespace }) => {
  const isMock = useMockData();
  const issuesDashboardEnabled = useIsOnFeatureFlag('issues-dashboard');
  const { counts: hookCounts, isLoaded: hookLoaded } = useIssueCountsBySeverity(namespace);

  const counts: SeverityCounts = React.useMemo(() => {
    if (isMock) return getMockIssueCountsForNamespace(namespace);
    return (hookCounts as SeverityCounts) ?? { critical: 0, major: 0, minor: 0, info: 0 };
  }, [isMock, hookCounts, namespace]);

  const loaded = isMock || hookLoaded;

  if (!issuesDashboardEnabled) return null;

  const totalIssues = counts.critical + counts.major + counts.minor + counts.info;

  return (
    <Card data-test="issues-card">
      <CardTitle>Issues &amp; Security</CardTitle>
      <CardBody>
        {!loaded ? (
          <Skeleton height="150px" />
        ) : totalIssues === 0 ? (
          <TextContent>
            <Text component="small">No issues found.</Text>
          </TextContent>
        ) : (
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
            <FlexItem>
              <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                {counts.critical > 0 && (
                  <FlexItem>
                    <Label color="red" isCompact>
                      {counts.critical} Critical
                    </Label>
                  </FlexItem>
                )}
                {counts.major > 0 && (
                  <FlexItem>
                    <Label color="orange" isCompact>
                      {counts.major} Major
                    </Label>
                  </FlexItem>
                )}
                {counts.minor > 0 && (
                  <FlexItem>
                    <Label color="gold" isCompact>
                      {counts.minor} Minor
                    </Label>
                  </FlexItem>
                )}
                {counts.info > 0 && (
                  <FlexItem>
                    <Label color="blue" isCompact>
                      {counts.info} Info
                    </Label>
                  </FlexItem>
                )}
              </Flex>
            </FlexItem>
          </Flex>
        )}
      </CardBody>
    </Card>
  );
};

export default IssuesCard;
