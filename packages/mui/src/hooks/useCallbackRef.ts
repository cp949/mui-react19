// copy from mantine
import { useEffect, useMemo, useRef } from 'react';

/**
 * React 컴포넌트에서 최신의 콜백을 안전하게 참조하기 위한 커스텀 훅.
 *
 * `useCallbackRef`는 콜백 함수가 렌더링 사이에서 변경되더라도 최신 콜백을 안전하게 사용할 수 있도록 도와줍니다.
 * 메모리 누수를 방지하거나 이벤트 핸들러의 최신 상태를 유지하기 위해 유용합니다.
 *
 * @template T - 콜백 함수의 타입.
 * @param callback - 최신 콜백 함수 또는 `undefined`.
 * @returns 최신 콜백 함수를 호출할 수 있는 메모이제이션된 함수.
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const [count, setCount] = useState(0);
 *   const handleClick = useCallbackRef(() => {
 *     console.log(`현재 카운트는 ${count}입니다.`);
 *   });
 *
 *   useEffect(() => {
 *     const timer = setInterval(() => {
 *       handleClick();
 *     }, 1000);
 *     return () => clearInterval(timer);
 *   }, [handleClick]);
 *
 *   return <button onClick={() => setCount(count + 1)}>카운트 증가</button>;
 * };
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCallbackRef<T extends (...args: any[]) => any>(callback: T | undefined): T {
  // 콜백 함수의 최신 참조를 저장하기 위한 ref
  const callbackRef = useRef(callback);

  // `callback` 값이 변경될 때마다 최신 값을 ref에 저장
  useEffect(() => {
    callbackRef.current = callback;
  });

  // 메모이제이션된 함수 반환
  return useMemo(
    // 반환된 함수는 항상 최신 콜백(`callbackRef.current`)을 호출
    () => ((...args) => callbackRef.current?.(...args)) as T, // 콜백 호출 시 안전하게 `undefined` 처리
    [], // 함수는 처음 한 번만 생성됨
  );
}
