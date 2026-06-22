import { supabase } from "@/integrations/supabase/client";

export type FieldChange = { label: string; from: string; to: string };

function fmt(v: unknown): string {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return `${v.length} عنصر`;
  if (typeof v === "boolean") return v ? "نعم" : "لا";
  return String(v);
}

/**
 * Builds a human-readable list of changed fields between two records.
 * Only fields present in `labels` are inspected.
 */
export function diffChanges(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
  labels: Record<string, string>,
): FieldChange[] {
  const changes: FieldChange[] = [];
  for (const key of Object.keys(labels)) {
    const from = fmt(before?.[key]);
    const to = fmt(after?.[key]);
    if (from !== to) changes.push({ label: labels[key], from, to });
  }
  return changes;
}

export type ActivityDetails = { changes: FieldChange[]; note: string | null };

export function parseDetails(raw: unknown): ActivityDetails | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") {
      return {
        changes: Array.isArray(obj.changes) ? obj.changes : [],
        note: typeof obj.note === "string" ? obj.note : null,
      };
    }
  } catch {
    // Legacy plain-text details
    return { changes: [], note: raw };
  }
  return null;
}

/**
 * Records an action in the activity log, attributed to the current user.
 * Best-effort: never throws so it can't break the main flow.
 */
export async function logActivity(input: {
  action: string;
  entity?: string;
  entityLabel?: string;
  changes?: FieldChange[];
  note?: string;
}) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    const hasDetails = (input.changes && input.changes.length > 0) || !!input.note;
    await supabase.from("activity_log").insert({
      user_id: user.id,
      actor_email: user.email ?? null,
      action: input.action,
      entity: input.entity ?? null,
      entity_label: input.entityLabel ?? null,
      details: hasDetails
        ? JSON.stringify({ changes: input.changes ?? [], note: input.note ?? null })
        : null,
    });
  } catch {
    /* ignore logging failures */
  }
}
