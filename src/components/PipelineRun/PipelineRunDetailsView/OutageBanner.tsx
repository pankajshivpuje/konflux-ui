import * as React from 'react';
import { Alert, PageSection } from '@patternfly/react-core';
import { useKonfluxStatus } from '~/hooks/useKonfluxStatus';
import ExternalLink from '~/shared/components/links/ExternalLink';

export const OutageBanner: React.FC = () => {
  const [status] = useKonfluxStatus();

  if (!status || status.status === 'operational') {
    return null;
  }

  return (
    <PageSection>
      <Alert
        variant={status.status === 'outage' ? 'danger' : 'warning'}
        title="Konflux is experiencing issues"
        isInline
        data-test="outage-banner"
      >
        {status.message ||
          'Some services may be affected. Consider waiting before retrying failed pipeline runs.'}
        {status.statusPageUrl && (
          <>
            {' '}
            <ExternalLink href={status.statusPageUrl} text="View status page" />
          </>
        )}
      </Alert>
    </PageSection>
  );
};
