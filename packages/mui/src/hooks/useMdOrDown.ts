import { useTheme } from '@mui/material/styles';
import useMediaQuery, { type UseMediaQueryOptions } from '@mui/material/useMediaQuery';

export function useMdOrDown(options?: UseMediaQueryOptions) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('lg'), options);
}
