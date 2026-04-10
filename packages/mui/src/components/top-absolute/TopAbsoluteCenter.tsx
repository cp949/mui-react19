import { Box, type BoxProps } from '@mui/material';
import { type CSSProperties, forwardRef } from 'react';

/**
 * `TopAbsoluteCenter` 컴포넌트의 속성을 정의합니다.
 */
export interface TopAbsoluteCenterProps extends BoxProps {
  /**
   * 컴포넌트가 부모 컨테이너의 전체 너비를 차지하도록 설정합니다.
   *
   * @default false
   */
  fullWidth?: boolean;

  /**
   * 상단 위치를 설정합니다. CSS의 `top` 속성과 동일합니다.
   *
   * @default 0
   */
  top?: CSSProperties['top'];
}

/**
 * `TopAbsoluteCenter` 컴포넌트는 요소를 상단 중앙에 배치하는 데 사용됩니다.
 *
 * - `position: "absolute"`를 기본으로 설정합니다.
 * - `left: "50%"`와 `transform: "translate(-50%, -50%)"`를 사용하여 수평 중앙에 위치시킵니다.
 * - `fullWidth` 속성을 사용하여 너비를 100%로 설정할 수 있습니다.
 *
 * @param props - `TopAbsoluteCenterProps` 속성
 * @returns 상단 중앙에 배치된 스타일의 박스를 렌더링합니다.
 *
 * @example
 * ```tsx
 * <TopAbsolute.Center top="20px" fullWidth>
 *   상단 중앙에 위치한 요소
 * </TopAbsolute.Center>
 * ```
 */
export const TopAbsoluteCenter = forwardRef<HTMLDivElement, TopAbsoluteCenterProps>(
  ({ fullWidth, top, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            position: 'absolute', // 절대 위치 설정
            top, // 사용자 정의 top 값
            left: '50%', // 수평 중앙 위치
            transform: 'translate(-50%, -50%)', // 수평 중앙 정렬
            ...(fullWidth && {
              width: '100%', // 전체 너비 설정
            }),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
);

// 컴포넌트 디스플레이 이름 설정
TopAbsoluteCenter.displayName = 'TopAbsolute.Center';
