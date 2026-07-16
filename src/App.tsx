"use client";

import { useMemo, useState } from "react";

type Course = {
  id: string;
  th: string;
  en: string;
  credits: number;
  term: string;
  year: number;
  category: "Core" | "GenEd" | "Module";
  grade: string;
};

const initialCourses: Course[] = [
  { id: "121 101", th: "ทักษะวิชาเอก 1", en: "Major Skill 1", credits: 3, term: "ปี 1 / ภาค 1", year: 1, category: "Core", grade: "A" },
  { id: "121 109", th: "การบรรเลงรวมวงเล็ก 1", en: "Chamber Music 1", credits: 1, term: "ปี 1 / ภาค 1", year: 1, category: "Core", grade: "A" },
  { id: "121 115", th: "การบรรเลงรวมวงใหญ่ 1", en: "Large Ensemble 1", credits: 1, term: "ปี 1 / ภาค 1", year: 1, category: "Core", grade: "B+" },
  { id: "121 201", th: "ทักษะผู้แสดงดนตรี 1", en: "Performing Musicianship 1", credits: 3, term: "ปี 1 / ภาค 1", year: 1, category: "Core", grade: "B+" },
  { id: "121 205", th: "ประวัติศาสตร์ดนตรีตะวันตก 1", en: "Western Music History 1", credits: 2, term: "ปี 1 / ภาค 1", year: 1, category: "Core", grade: "B" },
  { id: "120 304", th: "ภาษาอังกฤษพื้นฐาน 1", en: "Foundation English 1", credits: 2, term: "ปี 1 / ภาค 2", year: 1, category: "GenEd", grade: "A" },
  { id: "121 103", th: "ทักษะวิชาเอก 3", en: "Major Skill 3", credits: 3, term: "ปี 2 / ภาค 1", year: 2, category: "Core", grade: "A" },
  { id: "121 209", th: "ดนตรีเพื่อประชาสังคม 1", en: "Music for Society 1", credits: 1, term: "ปี 2 / ภาค 1", year: 2, category: "Core", grade: "B+" },
  { id: "122 210", th: "วรรณกรรมดนตรี", en: "Music Literature", credits: 2, term: "ปี 2 / ภาค 1", year: 2, category: "Module", grade: "A" },
  { id: "121 105", th: "ทักษะวิชาเอก 5", en: "Major Skill 5", credits: 3, term: "ปี 3 / ภาค 1", year: 3, category: "Core", grade: "IP" },
  { id: "121 131", th: "โครงการการแสดงของนักศึกษาชั้นปีที่ 3", en: "Junior Recital Project", credits: 2, term: "ปี 3 / ภาค 2", year: 3, category: "Core", grade: "-" },
  { id: "122 107", th: "ทักษะวิชารอง 1", en: "Minor Skill 1", credits: 2, term: "ปี 3 / ภาค 1", year: 3, category: "Module", grade: "IP" },
  { id: "122 201", th: "กลวิธีการสอนดนตรี 1", en: "Music Pedagogy 1", credits: 2, term: "ปี 3 / ภาค 1", year: 3, category: "Module", grade: "-" },
  { id: "121 132", th: "ปัจฉิมนิทัศน์ 1", en: "Graduate Project 1", credits: 3, term: "ปี 4 / ภาค 1", year: 4, category: "Core", grade: "-" },
  { id: "122 109", th: "ทักษะวิชารอง 3", en: "Minor Skill 3", credits: 2, term: "ปี 4 / ภาค 1", year: 4, category: "Module", grade: "-" },
];

const navItems = [
  ["Overview", "หน้าหลักของฉัน", "●"],
  ["Curriculum", "แผนการเรียนของฉัน", "▦"],
  ["Courses", "ค้นหารายวิชา", "✦"],
  ["Grades", "บันทึกผลการเรียน", "↗"],
  ["Advising", "ขอคำปรึกษา", "◌"],
];

const isPassed = (grade: string) => !["-", "IP", "F"].includes(grade);

