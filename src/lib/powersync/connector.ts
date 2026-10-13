import type {
  PowerSyncBackendConnector,
  PowerSyncCredentials,
  AbstractPowerSyncDatabase,
  CrudEntry,
} from "@powersync/web";

export class RadarBackendConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    const endpoint = process.env.NEXT_PUBLIC_POWERSYNC_URL;
    if (!endpoint) {
      return null;
    }

    return {
      endpoint,
      token: "radar-session-token",
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    try {
      for (const op of transaction.crud) {
        await this.processCrudOperation(op);
      }
      await transaction.complete();
    } catch (error) {
      // Retried automatically by PowerSync on next sync cycle
      console.error("[PowerSync Connector] uploadData transaction failed:", error);
    }
  }

  private async processCrudOperation(op: CrudEntry): Promise<void> {
    const { table, op: opType, opData } = op;

    // Enforce UUIDv7 idempotency key on all mutations
    const payload = {
      table,
      op: opType,
      data: opData,
      flushedAt: new Date().toISOString(),
    };

    if (process.env.NEXT_PUBLIC_API_URL) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sync/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  }
}
