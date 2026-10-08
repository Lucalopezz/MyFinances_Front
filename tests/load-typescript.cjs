const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const ts = require("typescript");

/**
 * Carrega os módulos reais de TypeScript nos testes sem iniciar o Next.js.
 * Usamos o TypeScript já instalado para transformar imports em require(), e
 * substituímos apenas dependências explícitas, como cookies, fetch ou server-only.
 * Assim os testes exercitam a implementação, sem copiar sua lógica para um fake.
 *
 * Este utilitário é exclusivo dos testes. Não deve carregar código não confiável:
 * new Function executa o módulo local que o próprio projeto está verificando.
 */
function loadTypescript(path, mocks = {}) {
  const file = resolve(__dirname, "..", path);
  const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  });
  const module = { exports: {} };
  // O mapa deixa cada teste declarar seus limites externos. Dependências não
  // substituídas usam require normal, para não esconder importações inesperadas.
  const imports = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    return require(name);
  };
  new Function("require", "module", "exports", outputText)(imports, module, module.exports);
  return module.exports;
}

module.exports = { loadTypescript };
