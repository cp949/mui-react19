import { useEffect } from 'react';
import { useLatest } from './useLatest.js';

export const useUnmount = (fn: () => void) => {
  const fnRef = useLatest(fn);
  useEffect(
    () => () => {
      fnRef.current();
    },
    [fnRef],
  );
};
