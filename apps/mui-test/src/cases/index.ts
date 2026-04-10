import { allHookCases } from './allHooks.case';

import { clipboardCase } from './clipboard.case';
import { debouncedValueCase } from './debouncedValue.case';
import { eventListenerCase } from './eventListener.case';
import { intervalCase } from './interval.case';
import { localStorageCase } from './localStorage.case';
import { localStorageStateCase } from './localStorageState.case';
import { mutationObserverCase } from './mutationObserver.case';
import { observableLocalStorageCase } from './observableLocalStorage.case';
import { observableSessionStorageCase } from './observableSessionStorage.case';
import { resizeObserverCase } from './resizeObserver.case';
import { sessionStorageCase } from './sessionStorage.case';
import { sessionStorageStateCase } from './sessionStorageState.case';
import { throttledValueCase } from './throttledValue.case';
import { timeoutCase } from './timeout.case';
import { timeoutDataCase } from './timeoutData.case';
import type { HookCase } from './types';
import { windowEventCase } from './windowEvent.case';
import { windowSizeCase } from './windowSize.case';

export const cases: HookCase[] = [
  debouncedValueCase,
  clipboardCase,
  timeoutCase,
  intervalCase,
  localStorageCase,
  localStorageStateCase,
  sessionStorageCase,
  sessionStorageStateCase,
  windowEventCase,
  windowSizeCase,
  eventListenerCase,
  mutationObserverCase,
  resizeObserverCase,
  observableLocalStorageCase,
  observableSessionStorageCase,
  throttledValueCase,
  timeoutDataCase,
  ...allHookCases,
];
