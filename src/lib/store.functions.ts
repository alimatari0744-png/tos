import { createServerFn } from "@tanstack/react-start";

/** Local-dev only: persist the in-memory store to data/db.json. */
export const syncStoreToDisk = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const { writeStore } = await import("./store.server");
    await writeStore(data as never);
    return { ok: true };
  });
