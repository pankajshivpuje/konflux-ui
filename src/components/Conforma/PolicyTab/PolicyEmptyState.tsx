import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateFooter,
  EmptyStateActions,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import SecurityShieldImg from '../../../assets/shield-security.svg';

import '../../../shared/components/empty-state/EmptyState.scss';

const EmptyStateImg = () => <SecurityShieldImg className="app-empty-state__icon" role="img" />;

const CONFORMA_DOCS_URL =
  'https://conforma.dev/docs/ec-policies/release_policy.html';

const PolicyEmptyState: React.FC = () => {
  return (
    <EmptyState
      className="app-empty-state"
      data-test="policy-tab-empty-state"
      variant={EmptyStateVariant.full}
    >
      <EmptyStateHeader
        titleText="No policy results yet"
        icon={<EmptyStateIcon icon={EmptyStateImg} />}
        headingLevel="h2"
      />
      <EmptyStateBody>
        Policy results appear after integration test pipelines run with a Conforma (Enterprise
        Contract) verification task. These results show whether your components meet your
        organization&apos;s compliance policies.
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            variant={ButtonVariant.link}
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
            component="a"
            href={CONFORMA_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn about Conforma policies
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default PolicyEmptyState;
