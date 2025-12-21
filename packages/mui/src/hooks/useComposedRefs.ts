// copy from  https://github.com/radix-ui/primitives/blob/main/packages/react/compose-refs/src/composeRefs.tsx

//
// 아래와 같이 하면 안된다. 매번 새로운 composed ref를 생성하게 된다.
// <div ref={composeRefs(ref1, ref2)}/>
//
// 이렇게 사용해야 한다.
// const ref = useComposedRefs(ref1,ref2)
//

import { useCallback } from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 */
function composeRefs<T>(...refs: PossibleRef<T>[]) {
  return (node: T | null) => refs.forEach((ref) => setRef(ref, node));
}

/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
function useComposedRefs<T>(...refs: PossibleRef<T>[]): (node: T | null) => void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(composeRefs(...refs), refs);
}

export { composeRefs, useComposedRefs };
