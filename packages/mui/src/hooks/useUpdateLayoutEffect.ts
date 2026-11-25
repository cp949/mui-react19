'use client';

import type { DependencyList, EffectCallback } from 'react';
import { useLayoutEffect, useRef } from 'react';

export const useUpdateLayoutEffect = (effect: EffectCallback, deps?: DependencyList) => {
  const isMounted = useRef(false);

  useLayoutEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- 기존 훅의 의도된 의존성 및 실행 시점 계약을 유지합니다.
  }, deps);
};
