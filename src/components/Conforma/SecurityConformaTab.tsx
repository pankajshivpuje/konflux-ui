import * as React from 'react';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  Flex,
  FlexItem,
  Icon,
  Spinner,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { CONFORMA_POLICY_AVAILABLE_RULE_COLLECTIONS_URL } from '~/consts/documentation';
import { useDeepCompareMemoize } from '~/shared';
import { getErrorState } from '~/shared/utils/error-utils';
import { CONFORMA_RESULT_STATUS, UIConformaData } from '~/types/conforma';
import { textMatch } from '~/utils/text-filter-utils';
import FilteredEmptyState from '../../shared/components/empty-state/FilteredEmptyState';
import { FilterContext } from '../Filter/generic/FilterContext';
import { MultiSelect } from '../Filter/generic/MultiSelect';
import { BaseTextFilterToolbar } from '../Filter/toolbars/BaseTextFIlterToolbar';
import { createFilterObj } from '../Filter/utils/filter-utils';
import { ConformaTable } from './ConformaTable/ConformaTable';
import { ECPWarningBanner } from './ECPWarningBanner';
import SecurityTabEmptyState from './SecurityTabEmptyState';
import { useConformaResult } from './useConformaResult';

const statuses = [
  CONFORMA_RESULT_STATUS.violations,
  CONFORMA_RESULT_STATUS.warnings,
  CONFORMA_RESULT_STATUS.successes,
];

const getResultsSummary = (CRs, crLoaded) => {
  const statusFilter = Object.fromEntries(statuses.map((status) => [status, 0]));
  return crLoaded && CRs
    ? CRs?.reduce((acc, cr) => {
        if (acc[cr.status]) {
          acc[cr.status] += 1;
        } else {
          acc[cr.status] = 1;
        }
        return acc;
      }, statusFilter)
    : statusFilter;
};

export const SecurityConformaTab: React.FC<
  React.PropsWithChildren<{ pipelineRunName: string }>
