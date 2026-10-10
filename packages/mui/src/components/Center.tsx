import Stack, { type StackProps } from '@mui/material/Stack';

export interface CenterProps extends Omit<StackProps, 'direction'> {
  vertical?: boolean;
}

export const Center = ({ vertical = false, sx, ref, ...props }: CenterProps) => {
  return (
    <Stack
      ref={ref}
      {...props}
      direction={vertical ? 'column' : 'row'}
      sx={[
        {
          alignItems: 'center',
          justifyContent: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    />
  );
};

Center.displayName = 'Center';
