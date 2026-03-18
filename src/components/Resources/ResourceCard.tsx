import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  LabelGroup,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, StarIcon } from '@patternfly/react-icons';
import { Resource, DOC_TYPE_LABELS, DOC_TYPE_COLORS, getDuration } from './resource-data';

type ResourceCardProps = {
  resource: Resource;
  favorite: boolean;
  onToggleFavorite: () => void;
};

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, favorite, onToggleFavorite }) => {
  const linkLabel = {
    documentation: 'View documentation',
    tutorial: 'Access tutorial',
    'how-to': 'Read how-to article',
    quickstart: 'Start quick start',
  }[resource.type];

  return (
    <Card data-testid={`card-${resource.name}`} className="resources-page__card" isCompact>
      <CardHeader
        actions={{
          actions: (
            <Button
              variant="plain"
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={onToggleFavorite}
              className="resources-page__favorite-btn"
            >
              <StarIcon
                className={
                  favorite
                    ? 'resources-page__star-icon--selected'
                    : 'resources-page__star-icon'
                }
              />
            </Button>
          ),
          hasNoOffset: true,
          className: undefined,
        }}
      />
      <CardTitle>
        <div className="resources-page__card-title">{resource.displayName}</div>
        <div className="resources-page__card-provider">by {resource.provider}</div>
      </CardTitle>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <LabelGroup>
              <Label color={DOC_TYPE_COLORS[resource.type] as 'blue'}>
                {DOC_TYPE_LABELS[resource.type]}
              </Label>
              {resource.durationMinutes ? (
                <Label variant="outline" color="grey">
                  {getDuration(resource.durationMinutes)}
                </Label>
              ) : null}
            </LabelGroup>
          </StackItem>
          <StackItem>
            <div className="resources-page__card-description">{resource.description}</div>
          </StackItem>
        </Stack>
      </CardBody>
      <CardFooter className="resources-page__card-footer">
        {resource.type === 'quickstart' ? (
          <Button variant="link" isInline>
            {linkLabel}
          </Button>
        ) : (
          <Button
            variant="link"
            isInline
            component="a"
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            {linkLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;
