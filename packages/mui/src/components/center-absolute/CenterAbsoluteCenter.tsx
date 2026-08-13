import type { BoxProps } from '@mui/material';
import type { FunctionComponent } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';

export interface CenterAbsoluteCenterProps extends BoxProps {
  fullWidth?: boolean;
}

export const CenterAbsoluteCenter = createAbsoluteBox({
  displayName: 'CenterAbsolute.Center',
  axes: [],
  fixedStyle: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  supportsFullWidth: true,
}) as FunctionComponent<CenterAbsoluteCenterProps>;
