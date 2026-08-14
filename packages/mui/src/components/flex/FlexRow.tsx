import type { FunctionComponent } from 'react';
import { createLayoutComponent } from '../layout/create-layout-component.js';
import type { FlexBaseProps } from './types.js';

const FlexRowStart = createLayoutComponent({
  displayName: 'FlexRow.Start',
  base: 'box',
  direction: 'row',
  defaultProps: { justifyContent: 'flex-start' },
}) as FunctionComponent<FlexBaseProps>;

const FlexRowEnd = createLayoutComponent({
  displayName: 'FlexRow.End',
  base: 'box',
  direction: 'row',
  defaultProps: { justifyContent: 'flex-end' },
}) as FunctionComponent<FlexBaseProps>;

const FlexRowAround = createLayoutComponent({
  displayName: 'FlexRow.Around',
  base: 'box',
  direction: 'row',
  defaultProps: { justifyContent: 'space-around' },
}) as FunctionComponent<FlexBaseProps>;

const FlexRowBetween = createLayoutComponent({
  displayName: 'FlexRow.Between',
  base: 'box',
  direction: 'row',
  defaultProps: { justifyContent: 'space-between' },
}) as FunctionComponent<FlexBaseProps>;

const FlexRowEvenly = createLayoutComponent({
  displayName: 'FlexRow.Evenly',
  base: 'box',
  direction: 'row',
  defaultProps: { justifyContent: 'space-evenly' },
}) as FunctionComponent<FlexBaseProps>;

const FlexRowCenter = createLayoutComponent({
  displayName: 'FlexRow.Center',
  base: 'box',
  direction: 'row',
  defaultProps: { justifyContent: 'center' },
}) as FunctionComponent<FlexBaseProps>;

export interface FlexRowProps extends FlexBaseProps {
  center?: boolean;
}

interface FlexRowComponent extends React.FunctionComponent<FlexRowProps> {
  Start: typeof FlexRowStart;
  End: typeof FlexRowEnd;
  Center: typeof FlexRowCenter;
  Between: typeof FlexRowBetween;
  Around: typeof FlexRowAround;
  Evenly: typeof FlexRowEvenly;
}

const FlexRowBase = createLayoutComponent({
  displayName: 'FlexRow',
  base: 'box',
  direction: 'row',
  supportsCenterProp: true,
}) as FlexRowComponent;

export const FlexRow = FlexRowBase;
FlexRow.Start = FlexRowStart;
FlexRow.End = FlexRowEnd;
FlexRow.Center = FlexRowCenter;
FlexRow.Between = FlexRowBetween;
FlexRow.Around = FlexRowAround;
FlexRow.Evenly = FlexRowEvenly;
