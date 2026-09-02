import * as React from 'react';
import { Flex, FlexItem, Content, ContentVariants } from '@patternfly/react-core';
import { SEVERITY_META } from '~/components/Vulnerabilities/vulnerabilities-table-config';
import { VulnerabilitySeverity } from '~/utils/scan/scan-utils';

type SecuritySummaryBarProps = {
  counts: Record<VulnerabilitySeverity, number>;
  totalComponents: number;
  totalScanned: number;
};

const ORDER: VulnerabilitySeverity[] = ['critical', 'important', 'moderate', 'low', 'unknown'];

export const SecuritySummaryBar: React.FC<SecuritySummaryBarProps> = ({
  counts,
  totalComponents,
  totalScanned,
}) => (
  <Flex data-test="security-summary-bar" spaceItems={{ default: 'spaceItemsLg' }}>
    {ORDER.map((severity) => {
      const { label, Icon } = SEVERITY_META[severity];
      return (
        <FlexItem key={severity} data-test={`security-summary-${severity}`}>
          <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
            <Icon />
            <span className="pf-v6-u-ml-sm">
              {counts[severity]} {label}
            </span>
          </span>
        </FlexItem>
      );
    })}
    <FlexItem data-test="security-summary-scanned">
      <Content component={ContentVariants.small}>
        {totalScanned} of {totalComponents} components scanned
      </Content>
    </FlexItem>
  </Flex>
);
