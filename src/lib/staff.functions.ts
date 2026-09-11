import { createServerFn } from "@tanstack/react-start";

export const ALL_PERMISSIONS = [
  "properties",
  "taxonomy",
  "geo",
  "requests",
  "interests",
  "settings",
] as const;
export type Permission = (typeof ALL_PERMISSIONS)[number];

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  permissions: string[];
}

export const listStaff = createServerFn({ method: "GET" }).handler(async (): Promise<StaffMember[]> => {
  const { readStore } = await import("./store.server");
  const store = await readStore();
  return store.accounts
    .filter((a) => a.role === "staff")
    .map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      permissions: a.permissions,
    }));
});

export const createStaff = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      email: string;
      name: string;
      password: string;
      permissions: string[];
    }) => data,
  )
  .handler(async ({ data }) => {
    const { readStore, writeStore } = await import("./store.server");
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const permissions = (data.permissions ?? []).filter((p) =>
      (ALL_PERMISSIONS as readonly string[]).includes(p),
    );

    if (!email || !data.password || data.password.length < 6) {
      throw new Error("بيانات غير صحيحة");
    }

    const store = await readStore();
    if (store.accounts.some((a) => a.email.toLowerCase() === email)) {
      throw new Error("البريد مستخدم مسبقاً");
    }

    const id = crypto.randomUUID();
    store.accounts.push({
      id,
      email,
      password: data.password,
      name,
      role: "staff",
      permissions,
    });
    await writeStore(store);
    return { ok: true, id };
  });

export const updateStaffPermissions = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; permissions: string[] }) => data)
  .handler(async ({ data }) => {
    const { readStore, writeStore } = await import("./store.server");
    const permissions = (data.permissions ?? []).filter((p) =>
      (ALL_PERMISSIONS as readonly string[]).includes(p),
    );
    const store = await readStore();
    store.accounts = store.accounts.map((a) =>
      a.id === data.userId ? { ...a, permissions } : a,
    );
    await writeStore(store);
    return { ok: true };
  });

export const deleteStaff = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const { readStore, writeStore } = await import("./store.server");
    const store = await readStore();
    store.accounts = store.accounts.filter((a) => a.id !== data.userId || a.role === "admin");
    await writeStore(store);
    return { ok: true };
  });
