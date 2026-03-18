import * as React from 'react';
import { Button, Label } from '@patternfly/react-core';
import { ExternalLinkAltIcon, StarIcon } from '@patternfly/react-icons';
import { Resource, DOC_TYPE_LABELS, DOC_TYPE_COLORS, getDuration } from './resource-data';

type ResourceListItemProps = {
  resource: Resource;
  favorite: boolean;
  onToggleFavorite: () => void;
};

const ResourceListItem: React.FC<ResourceListItemProps> = ({
  resource,
  favorite,
  onToggleFavorite,
}) => {
  const linkLabel = {
    documentation: 'View documentation',
    tutorial: 'Access tutorial',
    'how-to': 'Read how-to article',
    quickstart: 'Start quick start',
  }[resource.type];

  return (
    <div className="resources-page__list-row">
      <div className="resources-page__list-cell">
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
      </div>
      <div>
        <div className="resources-page__list-name">{resource.displayName}</div>
        <div className="resources-page__list-description">{resource.description}</div>
      </div>
      <div className="resources-page__list-cell">{resource.provider}</div>
      <div className="resources-page__list-cell">
        <Label color={DOC_TYPE_COLORS[resource.type] as 'blue'}>
          {DOC_TYPE_LABELS[resource.type]}
        </Label>
      </div>
      <div className="resources-page__list-cell">
        {resource.durationMinutes ? getDuration(resource.durationMinutes) : '-'}
      </div>
      <div className="resources-page__list-link">
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
      </div>
    </div>
  );
};

export default ResourceListItem;
