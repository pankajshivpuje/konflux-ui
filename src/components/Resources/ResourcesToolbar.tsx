import * as React from 'react';
import {
  SearchInput,
  Select,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ThIcon, ListIcon } from '@patternfly/react-icons';

type ResourcesToolbarProps = {
  count: number;
  totalCount: number;
  viewType: 'CARD' | 'LIST';
  onViewTypeChange: (type: 'CARD' | 'LIST') => void;
  searchText: string;
  onSearchChange: (value: string) => void;
  sortType: string;
  onSortTypeChange: (value: string) => void;
  categoryLabel: string;
};

const SORT_OPTIONS = ['name', 'type', 'application', 'duration'];

const ResourcesToolbar: React.FC<ResourcesToolbarProps> = ({
  count,
  totalCount,
  viewType,
  onViewTypeChange,
  searchText,
  onSearchChange,
  sortType,
  onSortTypeChange,
  categoryLabel,
}) => {
  const [sortOpen, setSortOpen] = React.useState(false);

  return (
    <div>
      <div className="resources-page__toolbar-header">
        <span className="resources-page__toolbar-category-label">
          {categoryLabel || 'All Items'}
        </span>
        <ToggleGroup aria-label="View type">
          <ToggleGroupItem
            icon={<ThIcon />}
            aria-label="Card view"
            buttonId="card-view"
            isSelected={viewType === 'CARD'}
            onChange={() => onViewTypeChange('CARD')}
          />
          <ToggleGroupItem
            icon={<ListIcon />}
            aria-label="List view"
            buttonId="list-view"
            isSelected={viewType === 'LIST'}
            onChange={() => onViewTypeChange('LIST')}
          />
        </ToggleGroup>
      </div>
      <Toolbar className="resources-page__toolbar">
        <ToolbarContent>
          <ToolbarItem className="resources-page__toolbar-search">
            <SearchInput
              placeholder="Search"
              value={searchText}
              onChange={(_e, value) => onSearchChange(value)}
              onClear={() => onSearchChange('')}
            />
          </ToolbarItem>
          {viewType === 'CARD' && (
            <ToolbarItem>
              <Select
                isOpen={sortOpen}
                onOpenChange={setSortOpen}
                onSelect={(_e, value) => {
                  onSortTypeChange(value as string);
                  setSortOpen(false);
                }}
                selected={sortType}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setSortOpen(!sortOpen)}
                    isExpanded={sortOpen}
                  >
                    Sort by {sortType}
                  </MenuToggle>
                )}
              >
                {SORT_OPTIONS.map((opt) => (
                  <SelectOption key={opt} value={opt}>
                    {opt}
                  </SelectOption>
                ))}
              </Select>
            </ToolbarItem>
          )}
          <ToolbarItem align={{ default: 'alignRight' }}>
            <span className="resources-page__toolbar-count">
              {`${count}${count !== totalCount ? ` of ${totalCount}` : ''} items`}
            </span>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </div>
  );
};

export default ResourcesToolbar;
