import { PowerSyncDatabase } from "@powersync/web";
import { AppSchema } from "./schema";

let powerSyncInstance: PowerSyncDatabase | null = null;

export function getPowerSyncClient(): PowerSyncDatabase {
  if (typeof window === "undefined") {
    throw new Error("PowerSync can only be initialized in the browser environment");
  }

  if (!powerSyncInstance) {
    powerSyncInstance = new PowerSyncDatabase({
      schema: AppSchema,
      database: {
        dbFilename: "radar_local_meetups.sqlite",
      },
    });
  }

  return powerSyncInstance;
}

// ponytail: stub offline connector until backend PowerSync service URI is configured
export async function initPowerSyncSync() {
  if (typeof window === "undefined") return null;
  const db = getPowerSyncClient();
  await db.init();
  return db;
}
