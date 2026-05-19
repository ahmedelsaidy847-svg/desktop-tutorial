import { useState } from "react";

// ══ Brand Colors ══════════════════════════════════════
const DEFAULT_SETTINGS = {
  companyName: "EL MEGHARBEL",
  companySubtitle: "— READY MIX —",
  theme: "navy",
  logo: null,
};

const THEMES = {
  navy:   { primary:"#141E2D", primaryMid:"#1C2B3F", primaryLight:"#253448", accent:"#8B1212", accentLight:"#A91515" },
  green:  { primary:"#064E3B", primaryMid:"#065F46", primaryLight:"#047857", accent:"#B45309", accentLight:"#D97706" },
  blue:   { primary:"#1E3A5F", primaryMid:"#1D4ED8", primaryLight:"#2563EB", accent:"#7C3AED", accentLight:"#8B5CF6" },
  dark:   { primary:"#111827", primaryMid:"#1F2937", primaryLight:"#374151", accent:"#DC2626", accentLight:"#EF4444" },
};

const C = {
  red:"#8B1212", redLight:"#A91515",
  silver:"#9BA3AF", silverLight:"#C8CDD4",
  white:"#FFFFFF", offWhite:"#F4F6F9",
  text:"#1E293B", textMuted:"#64748B",
  green:"#15803D", greenBg:"#F0FDF4",
  orange:"#B45309", orangeBg:"#FFFBEB",
  border:"#E2E8F0", navy:"#141E2D", navyMid:"#1C2B3F",
};

const DENOMS = [200,100,50,20,10,5,1];
const MODULES = [
  {id:"dashboard",label:"لوحة التحكم",icon:"📊"},
  {id:"treasury",label:"الخزينة",icon:"💰"},
  {id:"cashcount",label:"صندوق النقدية",icon:"🧮"},
  {id:"accounting",label:"المحاسبة",icon:"📒"},
  {id:"sales",label:"المبيعات والعملاء",icon:"🧾"},
  {id:"suppliers",label:"الموردون",icon:"📦"},
  {id:"inventory",label:"المخزون",icon:"🏭"},
  {id:"hr",label:"الرواتب والموارد البشرية",icon:"👥"},
  {id:"loans",label:"سلف الموظفين",icon:"💳"},
  {id:"auditlog",label:"سجل الحركات",icon:"📜",adminOnly:true},
  {id:"settings",label:"الإعدادات",icon:"⚙️",adminOnly:true},
  {id:"users",label:"المستخدمون والصلاحيات",icon:"🔐",adminOnly:true},
];
const ACTIONS=["view","add","edit","delete"];
const AL={view:"عرض",add:"إضافة",edit:"تعديل",delete:"حذف"};

const INIT_USERS=[
  {id:1,name:"أحمد",username:"ahmed",password:"admin123",role:"admin",permissions:{}},
  {id:2,name:"محمد",username:"mohamed",password:"mohamed123",role:"accountant",
    permissions:{dashboard:{view:true,add:false,edit:false,delete:false},treasury:{view:true,add:false,edit:false,delete:false},cashcount:{view:true,add:true,edit:true,delete:false},accounting:{view:true,add:true,edit:true,delete:false},sales:{view:true,add:true,edit:false,delete:false},suppliers:{view:true,add:false,edit:false,delete:false},inventory:{view:false,add:false,edit:false,delete:false},hr:{view:false,add:false,edit:false,delete:false},loans:{view:true,add:true,edit:false,delete:false}}},
];

const TR_INIT=[
  {id:1,name:"نقدي",icon:"💵",color:C.green,balance:32000},
  {id:2,name:"InstaPay",icon:"📱",color:"#1D4ED8",balance:15000},
  {id:3,name:"Vodafone Cash",icon:"🔴",color:C.red,balance:8500},
  {id:4,name:"بنك",icon:"🏦",color:"#6D28D9",balance:124000},
];

const INIT_AUDIT = [
  {id:1,ts:"2026-05-19 10:32",user:"أحمد",module:"الخزينة",action:"تعديل",detail:"تعديل رصيد نقدي من 27,000 إلى 32,000"},
  {id:2,ts:"2026-05-19 09:15",user:"محمد",module:"صندوق النقدية",action:"إضافة",detail:"تسجيل عهدة مؤقتة: مصروف نثريات — 250 ج.م"},
  {id:3,ts:"2026-05-18 14:00",user:"محمد",module:"صندوق النقدية",action:"تثبيت",detail:"تثبيت عهدة R-0045 كمصروف صيانة"},
  {id:4,ts:"2026-05-18 11:20",user:"أحمد",module:"المستخدمون",action:"إضافة",detail:"إضافة مستخدم جديد: محمد"},
  {id:5,ts:"2026-05-17 16:45",user:"محمد",module:"صندوق النقدية",action:"إقفال",detail:"إقفال يوم 2026-05-17، المعدود: 15,200"},
];

const INIT_LOANS = [
  {id:1,empName:"كريم سالم",amount:3000,date:"2026-05-01",reason:"ظروف خاصة",status:"active",paid:1000,installment:500},
  {id:2,empName:"هدى محمود",amount:1500,date:"2026-05-10",reason:"مصاريف طبية",status:"active",paid:1500,installment:500},
  {id:3,empName:"طارق علي",amount:2000,date:"2026-04-15",reason:"إيجار",status:"closed",paid:2000,installment:500},
];

const ACCOUNT_TYPES=["أصول","خصوم","حقوق ملكية","إيرادات","مصروفات"];
const AT_COLOR={أصول:"#1D4ED8",خصوم:"#DC2626","حقوق ملكية":"#6D28D9",إيرادات:"#15803D",مصروفات:"#B45309"};
const AT_BG={أصول:"#EFF6FF",خصوم:"#FEF2F2","حقوق ملكية":"#F5F3FF",إيرادات:"#F0FDF4",مصروفات:"#FFFBEB"};
const AT_ICON={أصول:"🏦",خصوم:"📉","حقوق ملكية":"🏛️",إيرادات:"📈",مصروفات:"💸"};

const INIT_ACCOUNTS=[
  {id:1,code:"1100",name:"الصندوق النقدي",type:"أصول",notes:""},
  {id:2,code:"1200",name:"البنك",type:"أصول",notes:""},
  {id:3,code:"1300",name:"المدينون — ذمم عملاء",type:"أصول",notes:""},
  {id:4,code:"1400",name:"المخزون",type:"أصول",notes:""},
  {id:5,code:"2100",name:"الدائنون — ذمم موردين",type:"خصوم",notes:""},
  {id:6,code:"2200",name:"قروض بنكية",type:"خصوم",notes:""},
  {id:7,code:"3100",name:"رأس المال",type:"حقوق ملكية",notes:""},
  {id:8,code:"3200",name:"الأرباح المحتجزة",type:"حقوق ملكية",notes:""},
  {id:9,code:"4100",name:"إيرادات المبيعات",type:"إيرادات",notes:""},
  {id:10,code:"5100",name:"مصروفات التشغيل",type:"مصروفات",notes:""},
  {id:11,code:"5200",name:"مصروفات الرواتب",type:"مصروفات",notes:""},
  {id:12,code:"5300",name:"مصروفات الوقود والنقل",type:"مصروفات",notes:""},
  {id:13,code:"5400",name:"مصروفات الصيانة",type:"مصروفات",notes:""},
  {id:14,code:"5500",name:"مصروفات نثرية",type:"مصروفات",notes:""},
];

const INIT_JOURNAL=[
  {id:1,date:"2026-05-01",ref:"J-001",desc:"قيد افتتاحي — رأس المال",
   lines:[{accountId:1,type:"مدين",amount:32000},{accountId:2,type:"مدين",amount:124000},{accountId:7,type:"دائن",amount:156000}],createdBy:"أحمد"},
  {id:2,date:"2026-05-15",ref:"J-002",desc:"رواتب موظفين مايو",
   lines:[{accountId:11,type:"مدين",amount:28000},{accountId:1,type:"دائن",amount:28000}],createdBy:"محمد"},
  {id:3,date:"2026-05-17",ref:"J-003",desc:"مصروف وقود ونقليات",
   lines:[{accountId:12,type:"مدين",amount:2300},{accountId:1,type:"دائن",amount:2300}],createdBy:"محمد"},
  {id:4,date:"2026-05-19",ref:"J-004",desc:"فاتورة بيع خرسانة — مشروع الشيخ زايد",
   lines:[{accountId:3,type:"مدين",amount:18500},{accountId:9,type:"دائن",amount:18500}],createdBy:"محمد"},
  {id:5,date:"2026-05-18",ref:"J-005",desc:"تحصيل من مقاولات النيل",
   lines:[{accountId:1,type:"مدين",amount:32000},{accountId:3,type:"دائن",amount:32000}],createdBy:"محمد"},
  {id:6,date:"2026-05-18",ref:"J-006",desc:"فاتورة مورد مواد خام",
   lines:[{accountId:10,type:"مدين",amount:12000},{accountId:5,type:"دائن",amount:12000}],createdBy:"أحمد"},
];

const fmt = n => Number(n).toLocaleString("en-US");
const todayISO = () => new Date().toISOString().split("T")[0];
const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};
const nowTs = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

// ══ LOGO SVG ══
function Logo({size=44,showText=false,light=false,settings=null}){
  const id=`sg${size}`;
  const name = settings?.companyName || "EL MEGHARBEL";
  const sub = settings?.companySubtitle || "— READY MIX —";
  if(settings?.logo){
    return(
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <img src={settings.logo} alt="logo" style={{width:size,height:size,objectFit:"contain",borderRadius:6}}/>
        {showText&&<div>
          <div style={{fontWeight:900,fontSize:13,color:light?"white":C.text,letterSpacing:"0.04em",lineHeight:1}}>{name}</div>
          <div style={{fontWeight:700,fontSize:10,color:C.red,letterSpacing:"0.12em",lineHeight:1.4}}>{sub}</div>
        </div>}
      </div>
    );
  }
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0E0E0"/><stop offset="40%" stopColor="#ADADAD"/><stop offset="100%" stopColor="#6A6A6A"/>
        </linearGradient></defs>
        <polygon points="4,96 4,4 28,4 50,38 72,4 96,4 96,96 76,96 76,54 62,74 38,74 24,54 24,96" fill={`url(#${id})`}/>
        <polygon points="28,4 50,30 72,4" fill={C.red}/>
        <polygon points="38,74 50,54 62,74 62,96 38,96" fill={C.navy}/>
      </svg>
      {showText&&<div>
        <div style={{fontWeight:900,fontSize:13,color:light?"white":C.text,letterSpacing:"0.04em",lineHeight:1}}>{name}</div>
        <div style={{fontWeight:700,fontSize:10,color:C.red,letterSpacing:"0.12em",lineHeight:1.4}}>{sub}</div>
      </div>}
    </div>
  );
}

