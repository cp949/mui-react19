// copy from mantine
import { useThrottledCallbackWithClearTimeout } from './useThrottledCallbackWithClearTimeout.js';

/**
 * 주어진 콜백 함수를 지정된 시간 간격(`wait`)으로 호출하도록 제한하는 간단한 쓰로틀링 React 훅.
 *
 * 내부적으로 `useThrottledCallbackWithClearTimeout`을 사용하며, 타이머 정리 기능 없이 쓰로틀링된 콜백 함수만 반환합니다.
 *
 * @template T - 콜백 함수의 타입.
 * @param callback - 쓰로틀링할 콜백 함수.
 * @param wait - 호출 간격(밀리초 단위).
 * @returns 쓰로틀링된 콜백 함수.
 *
 * @example
 * ```tsx
 * const throttledClick = useThrottledCallback(() => {
 *   console.log("클릭!");
 * }, 1000);
 *
 * return <button onClick={throttledClick}>클릭</button>;
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T, // 쓰로틀링할 콜백 함수
  wait: number, // 호출 간격 (밀리초 단위)
) {
  // `useThrottledCallbackWithClearTimeout` 훅을 사용하여 쓰로틀링된 콜백을 생성
  // 반환값 중 첫 번째 요소(쓰로틀링된 콜백 함수)만 반환
  return useThrottledCallbackWithClearTimeout(callback, wait)[0];
}
