import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type JsonRecord = Record<string, unknown>;

export interface Account {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "staff";
  permissions: string[];
}

export interface AppStore {
  activity_log: JsonRecord[];
  cities: JsonRecord[];
  districts: JsonRecord[];
  properties: JsonRecord[];
  property_interests: JsonRecord[];
  property_requests: JsonRecord[];
  property_types: JsonRecord[];
  regions: JsonRecord[];
  site_settings: JsonRecord[];
  staff_permissions: JsonRecord[];
  taxonomy_options: JsonRecord[];
  user_roles: JsonRecord[];
  staff: JsonRecord[];
  accounts: Account[];
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export async function readStore(): Promise<AppStore> {
  const raw = await readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as AppStore;
}

export async function writeStore(store: AppStore | Record<string, unknown>): Promise<void> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(store, null, 2), "utf8");
}

function matches(row: JsonRecord, match: Record<string, unknown>) {
  return Object.entries(match).every(([key, value]) => row[key] === value);
}

export type MutateOp =
  | { op: "insert"; table: keyof AppStore; rows: JsonRecord[] }
  | { op: "update"; table: keyof AppStore; match: Record<string, unknown>; patch: JsonRecord }
  | { op: "delete"; table: keyof AppStore; match: Record<string, unknown> };

export async function applyMutation(op: MutateOp): Promise<{ ok: true }> {
  const store = await readStore();
  const table = op.table;
  const rows = (store[table] as JsonRecord[]) ?? [];

  if (op.op === "insert") {
    const now = new Date().toISOString();
    const next = op.rows.map((row) => ({
      ...row,
      id: row.id ?? crypto.randomUUID(),
      created_at: row.created_at ?? now,
    }));
    (store[table] as JsonRecord[]) = [...rows, ...next];
  } else if (op.op === "update") {
    (store[table] as JsonRecord[]) = rows.map((row) =>
      matches(row, op.match) ? { ...row, ...op.patch, updated_at: new Date().toISOString() } : row,
    );
  } else {
    (store[table] as JsonRecord[]) = rows.filter((row) => !matches(row, op.match));
  }

  await writeStore(store);
  return { ok: true };
}

export function publicStore(store: AppStore) {
  return {
    ...store,
    accounts: store.accounts.map(({ password: _password, ...rest }) => rest),
  };
}
