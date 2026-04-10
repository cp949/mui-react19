import { type UseMediaQueryOptions, useMediaQuery, useTheme } from '@mui/material';

export function useMdOrUp(options?: UseMediaQueryOptions) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('md'), options);
}
