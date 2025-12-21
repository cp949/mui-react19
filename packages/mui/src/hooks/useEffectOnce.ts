import type { EffectCallback } from 'react';
import { useEffect } from 'react';

/**
 * 컴포넌트가 마운트될 때 한 번만 실행되는 `useEffect`를 구현하기 위한 커스텀 훅입니다.
 *
 * React의 `useEffect`는 의존성 배열을 통해 특정 조건에서만 실행되도록 제어할 수 있습니다.
 * 이 훅은 의존성 배열을 빈 배열(`[]`)로 고정하여 **컴포넌트가 처음 렌더링될 때** 한 번만 실행되는 효과를 단순화합니다.
 *
 * @param effect - 컴포넌트가 처음 렌더링될 때 실행될 효과 함수. `useEffect`에서 사용하는 것과 동일한 형태입니다.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useEffectOnce(() => {
 *     console.log("컴포넌트가 마운트되었습니다.");
 *     return () => {
 *       console.log("컴포넌트가 언마운트되었습니다.");
 *     };
 *   });
 *
 *   return <div>My Component</div>;
 * }
 * ```
 * @returns 없음. `useEffect`와 동일하게 동작하며, 반환값은 없습니다.
 */
export const useEffectOnce = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};
