import type { ReactNode } from 'react';

export interface HideProps {
  /**
   * 개발자 설명
   */
  devComment?: unknown;

  children?: ReactNode;
}

export function Hide(_props: HideProps) {
  return null;
}
