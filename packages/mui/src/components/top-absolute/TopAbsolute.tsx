import { Box, type BoxProps } from '@mui/material';
import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import { TopAbsoluteCenter } from './TopAbsoluteCenter.js';
import { TopAbsoluteLeft } from './TopAbsoluteLeft.js';
import { TopAbsoluteRight } from './TopAbsoluteRight.js';

export type { TopAbsoluteCenterProps } from './TopAbsoluteCenter.js';
export type { TopAbsoluteLeftProps } from './TopAbsoluteLeft.js';
export type { TopAbsoluteRightProps } from './TopAbsoluteRight.js';

/**
 * `TopAbsolute` 컴포넌트의 속성을 정의합니다.
 */
export interface TopAbsoluteProps extends BoxProps {
  /**
   * 상단 위치를 설정합니다.
   *
   * @default 0
   */
  top?: CSSProperties['top'];

  /**
   * 좌측 위치를 설정합니다.
   *
   * @default 0
   */
  left?: CSSProperties['left'];

  /**
   * 우측 위치를 설정합니다.
   *
   * @default 0
   */
  right?: CSSProperties['right'];
}

interface TopAbsoluteComponent extends React.ForwardRefExoticComponent<TopAbsoluteProps> {
  Left: typeof TopAbsoluteLeft;
  Right: typeof TopAbsoluteRight;
  Center: typeof TopAbsoluteCenter;
}

const TopAbsoluteBase = forwardRef<HTMLDivElement, TopAbsoluteProps>(
  ({ top = 0, left = 0, right = 0, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            position: 'absolute',
            top,
            left,
            right,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
) as TopAbsoluteComponent;
TopAbsoluteBase.displayName = 'TopAbsoluteBase';

export const TopAbsolute = TopAbsoluteBase;
TopAbsolute.displayName = 'TopAbsolute';
TopAbsolute.Left = TopAbsoluteLeft;
TopAbsolute.Right = TopAbsoluteRight;
TopAbsolute.Center = TopAbsoluteCenter;
