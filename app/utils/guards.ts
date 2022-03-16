import { Session } from "@supabase/supabase-js";
import { redirect } from "remix";
import { supabase } from "~/api";
import { getSession } from "~/sessions";

export const managerGuard = async (
  request: Request
): Promise<Response | null> => {
  const session = await getSession(request.headers.get("Cookie"));
  const supabaseSession: Session | undefined = session.get("supabaseSession");
  if (supabaseSession) {
    const user = supabaseSession.user;
    await supabase.auth.setAuth(supabaseSession.access_token);
    const { data, error } = await supabase
      .from("user_permissions")
      .select()
      .eq("id", user?.id ?? "")
      .eq("manager", true);
    if (!data?.length) {
      return redirect("/bikes");
    }
  }
  return null;
};

export const expiredJwtGuard = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  const supabaseSession: Session | null = session.get("supabaseSession");
  if (
    !supabaseSession ||
    (supabaseSession && (supabaseSession?.expires_at || 0) * 1000 < Date.now())
  ) {
    return redirect("/", {
      headers: {
        "Set-Cookie": "",
      },
    });
  }
  return null;
};
