import { useMemo } from 'react';
import { debounce } from '../misc/debounce.js';
import { useLatest } from './useLatest.js';
import { useUnmount } from './useUnmount.js';

interface DebounceOptions {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type noop = (...args: any[]) => any;

/**
 * 주어진 함수 `fn`을 디바운스 처리하여, 특정 시간(`wait`) 동안 호출이 연속적으로 발생하지 않으면 실행되도록 합니다.
 * 디바운스된 함수는 `run`, `cancel`, `flush` 메서드를 제공합니다.
 *
 * @param fn 디바운스 처리할 함수
 * @param options 디바운스 옵션
 * @param options.wait 함수 실행을 지연할 시간(밀리초). 기본값은 1000ms.
 * @param options.leading `true`로 설정하면, 지연 타이머가 시작될 때 함수가 즉시 실행됩니다. 기본값은 `false`.
 * @param options.trailing `true`로 설정하면, 지연 타이머가 종료될 때 함수가 실행됩니다. 기본값은 `true`.
 * @param options.maxWait 함수가 지연될 수 있는 최대 시간. 설정하지 않으면 무제한입니다.
 * @returns 디바운스된 함수와 제어 메서드를 포함하는 객체를 반환합니다.
 * @returns.run 디바운스된 함수 실행
 * @returns.cancel 지연 중인 함수 실행 취소
 * @returns.flush 지연 중인 함수를 즉시 실행
 *
 * @example
 * ```typescript
 * const MyComponent = () => {
 *   const { run, cancel, flush } = useDebounceFn(
 *     (value: string) => {
 *       console.log(value);
 *     },
 *     { wait: 500, leading: true, trailing: false }
 *   );
 *
 *   return (
 *     <input
 *       type="text"
 *       onChange={(e) => run(e.target.value)}
 *       onBlur={() => flush()}
 *     />
 *   );
 * };
 * ```
 */
export function useDebounceFn<T extends noop>(fn: T, options?: DebounceOptions) {
  const fnRef = useLatest(fn);
  const wait = options?.wait ?? 1000;
  const debounced = useMemo(
    () =>
      debounce(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useUnmount(() => {
    debounced.cancel();
  });

  return {
    run: debounced,
    cancel: debounced.cancel,
    flush: debounced.flush,
  };
}
