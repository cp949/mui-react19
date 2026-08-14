import { useEffect, useMemo } from 'react';
import { debounce } from '../misc/debounce.js';
import { useLatest } from './useLatest.js';

interface UseDebouncedCallbackOptions {
  leading?: boolean; // 첫 호출 시 즉시 실행 여부
  trailing?: boolean; // 마지막 호출 후 대기 시간 이후 실행 여부
}

/**
 * useDebouncedCallback
 *
 * 디바운싱된 콜백 함수를 반환하는 React 훅
 *
 * @param callback - 디바운스 처리할 콜백 함수
 * @param wait - 디바운스 대기 시간(ms)
 * @param options - leading, trailing 설정
 *
 * @returns 디바운스된 콜백과 취소 함수가 포함된 객체
 *
 * @example
 * ```tsx
 * const debouncedUpdate = useDebouncedCallback(
 *   () => {
 *     console.log("Debounced!");
 *   },
 *   200,
 *   { leading: true, trailing: false }
 * );
 *
 * // 호출
 * debouncedUpdate(); // 즉시 실행
 * debouncedUpdate(); // 무시됨
 *
 * // 취소
 * debouncedUpdate.cancel();
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  wait: number,
  options: UseDebouncedCallbackOptions = {},
): T & { cancel: () => void } {
  const { leading = false, trailing = true } = options;

  // 항상 최신 콜백을 참조하도록 ref로 감싼다.
  const callbackRef = useLatest(callback);

  // wait/leading/trailing이 바뀔 때만 디바운스 인스턴스를 새로 만든다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: 기존 훅의 의도된 의존성 및 실행 시점 계약을 유지합니다.
  const debounced = useMemo(
    () =>
      debounce(
        (...args: Parameters<T>) => {
          callbackRef.current(...args);
        },
        wait,
        { leading, trailing },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wait, leading, trailing],
  );

  // 인스턴스가 교체되거나 컴포넌트가 언마운트될 때 예약된 타이머를 정리한다.
  useEffect(() => debounced.cancel, [debounced]);

  return debounced as unknown as T & { cancel: () => void };
}
