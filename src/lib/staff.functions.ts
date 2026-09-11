import { getStoreSync, mutateStore } from "@/lib/store";

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

export async function listStaff(): Promise<StaffMember[]> {
  const store = getStoreSync();
  const accounts = (store.accounts as Array<StaffMember & { role?: string }>) ?? [];
  return accounts
    .filter((a) => a.role === "staff")
    .map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name ?? "",
      permissions: a.permissions ?? [],
    }));
}

export async function createStaff(input: {
  data: { email: string; name: string; password: string; permissions: string[] };
}) {
  const email = input.data.email.trim().toLowerCase();
  const name = input.data.name.trim();
  const permissions = (input.data.permissions ?? []).filter((p) =>
    (ALL_PERMISSIONS as readonly string[]).includes(p),
  );
  if (!email || !input.data.password || input.data.password.length < 6) {
    throw new Error("بيانات غير صحيحة");
  }
  const store = getStoreSync();
  const accounts = (store.accounts as { email: string }[]) ?? [];
  if (accounts.some((a) => a.email.toLowerCase() === email)) {
    throw new Error("البريد مستخدم مسبقاً");
  }
  await mutateStore({
    data: {
      op: "insert",
      table: "accounts",
      rows: [
        {
          id: crypto.randomUUID(),
          email,
          password: input.data.password,
          name,
          role: "staff",
          permissions,
        },
      ],
    },
  });
  return { ok: true };
}

export async function updateStaffPermissions(input: {
  data: { userId: string; permissions: string[] };
}) {
  const permissions = (input.data.permissions ?? []).filter((p) =>
    (ALL_PERMISSIONS as readonly string[]).includes(p),
  );
  await mutateStore({
    data: {
      op: "update",
      table: "accounts",
      match: { id: input.data.userId },
      patch: { permissions },
    },
  });
  return { ok: true };
}

export async function deleteStaff(input: { data: { userId: string } }) {
  const store = getStoreSync();
  const acc = ((store.accounts as { id: string; role?: string }[]) ?? []).find(
    (a) => a.id === input.data.userId,
  );
  if (acc?.role === "admin") return { ok: true };
  await mutateStore({
    data: { op: "delete", table: "accounts", match: { id: input.data.userId } },
  });
  return { ok: true };
}
