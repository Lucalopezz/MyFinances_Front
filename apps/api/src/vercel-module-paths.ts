// Services preserva as dependências de apps/api sob /var/task/apps/api/node_modules,
// enquanto executa o entrypoint compilado em /var/task/src. Ajuste a resolução
// antes de carregar qualquer módulo NestJS.
if (process.env.VERCEL === '1') {
  const { delimiter, resolve } = require('node:path') as typeof import('node:path');
  const nodeModule = require('node:module') as { _initPaths(): void };
  const moduleRoots = [
    resolve(__dirname, '../apps/api/node_modules'),
    resolve(__dirname, '../../node_modules'),
  ];

  process.env.NODE_PATH = [...moduleRoots, process.env.NODE_PATH]
    .filter(Boolean)
    .join(delimiter);
  nodeModule._initPaths();
}
