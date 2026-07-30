import type { ReactNode } from "react";
import { INSTITUTION_DOMAIN, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "./AuthProvider";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, error, signIn } = useAuth();
  const instituteMark = <div className="auth-mark"><img src={`${import.meta.env.BASE_URL}pgvim-institute-mark.png`} alt="Princess Galyani Vadhana Institute of Music"/></div>;
  if (!isSupabaseConfigured) return <main className="auth-page"><section className="auth-card config-card">{instituteMark}<p className="eyebrow">BM 2567 · SYSTEM SETUP</p><h1>ระบบพร้อมเชื่อมต่อ Supabase</h1><p>เพิ่ม <code>VITE_SUPABASE_URL</code> และ <code>VITE_SUPABASE_ANON_KEY</code> ใน Environment Variables เพื่อเปิดใช้งานระบบล็อกอิน</p></section></main>;
  if (loading) return <main className="auth-page"><section className="auth-card loading-card"><div className="auth-pulse">{instituteMark}</div><h1>กำลังตรวจสอบบัญชี…</h1><p>โปรดรอสักครู่</p></section></main>;
  if (!user) return <main className="auth-page"><div className="auth-shape auth-shape-one"/><div className="auth-shape auth-shape-two"/><section className="auth-card"><div className="auth-brand">{instituteMark}</div><p className="eyebrow">MY PGVIM · BM 2567</p><h1>ตัวช่วยวางแผนการเรียนของคุณ</h1><p>ตรวจสอบหน่วยกิต วิชาที่ยังขาด และวางแผนการเรียนด้วยข้อมูลของคุณเอง</p><button className="google-button" onClick={()=>void signIn()}><span>G</span>เข้าสู่ระบบด้วย Google ของสถาบัน</button><small>ใช้ได้เฉพาะบัญชีที่ลงท้ายด้วย <b>@{INSTITUTION_DOMAIN}</b></small>{error&&<div className="auth-error">{error}</div>}</section></main>;
  return children;
}
