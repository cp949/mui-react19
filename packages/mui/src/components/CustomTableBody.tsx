import { TableBody, type TableBodyProps } from '@mui/material';
import clsx from 'clsx';

export interface CustomTableBodyProps extends TableBodyProps {
  loading?: boolean;
  stripe?: boolean;
}

export function CustomTableBody(props: CustomTableBodyProps) {
  const { sx, className, loading, stripe, ...otherProps } = props;

  return (
    <TableBody
      className={clsx('CustomTableBody-root', className, {
        'CustomTableBody-stripe': !!stripe,
        'CustomTableBody-loading': !!loading,
      })}
      sx={[
        {
          '&.CustomTableBody-loading': {
            opacity: 0.5,
          },
          '&.CustomTableBody-stripe': {
            '& .MuiTableRow-root:nth-of-type(even)': {
              backgroundColor: 'action.hover',
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
      {...otherProps}
    />
  );
}
