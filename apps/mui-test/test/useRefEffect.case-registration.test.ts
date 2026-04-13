import { describe, expect, it } from 'vitest';

import { cases } from '../src/cases';

describe('useRefEffect case registration', () => {
  it('registers a dedicated useRefEffect case', () => {
    expect(cases.some((hookCase) => hookCase.id === 'useRefEffect/assert')).toBe(true);
  });
});
