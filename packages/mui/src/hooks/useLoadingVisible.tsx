import { useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject, distinctUntilChanged, map, switchMap, tap, timer } from 'rxjs';

/**
 * 로딩 지연 훅
 * 용도: 예를 들어, 100ms내로 작업이 빠르게 완료되는 경우
 * 로딩중 UI를 표시 않는 것이 나을 수 있습니다.
 * 그래서 postponeTime을 통해, 로딩중 UI표시를 지연시킬 시간을
 * 설정합니다.
 *
 * 예시1) postponeTime=100ms이고, 작업시간이 1000ms인 경우
 * 900ms동안만 로딩중 UI가 표시됩니다.
 * 예시2) postponeTime=100ms이고, 작업시간이 150ms인 경우
 * 50ms동안만 로딩중 UI가 표시됩니다.
 *
 * 예시2의 50ms는 너무 짧아서 로딩중 UI가 제대로 표시되지 못할 것입니다.
 * 짧게라도 반드시 로딩중 UI를 반드시 표시하고 싶다면,
 * minVisibleTime을 설정할 수 있습니다.
 *
 * postponeTime=200ms, minVisibleTime=300ms를 설정하였고
 * 작업시간은 400ms라고 가정하면,
 * setLoading(true)를 호출하면, 아래와 같은 타임라인으로 동작합니다.
 *   0ms: setLoading(true) 호출
 * 200ms: 로딩중 UI 표시
 * 400ms: 작업이 완료하여 setLoading(false)를 호출, false지만 로딩중 UI는 표시됨
 * 500ms: 로딩중 UI 감춤
 */

interface Options {
  minVisibleTime?: number;
  postponeTime?: number;
}

export function useLoadingVisible(paramLoading: boolean, opts?: Options): boolean {
  const { postponeTime = 300, minVisibleTime = 500 } = opts ?? {};
  const postponeTimeRef = useRef(postponeTime);
  const minVisibleTimeRef = useRef(minVisibleTime);
  const [loadingVisible, setLoadingVisible] = useState(paramLoading);
  const loadingTime$ = useMemo(() => new BehaviorSubject(0), []);

  useEffect(() => {
    loadingTime$.next(paramLoading ? Date.now() : 0);
  }, [paramLoading, loadingTime$]);

  useEffect(() => {
    let visibleStartTime = 0;
    const s1 = loadingTime$
      .pipe(
        distinctUntilChanged(),
        switchMap((loadingTime) => {
          if (loadingTime > 0) {
            // 지연후에 loadingVisible=true
            return timer(postponeTimeRef.current).pipe(
              tap(() => {
                visibleStartTime = Date.now();
              }),
              map(() => true),
            );
          }
          const diff = Date.now() - visibleStartTime;
          const delayAmount = minVisibleTimeRef.current - diff;
          // 지연후에 loadingVisible=false
          return timer(delayAmount > 0 ? delayAmount : 0).pipe(
            tap(() => {
              visibleStartTime = 0;
            }),
            map(() => false),
          );
        }),
      )
      .subscribe(setLoadingVisible);
    return () => {
      s1.unsubscribe();
    };
  }, [loadingTime$]);

  return loadingVisible;
}
