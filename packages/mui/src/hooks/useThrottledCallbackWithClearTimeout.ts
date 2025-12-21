// copy from mantine
import { useCallback, useEffect, useRef } from 'react';
import { useCallbackRef } from './useCallbackRef.js';

/**
 * 주어진 콜백 함수를 지정된 시간 간격(`wait`)으로 호출하는 커스텀 React 훅.
 *
 * 이 훅은 마지막 호출 이후 일정 시간이 지나야 콜백이 다시 호출되도록 제한합니다(Throttle).
 * 또한 타이머를 수동으로 정리할 수 있는 기능을 제공합니다.
 *
 * @template T - 콜백 함수의 타입.
 * @param callback - 쓰로틀링할 콜백 함수.
 * @param wait - 호출 간격(밀리초 단위).
 * @returns 배열 형태의 반환값:
 * - `throttled`: 쓰로틀링된 콜백 함수.
 * - `clearTimeout`: 현재 실행 중인 타이머를 취소하는 함수.
 *
 * @example
 * ```tsx
 * const [throttledClick, clearThrottle] = useThrottledCallbackWithClearTimeout(() => {
 *   console.log("클릭!");
 * }, 1000);
 *
 * return (
 *   <button onClick={throttledClick}>클릭</button>
 *   <button onClick={clearThrottle}>쓰로틀링 취소</button>
 * );
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallbackWithClearTimeout<T extends (...args: any[]) => any>(
  callback: T, // 쓰로틀링할 콜백 함수
  wait: number, // 호출 간격(밀리초 단위)
) {
  // 최신 콜백 함수를 안전하게 참조하기 위해 useCallbackRef 사용
  const handleCallback = useCallbackRef(callback);

  // 마지막으로 입력된 인자를 저장하는 ref
  const latestInArgsRef = useRef<Parameters<T> | undefined>(undefined);

  // 마지막으로 실행된 인자를 저장하는 ref
  const latestOutArgsRef = useRef<Parameters<T> | undefined>(undefined);

  // 쓰로틀링 상태를 추적하는 ref
  const active = useRef(true);

  // 호출 간격을 저장하는 ref
  const waitRef = useRef(wait);

  // 타이머 ID를 저장하는 ref
  const timeoutRef = useRef<number>(-1);

  // 현재 타이머를 정리하는 함수
  const clearTimeout = () => window.clearTimeout(timeoutRef.current);

  // 쓰로틀링된 콜백을 호출하는 함수
  const callThrottledCallback = useCallback(
    (...args: Parameters<T>) => {
      handleCallback(...args); // 최신 콜백 호출
      latestInArgsRef.current = args; // 마지막 입력 인자 업데이트
      latestOutArgsRef.current = args; // 마지막 출력 인자 업데이트
      active.current = false; // 쓰로틀링 상태 비활성화
    },
    [handleCallback],
  );

  // 타이머가 동작하는 동안 실행되는 콜백
  const timerCallback = useCallback(
    function timerCallbackImpl() {
      if (latestInArgsRef.current && latestInArgsRef.current !== latestOutArgsRef.current) {
        callThrottledCallback(...latestInArgsRef.current); // 새로운 인자 기반으로 콜백 호출
        timeoutRef.current = window.setTimeout(timerCallbackImpl, waitRef.current); // 다음 타이머 설정
      } else {
        active.current = true; // 쓰로틀링 상태 활성화
      }
    },
    [callThrottledCallback],
  );

  // 쓰로틀링된 콜백 함수
  const throttled = useCallback(
    (...args: Parameters<T>) => {
      if (active.current) {
        // 활성 상태일 경우 콜백 즉시 호출
        callThrottledCallback(...args);
        // 쓰로틀링 타이머 설정
        timeoutRef.current = window.setTimeout(timerCallback, waitRef.current);
      } else {
        // 활성 상태가 아니면 마지막 입력 인자만 업데이트
        latestInArgsRef.current = args;
      }
    },
    [callThrottledCallback, timerCallback],
  );

  // `wait` 값이 변경될 때마다 ref에 업데이트
  useEffect(() => {
    waitRef.current = wait;
  }, [wait]);

  // 쓰로틀링된 콜백과 타이머 정리 함수를 반환
  return [throttled, clearTimeout] as const;
}
