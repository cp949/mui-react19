import { useMemo, useState } from 'react';
import type { Observable } from './types.js';
import { useIsomorphicEffect } from './useIsomorphicEffect.js';

type Fn<T> = () => T;

function useObservable<T>(
  observable: null | undefined | Observable<T> | (() => Observable<T>),
): T | undefined;

function useObservable<T>(
  observable: null | undefined | Observable<T> | (() => Observable<T>),
  initialValue: T,
): T;

function useObservable<T>(
  observable: null | undefined | Observable<T> | Fn<Observable<T>>,
  initialValue?: T,
): T | undefined {
  const observable$ = useMemo(
    () => (typeof observable === 'function' ? observable() : observable),
    [observable],
  );

  const [value, setValue] = useState<T | undefined>(initialValue);

  useIsomorphicEffect(() => {
    if (!observable$) {
      return;
    }
    const s = observable$.subscribe(setValue);
    return () => {
      s.unsubscribe();
    };
  }, [observable$]);

  return observable$ ? value : undefined;
}

export default useObservable;
