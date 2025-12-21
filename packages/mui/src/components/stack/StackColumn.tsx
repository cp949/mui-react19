import type { StackProps } from '@mui/material';
import { Stack } from '@mui/material';
import { forwardRef } from 'react';
import { createComponent } from './create-component.js';

export interface StackColumnProps extends Omit<StackProps, 'direction'> {
  center?: boolean;
}

const StackColumnCenter = createComponent('StackColumn.Center', 'column', {
  justifyContent: 'center',
});

const StackColumnStart = createComponent('StackColumn.Start', 'column', {
  justifyContent: 'flex-start',
});

const StackColumnEnd = createComponent('StackColumn.End', 'column', {
  justifyContent: 'flex-end',
});

const StackColumnBetween = createComponent('StackColumn.Between', 'column', {
  justifyContent: 'space-between',
});

const StackColumnAround = createComponent('StackColumn.Around', 'column', {
  justifyContent: 'space-around',
});

const StackColumnEvenly = createComponent('StackColumn.Evenly', 'column', {
  justifyContent: 'space-evenly',
});

interface StackColumnComponent extends React.ForwardRefExoticComponent<StackColumnProps> {
  Start: typeof StackColumnStart;
  End: typeof StackColumnEnd;
  Between: typeof StackColumnBetween;
  Around: typeof StackColumnAround;
  Center: typeof StackColumnCenter;
  Evenly: typeof StackColumnEvenly;
}

export const StackColumn = forwardRef<HTMLDivElement, StackColumnProps>(
  ({ center = false, alignItems, justifyContent, children, ...props }, ref) => {
    return (
      <Stack
        direction="column"
        alignItems={center ? 'center' : alignItems}
        justifyContent={center ? 'center' : justifyContent}
        {...props}
        ref={ref}
      >
        {children}
      </Stack>
    );
  },
) as StackColumnComponent;

StackColumn.displayName = 'StackColumn';
StackColumn.Start = StackColumnStart;
StackColumn.End = StackColumnEnd;
StackColumn.Between = StackColumnBetween;
StackColumn.Around = StackColumnAround;
StackColumn.Center = StackColumnCenter;
StackColumn.Evenly = StackColumnEvenly;
