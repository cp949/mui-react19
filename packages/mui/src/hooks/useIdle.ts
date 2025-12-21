// copy from https://github.com/streamich/react-use/tree/master

import throttle from 'lodash.throttle';
import { useEffect, useState } from 'react';

const DEFAULT_EVENTS = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel'];

const ONE_MINUTE = 60e3;

/**
 * 사용자의 비활성 상태를 감지하고, 비활성 여부를 반환하는 커스텀 훅입니다.
 *
 * 이 훅은 사용자의 특정 이벤트(마우스 움직임, 키보드 입력 등)를 감지하여 비활성 상태인지(active 상태가 아닌지)를 판단합니다.
 * 사용자가 지정한 시간(`ms`) 동안 이벤트가 발생하지 않으면 비활성 상태로 간주됩니다.
 *
 * @param ms - 비활성 상태로 간주하기 위한 시간(밀리초). 기본값은 1분(60,000ms)입니다.
 * @param initialState - 초기 비활성 상태 값. 기본값은 `false`입니다(초기에는 활성 상태로 간주).
 * @param events - 비활성 상태를 해제하기 위해 감지할 이벤트 배열. 기본값은 `["mousemove", "mousedown", "resize", "keydown", "touchstart", "wheel"]`입니다.
 *
 * @returns `boolean` 값으로 현재 비활성 상태인지 여부를 반환합니다.
 *
 * @example
 * ```tsx
 * import React from "react";
 * import { useIdle } from "./useIdle";
 *
 * function MyComponent() {
 *   const isIdle = useIdle(5000); // 5초 동안 사용자 입력이 없으면 비활성 상태로 간주
 *
 *   return (
 *     <div>
 *       {isIdle ? "사용자가 비활성 상태입니다." : "사용자가 활성 상태입니다."}
 *     </div>
 *   );
 * }
 * ```
 *
 * @why
 * - 사용자의 비활성 상태를 감지하여 자동 로그아웃, 화면 잠금, 에너지 절약 모드 전환 등의 기능을 구현할 때 유용합니다.
 * - 기본적으로 여러 사용자 입력 이벤트를 감지하며, 필요에 따라 감지할 이벤트를 커스터마이징할 수 있습니다.
 * - `lodash.throttle`를 사용하여 이벤트 핸들러 호출 빈도를 줄여 성능을 최적화합니다.
 *
 * @internalDetails
 * - 이벤트 핸들러는 `throttle`을 사용하여 50ms 간격으로 호출됩니다.
 * - `window`와 `document`에 여러 이벤트 리스너를 등록하여 사용자 입력을 감지합니다.
 * - `setTimeout`을 사용하여 지정된 시간(`ms`) 동안 이벤트가 없으면 비활성 상태로 전환합니다.
 * - `visibilitychange` 이벤트를 감지하여 사용자가 브라우저 탭을 다시 활성화했을 때 상태를 업데이트합니다.
 *
 * @warning
 * - **이벤트 배열 변경 시**: `events`가 변경되면 기존 리스너가 모두 제거되고 새로운 리스너가 등록됩니다.
 * - **성능 주의**: 감지할 이벤트가 많을 경우 성능에 영향을 미칠 수 있으므로, 필요 없는 이벤트는 제거하는 것이 좋습니다.
 *
 * @returns `boolean` 값으로 비활성 상태(`true`) 또는 활성 상태(`false`)를 나타냅니다.
 */
export const useIdle = (
  ms: number = ONE_MINUTE,
  initialState: boolean = false,
  events: string[] = DEFAULT_EVENTS,
): boolean => {
  const [state, setState] = useState<boolean>(initialState);

  useEffect(() => {
    let mounted = true;
    let timeout: ReturnType<typeof setTimeout>;
    let localState: boolean = state;
    const set = (newState: boolean) => {
      if (mounted) {
        localState = newState;
        setState(newState);
      }
    };

    const onEvent = throttle(() => {
      if (localState) {
        set(false);
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => set(true), ms);
    }, 50);

    const onVisibility = () => {
      if (!document.hidden) {
        onEvent();
      }
    };

    for (let i = 0; i < events.length; i++) {
      window.addEventListener(events[i], onEvent);
    }
    document.addEventListener('visibilitychange', onVisibility);

    timeout = setTimeout(() => set(true), ms);

    return () => {
      mounted = false;

      for (let i = 0; i < events.length; i++) {
        window.removeEventListener(events[i], onEvent);
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, events]);

  return state;
};
