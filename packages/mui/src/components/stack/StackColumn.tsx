import type { StackProps } from '@mui/material';
import type { FunctionComponent } from 'react';
import { createLayoutComponent } from '../layout/create-layout-component.js';

export interface StackColumnProps extends Omit<StackProps, 'direction'> {
  center?: boolean;
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
}

/** 원본 createComponent가 노출하던 서브변형 Props 타입 표면과 동일(StackProps 기반, direction 포함). */
interface StackColumnSubVariantProps extends StackProps {
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
}

const StackColumnCenter = createLayoutComponent({
  displayName: 'StackColumn.Center',
  base: 'stack',
  direction: 'column',
  defaultProps: { justifyContent: 'center' },
}) as FunctionComponent<StackColumnSubVariantProps>;

const StackColumnStart = createLayoutComponent({
  displayName: 'StackColumn.Start',
  base: 'stack',
  direction: 'column',
  defaultProps: { justifyContent: 'flex-start' },
}) as FunctionComponent<StackColumnSubVariantProps>;

const StackColumnEnd = createLayoutComponent({
  displayName: 'StackColumn.End',
  base: 'stack',
  direction: 'column',
  defaultProps: { justifyContent: 'flex-end' },
}) as FunctionComponent<StackColumnSubVariantProps>;

const StackColumnBetween = createLayoutComponent({
  displayName: 'StackColumn.Between',
  base: 'stack',
  direction: 'column',
  defaultProps: { justifyContent: 'space-between' },
}) as FunctionComponent<StackColumnSubVariantProps>;

const StackColumnAround = createLayoutComponent({
  displayName: 'StackColumn.Around',
  base: 'stack',
  direction: 'column',
  defaultProps: { justifyContent: 'space-around' },
}) as FunctionComponent<StackColumnSubVariantProps>;

const StackColumnEvenly = createLayoutComponent({
  displayName: 'StackColumn.Evenly',
  base: 'stack',
  direction: 'column',
  defaultProps: { justifyContent: 'space-evenly' },
}) as FunctionComponent<StackColumnSubVariantProps>;

interface StackColumnComponent extends React.FunctionComponent<StackColumnProps> {
  Start: typeof StackColumnStart;
  End: typeof StackColumnEnd;
  Between: typeof StackColumnBetween;
  Around: typeof StackColumnAround;
  Center: typeof StackColumnCenter;
  Evenly: typeof StackColumnEvenly;
}

const StackColumnBase = createLayoutComponent({
  displayName: 'StackColumn',
  base: 'stack',
  direction: 'column',
  supportsCenterProp: true,
}) as StackColumnComponent;

export const StackColumn = StackColumnBase;
StackColumn.Start = StackColumnStart;
StackColumn.End = StackColumnEnd;
StackColumn.Between = StackColumnBetween;
StackColumn.Around = StackColumnAround;
StackColumn.Center = StackColumnCenter;
StackColumn.Evenly = StackColumnEvenly;