const Card=({children,style={}})=><div style={{background:C.white,borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,.08)",border:`1px solid ${C.border}`,...style}}>{children}</div>;

// ══ INIT DATA — Sales ══
const INIT_CLIENTS=[
  {id:1,name:"مقاولات النيل",phone:"010-12345678",address:"القاهرة — المعادي",notes:"عميل دائم",credit:50000},
  {id:2,name:"شركة الشيخ زايد للإنشاء",phone:"011-98765432",address:"6 أكتوبر — الشيخ زايد",notes:"",credit:80000},
  {id:3,name:"مصطفى عبد الرحمن",phone:"012-55544433",address:"الجيزة — فيصل",notes:"مقاول فردي",credit:20000},
];
const INIT_INVOICES=[
  {id:1,invNo:"INV-001",date:"2026-05-01",clientId:1,desc:"خرسانة جاهزة — 50 م³",total:18500,paid:18500,status:"مدفوعة"},
  {id:2,invNo:"INV-002",date:"2026-05-10",clientId:2,desc:"خرسانة جاهزة — 120 م³",total:44400,paid:20000,status:"جزئي"},
  {id:3,invNo:"INV-003",date:"2026-05-19",clientId:3,desc:"خرسانة جاهزة — 30 م³",total:11100,paid:0,status:"غير مدفوعة"},
];
// ══ INIT DATA — Suppliers ══
const INIT_SUPPLIERS=[
  {id:1,name:"مصنع الرمال والأحجار",phone:"010-11112222",category:"مواد خام",notes:"مورد رئيسي"},
  {id:2,name:"شركة الإسمنت المتحدة",phone:"011-33334444",category:"إسمنت",notes:""},
  {id:3,name:"وقود الطاقة للنقل",phone:"012-55556666",category:"وقود",notes:"يومي"},
];
const INIT_PURCHASES=[
  {id:1,poNo:"PO-001",date:"2026-05-05",supplierId:1,desc:"رمل ناعم — 80 طن",total:12000,paid:12000,status:"مدفوعة"},
  {id:2,poNo:"PO-002",date:"2026-05-12",supplierId:2,desc:"إسمنت — 200 شيكارة",total:18000,paid:9000,status:"جزئي"},
  {id:3,poNo:"PO-003",date:"2026-05-18",supplierId:3,desc:"وقود ديزل — 2000 لتر",total:8400,paid:0,status:"غير مدفوعة"},
];
// ══ INIT DATA — Inventory ══
const INIT_PRODUCTS=[
  {id:1,name:"رمل ناعم",unit:"طن",stock:240,minStock:50,costPrice:150,salePrice:200,category:"مواد خام"},
  {id:2,name:"إسمنت",unit:"شيكارة",stock:580,minStock:100,costPrice:85,salePrice:110,category:"إسمنت"},
  {id:3,name:"حصى",unit:"طن",stock:320,minStock:80,costPrice:120,salePrice:170,category:"مواد خام"},
  {id:4,name:"ماء",unit:"م³",stock:1200,minStock:200,costPrice:5,salePrice:8,category:"مرافق"},
  {id:5,name:"مضافات الخرسانة",unit:"لتر",stock:45,minStock:60,costPrice:80,salePrice:120,category:"مضافات"},
];
const INIT_MOVEMENTS=[
  {id:1,date:"2026-05-18",productId:1,type:"وارد",qty:80,note:"شراء من مصنع الرمال",ref:"PO-001"},
  {id:2,date:"2026-05-19",productId:1,type:"صادر",qty:50,note:"استخدام في إنتاج — مشروع زايد",ref:"INV-002"},
  {id:3,date:"2026-05-15",productId:2,type:"وارد",qty:200,note:"شراء إسمنت",ref:"PO-002"},
  {id:4,date:"2026-05-19",productId:2,type:"صادر",qty:120,note:"استخدام في إنتاج",ref:"INV-002"},
  {id:5,date:"2026-05-10",productId:5,type:"وارد",qty:20,note:"شراء مضافات",ref:"PO-EXT"},
];
// ══ INIT DATA — HR ══
const INIT_EMPLOYEES=[
  {id:1,name:"كريم سالم",position:"سائق خلاطة",dept:"تشغيل",baseSalary:4500,startDate:"2023-03-01",status:"active"},
  {id:2,name:"هدى محمود",position:"محاسبة",dept:"إدارة",baseSalary:5500,startDate:"2024-01-15",status:"active"},
  {id:3,name:"طارق علي",position:"مشرف إنتاج",dept:"تشغيل",baseSalary:6000,startDate:"2022-06-01",status:"active"},
  {id:4,name:"نادية حسن",position:"سكرتيرة",dept:"إدارة",baseSalary:3800,startDate:"2025-02-01",status:"active"},
  {id:5,name:"عمرو جمال",position:"سائق خلاطة",dept:"تشغيل",baseSalary:4500,startDate:"2023-09-01",status:"active"},
];
const INIT_PAYROLL=[
  {id:1,month:"2026-05",empId:1,base:4500,bonus:200,deduct:500,net:4200,paid:true},
  {id:2,month:"2026-05",empId:2,base:5500,bonus:0,deduct:0,net:5500,paid:true},
  {id:3,month:"2026-05",empId:3,base:6000,bonus:500,deduct:0,net:6500,paid:true},
  {id:4,month:"2026-05",empId:4,base:3800,bonus:0,deduct:200,net:3600,paid:false},
  {id:5,month:"2026-05",empId:5,base:4500,bonus:0,deduct:500,net:4000,paid:false},
];

// ══ APP ══
export default function App(){
  const [users,setUsers]=useState(INIT_USERS);
  const [treas,setTreas]=useState(TR_INIT);
  const [cur,setCur]=useState(null);
  const [active,setActive]=useState("dashboard");
  const [lf,setLf]=useState({u:"",p:""});
  const [le,setLe]=useState("");
  const [auditLog,setAuditLog]=useState(INIT_AUDIT);
  const [loans,setLoans]=useState(INIT_LOANS);
  const [accounts,setAccounts]=useState(INIT_ACCOUNTS);
  const [journal,setJournal]=useState(INIT_JOURNAL);
  const [settings,setSettings]=useState(DEFAULT_SETTINGS);

  const theme = THEMES[settings.theme] || THEMES.navy;
  const isAdmin=cur?.role==="admin";
  const hasPerm=(m,a)=>{if(!cur)return false;if(isAdmin)return true;return cur.permissions?.[m]?.[a]||false;};
  const canSee=m=>{if(!cur)return false;if(isAdmin)return true;const p=cur.permissions?.[m];return p&&Object.values(p).some(Boolean);};

  const addAudit=(module,action,detail)=>{
    setAuditLog(p=>[{id:Date.now(),ts:nowTs(),user:cur?.name||"?",module,action,detail},...p]);
  };

  const login=()=>{
    const u=users.find(u=>u.username===lf.u&&u.password===lf.p);
    if(u){setCur(u);setLe("");setActive("dashboard");addAuditLogin(u);}
    else setLe("اسم المستخدم أو كلمة المرور غير صحيحة");
  };
  const addAuditLogin=(u)=>{
    setAuditLog(p=>[{id:Date.now(),ts:nowTs(),user:u.name,module:"النظام",action:"دخول",detail:`تسجيل دخول بنجاح`},...p]);
  };

  if(!cur) return(
    <div style={{minHeight:"100vh",background:`linear-gradient(145deg, ${theme.primary} 0%, ${theme.primaryMid} 50%, ${theme.primaryLight} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cairo','Segoe UI',sans-serif",direction:"rtl"}}>
      <div style={{width:380,display:"flex",flexDirection:"column",alignItems:"center",padding:40,color:"white"}}>
        <Logo size={90} showText light settings={settings}/>
        <div style={{marginTop:28,textAlign:"center"}}>
          <div style={{fontSize:13,color:C.silverLight,lineHeight:1.8,opacity:.8}}>نظام إدارة الموارد المتكامل</div>
          <div style={{display:"flex",gap:12,marginTop:24,flexWrap:"wrap",justifyContent:"center"}}>
            {["محاسبة","خرسانة","مبيعات","مخزون"].map(t=><span key={t} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",borderRadius:20,padding:"4px 14px",fontSize:12,color:C.silverLight}}>{t}</span>)}
          </div>
        </div>
      </div>
      <div style={{width:1,height:320,background:"rgba(255,255,255,.1)",margin:"0 20px"}}/>
      <div style={{width:360,background:"rgba(255,255,255,.06)",backdropFilter:"blur(20px)",borderRadius:20,padding:36,border:"1px solid rgba(255,255,255,.12)"}}>
        <div style={{fontSize:18,fontWeight:700,color:"white",marginBottom:6}}>تسجيل الدخول</div>
        <div style={{fontSize:13,color:C.silverLight,marginBottom:28,opacity:.7}}>أدخل بياناتك للوصول إلى النظام</div>
        {[{l:"اسم المستخدم",k:"u",t:"text"},{l:"كلمة المرور",k:"p",t:"password"}].map(f=>(
          <div key={f.k} style={{marginBottom:16}}>
            <label style={{display:"block",color:"rgba(255,255,255,.7)",marginBottom:6,fontSize:13,fontWeight:600}}>{f.l}</label>
            <input type={f.t} value={lf[f.k]} onChange={e=>setLf(p=>({...p,[f.k]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&login()}
              style={{width:"100%",padding:"11px 14px",background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:9,fontSize:14,outline:"none",color:"white",boxSizing:"border-box",direction:"ltr"}}/>
          </div>
        ))}
        {le&&<div style={{background:"rgba(139,18,18,.3)",border:"1px solid rgba(139,18,18,.5)",color:"#FCA5A5",padding:"9px 14px",borderRadius:8,marginBottom:16,fontSize:13}}>{le}</div>}
        <button onClick={login} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${theme.accent},${theme.accentLight})`,color:"white",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:20}}>
          دخول ←
        </button>
        <div style={{background:"rgba(255,255,255,.05)",borderRadius:9,padding:"12px 14px",fontSize:12,color:"rgba(255,255,255,.5)",lineHeight:2}}>
          <div>👑 <b style={{color:"rgba(255,255,255,.7)"}}>ahmed</b> / admin123</div>
          <div>👤 <b style={{color:"rgba(255,255,255,.7)"}}>mohamed</b> / mohamed123</div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"'Cairo','Segoe UI',sans-serif",direction:"rtl",background:C.offWhite}}>
      {/* SIDEBAR */}
      <div style={{width:240,background:`linear-gradient(180deg,${theme.primary} 0%,${theme.primaryMid} 100%)`,color:"white",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
          <Logo size={36} showText light settings={settings}/>
        </div>
        <div style={{height:2,background:`linear-gradient(90deg,${theme.accent},transparent)`}}/>
        <nav style={{flex:1,padding:"14px 10px"}}>
          {MODULES.map(m=>{
            if(m.adminOnly&&!isAdmin)return null;
            if(!m.adminOnly&&!canSee(m.id))return null;
            const on=active===m.id;
            return(
              <button key={m.id} onClick={()=>setActive(m.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:on?`rgba(139,18,18,.35)`:"transparent",border:"none",borderRadius:8,color:on?"white":"rgba(255,255,255,.6)",fontSize:13,cursor:"pointer",marginBottom:2,textAlign:"right",borderRight:on?`3px solid ${theme.accent}`:"3px solid transparent",transition:"all .15s",fontWeight:on?600:400}}>
                <span style={{fontSize:15}}>{m.icon}</span>{m.label}
              </button>
            );
          })}
        </nav>
        <div style={{padding:"14px 16px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:34,height:34,background:`linear-gradient(135deg,${theme.accent},${theme.primary})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,flexShrink:0}}>{cur.name[0]}</div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"white"}}>{cur.name}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>{isAdmin?"مدير النظام":cur.role==="accountant"?"محاسب":"مستخدم"}</div>
            </div>
          </div>
          <button onClick={()=>{addAudit("النظام","خروج","تسجيل خروج");setCur(null);}} style={{width:"100%",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.7)",padding:"7px",borderRadius:7,fontSize:12,cursor:"pointer"}}>تسجيل الخروج</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflow:"auto"}}>
        <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div style={{fontWeight:700,color:C.text,fontSize:16}}>{MODULES.find(m=>m.id===active)?.icon} {MODULES.find(m=>m.id===active)?.label}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.textMuted}}>
            <span>{todayStr()}</span>
            <span style={{width:1,height:14,background:C.border}}/>
            <Logo size={22} settings={settings}/>
            <span style={{fontWeight:600,color:C.text}}>{settings.companyName}</span>
          </div>
        </div>
        <div style={{padding:24}}>
          {active==="dashboard"&&<Dashboard treas={treas}/>}
          {active==="treasury"&&<Treasury treas={treas} setTreas={setTreas} canEdit={hasPerm("treasury","edit")} addAudit={addAudit}/>}
          {active==="cashcount"&&<CashCount treas={treas} user={cur} canAdd={hasPerm("cashcount","add")} canEdit={hasPerm("cashcount","edit")} addAudit={addAudit}/>}
          {active==="loans"&&<Loans loans={loans} setLoans={setLoans} canAdd={hasPerm("loans","add")} canEdit={hasPerm("loans","edit")} canDelete={hasPerm("loans","delete")} addAudit={addAudit}/>}
          {active==="auditlog"&&isAdmin&&<AuditLog log={auditLog}/>}
          {active==="settings"&&isAdmin&&<Settings settings={settings} setSettings={setSettings} addAudit={addAudit}/>}
          {active==="users"&&isAdmin&&<UserMgmt users={users} setUsers={setUsers} addAudit={addAudit}/>}
          {active==="accounting"&&<Accounting accounts={accounts} setAccounts={setAccounts} journal={journal} setJournal={setJournal} canAdd={hasPerm("accounting","add")} canEdit={hasPerm("accounting","edit")} canDelete={hasPerm("accounting","delete")} addAudit={addAudit} currentUser={cur}/>}
          {active==="sales"&&<Sales canAdd={hasPerm("sales","add")} canEdit={hasPerm("sales","edit")} canDelete={hasPerm("sales","delete")} addAudit={addAudit}/>}
          {active==="suppliers"&&<Suppliers canAdd={hasPerm("suppliers","add")} canEdit={hasPerm("suppliers","edit")} canDelete={hasPerm("suppliers","delete")} addAudit={addAudit}/>}
          {active==="inventory"&&<Inventory canAdd={hasPerm("inventory","add")} canEdit={hasPerm("inventory","edit")} canDelete={hasPerm("inventory","delete")} addAudit={addAudit}/>}
          {active==="hr"&&<HR canAdd={hasPerm("hr","add")} canEdit={hasPerm("hr","edit")} canDelete={hasPerm("hr","delete")} addAudit={addAudit}/>}
        </div>
      </div>
    </div>
  );
}

// ══ DASHBOARD ══
function Dashboard({treas}){
  const total=treas.reduce((s,a)=>s+a.balance,0);
  const kpis=[{l:"إجمالي المبيعات",v:285000,i:"📈",c:"#1D4ED8"},{l:"التحصيل الشهري",v:210000,i:"💵",c:C.green},{l:"المصروفات",v:45000,i:"📉",c:C.red},{l:"إجمالي الخزينة",v:total,i:"🏦",c:"#6D28D9"}];
  const entries=[{d:"19/05",t:"فاتورة بيع خرسانة — مشروع الشيخ زايد",a:"+18,500",tp:"in"},{d:"18/05",t:"مصروف وقود ونقليات",a:"-2,300",tp:"out"},{d:"17/05",t:"تحصيل — مقاولات النيل",a:"+32,000",tp:"in"},{d:"16/05",t:"فاتورة مورد — مواد خام",a:"-12,000",tp:"out"},{d:"15/05",t:"رواتب موظفين مايو",a:"-28,000",tp:"out"}];
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:22}}>
        {kpis.map((k,i)=>(
          <Card key={i} style={{padding:20,borderTop:`4px solid ${k.c}`}}>
            <div style={{fontSize:26,marginBottom:8}}>{k.i}</div>
            <div style={{fontSize:20,fontWeight:800,color:k.c}}>{fmt(k.v)}</div>
            <div style={{color:C.textMuted,fontSize:11,marginTop:3}}>ج.م — {k.l}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:20}}>
        <Card style={{padding:20}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:14,fontSize:13}}>💰 الخزينة الحالية</div>
          {treas.map(a=>(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:13}}>{a.icon} {a.name}</span>
              <span style={{fontWeight:700,color:a.color,fontSize:13}}>{fmt(a.balance)} ج.م</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:12,padding:"8px 12px",background:C.offWhite,borderRadius:8,border:`1px solid ${C.border}`}}>
            <span style={{fontWeight:700,fontSize:13}}>الإجمالي</span>
            <span style={{fontWeight:800,color:C.navy,fontSize:14}}>{fmt(total)} ج.م</span>
          </div>
        </Card>
        <Card style={{padding:20}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:14,fontSize:13}}>📋 آخر الحركات</div>
          {entries.map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<entries.length-1?`1px solid ${C.border}`:"none"}}>
              <div><div style={{fontSize:12,color:C.text,fontWeight:500}}>{e.t}</div><div style={{fontSize:11,color:C.textMuted,marginTop:1}}>{e.d} مايو</div></div>
              <span style={{fontWeight:700,fontSize:12,color:e.tp==="in"?C.green:C.red,flexShrink:0,marginRight:8}}>{e.a}</span>
            </div>
          ))}
        </Card>
      </div>
      <Card style={{padding:20}}>
        <div style={{fontWeight:700,color:C.text,marginBottom:16,fontSize:13}}>📅 مؤشرات الأداء — مايو 2026</div>
        {[{l:"نسبة التحصيل من المبيعات",v:73,c:"#1D4ED8"},{l:"المصروفات من الميزانية",v:45,c:C.red},{l:"المخزون المستهلك",v:60,c:"#6D28D9"}].map((p,i)=>(
          <div key={i} style={{marginBottom:i<2?16:0}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span>{p.l}</span><span style={{fontWeight:700,color:p.c}}>{p.v}%</span></div>
            <div style={{background:C.offWhite,borderRadius:20,height:7,border:`1px solid ${C.border}`}}><div style={{width:`${p.v}%`,background:p.c,height:"100%",borderRadius:20}}/></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ══ TREASURY ══
function Treasury({treas,setTreas,canEdit,addAudit}){
  const [editing,setEditing]=useState(null);
  const [ev,setEv]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [af,setAf]=useState({amount:"",note:""});
  const [log,setLog]=useState([{d:"19/05",n:"نقدي",note:"استلام من عميل",ch:"+5,000"},{d:"18/05",n:"بنك",note:"تحويل مصروفات",ch:"-3,200"},{d:"17/05",n:"Vodafone Cash",note:"دفع مورد",ch:"-1,500"}]);
  const total=treas.reduce((s,a)=>s+a.balance,0);
  const save=(id)=>{
    const acc=treas.find(a=>a.id===id);const diff=Number(ev)-acc.balance;
    setTreas(p=>p.map(a=>a.id===id?{...a,balance:Number(ev)}:a));
    setLog(p=>[{d:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit"}),n:acc.name,note:"تعديل يدوي",ch:(diff>=0?"+":"")+fmt(diff)},...p]);
    addAudit("الخزينة","تعديل",`تعديل رصيد ${acc.name} من ${fmt(acc.balance)} إلى ${fmt(Number(ev))} ج.م`);
    setEditing(null);
  };
  const addTx=()=>{
    if(!af.amount)return;const amt=Number(af.amount);const acc=treas.find(a=>a.id===showAdd);
    setTreas(p=>p.map(a=>a.id===showAdd?{...a,balance:a.balance+amt}:a));
    setLog(p=>[{d:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit"}),n:acc?.name,note:af.note||"حركة يدوية",ch:(amt>=0?"+":"")+fmt(amt)},...p]);
    addAudit("الخزينة","إضافة حركة",`${acc?.name}: ${amt>=0?"+":""}${fmt(amt)} ج.م — ${af.note||"حركة يدوية"}`);
    setAf({amount:"",note:""});setShowAdd(false);
  };
  return(
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,borderRadius:12,padding:"10px 22px",color:"white"}}>
          <span style={{fontSize:12,opacity:.7}}>إجمالي الخزينة: </span><span style={{fontWeight:800,fontSize:16}}>{fmt(total)} ج.م</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18,marginBottom:22}}>
        {treas.map(acc=>(
          <Card key={acc.id} style={{padding:22,borderRight:`5px solid ${acc.color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:34,marginBottom:8}}>{acc.icon}</div>
                <div style={{fontSize:24,fontWeight:800,color:acc.color}}>{fmt(acc.balance)}</div>
                <div style={{fontSize:12,color:C.textMuted,marginTop:3}}>ج.م — {acc.name}</div>
              </div>
              {canEdit&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
                <button onClick={()=>{setEditing(acc.id);setEv(acc.balance);}} style={{background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",color:"#1D4ED8",fontSize:12,fontWeight:600}}>تعديل ✏️</button>
                <button onClick={()=>setShowAdd(acc.id)} style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:7,padding:"6px 12px",cursor:"pointer",color:C.green,fontSize:12,fontWeight:600}}>+ حركة</button>
              </div>}
            </div>
            {editing===acc.id&&<div style={{marginTop:14,display:"flex",gap:8}}>
              <input type="number" value={ev} onChange={e=>setEv(e.target.value)} style={{flex:1,padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,direction:"ltr"}}/>
              <button onClick={()=>save(acc.id)} style={{background:C.navy,color:"white",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>حفظ</button>
              <button onClick={()=>setEditing(null)} style={{background:C.offWhite,color:C.text,border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:13}}>✕</button>
            </div>}
            {showAdd===acc.id&&<div style={{marginTop:14,background:C.offWhite,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>إضافة حركة</div>
              <input type="number" placeholder="المبلغ (سالب = صرف)" value={af.amount} onChange={e=>setAf(p=>({...p,amount:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,marginBottom:8,boxSizing:"border-box",direction:"ltr"}}/>
              <input placeholder="ملاحظة" value={af.note} onChange={e=>setAf(p=>({...p,note:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,marginBottom:10,boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={addTx} style={{flex:1,background:C.green,color:"white",border:"none",borderRadius:8,padding:"9px",cursor:"pointer",fontWeight:700,fontSize:13}}>تسجيل</button>
                <button onClick={()=>setShowAdd(false)} style={{flex:1,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px",cursor:"pointer",fontSize:13}}>إلغاء</button>
              </div>
            </div>}
          </Card>
        ))}
      </div>
      <Card style={{padding:20}}>
        <div style={{fontWeight:700,color:C.text,marginBottom:14,fontSize:13}}>📋 سجل الحركات</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.offWhite}}>{["التاريخ","الحساب","الملاحظة","المبلغ"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"right",color:C.textMuted,fontWeight:600,border:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{log.map((r,i)=><tr key={i} style={{background:i%2===0?C.white:C.offWhite}}>
            <td style={{padding:"9px 12px",border:`1px solid ${C.border}`,color:C.textMuted}}>{r.d}</td>
            <td style={{padding:"9px 12px",border:`1px solid ${C.border}`,fontWeight:500}}>{r.n}</td>
            <td style={{padding:"9px 12px",border:`1px solid ${C.border}`}}>{r.note}</td>
            <td style={{padding:"9px 12px",border:`1px solid ${C.border}`,fontWeight:700,color:r.ch.startsWith("+")?C.green:C.red}}>{r.ch}</td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}

// ══ CASH COUNT ══
function CashCount({treas,user,canAdd,canEdit,addAudit}){
  const today=todayISO();
  const [tab,setTab]=useState("count");
  const [filterDate,setFilterDate]=useState(today);
  const [counts,setCounts]=useState(Object.fromEntries(DENOMS.map(d=>[d,""])));
  const [extras,setExtras]=useState([]);
  const [eForm,setEForm]=useState({desc:"",amount:""});
  const [drafts,setDrafts]=useState([
    {id:1,date:"2026-05-18",desc:"مصروف نثريات بدون مؤيد",amount:250,status:"draft"},
    {id:2,date:"2026-05-19",desc:"إيجار معدات مؤقت",amount:1200,status:"draft"},
    {id:3,date:"2026-05-17",desc:"مصروف صيانة أدوات",amount:800,status:"confirmed",receiptNo:"R-0045",account:"512001 - مصروفات صيانة"},
  ]);
  const [dForm,setDForm]=useState({desc:"",amount:"",date:today});
  const [cdlg,setCdlg]=useState(null);
  const [cancelDlg,setCancelDlg]=useState(null);
  const [cancelReason,setCancelReason]=useState("");
  const [cForm,setCForm]=useState({receiptNo:"",account:""});
  const [closings,setClosings]=useState([
    {id:1,date:"2026-05-18",counted:28500,expected:29000,draftAmt:500,diff:-500,by:"محمد"},
    {id:2,date:"2026-05-17",counted:15200,expected:15200,draftAmt:0,diff:0,by:"أحمد"},
  ]);

  const cashBal=treas.find(a=>a.name==="نقدي")?.balance||0;
  const denomTotal=DENOMS.reduce((s,d)=>s+(Number(counts[d])||0)*d,0);
  const extraTotal=extras.reduce((s,e)=>s+e.amount,0);
  const countedTotal=denomTotal+extraTotal;
  const pending=drafts.filter(d=>d.status==="draft");
  const draftTotal=pending.reduce((s,d)=>s+d.amount,0);
  const expectedActual=cashBal-draftTotal;
  const diff=countedTotal-expectedActual;

  const addExtra=()=>{if(!eForm.amount)return;setExtras(p=>[...p,{id:Date.now(),desc:eForm.desc||"مبلغ إضافي",amount:Number(eForm.amount)}]);setEForm({desc:"",amount:""});};
  const addDraft=()=>{
    if(!dForm.desc||!dForm.amount)return;
    const newD={id:Date.now(),date:dForm.date,desc:dForm.desc,amount:Number(dForm.amount),status:"draft"};
    setDrafts(p=>[...p,newD]);
    addAudit("صندوق النقدية","إضافة عهدة",`${dForm.desc} — ${fmt(dForm.amount)} ج.م`);
    setDForm({desc:"",amount:"",date:today});
  };
  const confirmDraft=()=>{
    const d=drafts.find(x=>x.id===cdlg);
    setDrafts(p=>p.map(x=>x.id===cdlg?{...x,status:"confirmed",receiptNo:cForm.receiptNo,account:cForm.account}:x));
    addAudit("صندوق النقدية","تثبيت عهدة",`${d?.desc} — ${fmt(d?.amount)} ج.م — مؤيد: ${cForm.receiptNo}`);
    setCdlg(null);setCForm({receiptNo:"",account:""});
  };
  const cancelDraft=()=>{
    const d=drafts.find(x=>x.id===cancelDlg);
    setDrafts(p=>p.map(x=>x.id===cancelDlg?{...x,status:"cancelled",cancelReason}:x));
    addAudit("صندوق النقدية","إلغاء عهدة",`${d?.desc} — ${fmt(d?.amount)} ج.م — سبب: ${cancelReason||"غير محدد"}`);
    setCancelDlg(null);setCancelReason("");
  };
  const closeDay=()=>{
    if(countedTotal===0)return;
    setClosings(p=>[{id:Date.now(),date:today,counted:countedTotal,expected:expectedActual,draftAmt:draftTotal,diff,by:user?.name||""},...p]);
    addAudit("صندوق النقدية","إقفال يوم",`المعدود: ${fmt(countedTotal)} — الفرق: ${diff>=0?"+":""}${fmt(diff)} ج.م`);
  };
  const filteredLog=filterDate?closings.filter(c=>c.date===filterDate):closings;
  const dc=d=>d>=100?C.navy:d>=50?"#1D4ED8":d>=20?C.green:d>=10?"#6D28D9":C.silver;
  const TabBtn=({t,lbl,badge})=><button onClick={()=>setTab(t)} style={{padding:"9px 18px",border:"none",borderBottom:tab===t?`3px solid ${C.red}`:"3px solid transparent",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:700,color:tab===t?C.red:C.textMuted}}>
    {lbl}{badge>0&&<span style={{marginRight:6,background:C.red,color:"white",borderRadius:20,padding:"1px 7px",fontSize:11}}>{badge}</span>}
  </button>;

  return(
    <div>
      <div style={{display:"flex",borderBottom:`2px solid ${C.border}`,marginBottom:24}}>
        <TabBtn t="count" lbl="🪙 عد الفئات"/>
        <TabBtn t="drafts" lbl="⏳ العهد المؤقتة" badge={pending.length}/>
        <TabBtn t="log" lbl="📅 سجل الإقفال"/>
      </div>

      {tab==="count"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20}}>
          <div>
            <Card style={{padding:20,marginBottom:18}}>
              <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:14}}>🪙 الفئات النقدية</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:C.offWhite}}>
                  {["الفئة","العدد","المجموع"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:h==="العدد"||h==="المجموع"?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontSize:12,fontWeight:600}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {DENOMS.map((d,i)=>{
                    const qty=Number(counts[d])||0;const sub=qty*d;
                    return(<tr key={d} style={{background:i%2===0?C.white:C.offWhite}}>
                      <td style={{padding:"10px 14px",border:`1px solid ${C.border}`}}>
                        <span style={{background:dc(d),color:"white",borderRadius:7,padding:"4px 14px",fontSize:14,fontWeight:700,display:"inline-block",minWidth:54,textAlign:"center"}}>{d}</span>
                      </td>
                      <td style={{padding:"8px 14px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                        <input type="number" min="0" value={counts[d]} onChange={e=>setCounts(p=>({...p,[d]:e.target.value}))}
                          style={{width:100,padding:"7px",border:`1.5px solid ${C.border}`,borderRadius:7,fontSize:14,textAlign:"center",direction:"ltr",outline:"none"}}/>
                      </td>
                      <td style={{padding:"10px 14px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:sub>0?700:400,color:sub>0?C.text:C.textMuted,fontSize:14}}>
                        {sub>0?fmt(sub):"—"}
                      </td>
                    </tr>);
                  })}
                  <tr style={{background:"#EFF6FF"}}>
                    <td colSpan={2} style={{padding:"10px 14px",border:`1px solid ${C.border}`,fontWeight:700}}>إجمالي الفئات</td>
                    <td style={{padding:"10px 14px",border:`1px solid ${C.border}`,fontWeight:800,color:"#1D4ED8",fontSize:16,textAlign:"center"}}>{fmt(denomTotal)} ج.م</td>
                  </tr>
                </tbody>
              </table>
            </Card>
            <Card style={{padding:20}}>
              <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:14}}>➕ مبالغ إضافية</div>
              {extras.length>0&&<table style={{width:"100%",borderCollapse:"collapse",marginBottom:14,fontSize:13}}>
                <thead><tr style={{background:C.offWhite}}>
                  {["الوصف","المبلغ",""].map(h=><th key={h} style={{padding:"8px 12px",textAlign:h===""?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:600}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {extras.map((e,i)=>(
                    <tr key={e.id} style={{background:i%2===0?C.white:C.offWhite}}>
                      <td style={{padding:"8px 12px",border:`1px solid ${C.border}`}}>{e.desc}</td>
                      <td style={{padding:"8px 12px",border:`1px solid ${C.border}`,fontWeight:700,color:C.green,textAlign:"center"}}>{fmt(e.amount)} ج.م</td>
                      <td style={{padding:"8px 12px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                        <button onClick={()=>setExtras(p=>p.filter(x=>x.id!==e.id))} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:12}}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>}
              <div style={{display:"flex",gap:8}}>
                <input placeholder="وصف (اختياري)" value={eForm.desc} onChange={e=>setEForm(p=>({...p,desc:e.target.value}))} style={{flex:2,padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13}}/>
                <input type="number" placeholder="المبلغ" value={eForm.amount} onChange={e=>setEForm(p=>({...p,amount:e.target.value}))} style={{flex:1,padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,direction:"ltr"}}/>
                <button onClick={addExtra} style={{background:C.navy,color:"white",border:"none",borderRadius:8,padding:"0 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ إضافة</button>
              </div>
            </Card>
          </div>
          <div>
            <Card style={{padding:22,position:"sticky",top:80}}>
              <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:18}}>📊 ملخص العد</div>
              {[{l:"إجمالي الفئات",v:denomTotal,c:"#1D4ED8"},{l:"مبالغ إضافية",v:extraTotal,c:"#6D28D9"}].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:13,color:C.textMuted}}>{r.l}</span>
                  <span style={{fontWeight:700,color:r.c}}>{fmt(r.v)}</span>
                </div>
              ))}
              <div style={{background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,borderRadius:11,padding:"14px 16px",marginBlock:16,color:"white",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:14}}>💰 إجمالي العد</span>
                <span style={{fontSize:22,fontWeight:800}}>{fmt(countedTotal)}</span>
              </div>
              <div style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:13,color:C.textMuted}}>📋 الرصيد المسجل</span>
                <span style={{fontWeight:600}}>{fmt(cashBal)}</span>
              </div>
              {draftTotal>0&&<div style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:13,color:C.orange}}>⏳ عهد معلقة</span>
                <span style={{fontWeight:600,color:C.orange}}>− {fmt(draftTotal)}</span>
              </div>}
              <div style={{padding:"10px 0",borderBottom:`2px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:13,color:C.textMuted}}>✅ المتوقع الفعلي</span>
                <span style={{fontWeight:700}}>{fmt(expectedActual)}</span>
              </div>
              <div style={{marginTop:16,borderRadius:12,padding:18,background:diff===0?C.greenBg:diff>0?C.orangeBg:"#FEF2F2",border:`2px solid ${diff===0?"#86EFAC":diff>0?"#FCD34D":"#FECACA"}`,textAlign:"center"}}>
                <div style={{fontSize:32}}>{diff===0?"✅":diff>0?"⚠️":"❌"}</div>
                <div style={{fontWeight:800,fontSize:18,color:diff===0?C.green:diff>0?C.orange:C.red,marginTop:6}}>
                  {diff===0?"الصندوق متطابق":diff>0?"زيادة":"عجز"}
                </div>
                {diff!==0&&<div style={{fontSize:24,fontWeight:800,color:diff>0?C.orange:C.red,marginTop:4}}>{diff>0?"+":""}{fmt(diff)} ج.م</div>}
              </div>
              {(canAdd||canEdit)&&<button onClick={closeDay} disabled={countedTotal===0} style={{width:"100%",marginTop:16,padding:12,background:countedTotal>0?C.red:"#E2E8F0",color:countedTotal>0?"white":C.textMuted,border:"none",borderRadius:9,cursor:countedTotal>0?"pointer":"not-allowed",fontSize:14,fontWeight:700}}>
                🔒 إقفال اليوم
              </button>}
              <div style={{marginTop:10,fontSize:12,color:C.textMuted,textAlign:"center"}}>{todayStr()}</div>
            </Card>
          </div>
        </div>
      )}

      {tab==="drafts"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 330px",gap:20}}>
          <div>
            <Card style={{padding:20,marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontWeight:700,color:C.text,fontSize:13}}>⏳ عهد معلقة</div>
                {draftTotal>0&&<span style={{background:"#FEF2F2",color:C.red,fontSize:13,fontWeight:700,padding:"4px 12px",borderRadius:20,border:"1px solid #FECACA"}}>إجمالي: {fmt(draftTotal)} ج.م</span>}
              </div>
              {pending.length===0?<div style={{textAlign:"center",padding:30,color:C.textMuted}}><div style={{fontSize:36}}>✅</div><div style={{marginTop:8}}>لا توجد عهد معلقة</div></div>:(
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:"#FFFBEB"}}>{["التاريخ","الوصف","المبلغ",""].map((h,i)=><th key={i} style={{padding:"10px 12px",textAlign:"right",border:`1px solid ${C.border}`,color:C.orange,fontWeight:600}}>{h}</th>)}</tr></thead>
                  <tbody>{pending.map((d,i)=>(
                    <tr key={d.id} style={{background:i%2===0?C.white:"#FFFBEB"}}>
                      <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,color:C.textMuted}}>{d.date}</td>
                      <td style={{padding:"10px 12px",border:`1px solid ${C.border}`}}>{d.desc}</td>
                      <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,fontWeight:700,color:C.red}}>{fmt(d.amount)} ج.م</td>
                      <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                        <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                          <button onClick={()=>setCdlg(d.id)} style={{background:C.greenBg,border:"1px solid #A7F3D0",color:C.green,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>تثبيت ✅</button>
                          <button onClick={()=>{setCancelDlg(d.id);setCancelReason("");}} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>إلغاء ✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </Card>
            <Card style={{padding:20}}>
              <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:14}}>✅ عهد مثبتة / ملغاة</div>
              {drafts.filter(d=>d.status!=="draft").length===0?<div style={{color:C.textMuted,fontSize:13}}>لا يوجد</div>:(
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:C.offWhite}}>{["التاريخ","الوصف","المبلغ","الحالة","تفاصيل"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:600}}>{h}</th>)}</tr></thead>
                  <tbody>{drafts.filter(d=>d.status!=="draft").map((d,i)=>(
                    <tr key={d.id} style={{background:i%2===0?C.white:C.offWhite}}>
                      <td style={{padding:"8px 12px",border:`1px solid ${C.border}`,color:C.textMuted}}>{d.date}</td>
                      <td style={{padding:"8px 12px",border:`1px solid ${C.border}`}}>{d.desc}</td>
                      <td style={{padding:"8px 12px",border:`1px solid ${C.border}`,fontWeight:700,color:C.red}}>{fmt(d.amount)} ج.م</td>
                      <td style={{padding:"8px 12px",border:`1px solid ${C.border}`}}>
                        <span style={{padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:d.status==="confirmed"?C.greenBg:"#FEF2F2",color:d.status==="confirmed"?C.green:C.red}}>
                          {d.status==="confirmed"?"✅ مثبتة":"❌ ملغاة"}
                        </span>
                      </td>
                      <td style={{padding:"8px 12px",border:`1px solid ${C.border}`,fontSize:12,color:C.textMuted}}>
                        {d.status==="confirmed"?`${d.receiptNo||"—"} | ${d.account||"—"}`:d.cancelReason||"—"}
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </Card>
          </div>
          {canAdd&&<Card style={{padding:20,position:"sticky",top:80,height:"fit-content"}}>
            <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:16}}>➕ إضافة عهدة مؤقتة</div>
            {[{l:"التاريخ",k:"date",t:"date",ltr:true},{l:"الوصف",k:"desc",t:"text"},{l:"المبلغ (ج.م)",k:"amount",t:"number",ltr:true}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:12,color:C.text,marginBottom:5,fontWeight:600}}>{f.l}</label>
                <input type={f.t} value={dForm[f.k]} onChange={e=>setDForm(p=>({...p,[f.k]:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:f.ltr?"ltr":"rtl"}}/>
              </div>
            ))}
            <button onClick={addDraft} style={{width:"100%",padding:11,background:C.orange,color:"white",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:12}}>⏳ تسجيل كعهدة مؤقتة</button>
            <div style={{background:C.orangeBg,borderRadius:8,padding:12,fontSize:12,color:"#78350F",lineHeight:1.7,border:"1px solid #FDE68A"}}>💡 لما يجي الإيصال اضغط <b>"تثبيت"</b> أو <b>"إلغاء"</b> للرجوع.</div>
          </Card>}
        </div>
      )}

      {tab==="log"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:10,marginBottom:20}}>
            <label style={{fontSize:13,color:C.textMuted}}>التاريخ:</label>
            <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} style={{padding:"8px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,direction:"ltr"}}/>
            <button onClick={()=>setFilterDate("")} style={{background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",cursor:"pointer",fontSize:12,color:C.textMuted}}>الكل</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
            {[{l:"أيام مسجلة",v:closings.length,i:"📅",c:"#1D4ED8"},{l:"أيام بدون عجز",v:closings.filter(c=>c.diff===0).length,i:"✅",c:C.green},{l:"أيام بعجز",v:closings.filter(c=>c.diff<0).length,i:"❌",c:C.red}].map((c,i)=>(
              <Card key={i} style={{padding:18,borderTop:`4px solid ${c.c}`,textAlign:"center"}}>
                <div style={{fontSize:26}}>{c.i}</div>
                <div style={{fontSize:22,fontWeight:800,color:c.c,marginTop:6}}>{c.v}</div>
                <div style={{fontSize:12,color:C.textMuted,marginTop:3}}>{c.l}</div>
              </Card>
            ))}
          </div>
          <Card style={{padding:20}}>
            {filteredLog.length===0?<div style={{textAlign:"center",padding:40,color:C.textMuted}}><div style={{fontSize:36}}>🗓️</div><div style={{marginTop:8}}>لا يوجد إقفال في هذا التاريخ</div></div>:(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:C.offWhite}}>{["التاريخ","المعدود","عهد معلقة","المتوقع","الفرق","الحالة","بواسطة"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:600}}>{h}</th>)}</tr></thead>
                <tbody>{filteredLog.map((c,i)=>(
                  <tr key={c.id} style={{background:i%2===0?C.white:C.offWhite}}>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,fontWeight:500}}>{c.date}</td>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,fontWeight:700,color:"#1D4ED8"}}>{fmt(c.counted)}</td>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,color:C.orange}}>{c.draftAmt>0?fmt(c.draftAmt):"—"}</td>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`}}>{fmt(c.expected)}</td>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,fontWeight:700,color:c.diff===0?C.green:c.diff>0?C.orange:C.red}}>
                      {c.diff===0?"متطابق":(c.diff>0?"+":"")+fmt(c.diff)}
                    </td>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`}}>
                      <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:c.diff===0?C.greenBg:c.diff>0?C.orangeBg:"#FEF2F2",color:c.diff===0?C.green:c.diff>0?C.orange:C.red}}>
                        {c.diff===0?"✅ متطابق":c.diff>0?"⚠️ زيادة":"❌ عجز"}
                      </span>
                    </td>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,color:C.textMuted}}>{c.by}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* Confirm Dialog */}
      {cdlg&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:420,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:6,fontSize:16}}>✅ تثبيت العهدة كمصروف</h3>
            <div style={{background:C.offWhite,borderRadius:9,padding:14,marginBottom:22,border:`1px solid ${C.border}`}}>
              <div style={{fontWeight:600,color:C.text,fontSize:13}}>{drafts.find(d=>d.id===cdlg)?.desc}</div>
              <div style={{color:C.red,fontWeight:800,marginTop:4,fontSize:15}}>{fmt(drafts.find(d=>d.id===cdlg)?.amount||0)} ج.م</div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>رقم المؤيد / الإيصال</label>
              <input value={cForm.receiptNo} onChange={e=>setCForm(p=>({...p,receiptNo:e.target.value}))} placeholder="مثال: R-0046"
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/>
            </div>
            <div style={{marginBottom:22}}>
              <label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>الحساب المحاسبي</label>
              <select value={cForm.account} onChange={e=>setCForm(p=>({...p,account:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13}}>
                <option value="">اختر الحساب...</option>
                <option>512001 - مصروفات صيانة</option><option>512003 - رسوم واشتراكات</option>
                <option>512008 - إكراميات ونثريات</option><option>512016 - إيجار معدات</option>
                <option>530002 - عمولات بيع</option><option>أخرى</option>
              </select>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={confirmDraft} style={{flex:1,padding:12,background:C.green,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>تثبيت كمصروف</button>
              <button onClick={()=>setCdlg(null)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {/* Cancel Dialog */}
      {cancelDlg&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:400,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.red,marginBottom:6,fontSize:16}}>❌ إلغاء العهدة</h3>
            <div style={{background:"#FEF2F2",borderRadius:9,padding:14,marginBottom:22,border:"1px solid #FECACA"}}>
              <div style={{fontWeight:600,color:C.text,fontSize:13}}>{drafts.find(d=>d.id===cancelDlg)?.desc}</div>
              <div style={{color:C.red,fontWeight:800,marginTop:4,fontSize:15}}>{fmt(drafts.find(d=>d.id===cancelDlg)?.amount||0)} ج.م</div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>سبب الإلغاء (اختياري)</label>
              <input value={cancelReason} onChange={e=>setCancelReason(e.target.value)} placeholder="مثال: تم استرداد المبلغ"
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={cancelDraft} style={{flex:1,padding:12,background:C.red,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>تأكيد الإلغاء</button>
              <button onClick={()=>setCancelDlg(null)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>رجوع</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ══ LOANS ══
function Loans({loans,setLoans,canAdd,canEdit,canDelete,addAudit}){
  const [showAdd,setShowAdd]=useState(false);
  const [payDlg,setPayDlg]=useState(null);
  const [payAmt,setPayAmt]=useState("");
  const [form,setForm]=useState({empName:"",amount:"",date:todayISO(),reason:"",installment:""});

  const active=loans.filter(l=>l.status==="active");
  const closed=loans.filter(l=>l.status==="closed");
  const totalOut=active.reduce((s,l)=>s+(l.amount-l.paid),0);

  const addLoan=()=>{
    if(!form.empName||!form.amount)return;
    const newL={id:Date.now(),empName:form.empName,amount:Number(form.amount),date:form.date,reason:form.reason,status:"active",paid:0,installment:Number(form.installment)||0};
    setLoans(p=>[...p,newL]);
    addAudit("سلف الموظفين","إضافة سلفة",`${form.empName} — ${fmt(form.amount)} ج.م`);
    setForm({empName:"",amount:"",date:todayISO(),reason:"",installment:""});
    setShowAdd(false);
  };

  const payInstallment=()=>{
    const amt=Number(payAmt);if(!amt)return;
    const loan=loans.find(l=>l.id===payDlg);
    const newPaid=Math.min(loan.paid+amt,loan.amount);
    const newStatus=newPaid>=loan.amount?"closed":"active";
    setLoans(p=>p.map(l=>l.id===payDlg?{...l,paid:newPaid,status:newStatus}:l));
    addAudit("سلف الموظفين","سداد قسط",`${loan.empName} — ${fmt(amt)} ج.م — المتبقي: ${fmt(loan.amount-newPaid)} ج.م`);
    setPayDlg(null);setPayAmt("");
  };

  const deleteLoan=(id)=>{
    const l=loans.find(x=>x.id===id);
    setLoans(p=>p.filter(x=>x.id!==id));
    addAudit("سلف الموظفين","حذف سلفة",`${l?.empName} — ${fmt(l?.amount)} ج.م`);
  };

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:22}}>
        {[{l:"سلف نشطة",v:active.length,i:"💳",c:"#1D4ED8"},{l:"إجمالي المتبقي",v:totalOut,i:"💰",c:C.red,money:true},{l:"سلف مسددة",v:closed.length,i:"✅",c:C.green}].map((k,i)=>(
          <Card key={i} style={{padding:20,borderTop:`4px solid ${k.c}`,textAlign:"center"}}>
            <div style={{fontSize:28}}>{k.i}</div>
            <div style={{fontSize:k.money?18:26,fontWeight:800,color:k.c,marginTop:6}}>{k.money?`${fmt(k.v)} ج.م`:k.v}</div>
            <div style={{fontSize:12,color:C.textMuted,marginTop:3}}>{k.l}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:18}}>
        {canAdd&&<button onClick={()=>setShowAdd(true)} style={{background:C.navy,color:"white",border:"none",borderRadius:9,padding:"10px 22px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ سلفة جديدة</button>}
      </div>

      <Card style={{padding:20,marginBottom:20}}>
        <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:14}}>💳 السلف النشطة</div>
        {active.length===0?<div style={{textAlign:"center",padding:30,color:C.textMuted}}><div style={{fontSize:36}}>✅</div><div style={{marginTop:8}}>لا توجد سلف نشطة</div></div>:(
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#EFF6FF"}}>{["الموظف","التاريخ","المبلغ","المسدد","المتبقي","التقسيط","التقدم",""].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"right",border:`1px solid ${C.border}`,color:"#1D4ED8",fontWeight:600}}>{h}</th>)}</tr></thead>
            <tbody>{active.map((l,i)=>{
              const rem=l.amount-l.paid;const pct=Math.round((l.paid/l.amount)*100);
              return(
                <tr key={l.id} style={{background:i%2===0?C.white:C.offWhite}}>
                  <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,fontWeight:600}}>{l.empName}</td>
                  <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,color:C.textMuted,direction:"ltr"}}>{l.date}</td>
                  <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,fontWeight:700}}>{fmt(l.amount)}</td>
                  <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,color:C.green,fontWeight:600}}>{fmt(l.paid)}</td>
                  <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,color:C.red,fontWeight:700}}>{fmt(rem)}</td>
                  <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,color:C.textMuted}}>{l.installment?`${fmt(l.installment)} /شهر`:"—"}</td>
                  <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,minWidth:100}}>
                    <div style={{background:C.offWhite,borderRadius:20,height:8,border:`1px solid ${C.border}`}}>
                      <div style={{width:`${pct}%`,background:C.green,height:"100%",borderRadius:20}}/>
                    </div>
                    <div style={{fontSize:11,color:C.textMuted,marginTop:3,textAlign:"center"}}>{pct}%</div>
                  </td>
                  <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                    <div style={{display:"flex",gap:5,justifyContent:"center"}}>
                      {canEdit&&<button onClick={()=>{setPayDlg(l.id);setPayAmt(l.installment||"");}} style={{background:C.greenBg,border:"1px solid #A7F3D0",color:C.green,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>سداد</button>}
                      {canDelete&&<button onClick={()=>deleteLoan(l.id)} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,borderRadius:7,padding:"5px 8px",cursor:"pointer",fontSize:12}}>✕</button>}
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </Card>

      {closed.length>0&&<Card style={{padding:20}}>
        <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:14}}>✅ سلف مسددة</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.greenBg}}>{["الموظف","التاريخ","المبلغ","السبب"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"right",border:`1px solid ${C.border}`,color:"#166534",fontWeight:600}}>{h}</th>)}</tr></thead>
          <tbody>{closed.map((l,i)=>(
            <tr key={l.id} style={{background:i%2===0?C.white:C.offWhite}}>
              <td style={{padding:"8px 12px",border:`1px solid ${C.border}`,fontWeight:600}}>{l.empName}</td>
              <td style={{padding:"8px 12px",border:`1px solid ${C.border}`,color:C.textMuted,direction:"ltr"}}>{l.date}</td>
              <td style={{padding:"8px 12px",border:`1px solid ${C.border}`,fontWeight:700,color:C.green}}>{fmt(l.amount)} ج.م</td>
              <td style={{padding:"8px 12px",border:`1px solid ${C.border}`,color:C.textMuted}}>{l.reason||"—"}</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>}

      {/* Add Loan Dialog */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:420,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:20,fontSize:17}}>💳 سلفة جديدة</h3>
            {[{l:"اسم الموظف",k:"empName",t:"text"},{l:"المبلغ (ج.م)",k:"amount",t:"number",ltr:true},{l:"التاريخ",k:"date",t:"date",ltr:true},{l:"السبب",k:"reason",t:"text"},{l:"قسط شهري (ج.م) — اختياري",k:"installment",t:"number",ltr:true}].map(f=>(
              <div key={f.k} style={{marginBottom:13}}>
                <label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>{f.l}</label>
                <input type={f.t} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:f.ltr?"ltr":"rtl"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:6}}>
              <button onClick={addLoan} style={{flex:1,padding:12,background:C.navy,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>إضافة</button>
              <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {/* Pay Dialog */}
      {payDlg&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:380,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:16,fontSize:16}}>💰 تسجيل سداد</h3>
            {(()=>{const l=loans.find(x=>x.id===payDlg);return l?(
              <div>
                <div style={{background:C.offWhite,borderRadius:9,padding:14,marginBottom:18,border:`1px solid ${C.border}`}}>
                  <div style={{fontWeight:600}}>{l.empName}</div>
                  <div style={{fontSize:13,color:C.textMuted,marginTop:4}}>المتبقي: <b style={{color:C.red}}>{fmt(l.amount-l.paid)} ج.م</b></div>
                </div>
                <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:6}}>مبلغ السداد (ج.م)</label>
                <input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} max={l.amount-l.paid}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,marginBottom:18,boxSizing:"border-box",direction:"ltr"}}/>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={payInstallment} style={{flex:1,padding:12,background:C.green,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>تسجيل السداد</button>
                  <button onClick={()=>setPayDlg(null)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
                </div>
              </div>
            ):null;})()}
          </Card>
        </div>
      )}
    </div>
  );
}

