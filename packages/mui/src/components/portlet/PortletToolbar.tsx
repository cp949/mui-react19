import { type ReactNode } from 'react';

export interface PortletToolbarProps {
  icon: ReactNode;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PortletToolbar(props: PortletToolbarProps) {
  const { children } = props;
  return (
    <div
      className="PortletToolbar-root"
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        display: 'flex',
      }}
    >
      {children}
    </div>
  );
}
