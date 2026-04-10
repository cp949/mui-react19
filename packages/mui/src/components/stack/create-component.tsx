import type { StackProps } from '@mui/material';
import { Stack } from '@mui/material';
import { forwardRef } from 'react';
import { overrideProps } from '../../util/override-props.js';

export interface CreateComponentProps extends StackProps {
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
}

export function createComponent(
  displayName: string,
  direction: StackProps['direction'],
  defaultProps: object,
) {
  const Component = forwardRef<HTMLDivElement, CreateComponentProps>(
    ({ alignItems, justifyContent, ...props }, ref) => {
      const sxOverride = overrideProps(defaultProps, {
        alignItems,
        justifyContent,
      });
      return (
        <Stack
          direction={direction}
          {...props}
          ref={ref}
          sx={[sxOverride, ...(Array.isArray(props.sx) ? props.sx : [props.sx ?? false])]}
        />
      );
    },
  );
  Component.displayName = displayName;
  return Component;
}
