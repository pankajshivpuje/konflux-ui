import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  Bullseye,
  Spinner,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { useNamespace } from '~/shared/providers/Namespace';
import { ECPWarningBanner } from '../ECPWarningBanner';
import { PolicyDetailTable } from './PolicyDetailTable';
import PolicyEmptyState from './PolicyEmptyState';
import { PolicySummaryHeader } from './PolicySummaryHeader';
import { useApplicationConformaResults } from './useApplicationConformaResults';

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
        <EmptyState
          data-test="policy-error-state"
          icon={ExclamationCircleIcon}
          titleText="Unable to load policy results"
          headingLevel="h4"
        >
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
      <ECPWarningBanner warnings={data} />
      <PolicyDetailTable data={data} />
    </>
  );
};

export default PolicyTab;
