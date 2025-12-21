import type { HookCase, HookCaseRunResult } from '../cases/types';

export async function runHookCase(hookCase: HookCase): Promise<HookCaseRunResult> {
  if (!hookCase.run) {
    return { status: 'skipped' };
  }

  try {
    return await hookCase.run();
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}\n${e.stack ?? ''}` : String(e);
    return { status: 'fail', error: msg };
  }
}
