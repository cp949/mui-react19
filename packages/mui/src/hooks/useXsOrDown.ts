import { type UseMediaQueryOptions, useMediaQuery, useTheme } from '@mui/material';

export function useXsOrDown(options?: UseMediaQueryOptions) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'), options);
}
