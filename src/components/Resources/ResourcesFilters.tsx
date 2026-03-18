import * as React from 'react';
import { Checkbox } from '@patternfly/react-core';
import { Resource, ResourceType, DOC_TYPE_LABELS, HARDCODED_RESOURCES } from './resource-data';

type ResourcesFiltersProps = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedTypes: ResourceType[];
  onTypesChange: (types: ResourceType[]) => void;
  selectedProviders: string[];
  onProvidersChange: (providers: string[]) => void;
  favorites: string[];
};

const allCategories = [...new Set(HARDCODED_RESOURCES.map((r) => r.category))].sort();
const allProviders = [...new Set(HARDCODED_RESOURCES.map((r) => r.provider))].sort();
const allTypes: ResourceType[] = ['documentation', 'how-to', 'tutorial', 'quickstart'];

const getCountByType = (type: ResourceType, resources: Resource[]) =>
  resources.filter((r) => r.type === type).length;

const getCountByProvider = (provider: string, resources: Resource[]) =>
  resources.filter((r) => r.provider === provider).length;

const ResourcesFilters: React.FC<ResourcesFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedTypes,
  onTypesChange,
  selectedProviders,
  onProvidersChange,
  favorites,
}) => {
  const toggleType = (type: ResourceType) => {
    onTypesChange(
      selectedTypes.includes(type)
        ? selectedTypes.filter((t) => t !== type)
        : [...selectedTypes, type],
    );
  };

  const toggleProvider = (provider: string) => {
    onProvidersChange(
      selectedProviders.includes(provider)
        ? selectedProviders.filter((p) => p !== provider)
        : [...selectedProviders, provider],
    );
  };

  const categoryClass = (active: boolean) =>
    `resources-page__category-btn${active ? ' resources-page__category-btn--active' : ''}`;

  return (
    <div className="resources-page__filter-panel">
      {/* Categories */}
      <div className="resources-page__filter-section">
        <button
          className={categoryClass(selectedCategory === '')}
          onClick={() => onCategoryChange('')}
        >
          All Items
        </button>
        {favorites.length > 0 && (
          <button
            className={categoryClass(selectedCategory === 'Favorites')}
            onClick={() => onCategoryChange('Favorites')}
          >
            Favorites
          </button>
        )}
        <div className="resources-page__category-separator" />
        {allCategories.map((cat) => (
          <button
            key={cat}
            className={categoryClass(selectedCategory === cat)}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Type */}
      <div className="resources-page__filter-section">
        <div className="resources-page__filter-title">Resource type</div>
        {allTypes.map((type) => (
          <Checkbox
            key={type}
            id={`filter-type-${type}`}
            label={`${DOC_TYPE_LABELS[type]} (${getCountByType(type, HARDCODED_RESOURCES)})`}
            isChecked={selectedTypes.includes(type)}
            onChange={() => toggleType(type)}
            className="resources-page__filter-checkbox"
          />
        ))}
      </div>

      {/* Provider */}
      <div className="resources-page__filter-section">
        <div className="resources-page__filter-title">Provider</div>
        {allProviders.map((provider) => (
          <Checkbox
            key={provider}
            id={`filter-provider-${provider}`}
            label={`${provider} (${getCountByProvider(provider, HARDCODED_RESOURCES)})`}
            isChecked={selectedProviders.includes(provider)}
            onChange={() => toggleProvider(provider)}
            className="resources-page__filter-checkbox"
          />
        ))}
      </div>
    </div>
  );
};

export default ResourcesFilters;
