'use client';

import { useEffect } from 'react';
import { Closables } from '../util/closables.js';
import { useLatest } from './useLatest.js';

type Callback =
  | ((closable: Closables) => VoidFunction | undefined)
  | ((closable: Closables) => void);

export function useClosableEffect(callback: Callback, deps: unknown[]) {
  const callbackRef = useLatest(callback);

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
    // biome-ignore lint/correctness/useExhaustiveDependencies: 기존 훅의 의도된 의존성 및 실행 시점 계약을 유지합니다.
  }, deps);
}
