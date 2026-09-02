import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Bullseye, PageSection, Spinner, Title } from '@patternfly/react-core';
import { RouterParams } from '@routes/utils';
import { FilterContextProvider } from '~/components/Filter/generic/FilterContext';
import {
  getSourceColumn,
  VULNERABILITIES_LIST_COLUMN_STATE_KEY,
} from '~/components/Vulnerabilities/vulnerabilities-table-config';
import { VulnerabilitiesTable } from '~/components/Vulnerabilities/VulnerabilitiesTable';
import { useNamespace } from '~/shared/providers/Namespace';
import { getErrorState } from '~/shared/utils/error-utils';
import { SecuritySummaryBar } from './SecuritySummaryBar';
import { useApplicationVulnerabilities } from './useApplicationVulnerabilities';

const ApplicationSecurityTabContent: React.FC = () => {
  const { applicationName } = useParams<RouterParams>();
  const namespace = useNamespace();
  const { rows, counts, totalComponents, totalScanned, loaded, error } =
    useApplicationVulnerabilities(applicationName ?? '');

  const sourceColumn = React.useMemo(
    () => getSourceColumn(namespace, applicationName ?? ''),
    [namespace, applicationName],
  );

  const errorState = getErrorState(error, loaded, 'vulnerabilities');
  if (errorState) return errorState;
  if (!loaded) {
    return (
      <PageSection>
        <Bullseye>
          <Spinner size="xl" aria-label="Loading vulnerabilities" />
        </Bullseye>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection padding={{ default: 'noPadding' }}>
        <Title headingLevel="h3" className="pf-v6-u-mt-lg pf-v6-u-mb-sm" size="lg">
          Security summary
        </Title>
        <SecuritySummaryBar
          counts={counts}
          totalComponents={totalComponents}
          totalScanned={totalScanned}
        />
      </PageSection>
      <PageSection isFilled padding={{ default: 'noPadding' }}>
        <VulnerabilitiesTable
          rows={rows}
          loaded={loaded}
          showImage
          showPipelineRun
          extraColumns={[sourceColumn]}
          columnStateKey={`${VULNERABILITIES_LIST_COLUMN_STATE_KEY}-app`}
          ariaLabel="Application vulnerabilities"
        />
      </PageSection>
    </>
  );
};

export const ApplicationSecurityTab: React.FC = () => (
  <FilterContextProvider
    filterParams={['cveId', 'severity', 'package', 'status', 'image', 'pipelinerun']}
  >
    <ApplicationSecurityTabContent />
  </FilterContextProvider>
);
