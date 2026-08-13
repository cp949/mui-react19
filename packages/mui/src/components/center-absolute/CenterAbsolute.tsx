import type { BoxProps } from '@mui/material';
import type { CSSProperties } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';
import { CenterAbsoluteCenter } from './CenterAbsoluteCenter.js';
import { CenterAbsoluteLeft } from './CenterAbsoluteLeft.js';
import { CenterAbsoluteRight } from './CenterAbsoluteRight.js';

export type { CenterAbsoluteCenterProps } from './CenterAbsoluteCenter.js';
export type { CenterAbsoluteLeftProps } from './CenterAbsoluteLeft.js';
export type { CenterAbsoluteRightProps } from './CenterAbsoluteRight.js';

export interface CenterAbsoluteProps extends BoxProps {
  left?: CSSProperties['left'];
  right?: CSSProperties['right'];
}

interface CenterAbsoluteComponent extends React.FunctionComponent<CenterAbsoluteProps> {
  Left: typeof CenterAbsoluteLeft;
  Right: typeof CenterAbsoluteRight;
  Center: typeof CenterAbsoluteCenter;
}

const CenterAbsoluteBase = createAbsoluteBox({
  displayName: 'CenterAbsolute',
  axes: [
    { cssProp: 'left', defaultValue: 0 },
    { cssProp: 'right', defaultValue: 0 },
  ],
  fixedStyle: { top: '50%', transform: 'translateY(-50%)' },
  supportsFullWidth: false,
}) as CenterAbsoluteComponent;

export const CenterAbsolute = CenterAbsoluteBase;
CenterAbsolute.Left = CenterAbsoluteLeft;
CenterAbsolute.Right = CenterAbsoluteRight;
CenterAbsolute.Center = CenterAbsoluteCenter;
