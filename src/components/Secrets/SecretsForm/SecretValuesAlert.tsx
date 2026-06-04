import React from 'react';
import { Alert, AlertActionLink } from '@patternfly/react-core';

type SecretValuesAlertProps = {
  valuesHidden: boolean;
  onToggle: () => void;
};

export const SecretValuesAlert: React.FC<SecretValuesAlertProps> = ({ valuesHidden, onToggle }) => (
  <Alert
    variant="info"
    isInline
    title={valuesHidden ? 'Secret values are hidden' : 'Secret values are visible'}
    data-test="secret-values-visibility-alert"
    actionLinks={
      <AlertActionLink onClick={onToggle} data-test="toggle-secret-values-visibility">
        {valuesHidden ? 'Show values' : 'Hide values'}
      </AlertActionLink>
    }
  >
    For security, secret values are hidden by default. Click &quot;
    {valuesHidden ? 'Show values' : 'Hide values'}&quot; to toggle visibility.
  </Alert>
);
