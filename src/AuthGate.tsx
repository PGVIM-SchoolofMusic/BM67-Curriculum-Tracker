import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./lib/supabase";

const ALLOWED_DOMAIN = "pgvim.ac.th";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const next = data.session;
      if (next && !next.user.email?.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
        supabase?.auth.signOut();
        setError("กรุณาใช้บัญชี Google ของสถาบัน @pgvim.ac.th");
      } else {
        setSession(next);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (next && !next.user.email?.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
        supabase?.auth.signOut();
        setSession(null);
        setError("บัญชีนี้ไม่ได้รับอนุญาต กรุณาใช้ @pgvim.ac.th");
        return;
      }
      setSession(next);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    if (!supabase) return;
    setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/BM67-Curriculum-Tracker/",
        queryParams: { hd: ALLOWED_DOMAIN, prompt: "select_account" },
      },
    });
    if (authError) setError(authError.message);
  };

  if (!supabaseConfigured) {
    return <div className="auth-screen"><div className="auth-card"><div className="auth-mark">P</div><h1>BM67 Curriculum Tracker</h1><p>ระบบยังไม่ได้รับการเชื่อมต่อ Supabase กรุณาติดต่อผู้ดูแลระบบ</p></div></div>;
  }

  if (loading) return <div className="auth-screen"><div className="auth-card"><div className="auth-loader" /><p>กำลังตรวจสอบบัญชี...</p></div></div>;

  if (!session) {
    return <div className="auth-screen"><div className="auth-card"><div className="auth-mark">P</div><p className="auth-eyebrow">PGVIM · SCHOOL OF MUSIC</p><h1>BM67 Curriculum Tracker</h1><p>เข้าสู่ระบบด้วยบัญชี Google ของสถาบัน เพื่อดูและวางแผนความก้าวหน้าของหลักสูตร</p><button className="google-button" onClick={signIn}><span>G</span>เข้าสู่ระบบด้วย Google</button><small>อนุญาตเฉพาะอีเมล @pgvim.ac.th</small>{error && <div className="auth-error">{error}</div>}</div></div>;
  }

  return <><div className="session-bar"><span>{session.user.email}</span><button onClick={() => supabase?.auth.signOut()}>ออกจากระบบ</button></div>{children}</>;
}
