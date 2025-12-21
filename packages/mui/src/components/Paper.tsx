import { Paper as MuiPaper, type PaperProps as MuiPaperProps } from '@mui/material';
import clsx from 'clsx';

export interface PaperProps extends MuiPaperProps {
  squared?: boolean;
  outlined?: boolean;
}

export function Paper(props: PaperProps) {
  const { className, sx, squared, outlined, children, ...rest } = props;
  return (
    <MuiPaper
      {...rest}
      className={clsx('Paper-root', className)}
      sx={[
        {
          borderRadius: squared ? 0 : 1,
          border: outlined ? '1px solid #ddd' : 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    >
      {children}
    </MuiPaper>
  );
}
