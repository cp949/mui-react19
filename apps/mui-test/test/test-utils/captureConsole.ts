export type CapturedConsoleLevel = 'debug' | 'info' | 'warn' | 'error' | 'log';

export type CapturedConsoleEntry = {
  level: CapturedConsoleLevel;
  args: unknown[];
};

type Options = {
  filter?: (entry: CapturedConsoleEntry) => boolean;
};

export async function withCapturedConsole<T>(
  fn: () => Promise<T>,
  options: Options = {},
): Promise<{ result: T; entries: CapturedConsoleEntry[] }> {
  const entries: CapturedConsoleEntry[] = [];
  const { filter } = options;

  const origDebug = console.debug.bind(console);
  const origInfo = console.info.bind(console);
  const origWarn = console.warn.bind(console);
  const origError = console.error.bind(console);
  const origLog = console.log.bind(console);

  const capture = (level: CapturedConsoleLevel) => {
    return (...args: unknown[]) => {
      const entry: CapturedConsoleEntry = { level, args };
      if (!filter || filter(entry)) {
        entries.push(entry);
      }
    };
  };

  console.debug = capture('debug');
  console.info = capture('info');
  console.warn = capture('warn');
  console.error = capture('error');
  console.log = capture('log');

  try {
    const result = await fn();
    return { result, entries };
  } finally {
    console.debug = origDebug;
    console.info = origInfo;
    console.warn = origWarn;
    console.error = origError;
    console.log = origLog;
  }
}
