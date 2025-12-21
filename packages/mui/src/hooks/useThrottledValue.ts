import { useEffect, useRef, useState } from 'react';
import { useThrottledCallbackWithClearTimeout } from './useThrottledCallbackWithClearTimeout.js';

/**
 * 주어진 값을 쓰로틀링하여 지정된 시간 간격(`wait`) 후에 최신 값을 반환하는 커스텀 React 훅.
 *
 * 이 훅은 입력 값(`value`)이 변경될 때마다, 지정된 `wait` 시간 간격으로 업데이트된 값을 제공합니다.
 *
 * @template T - 쓰로틀링할 값의 타입.
 * @param value - 쓰로틀링할 값.
 * @param wait - 값 업데이트 간격(밀리초 단위).
 * @returns 쓰로틀링된 값을 반환.
 *
 * @example
 * ```tsx
 * const throttledValue = useThrottledValue(inputValue, 500);
 *
 * return <p>쓰로틀링된 값: {throttledValue}</p>;
 * ```
 */
export function useThrottledValue<T>(value: T, wait: number) {
  // 쓰로틀링된 값을 저장하는 상태와 업데이트 함수
  const [throttledValue, setThrottledValue] = useState(value);

  // 최신 값을 저장하는 ref
  const valueRef = useRef(value);

  // 쓰로틀링된 업데이트 함수와 타이머 정리 함수 생성
  const [throttledSetValue, clearTimeout] = useThrottledCallbackWithClearTimeout(
    setThrottledValue,
    wait,
  );

  // 값이 변경되었을 때 쓰로틀링된 업데이트 실행
  useEffect(() => {
    if (value !== valueRef.current) {
      valueRef.current = value; // 최신 값을 ref에 저장
      throttledSetValue(value); // 쓰로틀링된 업데이트 함수 호출
    }
  }, [throttledSetValue, value]);

  // 컴포넌트 언마운트 시 타이머 정리
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => clearTimeout, []);

  // 쓰로틀링된 값 반환
  return throttledValue;
}
