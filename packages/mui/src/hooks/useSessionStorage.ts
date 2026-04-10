import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { isBrowser, noop } from '../util/misc-utils.js';
import { useIsomorphicEffect } from './useIsomorphicEffect.js';

type parserOptions<T> =
  | {
      raw: true;
    }
  | {
      raw: false;
      serializer: (value: T) => string;
      deserializer: (value: string) => T;
    };

/**
 * Persist state in sessionStorage.
 *
 * Returns `[value, setValue, removeValue]`.
 * - `setValue(next)` writes to sessionStorage and updates state.
 * - `removeValue()` removes the key from sessionStorage and resets state to `undefined`.
 *
 * On SSR/non-browser environments the hook returns `initialValue` and the setter/remove are no-ops.
 */
export const useSessionStorage = <T>(
  key: string,
  initialValue?: T,
  options?: parserOptions<T>,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => void] => {
  if (!key) {
    throw new Error('useSessionStorage key may not be falsy');
  }

  const storage: Storage | undefined = isBrowser ? window.sessionStorage : undefined;

  const deserializer = useMemo<(value: string) => T>(() => {
    if (!options) return JSON.parse as unknown as (value: string) => T;
    if (options.raw) return ((value: string) => value as unknown as T) as (value: string) => T;
    return options.deserializer;
  }, [options]);

  const serializer = useMemo<(value: T) => string>(() => {
    if (!options) return JSON.stringify as unknown as (value: T) => string;
    if (options.raw) return ((value: T) => String(value)) as (value: T) => string;
    return options.serializer;
  }, [options]);

  const readFromStorage = useCallback(
    (storageKey: string): T | undefined => {
      if (!storage) return initialValue;
      try {
        const stored = storage.getItem(storageKey);
        if (stored !== null) return deserializer(stored);

        // if missing, seed with initialValue (including falsy values)
        if (typeof initialValue !== 'undefined') {
          storage.setItem(storageKey, serializer(initialValue));
        }
        return initialValue;
      } catch {
        // private mode / restricted storage / serializer/deserializer failures
        return initialValue;
      }
    },
    [deserializer, initialValue, serializer, storage],
  );

  const writeToStorage = useCallback(
    (storageKey: string, next: T | undefined): T | undefined => {
      if (!storage) return next;
      if (typeof next === 'undefined') return next;
      try {
        const raw = serializer(next);
        storage.setItem(storageKey, raw);
        return deserializer(raw);
      } catch {
        return next;
      }
    },
    [deserializer, serializer, storage],
  );

  const removeFromStorage = useCallback(
    (storageKey: string) => {
      if (!storage) return;
      try {
        storage.removeItem(storageKey);
      } catch {
        // ignore
      }
    },
    [storage],
  );

  const [state, setState] = useState<T | undefined>(() => readFromStorage(key));

  useIsomorphicEffect(() => {
    setState(readFromStorage(key));
  }, [key, readFromStorage]);

  const set: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (valOrFunc) => {
      setState((prev) => {
        const next =
          typeof valOrFunc === 'function'
            ? (valOrFunc as (prev: T | undefined) => T | undefined)(prev)
            : valOrFunc;
        return writeToStorage(key, next);
      });
    },
    [key, writeToStorage],
  );

  const remove = useCallback(() => {
    if (!storage) {
      setState(undefined);
      return;
    }
    try {
      removeFromStorage(key);
      setState(undefined);
    } catch {
      // ignore
    }
  }, [key, removeFromStorage, storage]);

  return isBrowser ? [state, set, remove] : [initialValue as T, noop, noop];
};
