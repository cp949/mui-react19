// copy from mantine
import type { SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 상태 업데이트를 지연시키는 커스텀 훅.
 * `useState`와 비슷하지만 상태 업데이트를 지연(debounce)시킬 수 있는 React 커스텀 훅입니다.
 *
 * @template T - 상태 값의 타입. 기본값은 `any`입니다.
 * @param defaultValue - 초기 상태 값.
 * @param wait - 상태 업데이트 지연 시간(밀리초 단위).
 * @param options - 상태 업데이트 동작 방식을 설정하는 옵션 객체. 기본값은 `{ leading: false }`입니다.
 * - `leading`: `true`일 경우, 상태 업데이트가 지연 없이 즉시 한 번 발생하며 이후 변경은 지연됩니다.
 *
 * @returns 반환값은 다음과 같습니다:
 * - `value`: 현재 상태 값.
 * - `debouncedSetValue`: 상태를 업데이트하는 함수로, 업데이트가 지연됩니다.
 *
 * @example
 * ```tsx
 * const [value, setValue] = useDebouncedState("", 500, { leading: true });
 *
 * const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *   setValue(e.target.value);
 * };
 *
 * return (
 *   <input value={value} onChange={handleChange} />
 * );
 * ```
 */
export function useDebouncedState<T>(
  defaultValue: T, // 초기 상태 값
  wait: number, // 지연 시간 (밀리초)
  options = { leading: false }, // 옵션: 상태 업데이트 동작 방식 (기본값: { leading: false })
) {
  // 현재 상태 값을 관리하는 state
  const [value, setValue] = useState(defaultValue);

  // 타이머 ID를 저장하는 ref
  const timeoutRef = useRef<number | null>(null);

  // `leading` 옵션 활성화 여부를 추적하는 ref
  const leadingRef = useRef(true);

  /**
   * 현재 설정된 타이머를 정리하는 함수.
   * - `clearTimeout`은 타이머를 초기화하여 상태 업데이트를 취소합니다.
   */
  const clearTimeout = () => window.clearTimeout(timeoutRef.current!);

  // 컴포넌트 언마운트 시 타이머를 정리.
  useEffect(() => clearTimeout, []);

  /**
   * 상태 값을 업데이트하는 디바운스된 함수.
   * - `leading` 옵션이 활성화된 경우, 첫 번째 업데이트는 즉시 발생.
   * - 이후 업데이트는 `wait` 시간만큼 지연.
   */
  const debouncedSetValue = useCallback(
    (newValue: SetStateAction<T>) => {
      clearTimeout(); // 기존 타이머를 정리.

      // `leading` 옵션이 활성화된 경우, 즉시 업데이트를 처리.
      if (leadingRef.current && options.leading) {
        setValue(newValue);
      } else {
        // `wait` 시간만큼 지연 후 상태 업데이트 처리.
        timeoutRef.current = window.setTimeout(() => {
          leadingRef.current = true; // 다음 업데이트를 위한 준비.
          setValue(newValue); // 상태 값 업데이트.
        }, wait);
      }

      // 첫 업데이트 이후 `leading`을 비활성화하여 지연 처리 시작.
      leadingRef.current = false;
    },
    [options.leading, wait], // 의존성: `leading` 옵션과 `wait` 시간.
  );

  // 현재 상태 값과 디바운스된 업데이트 함수를 반환.
  return [value, debouncedSetValue] as const;
}
