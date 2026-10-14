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
      for (const entry of transaction.crud) {
        await this.syncCrudOperation(entry);
      }
      await transaction.complete();
    } catch (err) {
      console.error("[PowerSync Connector] uploadData transaction failed:", err);
    }
  }

  private async syncCrudOperation(entry: CrudEntry): Promise<void> {
    const { table, op: opType, opData } = entry;

    const payload = {
      table,
      op: opType,
      mutationRecord: opData,
      flushedAt: new Date().toISOString(),
    };

    const targetUrl = process.env.NEXT_PUBLIC_API_URL || "";
    await fetch(`${targetUrl}/api/sync/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}
