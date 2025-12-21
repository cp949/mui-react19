// copy from mantine
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * 값의 변화를 지연시키는 커스텀 훅
 *
 * @template T - 값의 타입. 기본값은 `any`.
 * @param value - 지연 처리할 값.
 * @param wait - 지연 시간(밀리초 단위).
 * @param options - 지연 처리 동작 방식을 설정하는 옵션.
 * - `leading`: 첫 번째 업데이트를 즉시 처리할지 여부 (기본값: `false`).
 *
 * @returns 지연 처리된 값과 타이머를 취소하는 함수.
 */
export function useDebouncedValue<T>(
  /** 지연 처리할 값 */
  value: T,

  /** 지연 시간(밀리초 단위) */
  wait: number,

  /** 옵션: 첫 업데이트 즉시 처리 여부 */
  options = { leading: false },
) {
  // 지연 처리된 값을 저장하는 상태
  const [_value, setValue] = useState(value);

  // 컴포넌트가 마운트되었는지 확인하는 플래그
  const mountedRef = useRef(false);

  // 지연 처리 타이머의 ID를 저장하는 참조
  const timeoutRef = useRef<number | null>(null);

  // `leading` 옵션 활성화 시 첫 번째 업데이트 이후의 지연 처리 여부를 제어하는 플래그
  const cooldownRef = useRef(false);

  /**
   * 현재 설정된 타이머를 취소하는 함수
   * 타이머가 있으면 clearTimeout을 호출합니다.
   */
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current!);
    }
  }, []);

  /**
   * `value`, `wait`, `options.leading`이 변경될 때마다 실행됩니다.
   * - `leading` 옵션이 `true`인 경우, 첫 번째 값 업데이트는 즉시 처리됩니다.
   * - 이후 값 변경은 `wait` 시간만큼 지연됩니다.
   */
  useEffect(() => {
    // 컴포넌트가 이미 마운트되었는지 확인
    if (mountedRef.current) {
      // `leading` 옵션이 활성화된 경우
      if (!cooldownRef.current && options.leading) {
        cooldownRef.current = true; // 첫 업데이트 이후 지연 처리 시작
        setValue(value); // 즉시 값을 업데이트
      } else {
        cancel(); // 기존 타이머를 취소
        timeoutRef.current = window.setTimeout(() => {
          cooldownRef.current = false; // 지연 상태 해제
          setValue(value); // 값을 업데이트
        }, wait); // 지정된 `wait` 시간 이후 실행
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options.leading, wait]); // `value`, `leading`, `wait` 변경 시 실행

  /**
   * 컴포넌트가 마운트되었을 때 실행됩니다.
   * - `mountedRef`를 `true`로 설정하여 이후 업데이트를 처리합니다.
   * - 컴포넌트가 언마운트될 때 타이머를 정리합니다.
   */
  useEffect(() => {
    mountedRef.current = true; // 마운트 상태를 기록
    return cancel; // 언마운트 시 타이머 정리
  }, [cancel]);

  // 지연 처리된 값과 타이머를 취소하는 함수를 반환
  return useMemo(() => [_value, cancel] as const, [_value, cancel]);
}
