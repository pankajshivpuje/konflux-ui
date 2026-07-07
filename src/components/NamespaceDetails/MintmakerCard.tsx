import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Icon,
  Text,
  TextContent,
} from '@patternfly/react-core';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import { useIsOnFeatureFlag } from '~/feature-flags/hooks';

const MintmakerCard: React.FC = () => {
  const mintmakerEnabled = useIsOnFeatureFlag('mintmaker-dashboard');

  if (!mintmakerEnabled) return null;

  return (
    <Card data-test="mintmaker-card">
      <CardTitle>Mintmaker / Dependency Updates</CardTitle>
      <CardBody>
        <TextContent>
          <Text>
            <Icon status="info">
              <InfoCircleIcon />
            </Icon>{' '}
            Dependency update status will appear here once the Mintmaker service is integrated.
          </Text>
          <Text component="small">
            Mintmaker automates dependency updates by creating pull requests for outdated
            dependencies. This card will show pending updates, recently merged PRs, and update
            age distribution once the Mintmaker CRD and API are available.
          </Text>
        </TextContent>
      </CardBody>
    </Card>
  );
};

export default MintmakerCard;
