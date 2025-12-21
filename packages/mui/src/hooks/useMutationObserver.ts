import { useEffect, useRef } from 'react';
import { useDeepCompareMemo } from './useDeepCompareMemo.js';

/**
 * DOM의 변화를 감지하고 콜백을 실행하는 React 훅
 *
 * @template T - 감시 대상 HTMLElement의 타입 (기본값은 `any`)
 * @param callback - DOM 변경을 감지했을 때 호출되는 MutationCallback
 * @param options - MutationObserver를 초기화할 때 사용하는 옵션 (MutationObserverInit 객체)
 * @param target - 감시할 대상 요소 또는 해당 요소를 반환하는 함수 (선택적, 기본값은 `ref`를 사용)
 * @returns `ref` - DOM 요소에 바인딩할 수 있는 React Ref 객체
 *
 * @example
 * ```tsx
 * const App = () => {
 *   const callback = (mutations: MutationRecord[]) => {
 *     mutations.forEach(mutation => {
 *       console.log(mutation);
 *     });
 *   };
 *
 *   const ref = useMutationObserver<HTMLDivElement>(callback, { childList: true });
 *
 *   return <div ref={ref}>감시 대상 요소</div>;
 * };
 * ```
 */
export function useMutationObserver<T extends HTMLElement = HTMLElement>(
  callback: MutationCallback,
  options: MutationObserverInit,
  target?: HTMLElement | (() => HTMLElement) | null,
): React.RefObject<T | null> {
  const observer = useRef<MutationObserver | null>(null);
  const ref = useRef<T | null>(null);
  const initOptions = useDeepCompareMemo(() => options, [options]);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    // target이 함수라면 실행하여 요소를 가져옴
    const targetElement = typeof target === 'function' ? target() : target;

    // target이 제공되거나 ref가 연결되어 있으면 MutationObserver를 생성하고 감시 시작
    if (targetElement || ref.current) {
      const onCallback: MutationCallback = (...args) => {
        callbackRef.current(...args);
      };

      observer.current = new MutationObserver(onCallback);
      observer.current.observe(targetElement || ref.current!, initOptions);
    }

    // 컴포넌트가 언마운트되거나 의존성이 변경되면 Observer 해제
    return () => {
      observer.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initOptions]);

  // DOM 요소를 바인딩할 수 있는 ref를 반환
  return ref;
}
