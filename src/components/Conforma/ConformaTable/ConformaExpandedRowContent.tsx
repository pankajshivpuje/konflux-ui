import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import { ExpandableRowContent, Tr } from '@patternfly/react-table';
import { CONFORMA_POLICY_AVAILABLE_RULE_COLLECTIONS_URL } from '~/consts/documentation';
import { UIConformaData } from '~/types/conforma';
import { ExternalLink, Timestamp } from '../../../shared';
import './ConformaTable.scss';

interface Props {
  obj: UIConformaData;
}

export const ConformaExpandedRowContent: React.FC<Props> = ({ obj }) => {
  if (
    !obj.description &&
    !obj.collection?.length &&
    !obj.solution &&
    !obj.timestamp &&
    !obj.warningType
  )
    return null;

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

          {obj.warningType === 'expiring-exception' && obj.effectiveUntil ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Exception expires</DescriptionListTerm>
              <DescriptionListDescription>
                <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Timestamp timestamp={obj.effectiveUntil} />
                  </FlexItem>
                  <FlexItem>
                    <Label color="orange" isCompact data-test="ecp-countdown-badge">
                      Expires in {obj.daysUntilEvent}d
                    </Label>
                  </FlexItem>
                </Flex>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}

          {obj.warningType === 'upcoming-activation' && obj.timestamp ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Activates on</DescriptionListTerm>
              <DescriptionListDescription>
                <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Timestamp timestamp={obj.timestamp} />
                  </FlexItem>
                  <FlexItem>
                    <Label color="orange" isCompact data-test="ecp-countdown-badge">
                      Activates in {obj.daysUntilEvent}d
                    </Label>
                  </FlexItem>
                </Flex>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}

          {!obj.warningType && obj.timestamp ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Effective from</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp timestamp={obj.timestamp} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}

          {obj.policySource === 'root' ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Policy source</DescriptionListTerm>
              <DescriptionListDescription data-test="policy-source-label">
                <Label isCompact color="purple">Inherited from root policy</Label>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
        </DescriptionList>
      </ExpandableRowContent>
    </Tr>
  );
};
