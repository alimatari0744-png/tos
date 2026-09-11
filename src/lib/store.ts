import seed from "../../data/db.json";

export type JsonRecord = Record<string, any>;

const SAVE_PATH = "/__tawoos/db";
const LOCAL_SAVE_URLS = [
  "http://127.0.0.1:8080/__tawoos/db",
  "http://localhost:8080/__tawoos/db",
];

function cloneSeed() {
  return JSON.parse(JSON.stringify(seed)) as Record<string, any>;
}

function clearBrowserCopy() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("tawoos-db-v1");
    localStorage.removeItem("tawoos-db-v2");
  } catch {
    /* ignore */
  }
}

let cache: Record<string, any> | null = null;

export function getStoreSync(): Record<string, any> {
  if (!cache) {
    clearBrowserCopy();
    cache = cloneSeed();
  }
  return cache;
}

export async function getStore(): Promise<Record<string, any>> {
  if (typeof window !== "undefined" && import.meta.env.DEV) {
    try {
      const res = await fetch(SAVE_PATH, { method: "GET" });
      if (res.ok) {
        const data = (await res.json()) as Record<string, any>;
        if (data && typeof data === "object") {
          cache = data;
          return cache;
        }
      }
    } catch {
      /* bundled seed */
    }
  }
  return getStoreSync();
}

async function postStore(url: string, store: Record<string, any>) {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(store),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`save failed (${res.status})`);
  } finally {
    window.clearTimeout(timer);
  }
}

async function persistStore(store: Record<string, any>) {
  cache = store;
  clearBrowserCopy();
  if (typeof window === "undefined") return;

  const urls = import.meta.env.DEV ? [SAVE_PATH] : LOCAL_SAVE_URLS;
  let lastError: unknown;
  for (const url of urls) {
    try {
      await postStore(url, store);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(
    lastError instanceof Error
      ? "تعذّر حفظ البيانات في ملفات المشروع. شغّل الموقع المحلي ثم أعد الحفظ."
      : "تعذّر حفظ البيانات في ملفات المشروع.",
  );
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

  await persistStore(store);
  return { ok: true as const };
}

export async function loginAccount(input: { data: { email: string; password: string } }) {
  const store = await getStore();
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
