import { useMemo, useState } from 'react';
import type { BehaviorSubject } from './types.js';
import { useIsomorphicEffect } from './useIsomorphicEffect.js';

type Fn<T> = () => T;

export function useBehaviorSubject<TItem>(
  subject: BehaviorSubject<TItem> | Fn<BehaviorSubject<TItem>>,
): TItem {
  const subject$ = useMemo(() => (typeof subject === 'function' ? subject() : subject), [subject]);
  const [value, setValue] = useState<TItem>(subject$.value);

  useIsomorphicEffect(() => {
    const s = subject$.subscribe(setValue);
    return () => {
      s.unsubscribe();
    };
  }, [subject$]);

  return value;
}
