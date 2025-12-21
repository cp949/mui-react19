import { Box } from '@mui/material';
import { forwardRef } from 'react';
import { overrideProps } from '../../util/override-props.js';
import { createFlexComponent } from './create-component.js';
import type { FlexBaseProps } from './types.js';

const FlexColumnStart = createFlexComponent('FlexColumn.Start', 'column', {
  justifyContent: 'flex-start',
});

const FlexColumnEnd = createFlexComponent('FlexColumn.End', 'column', {
  justifyContent: 'flex-end',
});

const FlexColumnCenter = createFlexComponent('FlexColumn.Center', 'column', {
  justifyContent: 'center',
});

const FlexColumnAround = createFlexComponent('FlexColumn.Around', 'column', {
  justifyContent: 'space-around',
});

const FlexColumnBetween = createFlexComponent('FlexColumn.Between', 'column', {
  justifyContent: 'space-between',
});

const FlexColumnEvenly = createFlexComponent('FlexColumn.Evenly', 'column', {
  justifyContent: 'space-evenly',
});

export interface FlexColumnProps extends FlexBaseProps {
  center?: boolean;
}

interface FlexColumnComponent extends React.ForwardRefExoticComponent<FlexColumnProps> {
  Start: typeof FlexColumnStart;
  End: typeof FlexColumnEnd;
  Center: typeof FlexColumnCenter;
  Between: typeof FlexColumnBetween;
  Around: typeof FlexColumnAround;
  Evenly: typeof FlexColumnEvenly;
}

const FlexColumnBase = forwardRef<HTMLDivElement, FlexColumnProps>(
  ({ center, inlineFlex, justifyContent, alignItems, flexWrap, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            display: inlineFlex ? 'inline-flex' : 'flex',
            flexDirection: 'column',
            ...overrideProps(
              center
                ? {
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                : {},
              { justifyContent, alignItems, flexWrap },
            ),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
) as FlexColumnComponent;
FlexColumnBase.displayName = 'FlexColumnBase';

export const FlexColumn = FlexColumnBase;
FlexColumn.displayName = 'FlexColumn';
FlexColumn.Start = FlexColumnStart;
FlexColumn.End = FlexColumnEnd;
FlexColumn.Center = FlexColumnCenter;
FlexColumn.Between = FlexColumnBetween;
FlexColumn.Evenly = FlexColumnEvenly;
FlexColumn.Around = FlexColumnAround;
