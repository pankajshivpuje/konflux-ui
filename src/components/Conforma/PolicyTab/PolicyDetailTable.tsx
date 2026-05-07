import * as React from 'react';
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  SearchInput,
  MenuToggle,
  Select,
  SelectOption,
  SelectList,
  Label,
  Text,
  TextContent,
  TextVariants,
  Icon,
  Button,
} from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@patternfly/react-icons';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ExpandableRowContent,
} from '@patternfly/react-table';
import { CONFORMA_RESULT_STATUS, UIConformaData } from '~/types/conforma';

type PolicyDetailTableProps = {
  data: UIConformaData[];
};

type GroupBy = 'component' | 'rule';

const STATUS_LABELS: Record<CONFORMA_RESULT_STATUS, string> = {
  [CONFORMA_RESULT_STATUS.violations]: 'Violations',
  [CONFORMA_RESULT_STATUS.warnings]: 'Warnings',
  [CONFORMA_RESULT_STATUS.successes]: 'Successes',
};

const statusIcon = (status: CONFORMA_RESULT_STATUS) => {
  switch (status) {
    case CONFORMA_RESULT_STATUS.violations:
      return (
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      );
    case CONFORMA_RESULT_STATUS.warnings:
      return (
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      );
    case CONFORMA_RESULT_STATUS.successes:
      return (
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>
      );
  }
};

const statusLabel = (status: CONFORMA_RESULT_STATUS) => {
  const colorMap: Record<CONFORMA_RESULT_STATUS, 'red' | 'orange' | 'green'> = {
    [CONFORMA_RESULT_STATUS.violations]: 'red',
    [CONFORMA_RESULT_STATUS.warnings]: 'orange',
    [CONFORMA_RESULT_STATUS.successes]: 'green',
  };
  return (
    <Label color={colorMap[status]} icon={statusIcon(status)}>
      {STATUS_LABELS[status]}
    </Label>
  );
};

