import { useTheme } from '@mui/material/styles';
import useMediaQuery, { type UseMediaQueryOptions } from '@mui/material/useMediaQuery';

export function useSmOrUp(options?: UseMediaQueryOptions) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('sm'), options);
}
