'use client';

import { useEffect, useRef } from 'react';
import { Closables } from '../util/closables.js';

type Callback =
  | ((closable: Closables) => VoidFunction | undefined)
  | ((closable: Closables) => void);

export function useClosableEffect(callback: Callback, deps: unknown[]) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const closables = new Closables();
    const dispose = callbackRef.current(closables);
    return () => {
      if (typeof dispose === 'function') {
        dispose();
      }
      closables.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
