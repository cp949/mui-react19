import { useRef } from 'react';
import { useIsomorphicEffect } from './useIsomorphicEffect.js';

export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useIsomorphicEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
