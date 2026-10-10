'use client';

import { type ReactNode, useEffect, useState } from 'react';

/**
 * 지연 렌더링 컴포넌트의 속성입니다.
 */
export interface DelayedRenderProps {
  /**
   * 자식을 렌더링하기 전에 기다릴 시간(ms)입니다.
   * 0 이하이면 지연 없이 바로 렌더링합니다. 기본값: 500
   */
  delayMs?: number;

  /** 지연 후 표시할 콘텐츠입니다. */
  children: ReactNode;
}

/**
 * 마운트 후 `delayMs`가 지나면 자식을 렌더링합니다.
 *
 * 빈 목록 안내처럼 로딩이 짧게 끝나면 보이지 않아도 되는 UI의 깜빡임을 줄일 때 씁니다.
 * 지연 중에는 아무것도 렌더링하지 않습니다.
 *
 * - `delayMs`가 바뀌면 자식을 숨기고 새 지연 시간부터 다시 센다.
 * - 한 번 표시된 뒤 `children`이 바뀌면 지연 없이 반영한다.
 * - 지연 없이 보이려면 `delayMs={0}`을 지정한다.
 *
 * @example
 * ```tsx
 * <DelayedRender delayMs={300}>
 *   <EmptyView />
 * </DelayedRender>
 * ```
 */
export function DelayedRender(props: DelayedRenderProps) {
  const { delayMs = 500, children } = props;
  const delay = Math.max(0, delayMs);

  // 어떤 지연 시간에 대해 대기가 끝났는지 기록한다. delay가 바뀌면 같은 렌더에서 바로 숨겨진다.
  const [elapsedDelay, setElapsedDelay] = useState<number | null>(null);

  useEffect(() => {
    if (delay === 0) return;

    const timerId = setTimeout(() => setElapsedDelay(delay), delay);

    return () => {
      clearTimeout(timerId);
      setElapsedDelay(null);
    };
  }, [delay]);

  if (delay === 0 || elapsedDelay === delay) return children;
  return null;
}
