import * as React from 'react';
import {
  Card,
  CardBody,
  Flex,
  FlexItem,
  Icon,
  Content,
  ContentVariants,
  Title,
} from '@patternfly/react-core';
import { BellIcon } from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { CubesIcon } from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { UIConformaData } from '~/types/conforma';
import { PolicySummary } from './useApplicationConformaResults';

type PolicySummaryHeaderProps = {
  summary: PolicySummary;
  data: UIConformaData[];
};

type StatItemProps = {
  icon: React.ReactNode;
  count: number;
  label: string;
  testId: string;
};

const StatItem: React.FC<StatItemProps> = ({ icon, count, label, testId }) => (
  <FlexItem data-test={testId}>
    <Flex
      gap={{ default: 'gapSm' }}
      alignItems={{ default: 'alignItemsCenter' }}
    >
      {icon}
      <FlexItem>
        <Content component={ContentVariants.h3} style={{ margin: 0 }}>
          {count}
        </Content>
      </FlexItem>
      <FlexItem>
        <Content component={ContentVariants.small}>{label}</Content>
      </FlexItem>
    </Flex>
  </FlexItem>
);

const Divider: React.FC = () => (
  <FlexItem>
    <div
      style={{
        width: 1,
        height: 32,
        backgroundColor: 'var(--pf-v6-global--BorderColor--100)',
      }}
    />
  </FlexItem>
);

export const PolicySummaryHeader: React.FC<PolicySummaryHeaderProps> = ({ summary }) => {
  const totalComponents = Object.keys(summary.componentStatuses).length;
  const failedComponents = Object.values(summary.componentStatuses).filter(
    (s) => s.violations > 0,
  ).length;

  return (
    <Flex
      direction={{ default: 'column' }}
      gap={{ default: 'gapMd' }}
      style={{ marginTop: 'var(--pf-v6-global--spacer--lg)' }}
    >
      <FlexItem>
        <Title headingLevel="h2">Conforma results summary</Title>
      </FlexItem>
      <FlexItem>
        <Content>
          <Content component={ContentVariants.p}>
            Conforma is a set of tools for verifying the provenance of application snapshots and
            validating them against a clearly defined policy.
          </Content>
        </Content>
      </FlexItem>
      <FlexItem>
        <Flex gap={{ default: 'gapMd' }}>
          <FlexItem>
            <Card isCompact isFlat data-test="policy-summary-components-card">
              <CardBody>
                <Content component={ContentVariants.p} style={{ marginBottom: 'var(--pf-v6-global--spacer--sm)', fontWeight: 600 }}>
                  Components
                </Content>
                <Flex
                  gap={{ default: 'gapLg' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                >
                  <StatItem
                    icon={
                      <Icon size="md">
                        <CubesIcon color="var(--pf-v6-global--Color--200)" />
                      </Icon>
                    }
                    count={totalComponents}
                    label="Total"
                    testId="policy-stat-total-components"
                  />
                  <Divider />
                  <StatItem
                    icon={
                      <Icon size="md" status="danger">
                        <ExclamationCircleIcon />
                      </Icon>
                    }
                    count={failedComponents}
                    label="Failed"
                    testId="policy-stat-failed-components"
                  />
                </Flex>
              </CardBody>
            </Card>
          </FlexItem>
          {summary.ecpWarnings > 0 && (
            <FlexItem>
              <Card isCompact isFlat data-test="policy-summary-changes-card">
                <CardBody>
                  <Content component={ContentVariants.p} style={{ marginBottom: 'var(--pf-v6-global--spacer--sm)', fontWeight: 600 }}>
                    Upcoming changes
                  </Content>
                  <Flex
                    gap={{ default: 'gapLg' }}
                    alignItems={{ default: 'alignItemsCenter' }}
                  >
                    <StatItem
                      icon={
                        <Icon size="md" status="warning">
                          <BellIcon />
                        </Icon>
                      }
                      count={summary.ecpWarnings}
                      label="Pending"
                      testId="policy-stat-ecp-warnings"
                    />
                  </Flex>
                </CardBody>
              </Card>
            </FlexItem>
          )}
          <FlexItem>
            <Card isCompact isFlat data-test="policy-summary-results-card">
              <CardBody>
                <Content component={ContentVariants.p} style={{ marginBottom: 'var(--pf-v6-global--spacer--sm)', fontWeight: 600 }}>
                  Results summary
                </Content>
                <Flex
                  gap={{ default: 'gapLg' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                >
                  <StatItem
                    icon={
                      <Icon size="md" status="danger">
                        <ExclamationCircleIcon />
                      </Icon>
                    }
                    count={summary.violations}
                    label="Violations"
                    testId="policy-stat-violations"
                  />
                  <Divider />
                  <StatItem
                    icon={
                      <Icon size="md" status="warning">
                        <ExclamationTriangleIcon />
                      </Icon>
                    }
                    count={summary.warnings}
                    label="Warnings"
                    testId="policy-stat-warnings"
                  />
                  <Divider />
                  <StatItem
                    icon={
                      <Icon size="md" status="success">
                        <CheckCircleIcon />
                      </Icon>
                    }
                    count={summary.successes}
                    label="Successes"
                    testId="policy-stat-successes"
                  />
                </Flex>
              </CardBody>
            </Card>
          </FlexItem>
        </Flex>
      </FlexItem>
    </Flex>
  );
};
