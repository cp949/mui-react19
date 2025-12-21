import type { StackProps } from '@mui/material';
import { Stack } from '@mui/material';
import { forwardRef } from 'react';
import { overrideProps } from '../../util/override-props.js';

export function createComponent(
  displayName: string,
  direction: StackProps['direction'],
  defaultProps: object,
) {
  const Component = forwardRef<HTMLDivElement, StackProps>(
    ({ alignItems, justifyContent, ...props }, ref) => {
      const stackProps = overrideProps(defaultProps, {
        alignItems,
        justifyContent,
      });
      return <Stack direction={direction} {...stackProps} {...props} ref={ref} />;
    },
  );
  Component.displayName = displayName;
  return Component;
}
