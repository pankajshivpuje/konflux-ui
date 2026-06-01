import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Icon,
  Label,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { BellIcon } from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { OutlinedClockIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-clock-icon';
import dayjs from 'dayjs';
import { CONFORMA_RESULT_STATUS, UIConformaData } from '~/types/conforma';

const mockECPWarnings: UIConformaData[] = [
  {
    title: 'CVE results threshold exception',
    description: 'Exception allowing CVE results above the critical threshold.',
    status: CONFORMA_RESULT_STATUS.warnings,
    component: 'api-server',
    msg: 'Exception granted - CVE count exceeds threshold but exception is active',
    solution: 'Fix all CVEs above the critical threshold before the exception expires.',
    collection: ['redhat'],
    effectiveUntil: dayjs().add(15, 'day').toISOString(),
    daysUntilEvent: 15,
    warningType: 'expiring-exception' as const,
  },
  {
    title: 'SLSA v1.0 provenance format required',
    description: 'New SLSA provenance verification requiring v1.0 format.',
    status: CONFORMA_RESULT_STATUS.warnings,
    component: 'worker',
    msg: 'New policy rule - SLSA v1.0 provenance format will be required',
    collection: ['slsa3'],
    daysUntilEvent: 10,
    warningType: 'upcoming-activation' as const,
  },
  {
    title: 'Hermetic build required',
    description: 'Root policy requires all builds to be hermetic.',
    status: CONFORMA_RESULT_STATUS.warnings,
    component: 'api-server',
    msg: 'New root policy rule - hermetic builds will be required',
    collection: ['redhat'],
    daysUntilEvent: 30,
    warningType: 'upcoming-activation' as const,
    policySource: 'root' as const,
  },
];

type WarningItemProps = {
  warning: UIConformaData;
};

const WarningItem: React.FC<WarningItemProps> = ({ warning }) => (
  <Flex
    gap={{ default: 'gapSm' }}
    alignItems={{ default: 'alignItemsCenter' }}
    data-test="ecp-warning-card-item"
  >
    <FlexItem>
      <Icon size="sm" status="warning">
        <ExclamationTriangleIcon />
      </Icon>
    </FlexItem>
    <FlexItem grow={{ default: 'grow' }}>
      <TextContent>
        <Text component={TextVariants.small}>
          <strong>{warning.title}</strong> — {warning.component}
          {warning.policySource === 'root' && (
            <Label isCompact color="purple" className="pf-v5-u-ml-sm">
              Root policy
            </Label>
          )}
        </Text>
      </TextContent>
    </FlexItem>
    <FlexItem>
      <Label isCompact color="orange" data-test="ecp-warning-card-badge">
        <OutlinedClockIcon className="pf-v5-u-mr-xs" />
        {warning.daysUntilEvent}d
      </Label>
    </FlexItem>
  </Flex>
);

export const ECPWarningsCard: React.FC = () => {
  const warnings = mockECPWarnings;

  const expiringCount = React.useMemo(
    () => warnings.filter((w) => w.warningType === 'expiring-exception').length,
    [warnings],
  );
  const activatingCount = React.useMemo(
    () => warnings.filter((w) => w.warningType === 'upcoming-activation').length,
    [warnings],
  );

  if (warnings.length === 0) {
    return null;
  }

  return (
    <Card data-test="ecp-warnings-card">
      <CardTitle>
        <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Icon status="warning">
              <BellIcon />
            </Icon>
          </FlexItem>
          <FlexItem>ECP Policy Warnings</FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
          <FlexItem>
            <Flex gap={{ default: 'gapLg' }}>
              <FlexItem data-test="ecp-expiring-count">
                <Text component={TextVariants.h3} style={{ margin: 0 }}>
                  {expiringCount}
                </Text>
                <Text component={TextVariants.small}>Expiring exceptions</Text>
              </FlexItem>
              <FlexItem data-test="ecp-activating-count">
                <Text component={TextVariants.h3} style={{ margin: 0 }}>
                  {activatingCount}
                </Text>
                <Text component={TextVariants.small}>Upcoming activations</Text>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
              {warnings.map((warning, idx) => (
                <WarningItem key={`${warning.component}-${warning.title}-${idx}`} warning={warning} />
              ))}
            </Flex>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};
