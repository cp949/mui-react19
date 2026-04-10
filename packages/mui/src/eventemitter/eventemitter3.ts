// copy from https://github.com/primus/eventemitter3/blob/master/index.js
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { EventArgs, EventListener, EventNames, ValidEventTypes } from './types.js';

interface ListenerHolder {
  fn: (...args: any[]) => void;
  context?: any;
  once?: boolean;
}

function addListener_(
  emitter: any,
  event: any,
  fn: (...args: any[]) => void,
  context: any | undefined,
  once?: boolean,
) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  const listener: ListenerHolder = {
    fn,
    context: context || emitter,
    once,
  };
  const evt = event;

  if (!emitter._events[evt]) {
    emitter._events[evt] = listener;
    emitter._eventsCount++;
  } else if (!emitter._events[evt].fn) {
    emitter._events[evt].push(listener);
  } else {
    emitter._events[evt] = [emitter._events[evt], listener];
  }
}

function clearEvent_(emitter: any, evt: any) {
  if (--emitter._eventsCount === 0) {
    emitter._events = {};
  } else {
    delete emitter._events[evt];
  }
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 */
export class EventEmitter<EventTypes extends ValidEventTypes = string | symbol, Context = any> {
  private _eventsCount = 0;

  private _events: Partial<Record<EventNames<EventTypes>, ListenerHolder | ListenerHolder[]>> = {};

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   */
  eventNames(): EventNames<EventTypes>[] {
    const names: EventNames<EventTypes>[] = [];

    if (this._eventsCount === 0) return names;

    const events = this._events;
    for (const name in events) {
      if (Object.hasOwn(events, name)) {
        names.push(name as any);
      }
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events) as any);
    }

    return names;
  }

  /**
   * Return the listeners registered for a given event.
   */
  listeners<T extends EventNames<EventTypes>>(
    event: T,
  ): EventListener<EventTypes, T>[] | undefined {
    const evt = event;
    const handlers = this._events[evt];

    if (!handlers) return [];
    if ('fn' in handlers) return [handlers.fn as any];

    const ee = new Array(handlers.length);
    for (let i = 0; i < handlers.length; i++) {
      ee[i] = handlers[i].fn;
    }

    return ee;
  }

  /**
   * Return the number of listeners listening to a given event.
   */
  listenerCount(event: EventNames<EventTypes>): number {
    const listeners = this._events[event];
    if (!listeners) return 0;
    if ('fn' in listeners) return 1;
    return listeners.length;
  }

  /**
   * Calls each of the listeners registered for a given event.
   */
  emit<T extends EventNames<EventTypes>>(event: T, ...args: EventArgs<EventTypes, T>): boolean {
    const evt = event;

    const listeners = this._events[evt];
    if (!listeners) return false;
    if ('fn' in listeners) {
      if (listeners.once) this.removeListener(event, listeners.fn as any, undefined, true);
      listeners.fn.apply(listeners.context, args);
    } else {
      const length = listeners.length;
      for (let i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn as any, undefined, true);
        listeners[i].fn.apply(listeners[i].context, args);
      }
    }

    return true;
  }

  /**
   * Add a listener for a given event.
   */
  on<T extends EventNames<EventTypes>>(
    event: T,
    fn: EventListener<EventTypes, T>,
    context?: Context,
  ) {
    addListener_(this, event, fn, context);
    return () => {
      this.removeListener(event, fn, context);
    };
  }

  /**
   * Add a listener for a given event.
   */
  addListener<T extends EventNames<EventTypes>>(
    event: T,
    fn: EventListener<EventTypes, T>,
    context?: Context,
  ) {
    addListener_(this, event, fn, context);
    return () => {
      this.removeListener(event, fn, context);
    };
  }

  /**
   * Add a one-time listener for a given event.
   */
  once<T extends EventNames<EventTypes>>(
    event: T,
    fn: EventListener<EventTypes, T>,
    context?: Context,
  ) {
    addListener_(this, event, fn, context, true);
    return () => {
      this.removeListener(event, fn, context, true);
    };
  }

  /**
   * Remove the listeners of a given event.
   */
  removeListener<T extends EventNames<EventTypes>>(
    event: T,
    fn?: EventListener<EventTypes, T>,
    context?: Context,
    once?: boolean,
  ): this {
    const evt = event;
    const listeners = this._events[evt];

    if (!listeners) return this;
    if (!fn) {
      clearEvent_(this, evt);
      return this;
    }

    if ('fn' in listeners) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        clearEvent_(this, evt);
      }
    } else {
      const events = [] as ListenerHolder[];
      for (let i = 0, length = listeners.length; i < length; i++) {
        if (
          listeners[i].fn !== fn ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }

      // Reset the array, or remove it completely if we have no more listeners.
      if (events.length) {
        this._events[evt] = events.length === 1 ? events[0] : events;
      } else {
        clearEvent_(this, evt);
      }
    }

    return this;
  }

  /**
   * Remove the listeners of a given event.
   */
  off<T extends EventNames<EventTypes>>(
    event: T,
    fn?: EventListener<EventTypes, T>,
    context?: Context,
    once?: boolean,
  ): this {
    return this.removeListener(event, fn, context, once);
  }

  /**
   * Remove all listeners, or those of the specified event.
   */
  removeAllListeners(event?: EventNames<EventTypes>): this {
    if (event) {
      const evt = event;
      if (this._events[evt]) {
        clearEvent_(this, evt);
      }
    } else {
      this._events = {};
      this._eventsCount = 0;
    }

    return this;
  }
}
