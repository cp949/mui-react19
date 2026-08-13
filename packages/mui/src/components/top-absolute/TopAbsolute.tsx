import type { BoxProps } from '@mui/material';
import type { CSSProperties } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';
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

interface TopAbsoluteComponent extends React.FunctionComponent<TopAbsoluteProps> {
  Left: typeof TopAbsoluteLeft;
  Right: typeof TopAbsoluteRight;
  Center: typeof TopAbsoluteCenter;
}

const TopAbsoluteBase = createAbsoluteBox({
  displayName: 'TopAbsolute',
  axes: [
    { cssProp: 'top', defaultValue: 0 },
    { cssProp: 'left', defaultValue: 0 },
    { cssProp: 'right', defaultValue: 0 },
  ],
  supportsFullWidth: false,
}) as TopAbsoluteComponent;

export const TopAbsolute = TopAbsoluteBase;
TopAbsolute.Left = TopAbsoluteLeft;
TopAbsolute.Right = TopAbsoluteRight;
TopAbsolute.Center = TopAbsoluteCenter;
