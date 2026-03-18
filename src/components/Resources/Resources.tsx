import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Gallery,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import PageLayout from '~/components/PageLayout/PageLayout';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { HARDCODED_RESOURCES, Resource, ResourceType } from './resource-data';
import ResourceCard from './ResourceCard';
import ResourceListItem from './ResourceListItem';
import ResourcesToolbar from './ResourcesToolbar';
import ResourcesFilters from './ResourcesFilters';

import './Resources.scss';

export const Resources: React.FC = () => {
  useDocumentTitle('Resources | Konflux');

  const [searchText, setSearchText] = React.useState('');
  const [viewType, setViewType] = React.useState<'CARD' | 'LIST'>('CARD');
  const [sortType, setSortType] = React.useState('name');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedTypes, setSelectedTypes] = React.useState<ResourceType[]>([]);
  const [selectedProviders, setSelectedProviders] = React.useState<string[]>([]);
  const [favorites, setFavorites] = React.useState<string[]>([]);

  const toggleFavorite = React.useCallback((name: string) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name],
    );
  }, []);

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedTypes([]);
    setSelectedProviders([]);
  };

  const filtered = React.useMemo(() => {
    let results: Resource[] = [...HARDCODED_RESOURCES];

    if (selectedCategory === 'Favorites') {
      results = results.filter((r) => favorites.includes(r.name));
    } else if (selectedCategory) {
      results = results.filter((r) => r.category === selectedCategory);
    }

    if (selectedTypes.length > 0) {
      results = results.filter((r) => selectedTypes.includes(r.type));
    }

    if (selectedProviders.length > 0) {
      results = results.filter((r) => selectedProviders.includes(r.provider));
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      results = results.filter(
        (r) =>
          r.displayName.toLowerCase().includes(lower) ||
          r.description.toLowerCase().includes(lower),
      );
    }

    results.sort((a, b) => {
      const aFav = favorites.includes(a.name);
      const bFav = favorites.includes(b.name);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      switch (sortType) {
        case 'type':
          return a.type.localeCompare(b.type);
        case 'application':
          return a.provider.localeCompare(b.provider);
        case 'duration':
          return (a.durationMinutes || 0) - (b.durationMinutes || 0);
        default:
          return a.displayName.localeCompare(b.displayName);
      }
    });

    return results;
  }, [searchText, sortType, selectedCategory, selectedTypes, selectedProviders, favorites]);

  return (
    <PageLayout
      title="Resources"
      description="Access learning resources, documentation, and tutorials for Konflux and supported tools."
    >
      <div className="resources-page__content">
        <ResourcesFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
          selectedProviders={selectedProviders}
          onProvidersChange={setSelectedProviders}
          favorites={favorites}
        />
        <div className="resources-page__view-panel">
          <ResourcesToolbar
            count={filtered.length}
            totalCount={HARDCODED_RESOURCES.length}
            viewType={viewType}
            onViewTypeChange={setViewType}
            searchText={searchText}
            onSearchChange={setSearchText}
            sortType={sortType}
            onSortTypeChange={setSortType}
            categoryLabel={selectedCategory}
          />

          {filtered.length === 0 ? (
            <div className="resources-page__empty-state">
              <EmptyState variant={EmptyStateVariant.full}>
                <EmptyStateHeader
                  titleText="No results match the filter criteria"
                  icon={<EmptyStateIcon icon={SearchIcon} />}
                  headingLevel="h2"
                />
                <EmptyStateBody>
                  No resources are being shown due to the filters being applied.
                </EmptyStateBody>
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button variant="link" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            </div>
          ) : viewType === 'CARD' ? (
            <div className="resources-page__card-view">
              <Gallery maxWidths={{ default: '330px' }} hasGutter>
                {filtered.map((resource) => (
                  <ResourceCard
                    key={resource.name}
                    resource={resource}
                    favorite={favorites.includes(resource.name)}
                    onToggleFavorite={() => toggleFavorite(resource.name)}
                  />
                ))}
              </Gallery>
            </div>
          ) : (
            <div className="resources-page__list-view">
              <div className="resources-page__list-header">
                <div />
                <div className="resources-page__list-header-cell">Name</div>
                <div className="resources-page__list-header-cell">Provider</div>
                <div className="resources-page__list-header-cell">Type</div>
                <div className="resources-page__list-header-cell">Duration</div>
                <div />
              </div>
              {filtered.map((resource) => (
                <ResourceListItem
                  key={resource.name}
                  resource={resource}
                  favorite={favorites.includes(resource.name)}
                  onToggleFavorite={() => toggleFavorite(resource.name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
