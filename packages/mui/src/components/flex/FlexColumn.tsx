import type { FunctionComponent } from 'react';
import { createLayoutComponent } from '../layout/create-layout-component.js';
import type { FlexBaseProps } from './types.js';

const FlexColumnStart = createLayoutComponent({
  displayName: 'FlexColumn.Start',
  base: 'box',
  direction: 'column',
  defaultProps: { justifyContent: 'flex-start' },
}) as FunctionComponent<FlexBaseProps>;

const FlexColumnEnd = createLayoutComponent({
  displayName: 'FlexColumn.End',
  base: 'box',
  direction: 'column',
  defaultProps: { justifyContent: 'flex-end' },
}) as FunctionComponent<FlexBaseProps>;

const FlexColumnCenter = createLayoutComponent({
  displayName: 'FlexColumn.Center',
  base: 'box',
  direction: 'column',
  defaultProps: { justifyContent: 'center' },
}) as FunctionComponent<FlexBaseProps>;

const FlexColumnAround = createLayoutComponent({
  displayName: 'FlexColumn.Around',
  base: 'box',
  direction: 'column',
  defaultProps: { justifyContent: 'space-around' },
}) as FunctionComponent<FlexBaseProps>;

const FlexColumnBetween = createLayoutComponent({
  displayName: 'FlexColumn.Between',
  base: 'box',
  direction: 'column',
  defaultProps: { justifyContent: 'space-between' },
}) as FunctionComponent<FlexBaseProps>;

const FlexColumnEvenly = createLayoutComponent({
  displayName: 'FlexColumn.Evenly',
  base: 'box',
  direction: 'column',
  defaultProps: { justifyContent: 'space-evenly' },
}) as FunctionComponent<FlexBaseProps>;

export interface FlexColumnProps extends FlexBaseProps {
  center?: boolean;
}

interface FlexColumnComponent extends React.FunctionComponent<FlexColumnProps> {
  Start: typeof FlexColumnStart;
  End: typeof FlexColumnEnd;
  Center: typeof FlexColumnCenter;
  Between: typeof FlexColumnBetween;
  Around: typeof FlexColumnAround;
  Evenly: typeof FlexColumnEvenly;
}

const FlexColumnBase = createLayoutComponent({
  displayName: 'FlexColumn',
  base: 'box',
  direction: 'column',
  supportsCenterProp: true,
}) as FlexColumnComponent;

export const FlexColumn = FlexColumnBase;
FlexColumn.Start = FlexColumnStart;
FlexColumn.End = FlexColumnEnd;
FlexColumn.Center = FlexColumnCenter;
FlexColumn.Between = FlexColumnBetween;
FlexColumn.Evenly = FlexColumnEvenly;
FlexColumn.Around = FlexColumnAround;
