import { useState } from 'react';

interface UseUncontrolledInput<T> {
  /**
   * 제어 상태 값 (controlled state).
   * 값이 전달되면 해당 값이 항상 반환됩니다.
   */
  value?: T;

  /**
   * 비제어 상태의 초기 값 (uncontrolled state).
   * `value`가 제공되지 않았을 때 사용됩니다.
   */
  defaultValue?: T;

  /**
   * `value`와 `defaultValue`가 모두 제공되지 않을 때 사용되는 최종 기본 값.
   */
  finalValue?: T;

  /**
   * 제어 상태 변화 시 호출되는 콜백 함수.
   *
   * @param value - 변경된 값
   * @param payload - 추가 데이터
   */
  onChange?: (value: T, ...payload: unknown[]) => void;
}

/**
 * 제어 상태와 비제어 상태를 동시에 지원하는 React 훅.
 *
 * 이 훅은 컴포넌트가 "제어 상태(controlled state)"와
 * "비제어 상태(uncontrolled state)"를 쉽게 다룰 수 있도록 설계되었습니다.
 *
 * @template T - 상태 값의 타입
 * @param params - 제어 상태와 비제어 상태를 관리하기 위한 입력 값
 * @returns [현재 상태 값, 상태를 업데이트하는 함수, 제어 상태 여부]
 *
 * @example
 * ```tsx
 * const [value, setValue, isControlled] = useUncontrolled({
 *   value: controlledValue, // 제어 상태 값
 *   defaultValue: 10,       // 초기 값
 *   finalValue: 0,          // 최종 기본 값
 *   onChange: (val) => console.log(val), // 변경 시 콜백
 * });
 * ```
 */
export function useUncontrolled<T>({
  value,
  defaultValue,
  finalValue,
  onChange = () => {},
}: UseUncontrolledInput<T>): [T, (value: T, ...payload: unknown[]) => void, boolean] {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue !== undefined ? defaultValue : finalValue,
  );

  const handleUncontrolledChange = (val: T, ...payload: unknown[]) => {
    setUncontrolledValue(val);
    onChange?.(val, ...payload);
  };

  if (value !== undefined) {
    return [value as T, onChange, true]; // 제어 상태인 경우
  }

  return [uncontrolledValue as T, handleUncontrolledChange, false]; // 비제어 상태인 경우
}
