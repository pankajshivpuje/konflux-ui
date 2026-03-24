import * as React from 'react';
import { RoleBinding } from '../../types';

export type RBSelectionCustomData = {
  isSelected: (name: string) => boolean;
  toggleSelection: (name: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
};

export const useRBSelection = (roleBindings: RoleBinding[]) => {
  const [selectedNames, setSelectedNames] = React.useState<Set<string>>(new Set());

  const selectableNames = React.useMemo(
    () =>
      roleBindings
        .filter((rb) => rb.subjects?.some((s) => s.kind === 'User'))
        .map((rb) => rb.metadata.name),
    [roleBindings],
  );

  const selectedCount = selectedNames.size;
  const isAllSelected = selectableNames.length > 0 && selectableNames.every((n) => selectedNames.has(n));
  const isSomeSelected = selectedCount > 0 && !isAllSelected;

  const isSelected = React.useCallback((name: string) => selectedNames.has(name), [selectedNames]);

  const toggleSelection = React.useCallback((name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const selectAll = React.useCallback(() => {
    setSelectedNames(new Set(selectableNames));
  }, [selectableNames]);

  const clearSelection = React.useCallback(() => {
    setSelectedNames(new Set());
  }, []);

  const selectedRoleBindings = React.useMemo(
    () => roleBindings.filter((rb) => selectedNames.has(rb.metadata.name)),
    [roleBindings, selectedNames],
  );

  return {
    selectedNames,
    selectedCount,
    selectedRoleBindings,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  };
};
