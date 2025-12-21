import { useEffect } from 'react';
import { Stack, Typography } from '@mui/material';
import * as hooks from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { runReactTest } from '../test-utils/runReactTest';

function safeLabel(value: unknown): string {
  if (value == null) return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'function') return '[function]';
  if (Array.isArray(value)) return `[array(${value.length})]`;
  if (typeof value === 'object') return '[object]';
  return String(value);
}

type HookFn = (...args: unknown[]) => unknown;

function argsForHook(name: string, arity: number): unknown[] {
  const key = `mui-test/${name}`;

  // explicit overrides
  switch (name) {
    case 'useAbsolutePosition':
      return [[], { intervalMs: 0 }];
    case 'useAudioUnlocked':
      return [{ onUnlocked: () => {} }];
    case 'useBehaviorSubject':
      return [
        {
          value: 0,
          subscribe: (listener: (v: number) => void) => {
            listener(0);
            return { unsubscribe: () => {} };
          },
        },
      ];
    case 'useCallbackRef':
      return [() => {}];
    case 'useClipboard':
      return [{ timeout: 50 }];
    case 'useClosableEffect':
      return [() => {}, []];
    case 'useConstant':
      return [() => 1];
    case 'useCustomCompareEffect':
      return [
        () => {},
        [{ a: 1 }],
        (nextDeps: readonly [{ a: number }], prevDeps: readonly [{ a: number }]) =>
          prevDeps[0].a === nextDeps[0].a,
      ];
    case 'useCustomCompareMemo':
      return [
        () => ({}),
        [{ a: 1 }],
        (prevDeps: readonly [{ a: number }], nextDeps: readonly [{ a: number }]) =>
          prevDeps[0].a === nextDeps[0].a,
      ];
    case 'useDebouncedCallback':
      return [() => {}, 10, { leading: false, trailing: true }];
    case 'useDebouncedValue':
      return ['A', 10, { leading: false }];
    case 'useDebouncedState':
      return [0, 10];
    case 'useDebouncedFn':
      return [() => {}, 10];
    case 'useDebounceFn':
      return [() => {}, 10];
    case 'useDebounceEffect':
      return [() => {}, [], 10];
    case 'useDeepCompareEffect':
      return [() => {}, [{ a: 1 }]];
    case 'useDeepCompareMemo':
      return [() => ({}), [{ a: 1 }]];
    case 'useDidUpdate':
      return [() => {}, []];
    case 'useEffectOnce':
      return [() => {}];
    case 'useElementSize':
      return [];
    case 'useEventListener':
      return ['click', () => {}];
    case 'useId':
      return [];
    case 'useIdle':
      return [50];
    case 'useImageLoadCallback':
      return [
        null,
        {
          keepListening: false,
          onLoaded: () => {},
          onError: () => {},
        },
      ];
    case 'useImageUpload':
      return [];
    case 'useInterval':
      return [() => {}, 10, { autoInvoke: false }];
    case 'useIsomorphicEffect':
      return [() => {}, []];
    case 'useLatest':
      return ['A'];
    case 'useLifecycleLogger':
      return ['mui-test'];
    case 'useLoadingVisible':
      return [false, 10, 10];
    case 'useLocalStorage':
      return [key, 'init'];
    case 'useLocalStorageState':
      return [key, 'init'];
    case 'useMdOrDown':
    case 'useMdOrUp':
    case 'useLgOrUp':
    case 'useSmOrDown':
    case 'useSmOrUp':
    case 'useXsOrDown':
      return [];
    case 'useMount':
      return [() => {}];
    case 'useMounted':
      return [];
    case 'useMountedState':
      return [];
    case 'useMutationObserver':
      return [() => {}, { childList: true }];
    case 'useObservable':
      return [null];
    case 'useObservableLocalStorage':
      return [key, 'init'];
    case 'useObservableSessionStorage':
      return [key, 'init'];
    case 'useOs':
      return [];
    case 'useRafState':
      return [0];
    case 'useResizeObserver':
      return [];
    case 'useScript':
      return ['data:text/javascript,console.log(1)'];
    case 'useSessionStorage':
      return [key, 'init'];
    case 'useSessionStorageState':
      return [key, 'init'];
    case 'useThrottledCallback':
      return [() => {}, 10];
    case 'useThrottledCallbackWithClearTimeout':
      return [() => {}, 10];
    case 'useThrottledState':
      return [0, 10];
    case 'useThrottledValue':
      return ['A', 10];
    case 'useTimeout':
      return [() => {}, 10, { autoInvoke: false }];
    case 'useTimeoutData':
      return [10];
    case 'useUncontrolled':
      return [{ value: undefined, defaultValue: 1, finalValue: 1, onChange: () => {} }];
    case 'useUnmount':
      return [() => {}];
    case 'useUpdate':
      return [];
    case 'useUpdateEffect':
      return [() => {}, []];
    case 'useUpdateLayoutEffect':
      return [() => {}, []];
    case 'useWindowEvent':
      return ['resize', () => {}];
    case 'useWindowSize':
      return [];
    default:
      break;
  }

  // best-effort fallback
  if (arity === 0) return [];
  if (arity === 1) return [() => {}];
  if (arity === 2) return [() => {}, []];
  return [];
}

function makeHookCase(name: string, hookFn: unknown): HookCase {
  const hook = hookFn as HookFn;
  const args = argsForHook(name, hook.length);

  const Preview = () => {
    const result = hook(...args);

    return (
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {name}({args.map(safeLabel).join(', ')})
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          result: {safeLabel(result)}
        </Typography>
      </Stack>
    );
  };

  return {
    id: `hooks/${name}`,
    name,
    description: 'auto-generated smoke test',
    tags: ['all-hooks'],
    Preview,
    run: async () => {
      const res = await runReactTest((done) => {
        function Harness() {
          hook(...args);

          useEffect(() => {
            done({ ok: true });
          }, []);

          return null;
        }

        return <Harness />;
      }, 800);

      return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
    },
  };
}

export const allHookCases: HookCase[] = Object.entries(hooks)
  .filter(([name, value]) => name.startsWith('use') && typeof value === 'function')
  .map(([name, value]) => makeHookCase(name, value))
  .sort((a, b) => a.name.localeCompare(b.name));
