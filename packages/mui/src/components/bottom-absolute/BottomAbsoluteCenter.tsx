import type { BoxProps } from '@mui/material';
import type { CSSProperties, FunctionComponent } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';

export interface BottomAbsoluteCenterProps extends BoxProps {
  fullWidth?: boolean;
  bottom?: CSSProperties['bottom'];
}

export const BottomAbsoluteCenter = createAbsoluteBox({
  displayName: 'BottomAbsolute.Center',
  axes: [{ cssProp: 'bottom', defaultValue: 0 }],
  fixedStyle: { left: '50%', transform: 'translate(-50%, -50%)' },
  supportsFullWidth: true,
}) as FunctionComponent<BottomAbsoluteCenterProps>;
