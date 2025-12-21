'use client';

import type { FC } from 'react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

/**
 * @example
 * ```tsx
 * <DebouncedRender leading trailing maxWait={200} disabled={false}>
 *   <p>{value}</p>
 * </DebouncedRender>
 * ```
 */

/**
 * DebouncedRender 컴포넌트
 *
 * 이 컴포넌트는 `debounce` 기능을 이용해 자식 컴포넌트를 렌더링하는 빈도를 제어합니다.
 *
 * @param children - 렌더링할 React 노드
 * @param leading - `true`로 설정하면 첫 호출 시 즉시 렌더링합니다. (기본값: `false`)
 * @param trailing - `true`로 설정하면 마지막 호출 후 `maxWait` 시간이 지나면 렌더링합니다. (기본값: `true`)
 * @param maxWait - 렌더링 대기 시간(ms)으로, 기본값은 100ms입니다.
 *
 * @returns DebouncedRender 컴포넌트
 */
export interface DebouncedRenderProps {
  children: ReactNode;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export const DebouncedRender: FC<DebouncedRenderProps> = ({
  children,
  leading = false,
  trailing = true,
  maxWait = 100,
}) => {
  const [content, setContent] = useState<ReactNode>(leading ? children : undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);

  const closeTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    const invoke = () => {
      setContent(children);
      lastCallTimeRef.current = now;
    };

    if (leading && lastCallTimeRef.current === null) {
      invoke();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        invoke();
      }
      timeoutRef.current = null;
    }, maxWait);

    if (
      leading &&
      lastCallTimeRef.current !== null &&
      now - (lastCallTimeRef.current || 0) >= maxWait
    ) {
      invoke();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [children, leading, trailing, maxWait, closeTimer]);

  return <>{content}</>;
};
