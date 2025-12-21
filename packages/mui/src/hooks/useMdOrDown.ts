import { useMediaQuery, type UseMediaQueryOptions, useTheme } from '@mui/material';

export function useMdOrDown(options?: UseMediaQueryOptions) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('lg'), options);
}