export default function Home() {
  const [language, setLanguage] = useState<"TH" | "EN">("TH");
  const [courses, setCourses] = useState(initialCourses);
  const [activeNav, setActiveNav] = useState("Overview");
  const [year, setYear] = useState<number | "All">("All");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Course | null>(null);
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const t = (th: string, en: string) => (language === "TH" ? th : en);
  const earned = courses.filter((course) => isPassed(course.grade)).reduce((sum, course) => sum + course.credits, 0) + 71;
  const percent = Math.min(100, Math.round((earned / 130) * 100));

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchesQuery = `${course.id} ${course.th} ${course.en}`.toLowerCase().includes(query.toLowerCase());
      const matchesYear = year === "All" || course.year === year;
      const matchesCategory = category === "All" || course.category === category;
      const courseStatus = isPassed(course.grade) ? "Completed" : course.grade === "IP" ? "In progress" : "Planned";
      return matchesQuery && matchesYear && matchesCategory && (status === "All" || status === courseStatus);
    });
  }, [courses, query, year, category, status]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const saveGrade = (grade: string) => {
    if (!editing) return;
    setCourses((current) => current.map((course) => course.id === editing.id ? { ...course, grade } : course));
    setEditing(null);
    notify(t("บันทึกผลการเรียนแล้ว", "Grade updated"));
  };

  return (
    <div className="app-shell">
      <div className="deco deco-one" />
      <div className="deco deco-two" />
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">P</div>
          <div><strong>PGVIM</strong><span>School of Music</span></div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)}>×</button>
        </div>
        <nav>
          {navItems.map(([key, th, icon]) => (
            <button key={key} className={activeNav === key ? "active" : ""} onClick={() => { setActiveNav(key); setMenuOpen(false); }}>
              <span className="nav-icon">{icon}</span><span>{language === "TH" ? th : key}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span>i</span>
          <div><strong>{t("หลักสูตรดุริยางคศาสตรบัณฑิต", "Bachelor of Music")}</strong><small>Curriculum 2567</small></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)}>☰</button>
          <div><p className="eyebrow">MY PGVIM · BM 2567</p><h1>{t("ตัวช่วยวางแผนการเรียน", "My Degree Planner")}</h1></div>
          <div className="top-actions">
            <button className="language" onClick={() => setLanguage(language === "TH" ? "EN" : "TH")}><b>{language}</b><span>{language === "TH" ? "EN" : "TH"}</span></button>
            <button className="avatar" onClick={() => notify(t("เปิดข้อมูลนักศึกษา", "Student profile opened"))}>ND</button>
          </div>
        </header>

        <div className="content">
          <section className="welcome">
            <div><div className="student-year">{t("นักศึกษาชั้นปีที่ 3", "YEAR 3 STUDENT")}</div><h2>{t("สวัสดี!", "Hello!")}</h2><p>{t("มาดูกันว่าคุณเรียนถึงไหนแล้ว และภาคเรียนต่อไปควรเลือกอะไร", "See how far you have come and what to take next semester.")}</p></div>
            <button className="outline-button" onClick={() => notify(t("ดาวน์โหลดรายงานตัวอย่างแล้ว", "Sample report downloaded"))}>↓ {t("ดาวน์โหลดรายงาน", "Download report")}</button>
          </section>

          <section className="student-strip">
            <div><span className="mini-label">{t("นักศึกษา", "Student")}</span><strong>{t("นักศึกษาตัวอย่าง", "Demo Student")}</strong><small>67xxxxxx</small></div>
            <div><span className="mini-label">{t("เครื่องดนตรี", "Instrument")}</span><strong>French Horn</strong></div>
            <div><span className="mini-label">Module</span><strong>MIC</strong><small>Multi-Instrumentalist & Choral Studies</small></div>
            <button onClick={() => notify(t("ข้อมูลนักศึกษาเป็นตัวอย่างสำหรับ Mockup", "This is sample student data"))}>•••</button>
          </section>

          <section className="overview-grid">
            <article className="progress-card">
              <div className="card-heading"><div><span className="mini-label">{t("ความคืบหน้ารวม", "Overall progress")}</span><h3>{earned}<small>/ 130 {t("หน่วยกิต", "credits")}</small></h3></div><div className="ring" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}><strong>{percent}%</strong></div></div>
              <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
              <div className="progress-meta"><span>{t("ผ่านแล้ว", "Completed")} <b>{earned}</b></span><span>{t("คงเหลือ", "Remaining")} <b>{130 - earned}</b></span></div>
            </article>
            <article className="attention-card"><span className="attention-icon">03</span><div><span className="mini-label">{t("สิ่งที่ควรทำต่อ", "YOUR NEXT STEP")}</span><strong>{t("เลือกรายวิชาสำหรับเทอมหน้า", "Plan your next semester")}</strong><p>{t("มี 3 รายวิชาที่ยังไม่ได้ลงทะเบียน เลือกดูและวางแผนได้เลย", "You have 3 planned courses. Review them before registration.")}</p></div><button aria-label={t("ดูรายวิชาที่ยังไม่ได้ลงทะเบียน", "View planned courses")} onClick={() => { setStatus("Planned"); document.getElementById("course-list")?.scrollIntoView({ behavior: "smooth" }); }}>ดู →</button></article>
          </section>

          <section className="metrics">
            {[{label:"Core",th:"วิชาหลัก",value:86,done:64},{label:"GenEd",th:"ศึกษาทั่วไป",value:24,done:18},{label:"Module",th:"วิชาโมดูล",value:20,done:10}].map((item) => <article key={item.label}><span className="metric-dot"/><div><span className="mini-label">{language === "TH" ? item.th : item.label}</span><h3>{item.done}<small>/ {item.value}</small></h3><p>{t(`เหลืออีก ${item.value-item.done} หน่วยกิต`, `${item.value-item.done} credits to go`)}</p></div><div className="mini-track"><span style={{width:`${item.done/item.value*100}%`}}/></div></article>)}
            <article className="gpax"><span className="mini-label">GPAX</span><h3>3.42<small>/ 4.00</small></h3><p>{t("คำนวณจาก 42 หน่วยกิต", "From 42 graded credits")}</p></article>
          </section>

          <section className="student-guide">
            <div className="guide-title"><span>✦</span><div><p className="eyebrow">{t("ตัวช่วยสำหรับคุณ", "MADE FOR YOU")}</p><h2>{t("เทอมหน้าควรเรียนอะไร?", "What should I take next?")}</h2><p>{t("ระบบดูจากชั้นปี วิชาที่ผ่านแล้ว และ Module ที่คุณเลือก", "Based on your year, completed courses and selected module.")}</p></div></div>
            <div className="suggested-courses">
              <button onClick={() => {setQuery("121 131");document.getElementById("course-list")?.scrollIntoView({behavior:"smooth"});}}><span>01</span><div><strong>Junior Recital Project</strong><small>121 131 · 2 {t("หน่วยกิต", "credits")}</small></div><b>＋</b></button>
              <button onClick={() => {setQuery("122 201");document.getElementById("course-list")?.scrollIntoView({behavior:"smooth"});}}><span>02</span><div><strong>Music Pedagogy 1</strong><small>122 201 · 2 {t("หน่วยกิต", "credits")}</small></div><b>＋</b></button>
              <button onClick={() => {setYear(4);setStatus("Planned");document.getElementById("course-list")?.scrollIntoView({behavior:"smooth"});}}><span>03</span><div><strong>{t("ดูแผนชั้นปีที่ 4", "Preview Year 4")}</strong><small>{t("เตรียมแผนล่วงหน้า", "Plan one year ahead")}</small></div><b>→</b></button>
            </div>
            <button className="advisor-button" onClick={() => notify(t("ส่งคำขอปรึกษาอาจารย์ที่ปรึกษาแล้ว (ตัวอย่าง)", "Advising request sent (demo)"))}><span>?</span><div><strong>{t("ยังไม่แน่ใจใช่ไหม?", "Still not sure?")}</strong><small>{t("ขอคำปรึกษาจากอาจารย์ที่ปรึกษา", "Ask your academic advisor")}</small></div><b>→</b></button>
          </section>

          <section className="course-panel" id="course-list">
            <div className="section-title"><div><p className="eyebrow">MY CHECKLIST</p><h2>{t("เช็กรายวิชาของฉัน", "My course checklist")}</h2><p>{t("เลือกชั้นปีหรือค้นหารายวิชา แล้วกดที่เกรดเพื่ออัปเดตผลการเรียน", "Choose a year or search a course, then tap the grade to update it.")}</p></div><span>{filtered.length} {t("รายวิชา", "courses")}</span></div>
            <div className="year-tabs">
              {(["All",1,2,3,4] as const).map((item) => <button key={item} onClick={() => setYear(item)} className={year === item ? "active" : ""}>{item === "All" ? t("ทั้งหมด", "All") : t(`ชั้นปี ${item}`, `Year ${item}`)}</button>)}
            </div>
            <div className="filters">
              <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("ค้นหารหัสหรือชื่อรายวิชา", "Search code or course name")} /></label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="All">{t("ทุกหมวดวิชา", "All categories")}</option><option>Core</option><option>GenEd</option><option>Module</option></select>
              <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="All">{t("ทุกสถานะ", "All statuses")}</option><option value="Completed">{t("ผ่านแล้ว", "Completed")}</option><option value="In progress">{t("กำลังเรียน", "In progress")}</option><option value="Planned">{t("ยังไม่ลงทะเบียน", "Planned")}</option></select>
              {(query || category !== "All" || status !== "All" || year !== "All") && <button className="clear" onClick={() => {setQuery("");setCategory("All");setStatus("All");setYear("All");}}>× {t("ล้างตัวกรอง", "Clear")}</button>}
            </div>
            <div className="table-wrap">
              <table><thead><tr><th>{t("รายวิชา", "Course")}</th><th>{t("ภาคการศึกษา", "Term")}</th><th>{t("หมวด", "Category")}</th><th>{t("หน่วยกิต", "Credits")}</th><th>{t("สถานะ", "Status")}</th><th>{t("เกรด", "Grade")}</th></tr></thead>
              <tbody>{filtered.map((course) => {
                const courseStatus = isPassed(course.grade) ? "completed" : course.grade === "IP" ? "progress" : "planned";
                return <tr key={course.id} onClick={() => setEditing(course)}><td><b>{course.id}</b><div><strong>{language === "TH" ? course.th : course.en}</strong><small>{language === "TH" ? course.en : course.th}</small></div></td><td>{course.term}</td><td><span className="category-chip">{course.category}</span></td><td>{course.credits}</td><td><span className={`status ${courseStatus}`}><i/>{courseStatus === "completed" ? t("ผ่านแล้ว","Completed") : courseStatus === "progress" ? t("กำลังเรียน","In progress") : t("วางแผน","Planned")}</span></td><td><button className="grade-button" onClick={(e) => {e.stopPropagation();setEditing(course);}}>{course.grade} <span>›</span></button></td></tr>;
              })}</tbody></table>
              {filtered.length === 0 && <div className="empty"><b>⌕</b><strong>{t("ไม่พบรายวิชา", "No courses found")}</strong><p>{t("ลองเปลี่ยนคำค้นหาหรือตัวกรอง", "Try changing the search or filters.")}</p></div>}
            </div>
          </section>
          <footer>PGVIM · Bachelor of Music Curriculum 2567 <span>{t("ต้นแบบสำหรับทดสอบการใช้งาน", "Interactive mockup")}</span></footer>
        </div>
      </main>

      {editing && <div className="modal-backdrop" onMouseDown={() => setEditing(null)}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setEditing(null)}>×</button><span className="mini-label">{editing.id} · {editing.credits} {t("หน่วยกิต", "credits")}</span><h2>{language === "TH" ? editing.th : editing.en}</h2><p>{language === "TH" ? editing.en : editing.th}</p><label>{t("ผลการเรียน", "Course grade")}</label><div className="grade-grid">{["A","B+","B","C+","C","D+","D","F","IP","-"].map((grade) => <button key={grade} className={editing.grade === grade ? "selected" : ""} onClick={() => saveGrade(grade)}>{grade === "-" ? t("ยังไม่เรียน", "Planned") : grade}</button>)}</div><small>{t("เมื่อเลือกเกรด ระบบจะคำนวณหน่วยกิตใหม่โดยอัตโนมัติ", "Credits update automatically after selecting a grade.")}</small></div></div>}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
