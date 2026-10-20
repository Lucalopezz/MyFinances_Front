import { describe, expect, it } from 'vitest';
import { exportsAvailable } from '@/lib/deployment-features';

describe('exportações no deploy', () => {
  it('oculta o fluxo de exportação quando a API está no Vercel sem worker', () => {
    expect(exportsAvailable({ VERCEL: '1' })).toBe(false);
  });

  it('preserva o fluxo local que já possui worker', () => {
    expect(exportsAvailable({})).toBe(true);
  });
});
