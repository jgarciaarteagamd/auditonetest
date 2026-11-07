import { supabase } from "./supabase";
import type { Professional } from "@/components/ReportEditor";

/** Doctor's name and licence from their profile, used as defaults for the report signature. */
export async function getProfessionalDefaults(): Promise<Professional> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { name: "", profession: "", license: "" };
  const { data } = await supabase
    .from("doctor_profiles")
    .select("first_name,last_name,license_number")
    .eq("id", u.user.id)
    .maybeSingle();
  const name = [data?.first_name, data?.last_name].filter(Boolean).join(" ");
  return { name: name ? `Dr/a. ${name}` : "", profession: "", license: data?.license_number ?? "" };
}
