const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTypescript } = require("./load-typescript.cjs");
// A store não depende de React ou DOM; estes testes observam suas decisões
// com rede/visibilidade e relógio controlados, sem waits reais de cinco minutos.
const { createBackendConnection, BACKEND_PING_INTERVAL_MS } = loadTypescript("src/lib/backend-connection.ts");
// Avançar um timer simulado não resolve sozinho todos os awaits encadeados.
// Drenamos microtasks antes de verificar snapshots, probes e callbacks de recovery.
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

function setup(t, probe = async () => true) {
  // Date e setTimeout compartilham o relógio simulado. O tempo inicial não é
  // zero para exercitar timestamps reais e sua distinção em relação ao null.
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 1_000_000 });
  let visible = true, online = true, calls = 0, recoveries = 0;
  const connection = createBackendConnection({
    probe: (signal) => { calls++; return probe(signal); },
    isVisible: () => visible,
    isOnline: () => online,
    onRecovery: () => recoveries++,
  });
  // Cada caso encerra timers/I/O, mesmo se uma asserção falhar. O runner limpa
  // os mocks do contexto; uma store não deve influenciar o teste seguinte.
  t.after(() => connection.stop());
  return { connection, get calls() { return calls; }, get recoveries() { return recoveries; },
    visible: (value) => { visible = value; }, online: (value) => { online = value; } };
}

// Representa eventos reais que chegam quase juntos ao reabrir uma aba: todos
// precisam observar o mesmo resultado, sem abrir várias requisições de saúde.
test("one probe on mount; focus, resume and manual retry share the in-flight request", async (t) => {
  let finish;
  const s = setup(t, () => new Promise((resolve) => { finish = resolve; }));
  s.connection.start();
  s.connection.resume();
  const first = s.connection.reconnect(), second = s.connection.reconnect();
  assert.equal(first, second);
  assert.equal(s.calls, 1);
  finish(true);
  assert.equal(await first, true);
  assert.equal(s.connection.getSnapshot().status, "ready");
  s.connection.resume();
  assert.equal(s.calls, 1);
  assert.equal(s.recoveries, 0);
});

// Confirma a decisão de agendar só com a aba visível e decidir pela idade do
// contato ao retornar, em vez de contar com timers funcionando em segundo plano.
test("heartbeat every five minutes, no background heartbeat, immediate probe on stale resume", async (t) => {
  const s = setup(t);
  s.connection.start();
  await flush();
  t.mock.timers.tick(BACKEND_PING_INTERVAL_MS);
  await flush();
  assert.equal(s.calls, 2);
  s.visible(false);
  s.connection.resume();
  t.mock.timers.tick(20 * 60_000);
  await flush();
  assert.equal(s.calls, 2);
  s.visible(true);
  s.connection.resume();
  s.connection.resume();
  await flush();
  assert.equal(s.calls, 3);
});

// Duas falhas e um sucesso simulam aquecimento. A recuperação é notificada uma
// vez; a store de disponibilidade nem recebe operações de logout/limpeza de conta.
test("cold start retries and then recovers once without clearing the session", async (t) => {
  let attempt = 0;
  const s = setup(t, async () => ++attempt === 3);
  s.connection.start();
  await flush();
  assert.equal(s.calls, 1);
  t.mock.timers.tick(2_000);
  await flush();
  assert.equal(s.calls, 2);
  t.mock.timers.tick(5_000);
  await flush();
  assert.equal(s.calls, 3);
  assert.equal(s.connection.getSnapshot().status, "ready");
  assert.equal(s.connection.getSnapshot().recoveryCount, 1);
  assert.equal(s.recoveries, 1);
});

// Esgotar uma rodada não vira polling infinito. Só uma tentativa manual ou
// a manutenção futura pode começar outra; a UI recebe unavailable para orientar.
test("three failures stop the burst and expose manual retry", async (t) => {
  let healthy = false;
  const s = setup(t, async () => healthy);
  s.connection.start();
  await flush();
  t.mock.timers.tick(2_000);
  await flush();
  t.mock.timers.tick(5_000);
  await flush();
  assert.equal(s.calls, 3);
  assert.equal(s.connection.getSnapshot().status, "unavailable");
  t.mock.timers.tick(60_000);
  await flush();
  assert.equal(s.calls, 3);
  healthy = true;
  assert.equal(await s.connection.reconnect(), true);
  assert.equal(s.recoveries, 1);
});

// A volta imediata da internet não pode ficar presa à Promise abortada. Também
// verificamos que o término antigo não substitui o checking da rodada nova.
test("offline cancels pending work; an immediate online event starts a fresh probe", async (t) => {
  let signal;
  const s = setup(t, (current) => {
    signal = current;
    return new Promise((resolve) => current.addEventListener("abort", () => resolve(false), { once: true }));
  });
  s.connection.start();
  s.online(false);
  s.connection.offline();
  assert.equal(signal.aborted, true);
  assert.equal(s.connection.getSnapshot().status, "offline");
  s.online(true);
  s.connection.resume();
  assert.equal(s.calls, 2);
  assert.equal(s.connection.getSnapshot().status, "checking");
  await flush();
  assert.equal(s.connection.getSnapshot().status, "checking");
});

// Mesmo sem receber um evento offline separado, consultar a rede no foco deve
// invalidar o sucesso recente; reconectar precisa confirmar saúde de novo.
test("offline detected on focus invalidates even a recent healthy result", async (t) => {
  const s = setup(t);
  s.connection.start();
  await flush();
  s.online(false);
  s.connection.resume();
  assert.equal(s.connection.getSnapshot().status, "offline");
  assert.equal(s.calls, 1);
  s.online(true);
  s.connection.resume();
  await flush();
  assert.equal(s.calls, 2);
  assert.equal(s.connection.getSnapshot().status, "ready");
  assert.equal(s.recoveries, 1);
});

// Desmontar cancela a pausa entre tentativas e o timer de manutenção. Esperar
// no relógio não deve gerar novo tráfego até a instância ser iniciada novamente.
test("unmount cancels probes and retry timers; Strict Mode restart still works", async (t) => {
  const s = setup(t, async () => false);
  s.connection.start();
  await flush();
  s.connection.stop();
  t.mock.timers.tick(10 * 60_000);
  await flush();
  assert.equal(s.calls, 1);
  s.connection.start();
  await flush();
  assert.equal(s.calls, 2);
});

// No dev, o React pode montar, limpar e montar efeitos no mesmo instante.
// A resposta da primeira rodada é propositalmente concluída depois do restart:
// generation precisa impedir que esse resultado antigo marque a conexão pronta.
test("Strict Mode stop/start in the same tick starts a fresh probe immediately", async (t) => {
  const probes = [];
  const s = setup(t, (signal) => new Promise((resolve) => probes.push({ signal, resolve })));
  s.connection.start();
  s.connection.stop();
  s.connection.start();
  assert.equal(s.calls, 2);
  assert.equal(probes[0].signal.aborted, true);
  assert.equal(probes[1].signal.aborted, false);
  probes[0].resolve(true);
  await flush();
  assert.equal(s.connection.getSnapshot().status, "checking");
  probes[1].resolve(true);
  await flush();
  assert.equal(s.connection.getSnapshot().status, "ready");
});
