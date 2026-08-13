import type { BoxProps } from '@mui/material';
import type { CSSProperties, FunctionComponent } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';

export interface BottomAbsoluteLeftProps extends BoxProps {
  fullWidth?: boolean;
  bottom?: CSSProperties['bottom'];
  left?: CSSProperties['left'];
}

export const BottomAbsoluteLeft = createAbsoluteBox({
  displayName: 'BottomAbsolute.Left',
  axes: [
    { cssProp: 'left', defaultValue: 0 },
    { cssProp: 'bottom', defaultValue: 0 },
  ],
  supportsFullWidth: true,
}) as FunctionComponent<BottomAbsoluteLeftProps>;
