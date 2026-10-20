'use client';

// copy from mantine
import { useEffect, useRef, useState } from 'react';

export interface UseClipboardOptions {
  /**
   * `copied`, `failed` 상태가 유지되는 시간(밀리초)입니다. 기본값은 1000ms입니다.
   *
   * @default 1000
   */
  timeout?: number;

  /**
   * 복사에 실패했을 때 호출되는 콜백입니다.
   * 시도마다 자기 `value`로 호출되며, 더 새로운 시도가 있어도 이전 시도의 실패는 그대로 전달됩니다.
   *
   * @param error - 실패 원인
   * @param value - 복사하려던 문자열
   */
  onError?: (error: Error, value: string) => void;
}

const toError = (cause: unknown): Error =>
  cause instanceof Error ? cause : new Error(String(cause));

/**
 * 클립보드 복사 기능을 제공하는 React 훅입니다.
 *
 * @param options - 옵션 객체입니다.
 * @param options.timeout - `copied`, `failed` 상태가 유지되는 시간(밀리초)입니다. 기본값은 1000ms입니다.
 * @param options.onError - 복사에 실패했을 때 오류와 값을 인자로 호출되는 콜백입니다.
 * @returns
 * - `copy`: 문자열을 클립보드에 복사하고 성공 여부를 반환하는 함수
 * - `reset`: 상태를 초기화하는 함수
 * - `fail`: 클립보드를 거치지 않고 실패 상태를 직접 기록하는 함수. 복사할 값을 만들지 못한 경우에 사용합니다.
 * - `error`: 가장 최근 시도에서 발생한 오류. 새 시도가 시작되면 비워집니다.
 * - `copied`: 가장 최근 시도가 성공했는지 여부
 * - `failed`: 가장 최근 시도가 실패했는지 여부. `copied`와 동시에 켜지지 않습니다.
 *
 * @remarks
 * 여러 번 연속으로 `copy`를 호출하면 마지막 시도가 `copied`, `failed`, `error`를 정합니다.
 * 먼저 시작한 시도가 나중에 끝나도 상태를 덮어쓰지 않습니다.
 *
 * @example
 * ```tsx
 * const { copy, reset, error, copied, failed } = useClipboard({ timeout: 3000 });
 *
 * return (
 *   <div>
 *     <button onClick={() => copy('복사할 내용')}>복사</button>
 *     {copied && <span>복사되었습니다!</span>}
 *     {failed && <span>복사 실패: {error?.message}</span>}
 *     <button onClick={reset}>초기화</button>
 *   </div>
 * );
 * ```
 */
export function useClipboard({ timeout = 1000, onError }: UseClipboardOptions = {}) {
  const [error, setError] = useState<Error | null>(null); // 가장 최근 시도에서 발생한 오류 상태
  const [copied, setCopied] = useState(false); // 가장 최근 시도가 성공했는지 여부
  const [failed, setFailed] = useState(false); // 가장 최근 시도가 실패했는지 여부
  const timerRef = useRef<number | null>(null); // copied/failed 해제 타이머 ID
  const attemptRef = useRef(0); // 시도 번호. 마지막 시도만 상태를 정하게 한다

  // 언마운트되면 타이머를 정리하고 진행 중인 시도의 상태 반영을 막는다
  useEffect(
    () => () => {
      attemptRef.current += 1;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    [],
  );

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // 새 시도를 시작한다. 이전 상태와 타이머를 비우고 시도 번호를 반환한다.
  const beginAttempt = () => {
    attemptRef.current += 1;
    clearTimer();
    setCopied(false);
    setFailed(false);
    setError(null);
    return attemptRef.current;
  };

  // copied/failed를 timeout 뒤에 끈다. error는 다음 시도나 reset까지 남긴다.
  const scheduleStateOff = () => {
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setCopied(false);
      setFailed(false);
    }, timeout);
  };

  // 마지막 시도일 때만 실패 상태를 반영한다
  const settleFailure = (attempt: number, cause: Error) => {
    if (attempt !== attemptRef.current) return;
    setError(cause);
    setFailed(true);
    scheduleStateOff();
  };

  /**
   * 클립보드에 문자열을 복사합니다.
   *
   * @param valueToCopy - 복사할 문자열
   * @returns 이 시도의 성공 여부. 더 새로운 시도가 있어도 이 시도의 결과를 그대로 반환합니다.
   */
  const copy = async (valueToCopy: string) => {
    const attempt = beginAttempt();

    const handleFailure = (cause: unknown) => {
      const failure = toError(cause);
      settleFailure(attempt, failure);
      onError?.(failure, valueToCopy);
      return false;
    };

    // 브라우저가 clipboard API를 지원하지 않을 경우 오류 처리
    if (!('clipboard' in navigator)) {
      return handleFailure(new Error('useClipboard: navigator.clipboard is not supported'));
    }

    try {
      // writeText가 동기로 던져도 같은 경로로 처리한다
      await navigator.clipboard.writeText(valueToCopy);
    } catch (err) {
      return handleFailure(err);
    }

    if (attempt === attemptRef.current) {
      setCopied(true);
      scheduleStateOff();
    }
    return true;
  };

  /**
   * 복사 시도 없이 실패 상태를 기록합니다. `onError`는 호출하지 않습니다.
   *
   * @param cause - 실패 원인
   */
  const fail = (cause: unknown) => {
    settleFailure(beginAttempt(), toError(cause));
  };

  /**
   * 복사 상태와 오류를 초기화합니다.
   */
  const reset = () => {
    setCopied(false); // 복사 상태 초기화
    setFailed(false); // 실패 상태 초기화
    setError(null); // 오류 초기화
    clearTimer(); // 기존 타이머 초기화
  };

  // 훅에서 반환되는 값
  return { copy, reset, fail, error, copied, failed };
}
