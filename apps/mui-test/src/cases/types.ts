import type { ComponentType } from 'react';

export type CaseId = string;

export type RunStatus = 'idle' | 'running' | 'pass' | 'fail' | 'skipped';

export type HookCaseRunResult = {
  status: Exclude<RunStatus, 'idle' | 'running'>;
  error?: string;
};

export type HookCase = {
  id: CaseId;
  name: string;
  description?: string;
  tags?: string[];

  /** Rendered in the UI always. */
  Preview: ComponentType;

  /**
   * Optional automated run.
   * If omitted, the case will be marked as 'skipped' when running.
   */
  run?: () => Promise<HookCaseRunResult>;
};

export type RunSummary = {
  pass: number;
  fail: number;
  skipped: number;
  idle: number;
  total: number;
};
