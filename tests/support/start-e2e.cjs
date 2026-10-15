const { randomBytes } = require("node:crypto");
const { execFile, spawn } = require("node:child_process");
const { mkdtemp, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { resolve, join } = require("node:path");
const { promisify } = require("node:util");

const apiDir = resolve(process.env.E2E_API_DIR ?? "../MyFinances_API");
const apiRequire = (name) =>
  require(require.resolve(name, { paths: [apiDir] }));
let app, queue, worker, database, next, directory;
let ending = false;

/** Finaliza somente processos, banco, fila e arquivos criados por esta execução. */
async function shutdown(code = 0) {
  if (ending) return;
  ending = true;
  try {
    if (next && next.exitCode === null) {
      const exited = new Promise((done) => next.once("exit", done));
      next.kill("SIGTERM");
      const timer = setTimeout(() => next.kill("SIGKILL"), 5000);
      await exited;
      clearTimeout(timer);
    }
    try {
      await worker?.close();
      await queue?.obliterate({ force: true });
    } finally {
      await app?.close();
    }
  } catch (error) {
    console.error("Falha ao encerrar os serviços E2E:", error.message);
    code = 1;
  } finally {
    try {
      if (database) {
        await database.$runCommandRaw({ dropDatabase: 1 });
        await database.$disconnect();
      }
    } finally {
      if (directory) await rm(directory, { recursive: true, force: true });
    }
  }
  process.exit(code);
}

async function start() {
  const mongo = new URL(
    process.env.TEST_DATABASE_URL ??
      "mongodb://127.0.0.1:27028/?replicaSet=rs0&directConnection=true",
  );
  const redis = new URL(process.env.TEST_REDIS_URL ?? "redis://127.0.0.1:6380");
  for (const [url, protocol] of [
    [mongo, "mongodb:"],
    [redis, "redis:"],
  ]) {
    if (
      url.protocol !== protocol ||
      !["localhost", "127.0.0.1"].includes(url.hostname)
    ) {
      throw new Error("E2E exige MongoDB e Redis locais explícitos.");
    }
  }
  const suffix = randomBytes(12).toString("hex");
  mongo.pathname = `/myfinances_front_e2e_${suffix}`;
  directory = await mkdtemp(join(tmpdir(), "myfinances-front-e2e-"));
  Object.assign(process.env, {
    NODE_ENV: "test",
    DATABASE_URL: mongo.toString(),
    JWT_SECRET: "frontend-e2e-test-only-secret",
    JWT_TOKEN_AUDIENCE: "frontend-e2e",
    JWT_TOKEN_ISSUER: "myfinances-e2e",
    JWT_TTL: "3600",
    FINANCIAL_DATA_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString("base64"),
    EXPORT_STORAGE_PATH: directory,
    PRISMA_DIAGNOSTICS: "false",
  });
  const { PrismaClient } = apiRequire("@prisma/client");
  database = new PrismaClient({ datasourceUrl: mongo.toString() });
  await promisify(execFile)(
    process.execPath,
    [
      join(apiDir, "node_modules/prisma/build/index.js"),
      "db",
      "push",
      "--skip-generate",
    ],
    {
      cwd: apiDir,
      env: process.env,
      timeout: 30000,
    },
  );
  // O checkout da API fornece seus módulos e dependências, sem modificar seus arquivos.
  apiRequire("ts-node").register({
    project: join(apiDir, "tsconfig.json"),
    transpileOnly: true,
  });
  apiRequire("tsconfig-paths").register({
    baseUrl: apiDir,
    paths: { "src/*": ["src/*"] },
  });
  const { Test } = apiRequire("@nestjs/testing");
  const { getQueueToken, getSharedConfigToken } = apiRequire("@nestjs/bullmq");
  const { AppModule } = require(join(apiDir, "src/app.module.ts"));
  const { PublicExceptionFilter } = require(
    join(apiDir, "src/common/filters/public-exception.filter.ts"),
  );
  const { TransactionExportProcessor } = require(
    join(
      apiDir,
      "src/modules/transactions/exports/processors/transaction-export.processor.ts",
    ),
  );
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(getSharedConfigToken())
    .useValue({
      connection: { host: redis.hostname, port: Number(redis.port || 6379) },
      prefix: `myfinances-front-e2e-${suffix}`,
    })
    .compile();
  app = module.createNestApplication({ logger: ["error"] });
  app.useGlobalFilters(new PublicExceptionFilter());
  app.useBodyParser("json", { limit: "256kb" });
  await app.listen(Number(process.env.E2E_API_PORT ?? 3101), "127.0.0.1");
  queue = module.get(getQueueToken("transaction-exports"));
  worker = module.get(TransactionExportProcessor).worker;
  next = spawn(
    process.execPath,
    [
      require.resolve("next/dist/bin/next"),
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      process.env.E2E_FRONTEND_PORT ?? "3100",
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "development",
        E2E_TEST_RUN: "1",
        NEXT_TELEMETRY_DISABLED: "1",
        BACKEND_URL: `http://127.0.0.1:${process.env.E2E_API_PORT ?? 3101}`,
      },
    },
  );
  next.once("error", (error) => {
    console.error(error.message);
    void shutdown(1);
  });
  next.once("exit", () => {
    if (!ending) void shutdown(1);
  });
}

process.once("SIGTERM", () => void shutdown());
process.once("SIGINT", () => void shutdown());
start().catch((error) => {
  console.error("Não foi possível iniciar E2E:", error.message);
  void shutdown(1);
});
