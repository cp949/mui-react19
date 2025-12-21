import { useRef, useEffect, useCallback, useMemo } from 'react';

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

  // 디바운스 타이머 ID를 저장하는 ref
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마지막으로 전달된 인자를 저장하는 ref
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  // leading 호출이 이미 실행되었는지 여부를 기록하는 ref
  const leadingCalledRef = useRef(false);

  // 디바운싱된 콜백 함수
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // 마지막 인자를 업데이트
      lastArgsRef.current = args;

      // 콜백을 호출하는 내부 함수
      const invoke = () => {
        if ((trailing || (leading && !leadingCalledRef.current)) && lastArgsRef.current) {
          callback(...lastArgsRef.current); // 콜백 실행
        }
        leadingCalledRef.current = false; // 호출 상태 초기화
      };

      // 기존 타이머 제거
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      // leading 옵션에 따라 즉시 실행
      if (leading && !leadingCalledRef.current) {
        callback(...args); // 즉시 콜백 호출
        leadingCalledRef.current = true; // 호출 기록
      }

      // 대기 시간이 끝난 후 콜백 실행
      timeoutRef.current = setTimeout(() => {
        invoke(); // 마지막 콜백 실행
        timeoutRef.current = null; // 타이머 초기화
      }, wait);
    },
    [callback, leading, trailing, wait],
  );

  // 디바운스 타이머를 취소하는 함수
  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current); // 타이머 제거
      timeoutRef.current = null;
    }
    leadingCalledRef.current = false; // 호출 상태 초기화
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cancel(); // 타이머 정리
    };
  }, [cancel]);

  // 디바운스된 콜백과 cancel을 함께 반환
  // - 함수 객체를 직접 mutate 하지 않기 위해(cancel 프로퍼티 대입 금지) Proxy로 cancel을 노출합니다.
  return useMemo(() => {
    // eslint-disable-next-line react-hooks/refs
    return new Proxy(debouncedCallback as T, {
      get(target, prop, receiver) {
        if (prop === 'cancel') return cancel;
        return Reflect.get(target, prop, receiver);
      },
    }) as T & { cancel: () => void };
  }, [debouncedCallback, cancel]);
}
