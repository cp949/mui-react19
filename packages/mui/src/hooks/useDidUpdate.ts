'use client';

import type { DependencyList, EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

export function useDidUpdate(fn: EffectCallback, dependencies?: DependencyList) {
  const mounted = useRef(false);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  useEffect(() => {
    if (mounted.current) {
      return fn();
    }

    mounted.current = true;
    return undefined;
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- 기존 훅의 의도된 의존성 및 실행 시점 계약을 유지합니다.
  }, dependencies);
}
