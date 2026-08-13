import type { BoxProps } from '@mui/material';
import type { CSSProperties } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';
import { BottomAbsoluteCenter } from './BottomAbsoluteCenter.js';
import { BottomAbsoluteLeft } from './BottomAbsoluteLeft.js';
import { BottomAbsoluteRight } from './BottomAbsoluteRight.js';

export type { BottomAbsoluteCenterProps } from './BottomAbsoluteCenter.js';
export type { BottomAbsoluteLeftProps } from './BottomAbsoluteLeft.js';
export type { BottomAbsoluteRightProps } from './BottomAbsoluteRight.js';

export interface BottomAbsoluteProps extends BoxProps {
  left?: CSSProperties['left'];
  right?: CSSProperties['right'];
  bottom?: CSSProperties['bottom'];
}

interface BottomAbsoluteComponent extends React.FunctionComponent<BottomAbsoluteProps> {
  Left: typeof BottomAbsoluteLeft;
  Right: typeof BottomAbsoluteRight;
  Center: typeof BottomAbsoluteCenter;
}

const BottomAbsoluteBase = createAbsoluteBox({
  displayName: 'BottomAbsolute',
  axes: [
    { cssProp: 'bottom', defaultValue: 0 },
    { cssProp: 'left', defaultValue: 0 },
    { cssProp: 'right', defaultValue: 0 },
  ],
  supportsFullWidth: false,
}) as BottomAbsoluteComponent;

export const BottomAbsolute = BottomAbsoluteBase;
BottomAbsolute.Left = BottomAbsoluteLeft;
BottomAbsolute.Right = BottomAbsoluteRight;
BottomAbsolute.Center = BottomAbsoluteCenter;
