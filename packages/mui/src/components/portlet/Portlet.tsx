import { Paper, type PaperProps } from '@mui/material';
import { clsx } from 'clsx';
import type { FunctionComponent, ReactNode } from 'react';
import { PortletContent } from './PortletContent.js';
import { PortletFooter } from './PortletFooter.js';
import { PortletHeader } from './PortletHeader.js';
import { PortletLabel } from './PortletLabel.js';
import { PortletToolbar } from './PortletToolbar.js';

export type { PortletContentProps } from './PortletContent.js';
export type { PortletFooterProps } from './PortletFooter.js';
export type { PortletHeaderProps } from './PortletHeader.js';
export type { PortletLabelProps } from './PortletLabel.js';
export type { PortletToolbarProps } from './PortletToolbar.js';

const defaultProps: PaperProps = {
  square: true,
};

export interface PortletProps extends Omit<PaperProps, 'elevation' | 'component' | 'nonce'> {
  children?: ReactNode;
}

interface PortletComponent extends FunctionComponent<PortletProps> {
  Content: typeof PortletContent;
  Header: typeof PortletHeader;
  Footer: typeof PortletFooter;
  Label: typeof PortletLabel;
  Toolbar: typeof PortletToolbar;
}

/**
 * Label, Toolbar, Content, Footer를 조립하는 카드형 컨테이너입니다.
 *
 * @param props Paper 속성과 Portlet 자식 요소
 * @returns 테두리와 세로 레이아웃이 적용된 Portlet
 * @example
 * ```tsx
 * <Portlet>
 *   <Portlet.Header>
 *     <Portlet.Label title='상태' />
 *     <Portlet.Toolbar>도구</Portlet.Toolbar>
 *   </Portlet.Header>
 *   <Portlet.Content>내용</Portlet.Content>
 * </Portlet>
 * ```
 */
export const Portlet = ((props: PortletProps) => {
  const { sx, className, children, ref, ...restProps } = props;
  return (
    <Paper
      {...defaultProps}
      {...restProps}
      elevation={0}
      ref={ref}
      component='div'
      className={clsx('Portlet-root', className)}
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          border: '1px solid #E0E4EE',
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    >
      {children}
    </Paper>
  );
}) as PortletComponent;

Portlet.displayName = 'Portlet';
Portlet.Content = PortletContent;
Portlet.Header = PortletHeader;
Portlet.Footer = PortletFooter;
Portlet.Label = PortletLabel;
Portlet.Toolbar = PortletToolbar;
