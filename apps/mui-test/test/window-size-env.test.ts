import { describe, expect, it } from 'vitest';
import { canMockWindowSize } from '../src/cases/window-size-env';

describe('canMockWindowSize', () => {
  it('returns true when width and height can be temporarily overridden', () => {
    const target = { innerWidth: 100, innerHeight: 200 };

    expect(canMockWindowSize(target)).toBe(true);
    expect(target.innerWidth).toBe(100);
    expect(target.innerHeight).toBe(200);
  });

  it('returns false when width and height are not configurable', () => {
    const target = {} as { innerWidth: number; innerHeight: number };
    Object.defineProperty(target, 'innerWidth', {
      value: 100,
      configurable: false,
      writable: false,
    });
    Object.defineProperty(target, 'innerHeight', {
      value: 200,
      configurable: false,
      writable: false,
    });

    expect(canMockWindowSize(target)).toBe(false);
    expect(target.innerWidth).toBe(100);
    expect(target.innerHeight).toBe(200);
  });
});
