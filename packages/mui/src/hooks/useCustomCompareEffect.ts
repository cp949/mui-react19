// copy from https://github.com/streamich/react-use/tree/master

import type { DependencyList, EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

const isPrimitive = (val: unknown) => val !== Object(val);
const isProductionEnv = () =>
  (globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV === 'production';

type DepsEqualFnType<TDeps extends DependencyList> = (prevDeps: TDeps, nextDeps: TDeps) => boolean;

/**
 * 사용자 정의 비교 함수를 사용하여 `useEffect`의 의존성 배열을 커스텀 비교 방식으로 처리할 수 있는 커스텀 훅입니다.
 *
 * 이 훅은 의존성 배열이 React의 기본 비교 방식(얕은 비교)을 따르지 않고, 사용자가 제공한 비교 함수(`depsEqual`)를 통해
 * 의존성 변경 여부를 판단합니다. 이를 통해 중첩된 객체나 배열 등의 복잡한 데이터 구조를 의존성 배열로 사용할 때,
 * React의 `useEffect`를 더욱 유연하게 활용할 수 있습니다.
 *
 * @template TDeps - 의존성 배열의 타입. `DependencyList`를 확장하여 일반적으로 배열 형태를 기대합니다.
 *
 * @param effect - 실행할 효과 함수. `useEffect`의 콜백 함수와 동일한 형태입니다.
 * @param deps - 의존성 배열. 훅에서 이 배열의 변경 여부를 감지하여 효과 함수를 실행합니다.
 * @param depsEqual - 사용자 정의 비교 함수. 이전 의존성과 새로운 의존성을 비교하여 같으면 `true`, 다르면 `false`를 반환해야 합니다.
 *
 * @example
 * ```tsx
 * import { useCustomCompareEffect } from './useCustomCompareEffect';
 *
 * function MyComponent({ complexObject }: { complexObject: { key: string } }) {
 *   const customCompare = (prevDeps: [{ key: string }], nextDeps: [{ key: string }]) =>
 *     prevDeps[0].key === nextDeps[0].key;
 *
 *   useCustomCompareEffect(
 *     () => {
 *       console.log('complexObject가 변경되었습니다.');
 *     },
 *     [complexObject],
 *     customCompare
 *   );
 *
 *   return <div>Custom Compare Effect Example</div>;
 * }
 * ```
 *
 * @why
 * - 기본 `useEffect`는 의존성 배열에서 얕은 비교(참조 비교)를 수행하기 때문에, 중첩 객체나 배열 등의 복잡한 데이터 구조를 의존성으로 사용할 때 부적합합니다.
 * - `useCustomCompareEffect`는 사용자 정의 비교 함수를 제공함으로써, 이러한 제한을 해결하고 더 세밀한 비교 로직을 구현할 수 있도록 합니다.
 *
 * @warning
 * - **빈 의존성 배열 사용 금지**: 이 훅은 의존성이 없는 경우(`[]`) 적합하지 않으므로, 기본 `useEffect`를 사용하는 것이 좋습니다.
 * - **모두 기본 값(primitive)인 의존성 배열 사용 금지**: 의존성 배열이 모두 기본 값일 경우 기본 `useEffect`를 사용하는 것이 더 적합합니다.
 * - **`depsEqual` 콜백 필수**: `depsEqual`은 의존성을 비교하기 위한 필수 콜백입니다.
 *
 * @internalDetails
 * - `useRef`를 사용하여 이전 의존성을 저장합니다.
 * - 사용자가 제공한 `depsEqual` 함수로 이전 의존성과 새 의존성을 비교합니다.
 * - 비교 결과가 다르면 `effect`를 실행하고, 새 의존성을 `ref`에 저장합니다.
 *
 * @returns 없음. 이 훅은 `useEffect`와 동일하게 부수 효과를 실행하며, 반환값은 없습니다.
 */
export const useCustomCompareEffect = <TDeps extends DependencyList>(
  effect: EffectCallback,
  deps: TDeps,
  depsEqual: DepsEqualFnType<TDeps>,
) => {
  if (!isProductionEnv()) {
    if (!Array.isArray(deps) || !deps.length) {
      console.warn(
        '`useCustomCompareEffect` should not be used with no dependencies. Use React.useEffect instead.',
      );
    }

    if (deps.every(isPrimitive)) {
      console.warn(
        '`useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.',
      );
    }

    if (typeof depsEqual !== 'function') {
      console.warn(
        '`useCustomCompareEffect` should be used with depsEqual callback for comparing deps list',
      );
    }
  }

  const ref = useRef<TDeps | undefined>(undefined);

  if (!ref.current || !depsEqual(deps, ref.current)) {
    ref.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, ref.current);
};
