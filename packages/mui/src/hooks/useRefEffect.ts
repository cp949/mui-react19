import { type DependencyList, useCallback, useRef } from 'react';

import { useCallbackRef } from './useCallbackRef.js';

export type CleanupCallback = () => void;

/**
 * DOM ref가 연결되거나 변경될 때 콜백을 실행하고, 이전 요소에 대한 정리 함수를 자동으로 호출하는 훅입니다.
 *
 * @template RefElement - ref로 연결할 HTML 요소 타입. 기본값은 `HTMLElement`입니다.
 * @param callback - 요소가 연결될 때 실행할 함수. 정리 함수가 필요하면 반환할 수 있습니다.
 * @param deps - ref 콜백을 다시 생성할 의존성 목록입니다.
 * @returns React `ref` prop에 전달할 수 있는 콜백 ref 함수입니다.
 *
 * @example
 * ```tsx
 * const ref = useRefEffect<HTMLDivElement>((element) => {
 *   console.log('mounted', element);
 *
 *   return () => {
 *     console.log('unmounted', element);
 *   };
 * }, []);
 *
 * return <div ref={ref} />;
 * ```
 */
export function useRefEffect<RefElement extends HTMLElement = HTMLElement>(
  callback: (element: RefElement) => CleanupCallback | void,
  deps: DependencyList,
): (element: RefElement | null) => void {
  const stableCallback = useCallbackRef(callback);
  const cleanupCallbackRef = useRef<CleanupCallback>(() => {});

  return useCallback(
    (element: RefElement | null) => {
      cleanupCallbackRef.current();
      cleanupCallbackRef.current = () => {};

      if (element == null) {
        return;
      }

      const cleanup = stableCallback(element);

      if (typeof cleanup === 'function') {
        cleanupCallbackRef.current = cleanup;
      }
    },
    [stableCallback, ...deps],
  );
}
