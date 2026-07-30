import type { User } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { INSTITUTION_DOMAIN, isInstitutionEmail, isSupabaseConfigured, supabase } from "../lib/supabase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    const acceptUser = async (nextUser: User | null) => {
      if (nextUser && !isInstitutionEmail(nextUser.email)) {
        await client.auth.signOut();
        if (active) {
          setUser(null);
          setError(`บัญชีนี้ไม่ใช่อีเมลของสถาบัน กรุณาใช้บัญชี @${INSTITUTION_DOMAIN}`);
        }
        return;
      }
      if (active) {
        setUser(nextUser);
        setError("");
      }
    };
    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      void acceptUser(data.session?.user ?? null).finally(() => active && setLoading(false));
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      void acceptUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, loading, error,
    signIn: async () => {
      if (!supabase) return;
      setError("");
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + import.meta.env.BASE_URL,
          queryParams: { hd: INSTITUTION_DOMAIN, prompt: "select_account" },
        },
      });
      if (signInError) setError(signInError.message);
    },
    signOut: async () => { if (supabase) await supabase.auth.signOut(); },
  }), [error, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
