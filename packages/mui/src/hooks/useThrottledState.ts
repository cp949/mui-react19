// copy from mantine
import { useEffect, useState } from 'react';
import { useThrottledCallbackWithClearTimeout } from './useThrottledCallbackWithClearTimeout.js';

/**
 * 쓰로틀링된 상태(state)와 상태를 업데이트하는 함수를 제공하는 React 커스텀 훅.
 *
 * 이 훅은 상태 업데이트를 지정된 시간 간격(`wait`)으로 제한하여, 불필요한 연속 업데이트를 방지합니다.
 *
 * @template T - 상태 값의 타입. 기본값은 `any`.
 * @param defaultValue - 초기 상태 값.
 * @param wait - 상태 업데이트 간격(밀리초 단위).
 * @returns 배열 형태의 반환값:
 * - `value`: 현재 상태 값.
 * - `setThrottledValue`: 상태를 쓰로틀링하여 업데이트하는 함수.
 *
 * @example
 * ```tsx
 * const [value, setValue] = useThrottledState(0, 1000);
 *
 * const handleClick = () => setValue(value + 1);
 *
 * return (
 *   <div>
 *     <p>값: {value}</p>
 *     <button onClick={handleClick}>값 증가</button>
 *   </div>
 * );
 * ```
 */
export function useThrottledState<T>(
  defaultValue: T, // 초기 상태 값
  wait: number, // 상태 업데이트 간격 (밀리초 단위)
) {
  // 상태 값을 저장하는 state와 업데이트 함수
  const [value, setValue] = useState(defaultValue);

  // `setValue`를 쓰로틀링한 업데이트 함수와 타이머 정리 함수 생성
  const [setThrottledValue, clearTimeout] = useThrottledCallbackWithClearTimeout(setValue, wait);

  // 컴포넌트 언마운트 시 타이머를 정리
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => clearTimeout, []);

  // 현재 상태 값과 쓰로틀링된 업데이트 함수 반환
  return [value, setThrottledValue] as const;
}
