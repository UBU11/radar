"use client";

import { useEffect, useState } from "react";
import { getPowerSyncClient } from "./client";

export function usePowerSyncQuery<T = Record<string, unknown>>(
  sql: string,
  parameters: (string | number | boolean | null)[] = [],
  fallbackData: T[] = []
): { data: T[]; isLoading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>(fallbackData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let abortController: AbortController | null = null;

    async function subscribe() {
      try {
        const db = getPowerSyncClient();
        await db.init();

        const initialResults = await db.getAll<T>(sql, parameters);
        if (isMounted) {
          setData(initialResults.length > 0 ? initialResults : fallbackData);
          setIsLoading(false);
        }

        abortController = new AbortController();
        const asyncIterable = db.watch(sql, parameters, { signal: abortController.signal });

        for await (const result of asyncIterable) {
          if (!isMounted) break;
          const rows = Array.from(result.rows?._array ?? []);
          setData((rows as T[]).length > 0 ? (rows as T[]) : fallbackData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setData(fallbackData);
          setIsLoading(false);
        }
      }
    }

    subscribe();

    return () => {
      isMounted = false;
      if (abortController) {
        abortController.abort();
      }
    };
  }, [sql, JSON.stringify(parameters)]);

  return { data, isLoading, error };
}
