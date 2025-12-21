'use client';

import { useEffect, useRef } from 'react';
import { useIsomorphicEffect } from './useIsomorphicEffect.js';
import { useSessionStorage } from './useSessionStorage.js';

/**
 * 사용자의 입력(터치, 클릭, 키보드 등)을 감지하여 오디오가 활성화되었는지(unlocked) 상태를 관리하는 커스텀 훅입니다.
 *
 * 이 훅은 사용자의 입력 이벤트를 통해 오디오가 활성화되었는지 확인하고, 활성화 시 제공된 콜백 함수를 호출합니다.
 * 활성화 여부는 `sessionStorage`를 사용하여 상태를 유지합니다.
 *
 * @param options - 훅의 동작을 제어하는 옵션 객체
 * @param options.onUnlocked - 오디오가 활성화되었을 때 호출되는 콜백 함수
 *
 * @returns `boolean` 값으로 오디오 활성화 상태를 반환합니다.
 *
 * @example
 * ```tsx
 *   const isAudioUnlocked = useAudioUnlocked({
 *     onUnlocked: () => {
 *       console.log('오디오가 활성화되었습니다!');
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {isAudioUnlocked ? "오디오 활성화됨" : "오디오 비활성화됨"}
 *     </div>
 *   );
 * ```
 */
export function useAudioUnlocked(options: { onUnlocked: () => void }): boolean {
  const [unlocked, setUnlocked] = useSessionStorage('audio-unlocked', false);
  const onUnlockedRef = useRef(options.onUnlocked);

  useEffect(() => {
    onUnlockedRef.current = options.onUnlocked;
  }, [options.onUnlocked]);

  useIsomorphicEffect(() => {
    if (unlocked) return;
    function unlock() {
      setUnlocked(true);
    }

    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('touchend', unlock, true);
    document.addEventListener('click', unlock, true);
    document.addEventListener('keydown', unlock, true);

    return () => {
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('touchend', unlock, true);
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };
  }, [unlocked]);

  useEffect(() => {
    if (unlocked) {
      onUnlockedRef.current?.();
    }
  }, [unlocked]);

  return unlocked || false;
}
