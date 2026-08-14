import { type DependencyList, useMemo, useRef } from 'react';
import type { DependenciesComparator } from './types.js';

/**
 * Like useMemo but uses provided comparator function to validate dependency changes.
 *
 * @param factory useMemo factory function
 * @param deps useMemo dependency list
 * @param comparator function to validate dependency changes
 * @returns useMemo result
 */
export const useCustomCompareMemo = <T, Deps extends DependencyList>(
  factory: () => T,
  deps: Deps,
  comparator: DependenciesComparator<Deps>,
): T => {
  const dependencies = useRef<Deps | undefined>(undefined);

  if (dependencies.current === undefined || !comparator(dependencies.current, deps)) {
    dependencies.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // biome-ignore lint/correctness/useExhaustiveDependencies: 기존 훅의 의도된 의존성 및 실행 시점 계약을 유지합니다.
  return useMemo<T>(factory, dependencies.current);
};
