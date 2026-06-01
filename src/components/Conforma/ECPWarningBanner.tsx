import * as React from 'react';
import {
  Alert,
  ExpandableSection,
  TextContent,
  Text,
  TextVariants,
  Label,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { UIConformaData } from '~/types/conforma';

interface ECPWarningBannerProps {
  warnings: UIConformaData[];
}

const getWarningMessage = (warning: UIConformaData): string => {
  if (warning.warningType === 'expiring-exception') {
    return `Exception expires in ${warning.daysUntilEvent} days — builds will start failing`;
  }
  return `New policy rule activates in ${warning.daysUntilEvent} days — ensure compliance`;
};

export const ECPWarningBanner: React.FC<ECPWarningBannerProps> = ({ warnings }) => {
  const ecpWarnings = React.useMemo(
    () => warnings.filter((w) => w.warningType && w.daysUntilEvent != null),
    [warnings],
  );

  if (ecpWarnings.length === 0) {
    return null;
  }

  return (
    <Alert
      data-test="ecp-warning-banner"
      isInline
      variant="warning"
      title={`${ecpWarnings.length} upcoming policy change${ecpWarnings.length !== 1 ? 's' : ''} require${ecpWarnings.length === 1 ? 's' : ''} attention`}
      className="pf-v5-u-mb-md"
    >
      <ExpandableSection
        toggleText="Show details"
        data-test="ecp-warning-expandable"
      >
        {ecpWarnings.map((warning, idx) => (
          <Flex
            key={`${warning.component}-${warning.title}-${idx}`}
            direction={{ default: 'column' }}
            gap={{ default: 'gapSm' }}
            className="pf-v5-u-mb-sm"
            data-test={`ecp-warning-item-${idx}`}
          >
            <FlexItem>
              <TextContent>
                <Text component={TextVariants.p}>
                  <strong>{warning.title}</strong> — {warning.component}
                  {warning.policySource === 'root' && (
                    <Label isCompact color="purple" className="pf-v5-u-ml-sm" data-test="ecp-inherited-label">
                      Inherited from root policy
                    </Label>
                  )}
                </Text>
                <Text component={TextVariants.small}>
                  {getWarningMessage(warning)}
                </Text>
                {warning.solution && (
                  <Text component={TextVariants.small}>
                    <strong>Remediation:</strong> {warning.solution}
                  </Text>
                )}
              </TextContent>
            </FlexItem>
            <FlexItem>
              <Label color="orange" isCompact data-test="ecp-countdown-badge">
                {warning.warningType === 'expiring-exception'
                  ? `Expires in ${warning.daysUntilEvent}d`
                  : `Activates in ${warning.daysUntilEvent}d`}
              </Label>
            </FlexItem>
          </Flex>
        ))}
      </ExpandableSection>
    </Alert>
  );
};
