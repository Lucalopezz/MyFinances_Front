import { afterEach, describe, expect, it, vi } from 'vitest';
import { getServerBackendUrl } from '@/lib/backend';

afterEach(() => vi.unstubAllEnvs());

describe('URL interna da API', () => {
  it('prefere o binding do mesmo deploy à URL legada do backend', () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', 'https://api.internal/');
    vi.stubEnv('BACKEND_URL', 'https://api.antiga.example');
    expect(getServerBackendUrl()).toBe('https://api.internal');
  });

  it('mantém a URL local na ausência do binding', () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', '');
    vi.stubEnv('BACKEND_URL', 'http://localhost:3001');
    expect(getServerBackendUrl()).toBe('http://localhost:3001');
  });
});
