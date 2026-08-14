import type { SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '../misc/debounce.js';

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

  const leading = options.leading ?? false;

  // wait/leading이 바뀔 때만 디바운스 인스턴스를 새로 만든다.
  const debounced = useMemo(
    () => debounce((next: SetStateAction<T>) => setValue(next), wait, { leading }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wait, leading],
  );

  // 인스턴스가 교체되거나 컴포넌트가 언마운트될 때 예약된 타이머를 정리한다.
  useEffect(() => debounced.cancel, [debounced]);

  // cancel/flush를 노출하지 않기 위해 순수 호출부만 감싼 함수를 반환한다.
  const debouncedSetValue = useCallback((next: SetStateAction<T>) => debounced(next), [debounced]);

  return [value, debouncedSetValue] as const;
}
