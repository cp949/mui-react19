import React, { useState } from 'react';
import { useIsomorphicEffect } from './useIsomorphicEffect.js';

const __useId: () => string | undefined =
  (React as unknown as Record<string, () => string | undefined>)['useId'.toString()] ||
  (() => undefined);

function useReactId() {
  const id = __useId();
  return id ? `mantine-${id.replace(/:/g, '')}` : '';
}

function randomId(prefix = 'rand-'): string {
  return `${prefix}${Math.random().toString(36).slice(2, 11)}`;
}

export function useId(staticId?: string) {
  const reactId = useReactId();
  const [uuid, setUuid] = useState(reactId);

  useIsomorphicEffect(() => {
    setUuid(randomId());
  }, []);

  if (typeof staticId === 'string') {
    return staticId;
  }

  if (typeof window === 'undefined') {
    return reactId;
  }

  return uuid;
}
