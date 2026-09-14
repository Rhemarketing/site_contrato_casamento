export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.CONTRACT_ENABLED !== "true") return;
  const { contractDataKey } = await import("@/features/contract/server/privacy");
  const { contractCatalog } = await import("@/features/contract/server/catalog");
  contractDataKey();
  if (!contractCatalog.productionReady) throw new Error("Edição do contrato ainda não liberada para ativação.");
  const { db } = await import("@/lib/db");
  const { maintainContracts } = await import("@/services/contract-maintenance.service");
  let running = false;
  const clean = async () => {
    if (running) return;
    running = true;
    try { await maintainContracts(db, { apply: true }); }
    catch { console.error("Limpeza de dados do contrato não concluída; nova tentativa no próximo ciclo."); }
    finally { running = false; }
  };
  // Dedicated Node server: startup sweep plus daily retries. Retention never
  // removes an acknowledged document or rewrites either person's responses.
  setTimeout(() => { void clean(); }, 60000).unref();
  setInterval(() => { void clean(); }, 86400000).unref();
}
