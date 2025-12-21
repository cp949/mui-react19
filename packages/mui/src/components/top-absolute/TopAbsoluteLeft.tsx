import { Box, type BoxProps } from '@mui/material';
import { forwardRef } from 'react';
import { type CSSProperties } from 'react';

/**
 * `TopAbsoluteLeft` 컴포넌트의 속성을 정의합니다.
 */
export interface TopAbsoluteLeftProps extends BoxProps {
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

  /**
   * 좌측 위치를 설정합니다. CSS의 `left` 속성과 동일합니다.
   *
   * @default 0
   */
  left?: CSSProperties['left'];
}

/**
 * `TopAbsoluteLeft` 컴포넌트는 요소를 상단 좌측에 배치하는 데 사용됩니다.
 *
 * - `position: "absolute"`를 기본으로 설정합니다.
 * - `top`과 `left` 속성을 사용하여 요소의 위치를 조정할 수 있습니다.
 * - `fullWidth` 속성을 사용하여 너비를 100%로 설정할 수 있습니다.
 *
 * @param props - `TopAbsoluteLeftProps` 속성
 * @returns 상단 좌측에 배치된 스타일의 박스를 렌더링합니다.
 *
 * @example
 * ```tsx
 * <TopAbsolute.Left top="20px" left="10px" fullWidth>
 *   상단 좌측에 위치한 요소
 * </TopAbsolute.Left>
 * ```
 */
export const TopAbsoluteLeft = forwardRef<HTMLDivElement, TopAbsoluteLeftProps>(
  ({ fullWidth, left = 0, top = 0, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            position: 'absolute', // 절대 위치 설정
            left, // 사용자 정의 left 값
            top, // 사용자 정의 top 값
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
TopAbsoluteLeft.displayName = 'TopAbsolute.Left';
