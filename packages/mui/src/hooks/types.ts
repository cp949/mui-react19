import type { DependencyList } from 'react';

export interface Observable<T> {
  subscribe: (listener: (value: T) => void) => {
    unsubscribe: () => void;
  };
}

export interface BehaviorSubject<T> extends Observable<T> {
  value: T;
}

export type DependenciesComparator<Deps extends DependencyList = DependencyList> = (
  a: Deps,
  b: Deps,
) => boolean;
