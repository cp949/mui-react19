// copy from mantine
import { useEffect, useLayoutEffect } from 'react';

/**
 * 브라우저와 서버 환경 모두에서 안전하게 사용할 수 있는 React 효과 훅.
 *
 * - 클라이언트 환경: `useLayoutEffect` 사용 (DOM 업데이트 후 즉시 실행)
 * - 서버 환경: `useEffect` 사용 (SSR 시 경고 방지)
 *
 * @returns React의 `useLayoutEffect` 또는 `useEffect`.
 *
 * @example
 * ```tsx
 * import { useIsomorphicEffect } from './useIsomorphicEffect';
 *
 * const Component = () => {
 *   useIsomorphicEffect(() => {
 *     console.log('렌더링 완료 후 실행');
 *   }, []);
 *
 *   return <div>내용</div>;
 * };
 * ```
 */
export const useIsomorphicEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;
