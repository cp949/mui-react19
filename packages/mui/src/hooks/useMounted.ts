import { useEffect, useState } from 'react';

/**
 * 컴포넌트가 마운트되었는지 여부를 반환하는 React 훅입니다.
 *
 * SSR 환경에서 서버 렌더링 시에는 `false`를 반환하고,
 * 클라이언트에서 마운트된 후에는 `true`를 반환합니다.
 *
 * @returns 컴포넌트가 마운트되었으면 `true`, 아니면 `false`
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mounted = useMounted();
 *
 *   // 클라이언트 전용 렌더링
 *   if (!mounted) return null;
 *
 *   return <div>Client-side only content</div>;
 * }
 * ```
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // SSR 환경에서 클라이언트 마운트 시점을 감지하기 위한 정당한 사용 케이스
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}
