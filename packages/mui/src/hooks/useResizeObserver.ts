// copy from mantine

import { useEffect, useMemo, useRef, useState } from 'react';

type ObserverRect = Omit<DOMRectReadOnly, 'toJSON'>;

const defaultState: ObserverRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

/**
 * 요소에 대한 `ref`를 제공하고 크기 조정(resize) 이벤트를 관찰하는 커스텀 React 훅.
 * 이 훅은 요소의 크기와 위치(DOMRect)를 반환합니다.
 *
 * @template T - 관찰할 HTML 요소의 타입. 기본값은 `HTMLElement`입니다.
 * @param options - 관찰을 설정하기 위한 선택적인 `ResizeObserverOptions` 객체.
 * @returns 튜플 형태의 반환값:
 * - `ref`: 관찰할 요소에 연결하기 위한 React 참조 객체.
 * - `rect`: 관찰된 요소의 DOMRect 속성(크기와 위치).
 *
 * @example
 * ```tsx
 * const [ref, rect] = useResizeObserver();
 *
 * return (
 *   <div ref={ref} style={{ resize: "both", overflow: "auto" }}>
 *     Width: {rect.width}, Height: {rect.height}
 *   </div>
 * );
 * ```
 */
export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  options?: ResizeObserverOptions,
) {
  // Reference to the animation frame ID for cleanup
  const frameID = useRef(0);

  // Reference to the observed element
  const ref = useRef<T>(null);

  // State to store the DOMRect of the observed element
  const [rect, setRect] = useState<ObserverRect>(defaultState);

  // Memoized ResizeObserver instance to track element size changes
  const observer = useMemo(
    () =>
      typeof window !== 'undefined'
        ? new ResizeObserver((entries: ResizeObserverEntry[]) => {
            const entry = entries[0];

            if (entry) {
              // Cancel any ongoing animation frame
              cancelAnimationFrame(frameID.current);

              // Schedule an update for the next animation frame
              frameID.current = requestAnimationFrame(() => {
                if (ref.current) {
                  setRect(entry.contentRect);
                }
              });
            }
          })
        : null,
    [],
  );

  useEffect(() => {
    // Start observing the element if it's available
    if (ref.current) {
      observer?.observe(ref.current, options);
    }

    return () => {
      // Cleanup: disconnect observer and cancel animation frame
      observer?.disconnect();

      if (frameID.current) {
        cancelAnimationFrame(frameID.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current]);

  // Return the ref and the current DOMRect state
  return [ref, rect] as const;
}
