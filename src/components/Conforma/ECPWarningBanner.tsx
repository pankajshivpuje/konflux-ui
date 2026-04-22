import { Alert, AlertActionCloseButton, Flex, FlexItem, Text } from '@patternfly/react-core';
import { UIConformaData } from '~/types/conforma';
import { getRemediationGuidance, getWarningMessage } from '~/utils/ecp-warning-utils';

interface ECPWarningBannerProps {
  warnings: UIConformaData[];
}

export const ECPWarningBanner: React.FC<ECPWarningBannerProps> = ({ warnings }) => {
  if (!warnings.length) {
    return null;
  }

  return (
    <Flex
      direction={{ default: 'column' }}
      gap={{ default: 'gapSm' }}
      style={{ marginTop: 'var(--pf-v5-global--spacer--lg)' }}
      data-test="ecp-warning-banner"
    >
      {warnings.map((warning, index) => {
        const remediation = getRemediationGuidance(warning);
        return (
          <FlexItem key={`${warning.title}-${index}`}>
            <Alert
              variant="warning"
              isInline
              title={getWarningMessage(warning)}
              actionClose={<AlertActionCloseButton />}
              data-test={`ecp-warning-alert-${index}`}
            >
              <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                <FlexItem>
                  <Text component="small">
                    <strong>Policy rule:</strong> {warning.title}
                    {warning.collection?.length ? ` | Collection: ${warning.collection.join(', ')}` : ''}
                  </Text>
                </FlexItem>
                {remediation && (
                  <FlexItem>
                    <Text component="small">
                      <strong>Remediation:</strong> {remediation}
                    </Text>
                  </FlexItem>
                )}
              </Flex>
            </Alert>
          </FlexItem>
        );
      })}
    </Flex>
  );
};
