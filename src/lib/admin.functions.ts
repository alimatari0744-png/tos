import { createServerFn } from "@tanstack/react-start";

const ADMIN_EMAIL = "alimatari0744@gmail.com";
const ADMIN_PASSWORD = "Zz@976431";

/**
 * Idempotently ensures the single administrator account exists and has the
 * admin role. Only ever provisions this one fixed email, so there is no
 * privilege-escalation surface.
 */
export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let user = list?.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error && !/already/i.test(error.message)) {
      throw new Error(error.message);
    }
    user = data?.user ?? undefined;
    if (!user) {
      const { data: again } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      user = again?.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
    }
  }

  if (user) {
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
  }

  return { ok: true };
});