> = ({ pipelineRunName }) => {
  const [conformaResult, crLoaded, crError] = useConformaResult(pipelineRunName);

  const { filters: unparsedFilters, setFilters, onClearFilters } = React.useContext(FilterContext);
  const filters = useDeepCompareMemoize({
    rule: unparsedFilters.rule ? (unparsedFilters.rule as string) : '',
    status: unparsedFilters.status ? (unparsedFilters.status as string[]) : [],
    component: unparsedFilters.component ? (unparsedFilters.component as string[]) : [],
  });

  const { rule: ruleFilter, status: statusFilter, component: componentFilter } = filters;

  const statusFilterObj = React.useMemo(
    () =>
      crLoaded && conformaResult
        ? createFilterObj(conformaResult, (cr) => cr.status, statuses)
        : {},
    [conformaResult, crLoaded],
  );

  const componentFilterObj = React.useMemo(
    () => (crLoaded && conformaResult ? createFilterObj(conformaResult, (cr) => cr.component) : {}),
    [conformaResult, crLoaded],
  );

  // filter data in table
  const filteredCRResult = React.useMemo(() => {
    return crLoaded && conformaResult
      ? conformaResult?.filter((rule: UIConformaData) => {
          return (
            textMatch(rule.title, ruleFilter) &&
            (!statusFilter.length || statusFilter.includes(rule.status)) &&
            (!componentFilter.length || componentFilter.includes(rule.component))
          );
        })
      : undefined;
  }, [componentFilter, conformaResult, crLoaded, ruleFilter, statusFilter]);

  // result summary
  const resultSummary = React.useMemo(
    () => getResultsSummary(filteredCRResult, crLoaded),
    [filteredCRResult, crLoaded],
  );

  const ecpWarningCount = React.useMemo(
    () =>
      conformaResult?.filter((item) => item.warningType && item.daysUntilEvent != null).length ?? 0,
    [conformaResult],
  );

  const toolbar = (
    <BaseTextFilterToolbar
      text={ruleFilter}
      label="rule"
      setText={(rule) => setFilters({ ...filters, rule })}
      onClearFilters={onClearFilters}
      dataTest="security-conforma-list-toolbar"
    >
      <MultiSelect
        label="Component"
        values={componentFilter}
        filterKey="component"
        setValues={(component) => setFilters({ ...filters, component })}
        options={componentFilterObj}
      />
      <MultiSelect
        label="Status"
        values={statusFilter}
        filterKey="status"
        setValues={(status) => setFilters({ ...filters, status })}
        options={statusFilterObj}
      />
    </BaseTextFilterToolbar>
  );

  if (crError) {
    return getErrorState(crError, crLoaded, 'Conforma results');
  }

  if (!crLoaded && !filteredCRResult) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (crLoaded && !filteredCRResult) {
    return <SecurityTabEmptyState />;
  }

  return (
    <>
      <TextContent style={{ marginTop: 'var(--pf-v5-global--spacer--lg)' }}>
        <Text component={TextVariants.h3}>Testing apps against Conforma</Text>
        <Text component={TextVariants.p}>
          Conforma is a set of tools for verifying the provenance of application snapshots and
          validating them against a clearly defined policy.
          <br />
          The Conforma policy is defined using the{' '}
          <Button
            variant="link"
            isInline
            component={(props) => (
              <a
                {...props}
                href="https://www.openpolicyagent.org/docs/latest/policy-language/"
                target="_blank"
                rel="noreferrer"
              />
            )}
          >
            rego policy language
          </Button>{' '}
          and is described here in{' '}
          <Button
            variant="link"
            isInline
            component={(props) => (
              <a
                {...props}
                href={CONFORMA_POLICY_AVAILABLE_RULE_COLLECTIONS_URL}
                target="_blank"
                rel="noreferrer"
              />
            )}
          >
            Conforma Policies
          </Button>
          .
        </Text>
      </TextContent>
      <Flex
        gap={{ default: 'gapMd' }}
        style={{ marginTop: 'var(--pf-v5-global--spacer--xl)' }}
        data-test="result-summary"
      >
        {ecpWarningCount > 0 && (
          <FlexItem>
            <Card isCompact isFlat data-test="security-summary-changes-card">
              <CardBody>
                <Text
                  component={TextVariants.p}
                  style={{
                    marginBottom: 'var(--pf-v5-global--spacer--sm)',
                    fontWeight: 600,
                  }}
                >
                  Upcoming changes
                </Text>
                <Flex gap={{ default: 'gapLg' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem data-test="security-stat-ecp-warnings">
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <Icon size="md" status="warning">
                        <BellIcon />
                      </Icon>
                      <FlexItem>
                        <Text component={TextVariants.h3} style={{ margin: 0 }}>
                          {ecpWarningCount}
                        </Text>
                      </FlexItem>
                      <FlexItem>
                        <Text component={TextVariants.small}>Pending</Text>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </FlexItem>
        )}
        <FlexItem>
          <Card isCompact isFlat data-test="security-summary-results-card">
            <CardBody>
              <Text
                component={TextVariants.p}
                style={{
                  marginBottom: 'var(--pf-v5-global--spacer--sm)',
                  fontWeight: 600,
                }}
              >
                Results summary
              </Text>
              <Flex gap={{ default: 'gapLg' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem data-test="security-stat-violations">
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <Icon size="md" status="danger">
                      <ExclamationCircleIcon />
                    </Icon>
                    <FlexItem>
                      <Text component={TextVariants.h3} style={{ margin: 0 }}>
                        {resultSummary[CONFORMA_RESULT_STATUS.violations]}
                      </Text>
                    </FlexItem>
                    <FlexItem>
                      <Text component={TextVariants.small}>Violations</Text>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <div
                    style={{
                      width: 1,
                      height: 32,
                      backgroundColor: 'var(--pf-v5-global--BorderColor--100)',
                    }}
                  />
                </FlexItem>
                <FlexItem data-test="security-stat-warnings">
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <Icon size="md" status="warning">
                      <ExclamationTriangleIcon />
                    </Icon>
                    <FlexItem>
                      <Text component={TextVariants.h3} style={{ margin: 0 }}>
                        {resultSummary[CONFORMA_RESULT_STATUS.warnings]}
                      </Text>
                    </FlexItem>
                    <FlexItem>
                      <Text component={TextVariants.small}>Warnings</Text>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <div
                    style={{
                      width: 1,
                      height: 32,
                      backgroundColor: 'var(--pf-v5-global--BorderColor--100)',
                    }}
                  />
                </FlexItem>
                <FlexItem data-test="security-stat-successes">
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <Icon size="md" status="success">
                      <CheckCircleIcon />
                    </Icon>
                    <FlexItem>
                      <Text component={TextVariants.h3} style={{ margin: 0 }}>
                        {resultSummary[CONFORMA_RESULT_STATUS.successes]}
                      </Text>
                    </FlexItem>
                    <FlexItem>
                      <Text component={TextVariants.small}>Successes</Text>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </CardBody>
          </Card>
        </FlexItem>
      </Flex>
      <ECPWarningBanner warnings={conformaResult ?? []} />
      <div style={{ marginTop: 'var(--pf-v5-global--spacer--lg)' }}>
        {toolbar}
      </div>
      {crLoaded && filteredCRResult.length > 0 ? (
        <ConformaTable conformaResult={filteredCRResult} />
      ) : (
        <FilteredEmptyState onClearFilters={() => onClearFilters()} />
      )}
    </>
  );
};
