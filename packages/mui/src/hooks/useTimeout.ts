// copy from mantine
import { useCallback, useEffect, useRef } from 'react';

/**
 * 특정 작업을 일정 시간 후 실행할 수 있는 타이머 훅
 *
 * 이 훅은 `setTimeout`과 `clearTimeout`을 관리하는 기능을 캡슐화하여, 타이머를 쉽게 시작하거나 정리할 수 있게 합니다.
 * 옵션에 따라 자동 실행(`autoInvoke`)도 지원합니다.
 *
 * @param callback - 지연 시간이 지난 후 실행할 함수.
 * @param delay - 타이머 지연 시간(밀리초).
 * @param options - 타이머 동작 방식을 설정하는 옵션 객체. 기본값은 `{ autoInvoke: false }`.
 * - `autoInvoke`: `true`일 경우, 컴포넌트가 마운트될 때 타이머가 자동으로 시작됩니다.
 *
 * @returns 객체 형태의 반환값:
 * - `start`: 타이머를 시작하는 함수.
 * - `clear`: 타이머를 취소하는 함수.
 *
 * @example
 * ```tsx
 * const { start, clear } = useTimeout(() => {
 *   console.log("5초 후 실행");
 * }, 5000, { autoInvoke: true });
 *
 * return (
 *   <button onClick={start}>타이머 시작</button>
 *   <button onClick={clear}>타이머 정리</button>
 * );
 * ```
 */
export function useTimeout(
  callback: (...callbackParams: unknown[]) => void, // 지연 시간이 지난 후 실행할 함수
  delay: number, // 타이머 지연 시간 (밀리초)
  options: { autoInvoke: boolean } = { autoInvoke: false }, // 옵션: 자동 실행 여부
) {
  // 타이머 ID를 저장하는 ref
  const timeoutRef = useRef<number | null>(null);

  /**
   * 타이머를 시작하는 함수
   * - `callback`을 `delay` 이후 실행
   * - 이미 실행 중인 타이머가 있다면 새로 시작하지 않음
   */
  const start = useCallback(
    (...callbackParams: unknown[]) => {
      if (!timeoutRef.current) {
        timeoutRef.current = window.setTimeout(() => {
          // 지정된 콜백 실행
          callback(callbackParams);

          // 실행 완료 후 타이머 ID 초기화
          timeoutRef.current = null;
        }, delay);
      }
    },
    [delay, callback], // `delay`와 `callback` 변경 시 새로운 함수 생성
  );

  /**
   * 타이머를 정리하는 함수
   * - 현재 실행 중인 타이머를 취소
   * - `timeoutRef`를 초기화
   */
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current); // 타이머 취소
      timeoutRef.current = null; // 초기화
    }
  }, []);

  /**
   * `autoInvoke` 옵션에 따라 컴포넌트가 마운트될 때 타이머를 자동으로 시작
   * - 언마운트 시 타이머 정리
   */
  useEffect(() => {
    if (options.autoInvoke) {
      start(); // 자동으로 타이머 시작
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return clear;
  }, [clear, start, options.autoInvoke]);

  // 타이머를 시작하거나 정리할 수 있는 함수 반환
  return { start, clear };
}
