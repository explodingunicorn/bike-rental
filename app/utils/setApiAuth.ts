import { Session } from "@supabase/supabase-js";
import { supabase } from "~/api";
import { getSession } from "~/sessions";

export const setApiAuth = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  const supabaseSession: Session = session.get("supabaseSession");
  const accessToken = supabaseSession.access_token;
  await supabase.auth.setAuth(accessToken);
  return session.get("supabaseSession") as Session;
};
