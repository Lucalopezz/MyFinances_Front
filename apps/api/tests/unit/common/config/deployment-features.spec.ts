import { exportsAvailable } from 'src/common/config/deployment-features';

describe('exportações no deploy', () => {
  it('desliga a fila no Vercel mesmo quando há Redis configurado', () => {
    expect(exportsAvailable({ VERCEL: '1', REDIS_URL: 'redis://redis' })).toBe(false);
  });

  it('mantém a exportação no ambiente local com worker', () => {
    expect(exportsAvailable({})).toBe(true);
  });
});