const groupData = (
  data: UIConformaData[],
  groupBy: GroupBy,
): Record<string, UIConformaData[]> => {
  const groups: Record<string, UIConformaData[]> = {};
  for (const item of data) {
    const key = groupBy === 'component' ? item.component : item.title || 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
};

const getStatusCounts = (
  items: UIConformaData[],
): { violations: number; warnings: number; successes: number } => {
  let violations = 0;
  let warnings = 0;
  let successes = 0;
  for (const item of items) {
    if (item.status === CONFORMA_RESULT_STATUS.violations) violations++;
    else if (item.status === CONFORMA_RESULT_STATUS.warnings) warnings++;
    else if (item.status === CONFORMA_RESULT_STATUS.successes) successes++;
  }
  return { violations, warnings, successes };
};

const hasIssues = (items: UIConformaData[]): boolean =>
  items.some(
    (i) =>
      i.status === CONFORMA_RESULT_STATUS.violations ||
      i.status === CONFORMA_RESULT_STATUS.warnings,
  );

const sanitizeTestId = (value: string): string =>
  value.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();

const OUTER_COLUMN_COUNT = 5;

export const PolicyDetailTable: React.FC<PolicyDetailTableProps> = ({ data }) => {
  const [groupBy, setGroupBy] = React.useState<GroupBy>('component');
  const [searchText, setSearchText] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<CONFORMA_RESULT_STATUS[]>([]);
  const [groupByOpen, setGroupByOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  const filteredData = React.useMemo(() => {
    let result = data;
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(lower) ||
          item.component?.toLowerCase().includes(lower) ||
          item.msg?.toLowerCase().includes(lower),
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter((item) => statusFilter.includes(item.status));
    }
    return result;
  }, [data, searchText, statusFilter]);

  const groups = React.useMemo(() => groupData(filteredData, groupBy), [filteredData, groupBy]);

  const initializedGroupsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    let changed = false;
    const next = { ...expandedGroups };
    for (const [key, items] of Object.entries(groups)) {
      if (!initializedGroupsRef.current.has(key)) {
        next[key] = hasIssues(items);
        initializedGroupsRef.current.add(key);
        changed = true;
      }
    }
    if (changed) {
      setExpandedGroups(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const toggleAllGroups = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    for (const key of Object.keys(groups)) {
      next[key] = expand;
    }
    setExpandedGroups(next);
  };

  const toggleStatusFilter = (status: CONFORMA_RESULT_STATUS) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const groupEntries = Object.entries(groups);

  return (
    <div data-test="policy-detail-table">
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder="Search by rule or component..."
              value={searchText}
              onChange={(_e, value) => setSearchText(value)}
              onClear={() => setSearchText('')}
              data-test="policy-search"
            />
          </ToolbarItem>

          <ToolbarItem>
            <Select
              toggle={(toggleRef) => (
                <MenuToggle ref={toggleRef} onClick={() => setGroupByOpen(!groupByOpen)}>
                  Group by: {groupBy === 'component' ? 'Component' : 'Rule'}
                </MenuToggle>
              )}
              onSelect={(_e, value) => {
                setGroupBy(value as GroupBy);
                setGroupByOpen(false);
              }}
              selected={groupBy}
              isOpen={groupByOpen}
              onOpenChange={setGroupByOpen}
              data-test="policy-group-by"
            >
              <SelectList>
                <SelectOption value="component">Component</SelectOption>
                <SelectOption value="rule">Rule</SelectOption>
              </SelectList>
            </Select>
          </ToolbarItem>

          <ToolbarItem>
            <Select
              toggle={(toggleRef) => (
                <MenuToggle ref={toggleRef} onClick={() => setStatusOpen(!statusOpen)}>
                  Status{statusFilter.length > 0 ? ` (${statusFilter.length})` : ''}
                </MenuToggle>
              )}
              onSelect={(_e, value) => toggleStatusFilter(value as CONFORMA_RESULT_STATUS)}
              isOpen={statusOpen}
              onOpenChange={setStatusOpen}
              data-test="policy-status-filter"
            >
              <SelectList>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectOption
                    key={value}
                    value={value}
                    hasCheckbox
                    isSelected={statusFilter.includes(value as CONFORMA_RESULT_STATUS)}
                  >
                    {label}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </ToolbarItem>

          <ToolbarGroup align={{ default: 'alignRight' }}>
            <ToolbarItem>
              <Button variant="link" onClick={() => toggleAllGroups(true)}>
                Expand all
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="link" onClick={() => toggleAllGroups(false)}>
                Collapse all
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="Policy results" variant="compact" isExpandable data-test="policy-outer-table">
        <Thead>
          <Tr>
            <Th screenReaderText="Row expansion" />
            <Th width={40}>{groupBy === 'component' ? 'Component' : 'Rule'}</Th>
            <Th width={15}>Violations</Th>
            <Th width={15}>Warnings</Th>
            <Th width={15}>Successes</Th>
          </Tr>
        </Thead>
        {groupEntries.map(([groupName, items], rowIndex) => {
          const isExpanded = expandedGroups[groupName] ?? false;
          const counts = getStatusCounts(items);
          const testId = sanitizeTestId(groupName);

          return (
            <Tbody key={groupName} isExpanded={isExpanded} data-test={`policy-group-${testId}`}>
              <Tr>
                <Td
                  expand={{
                    rowIndex,
                    isExpanded,
                    onToggle: () =>
                      setExpandedGroups((prev) => ({
                        ...prev,
                        [groupName]: !prev[groupName],
                      })),
                  }}
                />
                <Td dataLabel={groupBy === 'component' ? 'Component' : 'Rule'}>
                  <strong>{groupName}</strong>
                </Td>
                <Td dataLabel="Violations">
                  {counts.violations > 0 ? (
                    <Label color="red" icon={statusIcon(CONFORMA_RESULT_STATUS.violations)}>
                      {counts.violations}
                    </Label>
                  ) : (
                    <span>0</span>
                  )}
                </Td>
                <Td dataLabel="Warnings">
                  {counts.warnings > 0 ? (
                    <Label color="orange" icon={statusIcon(CONFORMA_RESULT_STATUS.warnings)}>
                      {counts.warnings}
                    </Label>
                  ) : (
                    <span>0</span>
                  )}
                </Td>
                <Td dataLabel="Successes">
                  {counts.successes > 0 ? (
                    <Label color="green" icon={statusIcon(CONFORMA_RESULT_STATUS.successes)}>
                      {counts.successes}
                    </Label>
                  ) : (
                    <span>0</span>
                  )}
                </Td>
              </Tr>
              <Tr isExpanded={isExpanded}>
                <Td noPadding colSpan={OUTER_COLUMN_COUNT}>
                  <ExpandableRowContent>
                    <Table
                      variant="compact"
                      aria-label={`Details for ${groupName}`}
                      data-test={`policy-table-${testId}`}
                    >
                      <Thead>
                        <Tr>
                          <Th width={20}>Rule</Th>
                          {groupBy === 'rule' && <Th width={10}>Component</Th>}
                          <Th width={20}>Image</Th>
                          <Th width={10}>Status</Th>
                          <Th>Message</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {items.map((item, idx) => {
                          const key = `${item.component}-${item.title}-${idx}`;
                          const message = item.msg || item.description || '';

                          return (
                            <Tr key={key} data-test={`policy-row-${sanitizeTestId(key)}`}>
                              <Td dataLabel="Rule">
                                <TextContent>
                                  <Text component={TextVariants.p}>
                                    <strong>{item.title || 'Unknown rule'}</strong>
                                  </Text>
                                  {item.description && (
                                    <Text component={TextVariants.small}>{item.description}</Text>
                                  )}
                                </TextContent>
                              </Td>
                              {groupBy === 'rule' && (
                                <Td dataLabel="Component">{item.component}</Td>
                              )}
                              <Td dataLabel="Image">
                                {item.containerImage && (
                                  <code
                                    style={{
                                      fontSize: 'var(--pf-v5-global--FontSize--xs)',
                                      wordBreak: 'break-all',
                                    }}
                                  >
                                    {item.containerImage}
                                  </code>
                                )}
                              </Td>
                              <Td dataLabel="Status">{statusLabel(item.status)}</Td>
                              <Td dataLabel="Message">
                                {message && (
                                  <TextContent>
                                    <Text component={TextVariants.p}>{message}</Text>
                                    {item.solution && (
                                      <Text component={TextVariants.small}>
                                        <strong>Solution:</strong> {item.solution}
                                      </Text>
                                    )}
                                  </TextContent>
                                )}
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          );
        })}
      </Table>
    </div>
  );
};
