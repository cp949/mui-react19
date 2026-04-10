// copy from mantine
import { useResizeObserver } from './useResizeObserver.js';

/**
 * 요소의 참조(ref)와 해당 요소의 너비(width) 및 높이(height)를 제공하는 커스텀 React 훅.
 * `useResizeObserver` 훅을 활용하여 요소의 크기를 관찰합니다.
 *
 * @template T - 관찰할 HTML 요소의 타입. 기본값은 `HTMLElement`입니다.
 * @param options - 관찰을 설정하기 위한 선택적인 `ResizeObserverOptions` 객체.
 * @returns 객체 형태의 반환값:
 * - `ref`: 관찰할 요소에 연결하기 위한 React 참조 객체.
 * - `width`: 관찰된 요소의 현재 너비.
 * - `height`: 관찰된 요소의 현재 높이.
 *
 * @example
 * ```tsx
 * const { ref, width, height } = useElementSize();
 *
 * return (
 *   <div ref={ref} style={{ resize: "both", overflow: "auto" }}>
 *     Width: {width}, Height: {height}
 *   </div>
 * );
 * ```
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(
  options?: ResizeObserverOptions,
) {
  const [ref, { width, height }] = useResizeObserver<T>(options);
  return { ref, width, height };
}
