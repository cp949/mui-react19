import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useCooldown
 *
 * 트리거 호출 시 콜백을 즉시 실행하고, 지정한 시간(cooldown) 동안 재호출을 막는 React 훅
 *
 * @param callback - 쿨다운 종료 전까지 1회만 허용할 콜백 함수. `undefined`이면 트리거가 아무 동작도 하지 않음
 * @param cooldown - 쿨다운 지속 시간(ms)
 *
 * @returns 쿨다운 상태와 트리거 함수가 담긴 객체
 * - `isCooldown`: 현재 쿨다운 중인지 여부
 * - `trigger`: 콜백을 감싼 트리거 함수. 쿨다운 중에는 호출을 무시함
 *
 * @example
 * ```tsx
 * const { isCooldown, trigger } = useCooldown(onClick, 1000);
 *
 * return <button onClick={trigger} disabled={isCooldown} />;
 * ```
 */
export function useCooldown<T extends (...args: any[]) => void = () => void>(
  callback: T | undefined,
  cooldown: number,
): { isCooldown: boolean; trigger: (...args: Parameters<T>) => void } {
  // 쿨다운 상태
  const [isCooldown, setIsCooldown] = useState(false);

  // 쿨다운 타이머 ID를 저장하는 참조
  const timeoutRef = useRef<number | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const trigger = useCallback(
    (...args: Parameters<T>) => {
      if (isCooldown || !callback) return;

      callback(...args);
      setIsCooldown(true);
      timeoutRef.current = window.setTimeout(() => {
        setIsCooldown(false);
        timeoutRef.current = null;
      }, cooldown);
    },
    [isCooldown, callback, cooldown],
  );

  return { isCooldown, trigger };
}
