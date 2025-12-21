import { useEffectOnce } from './useEffectOnce.js';

/**
 * 컴포넌트가 마운트될 때 한 번만 실행되는 로직을 처리하기 위한 커스텀 훅입니다.
 *
 * 이 훅은 `useEffectOnce`를 기반으로 동작하며, 컴포넌트가 마운트될 때 전달된 콜백 함수를 실행합니다.
 * `useEffectOnce`를 직접 사용하는 것보다 `useMount`라는 명확한 이름을 통해 의도를 더 직관적으로 나타냅니다.
 *
 * @param fn - 컴포넌트가 마운트될 때 실행할 콜백 함수. 이 함수는 마운트 시점에 한 번만 호출됩니다.
 *
 * @example
 * ```tsx
 * import React from "react";
 * import { useMount } from "./useMount";
 *
 * function MyComponent() {
 *   useMount(() => {
 *     console.log("컴포넌트가 마운트되었습니다.");
 *   });
 *
 *   return <div>My Component</div>;
 * }
 * ```
 * @returns 없음. 이 훅은 단지 전달된 콜백 함수를 실행하며 반환값은 없습니다.
 */
export const useMount = (fn: () => void) => {
  useEffectOnce(() => {
    fn();
  });
};
