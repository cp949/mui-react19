import { Paper, type PaperProps } from '@mui/material';
import type { ReactNode } from 'react';
import { PortletContent } from './PortletContent.js';
import { PortletFooter } from './PortletFooter.js';
import { PortletHeader } from './PortletHeader.js';

export type { PortletContentProps } from './PortletContent.js';
export type { PortletFooterProps } from './PortletFooter.js';
export type { PortletHeaderProps } from './PortletHeader.js';

const defaultProps: PaperProps = {
  square: true,
};

export interface PortletProps extends Omit<PaperProps, 'elevation' | 'component' | 'nonce'> {
  children?: ReactNode;
}

interface PortletComponent extends React.FunctionComponent<PortletProps> {
  Content: typeof PortletContent;
  Header: typeof PortletHeader;
  Footer: typeof PortletFooter;
}

export const Portlet = ((props: PortletProps) => {
  const { sx, className, children, ref, ...restProps } = props;
  return (
    <Paper
      {...defaultProps}
      {...restProps}
      elevation={0}
      ref={ref}
      component='div'
      className={className ? `Portlet-root ${className}` : 'Portlet-root'}
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
