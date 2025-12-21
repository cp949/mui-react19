import { Box, type SxProps } from '@mui/material';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface Props {
  sx?: SxProps;
  className?: string;
  text?: ReactNode;
  maxLen: number;
  currentLen?: number;
}

export function LengthLimitHelperText(props: Props) {
  const { sx, className, text, maxLen, currentLen = 0 } = props;

  const error = currentLen > maxLen;

  if (text) {
    return (
      <Box
        alignItems="flex-start"
        className={clsx('LengthLimitHelperText-root', className)}
        component="span"
        sx={[
          {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: error ? 'error.main' : 'text.secondary',
          },
          ...(Array.isArray(sx) ? sx : [sx ?? false]),
        ]}
      >
        {typeof text === 'string' ? <span>{text}</span> : text}
        <Box component="span" sx={{ ml: 2, whiteSpace: 'nowrap' }}>
          {currentLen} / {maxLen}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      alignItems="flex-start"
      className={clsx('LengthLimitHelperText-root', className)}
      component="span"
      sx={[
        {
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          color: error ? 'error.main' : 'text.secondary',
          whiteSpace: 'nowrap',
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    >
      {currentLen} / {maxLen}
    </Box>
  );
}
