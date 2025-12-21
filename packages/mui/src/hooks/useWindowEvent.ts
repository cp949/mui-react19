import { useEffect } from 'react';

/**
 * 지정된 타입의 윈도우 이벤트를 등록하고 관리하는 React 커스텀 훅.
 *
 * @template K - 이벤트 타입을 나타내는 문자열 타입.
 * @param type - 등록할 윈도우 이벤트의 타입(예: "resize", "click").
 * @param listener - 이벤트가 발생했을 때 실행될 콜백 함수.
 *   - 표준 이벤트 타입(`WindowEventMap`)의 경우 타입에 맞는 이벤트 객체를 전달받음.
 *   - 사용자 정의 이벤트의 경우 `CustomEvent` 객체를 전달받음.
 * @param options - 이벤트 리스너 등록 시 사용할 옵션(선택 사항).
 *   - `boolean` 또는 `AddEventListenerOptions`를 지원.
 *
 * @example
 * ```tsx
 * useWindowEvent("resize", () => {
 *   console.log("창 크기가 변경되었습니다.");
 * });
 * ```
 */
export function useWindowEvent<K extends string>(
  type: K, // 등록할 윈도우 이벤트의 타입
  listener: K extends keyof WindowEventMap
    ? (this: Window, ev: WindowEventMap[K]) => void // 표준 이벤트 타입에 맞는 리스너
    : (this: Window, ev: CustomEvent) => void, // 사용자 정의 이벤트 리스너
  options?: boolean | AddEventListenerOptions, // 이벤트 리스너 옵션
) {
  // 이벤트 리스너 등록 및 정리
  useEffect(() => {
    // 윈도우 이벤트 리스너 등록
    window.addEventListener(type, listener as EventListener, options);
    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      window.removeEventListener(type, listener as EventListener, options);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, listener]); // 의존성: 이벤트 타입과 리스너
}
