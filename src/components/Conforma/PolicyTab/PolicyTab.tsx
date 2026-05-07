import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  Bullseye,
  Spinner,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useNamespace } from '~/shared/providers/Namespace';
import PolicyEmptyState from './PolicyEmptyState';
import { useApplicationConformaResults } from './useApplicationConformaResults';
import { PolicySummaryHeader } from './PolicySummaryHeader';
import { PolicyDetailTable } from './PolicyDetailTable';

const PolicyTab: React.FC = () => {
  const { applicationName } = useParams();
  const namespace = useNamespace();

  const [data, summary, loaded, error] = useApplicationConformaResults(namespace, applicationName);

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner data-test="policy-spinner" />
      </Bullseye>
    );
  }

  if (error) {
    return (
      <Bullseye>
        <EmptyState data-test="policy-error-state">
          <EmptyStateHeader
            titleText="Unable to load policy results"
            icon={<EmptyStateIcon icon={ExclamationCircleIcon} color="var(--pf-v5-global--danger-color--100)" />}
            headingLevel="h4"
          />
          <EmptyStateBody>
            There was a problem loading the policy results. Try refreshing the page.
          </EmptyStateBody>
        </EmptyState>
      </Bullseye>
    );
  }

  if (!data?.length) {
    return <PolicyEmptyState />;
  }

  return (
    <>
      <PolicySummaryHeader summary={summary} data={data} />
      <PolicyDetailTable data={data} />
    </>
  );
};

export default PolicyTab;
