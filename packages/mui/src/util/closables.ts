import { Subject } from 'rxjs';
import { EventEmitter } from '../eventemitter/eventemitter3.js';

type WinEventType = keyof WindowEventMap;
type WinEventListener<K extends WinEventType> = (this: Window, ev: WindowEventMap[K]) => void;
type EventOptions = boolean | AddEventListenerOptions;

type DocEventType = keyof DocumentEventMap;

type DocEventListener<K extends DocEventType> = (this: Document, ev: DocumentEventMap[K]) => void;

type ElemEventType = keyof HTMLElementEventMap;
type ElemEventListener<K extends ElemEventType> = (
  this: HTMLElement,
  ev: HTMLElementEventMap[K],
) => void;

export class Closables {
  #store = new Set<() => void>();
  #closeTrigger$: Subject<unknown> | undefined;
  #events = new EventEmitter<{ closed: () => void }>();

  get events() {
    return this.#events;
  }

  get closeTrigger$(): Subject<unknown> {
    if (!this.#closeTrigger$) {
      this.#closeTrigger$ = new Subject();
    }
    return this.#closeTrigger$;
  }

  add = (...closables: (() => void)[]): this => {
    closables.forEach((it) => {
      this.#store.add(it);
    });
    return this;
  };

  remove = (...closables: (() => void)[]): this => {
    closables.forEach((it) => {
      this.#store.delete(it);
    });
    return this;
  };

  addRx = (...closables: Array<{ unsubscribe: () => void }>): this => {
    closables.forEach((s) => {
      this.#store.add(() => {
        s.unsubscribe();
      });
    });
    return this;
  };

  addUnsubscribe = this.addRx;

  addClose = (...closables: Array<{ close: () => void }>): this => {
    closables.forEach((s) => {
      this.#store.add(() => {
        s.close();
      });
    });
    return this;
  };

  addDispose = (...closables: Array<{ dispose: () => void }>): this => {
    closables.forEach((s) => {
      this.#store.add(() => {
        s.dispose();
      });
    });
    return this;
  };

  addDestroy = (...closables: Array<{ destroy: () => void }>): this => {
    closables.forEach((s) => {
      this.#store.add(() => {
        s.destroy();
      });
    });
    return this;
  };

  addShutdown = (...closables: Array<{ shutdown: () => void }>): this => {
    closables.forEach((s) => {
      this.#store.add(() => {
        s.shutdown();
      });
    });
    return this;
  };

  addTerminate = (...closables: Array<{ terminate: () => void }>): this => {
    closables.forEach((s) => {
      this.#store.add(() => {
        s.terminate();
      });
    });
    return this;
  };

  addElementListener = <K extends ElemEventType>(
    elem: HTMLElement,
    type: K,
    listener: ElemEventListener<K>,
    options?: EventOptions,
  ): this => {
    elem.addEventListener(type, listener, options);
    this.#store.add(() => {
      elem.removeEventListener(type, listener, options);
    });
    return this;
  };

  addDocumentListener = <K extends DocEventType>(
    type: K,
    listener: DocEventListener<K>,
    options?: EventOptions,
  ): this => {
    document.addEventListener(type, listener, options);
    this.#store.add(() => {
      document.removeEventListener(type, listener, options);
    });
    return this;
  };

  addWindowListener = <K extends WinEventType>(
    type: K,
    listener: WinEventListener<K>,
    options?: EventOptions,
  ): this => {
    window.addEventListener(type, listener, options);
    this.#store.add(() => {
      window.removeEventListener(type, listener, options);
    });
    return this;
  };

  get count() {
    return this.#store.size;
  }

  close = () => {
    this.#events.emit('closed');
    this.#events.removeAllListeners();
    if (this.#closeTrigger$) {
      this.#closeTrigger$.next(1);
      this.#closeTrigger$ = undefined;
    }

    if (this.#store.size > 0) {
      Array.from(this.#store).forEach((fn) => {
        fn();
      });
      this.#store.clear();
    }
  };

  static create = (...closables: (() => void)[]) => {
    const c = new Closables();
    c.add(...closables);
    return c;
  };

  static createWindowListener = <K extends WinEventType>(
    type: K,
    listener: WinEventListener<K>,
    options?: EventOptions,
  ) => {
    const c = new Closables();
    c.addWindowListener(type, listener, options);
    return c;
  };

  static createDocumentListener = <K extends DocEventType>(
    type: K,
    listener: DocEventListener<K>,
    options?: EventOptions,
  ) => {
    const c = new Closables();
    c.addDocumentListener(type, listener, options);
    return c;
  };

  static createElementListener = <K extends ElemEventType>(
    elem: HTMLElement,
    type: K,
    listener: ElemEventListener<K>,
    options?: EventOptions,
  ) => {
    const c = new Closables();
    c.addElementListener(elem, type, listener, options);
    return c;
  };

  static createRx = (...closables: { unsubscribe: () => void }[]) => {
    const c = new Closables();
    c.addRx(...closables);
    return c;
  };

  static createClose = (...closables: { close: () => void }[]) => {
    const c = new Closables();
    c.addClose(...closables);
    return c;
  };

  static createTerminate = (...closables: { terminate: () => void }[]) => {
    const c = new Closables();
    c.addTerminate(...closables);
    return c;
  };

  static createShutdown = (...closables: { shutdown: () => void }[]) => {
    const c = new Closables();
    c.addShutdown(...closables);
    return c;
  };

  static createDestroy = (...closables: { destroy: () => void }[]) => {
    const c = new Closables();
    c.addDestroy(...closables);
    return c;
  };

  static createDispose = (...closables: { dispose: () => void }[]) => {
    const c = new Closables();
    c.addDispose(...closables);
    return c;
  };
}
