import { Box } from '@mui/material';
import { forwardRef } from 'react';
import { overrideProps } from '../../util/override-props.js';
import { createFlexComponent } from './create-component.js';
import type { FlexBaseProps } from './types.js';

const FlexRowStart = createFlexComponent('FlexRow.Start', 'row', {
  justifyContent: 'flex-start',
});

const FlexRowEnd = createFlexComponent('FlexRow.End', 'row', {
  justifyContent: 'flex-end',
});

const FlexRowAround = createFlexComponent('FlexRow.Around', 'row', {
  justifyContent: 'space-around',
});

const FlexRowBetween = createFlexComponent('FlexRow.Between', 'row', {
  justifyContent: 'space-between',
});

const FlexRowEvenly = createFlexComponent('FlexRow.Evenly', 'row', {
  justifyContent: 'space-evenly',
});

const FlexRowCenter = createFlexComponent('FlexRow.Center', 'row', {
  justifyContent: 'center',
});

export interface FlexRowProps extends FlexBaseProps {
  center?: boolean;
}

interface FlexRowComponent extends React.ForwardRefExoticComponent<FlexRowProps> {
  Start: typeof FlexRowStart;
  End: typeof FlexRowEnd;
  Center: typeof FlexRowCenter;
  Between: typeof FlexRowBetween;
  Around: typeof FlexRowAround;
  Evenly: typeof FlexRowEvenly;
}

const FlexRowBase = forwardRef<HTMLDivElement, FlexRowProps>(
  ({ center, inlineFlex = false, justifyContent, alignItems, flexWrap, sx, ...props }, ref) => {
    // undefined/null/false 완전히 제거하여 hydration error 방지
    const sxArray = Array.isArray(sx) ? sx.filter(Boolean) : sx ? [sx] : [];

    const baseStyle = {
      display: inlineFlex ? 'inline-flex' : 'flex',
      flexDirection: 'row' as const,
      ...overrideProps(
        center
          ? {
              justifyContent: 'center' as const,
              alignItems: 'center' as const,
            }
          : {},
        { justifyContent, alignItems, flexWrap },
      ),
    };

    return (
      <Box ref={ref} sx={sxArray.length > 0 ? [baseStyle, ...sxArray] : baseStyle} {...props} />
    );
  },
) as FlexRowComponent;
FlexRowBase.displayName = 'FlexRowBase';

export const FlexRow = FlexRowBase;
FlexRow.displayName = 'FlexRow';
FlexRow.Start = FlexRowStart;
FlexRow.End = FlexRowEnd;
FlexRow.Center = FlexRowCenter;
FlexRow.Between = FlexRowBetween;
FlexRow.Around = FlexRowAround;
FlexRow.Evenly = FlexRowEvenly;
