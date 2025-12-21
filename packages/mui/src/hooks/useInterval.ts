import { useEffect, useRef, useState } from 'react';

interface UseIntervalOptions {
  /** If set, the interval will start automatically when the component is mounted, `false` by default */
  autoInvoke?: boolean;
}

/**
 * 특정 작업을 주어진 간격으로 실행할 수 있는 React Hook입니다.
 *
 * @param fn - 주어진 간격마다 호출될 콜백 함수입니다.
 * @param interval - 작업을 실행할 간격(밀리초)입니다.
 * @param options - 옵션 객체입니다.
 * @param options.autoInvoke - 컴포넌트가 마운트될 때 자동으로 interval을 시작할지 여부를 설정합니다. 기본값은 `false`입니다.
 *
 * @returns `{ start, stop, toggle, active }`
 * - `start`: interval을 시작하는 함수입니다.
 * - `stop`: interval을 중지하는 함수입니다.
 * - `toggle`: interval의 상태를 토글(시작/중지)하는 함수입니다.
 * - `active`: interval이 활성화되었는지 여부를 나타내는 boolean 값입니다.
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = useState(0);
 *   const { start, stop, toggle, active } = useInterval(() => {
 *     setCount((prev) => prev + 1);
 *   }, 1000, { autoInvoke: true });
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={start}>Start</button>
 *       <button onClick={stop}>Stop</button>
 *       <button onClick={toggle}>{active ? 'Pause' : 'Resume'}</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @remarks
 * - 이 Hook은 `window.setInterval`을 내부적으로 사용하여 특정 작업을 반복 실행합니다.
 * - `fn`이 변경되면 최신 함수 참조를 유지하며, interval은 자동으로 최신 함수로 업데이트됩니다.
 * - `autoInvoke`가 `true`로 설정되면, 컴포넌트가 마운트될 때 자동으로 interval이 시작됩니다.
 * - 컴포넌트가 언마운트될 때 interval은 자동으로 정리됩니다.
 */
export function useInterval(
  fn: () => void,
  interval: number,
  { autoInvoke = false }: UseIntervalOptions = {},
) {
  const [active, setActive] = useState(false);
  const intervalRef = useRef<number | undefined>(undefined);
  const fnRef = useRef<(() => void) | undefined>(undefined);

  const start = () => {
    setActive((old) => {
      if (!old && !intervalRef.current) {
        intervalRef.current = window.setInterval(fnRef.current!, interval);
      }
      return true;
    });
  };

  const stop = () => {
    setActive(false);
    window.clearInterval(intervalRef.current);
    intervalRef.current = undefined;
  };

  const toggle = () => {
    if (active) {
      stop();
    } else {
      start();
    }
  };

  useEffect(() => {
    fnRef.current = fn;
    if (active) {
      start();
    }
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, active, interval]);

  useEffect(() => {
    if (autoInvoke) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { start, stop, toggle, active };
}
