import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExpandableRowContent, Tr } from '@patternfly/react-table';
import { CONFORMA_POLICY_AVAILABLE_RULE_COLLECTIONS_URL } from '~/consts/documentation';
import { UIConformaData } from '~/types/conforma';
import { getRemediationGuidance } from '~/utils/ecp-warning-utils';
import { ExternalLink, Timestamp } from '../../../shared';
import './ConformaTable.scss';

interface Props {
  obj: UIConformaData;
}

export const ConformaExpandedRowContent: React.FC<Props> = ({ obj }) => {
  if (!obj.description && !obj.collection?.length && !obj.solution && !obj.timestamp && !obj.effectiveUntil && !obj.warningType) return null;

  return (
    <Tr className="conforma-expanded-row" data-test="conforma-expand-content">
      <ExpandableRowContent>
        <DescriptionList className="conforma-description-list">
          <DescriptionListGroup>
            <DescriptionListTerm>Rule Description</DescriptionListTerm>
            <DescriptionListDescription>{obj.description ?? '-'}</DescriptionListDescription>
          </DescriptionListGroup>

          {obj.collection?.length ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Collection</DescriptionListTerm>
              <DescriptionListDescription>
                <ExternalLink href={CONFORMA_POLICY_AVAILABLE_RULE_COLLECTIONS_URL}>
                  {obj.collection.join(', ')}
                </ExternalLink>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}

          {obj.solution ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Solution</DescriptionListTerm>
              <DescriptionListDescription>{obj.solution}</DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}

          {obj.timestamp ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Effective from</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp timestamp={obj.timestamp} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}

          {obj.effectiveUntil ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Effective until</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp timestamp={obj.effectiveUntil} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}

          {obj.warningType ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Warning</DescriptionListTerm>
              <DescriptionListDescription>
                {obj.warningType === 'expiring-exception'
                  ? `Expiring Exception — ${obj.daysUntilEvent} days remaining`
                  : `Upcoming Activation — activates in ${obj.daysUntilEvent} days`}
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}

          {obj.warningType ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Remediation</DescriptionListTerm>
              <DescriptionListDescription>
                {getRemediationGuidance(obj)}
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
        </DescriptionList>
      </ExpandableRowContent>
    </Tr>
  );
};
