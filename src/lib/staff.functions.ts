import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ALL_PERMISSIONS = [
  "properties",
  "taxonomy",
  "geo",
  "requests",
  "interests",
  "settings",
] as const;
export type Permission = (typeof ALL_PERMISSIONS)[number];

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  permissions: string[];
}

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffMember[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: perms } = await supabaseAdmin
      .from("staff_permissions")
      .select("user_id, permission");

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    const grouped = new Map<string, string[]>();
    (perms ?? []).forEach((p: { user_id: string; permission: string }) => {
      const arr = grouped.get(p.user_id) ?? [];
      arr.push(p.permission);
      grouped.set(p.user_id, arr);
    });

    const result: StaffMember[] = [];
    for (const [userId, permissions] of grouped) {
      const u = list?.users?.find((x) => x.id === userId);
      if (!u) continue;
      result.push({
        id: userId,
        email: u.email ?? "",
        name: (u.user_metadata?.name as string) ?? "",
        permissions,
      });
    }
    return result;
  });

export const createStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      email: string;
      name: string;
      password: string;
      permissions: string[];
    }) => data,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const permissions = (data.permissions ?? []).filter((p) =>
      (ALL_PERMISSIONS as readonly string[]).includes(p),
    );

    if (!email || !data.password || data.password.length < 6) {
      throw new Error("بيانات غير صحيحة");
    }

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) throw new Error(error.message);
    const userId = created?.user?.id;
    if (!userId) throw new Error("تعذّر إنشاء الحساب");

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "staff" }, { onConflict: "user_id,role" });

    if (permissions.length) {
      await supabaseAdmin
        .from("staff_permissions")
        .insert(permissions.map((permission) => ({ user_id: userId, permission })));
    }

    return { ok: true, id: userId };
  });

export const updateStaffPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; permissions: string[] }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const permissions = (data.permissions ?? []).filter((p) =>
      (ALL_PERMISSIONS as readonly string[]).includes(p),
    );

    await supabaseAdmin.from("staff_permissions").delete().eq("user_id", data.userId);
    if (permissions.length) {
      await supabaseAdmin
        .from("staff_permissions")
        .insert(permissions.map((permission) => ({ user_id: data.userId, permission })));
    }
    return { ok: true };
  });

export const deleteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.deleteUser(data.userId);
    return { ok: true };
  });
