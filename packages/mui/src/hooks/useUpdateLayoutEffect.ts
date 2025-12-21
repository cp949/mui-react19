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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
