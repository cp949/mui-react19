// copy from https://github.com/streamich/react-use/tree/master

import type { DependencyList, EffectCallback } from 'react';
import { deepEq } from '../misc/deepEq.js';
import { useCustomCompareEffect } from './useCustomCompareEffect.js';

const isPrimitive = (val: unknown) => val !== Object(val);

/**
 * 의존성 배열의 깊은 비교(Deep Comparison)를 수행하여 `useEffect`를 실행하는 커스텀 훅입니다.
 *
 * React의 기본 `useEffect`는 의존성 배열의 얕은 비교(Shallow Comparison)를 통해 변화 여부를 판단합니다.
 * 이 훅은 `deepEq` 함수를 사용하여 의존성 배열의 깊은 비교를 수행하고, 배열의 복잡한 데이터 구조(중첩 객체, 배열 등)에서도
 * 적절히 변경 사항을 감지하여 효과를 실행할 수 있도록 지원합니다.
 *
 * @param effect - 실행할 효과 함수. `useEffect`와 동일한 형태로, 컴포넌트가 렌더링될 때 실행됩니다.
 * @param deps - 의존성 배열. 이 배열의 변경 여부를 깊은 비교를 통해 판단하여 `effect`를 실행합니다.
 *
 * @example
 * ```tsx
 * import React, { useState } from 'react';
 * import { useDeepCompareEffect } from './useDeepCompareEffect';
 *
 * function MyComponent() {
 *   const [data, setData] = useState({ key: 'value' });
 *
 *   useDeepCompareEffect(() => {
 *     console.log('데이터가 변경되었습니다:', data);
 *   }, [data]);
 *
 *   return (
 *     <button onClick={() => setData({ key: 'value' })}>
 *       데이터 변경 시도
 *     </button>
 *   );
 * }
 * ```
 *
 * @why
 * - 기본 `useEffect`는 의존성 배열의 얕은 비교를 수행하므로, 객체나 배열과 같은 복잡한 데이터 구조의 변경 여부를 제대로 감지하지 못할 수 있습니다.
 * - `useDeepCompareEffect`는 의존성 배열의 깊은 비교를 수행하여 이러한 문제를 해결합니다.
 *
 * @warning
 * - **빈 의존성 배열 사용 금지**: 의존성 배열이 비어 있는 경우 기본 `useEffect`를 사용하는 것이 적합합니다.
 * - **모든 값이 기본 값(Primitive)인 경우**: 의존성 배열이 모두 기본 값이라면 기본 `useEffect`를 사용하는 것이 더 효율적입니다.
 * - **깊은 비교 비용**: `deepEq` 함수는 깊은 비교를 수행하므로, 의존성 배열이 매우 크거나 복잡한 경우 성능에 영향을 줄 수 있습니다.
 *
 * @internalDetails
 * - `useCustomCompareEffect`를 내부적으로 호출하며, `deepEq`를 비교 함수로 사용하여 의존성 배열의 깊은 비교를 수행합니다.
 * - 개발 환경에서는 `deps`에 대해 여러 가지 유효성 검사를 수행하여 잘못된 사용을 방지합니다.
 *
 * @returns 없음. 이 훅은 `useEffect`와 동일하게 부수 효과를 실행하며, 반환값은 없습니다.
 */
export const useDeepCompareEffect = (effect: EffectCallback, deps: DependencyList) => {
  if (process.env['NODE_ENV'] !== 'production') {
    if (!(deps instanceof Array) || !deps.length) {
      console.warn(
        '`useDeepCompareEffect` should not be used with no dependencies. Use React.useEffect instead.',
      );
    }

    if (deps.every(isPrimitive)) {
      console.warn(
        '`useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.',
      );
    }
  }

  useCustomCompareEffect(effect, deps, deepEq);
};
