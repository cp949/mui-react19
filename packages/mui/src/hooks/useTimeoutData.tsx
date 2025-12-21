import { useCallback, useRef, useState } from 'react';
import { useUnmount } from './useUnmount.js';

/**
 * 시간이 지나면 자동으로 사라지는 데이터
 */
export function useTimeoutData<T>(timeoutMs: number): [T | null, (t: T | null) => void] {
  const [message, setMessage] = useState<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useUnmount(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  });

  const setWithTimeout = useCallback(
    (t: T | null) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setMessage(t);

      if (t == null) {
        return;
      }

      timerRef.current = setTimeout(() => {
        setMessage(null);
      }, timeoutMs);
    },
    [timeoutMs],
  );

  return [message, setWithTimeout];
}
