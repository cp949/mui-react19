import { type UseMediaQueryOptions, useMediaQuery, useTheme } from '@mui/material';

export function useSmOrUp(options?: UseMediaQueryOptions) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('sm'), options);
}
