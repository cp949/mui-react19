import { useMediaQuery, type UseMediaQueryOptions, useTheme } from '@mui/material';

export function useSmOrDown(options?: UseMediaQueryOptions) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'), options);
}
