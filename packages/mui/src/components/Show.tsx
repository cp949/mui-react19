import type { FC, ReactNode } from 'react';

export interface ShowProps {
  when: boolean | null | undefined;
  children?: ReactNode;
  fallback?: ReactNode;
}

export const Show: FC<ShowProps> = ({ when, fallback, children }) => {
  if (when) {
    return children;
  }
  return fallback;
};

Show.displayName = 'Show';
