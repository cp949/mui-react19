import { Box } from '@mui/material';
import { forwardRef } from 'react';
import { overrideProps } from '../../util/override-props.js';
import type { FlexBaseProps } from './types.js';
import type { CSSProperties } from 'react';

export function createFlexComponent(
  displayName: string,
  flexDirection: CSSProperties['flexDirection'],
  defaultProps: object,
) {
  const Component = forwardRef<HTMLDivElement, FlexBaseProps>(
    ({ inlineFlex, justifyContent, alignItems, flexWrap, sx, ...props }, ref) => {
      return (
        <Box
          ref={ref}
          sx={[
            {
              display: inlineFlex ? 'inline-flex' : 'flex',
              flexDirection,
              ...overrideProps(defaultProps, {
                justifyContent,
                alignItems,
                flexWrap,
              }),
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
          {...props}
        />
      );
    },
  );
  Component.displayName = displayName;
  return Component;
}
