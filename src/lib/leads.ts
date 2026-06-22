import { supabase } from "@/integrations/supabase/client";

/**
 * Records a customer contact/lead in the dashboard.
 * `source` distinguishes how the lead was captured: "form" (interest form)
 * or "whatsapp" (clicked the WhatsApp contact button).
 * Best-effort: never throws so it can't break the user flow.
 */
export async function recordContact(input: {
  source: "form" | "whatsapp";
  propertyRef?: string | null;
  name?: string | null;
  phone?: string | null;
}) {
  try {
    await supabase.from("property_interests").insert({
      name: input.name ?? null,
      phone: input.phone ?? null,
      property_ref: input.propertyRef ?? null,
      source: input.source,
    });
  } catch {
    /* ignore */
  }
}
