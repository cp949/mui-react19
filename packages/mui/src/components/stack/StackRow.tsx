import type { StackProps } from '@mui/material';
import type { FunctionComponent } from 'react';
import { createLayoutComponent } from '../layout/create-layout-component.js';

export interface StackRowProps extends Omit<StackProps, 'direction'> {
  center?: boolean;
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
}

interface StackRowSubVariantProps extends StackProps {
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
}

const StackRowCenter = createLayoutComponent({
  displayName: 'StackRow.Center',
  base: 'stack',
  direction: 'row',
  defaultProps: { justifyContent: 'center' },
}) as FunctionComponent<StackRowSubVariantProps>;

const StackRowStart = createLayoutComponent({
  displayName: 'StackRow.Start',
  base: 'stack',
  direction: 'row',
  defaultProps: { justifyContent: 'flex-start' },
}) as FunctionComponent<StackRowSubVariantProps>;

const StackRowEnd = createLayoutComponent({
  displayName: 'StackRow.End',
  base: 'stack',
  direction: 'row',
  defaultProps: { justifyContent: 'flex-end' },
}) as FunctionComponent<StackRowSubVariantProps>;

const StackRowBetween = createLayoutComponent({
  displayName: 'StackRow.Between',
  base: 'stack',
  direction: 'row',
  defaultProps: { justifyContent: 'space-between' },
}) as FunctionComponent<StackRowSubVariantProps>;

const StackRowAround = createLayoutComponent({
  displayName: 'StackRow.Around',
  base: 'stack',
  direction: 'row',
  defaultProps: { justifyContent: 'space-around' },
}) as FunctionComponent<StackRowSubVariantProps>;

const StackRowEvenly = createLayoutComponent({
  displayName: 'StackRow.Evenly',
  base: 'stack',
  direction: 'row',
  defaultProps: { justifyContent: 'space-evenly' },
}) as FunctionComponent<StackRowSubVariantProps>;

interface StackRowComponent extends React.FunctionComponent<StackRowProps> {
  Start: typeof StackRowStart;
  End: typeof StackRowEnd;
  Between: typeof StackRowBetween;
  Around: typeof StackRowAround;
  Center: typeof StackRowCenter;
  Evenly: typeof StackRowEvenly;
}

const StackRowBase = createLayoutComponent({
  displayName: 'StackRow',
  base: 'stack',
  direction: 'row',
  supportsCenterProp: true,
}) as StackRowComponent;

export const StackRow = StackRowBase;
StackRow.Start = StackRowStart;
StackRow.End = StackRowEnd;
StackRow.Between = StackRowBetween;
StackRow.Around = StackRowAround;
StackRow.Center = StackRowCenter;
StackRow.Evenly = StackRowEvenly;
