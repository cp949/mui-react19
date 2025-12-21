'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EventEmitter } from '../eventemitter/eventemitter3.js';
import { useLocalStorage } from './useLocalStorage.js';

type SetStateFn<T> = (value: T | undefined) => void;

type GetFn<T> = () => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const emitters: Record<string, EventEmitter<any>> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getOrCreateEmitter = (key: string): EventEmitter<any> => {
  const instance = emitters[key];
  if (instance) {
    return instance;
  }
  emitters[key] = new EventEmitter();
  return emitters[key];
};

function getDefaultValue<T>(value: T | GetFn<T>): T {
  if (typeof value === 'function') {
    return (value as () => T)();
  }
  return value;
}

export function useObservableLocalStorage<T>(
  key: string,
  initialValue: T | GetFn<T>,
): [T, SetStateFn<T | null>] {
  const [defaultValue] = useState<T>(() => getDefaultValue(initialValue));
  const [value, setValue, removeValue] = useLocalStorage<T | null>(key, defaultValue);
  const emitter = useMemo(() => getOrCreateEmitter(key), [key]);

  const setValueAndNotify = useCallback(
    (next: T | null | undefined) => {
      emitter.emit(key, next ?? null);
    },
    [emitter, key],
  );

  useEffect(() => {
    const onChange = (next: T | null) => {
      if (typeof next === 'undefined' || next === null) {
        removeValue();
        return;
      }
      setValue(next);
    };
    emitter.on(key, onChange);
    return () => {
      emitter.off(key, onChange);
    };
  }, [key, emitter, removeValue, setValue]);

  return [value ?? defaultValue, setValueAndNotify];
}
