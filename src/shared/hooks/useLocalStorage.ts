import React from 'react';
import { useEventListener } from './useEventListener';

const tryJSONParse = <T = unknown>(data: string | null): T | string | undefined => {
  if (data === null) return undefined;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

/**
 * Local storage value and setter for `key`.
 * NOTE: This hook will not update it's value if the same key has been set elsewhere in the current tab.
 *
 * @returns [value, setter, remover] — JSON value if parseable, or else `string`.
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue?: T,
): [T | string, React.Dispatch<T>, () => void] => {
  const [value, setValue] = React.useState<T | string | undefined>(() => {
    const stored = tryJSONParse<T>(window.localStorage.getItem(key));
    return stored !== undefined ? stored : initialValue;
  });

  useEventListener(
    'storage',
    () => {
      const stored = tryJSONParse<T>(window.localStorage.getItem(key));
      setValue(stored !== undefined ? stored : initialValue);
    },
    window,
  );

  const updateValue = React.useCallback(
    (val: T | ((prev: T | string | undefined) => T)) => {
      const newVal = typeof val === 'function' ? (val as (prev: T | string | undefined) => T)(value) : val;
      const serializedValue = typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal);
      window.localStorage.setItem(key, serializedValue);
      setValue(newVal);
    },
    [key, value],
  );

  const removeValue = React.useCallback(() => {
    window.localStorage.removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value as T | string, updateValue, removeValue];
};
