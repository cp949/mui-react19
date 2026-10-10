import { useTheme } from '@mui/material/styles';
import useMediaQuery, { type UseMediaQueryOptions } from '@mui/material/useMediaQuery';

export function useMdOrUp(options?: UseMediaQueryOptions) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('md'), options);
}
