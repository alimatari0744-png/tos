import { createServerFn } from "@tanstack/react-start";

export const getStore = createServerFn({ method: "GET" }).handler(async () => {
  const { publicStore, readStore } = await import("./store.server");
  return JSON.parse(JSON.stringify(publicStore(await readStore()))) as Record<string, any[]>;
});

export const mutateStore = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      op: "insert" | "update" | "delete";
      table: string;
      rows?: Record<string, unknown>[];
      match?: Record<string, unknown>;
      patch?: Record<string, unknown>;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { applyMutation } = await import("./store.server");
    return applyMutation(data as Parameters<typeof applyMutation>[0]);
  });

export const loginAccount = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { readStore } = await import("./store.server");
    const store = await readStore();
    const email = data.email.trim().toLowerCase();
    const account = store.accounts.find(
      (a) => a.email.toLowerCase() === email && a.password === data.password,
    );
    if (!account) return { error: "invalid" as const, user: null };
    return {
      error: null,
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
        permissions: account.role === "admin" ? ["*"] : account.permissions,
      },
    };
  });

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { folder: string; name: string; bytes: string }) => data,
  )
  .handler(async ({ data }) => {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const folder = data.folder.replace(/[^a-zA-Z0-9_-]/g, "") || "uploads";
    const safe = data.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${safe}`;
    const dir = path.join(process.cwd(), "public", "media", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(data.bytes, "base64"));
    return { url: `/media/${folder}/${filename}` };
  });
