import type React from 'react';
import { useEffect, useRef, useState } from 'react';

/**
 * 이미지 로드 상태를 감지하고 로드 또는 실패 시 콜백을 호출하는 React 훅입니다.
 *
 * @param img - 감지할 대상 `HTMLImageElement`입니다. `null`이면 훅이 동작하지 않습니다.
 * @param options - 이미지 로드 상태와 관련된 설정 및 콜백 함수들입니다.
 * @param options.keepListening - `true`로 설정하면 이미지의 `src` 속성이 변경될 때마다 이벤트를 감시합니다.
 *                                `false`로 설정하면 첫 로드 이후 감시를 중단합니다. 기본값은 `false`입니다.
 * @param options.onLoaded - 이미지가 성공적으로 로드되었을 때 호출되는 콜백 함수입니다. `img`를 인수로 받습니다.
 * @param options.onError - 이미지 로드에 실패했을 때 호출되는 선택적 콜백 함수입니다. `img`와 오류 객체를 인수로 받습니다.
 * @param deps - 의존성 배열로, 해당 배열의 값이 변경되면 훅이 다시 실행됩니다. 기본값은 빈 배열입니다.
 *
 * @returns 없음
 *
 * @example
 * ```tsx
 *   const imgRef = useRef<HTMLImageElement | null>(null);
 *
 *   useImageLoadCallback(imgRef.current, {
 *     keepListening: true,
 *     onLoaded: (img) => console.log("Image loaded:", img.src),
 *     onError: (img, error) => console.error("Image load failed:", img.src, error),
 *   });
 *
 *   return <img ref={imgRef} src="https://via.placeholder.com/300" alt="Example" />;
 * ```
 *
 * @remarks
 * - 이미지가 이미 로드된 경우 (`img.complete`)에도 콜백이 호출됩니다.
 * - `MutationObserver`를 사용하여 이미지의 `src` 속성 변경을 감지하고 다시 로드 상태를 확인합니다.
 * - `keepListening` 설정에 따라 로드 상태를 지속적으로 감시할 수 있습니다.
 *
 * @dependencies
 * - React: `useEffect`, `useRef`, `useState`
 * - DOM API: `addEventListener`, `removeEventListener`, `MutationObserver`
 */
export function useImageLoadCallback(
  img: HTMLImageElement | null,
  options: {
    keepListening?: boolean;
    onLoaded: (img: HTMLImageElement) => void;
    onError?: (img: HTMLImageElement, error: unknown) => void;
  },
  deps: React.DependencyList = [],
): void {
  const { keepListening = false } = options;
  const [refreshToken, setRefreshToken] = useState(0);
  const onLoadedRef = useRef(options.onLoaded);
  onLoadedRef.current = options.onLoaded;

  const onErrorRef = useRef(options.onError);
  onErrorRef.current = options.onError;

  useEffect(() => {
    if (!img?.src) return;

    if (img.complete) {
      // 이미지가 이미 로드된 상태
      onLoadedRef.current?.(img);
      if (!keepListening) {
        return;
      }
    }

    const handleLoadSuccess = () => {
      onLoadedRef.current?.(img);
      // keepListening=false인 경우 이벤트 리스너 제거
      if (!keepListening) {
        img.removeEventListener('load', handleLoadSuccess);
        img.removeEventListener('error', handleLoadFailed);
      }
    };

    const handleLoadFailed = (evt: ErrorEvent) => {
      const error = evt.error || new Error('Image failed to load');
      onErrorRef.current?.(img, error);

      // keepListening=false인 경우 이벤트 리스너 제거
      if (!keepListening) {
        img.removeEventListener('load', handleLoadSuccess);
        img.removeEventListener('error', handleLoadFailed);
      }
    };

    // 이벤트 리스너 등록
    img.addEventListener('load', handleLoadSuccess, { once: true });
    img.addEventListener('error', handleLoadFailed, { once: true });

    // 정리: 이벤트 리스너 제거
    return () => {
      img.removeEventListener('load', handleLoadSuccess);
      img.removeEventListener('error', handleLoadFailed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, refreshToken, keepListening, ...deps]);

  // keepListening=true인 경우에는 src 속성을 감시합니다.
  useEffect(() => {
    if (!img) return;
    if (!keepListening) return;

    const lastSrc: string | undefined = img.src;

    // src 변경 시 호출
    const observer = new MutationObserver(() => {
      if (img.src && img.src !== lastSrc) {
        setRefreshToken((p) => p + 1);
      }
    });

    // src 속성 변경 감지
    observer.observe(img, { attributes: true, attributeFilter: ['src'] });
    return () => {
      observer.disconnect();
    };
  }, [img, keepListening]);
}
