import { useId as useReactId } from 'react';

/**
 * React 19 네이티브 `useId`를 사용해 안정적인 고유 id를 생성한다.
 *
 * - `staticId`가 string이면 그대로 반환한다(override).
 * - 인자가 없으면 네이티브 id에서 콜론(`:`)만 제거해 반환한다(파생 id의 querySelector 안전).
 *
 * @param staticId 고정 id. string이면 그대로 반환된다.
 * @returns 고정 id 또는 콜론이 제거된 네이티브 id.
 */
export function useId(staticId?: string) {
  // rules-of-hooks: 네이티브 useId는 가드보다 먼저 무조건 호출한다.
  const id = useReactId();

  if (typeof staticId === 'string') {
    return staticId;
  }

  return id.replace(/:/g, '');
}