// ══ AUDIT LOG ══
function AuditLog({log}){
  const [search,setSearch]=useState("");
  const [filterMod,setFilterMod]=useState("");
  const [filterUser,setFilterUser]=useState("");
  const filtered=log.filter(r=>{
    const s=search.toLowerCase();
    return(
      (!s||(r.detail?.toLowerCase().includes(s)||r.module?.toLowerCase().includes(s)||r.user?.toLowerCase().includes(s)))&&
      (!filterMod||r.module===filterMod)&&
      (!filterUser||r.user===filterUser)
    );
  });
  const modules=[...new Set(log.map(r=>r.module))];
  const users=[...new Set(log.map(r=>r.user))];
  const actionColor=(a)=>a==="إضافة"||a==="إضافة عهدة"||a==="إضافة سلفة"?C.green:a==="حذف"||a==="إلغاء عهدة"?C.red:a==="تعديل"||a==="سداد"?C.orange:"#1D4ED8";

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
        {[{l:"إجمالي الحركات",v:log.length,i:"📜",c:"#1D4ED8"},{l:"المستخدمون النشطون",v:new Set(log.map(r=>r.user)).size,i:"👤",c:C.green},{l:"الوحدات المُستخدمة",v:new Set(log.map(r=>r.module)).size,i:"🗂️",c:"#6D28D9"}].map((k,i)=>(
          <Card key={i} style={{padding:18,borderTop:`4px solid ${k.c}`,textAlign:"center"}}>
            <div style={{fontSize:26}}>{k.i}</div>
            <div style={{fontSize:24,fontWeight:800,color:k.c,marginTop:6}}>{k.v}</div>
            <div style={{fontSize:12,color:C.textMuted,marginTop:3}}>{k.l}</div>
          </Card>
        ))}
      </div>

      <Card style={{padding:20}}>
        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
          <input placeholder="🔍 بحث..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:2,padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,minWidth:160}}/>
          <select value={filterMod} onChange={e=>setFilterMod(e.target.value)} style={{flex:1,padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,minWidth:130}}>
            <option value="">كل الوحدات</option>
            {modules.map(m=><option key={m}>{m}</option>)}
          </select>
          <select value={filterUser} onChange={e=>setFilterUser(e.target.value)} style={{flex:1,padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,minWidth:110}}>
            <option value="">كل المستخدمين</option>
            {users.map(u=><option key={u}>{u}</option>)}
          </select>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.offWhite}}>{["التاريخ والوقت","المستخدم","الوحدة","الإجراء","التفاصيل"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:600}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.length===0?<tr><td colSpan={5} style={{padding:30,textAlign:"center",color:C.textMuted}}>لا توجد نتائج</td></tr>:filtered.map((r,i)=>(
            <tr key={r.id} style={{background:i%2===0?C.white:C.offWhite}}>
              <td style={{padding:"9px 12px",border:`1px solid ${C.border}`,color:C.textMuted,direction:"ltr",fontSize:12,whiteSpace:"nowrap"}}>{r.ts}</td>
              <td style={{padding:"9px 12px",border:`1px solid ${C.border}`,fontWeight:600}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:24,height:24,background:`linear-gradient(135deg,${C.red},${C.navy})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0}}>{r.user?.[0]}</div>
                  {r.user}
                </div>
              </td>
              <td style={{padding:"9px 12px",border:`1px solid ${C.border}`,color:C.textMuted}}>{r.module}</td>
              <td style={{padding:"9px 12px",border:`1px solid ${C.border}`}}>
                <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:`${actionColor(r.action)}18`,color:actionColor(r.action)}}>{r.action}</span>
              </td>
              <td style={{padding:"9px 12px",border:`1px solid ${C.border}`,fontSize:12,color:C.text}}>{r.detail}</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}

// ══ SETTINGS ══
function Settings({settings,setSettings,addAudit}){
  const [form,setForm]=useState({...settings});
  const [saved,setSaved]=useState(false);
  const [logoPreview,setLogoPreview]=useState(settings.logo||null);

  const handleLogo=(e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{setLogoPreview(ev.target.result);setForm(p=>({...p,logo:ev.target.result}));};
    reader.readAsDataURL(file);
  };
  const save=()=>{
    setSettings({...form,logo:logoPreview});
    addAudit("الإعدادات","تعديل",`تم تحديث إعدادات الشركة`);
    setSaved(true);setTimeout(()=>setSaved(false),2500);
  };
  const removeLogo=()=>{setLogoPreview(null);setForm(p=>({...p,logo:null}));};

  const THEME_LABELS={navy:"Navy (الافتراضي)",green:"أخضر",blue:"أزرق",dark:"داكن"};

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
      {/* Basic */}
      <Card style={{padding:26}}>
        <div style={{fontWeight:700,color:C.text,fontSize:15,marginBottom:20}}>🏢 معلومات الشركة</div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:13,color:C.text,marginBottom:6,fontWeight:600}}>اسم الشركة</label>
          <input value={form.companyName} onChange={e=>setForm(p=>({...p,companyName:e.target.value}))}
            style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:13,color:C.text,marginBottom:6,fontWeight:600}}>النص الفرعي (أسفل الاسم)</label>
          <input value={form.companySubtitle} onChange={e=>setForm(p=>({...p,companySubtitle:e.target.value}))}
            style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,boxSizing:"border-box"}}/>
        </div>

        {/* Logo */}
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:13,color:C.text,marginBottom:10,fontWeight:600}}>شعار الشركة</label>
          {logoPreview?(
            <div style={{display:"flex",alignItems:"center",gap:14,background:C.offWhite,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
              <img src={logoPreview} alt="logo" style={{width:60,height:60,objectFit:"contain",borderRadius:8,border:`1px solid ${C.border}`,background:"white"}}/>
              <div>
                <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:4}}>الشعار الحالي</div>
                <button onClick={removeLogo} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12}}>إزالة الشعار</button>
              </div>
            </div>
          ):(
            <label style={{display:"block",border:`2px dashed ${C.border}`,borderRadius:10,padding:24,textAlign:"center",cursor:"pointer",background:C.offWhite,transition:"all .2s"}}>
              <div style={{fontSize:32}}>📁</div>
              <div style={{fontSize:13,color:C.textMuted,marginTop:6}}>اضغط لرفع الشعار</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>PNG, JPG (موصى به: 200×200)</div>
              <input type="file" accept="image/*" onChange={handleLogo} style={{display:"none"}}/>
            </label>
          )}
        </div>

        {/* Theme */}
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:13,color:C.text,marginBottom:10,fontWeight:600}}>🎨 ثيم الألوان</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {Object.entries(THEMES).map(([k,t])=>(
              <button key={k} onClick={()=>setForm(p=>({...p,theme:k}))}
                style={{padding:"10px 14px",borderRadius:9,border:`2px solid ${form.theme===k?t.accent:C.border}`,cursor:"pointer",background:form.theme===k?`${t.accent}18`:C.white,display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:form.theme===k?700:400,color:form.theme===k?t.accent:C.text,transition:"all .15s"}}>
                <div style={{width:18,height:18,borderRadius:4,background:`linear-gradient(135deg,${t.primary},${t.accent})`,flexShrink:0}}/>
                {THEME_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        {saved&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",color:C.green,padding:"10px 14px",borderRadius:8,fontSize:13,fontWeight:600,marginBottom:14,textAlign:"center"}}>✅ تم حفظ الإعدادات بنجاح</div>}
        <button onClick={save} style={{width:"100%",padding:13,background:C.navy,color:"white",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer"}}>💾 حفظ الإعدادات</button>
      </Card>

      {/* Advanced */}
      <div>
        <Card style={{padding:26,marginBottom:20}}>
          <div style={{fontWeight:700,color:C.text,fontSize:15,marginBottom:20}}>⚙️ إعدادات متقدمة</div>
          {[{l:"عملة النظام",v:"ج.م (جنيه مصري)"},{l:"اللغة الافتراضية",v:"العربية"},{l:"تنسيق التاريخ",v:"DD/MM/YYYY"},{l:"المنطقة الزمنية",v:"(UTC+2) القاهرة"},{l:"نسخ احتياطي تلقائي",v:"يومياً — 11:00 م"}].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:13,color:C.textMuted}}>{r.l}</span>
              <span style={{fontSize:13,fontWeight:600,color:C.text}}>{r.v}</span>
            </div>
          ))}
          <div style={{marginTop:14,padding:12,background:C.orangeBg,borderRadius:8,fontSize:12,color:"#78350F",border:"1px solid #FDE68A"}}>
            🔧 يمكن تعديل الإعدادات المتقدمة من خلال مسؤول النظام
          </div>
        </Card>

        <Card style={{padding:26}}>
          <div style={{fontWeight:700,color:C.text,fontSize:15,marginBottom:16}}>ℹ️ معلومات النظام</div>
          {[{l:"الإصدار",v:"v2.1.0"},{l:"قاعدة البيانات",v:"متصلة ✅"},{l:"آخر تحديث",v:"19/05/2026"},{l:"الترخيص",v:"EL MEGHARBEL — حقوق محفوظة"}].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:13,color:C.textMuted}}>{r.l}</span>
              <span style={{fontSize:13,color:C.text}}>{r.v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ══ USER MGMT ══
function UserMgmt({users,setUsers,addAudit}){
  const [sel,setSel]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [nu,setNu]=useState({name:"",username:"",password:"",role:"user"});
  const [nuErr,setNuErr]=useState("");
  const def=()=>{const p={};MODULES.filter(m=>!m.adminOnly).forEach(m=>{p[m.id]={view:false,add:false,edit:false,delete:false};});return p;};
  const tog=(uid,mod,act,val)=>{setUsers(prev=>prev.map(u=>{if(u.id!==uid)return u;const p={...u.permissions,[mod]:{...(u.permissions?.[mod]||{}),[act]:val}};if(["add","edit","delete"].includes(act)&&val)p[mod].view=true;return{...u,permissions:p};}));};
  const addU=()=>{
    if(!nu.name.trim()||!nu.username.trim()||!nu.password.trim()){setNuErr("كل الحقول مطلوبة");return;}
    if(users.find(u=>u.username===nu.username)){setNuErr("اسم المستخدم موجود");return;}
    setUsers(p=>[...p,{id:Date.now(),...nu,permissions:def()}]);
    addAudit("المستخدمون","إضافة",`إضافة مستخدم: ${nu.name} (${nu.username})`);
    setNu({name:"",username:"",password:"",role:"user"});setNuErr("");setShowAdd(false);
  };
  const rb=r=>r==="admin"?{bg:"#FEF3C7",c:"#D97706",t:"مدير"}:r==="accountant"?{bg:"#EFF6FF",c:"#1D4ED8",t:"محاسب"}:{bg:C.greenBg,c:C.green,t:"مستخدم"};
  const su=users.find(u=>u.id===sel);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
        <button onClick={()=>setShowAdd(true)} style={{background:C.navy,color:"white",border:"none",borderRadius:9,padding:"10px 22px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ مستخدم جديد</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"270px 1fr",gap:20}}>
        <Card style={{padding:16,height:"fit-content"}}>
          <div style={{fontSize:12,color:C.textMuted,marginBottom:10,fontWeight:600}}>المستخدمون ({users.length})</div>
          {users.map(u=>{const b=rb(u.role);return(
            <div key={u.id} onClick={()=>setSel(u.id)} style={{padding:12,borderRadius:9,cursor:"pointer",marginBottom:6,background:sel===u.id?"#EFF6FF":C.offWhite,border:`1.5px solid ${sel===u.id?"#1D4ED8":C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:30,height:30,background:`linear-gradient(135deg,${C.red},${C.navy})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white",flexShrink:0}}>{u.name[0]}</div>
                  <div><div style={{fontWeight:600,color:C.text,fontSize:13}}>{u.name}</div><div style={{fontSize:11,color:C.textMuted,direction:"ltr"}}>{u.username}</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:b.bg,color:b.c,fontWeight:700}}>{b.t}</span>
                  {u.role!=="admin"&&<button onClick={e=>{e.stopPropagation();addAudit("المستخدمون","حذف",`حذف مستخدم: ${u.name}`);setUsers(p=>p.filter(x=>x.id!==u.id));if(sel===u.id)setSel(null);}} style={{background:"#FEF2F2",border:"none",color:C.red,borderRadius:6,padding:"2px 7px",cursor:"pointer",fontSize:11}}>✕</button>}
                </div>
              </div>
            </div>
          );})}
        </Card>
        <Card style={{padding:22}}>
          {!su?<div style={{textAlign:"center",color:C.textMuted,padding:50}}><div style={{fontSize:44}}>👈</div><div style={{marginTop:12}}>اختر مستخدماً لتعديل صلاحياته</div></div>
          :su.role==="admin"?<div style={{textAlign:"center",padding:50}}><div style={{fontWeight:700,color:C.text,fontSize:18,marginTop:14}}>{su.name}</div><div style={{color:C.textMuted,marginTop:8}}>المدير يملك صلاحية كاملة تلقائياً</div></div>
          :(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <span style={{fontWeight:700,color:C.text,fontSize:15}}>صلاحيات: {su.name}</span>
                <button onClick={()=>{const a={};MODULES.filter(m=>!m.adminOnly).forEach(m=>{a[m.id]={view:true,add:true,edit:true,delete:true};});setUsers(p=>p.map(u=>u.id===su.id?{...u,permissions:a}:u));}} style={{background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>تحديد الكل</button>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:C.offWhite}}><th style={{padding:"10px 14px",textAlign:"right",color:C.textMuted,fontWeight:700,border:`1px solid ${C.border}`,minWidth:150}}>الوحدة</th>{ACTIONS.map(a=><th key={a} style={{padding:"10px 14px",textAlign:"center",color:C.textMuted,fontWeight:700,border:`1px solid ${C.border}`,minWidth:70}}>{AL[a]}</th>)}</tr></thead>
                <tbody>{MODULES.filter(m=>!m.adminOnly).map((mod,i)=>(
                  <tr key={mod.id} style={{background:i%2===0?C.white:C.offWhite}}>
                    <td style={{padding:"10px 14px",border:`1px solid ${C.border}`,fontWeight:500}}>{mod.icon} {mod.label}</td>
                    {ACTIONS.map(act=>(
                      <td key={act} style={{padding:"10px",textAlign:"center",border:`1px solid ${C.border}`}}>
                        <input type="checkbox" checked={su.permissions?.[mod.id]?.[act]||false} onChange={e=>tog(su.id,mod.id,act,e.target.checked)} style={{width:16,height:16,cursor:"pointer",accentColor:C.red}}/>
                      </td>
                    ))}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:400,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:22,fontSize:17}}>➕ مستخدم جديد</h3>
            {[{l:"الاسم الكامل",k:"name",t:"text",rtl:true},{l:"اسم المستخدم",k:"username",t:"text"},{l:"كلمة المرور",k:"password",t:"password"}].map(f=>(
              <div key={f.k} style={{marginBottom:14}}><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>{f.l}</label><input type={f.t} value={nu[f.k]} onChange={e=>setNu(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:f.rtl?"rtl":"ltr"}}/></div>
            ))}
            <div style={{marginBottom:20}}><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>الدور</label><select value={nu.role} onChange={e=>setNu(p=>({...p,role:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13}}><option value="user">مستخدم عادي</option><option value="accountant">محاسب</option></select></div>
            {nuErr&&<div style={{background:"#FEF2F2",color:C.red,padding:"8px 12px",borderRadius:8,marginBottom:14,fontSize:13,border:"1px solid #FECACA"}}>{nuErr}</div>}
            <div style={{display:"flex",gap:10}}><button onClick={addU} style={{flex:1,padding:12,background:C.navy,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>إضافة</button><button onClick={()=>{setShowAdd(false);setNuErr("");}} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button></div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ══ ACCOUNTING ══
function Accounting({accounts,setAccounts,journal,setJournal,canAdd,canEdit,canDelete,addAudit,currentUser}){
  const [tab,setTab]=useState("chart");
  const [showAddAcc,setShowAddAcc]=useState(false);
  const [showAddEntry,setShowAddEntry]=useState(false);
  const [ledgerAcc,setLedgerAcc]=useState(null);
  const [filterType,setFilterType]=useState("الكل");
  const [searchAcc,setSearchAcc]=useState("");
  const [aForm,setAForm]=useState({code:"",name:"",type:"أصول",notes:""});
  const [aErr,setAErr]=useState("");
  const [jLines,setJLines]=useState([{accountId:"",type:"مدين",amount:""},{accountId:"",type:"دائن",amount:""}]);
  const [jHead,setJHead]=useState({date:todayISO(),ref:"",desc:""});
  const [jErr,setJErr]=useState("");
  const [viewEntry,setViewEntry]=useState(null);
  const [editEntryId,setEditEntryId]=useState(null);
  const [deleteEntryId,setDeleteEntryId]=useState(null);
  const [editAccId,setEditAccId]=useState(null);
  const [eaForm,setEaForm]=useState({code:"",name:"",type:"أصول",notes:""});
  const [eaErr,setEaErr]=useState("");
  const [deleteAccId,setDeleteAccId]=useState(null);

  // ── helpers ──
  const getBalance=(accId)=>{
    let dr=0,cr=0;
    journal.forEach(e=>e.lines.forEach(l=>{
      if(l.accountId===accId){if(l.type==="مدين")dr+=l.amount;else cr+=l.amount;}
    }));
    return{dr,cr,net:dr-cr};
  };
  const totalDr=jLines.reduce((s,l)=>s+(Number(l.amount)||0)*(l.type==="مدين"?1:0),0);
  const totalCr=jLines.reduce((s,l)=>s+(Number(l.amount)||0)*(l.type==="دائن"?1:0),0);
  const balanced=totalDr>0&&totalCr>0&&totalDr===totalCr;

  const addAccount=()=>{
    if(!aForm.code.trim()||!aForm.name.trim()){setAErr("الكود والاسم مطلوبان");return;}
    if(accounts.find(a=>a.code===aForm.code.trim())){setAErr("كود الحساب موجود مسبقاً");return;}
    const na={id:Date.now(),...aForm,code:aForm.code.trim(),name:aForm.name.trim()};
    setAccounts(p=>[...p,na]);
    addAudit("المحاسبة","إضافة حساب",`${na.code} — ${na.name} (${na.type})`);
    setAForm({code:"",name:"",type:"أصول",notes:""});setAErr("");setShowAddAcc(false);
  };

  const addEntry=()=>{
    const filled=jLines.filter(l=>l.accountId&&l.amount);
    if(!jHead.desc){setJErr("وصف القيد مطلوب");return;}
    if(filled.length<2){setJErr("يجب إدخال سطرين على الأقل");return;}
    if(!balanced){setJErr("القيد غير متوازن — المدين يجب يساوي الدائن");return;}
    const lines=filled.map(l=>({...l,accountId:Number(l.accountId),amount:Number(l.amount)}));
    const ref=jHead.ref||`J-${String(journal.length+1).padStart(3,"0")}`;
    const entry={id:Date.now(),date:jHead.date,ref,desc:jHead.desc,lines,createdBy:currentUser?.name||"?"};
    setJournal(p=>[entry,...p]);
    addAudit("المحاسبة","قيد محاسبي",`${ref} — ${jHead.desc} — إجمالي: ${fmt(totalDr)} ج.م`);
    setJLines([{accountId:"",type:"مدين",amount:""},{accountId:"",type:"دائن",amount:""}]);
    setJHead({date:todayISO(),ref:"",desc:""});setJErr("");setShowAddEntry(false);
  };

  const addLine=()=>setJLines(p=>[...p,{accountId:"",type:"مدين",amount:""}]);
  const removeLine=(i)=>setJLines(p=>p.filter((_,j)=>j!==i));
  const updateLine=(i,k,v)=>setJLines(p=>p.map((l,j)=>j===i?{...l,[k]:v}:l));

  const startEditEntry=(e)=>{
    setJHead({date:e.date,ref:e.ref,desc:e.desc});
    setJLines(e.lines.map(l=>({...l,accountId:String(l.accountId),amount:String(l.amount)})));
    setEditEntryId(e.id);setJErr("");setShowAddEntry(true);
  };
  const saveEditEntry=()=>{
    const filled=jLines.filter(l=>l.accountId&&l.amount);
    if(!jHead.desc){setJErr("وصف القيد مطلوب");return;}
    if(filled.length<2){setJErr("يجب إدخال سطرين على الأقل");return;}
    if(!balanced){setJErr("القيد غير متوازن — المدين يجب يساوي الدائن");return;}
    const lines=filled.map(l=>({...l,accountId:Number(l.accountId),amount:Number(l.amount)}));
    setJournal(p=>p.map(e=>e.id===editEntryId?{...e,date:jHead.date,ref:jHead.ref||e.ref,desc:jHead.desc,lines}:e));
    addAudit("المحاسبة","تعديل قيد",`${jHead.ref} — ${jHead.desc}`);
    setJLines([{accountId:"",type:"مدين",amount:""},{accountId:"",type:"دائن",amount:""}]);
    setJHead({date:todayISO(),ref:"",desc:""});setJErr("");setShowAddEntry(false);setEditEntryId(null);
  };
  const confirmDeleteEntry=()=>{
    const e=journal.find(j=>j.id===deleteEntryId);
    setJournal(p=>p.filter(j=>j.id!==deleteEntryId));
    addAudit("المحاسبة","حذف قيد",`${e?.ref} — ${e?.desc}`);
    setDeleteEntryId(null);
  };

  const startEditAcc=(a)=>{setEaForm({code:a.code,name:a.name,type:a.type,notes:a.notes||""});setEaErr("");setEditAccId(a.id);};
  const saveEditAcc=()=>{
    if(!eaForm.code.trim()||!eaForm.name.trim()){setEaErr("الكود والاسم مطلوبان");return;}
    const dup=accounts.find(a=>a.code===eaForm.code.trim()&&a.id!==editAccId);
    if(dup){setEaErr("كود الحساب موجود مسبقاً");return;}
    setAccounts(p=>p.map(a=>a.id===editAccId?{...a,...eaForm,code:eaForm.code.trim(),name:eaForm.name.trim()}:a));
    addAudit("المحاسبة","تعديل حساب",`${eaForm.code} — ${eaForm.name}`);
    setEditAccId(null);setEaErr("");
  };
  const confirmDeleteAcc=()=>{
    const a=accounts.find(x=>x.id===deleteAccId);
    setAccounts(p=>p.filter(x=>x.id!==deleteAccId));
    addAudit("المحاسبة","حذف حساب",`${a?.code} — ${a?.name}`);
    setDeleteAccId(null);
  };

  const accName=id=>{const a=accounts.find(a=>a.id===id);return a?`${a.code} — ${a.name}`:String(id);};

  const filteredAccs=accounts.filter(a=>(filterType==="الكل"||a.type===filterType)&&(a.name.includes(searchAcc)||a.code.includes(searchAcc)));

  // ledger for selected account
  const ledgerEntries=!ledgerAcc?[]:journal.flatMap(e=>e.lines.filter(l=>l.accountId===ledgerAcc).map(l=>({...l,date:e.date,ref:e.ref,desc:e.desc,entryId:e.id})));
  const ledgerAccount=accounts.find(a=>a.id===ledgerAcc);
  const ledgerBal=ledgerAcc?getBalance(ledgerAcc):{dr:0,cr:0,net:0};

  const TabBtn=({t,lbl})=><button onClick={()=>setTab(t)} style={{padding:"9px 18px",border:"none",borderBottom:tab===t?`3px solid ${C.red}`:"3px solid transparent",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:700,color:tab===t?C.red:C.textMuted}}>{lbl}</button>;

  return(
    <div>
      {/* Header tabs */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`2px solid ${C.border}`,marginBottom:24}}>
        <div style={{display:"flex"}}>
          <TabBtn t="chart" lbl="📒 دليل الحسابات"/>
          <TabBtn t="journal" lbl="✏️ القيود اليومية"/>
          <TabBtn t="ledger" lbl="📋 كشف الحساب"/>
        </div>
        <div style={{display:"flex",gap:8,paddingBottom:4}}>
          {canAdd&&tab==="chart"&&<button onClick={()=>setShowAddAcc(true)} style={{background:C.navy,color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ حساب جديد</button>}
          {canAdd&&tab==="journal"&&<button onClick={()=>setShowAddEntry(true)} style={{background:C.red,color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>✏️ قيد جديد</button>}
        </div>
      </div>

      {/* ── TAB: Chart of Accounts ── */}
      {tab==="chart"&&(
        <div>
          {/* Summary cards by type */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:22}}>
            {ACCOUNT_TYPES.map(t=>{
              const accs=accounts.filter(a=>a.type===t);
              const total=accs.reduce((s,a)=>{const b=getBalance(a.id);return s+(t==="مصروفات"||t==="أصول"?b.net:-b.net);},0);
              return(
                <Card key={t} style={{padding:16,borderTop:`4px solid ${AT_COLOR[t]}`,textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:4}}>{AT_ICON[t]}</div>
                  <div style={{fontSize:10,color:C.textMuted,marginBottom:4,fontWeight:600}}>{t}</div>
                  <div style={{fontSize:14,fontWeight:800,color:AT_COLOR[t]}}>{fmt(Math.abs(total))}</div>
                  <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{accs.length} حساب</div>
                </Card>
              );
            })}
          </div>

          {/* Filter + search */}
          <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
            <input placeholder="🔍 ابحث بالاسم أو الكود..." value={searchAcc} onChange={e=>setSearchAcc(e.target.value)}
              style={{flex:1,padding:"9px 14px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:13}}/>
            {["الكل",...ACCOUNT_TYPES].map(t=>(
              <button key={t} onClick={()=>setFilterType(t)} style={{padding:"8px 14px",border:`1.5px solid ${filterType===t?(AT_COLOR[t]||C.navy):C.border}`,borderRadius:20,background:filterType===t?(AT_BG[t]||"#EFF6FF"):C.white,color:filterType===t?(AT_COLOR[t]||C.navy):C.textMuted,cursor:"pointer",fontSize:12,fontWeight:filterType===t?700:400,whiteSpace:"nowrap"}}>{t}</button>
            ))}
          </div>

          {/* Accounts table */}
          <Card style={{padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:C.offWhite}}>
                  {["الكود","اسم الحساب","النوع","مدين","دائن","الرصيد الصافي",""].map((h,i)=>(
                    <th key={i} style={{padding:"11px 14px",textAlign:i>=3&&i<=5?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAccs.length===0?(
                  <tr><td colSpan={7} style={{padding:40,textAlign:"center",color:C.textMuted}}>لا توجد حسابات مطابقة</td></tr>
                ):filteredAccs.map((a,i)=>{
                  const b=getBalance(a.id);
                  return(
                    <tr key={a.id} style={{background:i%2===0?C.white:C.offWhite,cursor:"pointer"}} onClick={()=>{setLedgerAcc(a.id);setTab("ledger");}}>
                      <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,fontFamily:"monospace",fontWeight:600,color:C.navy,direction:"ltr"}}>{a.code}</td>
                      <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,fontWeight:600}}>{a.name}</td>
                      <td style={{padding:"11px 14px",border:`1px solid ${C.border}`}}>
                        <span style={{background:AT_BG[a.type],color:AT_COLOR[a.type],borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{AT_ICON[a.type]} {a.type}</span>
                      </td>
                      <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"center",color:"#1D4ED8",fontWeight:b.dr>0?700:400}}>{b.dr>0?fmt(b.dr):"—"}</td>
                      <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"center",color:C.red,fontWeight:b.cr>0?700:400}}>{b.cr>0?fmt(b.cr):"—"}</td>
                      <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700,color:b.net>=0?C.green:C.red}}>{fmt(Math.abs(b.net))} {b.net>=0?"":"(د)"}</td>
                      <td style={{padding:"8px 14px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                        <div style={{display:"flex",gap:5,justifyContent:"center"}}>
                          <button onClick={e=>{e.stopPropagation();setLedgerAcc(a.id);setTab("ledger");}} style={{background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>كشف 📋</button>
                          {canEdit&&<button onClick={e=>{e.stopPropagation();startEditAcc(a);}} style={{background:"#FFFBEB",border:"1px solid #FDE68A",color:C.orange,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>✏️</button>}
                          {canDelete&&<button onClick={e=>{e.stopPropagation();setDeleteAccId(a.id);}} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>🗑</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── TAB: Journal Entries ── */}
      {tab==="journal"&&(
        <div>
          {journal.length===0?(
            <div style={{textAlign:"center",padding:60,color:C.textMuted}}><div style={{fontSize:48}}>✏️</div><div style={{marginTop:12}}>لا توجد قيود بعد</div></div>
          ):(
            <Card style={{padding:0,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:C.offWhite}}>
                    {["المرجع","التاريخ","البيان","إجمالي المدين","إجمالي الدائن","بواسطة","الإجراءات"].map((h,i)=>(
                      <th key={i} style={{padding:"11px 14px",textAlign:i>=3&&i<=4?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...journal].sort((a,b)=>b.date.localeCompare(a.date)).map((e,i)=>{
                    const dr=e.lines.filter(l=>l.type==="مدين").reduce((s,l)=>s+l.amount,0);
                    const cr=e.lines.filter(l=>l.type==="دائن").reduce((s,l)=>s+l.amount,0);
                    return(
                      <tr key={e.id} style={{background:i%2===0?C.white:C.offWhite}}>
                        <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,fontFamily:"monospace",fontWeight:700,color:C.navy,direction:"ltr"}}>{e.ref}</td>
                        <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,color:C.textMuted,direction:"ltr"}}>{e.date}</td>
                        <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,fontWeight:500,maxWidth:260}}>{e.desc}</td>
                        <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700,color:"#1D4ED8"}}>{fmt(dr)}</td>
                        <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700,color:C.red}}>{fmt(cr)}</td>
                        <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,color:C.textMuted}}>{e.createdBy}</td>
                        <td style={{padding:"8px 14px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                          <div style={{display:"flex",gap:5,justifyContent:"center"}}>
                            <button onClick={()=>setViewEntry(e.id)} style={{background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,color:C.text}}>👁 عرض</button>
                            {canEdit&&<button onClick={()=>startEditEntry(e)} style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,color:"#1D4ED8",fontWeight:600}}>✏️ تعديل</button>}
                            {canDelete&&<button onClick={()=>setDeleteEntryId(e.id)} style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,color:C.red,fontWeight:600}}>🗑 حذف</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: Account Ledger ── */}
      {tab==="ledger"&&(
        <div>
          {/* Account selector */}
          <div style={{display:"flex",gap:12,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
            <select value={ledgerAcc||""} onChange={e=>setLedgerAcc(Number(e.target.value)||null)}
              style={{flex:1,padding:"10px 14px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:13,minWidth:200}}>
              <option value="">— اختر حساباً —</option>
              {ACCOUNT_TYPES.map(t=>(
                <optgroup key={t} label={`${AT_ICON[t]} ${t}`}>
                  {accounts.filter(a=>a.type===t).map(a=><option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          {!ledgerAcc?(
            <div style={{textAlign:"center",padding:"60px 40px",color:C.textMuted}}>
              <div style={{fontSize:48}}>📋</div><div style={{marginTop:12}}>اختر حساباً لعرض كشف حركاته</div>
            </div>
          ):(
            <div>
              {/* Account header card */}
              <Card style={{padding:20,marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16,borderRight:`6px solid ${AT_COLOR[ledgerAccount?.type||"أصول"]}`}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:C.navy,direction:"ltr"}}>{ledgerAccount?.code}</span>
                    <h3 style={{margin:0,fontSize:17,color:C.text}}>{ledgerAccount?.name}</h3>
                    <span style={{background:AT_BG[ledgerAccount?.type],color:AT_COLOR[ledgerAccount?.type],borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{ledgerAccount?.type}</span>
                  </div>
                  <div style={{color:C.textMuted,fontSize:12,marginTop:4}}>{ledgerEntries.length} حركة مسجلة</div>
                </div>
                <div style={{display:"flex",gap:16}}>
                  {[{l:"إجمالي مدين",v:ledgerBal.dr,c:"#1D4ED8"},{l:"إجمالي دائن",v:ledgerBal.cr,c:C.red},{l:"الرصيد الصافي",v:Math.abs(ledgerBal.net),c:ledgerBal.net>=0?C.green:C.red}].map((s,i)=>(
                    <div key={i} style={{textAlign:"center",background:C.offWhite,borderRadius:10,padding:"12px 20px",border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:11,color:C.textMuted,marginBottom:4}}>{s.l}</div>
                      <div style={{fontWeight:800,fontSize:15,color:s.c}}>{fmt(s.v)}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Ledger table */}
              {ledgerEntries.length===0?(
                <Card style={{padding:40,textAlign:"center",color:C.textMuted}}><div style={{fontSize:36}}>📭</div><div style={{marginTop:8}}>لا توجد حركات على هذا الحساب</div></Card>
              ):(
                <Card style={{padding:0,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead>
                      <tr style={{background:C.offWhite}}>
                        {["المرجع","التاريخ","البيان","مدين","دائن"].map((h,i)=>(
                          <th key={i} style={{padding:"11px 14px",textAlign:i>=3?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...ledgerEntries].sort((a,b)=>a.date.localeCompare(b.date)).map((l,i)=>(
                        <tr key={i} style={{background:i%2===0?C.white:C.offWhite}}>
                          <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,fontFamily:"monospace",fontWeight:600,color:C.navy,direction:"ltr"}}>{l.ref}</td>
                          <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,color:C.textMuted,direction:"ltr"}}>{l.date}</td>
                          <td style={{padding:"11px 14px",border:`1px solid ${C.border}`}}>{l.desc}</td>
                          <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:l.type==="مدين"?700:400,color:l.type==="مدين"?"#1D4ED8":C.border,fontSize:l.type==="مدين"?14:12}}>
                            {l.type==="مدين"?<span style={{color:"#1D4ED8",fontWeight:700}}>{fmt(l.amount)}</span>:"—"}
                          </td>
                          <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                            {l.type==="دائن"?<span style={{color:C.red,fontWeight:700}}>{fmt(l.amount)}</span>:"—"}
                          </td>
                        </tr>
                      ))}
                      {/* totals row */}
                      <tr style={{background:"#F8FAFC",fontWeight:700}}>
                        <td colSpan={3} style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"right",color:C.text}}>الإجمالي</td>
                        <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"center",color:"#1D4ED8",fontSize:14}}>{fmt(ledgerBal.dr)}</td>
                        <td style={{padding:"11px 14px",border:`1px solid ${C.border}`,textAlign:"center",color:C.red,fontSize:14}}>{fmt(ledgerBal.cr)}</td>
                      </tr>
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: Add Account ── */}
      {showAddAcc&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:460,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:22,fontSize:17}}>📒 إضافة حساب جديد</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>كود الحساب *</label>
                <input value={aForm.code} onChange={e=>setAForm(p=>({...p,code:e.target.value}))} placeholder="مثال: 1500"
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,boxSizing:"border-box",direction:"ltr",fontFamily:"monospace"}}/></div>
              <div><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>النوع *</label>
                <select value={aForm.type} onChange={e=>setAForm(p=>({...p,type:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13}}>
                  {ACCOUNT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select></div>
            </div>
            <div style={{marginBottom:14}}><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>اسم الحساب *</label>
              <input value={aForm.name} onChange={e=>setAForm(p=>({...p,name:e.target.value}))} placeholder="مثال: أصناف للبيع"
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,boxSizing:"border-box"}}/></div>
            <div style={{marginBottom:20}}><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>ملاحظات (اختياري)</label>
              <input value={aForm.notes} onChange={e=>setAForm(p=>({...p,notes:e.target.value}))}
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/></div>
            {aErr&&<div style={{background:"#FEF2F2",color:C.red,padding:"8px 12px",borderRadius:8,marginBottom:14,fontSize:13,border:"1px solid #FECACA"}}>{aErr}</div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={addAccount} style={{flex:1,padding:12,background:C.navy,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>➕ إضافة</button>
              <button onClick={()=>{setShowAddAcc(false);setAErr("");}} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {/* ── MODAL: Add Journal Entry ── */}
      {showAddEntry&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,overflow:"auto",padding:"20px 0"}}>
          <Card style={{padding:32,width:700,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{color:C.text,marginBottom:20,fontSize:17}}>{editEntryId?"✏️ تعديل القيد المحاسبي":"✏️ قيد محاسبي جديد"}</h3>

            {/* Entry header */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:12,marginBottom:20}}>
              <div><label style={{display:"block",fontSize:12,color:C.text,marginBottom:5,fontWeight:600}}>التاريخ</label>
                <input type="date" value={jHead.date} onChange={e=>setJHead(p=>({...p,date:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/></div>
              <div><label style={{display:"block",fontSize:12,color:C.text,marginBottom:5,fontWeight:600}}>رقم المرجع</label>
                <input value={jHead.ref} onChange={e=>setJHead(p=>({...p,ref:e.target.value}))} placeholder={`J-${String(journal.length+1).padStart(3,"0")}`}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr",fontFamily:"monospace"}}/></div>
              <div><label style={{display:"block",fontSize:12,color:C.text,marginBottom:5,fontWeight:600}}>البيان / الوصف *</label>
                <input value={jHead.desc} onChange={e=>setJHead(p=>({...p,desc:e.target.value}))} placeholder="مثال: فاتورة مبيعات، مصروف وقود..."
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/></div>
            </div>

            {/* Lines */}
            <div style={{background:C.offWhite,borderRadius:10,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{display:"grid",gridTemplateColumns:"3fr 130px 150px 40px",gap:8,marginBottom:8}}>
                {["الحساب","نوع","المبلغ",""].map((h,i)=><div key={i} style={{fontSize:12,color:C.textMuted,fontWeight:600,textAlign:i===2?"center":"right"}}>{h}</div>)}
              </div>
              {jLines.map((l,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"3fr 130px 150px 40px",gap:8,marginBottom:8}}>
                  <select value={l.accountId} onChange={e=>updateLine(i,"accountId",e.target.value)}
                    style={{padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13}}>
                    <option value="">— اختر الحساب —</option>
                    {ACCOUNT_TYPES.map(t=>(
                      <optgroup key={t} label={`${AT_ICON[t]} ${t}`}>
                        {accounts.filter(a=>a.type===t).map(a=><option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <select value={l.type} onChange={e=>updateLine(i,"type",e.target.value)}
                    style={{padding:"9px 12px",border:`1.5px solid ${l.type==="مدين"?"#1D4ED8":C.red}`,borderRadius:8,fontSize:13,background:l.type==="مدين"?"#EFF6FF":"#FEF2F2",color:l.type==="مدين"?"#1D4ED8":C.red,fontWeight:700}}>
                    <option>مدين</option><option>دائن</option>
                  </select>
                  <input type="number" min="0" value={l.amount} onChange={e=>updateLine(i,"amount",e.target.value)} placeholder="0.00"
                    style={{padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,direction:"ltr",textAlign:"center"}}/>
                  {jLines.length>2?<button onClick={()=>removeLine(i)} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,borderRadius:7,cursor:"pointer",fontSize:14,fontWeight:700}}>✕</button>:<div/>}
                </div>
              ))}
              <button onClick={addLine} style={{marginTop:4,background:C.white,border:`1.5px dashed ${C.border}`,borderRadius:8,padding:"8px",width:"100%",cursor:"pointer",fontSize:13,color:C.textMuted,fontWeight:600}}>+ إضافة سطر</button>
            </div>

            {/* Balance indicator */}
            <div style={{display:"flex",gap:12,marginBottom:16,alignItems:"center"}}>
              <div style={{flex:1,background:"#EFF6FF",borderRadius:9,padding:"10px 14px",textAlign:"center",border:"1px solid #BFDBFE"}}>
                <span style={{fontSize:12,color:C.textMuted}}>إجمالي مدين: </span><span style={{fontWeight:700,color:"#1D4ED8",fontSize:14}}>{fmt(totalDr)}</span>
              </div>
              <div style={{flex:1,background:"#FEF2F2",borderRadius:9,padding:"10px 14px",textAlign:"center",border:"1px solid #FECACA"}}>
                <span style={{fontSize:12,color:C.textMuted}}>إجمالي دائن: </span><span style={{fontWeight:700,color:C.red,fontSize:14}}>{fmt(totalCr)}</span>
              </div>
              <div style={{flex:1,borderRadius:9,padding:"10px 14px",textAlign:"center",background:balanced?C.greenBg:"#FFFBEB",border:`1.5px solid ${balanced?"#A7F3D0":"#FDE68A"}`}}>
                <span style={{fontWeight:700,fontSize:14,color:balanced?C.green:C.orange}}>{balanced?"✅ القيد متوازن":"⚠️ غير متوازن"}</span>
              </div>
            </div>

            {jErr&&<div style={{background:"#FEF2F2",color:C.red,padding:"8px 12px",borderRadius:8,marginBottom:14,fontSize:13,border:"1px solid #FECACA"}}>{jErr}</div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={editEntryId?saveEditEntry:addEntry} style={{flex:1,padding:12,background:balanced?C.red:"#E2E8F0",color:balanced?"white":C.textMuted,border:"none",borderRadius:9,cursor:balanced?"pointer":"not-allowed",fontWeight:700,fontSize:14}}>{editEntryId?"💾 حفظ التعديل":"✏️ ترحيل القيد"}</button>
              <button onClick={()=>{setShowAddEntry(false);setJErr("");setEditEntryId(null);setJLines([{accountId:"",type:"مدين",amount:""},{accountId:"",type:"دائن",amount:""}]);setJHead({date:todayISO(),ref:"",desc:""});}} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {/* ── MODAL: View Entry ── */}
      {viewEntry&&(()=>{
        const e=journal.find(j=>j.id===viewEntry);if(!e)return null;
        const dr=e.lines.filter(l=>l.type==="مدين").reduce((s,l)=>s+l.amount,0);
        return(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <Card style={{padding:32,width:560,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <h3 style={{color:C.text,margin:0,fontSize:16}}>✏️ تفاصيل القيد</h3>
                <button onClick={()=>setViewEntry(null)} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:13}}>✕ إغلاق</button>
              </div>
              <div style={{background:C.offWhite,borderRadius:10,padding:14,marginBottom:18,border:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><span style={{fontSize:11,color:C.textMuted}}>رقم المرجع</span><div style={{fontWeight:700,color:C.navy,fontFamily:"monospace",direction:"ltr",fontSize:15}}>{e.ref}</div></div>
                <div><span style={{fontSize:11,color:C.textMuted}}>التاريخ</span><div style={{fontWeight:600,direction:"ltr"}}>{e.date}</div></div>
                <div style={{gridColumn:"span 2"}}><span style={{fontSize:11,color:C.textMuted}}>البيان</span><div style={{fontWeight:600,marginTop:2}}>{e.desc}</div></div>
                <div><span style={{fontSize:11,color:C.textMuted}}>بواسطة</span><div style={{fontWeight:600}}>{e.createdBy}</div></div>
                <div><span style={{fontSize:11,color:C.textMuted}}>إجمالي القيد</span><div style={{fontWeight:700,color:C.green,fontSize:14}}>{fmt(dr)} ج.م</div></div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:C.offWhite}}>
                  {["الحساب","نوع","المبلغ"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:i===2?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:600}}>{h}</th>)}
                </tr></thead>
                <tbody>{e.lines.map((l,i)=>(
                  <tr key={i} style={{background:i%2===0?C.white:C.offWhite}}>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,fontWeight:500}}>{accName(l.accountId)}</td>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`}}>
                      <span style={{background:l.type==="مدين"?"#EFF6FF":"#FEF2F2",color:l.type==="مدين"?"#1D4ED8":C.red,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:700}}>{l.type}</span>
                    </td>
                    <td style={{padding:"10px 12px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700,color:l.type==="مدين"?"#1D4ED8":C.red}}>{fmt(l.amount)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          </div>
        );
      })()}

      {/* ── MODAL: Confirm Delete Entry ── */}
      {deleteEntryId&&(()=>{
        const e=journal.find(j=>j.id===deleteEntryId);
        return(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <Card style={{padding:32,width:420,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:48}}>🗑️</div>
                <h3 style={{color:C.text,margin:"10px 0 6px",fontSize:17}}>حذف القيد المحاسبي</h3>
                <p style={{color:C.textMuted,fontSize:13,margin:0}}>هل أنت متأكد من حذف هذا القيد؟ لا يمكن التراجع.</p>
              </div>
              <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:14,marginBottom:20}}>
                <div style={{fontWeight:700,color:C.navy,fontFamily:"monospace",direction:"ltr",fontSize:14}}>{e?.ref}</div>
                <div style={{color:C.text,marginTop:4,fontSize:13}}>{e?.desc}</div>
                <div style={{color:C.red,fontWeight:700,marginTop:4,fontSize:13}}>{fmt(e?.lines?.filter(l=>l.type==="مدين").reduce((s,l)=>s+l.amount,0)||0)} ج.م</div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={confirmDeleteEntry} style={{flex:1,padding:12,background:C.red,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>🗑 تأكيد الحذف</button>
                <button onClick={()=>setDeleteEntryId(null)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* ── MODAL: Edit Account ── */}
      {editAccId&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:460,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:22,fontSize:17}}>✏️ تعديل الحساب</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>كود الحساب *</label>
                <input value={eaForm.code} onChange={e=>setEaForm(p=>({...p,code:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,boxSizing:"border-box",direction:"ltr",fontFamily:"monospace"}}/></div>
              <div><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>النوع *</label>
                <select value={eaForm.type} onChange={e=>setEaForm(p=>({...p,type:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13}}>
                  {ACCOUNT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select></div>
            </div>
            <div style={{marginBottom:14}}><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>اسم الحساب *</label>
              <input value={eaForm.name} onChange={e=>setEaForm(p=>({...p,name:e.target.value}))}
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,boxSizing:"border-box"}}/></div>
            <div style={{marginBottom:20}}><label style={{display:"block",fontSize:13,color:C.text,marginBottom:5,fontWeight:600}}>ملاحظات</label>
              <input value={eaForm.notes} onChange={e=>setEaForm(p=>({...p,notes:e.target.value}))}
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/></div>
            {eaErr&&<div style={{background:"#FEF2F2",color:C.red,padding:"8px 12px",borderRadius:8,marginBottom:14,fontSize:13,border:"1px solid #FECACA"}}>{eaErr}</div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={saveEditAcc} style={{flex:1,padding:12,background:C.navy,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>💾 حفظ التعديل</button>
              <button onClick={()=>{setEditAccId(null);setEaErr("");}} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {/* ── MODAL: Confirm Delete Account ── */}
      {deleteAccId&&(()=>{
        const a=accounts.find(x=>x.id===deleteAccId);
        const hasEntries=journal.some(e=>e.lines.some(l=>l.accountId===deleteAccId));
        return(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <Card style={{padding:32,width:420,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:48}}>{hasEntries?"⚠️":"🗑️"}</div>
                <h3 style={{color:C.text,margin:"10px 0 6px",fontSize:17}}>{hasEntries?"لا يمكن حذف الحساب":"حذف الحساب"}</h3>
                <p style={{color:C.textMuted,fontSize:13,margin:0}}>{hasEntries?"هذا الحساب مستخدم في قيود محاسبية — احذف القيود أولاً":"هل أنت متأكد؟ لا يمكن التراجع."}</p>
              </div>
              <div style={{background:hasEntries?"#FFFBEB":"#FEF2F2",border:`1px solid ${hasEntries?"#FDE68A":"#FECACA"}`,borderRadius:10,padding:14,marginBottom:20}}>
                <span style={{fontFamily:"monospace",fontWeight:700,color:C.navy,direction:"ltr",fontSize:14}}>{a?.code}</span>
                <span style={{marginRight:10,fontWeight:600,color:C.text,fontSize:13}}>{a?.name}</span>
              </div>
              <div style={{display:"flex",gap:10}}>
                {!hasEntries&&<button onClick={confirmDeleteAcc} style={{flex:1,padding:12,background:C.red,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>🗑 تأكيد الحذف</button>}
                <button onClick={()=>setDeleteAccId(null)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>{hasEntries?"حسناً":"إلغاء"}</button>
              </div>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}


// ══ SALES & CLIENTS ══
function Sales({canAdd,canEdit,canDelete,addAudit}){
  const [clients,setClients]=useState(INIT_CLIENTS);
  const [invoices,setInvoices]=useState(INIT_INVOICES);
  const [tab,setTab]=useState("invoices");
  const [showAddClient,setShowAddClient]=useState(false);
  const [showAddInv,setShowAddInv]=useState(false);
  const [clientForm,setClientForm]=useState({name:"",phone:"",address:"",notes:"",credit:""});
  const [invForm,setInvForm]=useState({invNo:"",date:todayISO(),clientId:"",desc:"",total:"",paid:""});
  const [payDlg,setPayDlg]=useState(null);
  const [payAmt,setPayAmt]=useState("");
  const [editClient,setEditClient]=useState(null);
  const [editClientForm,setEditClientForm]=useState({});

  const totalReceivable=invoices.filter(i=>i.status!=="مدفوعة").reduce((s,i)=>s+(i.total-i.paid),0);
  const totalSales=invoices.reduce((s,i)=>s+i.total,0);
  const totalCollected=invoices.reduce((s,i)=>s+i.paid,0);

  const clientName=id=>{const c=clients.find(c=>c.id===id);return c?c.name:"—";};

  const addClient=()=>{
    if(!clientForm.name.trim())return;
    const nc={id:Date.now(),...clientForm,credit:Number(clientForm.credit)||0};
    setClients(p=>[...p,nc]);
    addAudit("المبيعات","إضافة عميل",`${clientForm.name}`);
    setClientForm({name:"",phone:"",address:"",notes:"",credit:""});setShowAddClient(false);
  };
  const saveEditClient=()=>{
    setClients(p=>p.map(c=>c.id===editClient?{...c,...editClientForm,credit:Number(editClientForm.credit)||0}:c));
    addAudit("المبيعات","تعديل عميل",editClientForm.name);
    setEditClient(null);
  };
  const deleteClient=(id)=>{
    const c=clients.find(x=>x.id===id);
    setClients(p=>p.filter(x=>x.id!==id));
    addAudit("المبيعات","حذف عميل",c?.name);
  };

  const addInvoice=()=>{
    if(!invForm.clientId||!invForm.total)return;
    const tot=Number(invForm.total),paid=Number(invForm.paid)||0;
    const status=paid>=tot?"مدفوعة":paid>0?"جزئي":"غير مدفوعة";
    const inv={id:Date.now(),invNo:invForm.invNo||`INV-${String(invoices.length+1).padStart(3,"0")}`,date:invForm.date,clientId:Number(invForm.clientId),desc:invForm.desc,total:tot,paid,status};
    setInvoices(p=>[...p,inv]);
    addAudit("المبيعات","فاتورة جديدة",`${inv.invNo} — ${clientName(inv.clientId)} — ${fmt(tot)} ج.م`);
    setInvForm({invNo:"",date:todayISO(),clientId:"",desc:"",total:"",paid:""});setShowAddInv(false);
  };
  const collectPayment=()=>{
    const amt=Number(payAmt);if(!amt)return;
    setInvoices(p=>p.map(inv=>{
      if(inv.id!==payDlg)return inv;
      const newPaid=Math.min(inv.paid+amt,inv.total);
      const status=newPaid>=inv.total?"مدفوعة":newPaid>0?"جزئي":"غير مدفوعة";
      return{...inv,paid:newPaid,status};
    }));
    const inv=invoices.find(i=>i.id===payDlg);
    addAudit("المبيعات","تحصيل",`${inv?.invNo} — ${fmt(amt)} ج.م`);
    setPayDlg(null);setPayAmt("");
  };

  const stColor={مدفوعة:C.green,جزئي:C.orange,"غير مدفوعة":C.red};
  const stBg={مدفوعة:C.greenBg,جزئي:C.orangeBg,"غير مدفوعة":"#FEF2F2"};
  const TabBtn=({t,lbl})=><button onClick={()=>setTab(t)} style={{padding:"9px 18px",border:"none",borderBottom:tab===t?`3px solid ${C.red}`:"3px solid transparent",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:700,color:tab===t?C.red:C.textMuted}}>{lbl}</button>;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        {[{l:"إجمالي المبيعات",v:totalSales,i:"📈",c:"#1D4ED8",money:true},{l:"المحصّل",v:totalCollected,i:"💵",c:C.green,money:true},{l:"ذمم مستحقة",v:totalReceivable,i:"⏳",c:C.orange,money:true},{l:"عدد العملاء",v:clients.length,i:"👥",c:"#6D28D9",money:false}].map((k,i)=>(
          <Card key={i} style={{padding:18,borderTop:`4px solid ${k.c}`,textAlign:"center"}}>
            <div style={{fontSize:24}}>{k.i}</div>
            <div style={{fontSize:k.money?16:24,fontWeight:800,color:k.c,marginTop:6}}>{k.money?`${fmt(k.v)} ج.م`:k.v}</div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:3}}>{k.l}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`2px solid ${C.border}`,marginBottom:22}}>
        <div style={{display:"flex"}}>
          <TabBtn t="invoices" lbl="🧾 الفواتير"/>
          <TabBtn t="clients" lbl="👥 العملاء"/>
          <TabBtn t="receivables" lbl="📊 الذمم"/>
        </div>
        <div style={{display:"flex",gap:8,paddingBottom:4}}>
          {canAdd&&tab==="invoices"&&<button onClick={()=>setShowAddInv(true)} style={{background:C.red,color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ فاتورة جديدة</button>}
          {canAdd&&tab==="clients"&&<button onClick={()=>setShowAddClient(true)} style={{background:C.navy,color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ عميل جديد</button>}
        </div>
      </div>

      {tab==="invoices"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.offWhite}}>{["رقم الفاتورة","التاريخ","العميل","البيان","الإجمالي","المحصّل","المتبقي","الحالة",""].map((h,i)=>(
              <th key={i} style={{padding:"11px 13px",textAlign:i>=4&&i<=6?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
            ))}</tr></thead>
            <tbody>{invoices.length===0?<tr><td colSpan={9} style={{padding:40,textAlign:"center",color:C.textMuted}}>لا توجد فواتير</td></tr>:
              [...invoices].sort((a,b)=>b.date.localeCompare(a.date)).map((inv,i)=>{
                const rem=inv.total-inv.paid;
                return(
                  <tr key={inv.id} style={{background:i%2===0?C.white:C.offWhite}}>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:C.navy,fontFamily:"monospace",direction:"ltr"}}>{inv.invNo}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted,direction:"ltr"}}>{inv.date}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:600}}>{clientName(inv.clientId)}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,maxWidth:200,color:C.text}}>{inv.desc}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700}}>{fmt(inv.total)}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700,color:C.green}}>{fmt(inv.paid)}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700,color:rem>0?C.red:C.textMuted}}>{rem>0?fmt(rem):"—"}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}>
                      <span style={{background:stBg[inv.status],color:stColor[inv.status],borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{inv.status}</span>
                    </td>
                    <td style={{padding:"8px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                      {canEdit&&inv.status!=="مدفوعة"&&<button onClick={()=>{setPayDlg(inv.id);setPayAmt("");}} style={{background:C.greenBg,border:"1px solid #A7F3D0",color:C.green,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>تحصيل 💰</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab==="clients"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.offWhite}}>{["الاسم","الهاتف","العنوان","حد الائتمان","فواتيره","ملاحظات",""].map((h,i)=>(
              <th key={i} style={{padding:"11px 13px",textAlign:"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
            ))}</tr></thead>
            <tbody>{clients.map((c,i)=>{
              const cInvs=invoices.filter(inv=>inv.clientId===c.id);
              const cTotal=cInvs.reduce((s,inv)=>s+inv.total,0);
              return(
                <tr key={c.id} style={{background:i%2===0?C.white:C.offWhite}}>
                  {editClient===c.id?(
                    <td colSpan={7} style={{padding:14,border:`1px solid ${C.border}`}}>
                      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                        {[{k:"name",ph:"الاسم"},{k:"phone",ph:"الهاتف"},{k:"address",ph:"العنوان"},{k:"notes",ph:"ملاحظات"},{k:"credit",ph:"حد الائتمان",ltr:true}].map(f=>(
                          <input key={f.k} value={editClientForm[f.k]||""} onChange={e=>setEditClientForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                            style={{padding:"7px 10px",border:`1.5px solid ${C.border}`,borderRadius:7,fontSize:13,direction:f.ltr?"ltr":"rtl",minWidth:120}}/>
                        ))}
                        <button onClick={saveEditClient} style={{background:C.green,color:"white",border:"none",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontWeight:700,fontSize:13}}>حفظ</button>
                        <button onClick={()=>setEditClient(null)} style={{background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 12px",cursor:"pointer",fontSize:13}}>إلغاء</button>
                      </div>
                    </td>
                  ):(
                    <>
                      <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700}}>{c.name}</td>
                      <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,direction:"ltr",color:C.textMuted}}>{c.phone||"—"}</td>
                      <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted}}>{c.address||"—"}</td>
                      <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:600,color:"#6D28D9"}}>{c.credit?`${fmt(c.credit)} ج.م`:"—"}</td>
                      <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:"#1D4ED8"}}>{fmt(cTotal)} ج.م <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>({cInvs.length})</span></td>
                      <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted,fontSize:12}}>{c.notes||"—"}</td>
                      <td style={{padding:"8px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                        <div style={{display:"flex",gap:5,justifyContent:"center"}}>
                          {canEdit&&<button onClick={()=>{setEditClient(c.id);setEditClientForm({...c});}} style={{background:"#FFFBEB",border:"1px solid #FDE68A",color:C.orange,borderRadius:7,padding:"5px 9px",cursor:"pointer",fontSize:12,fontWeight:600}}>✏️</button>}
                          {canDelete&&<button onClick={()=>deleteClient(c.id)} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,borderRadius:7,padding:"5px 9px",cursor:"pointer",fontSize:12}}>🗑</button>}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}</tbody>
          </table>
        </Card>
      )}

      {tab==="receivables"&&(
        <div>
          <Card style={{padding:20,marginBottom:18}}>
            <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:16}}>📊 ملخص الذمم المدينة</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:C.offWhite}}>{["العميل","إجمالي الفواتير","المحصّل","ذمم مستحقة","الحالة"].map(h=>(
                <th key={h} style={{padding:"11px 13px",textAlign:"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
              ))}</tr></thead>
              <tbody>{clients.map((c,i)=>{
                const cInvs=invoices.filter(inv=>inv.clientId===c.id);
                const tot=cInvs.reduce((s,i)=>s+i.total,0);
                const paid=cInvs.reduce((s,i)=>s+i.paid,0);
                const rem=tot-paid;
                return(
                  <tr key={c.id} style={{background:i%2===0?C.white:C.offWhite}}>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700}}>{c.name}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:"#1D4ED8"}}>{fmt(tot)} ج.م</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:C.green}}>{fmt(paid)} ج.م</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:rem>0?C.red:C.textMuted}}>{rem>0?`${fmt(rem)} ج.م`:"✅ مسدد"}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}>
                      {tot===0?<span style={{color:C.textMuted,fontSize:12}}>لا فواتير</span>:
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1,background:C.offWhite,borderRadius:20,height:8,border:`1px solid ${C.border}`,minWidth:80}}>
                            <div style={{width:`${Math.min(100,Math.round((paid/tot)*100))}%`,background:paid>=tot?C.green:C.orange,height:"100%",borderRadius:20}}/>
                          </div>
                          <span style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>{Math.round((paid/tot)*100)}%</span>
                        </div>}
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[{l:"فواتير مدفوعة",v:invoices.filter(i=>i.status==="مدفوعة").length,i:"✅",c:C.green},{l:"فواتير جزئية",v:invoices.filter(i=>i.status==="جزئي").length,i:"⏳",c:C.orange},{l:"غير مدفوعة",v:invoices.filter(i=>i.status==="غير مدفوعة").length,i:"❌",c:C.red}].map((k,i)=>(
              <Card key={i} style={{padding:18,borderTop:`4px solid ${k.c}`,textAlign:"center"}}>
                <div style={{fontSize:26}}>{k.i}</div>
                <div style={{fontSize:24,fontWeight:800,color:k.c,marginTop:6}}>{k.v}</div>
                <div style={{fontSize:12,color:C.textMuted,marginTop:3}}>{k.l}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Invoice */}
      {showAddInv&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:480,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:20,fontSize:17}}>🧾 فاتورة مبيعات جديدة</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>رقم الفاتورة</label>
                <input value={invForm.invNo} onChange={e=>setInvForm(p=>({...p,invNo:e.target.value}))} placeholder={`INV-${String(invoices.length+1).padStart(3,"0")}`}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr",fontFamily:"monospace"}}/></div>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>التاريخ</label>
                <input type="date" value={invForm.date} onChange={e=>setInvForm(p=>({...p,date:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/></div>
            </div>
            <div style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>العميل *</label>
              <select value={invForm.clientId} onChange={e=>setInvForm(p=>({...p,clientId:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13}}>
                <option value="">— اختر العميل —</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>البيان</label>
              <input value={invForm.desc} onChange={e=>setInvForm(p=>({...p,desc:e.target.value}))} placeholder="مثال: خرسانة جاهزة — 50 م³"
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>الإجمالي (ج.م) *</label>
                <input type="number" value={invForm.total} onChange={e=>setInvForm(p=>({...p,total:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/></div>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>المقبوض (ج.م)</label>
                <input type="number" value={invForm.paid} onChange={e=>setInvForm(p=>({...p,paid:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={addInvoice} style={{flex:1,padding:12,background:C.red,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>إصدار الفاتورة</button>
              <button onClick={()=>setShowAddInv(false)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Add Client */}
      {showAddClient&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:420,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:20,fontSize:17}}>👤 عميل جديد</h3>
            {[{l:"الاسم *",k:"name",t:"text"},{l:"الهاتف",k:"phone",t:"text",ltr:true},{l:"العنوان",k:"address",t:"text"},{l:"حد الائتمان (ج.م)",k:"credit",t:"number",ltr:true},{l:"ملاحظات",k:"notes",t:"text"}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>{f.l}</label>
                <input type={f.t} value={clientForm[f.k]} onChange={e=>setClientForm(p=>({...p,[f.k]:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:f.ltr?"ltr":"rtl"}}/></div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={addClient} style={{flex:1,padding:12,background:C.navy,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>إضافة</button>
              <button onClick={()=>setShowAddClient(false)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Collect Payment */}
      {payDlg&&(()=>{const inv=invoices.find(i=>i.id===payDlg);return inv?(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:380,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:16,fontSize:16}}>💰 تسجيل تحصيل</h3>
            <div style={{background:C.offWhite,borderRadius:9,padding:14,marginBottom:18,border:`1px solid ${C.border}`}}>
              <div style={{fontWeight:700,color:C.navy,fontFamily:"monospace",direction:"ltr"}}>{inv.invNo}</div>
              <div style={{fontWeight:600,marginTop:4}}>{clientName(inv.clientId)}</div>
              <div style={{fontSize:13,color:C.textMuted,marginTop:4}}>المتبقي: <b style={{color:C.red}}>{fmt(inv.total-inv.paid)} ج.م</b></div>
            </div>
            <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:6}}>المبلغ المحصّل (ج.م)</label>
            <input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} max={inv.total-inv.paid}
              style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,marginBottom:18,boxSizing:"border-box",direction:"ltr"}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={collectPayment} style={{flex:1,padding:12,background:C.green,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>تسجيل التحصيل</button>
              <button onClick={()=>setPayDlg(null)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      ):null;})()}
    </div>
  );
}

// ══ SUPPLIERS ══
function Suppliers({canAdd,canEdit,canDelete,addAudit}){
  const [suppliers,setSuppliers]=useState(INIT_SUPPLIERS);
  const [purchases,setPurchases]=useState(INIT_PURCHASES);
  const [tab,setTab]=useState("purchases");
  const [showAddSup,setShowAddSup]=useState(false);
  const [showAddPO,setShowAddPO]=useState(false);
  const [supForm,setSupForm]=useState({name:"",phone:"",category:"",notes:""});
  const [poForm,setPoForm]=useState({poNo:"",date:todayISO(),supplierId:"",desc:"",total:"",paid:""});
  const [payDlg,setPayDlg]=useState(null);
  const [payAmt,setPayAmt]=useState("");

  const totalPayable=purchases.filter(p=>p.status!=="مدفوعة").reduce((s,p)=>s+(p.total-p.paid),0);
  const totalPurchases=purchases.reduce((s,p)=>s+p.total,0);
  const supName=id=>{const s=suppliers.find(s=>s.id===id);return s?s.name:"—";};

  const addSupplier=()=>{
    if(!supForm.name.trim())return;
    setSuppliers(p=>[...p,{id:Date.now(),...supForm}]);
    addAudit("الموردون","إضافة مورد",supForm.name);
    setSupForm({name:"",phone:"",category:"",notes:""});setShowAddSup(false);
  };
  const addPO=()=>{
    if(!poForm.supplierId||!poForm.total)return;
    const tot=Number(poForm.total),paid=Number(poForm.paid)||0;
    const status=paid>=tot?"مدفوعة":paid>0?"جزئي":"غير مدفوعة";
    const po={id:Date.now(),poNo:poForm.poNo||`PO-${String(purchases.length+1).padStart(3,"0")}`,date:poForm.date,supplierId:Number(poForm.supplierId),desc:poForm.desc,total:tot,paid,status};
    setPurchases(p=>[...p,po]);
    addAudit("الموردون","فاتورة شراء",`${po.poNo} — ${supName(po.supplierId)} — ${fmt(tot)} ج.م`);
    setPoForm({poNo:"",date:todayISO(),supplierId:"",desc:"",total:"",paid:""});setShowAddPO(false);
  };
  const paySupplier=()=>{
    const amt=Number(payAmt);if(!amt)return;
    setPurchases(p=>p.map(po=>{
      if(po.id!==payDlg)return po;
      const newPaid=Math.min(po.paid+amt,po.total);
      return{...po,paid:newPaid,status:newPaid>=po.total?"مدفوعة":newPaid>0?"جزئي":"غير مدفوعة"};
    }));
    const po=purchases.find(p=>p.id===payDlg);
    addAudit("الموردون","دفع مورد",`${po?.poNo} — ${fmt(amt)} ج.م`);
    setPayDlg(null);setPayAmt("");
  };

  const stColor={مدفوعة:C.green,جزئي:C.orange,"غير مدفوعة":C.red};
  const stBg={مدفوعة:C.greenBg,جزئي:C.orangeBg,"غير مدفوعة":"#FEF2F2"};
  const TabBtn=({t,lbl})=><button onClick={()=>setTab(t)} style={{padding:"9px 18px",border:"none",borderBottom:tab===t?`3px solid ${C.red}`:"3px solid transparent",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:700,color:tab===t?C.red:C.textMuted}}>{lbl}</button>;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        {[{l:"إجمالي المشتريات",v:totalPurchases,i:"📦",c:"#1D4ED8",money:true},{l:"ذمم موردين",v:totalPayable,i:"⏳",c:C.orange,money:true},{l:"عدد الموردين",v:suppliers.length,i:"🏭",c:"#6D28D9",money:false},{l:"فواتير غير مسددة",v:purchases.filter(p=>p.status!=="مدفوعة").length,i:"❌",c:C.red,money:false}].map((k,i)=>(
          <Card key={i} style={{padding:18,borderTop:`4px solid ${k.c}`,textAlign:"center"}}>
            <div style={{fontSize:24}}>{k.i}</div>
            <div style={{fontSize:k.money?16:24,fontWeight:800,color:k.c,marginTop:6}}>{k.money?`${fmt(k.v)} ج.م`:k.v}</div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:3}}>{k.l}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`2px solid ${C.border}`,marginBottom:22}}>
        <div style={{display:"flex"}}>
          <TabBtn t="purchases" lbl="📄 فواتير الشراء"/>
          <TabBtn t="suppliers_list" lbl="🏭 الموردون"/>
          <TabBtn t="payables" lbl="📊 الذمم الدائنة"/>
        </div>
        <div style={{display:"flex",gap:8,paddingBottom:4}}>
          {canAdd&&tab==="purchases"&&<button onClick={()=>setShowAddPO(true)} style={{background:C.red,color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ فاتورة شراء</button>}
          {canAdd&&tab==="suppliers_list"&&<button onClick={()=>setShowAddSup(true)} style={{background:C.navy,color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ مورد جديد</button>}
        </div>
      </div>

      {tab==="purchases"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.offWhite}}>{["رقم الأمر","التاريخ","المورد","البيان","الإجمالي","المدفوع","المتبقي","الحالة",""].map((h,i)=>(
              <th key={i} style={{padding:"11px 13px",textAlign:i>=4&&i<=6?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
            ))}</tr></thead>
            <tbody>{[...purchases].sort((a,b)=>b.date.localeCompare(a.date)).map((po,i)=>{
              const rem=po.total-po.paid;
              return(
                <tr key={po.id} style={{background:i%2===0?C.white:C.offWhite}}>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:C.navy,fontFamily:"monospace",direction:"ltr"}}>{po.poNo}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted,direction:"ltr"}}>{po.date}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:600}}>{supName(po.supplierId)}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}>{po.desc}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700}}>{fmt(po.total)}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700,color:C.green}}>{fmt(po.paid)}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:700,color:rem>0?C.red:C.textMuted}}>{rem>0?fmt(rem):"—"}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}>
                    <span style={{background:stBg[po.status],color:stColor[po.status],borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{po.status}</span>
                  </td>
                  <td style={{padding:"8px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                    {canEdit&&po.status!=="مدفوعة"&&<button onClick={()=>{setPayDlg(po.id);setPayAmt("");}} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>دفع 💳</button>}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </Card>
      )}

      {tab==="suppliers_list"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.offWhite}}>{["اسم المورد","الهاتف","التصنيف","إجمالي مشترياته","ملاحظات"].map(h=>(
              <th key={h} style={{padding:"11px 13px",textAlign:"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
            ))}</tr></thead>
            <tbody>{suppliers.map((s,i)=>{
              const sPos=purchases.filter(p=>p.supplierId===s.id);
              const sTotal=sPos.reduce((sum,p)=>sum+p.total,0);
              return(
                <tr key={s.id} style={{background:i%2===0?C.white:C.offWhite}}>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700}}>{s.name}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,direction:"ltr",color:C.textMuted}}>{s.phone||"—"}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}><span style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{s.category||"—"}</span></td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:"#1D4ED8"}}>{fmt(sTotal)} ج.م <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>({sPos.length})</span></td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted,fontSize:12}}>{s.notes||"—"}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </Card>
      )}

      {tab==="payables"&&(
        <div>
          <Card style={{padding:20,marginBottom:18}}>
            <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:16}}>📊 ملخص الذمم الدائنة</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:C.offWhite}}>{["المورد","إجمالي المشتريات","المدفوع","المتبقي","نسبة السداد"].map(h=>(
                <th key={h} style={{padding:"11px 13px",textAlign:"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
              ))}</tr></thead>
              <tbody>{suppliers.map((s,i)=>{
                const sPos=purchases.filter(p=>p.supplierId===s.id);
                const tot=sPos.reduce((sum,p)=>sum+p.total,0);
                const paid=sPos.reduce((sum,p)=>sum+p.paid,0);
                const rem=tot-paid;
                return(
                  <tr key={s.id} style={{background:i%2===0?C.white:C.offWhite}}>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700}}>{s.name}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:"#1D4ED8"}}>{fmt(tot)} ج.م</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:C.green}}>{fmt(paid)} ج.م</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:rem>0?C.red:C.textMuted}}>{rem>0?`${fmt(rem)} ج.م`:"✅ مسدد"}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}>
                      {tot>0&&<div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,background:C.offWhite,borderRadius:20,height:8,border:`1px solid ${C.border}`,minWidth:80}}>
                          <div style={{width:`${Math.min(100,Math.round((paid/tot)*100))}%`,background:paid>=tot?C.green:C.orange,height:"100%",borderRadius:20}}/>
                        </div>
                        <span style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>{Math.round((paid/tot)*100)}%</span>
                      </div>}
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </Card>
        </div>
      )}

      {showAddSup&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:400,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:20,fontSize:17}}>🏭 مورد جديد</h3>
            {[{l:"الاسم *",k:"name",t:"text"},{l:"الهاتف",k:"phone",t:"text",ltr:true},{l:"التصنيف",k:"category",t:"text"},{l:"ملاحظات",k:"notes",t:"text"}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>{f.l}</label>
                <input type={f.t} value={supForm[f.k]} onChange={e=>setSupForm(p=>({...p,[f.k]:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:f.ltr?"ltr":"rtl"}}/></div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={addSupplier} style={{flex:1,padding:12,background:C.navy,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>إضافة</button>
              <button onClick={()=>setShowAddSup(false)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {showAddPO&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:480,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:20,fontSize:17}}>📦 فاتورة شراء جديدة</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>رقم الأمر</label>
                <input value={poForm.poNo} onChange={e=>setPoForm(p=>({...p,poNo:e.target.value}))} placeholder={`PO-${String(purchases.length+1).padStart(3,"0")}`}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr",fontFamily:"monospace"}}/></div>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>التاريخ</label>
                <input type="date" value={poForm.date} onChange={e=>setPoForm(p=>({...p,date:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/></div>
            </div>
            <div style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>المورد *</label>
              <select value={poForm.supplierId} onChange={e=>setPoForm(p=>({...p,supplierId:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13}}>
                <option value="">— اختر المورد —</option>
                {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
            <div style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>البيان</label>
              <input value={poForm.desc} onChange={e=>setPoForm(p=>({...p,desc:e.target.value}))}
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>الإجمالي (ج.م) *</label>
                <input type="number" value={poForm.total} onChange={e=>setPoForm(p=>({...p,total:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/></div>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>المدفوع (ج.م)</label>
                <input type="number" value={poForm.paid} onChange={e=>setPoForm(p=>({...p,paid:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={addPO} style={{flex:1,padding:12,background:C.red,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>تسجيل الفاتورة</button>
              <button onClick={()=>setShowAddPO(false)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {payDlg&&(()=>{const po=purchases.find(p=>p.id===payDlg);return po?(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:380,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:16,fontSize:16}}>💳 دفع للمورد</h3>
            <div style={{background:"#FEF2F2",borderRadius:9,padding:14,marginBottom:18,border:"1px solid #FECACA"}}>
              <div style={{fontWeight:700,color:C.navy,fontFamily:"monospace",direction:"ltr"}}>{po.poNo}</div>
              <div style={{fontWeight:600,marginTop:4}}>{supName(po.supplierId)}</div>
              <div style={{fontSize:13,color:C.textMuted,marginTop:4}}>المتبقي: <b style={{color:C.red}}>{fmt(po.total-po.paid)} ج.م</b></div>
            </div>
            <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:6}}>المبلغ المدفوع (ج.م)</label>
            <input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} max={po.total-po.paid}
              style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,marginBottom:18,boxSizing:"border-box",direction:"ltr"}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={paySupplier} style={{flex:1,padding:12,background:C.red,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>تسجيل الدفع</button>
              <button onClick={()=>setPayDlg(null)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      ):null;})()}
    </div>
  );
}

// ══ INVENTORY ══
function Inventory({canAdd,canEdit,canDelete,addAudit}){
  const [products,setProducts]=useState(INIT_PRODUCTS);
  const [movements,setMovements]=useState(INIT_MOVEMENTS);
  const [tab,setTab]=useState("products");
  const [showAddProd,setShowAddProd]=useState(false);
  const [showAddMove,setShowAddMove]=useState(false);
  const [prodForm,setProdForm]=useState({name:"",unit:"",stock:"",minStock:"",costPrice:"",salePrice:"",category:""});
  const [moveForm,setMoveForm]=useState({date:todayISO(),productId:"",type:"وارد",qty:"",note:"",ref:""});

  const lowStock=products.filter(p=>p.stock<=p.minStock);
  const totalValue=products.reduce((s,p)=>s+p.stock*p.costPrice,0);
  const prodName=id=>{const p=products.find(p=>p.id===id);return p?p.name:"—";};
  const prodUnit=id=>{const p=products.find(p=>p.id===id);return p?p.unit:"";};

  const addProduct=()=>{
    if(!prodForm.name.trim())return;
    const np={id:Date.now(),...prodForm,stock:Number(prodForm.stock)||0,minStock:Number(prodForm.minStock)||0,costPrice:Number(prodForm.costPrice)||0,salePrice:Number(prodForm.salePrice)||0};
    setProducts(p=>[...p,np]);
    addAudit("المخزون","إضافة صنف",prodForm.name);
    setProdForm({name:"",unit:"",stock:"",minStock:"",costPrice:"",salePrice:"",category:""});setShowAddProd(false);
  };
  const addMovement=()=>{
    if(!moveForm.productId||!moveForm.qty)return;
    const qty=Number(moveForm.qty);
    const nm={id:Date.now(),...moveForm,productId:Number(moveForm.productId),qty};
    setMovements(p=>[nm,...p]);
    setProducts(p=>p.map(pr=>pr.id===nm.productId?{...pr,stock:Math.max(0,pr.stock+(nm.type==="وارد"?qty:-qty))}:pr));
    addAudit("المخزون",nm.type==="وارد"?"وارد مخزون":"صادر مخزون",`${prodName(nm.productId)} — ${qty} ${prodUnit(nm.productId)}`);
    setMoveForm({date:todayISO(),productId:"",type:"وارد",qty:"",note:"",ref:""});setShowAddMove(false);
  };

  const TabBtn=({t,lbl,badge})=><button onClick={()=>setTab(t)} style={{padding:"9px 18px",border:"none",borderBottom:tab===t?`3px solid ${C.red}`:"3px solid transparent",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:700,color:tab===t?C.red:C.textMuted}}>
    {lbl}{badge>0&&<span style={{marginRight:6,background:C.red,color:"white",borderRadius:20,padding:"1px 7px",fontSize:11}}>{badge}</span>}
  </button>;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        {[{l:"عدد الأصناف",v:products.length,i:"📦",c:"#1D4ED8",money:false},{l:"قيمة المخزون",v:totalValue,i:"💰",c:C.green,money:true},{l:"أصناف تحت الحد",v:lowStock.length,i:"⚠️",c:C.red,money:false},{l:"حركات هذا الشهر",v:movements.length,i:"🔄",c:"#6D28D9",money:false}].map((k,i)=>(
          <Card key={i} style={{padding:18,borderTop:`4px solid ${k.c}`,textAlign:"center"}}>
            <div style={{fontSize:24}}>{k.i}</div>
            <div style={{fontSize:k.money?15:24,fontWeight:800,color:k.c,marginTop:6}}>{k.money?`${fmt(k.v)} ج.م`:k.v}</div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:3}}>{k.l}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`2px solid ${C.border}`,marginBottom:22}}>
        <div style={{display:"flex"}}>
          <TabBtn t="products" lbl="📦 الأصناف"/>
          <TabBtn t="movements" lbl="🔄 الحركات"/>
          <TabBtn t="alerts" lbl="⚠️ تنبيهات المخزون" badge={lowStock.length}/>
        </div>
        <div style={{display:"flex",gap:8,paddingBottom:4}}>
          {canAdd&&tab==="products"&&<button onClick={()=>setShowAddProd(true)} style={{background:C.navy,color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ صنف جديد</button>}
          {canAdd&&tab==="movements"&&<button onClick={()=>setShowAddMove(true)} style={{background:"#6D28D9",color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ حركة مخزون</button>}
        </div>
      </div>

      {tab==="products"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.offWhite}}>{["الصنف","الوحدة","الفئة","الرصيد الحالي","الحد الأدنى","سعر التكلفة","سعر البيع","الحالة"].map((h,i)=>(
              <th key={i} style={{padding:"11px 13px",textAlign:i>=3&&i<=6?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
            ))}</tr></thead>
            <tbody>{products.map((p,i)=>{
              const isLow=p.stock<=p.minStock;
              return(
                <tr key={p.id} style={{background:isLow?"#FFF7F7":i%2===0?C.white:C.offWhite}}>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700}}>{p.name}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted}}>{p.unit}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}><span style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{p.category||"—"}</span></td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:800,fontSize:15,color:isLow?C.red:"#1D4ED8"}}>{fmt(p.stock)}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",color:C.textMuted}}>{fmt(p.minStock)}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",color:C.textMuted}}>{fmt(p.costPrice)} ج.م</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:600,color:C.green}}>{fmt(p.salePrice)} ج.م</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}>
                    <span style={{background:isLow?"#FEF2F2":C.greenBg,color:isLow?C.red:C.green,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{isLow?"⚠️ تحت الحد":"✅ طبيعي"}</span>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </Card>
      )}

      {tab==="movements"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.offWhite}}>{["التاريخ","الصنف","النوع","الكمية","الوحدة","مرجع","الملاحظة"].map((h,i)=>(
              <th key={i} style={{padding:"11px 13px",textAlign:i===2||i===3?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
            ))}</tr></thead>
            <tbody>{movements.length===0?<tr><td colSpan={7} style={{padding:40,textAlign:"center",color:C.textMuted}}>لا توجد حركات</td></tr>:
              movements.map((m,i)=>(
                <tr key={m.id} style={{background:i%2===0?C.white:C.offWhite}}>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted,direction:"ltr"}}>{m.date}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:600}}>{prodName(m.productId)}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                    <span style={{background:m.type==="وارد"?"#EFF6FF":"#FEF2F2",color:m.type==="وارد"?"#1D4ED8":C.red,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{m.type==="وارد"?"⬇ وارد":"⬆ صادر"}</span>
                  </td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:800,fontSize:14,color:m.type==="وارد"?"#1D4ED8":C.red}}>{m.type==="وارد"?"+":"-"}{fmt(m.qty)}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted}}>{prodUnit(m.productId)}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontFamily:"monospace",fontSize:12,color:C.navy,direction:"ltr"}}>{m.ref||"—"}</td>
                  <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted,fontSize:12}}>{m.note||"—"}</td>
                </tr>
              ))
            }</tbody>
          </table>
        </Card>
      )}

      {tab==="alerts"&&(
        <div>
          {lowStock.length===0?(
            <div style={{textAlign:"center",padding:"60px 40px",color:C.textMuted}}>
              <div style={{fontSize:64}}>✅</div>
              <h3 style={{color:C.text,marginTop:16,fontSize:18}}>المخزون بخير</h3>
              <p>لا توجد أصناف تحت الحد الأدنى</p>
            </div>
          ):(
            <div>
              <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:24}}>⚠️</span>
                <div><div style={{fontWeight:700,color:C.red,fontSize:14}}>{lowStock.length} أصناف تحت الحد الأدنى</div>
                  <div style={{fontSize:12,color:"#B91C1C",marginTop:2}}>يجب إعادة الطلب في أقرب وقت</div></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
                {lowStock.map(p=>(
                  <Card key={p.id} style={{padding:20,borderRight:`5px solid ${C.red}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div>
                        <div style={{fontWeight:700,color:C.text,fontSize:15}}>{p.name}</div>
                        <div style={{fontSize:12,color:C.textMuted,marginTop:3}}>{p.category} — {p.unit}</div>
                      </div>
                      <span style={{background:"#FEF2F2",color:C.red,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700}}>⚠️ تنبيه</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div style={{background:"#FEF2F2",borderRadius:8,padding:"10px 14px",textAlign:"center",border:"1px solid #FECACA"}}>
                        <div style={{fontSize:11,color:C.textMuted}}>الرصيد الحالي</div>
                        <div style={{fontSize:22,fontWeight:800,color:C.red,marginTop:2}}>{fmt(p.stock)}</div>
                        <div style={{fontSize:11,color:C.textMuted}}>{p.unit}</div>
                      </div>
                      <div style={{background:C.offWhite,borderRadius:8,padding:"10px 14px",textAlign:"center",border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:11,color:C.textMuted}}>الحد الأدنى</div>
                        <div style={{fontSize:22,fontWeight:800,color:C.orange,marginTop:2}}>{fmt(p.minStock)}</div>
                        <div style={{fontSize:11,color:C.textMuted}}>{p.unit}</div>
                      </div>
                    </div>
                    <div style={{marginTop:12,background:C.offWhite,borderRadius:8,height:10,border:`1px solid ${C.border}`}}>
                      <div style={{width:`${Math.min(100,Math.round((p.stock/p.minStock)*100))}%`,background:C.red,height:"100%",borderRadius:8}}/>
                    </div>
                    <div style={{fontSize:11,color:C.textMuted,marginTop:4,textAlign:"center"}}>{Math.round((p.stock/p.minStock)*100)}% من الحد الأدنى</div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAddProd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:480,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:20,fontSize:17}}>📦 صنف مخزون جديد</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              {[{l:"اسم الصنف *",k:"name",t:"text",full:true},{l:"الوحدة",k:"unit",t:"text"},{l:"الفئة",k:"category",t:"text"},{l:"الرصيد الافتتاحي",k:"stock",t:"number",ltr:true},{l:"الحد الأدنى",k:"minStock",t:"number",ltr:true},{l:"سعر التكلفة",k:"costPrice",t:"number",ltr:true},{l:"سعر البيع",k:"salePrice",t:"number",ltr:true}].map(f=>(
                <div key={f.k} style={{gridColumn:f.full?"span 2":"auto"}}>
                  <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>{f.l}</label>
                  <input type={f.t} value={prodForm[f.k]} onChange={e=>setProdForm(p=>({...p,[f.k]:e.target.value}))}
                    style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:f.ltr?"ltr":"rtl"}}/>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={addProduct} style={{flex:1,padding:12,background:C.navy,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>إضافة</button>
              <button onClick={()=>setShowAddProd(false)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {showAddMove&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:440,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:20,fontSize:17}}>🔄 حركة مخزون</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>التاريخ</label>
                <input type="date" value={moveForm.date} onChange={e=>setMoveForm(p=>({...p,date:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/></div>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>نوع الحركة</label>
                <select value={moveForm.type} onChange={e=>setMoveForm(p=>({...p,type:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,background:moveForm.type==="وارد"?"#EFF6FF":"#FEF2F2",color:moveForm.type==="وارد"?"#1D4ED8":C.red,fontWeight:700}}>
                  <option value="وارد">⬇ وارد</option><option value="صادر">⬆ صادر</option>
                </select></div>
            </div>
            <div style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>الصنف *</label>
              <select value={moveForm.productId} onChange={e=>setMoveForm(p=>({...p,productId:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13}}>
                <option value="">— اختر الصنف —</option>
                {products.map(p=><option key={p.id} value={p.id}>{p.name} (رصيد: {fmt(p.stock)} {p.unit})</option>)}
              </select></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>الكمية *</label>
                <input type="number" min="1" value={moveForm.qty} onChange={e=>setMoveForm(p=>({...p,qty:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr"}}/></div>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>رقم المرجع</label>
                <input value={moveForm.ref} onChange={e=>setMoveForm(p=>({...p,ref:e.target.value}))} placeholder="INV-xxx / PO-xxx"
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:"ltr",fontFamily:"monospace"}}/></div>
            </div>
            <div style={{marginBottom:18}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>الملاحظة</label>
              <input value={moveForm.note} onChange={e=>setMoveForm(p=>({...p,note:e.target.value}))}
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/></div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={addMovement} style={{flex:1,padding:12,background:"#6D28D9",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>تسجيل الحركة</button>
              <button onClick={()=>setShowAddMove(false)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ══ HR / PAYROLL ══
function HR({canAdd,canEdit,canDelete,addAudit}){
  const [employees,setEmployees]=useState(INIT_EMPLOYEES);
  const [payroll,setPayroll]=useState(INIT_PAYROLL);
  const [tab,setTab]=useState("employees");
  const [showAddEmp,setShowAddEmp]=useState(false);
  const [showPayDlg,setShowPayDlg]=useState(null);
  const [empForm,setEmpForm]=useState({name:"",position:"",dept:"",baseSalary:"",startDate:todayISO()});
  const [payForm,setPayForm]=useState({bonus:"",deduct:"",note:""});
  const [selMonth,setSelMonth]=useState("2026-05");

  const activeEmps=employees.filter(e=>e.status==="active");
  const monthPayroll=payroll.filter(p=>p.month===selMonth);
  const totalNet=monthPayroll.reduce((s,p)=>s+p.net,0);
  const totalPaid=monthPayroll.filter(p=>p.paid).reduce((s,p)=>s+p.net,0);
  const empName=id=>{const e=employees.find(e=>e.id===id);return e?e.name:"—";};
  const empPos=id=>{const e=employees.find(e=>e.id===id);return e?e.position:"—";};

  const addEmployee=()=>{
    if(!empForm.name.trim())return;
    const ne={id:Date.now(),...empForm,baseSalary:Number(empForm.baseSalary)||0,status:"active"};
    setEmployees(p=>[...p,ne]);
    addAudit("الموارد البشرية","إضافة موظف",empForm.name);
    setEmpForm({name:"",position:"",dept:"",baseSalary:"",startDate:todayISO()});setShowAddEmp(false);
  };
  const generateMonthPayroll=()=>{
    const exists=payroll.some(p=>p.month===selMonth);
    if(exists){alert("تم توليد كشف الراتب لهذا الشهر مسبقاً");return;}
    const newPayroll=activeEmps.map(e=>({id:Date.now()+e.id,month:selMonth,empId:e.id,base:e.baseSalary,bonus:0,deduct:0,net:e.baseSalary,paid:false}));
    setPayroll(p=>[...p,...newPayroll]);
    addAudit("الموارد البشرية","توليد كشف راتب",`شهر ${selMonth} — ${newPayroll.length} موظف`);
  };
  const markPaid=(prId)=>{
    const pr=payroll.find(p=>p.id===prId);
    setPayroll(p=>p.map(x=>x.id===prId?{...x,paid:true}:x));
    addAudit("الموارد البشرية","صرف راتب",`${empName(pr?.empId)} — ${fmt(pr?.net)} ج.م`);
  };
  const savePayAdjust=()=>{
    const pr=payroll.find(p=>p.id===showPayDlg);if(!pr)return;
    const bonus=Number(payForm.bonus)||0,deduct=Number(payForm.deduct)||0;
    const net=pr.base+bonus-deduct;
    setPayroll(p=>p.map(x=>x.id===showPayDlg?{...x,bonus,deduct,net}:x));
    addAudit("الموارد البشرية","تعديل راتب",`${empName(pr.empId)} — مكافأة: ${fmt(bonus)} — خصم: ${fmt(deduct)} — الصافي: ${fmt(net)} ج.م`);
    setShowPayDlg(null);setPayForm({bonus:"",deduct:"",note:""});
  };

  const TabBtn=({t,lbl})=><button onClick={()=>setTab(t)} style={{padding:"9px 18px",border:"none",borderBottom:tab===t?`3px solid ${C.red}`:"3px solid transparent",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:700,color:tab===t?C.red:C.textMuted}}>{lbl}</button>;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        {[{l:"الموظفون النشطون",v:activeEmps.length,i:"👥",c:"#1D4ED8",money:false},{l:"إجمالي الرواتب",v:activeEmps.reduce((s,e)=>s+e.baseSalary,0),i:"💰",c:"#6D28D9",money:true},{l:"مصروف هذا الشهر",v:totalNet,i:"📅",c:C.green,money:true},{l:"مصروف غير مدفوع",v:totalNet-totalPaid,i:"⏳",c:C.orange,money:true}].map((k,i)=>(
          <Card key={i} style={{padding:18,borderTop:`4px solid ${k.c}`,textAlign:"center"}}>
            <div style={{fontSize:24}}>{k.i}</div>
            <div style={{fontSize:k.money?15:24,fontWeight:800,color:k.c,marginTop:6}}>{k.money?`${fmt(k.v)} ج.م`:k.v}</div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:3}}>{k.l}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`2px solid ${C.border}`,marginBottom:22}}>
        <div style={{display:"flex"}}>
          <TabBtn t="employees" lbl="👥 الموظفون"/>
          <TabBtn t="payroll" lbl="💰 كشف الراتب"/>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",paddingBottom:4}}>
          {tab==="payroll"&&(
            <>
              <input type="month" value={selMonth} onChange={e=>setSelMonth(e.target.value)} style={{padding:"8px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,direction:"ltr"}}/>
              {canAdd&&<button onClick={generateMonthPayroll} style={{background:"#6D28D9",color:"white",border:"none",borderRadius:9,padding:"9px 16px",cursor:"pointer",fontSize:13,fontWeight:700}}>توليد الكشف</button>}
            </>
          )}
          {canAdd&&tab==="employees"&&<button onClick={()=>setShowAddEmp(true)} style={{background:C.navy,color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>+ موظف جديد</button>}
        </div>
      </div>

      {tab==="employees"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.offWhite}}>{["الموظف","المسمى الوظيفي","القسم","الراتب الأساسي","تاريخ التعيين","الحالة"].map(h=>(
              <th key={h} style={{padding:"11px 13px",textAlign:"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
            ))}</tr></thead>
            <tbody>{employees.map((e,i)=>(
              <tr key={e.id} style={{background:i%2===0?C.white:C.offWhite}}>
                <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,background:`linear-gradient(135deg,${C.red},${C.navy})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white",flexShrink:0}}>{e.name[0]}</div>
                    <span style={{fontWeight:700}}>{e.name}</span>
                  </div>
                </td>
                <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted}}>{e.position}</td>
                <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}><span style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{e.dept}</span></td>
                <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700,color:"#6D28D9",fontSize:14}}>{fmt(e.baseSalary)} ج.م</td>
                <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted,direction:"ltr"}}>{e.startDate}</td>
                <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}>
                  <span style={{background:C.greenBg,color:C.green,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>✅ نشط</span>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      )}

      {tab==="payroll"&&(
        monthPayroll.length===0?(
          <div style={{textAlign:"center",padding:"60px 40px",color:C.textMuted}}>
            <div style={{fontSize:64}}>📋</div>
            <h3 style={{color:C.text,marginTop:16,fontSize:18}}>لا يوجد كشف راتب لهذا الشهر</h3>
            <p>اضغط "توليد الكشف" لإنشاء كشف راتب الشهر المحدد</p>
          </div>
        ):(
          <div>
            <div style={{display:"flex",gap:14,marginBottom:20}}>
              {[{l:"إجمالي الراتب الأساسي",v:monthPayroll.reduce((s,p)=>s+p.base,0),c:"#6D28D9"},{l:"إجمالي المكافآت",v:monthPayroll.reduce((s,p)=>s+p.bonus,0),c:C.green},{l:"إجمالي الخصومات",v:monthPayroll.reduce((s,p)=>s+p.deduct,0),c:C.red},{l:"إجمالي الصافي",v:totalNet,c:C.navy}].map((k,i)=>(
                <Card key={i} style={{flex:1,padding:16,textAlign:"center",borderTop:`4px solid ${k.c}`}}>
                  <div style={{fontSize:11,color:C.textMuted,marginBottom:4}}>{k.l}</div>
                  <div style={{fontSize:16,fontWeight:800,color:k.c}}>{fmt(k.v)} ج.م</div>
                </Card>
              ))}
            </div>
            <Card style={{padding:0,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:C.offWhite}}>{["الموظف","المسمى","الأساسي","مكافأة","خصم","الصافي","الحالة",""].map((h,i)=>(
                  <th key={i} style={{padding:"11px 13px",textAlign:i>=2&&i<=5?"center":"right",border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:700,fontSize:12}}>{h}</th>
                ))}</tr></thead>
                <tbody>{monthPayroll.map((pr,i)=>(
                  <tr key={pr.id} style={{background:i%2===0?C.white:C.offWhite}}>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,fontWeight:700}}>{empName(pr.empId)}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,color:C.textMuted,fontSize:12}}>{empPos(pr.empId)}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:600}}>{fmt(pr.base)}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",color:C.green,fontWeight:600}}>{pr.bonus>0?`+${fmt(pr.bonus)}`:"—"}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",color:C.red,fontWeight:600}}>{pr.deduct>0?`-${fmt(pr.deduct)}`:"—"}</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`,textAlign:"center",fontWeight:800,fontSize:14,color:"#6D28D9"}}>{fmt(pr.net)} ج.م</td>
                    <td style={{padding:"10px 13px",border:`1px solid ${C.border}`}}>
                      <span style={{background:pr.paid?C.greenBg:"#FEF2F2",color:pr.paid?C.green:C.red,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{pr.paid?"✅ مصروف":"⏳ معلق"}</span>
                    </td>
                    <td style={{padding:"8px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                      <div style={{display:"flex",gap:5,justifyContent:"center"}}>
                        {canEdit&&<button onClick={()=>{setShowPayDlg(pr.id);setPayForm({bonus:String(pr.bonus),deduct:String(pr.deduct),note:""});}} style={{background:"#FFFBEB",border:"1px solid #FDE68A",color:C.orange,borderRadius:7,padding:"5px 9px",cursor:"pointer",fontSize:12,fontWeight:600}}>✏️</button>}
                        {canEdit&&!pr.paid&&<button onClick={()=>markPaid(pr.id)} style={{background:C.greenBg,border:"1px solid #A7F3D0",color:C.green,borderRadius:7,padding:"5px 9px",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>صرف</button>}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          </div>
        )
      )}

      {showAddEmp&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:420,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:20,fontSize:17}}>👤 موظف جديد</h3>
            {[{l:"الاسم الكامل *",k:"name",t:"text"},{l:"المسمى الوظيفي",k:"position",t:"text"},{l:"القسم",k:"dept",t:"text"},{l:"الراتب الأساسي (ج.م)",k:"baseSalary",t:"number",ltr:true},{l:"تاريخ التعيين",k:"startDate",t:"date",ltr:true}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>{f.l}</label>
                <input type={f.t} value={empForm[f.k]} onChange={e=>setEmpForm(p=>({...p,[f.k]:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:f.ltr?"ltr":"rtl"}}/></div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={addEmployee} style={{flex:1,padding:12,background:C.navy,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>إضافة</button>
              <button onClick={()=>setShowAddEmp(false)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      )}

      {showPayDlg&&(()=>{const pr=payroll.find(p=>p.id===showPayDlg);return pr?(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <Card style={{padding:32,width:400,direction:"rtl",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <h3 style={{color:C.text,marginBottom:16,fontSize:16}}>✏️ تعديل راتب — {empName(pr.empId)}</h3>
            <div style={{background:C.offWhite,borderRadius:9,padding:14,marginBottom:18,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,color:C.textMuted}}>الراتب الأساسي: <b style={{color:"#6D28D9"}}>{fmt(pr.base)} ج.م</b></div>
            </div>
            {[{l:"مكافأة (ج.م)",k:"bonus"},{l:"خصم (ج.م)",k:"deduct"},{l:"ملاحظة",k:"note"}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>{f.l}</label>
                <input value={payForm[f.k]} onChange={e=>setPayForm(p=>({...p,[f.k]:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:"border-box",direction:f.k==="note"?"rtl":"ltr"}}/></div>
            ))}
            <div style={{background:"#EFF6FF",borderRadius:8,padding:12,marginBottom:16,textAlign:"center",border:"1px solid #BFDBFE"}}>
              <span style={{fontSize:13,color:C.textMuted}}>الصافي: </span>
              <span style={{fontWeight:800,color:"#6D28D9",fontSize:16}}>{fmt(pr.base+(Number(payForm.bonus)||0)-(Number(payForm.deduct)||0))} ج.م</span>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={savePayAdjust} style={{flex:1,padding:12,background:C.navy,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14}}>حفظ</button>
              <button onClick={()=>setShowPayDlg(null)} style={{flex:1,padding:12,background:C.offWhite,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:14}}>إلغاء</button>
            </div>
          </Card>
        </div>
      ):null;})()}
    </div>
  );
}

function ComingSoon({mod,settings}){
  return(
    <div style={{textAlign:"center",padding:"60px 40px",color:C.textMuted}}>
      <div style={{fontSize:64,marginBottom:16}}>{mod.icon}</div>
      <Logo size={48} showText settings={settings}/>
      <h3 style={{color:C.text,marginTop:16,fontSize:20}}>{mod.label}</h3>
      <p style={{fontSize:14}}>هذه الوحدة قيد التطوير — ستكون جاهزة قريباً</p>
      <div style={{display:"inline-flex",gap:8,marginTop:16,background:C.offWhite,borderRadius:10,padding:"12px 24px",border:`1px solid ${C.border}`}}>
        <span>🔧</span><span style={{fontSize:13}}>جاري البناء بنفس جودة الخرسانة 😄</span>
      </div>
    </div>
  );
}
