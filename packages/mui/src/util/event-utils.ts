export const isTabKeyEvent = (e: React.KeyboardEvent): boolean => {
  return !e.shiftKey && e.key === 'Tab';
};

export const isEnterOrTabKeyEvent = (e: React.KeyboardEvent): boolean => {
  return e.key === 'Enter' || (!e.shiftKey && e.key === 'Tab');
};

export const isEnterKeyEvent = (e: React.KeyboardEvent): boolean => {
  return e.key === 'Enter';
};

export const isEscapeKeyEvent = (e: React.KeyboardEvent): boolean => {
  return e.key === 'Escape';
};

export const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return Boolean((event as TouchEvent).touches?.length);
};

export const isMouseEvent = (event: MouseEvent | TouchEvent): event is MouseEvent => {
  return Boolean(
    ((event as MouseEvent).clientX || (event as MouseEvent).clientX === 0) &&
      ((event as MouseEvent).clientY || (event as MouseEvent).clientY === 0),
  );
};

export const blurEventTarget = (event: { target: EventTarget | null }, delay = -1) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  if (typeof target.blur !== 'function') return;
  if (delay >= 0) {
    setTimeout(() => {
      target.blur();
    }, delay);
  } else {
    target.blur();
  }
};
