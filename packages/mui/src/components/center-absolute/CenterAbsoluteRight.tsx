import type { BoxProps } from '@mui/material';
import type { CSSProperties, FunctionComponent } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';

export interface CenterAbsoluteRightProps extends BoxProps {
  right?: CSSProperties['right'];
  fullWidth?: boolean;
}

export const CenterAbsoluteRight = createAbsoluteBox({
  displayName: 'CenterAbsolute.Right',
  axes: [{ cssProp: 'right', defaultValue: 0 }],
  fixedStyle: { top: '50%', transform: 'translateY(-50%)' },
  supportsFullWidth: true,
}) as FunctionComponent<CenterAbsoluteRightProps>;
