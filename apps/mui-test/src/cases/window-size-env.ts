type WindowSizeTarget = {
  innerWidth: number;
  innerHeight: number;
};

function restoreDescriptor(
  target: object,
  key: 'innerWidth' | 'innerHeight',
  descriptor?: PropertyDescriptor,
) {
  try {
    if (descriptor) {
      Object.defineProperty(target, key, descriptor);
      return;
    }

    Reflect.deleteProperty(target, key);
  } catch {
    // Best-effort restore only.
  }
}

export function canMockWindowSize(target: WindowSizeTarget): boolean {
  const prevWidth = Object.getOwnPropertyDescriptor(target, 'innerWidth');
  const prevHeight = Object.getOwnPropertyDescriptor(target, 'innerHeight');
  const probeWidth = target.innerWidth + 1;
  const probeHeight = target.innerHeight + 1;

  try {
    Object.defineProperty(target, 'innerWidth', {
      value: probeWidth,
      configurable: true,
    });
    Object.defineProperty(target, 'innerHeight', {
      value: probeHeight,
      configurable: true,
    });

    return target.innerWidth === probeWidth && target.innerHeight === probeHeight;
  } catch {
    return false;
  } finally {
    restoreDescriptor(target, 'innerWidth', prevWidth);
    restoreDescriptor(target, 'innerHeight', prevHeight);
  }
}

export function setMockWindowSize(target: WindowSizeTarget, width: number, height: number) {
  Object.defineProperty(target, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(target, 'innerHeight', { value: height, configurable: true });
}
