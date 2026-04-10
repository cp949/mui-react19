import { type UseMediaQueryOptions, useMediaQuery, useTheme } from '@mui/material';

export function useLgOrUp(options?: UseMediaQueryOptions) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('lg'), options);
}
