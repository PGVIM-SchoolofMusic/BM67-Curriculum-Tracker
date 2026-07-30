import { useMemo, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { useAuth } from "./auth/AuthProvider";

type NavKey = "Overview" | "Curriculum" | "Courses" | "Grades" | "Advising";
type Course = {
  id: string; th: string; en: string; credits: number; year: number; semester: number;
  category: "Core" | "GenEd" | "Module" | "Free"; grade: string;
};

const courses: Course[] = [
  { id:"121 101", th:"ทักษะวิชาเอก 1", en:"Major Skill 1", credits:3, year:1, semester:1, category:"Core", grade:"A" },
  { id:"121 109", th:"การบรรเลงรวมวงเล็ก 1", en:"Chamber Music 1", credits:1, year:1, semester:1, category:"Core", grade:"A" },
  { id:"121 115", th:"การบรรเลงรวมวงใหญ่ 1", en:"Large Ensemble 1", credits:1, year:1, semester:1, category:"Core", grade:"B+" },
  { id:"121 201", th:"ทักษะผู้แสดงดนตรี 1", en:"Performing Musicianship 1", credits:3, year:1, semester:1, category:"Core", grade:"B+" },
  { id:"120 304", th:"ภาษาอังกฤษพื้นฐาน 1", en:"Foundation English 1", credits:2, year:1, semester:2, category:"GenEd", grade:"B" },
  { id:"121 221", th:"สัปดาห์โครงการ 1", en:"Project Week 1", credits:1, year:1, semester:2, category:"Core", grade:"S" },
  { id:"121 103", th:"ทักษะวิชาเอก 3", en:"Major Skill 3", credits:3, year:2, semester:1, category:"Core", grade:"A" },
  { id:"121 207", th:"ประวัติศาสตร์ดนตรีตะวันตก 3", en:"Western Music History 3", credits:2, year:2, semester:1, category:"Core", grade:"B+" },
  { id:"121 223", th:"สัปดาห์โครงการ 3", en:"Project Week 3", credits:1, year:2, semester:1, category:"Core", grade:"S" },
  { id:"120 410", th:"การใช้ร่างกาย 1", en:"Body Use 1", credits:1, year:2, semester:2, category:"GenEd", grade:"B+" },
  { id:"121 105", th:"ทักษะวิชาเอก 5", en:"Major Skill 5", credits:3, year:3, semester:1, category:"Core", grade:"IP" },
  { id:"122 107", th:"ทักษะวิชารอง 1", en:"Minor Skill 1", credits:2, year:3, semester:1, category:"Module", grade:"IP" },
  { id:"122 201", th:"กลวิธีการสอนดนตรี 1", en:"Music Pedagogy 1", credits:2, year:3, semester:1, category:"Module", grade:"-" },
  { id:"121 131", th:"โครงการการแสดงของนักศึกษาชั้นปีที่ 3", en:"Junior Recital Project", credits:2, year:3, semester:2, category:"Core", grade:"-" },
  { id:"121 132", th:"ปัจฉิมนิทัศน์ 1", en:"Graduate Project 1", credits:3, year:4, semester:1, category:"Core", grade:"-" },
  { id:"122 109", th:"ทักษะวิชารอง 3", en:"Minor Skill 3", credits:2, year:4, semester:1, category:"Module", grade:"-" },
];

const nav: { key: NavKey; th: string; en: string; icon: string }[] = [
  { key:"Overview", th:"หน้าหลักของฉัน", en:"My overview", icon:"●" },
  { key:"Curriculum", th:"แผนการเรียนของฉัน", en:"Study plan", icon:"▦" },
  { key:"Courses", th:"ค้นหารายวิชา", en:"Find courses", icon:"✦" },
  { key:"Grades", th:"บันทึกผลการเรียน", en:"Record grades", icon:"↗" },
  { key:"Advising", th:"ขอคำปรึกษา", en:"Advising", icon:"◌" },
];
const passed = (grade: string) => !["-", "IP", "F", "U"].includes(grade);

export default function App() {
  const { user, signOut } = useAuth();
  const [active, setActive] = useState<NavKey>("Overview");
  const [language, setLanguage] = useState<"TH" | "EN">("TH");
  const [records, setRecords] = useState(courses);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Course | null>(null);
  const [term, setTerm] = useState("ปี 1 / ภาค 1");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const t = (th: string, en: string) => language === "TH" ? th : en;
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || t("นักศึกษา","Student");
  const initials = name.split(/\s+/).slice(0,2).map((x:string)=>x[0]).join("").toUpperCase();
  const completed = records.filter(c=>passed(c.grade)).reduce((n,c)=>n+c.credits,0);
  const demoEarned = completed + 71;
  const percent = Math.round(demoEarned / 130 * 100);
  const notify = (message:string) => { setToast(message); window.setTimeout(()=>setToast(""),2200); };
  const changePage = (key:NavKey) => { setActive(key); setMenuOpen(false); window.scrollTo({top:0,behavior:"smooth"}); };
  const saveGrade = (grade:string) => {
    if (!editing) return;
    setRecords(all=>all.map(c=>c.id===editing.id?{...c,grade}:c));
    setEditing(null); notify(t("บันทึกผลการเรียนแล้ว (รอบทดลอง)","Grade saved for this preview"));
  };
  const found = useMemo(()=>records.filter(c=>{
    const text = `${c.id} ${c.th} ${c.en}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (filter==="All" || c.category===filter);
  }),[records,query,filter]);

  const Overview = () => <div className="page-stack">
    <section className="welcome"><div><div className="student-year">{t("นักศึกษาชั้นปีที่ 3","YEAR 3 STUDENT")}</div><h2>{t(`สวัสดี ${name}!`,`Hello, ${name}!`)}</h2><p>{t("มาดูกันว่าคุณเรียนถึงไหนแล้ว และควรทำอะไรต่อ","See your progress and what to do next.")}</p></div><button className="outline-button" onClick={()=>changePage("Grades")}>{t("กรอกผลการเรียน","Record grades")} →</button></section>
    <section className="student-strip"><div><span className="mini-label">{t("นักศึกษา","Student")}</span><strong>{name}</strong><small>{user?.email}</small></div><div><span className="mini-label">{t("เครื่องดนตรี","Instrument")}</span><strong>French Horn</strong><small>{t("ข้อมูลตัวอย่าง","Sample profile")}</small></div><div><span className="mini-label">Module</span><strong>MIC</strong><small>Multi-Instrumentalist & Choral Studies</small></div></section>
    <section className="overview-grid"><article className="progress-card"><div className="card-heading"><div><span className="mini-label">{t("ความคืบหน้ารวม","Overall progress")}</span><h3>{demoEarned}<small>/ 130 {t("หน่วยกิต","credits")}</small></h3></div><div className="ring" style={{"--progress":`${percent*3.6}deg`} as CSSProperties}><strong>{percent}%</strong></div></div><div className="progress-track"><span style={{width:`${percent}%`}}/></div><div className="progress-meta"><span>{t("ผ่านแล้ว","Completed")} <b>{demoEarned}</b></span><span>{t("คงเหลือ","Remaining")} <b>{130-demoEarned}</b></span></div></article><article className="attention-card"><span className="attention-icon">03</span><div><span className="mini-label">{t("สิ่งที่ควรทำต่อ","NEXT STEP")}</span><strong>{t("กรอกผลการเรียนย้อนหลัง","Add your past grades")}</strong><p>{t("เริ่มจากเทอมแรก แล้วระบบจะคำนวณความคืบหน้าให้","Start with your first semester; progress updates automatically.")}</p></div><button onClick={()=>changePage("Grades")}>{t("เริ่ม","Start")} →</button></article></section>
    <section className="metrics">{[{th:"วิชาเฉพาะ",en:"Core",done:64,total:86},{th:"ศึกษาทั่วไป",en:"GenEd",done:18,total:24},{th:"เลือกเสรี",en:"Free elective",done:10,total:20}].map(x=><article key={x.en}><span className="metric-dot"/><div><span className="mini-label">{t(x.th,x.en)}</span><h3>{x.done}<small>/ {x.total}</small></h3><p>{t(`เหลือ ${x.total-x.done} หน่วยกิต`,`${x.total-x.done} credits left`)}</p></div><div className="mini-track"><span style={{width:`${x.done/x.total*100}%`}}/></div></article>)}<article className="gpax"><span className="mini-label">GPA {t("โดยประมาณ","estimate")}</span><h3>3.42<small>/ 4.00</small></h3><p>{t("ไม่ใช่ผลการเรียนอย่างเป็นทางการ","Not an official transcript")}</p></article></section>
    <section className="student-guide"><div className="guide-title"><span>✦</span><div><p className="eyebrow">{t("แนะนำสำหรับคุณ","MADE FOR YOU")}</p><h2>{t("สำรวจระบบต่อ","Explore next")}</h2><p>{t("ทั้ง 5 แถบเปิดทดลองใช้งานได้แล้ว","All five sections are now interactive.")}</p></div></div><div className="suggested-courses">{(["Curriculum","Courses","Advising"] as NavKey[]).map((key,i)=><button key={key} onClick={()=>changePage(key)}><span>0{i+1}</span><div><strong>{t(nav.find(n=>n.key===key)!.th,nav.find(n=>n.key===key)!.en)}</strong><small>{t("กดเพื่อเปิดดู","Open section")}</small></div><b>→</b></button>)}</div></section>
  </div>;

  const Curriculum = () => <div className="page-stack">
    <PageIntro eyebrow="8 SEMESTERS" title={t("แผนการเรียนของฉัน","My study plan")} text={t("ภาพรวมรายวิชาตามแผนแนะนำ BM67 แยกตามชั้นปีและภาคการศึกษา","BM67 recommended plan across four years and eight semesters.")}/>
    <section className="term-grid">{[1,2,3,4].flatMap(year=>[1,2].map(semester=>{const list=records.filter(c=>c.year===year&&c.semester===semester);return <article className="term-card" key={`${year}-${semester}`}><div className="term-head"><span>{String((year-1)*2+semester).padStart(2,"0")}</span><div><small>{t(`ชั้นปี ${year}`,`YEAR ${year}`)}</small><h3>{t(`ภาคการศึกษาที่ ${semester}`,`Semester ${semester}`)}</h3></div><b>{list.reduce((n,c)=>n+c.credits,0)} cr.</b></div><div className="term-courses">{list.map(c=><button key={c.id} onClick={()=>setEditing(c)}><i className={passed(c.grade)?"done":c.grade==="IP"?"doing":""}/><span><b>{c.id}</b>{t(c.th,c.en)}</span><strong>{c.grade}</strong></button>)}{!list.length&&<p>{t("ข้อมูลรายวิชาฉบับเต็มกำลังเตรียมนำเข้า","Full course data will be imported next.")}</p>}</div></article>}))}</section>
  </div>;

  const Courses = () => <div className="page-stack">
    <PageIntro eyebrow="COURSE CATALOG" title={t("ค้นหารายวิชา","Find a course")} text={t("ค้นหาด้วยรหัส ชื่อไทย หรือชื่ออังกฤษ และกรองตามหมวดวิชา","Search by code, Thai or English title, and filter by category.")}/>
    <section className="course-panel"><div className="filters"><label className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("ค้นหารหัสหรือชื่อรายวิชา","Search code or course name")}/></label><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="All">{t("ทุกหมวดวิชา","All categories")}</option><option>Core</option><option>GenEd</option><option>Module</option><option>Free</option></select></div><CourseTable items={found} language={language} onEdit={setEditing}/></section>
  </div>;

  const Grades = () => {
    const [y,s] = term.match(/\d/g)?.map(Number) || [1,1];
    const termCourses = records.filter(c=>c.year===y&&c.semester===s);
    return <div className="page-stack"><PageIntro eyebrow="GRADE ENTRY" title={t("บันทึกผลการเรียนย้อนหลัง","Record past grades")} text={t("เลือกภาคการศึกษา แล้วกดรายวิชาเพื่อกรอกเกรดด้วยตนเอง","Choose a semester, then select a course to enter your grade.")}/>
      <section className="grade-workspace"><aside><span className="mini-label">{t("เลือกภาคการศึกษา","SELECT SEMESTER")}</span>{[1,2,3,4].flatMap(year=>[1,2].map(sem=>{const label=`ปี ${year} / ภาค ${sem}`;return <button className={term===label?"active":""} key={label} onClick={()=>setTerm(label)}><span>{(year-1)*2+sem}</span><div><strong>{t(`ปี ${year} ภาค ${sem}`,`Year ${year} · Semester ${sem}`)}</strong><small>{records.filter(c=>c.year===year&&c.semester===sem&&passed(c.grade)).length} {t("วิชาที่บันทึกแล้ว","recorded")}</small></div></button>}))}</aside>
      <div className="grade-entry"><div className="entry-heading"><div><span className="mini-label">{term}</span><h2>{t("ผลการเรียนของฉัน","My results")}</h2></div><span>{termCourses.filter(c=>passed(c.grade)).length}/{termCourses.length} {t("วิชา","courses")}</span></div>{termCourses.map(c=><button className="entry-row" key={c.id} onClick={()=>setEditing(c)}><div><b>{c.id}</b><strong>{t(c.th,c.en)}</strong><small>{c.credits} {t("หน่วยกิต","credits")} · {c.category}</small></div><span className={c.grade==="-"?"empty-grade":""}>{c.grade==="-"?t("เลือกเกรด","Choose grade"):c.grade} ›</span></button>)}{!termCourses.length&&<div className="empty"><strong>{t("ยังไม่มีรายวิชาในชุดข้อมูลทดลอง","No demo courses in this semester yet")}</strong></div>}<div className="preview-note"><b>i</b><p>{t("รอบนี้เป็น Interactive Preview ข้อมูลที่กรอกยังไม่ถูกส่งไป Supabase","This is an interactive preview. Entries are not yet saved to Supabase.")}</p></div></div></section>
    </div>;
  };

  const Advising = () => <div className="page-stack">
    <PageIntro eyebrow="ACADEMIC ADVISING" title={t("เตรียมข้อมูลขอคำปรึกษา","Prepare for advising")} text={t("ระบบสรุปประเด็นที่ควรถามและวิชาที่ยังขาด เพื่อคุยกับอาจารย์ที่ปรึกษาได้ง่ายขึ้น","A concise summary of missing requirements and questions for your advisor.")}/>
    <section className="advising-grid"><article className="advisor-summary"><span className="big-number">03</span><p className="eyebrow">{t("ประเด็นที่ควรตรวจสอบ","ITEMS TO REVIEW")}</p><h2>{t("ก่อนวางแผนเทอมถัดไป","Before planning next semester")}</h2><div className="advice-list"><div><b>1</b><span><strong>Junior Recital Project</strong><small>{t("ตรวจสอบวิชาที่ต้องผ่านก่อนลงทะเบียน","Check prerequisites before registration")}</small></span></div><div><b>2</b><span><strong>Module MIC</strong><small>{t("ยืนยันรายวิชาเลือกกับอาจารย์ที่ปรึกษา","Confirm module electives with your advisor")}</small></span></div><div><b>3</b><span><strong>Concert Hours</strong><small>{t("ตรวจสอบจำนวนครั้งที่สะสมล่าสุด","Review your latest attendance count")}</small></span></div></div></article><article className="advisor-contact"><div className="contact-icon">?</div><p className="eyebrow">{t("อาจารย์ที่ปรึกษา","YOUR ADVISOR")}</p><h2>{t("ยังไม่ได้ระบุอาจารย์ที่ปรึกษา","Advisor not set yet")}</h2><p>{t("ในรุ่นถัดไป ระบบจะแสดงอาจารย์ที่ปรึกษาตามข้อมูล Profile ของนักศึกษา","The next version will show the advisor assigned in your profile.")}</p><button onClick={()=>notify(t("สร้างสรุปคำปรึกษาตัวอย่างแล้ว","Advising summary prepared"))}>{t("เตรียมสรุปสำหรับปรึกษา","Prepare advising summary")} →</button></article></section>
  </div>;

  const pages: Record<NavKey, ReactElement> = { Overview:<Overview/>, Curriculum:<Curriculum/>, Courses:<Courses/>, Grades:<Grades/>, Advising:<Advising/> };
  return <div className="app-shell"><div className="deco deco-one"/><div className="deco deco-two"/>
    <aside className={`sidebar ${menuOpen?"open":""}`}><div className="brand"><div className="brand-mark">P</div><div><strong>PGVIM</strong><span>School of Music</span></div><button className="mobile-close" onClick={()=>setMenuOpen(false)}>×</button></div><nav>{nav.map(n=><button key={n.key} className={active===n.key?"active":""} onClick={()=>changePage(n.key)}><span className="nav-icon">{n.icon}</span><span>{t(n.th,n.en)}</span></button>)}</nav><div className="sidebar-note"><span>i</span><div><strong>{t("หลักสูตรดุริยางคศาสตรบัณฑิต","Bachelor of Music")}</strong><small>Curriculum 2567 · Preview</small></div></div></aside>
    <main className="main"><header className="topbar"><button className="menu-button" onClick={()=>setMenuOpen(true)}>☰</button><div><p className="eyebrow">MY PGVIM · BM 2567</p><h1>{t(nav.find(n=>n.key===active)!.th,nav.find(n=>n.key===active)!.en)}</h1></div><div className="top-actions"><button className="language" onClick={()=>setLanguage(language==="TH"?"EN":"TH")}><b>{language}</b><span>{language==="TH"?"EN":"TH"}</span></button><div className="profile-control"><button className="avatar" onClick={()=>setProfileOpen(!profileOpen)}>{initials||"PG"}</button>{profileOpen&&<div className="profile-menu"><strong>{name}</strong><small>{user?.email}</small><button onClick={()=>void signOut()}>{t("ออกจากระบบ","Sign out")}</button></div>}</div></div></header><div className="content page-transition" key={active}>{pages[active]}<footer>PGVIM · Bachelor of Music Curriculum 2567 <span>{t("Interactive Preview — ข้อมูลตัวอย่าง","Interactive Preview — sample data")}</span></footer></div></main>
    {editing&&<div className="modal-backdrop" onMouseDown={()=>setEditing(null)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setEditing(null)}>×</button><span className="mini-label">{editing.id} · {editing.credits} {t("หน่วยกิต","credits")}</span><h2>{t(editing.th,editing.en)}</h2><p>{t(editing.en,editing.th)}</p><label>{t("เลือกผลการเรียน","Choose grade")}</label><div className="grade-grid">{["A","B+","B","C+","C","D+","D","F","S","U","IP","-"].map(g=><button key={g} className={editing.grade===g?"selected":""} onClick={()=>saveGrade(g)}>{g==="-"?t("ยังไม่เรียน","Not taken"):g}</button>)}</div><small>{t("ข้อมูลนี้ใช้เพื่อทดลองหน้าตาและการทำงานเท่านั้น","This entry is for interaction testing only.")}</small></div></div>}{toast&&<div className="toast">✓ {toast}</div>}
  </div>;
}

function PageIntro({eyebrow,title,text}:{eyebrow:string;title:string;text:string}) {
  return <section className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{text}</p></div><span>BM<br/><b>67</b></span></section>;
}
function CourseTable({items,language,onEdit}:{items:Course[];language:"TH"|"EN";onEdit:(c:Course)=>void}) {
  return <div className="table-wrap"><table><thead><tr><th>Course</th><th>Year / Term</th><th>Category</th><th>Credits</th><th>Status</th><th>Grade</th></tr></thead><tbody>{items.map(c=><tr key={c.id} onClick={()=>onEdit(c)}><td><b>{c.id}</b><div><strong>{language==="TH"?c.th:c.en}</strong><small>{language==="TH"?c.en:c.th}</small></div></td><td>{c.year} / {c.semester}</td><td><span className="category-chip">{c.category}</span></td><td>{c.credits}</td><td><span className={`status ${passed(c.grade)?"completed":c.grade==="IP"?"progress":"planned"}`}><i/>{passed(c.grade)?"Completed":c.grade==="IP"?"In progress":"Planned"}</span></td><td><button className="grade-button">{c.grade}<span>›</span></button></td></tr>)}</tbody></table>{!items.length&&<div className="empty"><b>⌕</b><strong>No courses found</strong></div>}</div>;
}
