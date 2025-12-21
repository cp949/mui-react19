import { useEffect, useState, type DependencyList, type EffectCallback } from 'react';
import { useDebounceFn } from './useDebounceFn.js';
import { useUpdateEffect } from './useUpdateEffect.js';

interface DebounceOptions {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * 디바운스 처리된 `effect`를 제공하는 React 커스텀 훅입니다.
 * 특정 의존성 배열(`deps`)이 변경될 때, 지정된 지연 시간(`wait`) 이후에 `effect`가 실행됩니다.
 * 이 훅은 디바운스 옵션을 지원하며, `useDebounceFn` 및 `useUpdateEffect`를 활용하여 구현되었습니다.
 *
 * @param effect 디바운스 처리 후 실행할 이펙트 콜백 함수. React의 `useEffect`와 동일한 방식으로 동작합니다.
 * @param deps 이펙트가 다시 실행될 때 참조할 의존성 배열. 기본값은 빈 배열(`[]`)입니다.
 * @param options 디바운스 옵션 객체
 * @param options.wait 함수 실행을 지연할 시간(밀리초). 기본값은 1000ms.
 * @param options.leading `true`로 설정하면, 지연 타이머가 시작될 때 함수가 즉시 실행됩니다. 기본값은 `false`.
 * @param options.trailing `true`로 설정하면, 지연 타이머가 종료될 때 함수가 실행됩니다. 기본값은 `true`.
 * @param options.maxWait 함수가 지연될 수 있는 최대 시간. 설정하지 않으면 무제한입니다.
 *
 * @example
 * ```typescript
 * import { useDebounceEffect } from "./useDebounceEffect";
 * import React, { useState } from "react";
 *
 * const ExampleComponent = () => {
 *   const [value, setValue] = useState("");
 *
 *   useDebounceEffect(() => {
 *     console.log("Debounced effect:", value);
 *   }, [value], { wait: 500 });
 *
 *   return (
 *     <input
 *       type="text"
 *       value={value}
 *       onChange={(e) => setValue(e.target.value)}
 *       placeholder="Type something..."
 *     />
 *   );
 * };
 * ```
 *
 * @remarks
 * 이 훅은 두 단계로 동작합니다:
 * 1. `deps` 배열이 변경될 때 `useDebounceFn`을 통해 디바운스 처리된 콜백이 실행됩니다.
 * 2. 디바운스 처리된 콜백이 완료되면 `effect`가 실행됩니다.
 *
 * @see `useDebounceFn` 디바운스 처리된 함수 생성에 사용됩니다.
 * @see `useUpdateEffect` 업데이트 시점에 이펙트를 실행하는 데 사용됩니다.
 */
export function useDebounceEffect(
  effect: EffectCallback,
  deps?: DependencyList,
  options?: DebounceOptions,
) {
  const [flag, setFlag] = useState({});

  const { run } = useDebounceFn(() => {
    setFlag({});
  }, options);

  useEffect(() => {
    return run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useUpdateEffect(effect, [flag]);
}
