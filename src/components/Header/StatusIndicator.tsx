import * as React from 'react';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Icon,
  Label,
  Popover,
  Timestamp,
  ToolbarItem,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { useKonfluxStatus } from '~/hooks/useKonfluxStatus';
import ExternalLink from '~/shared/components/links/ExternalLink';
import { SystemStatus } from '~/types/konflux-status';

const STATUS_CONFIG: Record<
  SystemStatus,
  {
    icon: React.ComponentType;
    status: 'success' | 'warning' | 'danger';
    label: string;
    labelColor: 'green' | 'gold' | 'red';
  }
> = {
  operational: {
    icon: CheckCircleIcon,
    status: 'success',
    label: 'All systems operational',
    labelColor: 'green',
  },
  degraded: {
    icon: ExclamationTriangleIcon,
    status: 'warning',
    label: 'Degraded performance',
    labelColor: 'gold',
  },
  outage: {
    icon: ExclamationCircleIcon,
    status: 'danger',
    label: 'System outage',
    labelColor: 'red',
  },
};

const ServiceLabel: React.FC<{ status: SystemStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <Label color={config.labelColor} isCompact>
      {status}
    </Label>
  );
};

export const StatusIndicator: React.FC = () => {
  const [konfluxStatus, loaded] = useKonfluxStatus();

  if (!loaded || !konfluxStatus) {
    return null;
  }

  const config = STATUS_CONFIG[konfluxStatus.status];
  const StatusIcon = config.icon;

  const popoverBody = (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
      <FlexItem>
        <DescriptionList isCompact isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>Status</DescriptionListTerm>
            <DescriptionListDescription>
              <Label color={config.labelColor}>{config.label}</Label>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {konfluxStatus.message && (
            <DescriptionListGroup>
              <DescriptionListTerm>Message</DescriptionListTerm>
              <DescriptionListDescription>{konfluxStatus.message}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {konfluxStatus.lastUpdated && (
            <DescriptionListGroup>
              <DescriptionListTerm>Updated</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp date={new Date(konfluxStatus.lastUpdated)} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      </FlexItem>
      {konfluxStatus.services?.length > 0 && (
        <FlexItem>
          <DescriptionList isCompact isHorizontal>
            {konfluxStatus.services.map((service) => (
              <DescriptionListGroup key={service.name}>
                <DescriptionListTerm>{service.name}</DescriptionListTerm>
                <DescriptionListDescription>
                  <ServiceLabel status={service.status} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            ))}
          </DescriptionList>
        </FlexItem>
      )}
      {konfluxStatus.statusPageUrl && (
        <FlexItem>
          <ExternalLink href={konfluxStatus.statusPageUrl} text="View status page" />
        </FlexItem>
      )}
    </Flex>
  );

  return (
    <ToolbarItem>
      <Popover
        headerContent="System Status"
        bodyContent={popoverBody}
        position="bottom"
        data-test="status-indicator-popover"
      >
        <Button
          variant="plain"
          aria-label={`System status: ${konfluxStatus.status}`}
          data-test="status-indicator-button"
        >
          <Icon status={config.status}>
            <StatusIcon />
          </Icon>
        </Button>
      </Popover>
    </ToolbarItem>
  );
};
