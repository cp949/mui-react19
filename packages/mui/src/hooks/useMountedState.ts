import { useCallback, useEffect, useRef } from 'react';

/**
 * 컴포넌트가 마운트 상태인지 여부를 반환하는 커스텀 훅입니다.
 *
 * 이 훅은 컴포넌트의 현재 마운트 상태를 안전하게 확인하기 위해 사용됩니다.
 * 비동기 작업이나 이벤트 핸들러 내에서 컴포넌트가 마운트된 상태인지 확인할 때 유용합니다.
 *
 * @returns `() => boolean` 함수를 반환하며, 호출 시 컴포넌트가 현재 마운트 상태인지(`true` 또는 `false`)를 반환합니다.
 *
 * @example
 * ```tsx
 * import React, { useState, useEffect } from 'react';
 * import useMountedState from './useMountedState';
 *
 * function MyComponent() {
 *   const isMounted = useMountedState();
 *   const [data, setData] = useState<string | null>(null);
 *
 *   useEffect(() => {
 *     setTimeout(() => {
 *       if (isMounted()) {
 *         setData('데이터가 성공적으로 로드되었습니다.');
 *       }
 *     }, 3000);
 *   }, [isMounted]);
 *
 *   return <div>{data || '로딩 중...'}</div>;
 * }
 * ```
 *
 * @internalDetails
 * - `mountedRef`는 컴포넌트의 마운트 상태를 저장합니다.
 * - `useEffect`는 컴포넌트가 마운트되면 `true`, 언마운트되면 `false`로 설정합니다.
 * - `useCallback`을 사용하여 `get` 함수가 항상 동일한 참조를 가지도록 보장합니다.
 */
export function useMountedState(): () => boolean {
  const mountedRef = useRef<boolean>(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return get;
}
