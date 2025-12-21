import { useEffect, useRef, useState } from 'react';

/**
 * 특정 요소가 뷰포트의 세로 중앙에 위치해 있는지를 감지하는 커스텀 React 훅입니다.
 *
 * 요소의 세로 중심점이 뷰포트 중심(`window.innerHeight / 2`)과의 거리 차가
 * 지정된 오차 범위(`offset`) 이내에 있는 경우, `isCenter` 값이 `true`가 됩니다.
 *
 * 이 훅은 요소가 뷰포트 중앙에 시각적으로 들어왔는지를 감지하는 데 유용합니다.
 *
 * @param offset - 중심 간 거리 차이 허용 범위(px). 기본값은 0이며, 값이 클수록 더 넓은 범위를 "중앙"으로 인식합니다.
 * @returns 객체 형태로 `ref`와 `isCenter`를 반환합니다.
 *
 * @example
 * ```tsx
 * const { ref, isCenter } = useCenterInView(50);
 *
 * return (
 *   <div ref={ref}>
 *     {isCenter ? '중앙에 있어요!' : '중앙이 아님'}
 *   </div>
 * );
 * ```
 */
export function useCenterInView(offset = 0): {
  ref: React.RefObject<HTMLDivElement | null>;
  isCenter: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [isCenter, setIsCenter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;

      setIsCenter(Math.abs(elementCenter - viewportCenter) <= offset);
    };

    handleScroll(); // 초기 체크
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [offset]);

  return { ref, isCenter };
}
