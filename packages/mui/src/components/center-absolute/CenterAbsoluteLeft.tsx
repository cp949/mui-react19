import type { BoxProps } from '@mui/material';
import type { CSSProperties, FunctionComponent } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';

export interface CenterAbsoluteLeftProps extends BoxProps {
  left?: CSSProperties['left'];
  fullWidth?: boolean;
}

export const CenterAbsoluteLeft = createAbsoluteBox({
  displayName: 'CenterAbsolute.Left',
  axes: [{ cssProp: 'left', defaultValue: 0 }],
  fixedStyle: { top: '50%', transform: 'translateY(-50%)' },
  supportsFullWidth: true,
}) as FunctionComponent<CenterAbsoluteLeftProps>;
