import type { BoxProps } from '@mui/material';
import type { CSSProperties, FunctionComponent } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';

export interface BottomAbsoluteRightProps extends BoxProps {
  fullWidth?: boolean;
  bottom?: CSSProperties['bottom'];
  right?: CSSProperties['right'];
}

export const BottomAbsoluteRight = createAbsoluteBox({
  displayName: 'BottomAbsolute.Right',
  axes: [
    { cssProp: 'right', defaultValue: 0 },
    { cssProp: 'bottom', defaultValue: 0 },
  ],
  supportsFullWidth: true,
}) as FunctionComponent<BottomAbsoluteRightProps>;
