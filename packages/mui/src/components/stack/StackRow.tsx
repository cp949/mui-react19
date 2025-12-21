import type { StackProps } from '@mui/material';
import { Stack } from '@mui/material';
import { forwardRef } from 'react';
import { createComponent } from './create-component.js';

export interface StackRowProps extends Omit<StackProps, 'direction'> {
  center?: boolean;
}

const StackRowCenter = createComponent('StackRow.Center', 'row', {
  justifyContent: 'center',
});

const StackRowStart = createComponent('StackRow.Start', 'row', {
  justifyContent: 'flex-start',
});

const StackRowEnd = createComponent('StackRow.End', 'row', {
  justifyContent: 'flex-end',
});

const StackRowBetween = createComponent('StackRow.Between', 'row', {
  justifyContent: 'space-between',
});

const StackRowAround = createComponent('StackRow.Around', 'row', {
  justifyContent: 'space-around',
});

const StackRowEvenly = createComponent('StackRow.Evenly', 'row', {
  justifyContent: 'space-evenly',
});

interface StackRowComponent extends React.ForwardRefExoticComponent<StackRowProps> {
  Start: typeof StackRowStart;
  End: typeof StackRowEnd;
  Between: typeof StackRowBetween;
  Around: typeof StackRowAround;
  Center: typeof StackRowCenter;
  Evenly: typeof StackRowEvenly;
}

export const StackRow = forwardRef<HTMLDivElement, StackRowProps>(
  ({ center = false, alignItems, justifyContent, children, ...props }, ref) => {
    return (
      <Stack
        direction="row"
        alignItems={center ? 'center' : alignItems}
        justifyContent={center ? 'center' : justifyContent}
        {...props}
        ref={ref}
      >
        {children}
      </Stack>
    );
  },
) as StackRowComponent;

StackRow.displayName = 'StackRow';
StackRow.Start = StackRowStart;
StackRow.End = StackRowEnd;
StackRow.Between = StackRowBetween;
StackRow.Around = StackRowAround;
StackRow.Center = StackRowCenter;
StackRow.Evenly = StackRowEvenly;
