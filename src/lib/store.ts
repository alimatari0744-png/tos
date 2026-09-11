import seed from "../../data/db.json";

const STORAGE_KEY = "tawoos-db-v2";

export type JsonRecord = Record<string, any>;

function cloneSeed() {
  return JSON.parse(JSON.stringify(seed)) as Record<string, any>;
}

function readLocal(): Record<string, any> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, any>) : null;
  } catch {
    return null;
  }
}

let cache: Record<string, any> | null = null;

export function getStoreSync(): Record<string, any> {
  if (!cache) cache = readLocal() ?? cloneSeed();
  return cache;
}

export async function getStore(): Promise<Record<string, any>> {
  return getStoreSync();
}

function persist(store: Record<string, any>) {
  cache = store;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
  if (import.meta.env.DEV) {
    void import("./store.functions")
      .then((m) => m.syncStoreToDisk({ data: store }))
      .catch(() => {});
  }
}

function matches(row: JsonRecord, match: Record<string, unknown>) {
  return Object.entries(match).every(([key, value]) => row[key] === value);
}

export type MutateOp =
  | { op: "insert"; table: string; rows: JsonRecord[] }
  | { op: "update"; table: string; match: Record<string, unknown>; patch: JsonRecord }
  | { op: "delete"; table: string; match: Record<string, unknown> };

export async function mutateStore(input: { data: MutateOp }) {
  const op = input.data;
  const store = getStoreSync();
  const rows = [...((store[op.table] as JsonRecord[]) ?? [])];
  const now = new Date().toISOString();

  if (op.op === "insert") {
    const next = op.rows.map((row) => ({
      ...row,
      id: row.id ?? crypto.randomUUID(),
      created_at: row.created_at ?? now,
    }));
    store[op.table] = [...rows, ...next];
  } else if (op.op === "update") {
    store[op.table] = rows.map((row) =>
      matches(row, op.match) ? { ...row, ...op.patch, updated_at: now } : row,
    );
  } else {
    store[op.table] = rows.filter((row) => !matches(row, op.match));
  }

  persist(store);
  return { ok: true as const };
}

export async function loginAccount(input: { data: { email: string; password: string } }) {
  const store = getStoreSync();
  const email = input.data.email.trim().toLowerCase();
  const account = (store.accounts as JsonRecord[] | undefined)?.find(
    (a) => String(a.email).toLowerCase() === email && a.password === input.data.password,
  );
  if (!account) return { error: "invalid" as const, user: null };
  return {
    error: null,
    user: {
      id: String(account.id),
      email: String(account.email),
      name: String(account.name ?? ""),
      role: account.role as "admin" | "staff",
      permissions: account.role === "admin" ? ["*"] : (account.permissions as string[]) ?? [],
    },
  };
}

export async function uploadMedia(input: {
  data: { folder: string; name: string; bytes: string; type?: string };
}) {
  const mime = input.data.type || "image/jpeg";
  return { url: `data:${mime};base64,${input.data.bytes}` };
}
