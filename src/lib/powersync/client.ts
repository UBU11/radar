import { PowerSyncDatabase } from "@powersync/web";
import { AppSchema } from "./schema";
import { RadarBackendConnector } from "./connector";

let powerSyncInstance: PowerSyncDatabase | null = null;
let connectorInstance: RadarBackendConnector | null = null;

export function getPowerSyncClient(): PowerSyncDatabase {
  if (typeof window === "undefined") {
    throw new Error("PowerSync can only be initialized in the browser environment");
  }

  if (!powerSyncInstance) {
    powerSyncInstance = new PowerSyncDatabase({
      schema: AppSchema,
      database: {
        dbFilename: "radar_local_v2.sqlite",
      },
    });
  }

  return powerSyncInstance;
}

export async function initPowerSyncSync(): Promise<PowerSyncDatabase | null> {
  if (typeof window === "undefined") return null;

  const db = getPowerSyncClient();
  await db.init();

  if (!connectorInstance) {
    connectorInstance = new RadarBackendConnector();
    await db.connect(connectorInstance);
  }

  return db;
}
