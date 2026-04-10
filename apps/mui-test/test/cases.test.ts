import {
  logDebug,
  logError,
  logGroup,
  logGroupEnd,
  logInfo,
  logMsg,
  logWarn,
} from '@cp949/web-logger';
import { describe, expect, it } from 'vitest';
import { cases } from '../src/cases';
import type { CapturedConsoleEntry } from './test-utils/captureConsole';
import { withCapturedConsole } from './test-utils/captureConsole';

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (a instanceof Error) {
        return `${a.name}: ${a.message}`;
      }
      if (typeof a === 'string') return a;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(' ');
}

function emitCaptured(entry: CapturedConsoleEntry) {
  const msg = formatArgs(entry.args);
  switch (entry.level) {
    case 'debug':
      logDebug(msg);
      return;
    case 'info':
      logInfo(msg);
      return;
    case 'warn':
      logWarn(msg);
      return;
    case 'error':
      logError(msg);
      return;
    case 'log':
      logMsg(msg);
      return;
  }
}

describe('@cp949/mui-react19 hook cases (CLI)', () => {
  for (const c of cases) {
    const name = `${c.id} - ${c.name}`;

    if (!c.run) {
      it.skip(name, () => {
        // skipped (no automated run)
      });
      continue;
    }

    const run = c.run;
    it(name, async () => {
      const { result: res, entries } = await withCapturedConsole(run, {
        // drop known noisy errors from happy-dom script loading restrictions
        filter: (entry) => {
          if (entry.level !== 'error') return true;
          const text = formatArgs(entry.args);
          return !text.includes('JavaScript file loading is disabled');
        },
      });

      if (res.status === 'skipped') {
        // Keep test suite green for environment-limited cases (e.g. ResizeObserver in happy-dom).
        if (res.error) {
          logInfo(`[skipped] ${name}: ${res.error}`);
        } else {
          logInfo(`[skipped] ${name}`);
        }
        return;
      }

      if (res.status !== 'pass') {
        if (entries.length) {
          logGroup(name);
          for (const e of entries) emitCaptured(e);
          logGroupEnd();
        }
        const msg = res.error ? `\n${res.error}` : '';
        throw new Error(`Expected pass, got ${res.status}${msg}`);
      }

      expect(res.status).toBe('pass');
    });
  }
});
