import { useState, useRef, useEffect, useCallback } from "react";

// ─── EMAILJS CONFIG ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";

// ─── CONSTANTS ──────────────────────────────────────────────────
const SAMPLE_VOUCHERS = [
  { id: 1, store: "Nike", code: "NIKE2024XZ", amount: 150, currency: "$", location: "Online", expiredBy: "2026-05-01", status: "active", remaining: 150, category: "Fashion", color: "#111", notes: "Free shipping included", favorite: true, photo: null },
  { id: 2, store: "לאומי בונוס", code: "LEUMI-200", amount: 200, currency: "₪", location: "Online", expiredBy: "2031-03-08", status: "active", remaining: 200, category: "Shopping", color: "#b5e550", notes: "למגוון רחב של רשתות כולל רשתות חשמל, קרפור", favorite: false, photo: null },
  { id: 3, store: "Amazon", code: "AMZN-PRME-7723", amount: 50, currency: "$", location: "Online", expiredBy: "2026-12-31", status: "active", remaining: 50, category: "Shopping", color: "#FF9900", notes: "Prime members only", favorite: true, photo: null },
  { id: 4, store: "ZARA", code: "ZR-SALE-OFF20", amount: 80, currency: "$", location: "Azrieli Mall", expiredBy: "2024-11-01", status: "used", remaining: 0, category: "Fashion", color: "#1a1a2e", notes: "", favorite: false, photo: null },
  { id: 5, store: "Spotify", code: "SPOT-3MO-FREE", amount: 30, currency: "$", location: "Online", expiredBy: "2026-09-01", status: "active", remaining: 30, category: "Entertainment", color: "#1DB954", notes: "3 months premium", favorite: false, photo: null },
];

const CATEGORIES     = ["All","Fashion","Food & Drink","Shopping","Entertainment","Travel","Beauty","Other"];
const STATUS_OPTIONS = ["active","half-used","used"];
const statusConfig   = {
  active:      { label:"Active",    color:"#4ade80", bg:"rgba(74,222,128,0.12)",  dot:"#4ade80" },
  "half-used": { label:"Half Used", color:"#fb923c", bg:"rgba(251,146,60,0.12)", dot:"#fb923c" },
  used:        { label:"Used",      color:"#6b7280", bg:"rgba(107,114,128,0.12)",dot:"#6b7280" },
};
const EMPTY_FORM = { store:"", code:"", amount:"", currency:"$", location:"", expiredBy:"", status:"active", remaining:"", category:"Shopping", color:"#6366f1", notes:"", favorite:false, photo:null };

function formatDate(d)     { if (!d) return "—"; return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
function isExpired(d)      { return new Date(d) < new Date(); }
function daysLeft(d)       { return Math.ceil((new Date(d)-new Date())/86400000); }
function genId()           { return Date.now()+Math.floor(Math.random()*1000); }
function isExpiringSoon(d) { const dl=daysLeft(d); return dl>0&&dl<=30; }

async function scanVoucherImage(base64Data, mimeType) {
  const sp = `You are a voucher/gift card scanner. Extract information and return ONLY valid JSON:
{"store":"name","code":"CODE","amount":number_or_null,"currency":"$ or € or ₪ or £","location":"Online or store","expiredBy":"YYYY-MM-DD or empty","category":"Fashion|Food & Drink|Shopping|Entertainment|Travel|Beauty|Other","notes":"conditions","color":"#hexcolor matching brand"}
ONLY JSON. No markdown. Null for unknown numbers, empty string for unknown strings.`;
  const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sp,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mimeType,data:base64Data}},{type:"text",text:"Extract voucher info as JSON."}]}]})});
  const data = await res.json();
  const text = data.content?.find(b=>b.type==="text")?.text||"";
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

async function sendExpiryEmail(toEmail, v) {
  await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service_id:EMAILJS_SERVICE_ID,template_id:EMAILJS_TEMPLATE_ID,user_id:EMAILJS_PUBLIC_KEY,template_params:{to_email:toEmail,store:v.store,code:v.code,amount:v.remaining.toFixed(2),currency:v.currency,days_left:daysLeft(v.expiredBy),expiry_date:formatDate(v.expiredBy)}})});
}

function sendBrowserNotification(v) {
  if (Notification.permission==="granted") new Notification("⏰ Voucher Expiring Soon!",{body:`${v.store} (${v.currency}${v.remaining}) expires ${formatDate(v.expiredBy)} — ${daysLeft(v.expiredBy)}d left.`,tag:`v-${v.id}`});
}

export default function App() {
  const [vouchers,          setVouchers]          = useState(SAMPLE_VOUCHERS);
  const [view,              setView]              = useState("home");
  const [selectedId,        setSelectedId]        = useState(null);
  const [filterCategory,    setFilterCategory]    = useState("All");
  const [filterStatus,      setFilterStatus]      = useState("all");
  const [searchQuery,       setSearchQuery]       = useState("");
  const [form,              setForm]              = useState(EMPTY_FORM);
  const [editingId,         setEditingId]         = useState(null);
  const [sortBy,            setSortBy]            = useState("expiry");
  const [showCopied,        setShowCopied]        = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab,         setActiveTab]         = useState("wallet");
  const [scanState,         setScanState]         = useState("idle");
  const [scanImage,         setScanImage]         = useState(null);
  const [scanError,         setScanError]         = useState("");
  const [scanFields,        setScanFields]        = useState([]);
  const [notifEmail,        setNotifEmail]        = useState("");
  const [browserPermission, setBrowserPermission] = useState(Notification.permission);
  const [inAppAlerts,       setInAppAlerts]       = useState([]);
  const [notifSent,         setNotifSent]         = useState({});
  const [showNotifSetup,    setShowNotifSetup]    = useState(false);
  const [notifToast,        setNotifToast]        = useState(null);
  const [lightboxPhoto,     setLightboxPhoto]     = useState(null);
  const [swipedId,          setSwipedId]          = useState(null);

  const fileInputRef    = useRef(null);
  const selectedVoucher = vouchers.find(v=>v.id===selectedId);

  useEffect(()=>{
    const expiring = vouchers.filter(v=>v.status!=="used"&&isExpiringSoon(v.expiredBy));
    setInAppAlerts(expiring.map(v=>({id:v.id,voucher:v})));
  },[vouchers]);

  const requestBrowserPermission = useCallback(async()=>{
    if (!("Notification" in window)) return;
    setBrowserPermission(await Notification.requestPermission());
  },[]);

  const sendAllNotifications = useCallback(async(voucher)=>{
    if (notifSent[voucher.id]) return;
    setNotifSent(p=>({...p,[voucher.id]:true}));
    if (browserPermission==="granted") sendBrowserNotification(voucher);
    if (notifEmail&&EMAILJS_SERVICE_ID!=="YOUR_SERVICE_ID") { try{ await sendExpiryEmail(notifEmail,voucher); }catch(e){} }
    setNotifToast(voucher); setTimeout(()=>setNotifToast(null),5000);
  },[notifSent,browserPermission,notifEmail]);

  const filtered = vouchers.filter(v=>{
    const matchCat    = filterCategory==="All"||v.category===filterCategory;
    const matchStatus = filterStatus==="all"||v.status===filterStatus;
    const matchSearch = !searchQuery||v.store.toLowerCase().includes(searchQuery.toLowerCase())||v.code.toLowerCase().includes(searchQuery.toLowerCase())||v.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab    = activeTab!=="favorites"||v.favorite;
    return matchCat&&matchStatus&&matchSearch&&matchTab;
  }).sort((a,b)=>sortBy==="expiry"?new Date(a.expiredBy)-new Date(b.expiredBy):sortBy==="amount"?b.remaining-a.remaining:a.store.localeCompare(b.store));

  const totalValue        = vouchers.filter(v=>v.status!=="used").reduce((s,v)=>s+v.remaining,0);
  const activeCount       = vouchers.filter(v=>v.status==="active").length;
  const expiringSoonCount = vouchers.filter(v=>v.status!=="used"&&isExpiringSoon(v.expiredBy)).length;

  function handleCopyCode(code) { navigator.clipboard?.writeText(code).catch(()=>{}); setShowCopied(true); setTimeout(()=>setShowCopied(false),1800); }
  function handleSave() {
    const amt=parseFloat(form.amount)||0;
    const rem=form.status==="used"?0:form.status==="half-used"?(parseFloat(form.remaining)||amt/2):amt;
    const saved={...form,id:editingId||genId(),amount:amt,remaining:rem};
    if (editingId) setVouchers(v=>v.map(x=>x.id===editingId?saved:x));
    else           setVouchers(v=>[...v,saved]);
    setForm(EMPTY_FORM); setEditingId(null); setScanState("idle"); setScanImage(null); setView("home");
  }
  function handleDelete(id)   { setVouchers(v=>v.filter(x=>x.id!==id)); setView("home"); setShowDeleteConfirm(false); }
  function handleEdit(v)      { setForm({...v,amount:String(v.amount),remaining:String(v.remaining)}); setEditingId(v.id); setScanState("idle"); setScanImage(null); setView("add"); }
  function toggleFavorite(id) { setVouchers(v=>v.map(x=>x.id===id?{...x,favorite:!x.favorite}:x)); }
  function markUsed(id)       { setVouchers(v=>v.map(x=>x.id===id?{...x,status:"used",remaining:0}:x)); setSwipedId(null); }

  async function handleImageUpload(e) {
    const file=e.target.files?.[0]; if (!file) return;
    setScanState("scanning"); setScanError(""); setScanFields([]);
    const reader=new FileReader();
    reader.onload=async(ev)=>{
      const dataUrl=ev.target.result; setScanImage(dataUrl);
      setForm(f=>({...f,photo:dataUrl}));
      try {
        const extracted=await scanVoucherImage(dataUrl.split(",")[1],file.type||"image/jpeg");
        const filled=[]; const next={...EMPTY_FORM,photo:dataUrl};
        if(extracted.store)    { next.store=extracted.store;                                                      filled.push("store"); }
        if(extracted.code)     { next.code=extracted.code;                                                        filled.push("code"); }
        if(extracted.amount!=null){ next.amount=String(extracted.amount); next.remaining=String(extracted.amount); filled.push("amount"); }
        if(extracted.currency) next.currency=extracted.currency;
        if(extracted.location) { next.location=extracted.location;                                                filled.push("location"); }
        if(extracted.expiredBy){ next.expiredBy=extracted.expiredBy;                                              filled.push("expiredBy"); }
        if(extracted.category&&CATEGORIES.includes(extracted.category)){ next.category=extracted.category;        filled.push("category"); }
        if(extracted.notes)    { next.notes=extracted.notes;                                                      filled.push("notes"); }
        if(extracted.color)    next.color=extracted.color;
        setForm(next); setScanFields(filled); setScanState("preview");
      } catch(err) { setScanError("Couldn't read the voucher. Try a clearer photo or fill in manually."); setScanState("error"); }
    };
    reader.readAsDataURL(file); e.target.value="";
  }

  // ── STYLES ───────────────────────────────────────────────────
  const S = {
    root:       { fontFamily:"'DM Sans',sans-serif", background:"#0A0A0F", minHeight:"100vh", maxWidth:390, margin:"0 auto", position:"relative", overflow:"hidden", color:"#F0EEF6" },
    phone:      { minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative" },
    statusBar:  { height:44, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, fontWeight:600, color:"#F0EEF6", flexShrink:0 },
    scrollArea: { flex:1, overflowY:"auto", paddingBottom:110, WebkitOverflowScrolling:"touch" },
    summaryCard:{ flex:1, background:"rgba(255,255,255,0.05)", borderRadius:16, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.07)" },
    tab:    (a)=>({ padding:"8px 16px", borderRadius:50, fontSize:13, fontWeight:a?600:500, background:a?"#6366f1":"rgba(255,255,255,0.06)", color:a?"#fff":"#9CA3AF", border:"none", cursor:"pointer", whiteSpace:"nowrap" }),
    filterChip:(a)=>({ padding:"6px 14px", borderRadius:50, fontSize:12, fontWeight:a?600:400, background:a?"rgba(99,102,241,0.25)":"transparent", color:a?"#a5b4fc":"#6B7280", border:a?"1px solid rgba(99,102,241,0.5)":"1px solid rgba(255,255,255,0.08)", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }),
    statusBadge:(s)=>({ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:50, fontSize:11, fontWeight:600, background:statusConfig[s]?.bg, color:statusConfig[s]?.color }),
    expiry:(expired,soon)=>({ fontSize:11, color:expired?"#ef4444":soon?"#fb923c":"#6B7280", fontWeight:500 }),
    backBtn:    { width:36, height:36, borderRadius:12, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"none", color:"#F0EEF6", fontSize:18 },
    actionBtn:(v)=>({ flex:1, padding:"14px", borderRadius:14, border:"none", fontSize:14, fontWeight:600, cursor:"pointer", background:v==="primary"?"linear-gradient(135deg,#6366f1,#818cf8)":v==="danger"?"rgba(239,68,68,0.12)":"rgba(255,255,255,0.07)", color:v==="primary"?"#fff":v==="danger"?"#ef4444":"#F0EEF6" }),
    formSection:{ padding:"0 24px", marginBottom:16 },
    formLabel:  { fontSize:12, color:"#9CA3AF", fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:8, display:"block" },
    formInput:  { width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"13px 16px", fontSize:15, color:"#F0EEF6", outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
    formInputFilled:{ width:"100%", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.4)", borderRadius:14, padding:"13px 16px", fontSize:15, color:"#F0EEF6", outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
    segment:(a) =>({ flex:1, padding:"10px 6px", borderRadius:12, fontSize:12, fontWeight:600, background:a?"rgba(99,102,241,0.25)":"rgba(255,255,255,0.05)", color:a?"#a5b4fc":"#6B7280", border:a?"1px solid rgba(99,102,241,0.5)":"1px solid rgba(255,255,255,0.08)", cursor:"pointer", textAlign:"center" }),
    textarea:   { width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"13px 16px", fontSize:14, color:"#F0EEF6", outline:"none", boxSizing:"border-box", fontFamily:"inherit", resize:"none", minHeight:72 },
    saveBtn:    { margin:"20px 24px", width:"calc(100% - 48px)", padding:"16px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#6366f1,#818cf8)", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 8px 20px rgba(99,102,241,0.3)" },
    toast:      { position:"fixed", top:60, left:"50%", transform:"translateX(-50%)", background:"#1f2937", color:"#fff", padding:"10px 20px", borderRadius:50, fontSize:13, fontWeight:600, zIndex:999, boxShadow:"0 4px 16px rgba(0,0,0,0.4)", display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap" },
    overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200, backdropFilter:"blur(4px)" },
    sheet:      { background:"#1A1A24", borderRadius:"24px 24px 0 0", padding:"28px 24px 48px", width:"100%", maxWidth:390 },
    statGrid:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:"0 24px", marginBottom:20 },
    statBox:    { background:"rgba(255,255,255,0.05)", borderRadius:18, padding:"18px 16px", border:"1px solid rgba(255,255,255,0.07)" },
    fab:        { position:"fixed", bottom:90, right:"calc(50% - 195px + 24px)", width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,#6366f1,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 8px 24px rgba(99,102,241,0.4)", zIndex:101, border:"none", color:"#fff", fontSize:24 },
    bottomNav:  { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:390, background:"rgba(10,10,15,0.92)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-around", padding:"12px 0 28px", zIndex:100 },
    navItem:(a) =>({ display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", color:a?"#6366f1":"#4B5563" }),
    navLabel:   { fontSize:10, fontWeight:600, letterSpacing:"0.03em" },
  };

  const isFilled = (f)=>scanState==="preview"&&scanFields.includes(f);
  const inp      = (f)=>isFilled(f)?S.formInputFilled:S.formInput;

  // ── SCAN BANNER ─────────────────────────────────────────────
  const renderScanBanner = () => {
    if (scanState==="idle") return (
      <div style={{margin:"0 24px 4px"}}>
        <div onClick={()=>fileInputRef.current?.click()} style={{border:"1.5px dashed rgba(99,102,241,0.45)",borderRadius:20,padding:"18px 20px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",background:"rgba(99,102,241,0.04)"}}>
          <div style={{width:46,height:46,borderRadius:14,background:"rgba(99,102,241,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>📷</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#a5b4fc",marginBottom:3}}>Scan Voucher with AI</div>
            <div style={{fontSize:12,color:"#6B7280",lineHeight:1.5}}>Photo, screenshot or email — Claude fills all fields automatically</div>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload}/>
      </div>
    );
    if (scanState==="scanning") return (
      <div style={{margin:"0 24px 4px",borderRadius:20,overflow:"hidden",background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}>
        {scanImage&&<img src={scanImage} alt="" style={{width:"100%",maxHeight:160,objectFit:"cover",opacity:0.4,display:"block"}}/>}
        <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:28,height:28,borderRadius:"50%",border:"3px solid #6366f1",borderTopColor:"transparent",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
          <div><div style={{fontSize:14,fontWeight:700,color:"#a5b4fc"}}>Scanning with AI…</div><div style={{fontSize:12,color:"#6B7280"}}>Claude is reading your voucher</div></div>
        </div>
      </div>
    );
    if (scanState==="error") return (
      <div style={{margin:"0 24px 4px",borderRadius:20,padding:"16px 20px",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",display:"flex",gap:12}}>
        <div style={{fontSize:20}}>⚠️</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:"#ef4444",marginBottom:4}}>Scan failed</div>
          <div style={{fontSize:12,color:"#9CA3AF",marginBottom:10}}>{scanError}</div>
          <button onClick={()=>setScanState("idle")} style={{fontSize:12,fontWeight:600,color:"#a5b4fc",background:"rgba(99,102,241,0.15)",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer"}}>Try Again</button>
        </div>
      </div>
    );
    if (scanState==="preview") return (
      <div style={{margin:"0 24px 4px",borderRadius:20,overflow:"hidden",background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.2)"}}>
        {scanImage&&<img src={scanImage} alt="" style={{width:"100%",maxHeight:150,objectFit:"cover",display:"block"}}/>}
        <div style={{padding:"14px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:16}}>✅</span>
            <span style={{fontSize:14,fontWeight:700,color:"#4ade80"}}>Scan complete!</span>
            <span style={{fontSize:12,color:"#9CA3AF",marginLeft:2}}>{scanFields.length} fields filled</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            {scanFields.map(f=><span key={f} style={{fontSize:11,padding:"3px 10px",borderRadius:50,background:"rgba(74,222,128,0.12)",color:"#4ade80",fontWeight:600,textTransform:"capitalize"}}>{f==="expiredBy"?"Expiry":f}</span>)}
          </div>
          <button onClick={()=>{setScanState("idle");setScanImage(null);setForm(EMPTY_FORM);}} style={{fontSize:12,fontWeight:600,color:"#9CA3AF",background:"rgba(255,255,255,0.06)",border:"none",borderRadius:10,padding:"8px 16px",cursor:"pointer"}}>🔄 Rescan</button>
        </div>
      </div>
    );
  };

  // ── IN-APP ALERTS ────────────────────────────────────────────
  const renderInAppAlerts = () => {
    if (inAppAlerts.length===0) return null;
    return (
      <div style={{margin:"0 24px 16px"}}>
        {inAppAlerts.map(({id,voucher:v})=>(
          <div key={id} style={{borderRadius:16,padding:"14px 16px",background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.25)",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:20,flexShrink:0}}>⏰</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"#fb923c",marginBottom:2}}>{v.store} expires in {daysLeft(v.expiredBy)} days</div>
              <div style={{fontSize:11,color:"#9CA3AF"}}>{v.currency}{v.remaining} · {formatDate(v.expiredBy)}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
              <button onClick={()=>sendAllNotifications(v)} style={{fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:8,background:"rgba(251,146,60,0.2)",border:"1px solid rgba(251,146,60,0.4)",color:"#fb923c",cursor:"pointer",whiteSpace:"nowrap"}}>{notifSent[v.id]?"✓ Sent":"Notify me"}</button>
              <button onClick={()=>setInAppAlerts(a=>a.filter(x=>x.id!==id))} style={{fontSize:10,color:"#4B5563",background:"none",border:"none",cursor:"pointer"}}>Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── CARD ────────────────────────────────────────────────────
  const renderCard = (v) => {
    const pct        = v.amount>0?(v.remaining/v.amount)*100:0;
    const expired    = isExpired(v.expiredBy);
    const days       = daysLeft(v.expiredBy);
    const soon30     = days>0&&days<=30;
    const soon14     = days>0&&days<=14;
    const isOpen     = swipedId===v.id;

    return (
      <div key={v.id} style={{margin:"0 24px 12px",position:"relative",borderRadius:20,overflow:"hidden"}}>
        {/* Revealed action layer */}
        <div style={{position:"absolute",inset:0,background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:20,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:14}}>
          <button onClick={()=>markUsed(v.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"rgba(74,222,128,0.15)",border:"1px solid rgba(74,222,128,0.4)",borderRadius:14,padding:"10px 16px",cursor:"pointer",color:"#4ade80",fontSize:11,fontWeight:700}}>
            <span style={{fontSize:20}}>✓</span>Mark Used
          </button>
        </div>

        {/* Card */}
        <div
          style={{
            borderRadius:20,overflow:"hidden",
            background:v.status==="used"?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.06)",
            border:`1px solid ${v.status==="used"?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.1)"}`,
            opacity:v.status==="used"?0.55:1,
            position:"relative",
            transform:isOpen?"translateX(-108px)":"translateX(0)",
            transition:"transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Expiry badge */}
          {soon30&&!expired&&<div style={{position:"absolute",top:10,left:10,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:50,background:"rgba(251,146,60,0.15)",color:"#fb923c",border:"1px solid rgba(251,146,60,0.3)",zIndex:2}}>⏰ {days}d</div>}

          {/* Swipe handle — only for non-used */}
          {v.status!=="used"&&(
            <button
              onClick={e=>{e.stopPropagation(); setSwipedId(isOpen?null:v.id);}}
              style={{position:"absolute",top:10,right:10,zIndex:3,width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:"#6B7280"}}
              title="Mark as used"
            >✓</button>
          )}

          {/* Top color strip */}
          <div style={{height:3,background:v.color,borderRadius:"20px 20px 0 0"}}/>

          <div style={{padding:"14px 16px"}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>

              {/* ── PHOTO THUMBNAIL ── */}
              {v.photo&&(
                <div
                  onClick={e=>{e.stopPropagation(); setLightboxPhoto(v.photo);}}
                  style={{width:52,height:52,borderRadius:12,overflow:"hidden",flexShrink:0,border:"2px solid rgba(255,255,255,0.12)",cursor:"zoom-in",marginTop:soon30&&!expired?14:2,boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}
                >
                  <img src={v.photo} alt="voucher" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
              )}

              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{paddingTop:soon30&&!expired?14:0,paddingRight:v.status!=="used"?32:8,flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:700,color:"#F0EEF6",letterSpacing:"-0.01em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.store}</div>
                    <div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#9CA3AF",background:"rgba(255,255,255,0.06)",padding:"4px 10px",borderRadius:8,marginTop:4,display:"inline-block",letterSpacing:"0.08em"}}>{v.code}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:16,fontWeight:700,color:"#F0EEF6"}}>{v.currency}{v.remaining.toFixed(0)}</div>
                    {v.status==="half-used"&&<div style={{fontSize:10,color:"#9CA3AF"}}>of {v.currency}{v.amount}</div>}
                  </div>
                </div>
                {v.status==="half-used"&&(
                  <div style={{height:4,background:"rgba(255,255,255,0.1)",borderRadius:4,margin:"8px 0",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:v.color,borderRadius:4}}/>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={S.statusBadge(v.status)}>
                    <span style={{width:5,height:5,borderRadius:"50%",background:statusConfig[v.status]?.dot,display:"inline-block"}}/>
                    {statusConfig[v.status]?.label}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                    <div style={S.expiry(expired,soon14)}>{expired?"⚠ Expired":soon14?`⏰ ${days}d left`:`Exp ${formatDate(v.expiredBy)}`}</div>
                    {v.location&&<div style={{fontSize:10,color:"#4B5563"}}>📍 {v.location}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {v.favorite&&<div style={{position:"absolute",top:14,right:v.status!=="used"?46:14,fontSize:13,zIndex:2}}>⭐</div>}

          {/* Tap overlay */}
          <div style={{position:"absolute",inset:0,zIndex:1}} onClick={()=>{if(isOpen){setSwipedId(null);}else{setSelectedId(v.id);setView("detail");}}}/>
        </div>
      </div>
    );
  };

  // ── DETAIL ──────────────────────────────────────────────────
  const renderDetail = () => {
    if (!selectedVoucher) return null;
    const v=selectedVoucher;
    const pct=v.amount>0?(v.remaining/v.amount)*100:0;
    const expired=isExpired(v.expiredBy); const days=daysLeft(v.expiredBy);
    return (
      <div style={S.phone}>
        <div style={S.statusBar}><span>9:41</span><span>▮</span></div>
        <div style={S.scrollArea}>
          <div style={{padding:"8px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button style={S.backBtn} onClick={()=>setView("home")}>←</button>
            <div style={{display:"flex",gap:10}}>
              {isExpiringSoon(v.expiredBy)&&v.status!=="used"&&(
                <button style={{...S.backBtn,background:"rgba(251,146,60,0.12)",color:"#fb923c",fontSize:14}} onClick={()=>sendAllNotifications(v)}>{notifSent[v.id]?"✓":"🔔"}</button>
              )}
              <button style={S.backBtn} onClick={()=>toggleFavorite(v.id)}>{v.favorite?"⭐":"☆"}</button>
              <button style={S.backBtn} onClick={()=>handleEdit(v)}>✏️</button>
            </div>
          </div>

          {/* Banner */}
          <div style={{margin:"20px 24px 0",borderRadius:24,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",overflow:"hidden"}}>
            <div style={{background:v.color,padding:"28px 24px 24px"}}>
              <div style={{fontSize:30,fontWeight:800,color:"#fff",letterSpacing:"-0.02em",marginBottom:4,textShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>{v.store}</div>
              <div style={{fontSize:44,fontWeight:800,color:"#fff",letterSpacing:"-0.03em",textShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>{v.currency}{v.remaining.toFixed(2)}</div>
              {v.status==="half-used"&&<div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginTop:4}}>remaining of {v.currency}{v.amount}</div>}
              <div style={{marginTop:12}}><div style={S.statusBadge(v.status)}><span style={{width:5,height:5,borderRadius:"50%",background:statusConfig[v.status]?.dot,display:"inline-block"}}/>{statusConfig[v.status]?.label}</div></div>
            </div>

            {/* ── VOUCHER PHOTO (below banner, above details) ── */}
            {v.photo&&(
              <div onClick={()=>setLightboxPhoto(v.photo)} style={{cursor:"zoom-in",position:"relative",overflow:"hidden",background:"#0d0d0d",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <img src={v.photo} alt="Voucher" style={{width:"100%",maxHeight:210,objectFit:"contain",display:"block"}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,background:"linear-gradient(transparent,rgba(0,0,0,0.5))",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:8}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:600,letterSpacing:"0.08em"}}>TAP TO EXPAND</span>
                </div>
              </div>
            )}

            {v.status==="half-used"&&(
              <div style={{padding:"12px 24px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#9CA3AF",marginBottom:6}}><span>Balance used</span><span>{(100-pct).toFixed(0)}%</span></div>
                <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:v.color,borderRadius:6}}/>
                </div>
              </div>
            )}

            <div style={{padding:"20px 24px"}}>
              {[["Category",v.category],["Location",v.location||"—"],["Expires",expired?`⚠ Expired (${formatDate(v.expiredBy)})`:days<=30?`⏰ ${days} days left (${formatDate(v.expiredBy)})`:formatDate(v.expiredBy)],["Original Value",`${v.currency}${v.amount}`],...(v.notes?[["Notes",v.notes]]:[])].map(([label,val])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize:13,color:"#6B7280",fontWeight:500}}>{label}</span>
                  <span style={{fontSize:14,color:label==="Expires"&&expired?"#ef4444":label==="Expires"&&days<=30?"#fb923c":"#F0EEF6",fontWeight:600,textAlign:"right",maxWidth:"60%"}}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",margin:"16px 24px 0"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,letterSpacing:"0.12em",color:"#a5b4fc"}}>{v.code}</span>
            <button style={{background:"rgba(99,102,241,0.2)",border:"1px solid rgba(99,102,241,0.4)",borderRadius:10,padding:"6px 14px",color:"#a5b4fc",fontSize:12,fontWeight:600,cursor:"pointer"}} onClick={()=>handleCopyCode(v.code)}>Copy</button>
          </div>

          <div style={{display:"flex",gap:10,padding:"16px 24px 0"}}>
            {v.status!=="used"&&<button style={S.actionBtn("success")} onClick={()=>{markUsed(v.id);setView("home");}}>✓ Mark Used</button>}
            <button style={S.actionBtn("secondary")} onClick={()=>handleEdit(v)}>Edit</button>
            <button style={S.actionBtn("danger")} onClick={()=>setShowDeleteConfirm(true)}>Delete</button>
          </div>
          <div style={{height:40}}/>
        </div>

        {showDeleteConfirm&&(
          <div style={S.overlay} onClick={()=>setShowDeleteConfirm(false)}>
            <div style={S.sheet} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:20,fontWeight:700,marginBottom:8}}>Delete Voucher?</div>
              <div style={{color:"#9CA3AF",marginBottom:24,fontSize:14}}>This will permanently remove "{v.store}" voucher.</div>
              <div style={{display:"flex",gap:10}}>
                <button style={{...S.actionBtn("secondary"),flex:1,padding:14}} onClick={()=>setShowDeleteConfirm(false)}>Cancel</button>
                <button style={{...S.actionBtn("danger"),flex:1,padding:14}} onClick={()=>handleDelete(v.id)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── ADD / EDIT ───────────────────────────────────────────────
  const renderAddEdit = () => (
    <div style={S.phone}>
      <div style={S.statusBar}><span>9:41</span><span>▮</span></div>
      <div style={S.scrollArea}>
        <div style={{padding:"8px 24px 20px",display:"flex",alignItems:"center",gap:12}}>
          <button style={S.backBtn} onClick={()=>{setView("home");setEditingId(null);setForm(EMPTY_FORM);setScanState("idle");setScanImage(null);}}>←</button>
          <div style={{fontSize:22,fontWeight:700,color:"#F0EEF6"}}>{editingId?"Edit Voucher":"New Voucher"}</div>
        </div>

        {!editingId&&(
          <>
            <div style={{padding:"0 24px 10px",fontSize:11,fontWeight:600,color:"#6B7280",letterSpacing:"0.05em",textTransform:"uppercase"}}>AI Auto-Fill</div>
            {renderScanBanner()}
            <div style={{padding:"16px 24px 10px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
              <span style={{fontSize:11,color:"#4B5563",fontWeight:600}}>{scanState==="preview"?"REVIEW & EDIT":"OR FILL MANUALLY"}</span>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
            </div>
          </>
        )}

        {/* Photo preview in form */}
        {form.photo&&(
          <div style={S.formSection}>
            <label style={S.formLabel}>Voucher Photo</label>
            <div style={{position:"relative",borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)"}}>
              <img src={form.photo} alt="" style={{width:"100%",maxHeight:160,objectFit:"contain",background:"#111",display:"block"}}/>
              <button onClick={()=>setForm(f=>({...f,photo:null}))} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:8,background:"rgba(0,0,0,0.6)",border:"none",color:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          </div>
        )}

        <div style={S.formSection}>
          <label style={S.formLabel}>Store Name {isFilled("store")&&<span style={{color:"#4ade80",fontSize:10,fontWeight:700}}>✦ AI filled</span>}</label>
          <input style={inp("store")} placeholder="e.g. Nike, Amazon..." value={form.store} onChange={e=>setForm(f=>({...f,store:e.target.value}))}/>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>Voucher Code {isFilled("code")&&<span style={{color:"#4ade80",fontSize:10,fontWeight:700}}>✦ AI filled</span>}</label>
          <input style={{...inp("code"),fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}} placeholder="e.g. SAVE20XYZ" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))}/>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>Amount {isFilled("amount")&&<span style={{color:"#4ade80",fontSize:10,fontWeight:700}}>✦ AI filled</span>}</label>
          <div style={{display:"flex",gap:8}}>
            <select style={{...S.formInput,width:70,flexShrink:0}} value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>
              {["$","€","₪","£","¥"].map(c=><option key={c} value={c} style={{background:"#1A1A24"}}>{c}</option>)}
            </select>
            <input style={inp("amount")} type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value,remaining:e.target.value}))}/>
          </div>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>Status</label>
          <div style={{display:"flex",gap:6}}>{STATUS_OPTIONS.map(s=><button key={s} style={S.segment(form.status===s)} onClick={()=>setForm(f=>({...f,status:s}))}>{statusConfig[s].label}</button>)}</div>
        </div>
        {form.status==="half-used"&&(
          <div style={S.formSection}>
            <label style={S.formLabel}>Remaining Amount</label>
            <input style={S.formInput} type="number" placeholder="Remaining balance" value={form.remaining} onChange={e=>setForm(f=>({...f,remaining:e.target.value}))}/>
          </div>
        )}
        <div style={S.formSection}>
          <label style={S.formLabel}>Category {isFilled("category")&&<span style={{color:"#4ade80",fontSize:10,fontWeight:700}}>✦ AI filled</span>}</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{CATEGORIES.filter(c=>c!=="All").map(c=><button key={c} style={S.filterChip(form.category===c)} onClick={()=>setForm(f=>({...f,category:c}))}>{c}</button>)}</div>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>Location {isFilled("location")&&<span style={{color:"#4ade80",fontSize:10,fontWeight:700}}>✦ AI filled</span>}</label>
          <input style={inp("location")} placeholder="Online / Store name..." value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>Expiry Date {isFilled("expiredBy")&&<span style={{color:"#4ade80",fontSize:10,fontWeight:700}}>✦ AI filled</span>}</label>
          <input style={inp("expiredBy")} type="date" value={form.expiredBy} onChange={e=>setForm(f=>({...f,expiredBy:e.target.value}))}/>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>Brand Color</label>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {["#6366f1","#1a1a2e","#00704A","#FF9900","#1DB954","#e11d48","#0ea5e9","#b5e550"].map(c=>(
              <div key={c} onClick={()=>setForm(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:8,background:c,cursor:"pointer",border:form.color===c?"2px solid #fff":"2px solid transparent",boxShadow:form.color===c?`0 0 0 2px ${c}`:"none"}}/>
            ))}
            <input type="color" value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} style={{width:28,height:28,borderRadius:8,cursor:"pointer",border:"none",padding:0}}/>
          </div>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>Notes {isFilled("notes")&&<span style={{color:"#4ade80",fontSize:10,fontWeight:700}}>✦ AI filled</span>}</label>
          <textarea style={{...S.textarea,...(isFilled("notes")?{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.4)"}:{})}} placeholder="Any extra details..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
        </div>
        <div style={S.formSection}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0"}}>
            <span style={{fontSize:14,color:"#F0EEF6",fontWeight:500}}>⭐ Add to Favorites</span>
            <div onClick={()=>setForm(f=>({...f,favorite:!f.favorite}))} style={{width:44,height:26,borderRadius:50,cursor:"pointer",background:form.favorite?"#6366f1":"rgba(255,255,255,0.1)",position:"relative",transition:"background 0.2s"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:form.favorite?21:3,transition:"left 0.2s"}}/>
            </div>
          </div>
        </div>
        <button style={{...S.saveBtn,opacity:!form.store||!form.code?0.5:1}} onClick={handleSave} disabled={!form.store||!form.code}>{editingId?"Save Changes":"Add Voucher"}</button>
      </div>
    </div>
  );

  // ── STATS ────────────────────────────────────────────────────
  const renderStats = () => {
    const usedCount=vouchers.filter(v=>v.status==="used").length;
    const halfCount=vouchers.filter(v=>v.status==="half-used").length;
    const savedTotal=vouchers.reduce((s,v)=>s+v.amount,0);
    const remaining=vouchers.filter(v=>v.status!=="used").reduce((s,v)=>s+v.remaining,0);
    const expiredCount=vouchers.filter(v=>v.status!=="used"&&isExpired(v.expiredBy)).length;
    const catBreakdown=CATEGORIES.filter(c=>c!=="All").map(c=>({name:c,count:vouchers.filter(v=>v.category===c).length,value:vouchers.filter(v=>v.category===c).reduce((s,v)=>s+v.remaining,0)})).filter(c=>c.count>0).sort((a,b)=>b.value-a.value);
    return (
      <div>
        <div style={{padding:"0 24px 16px",fontSize:18,fontWeight:700}}>Overview</div>
        <div style={S.statGrid}>
          {[["🎫",vouchers.length,"Total"],["✅",activeCount,"Active"],["⚡",halfCount,"Half Used"],["🚫",usedCount,"Used"],["💰",`$${remaining.toFixed(0)}`,"Available"],["⚠️",expiredCount,"Expired"]].map(([icon,num,lbl])=>(
            <div key={lbl} style={S.statBox}><div style={{fontSize:22,marginBottom:8}}>{icon}</div><div style={{fontSize:24,fontWeight:800,marginBottom:2}}>{num}</div><div style={{fontSize:11,color:"#6B7280",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em"}}>{lbl}</div></div>
          ))}
        </div>
        {catBreakdown.length>0&&(
          <div style={{padding:"0 24px"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:12}}>By Category</div>
            {catBreakdown.map(c=>(
              <div key={c.name} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span style={{color:"#D1D5DB"}}>{c.name}</span><span style={{color:"#9CA3AF"}}>${c.value.toFixed(0)} · {c.count} voucher{c.count>1?"s":""}</span></div>
                <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(c.value/savedTotal)*100)}%`,background:"#6366f1",borderRadius:4}}/></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── NOTIF SETTINGS ───────────────────────────────────────────
  const renderNotifSetup = () => (
    <div style={S.overlay} onClick={()=>setShowNotifSetup(false)}>
      <div style={{...S.sheet,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div><div style={{fontSize:20,fontWeight:800,marginBottom:4}}>🔔 Reminder Settings</div><div style={{fontSize:13,color:"#6B7280"}}>Get notified 30 days before expiry</div></div>
          <button style={{...S.backBtn,fontSize:16}} onClick={()=>setShowNotifSetup(false)}>✕</button>
        </div>
        {[{icon:"📱",title:"In-App Alerts",sub:"Banners shown when you open the app",right:<div style={{padding:"4px 12px",borderRadius:50,background:"rgba(74,222,128,0.12)",color:"#4ade80",fontSize:11,fontWeight:600}}>Active</div>}].map(item=>(
          <div key={item.title} style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"16px",marginBottom:12,border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>{item.icon}</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{item.title}</div><div style={{fontSize:12,color:"#6B7280"}}>{item.sub}</div></div>{item.right}</div>
          </div>
        ))}
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"16px",marginBottom:12,border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:18}}>🖥</span><div><div style={{fontSize:14,fontWeight:700}}>Browser Notifications</div><div style={{fontSize:12,color:"#6B7280"}}>Desktop push alerts</div></div></div>
          {browserPermission==="granted"?<div style={{display:"flex",gap:8}}><div style={{padding:"4px 12px",borderRadius:50,background:"rgba(74,222,128,0.12)",color:"#4ade80",fontSize:11,fontWeight:600}}>✓ Enabled</div><button onClick={()=>{const v=vouchers.find(x=>x.status!=="used"&&isExpiringSoon(x.expiredBy));if(v)sendBrowserNotification(v);}} style={{fontSize:11,color:"#a5b4fc",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:8,padding:"4px 12px",cursor:"pointer"}}>Send Test</button></div>:browserPermission==="denied"?<div style={{fontSize:12,color:"#ef4444"}}>Blocked in browser settings.</div>:<button onClick={requestBrowserPermission} style={{...S.actionBtn("primary"),flex:"none",padding:"10px 20px",fontSize:13}}>Enable Browser Notifications</button>}
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"16px",marginBottom:16,border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:18}}>📧</span><div><div style={{fontSize:14,fontWeight:700}}>Email Reminders</div><div style={{fontSize:12,color:"#6B7280"}}>30-day expiry emails</div></div></div>
          <input style={{...S.formInput,marginBottom:10}} type="email" placeholder="your@email.com" value={notifEmail} onChange={e=>setNotifEmail(e.target.value)}/>
          {EMAILJS_SERVICE_ID==="YOUR_SERVICE_ID"&&<div style={{fontSize:11,color:"#6B7280",lineHeight:1.6,padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}><div style={{fontWeight:700,color:"#9CA3AF",marginBottom:4}}>⚙ One-time setup via emailjs.com (free)</div><div>1. Create Gmail/Outlook service</div><div>2. Template vars: <span style={{fontFamily:"monospace",color:"#fb923c",fontSize:10}}>{`{{store}}, {{code}}, {{amount}}, {{days_left}}, {{expiry_date}}`}</span></div><div>3. Replace the 3 constants at top of file</div></div>}
        </div>
        {inAppAlerts.length>0&&<div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Expiring within 30 days:</div>
          {inAppAlerts.map(({voucher:v})=>(
            <div key={v.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"rgba(251,146,60,0.06)",borderRadius:12,marginBottom:8,border:"1px solid rgba(251,146,60,0.15)"}}>
              <div><div style={{fontSize:13,fontWeight:600}}>{v.store}</div><div style={{fontSize:11,color:"#9CA3AF"}}>{daysLeft(v.expiredBy)} days · {formatDate(v.expiredBy)}</div></div>
              <button onClick={()=>sendAllNotifications(v)} style={{fontSize:11,fontWeight:600,padding:"6px 14px",borderRadius:8,background:notifSent[v.id]?"rgba(74,222,128,0.1)":"rgba(251,146,60,0.15)",border:`1px solid ${notifSent[v.id]?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,color:notifSent[v.id]?"#4ade80":"#fb923c",cursor:"pointer"}}>{notifSent[v.id]?"✓ Notified":"Notify →"}</button>
            </div>
          ))}
        </div>}
        <button style={{...S.saveBtn,margin:"16px 0 0"}} onClick={()=>setShowNotifSetup(false)}>Done</button>
      </div>
    </div>
  );

  // ── HOME ────────────────────────────────────────────────────
  const renderHome = () => (
    <div style={S.phone}>
      <div style={S.statusBar}><span>9:41</span><span>▲ ●●● ▮</span></div>
      <div style={S.scrollArea} onClick={()=>swipedId&&setSwipedId(null)}>
        <div style={{padding:"8px 24px 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:13,color:"#9CA3AF",fontWeight:500,letterSpacing:"0.02em",marginBottom:4}}>Your Savings</div><div style={{fontSize:28,fontWeight:700,color:"#F0EEF6",letterSpacing:"-0.02em"}}>Voucher Wallet 🎟️</div></div>
            <button onClick={()=>setShowNotifSetup(true)} style={{position:"relative",width:40,height:40,borderRadius:13,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              🔔{inAppAlerts.length>0&&<div style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#fb923c",border:"2px solid #0A0A0F"}}/>}
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:10,padding:"0 24px",marginBottom:24}}>
          <div style={S.summaryCard}><div style={{fontSize:11,color:"#9CA3AF",fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:6}}>Total Value</div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em"}}>${totalValue.toFixed(0)}</div></div>
          <div style={S.summaryCard}><div style={{fontSize:11,color:"#9CA3AF",fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:6}}>Active</div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em"}}>{activeCount}</div></div>
          <div style={{...S.summaryCard,borderColor:expiringSoonCount>0?"rgba(251,146,60,0.3)":undefined}}><div style={{fontSize:11,color:"#9CA3AF",fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:6}}>Expiring</div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em",color:expiringSoonCount>0?"#fb923c":"#F0EEF6"}}>{expiringSoonCount}</div></div>
        </div>
        {renderInAppAlerts()}
        <div style={{display:"flex",gap:6,padding:"0 24px",marginBottom:20}}>
          {[["wallet","🗂 All"],["favorites","⭐ Saved"],["stats","📊 Stats"]].map(([t,l])=><button key={t} style={S.tab(activeTab===t)} onClick={()=>setActiveTab(t)}>{l}</button>)}
        </div>
        {activeTab==="stats"?renderStats():(
          <>
            <div style={{margin:"0 24px 16px",background:"rgba(255,255,255,0.06)",borderRadius:14,display:"flex",alignItems:"center",padding:"0 14px",gap:10,border:"1px solid rgba(255,255,255,0.08)"}}>
              <span style={{color:"#6B7280"}}>🔍</span>
              <input style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:15,color:"#F0EEF6",padding:"12px 0"}} placeholder="Search store, code..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
              {searchQuery&&<span style={{cursor:"pointer",color:"#6B7280"}} onClick={()=>setSearchQuery("")}>✕</span>}
            </div>
            <div style={{display:"flex",gap:8,padding:"0 24px",overflowX:"auto",marginBottom:10,scrollbarWidth:"none"}}>
              {CATEGORIES.map(c=><button key={c} style={S.filterChip(filterCategory===c)} onClick={()=>setFilterCategory(c)}>{c}</button>)}
            </div>
            <div style={{display:"flex",gap:8,padding:"0 24px",marginBottom:16,overflowX:"auto",scrollbarWidth:"none"}}>
              {[["all","All"],["active","Active"],["half-used","Partial"],["used","Used"]].map(([k,l])=>(
                <button key={k} style={{...S.filterChip(filterStatus===k),color:k!=="all"&&filterStatus===k?statusConfig[k]?.color:undefined}} onClick={()=>setFilterStatus(k)}>{l}</button>
              ))}
              <div style={{marginLeft:"auto",display:"flex",gap:6,flexShrink:0}}>
                {[["expiry","⏱"],["amount","💰"],["store","🔤"]].map(([k,icon])=>(
                  <button key={k} style={{padding:"6px 10px",borderRadius:50,fontSize:12,background:sortBy===k?"rgba(99,102,241,0.2)":"transparent",border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer",color:sortBy===k?"#a5b4fc":"#6B7280"}} onClick={()=>setSortBy(k)}>{icon}</button>
                ))}
              </div>
            </div>
            {filtered.length===0?(
              <div style={{textAlign:"center",padding:"60px 40px",color:"#4B5563"}}>
                <div style={{fontSize:48,marginBottom:12}}>🎫</div>
                <div style={{fontSize:16,fontWeight:600,marginBottom:6,color:"#6B7280"}}>No vouchers found</div>
                <div style={{fontSize:13}}>Tap + to add your first voucher</div>
              </div>
            ):filtered.map(v=>renderCard(v))}
          </>
        )}
      </div>
      <button style={S.fab} onClick={()=>{setForm(EMPTY_FORM);setEditingId(null);setScanState("idle");setScanImage(null);setView("add");}}>+</button>
      <div style={S.bottomNav}>
        {[["wallet","🗂","Wallet"],["favorites","⭐","Saved"],["stats","📊","Stats"]].map(([t,icon,label])=>(
          <div key={t} style={S.navItem(activeTab===t)} onClick={()=>setActiveTab(t)}>
            <span style={{fontSize:22}}>{icon}</span><span style={S.navLabel}>{label}</span>
          </div>
        ))}
      </div>
      {showNotifSetup&&renderNotifSetup()}
    </div>
  );

  // ── LIGHTBOX ─────────────────────────────────────────────────
  const renderLightbox = () => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}} onClick={()=>setLightboxPhoto(null)}>
      <button style={{position:"absolute",top:20,right:20,width:40,height:40,borderRadius:12,background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      <img src={lightboxPhoto} alt="Voucher" style={{maxWidth:"95vw",maxHeight:"90vh",objectFit:"contain",borderRadius:12,boxShadow:"0 20px 60px rgba(0,0,0,0.8)"}}/>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        body{background:#0A0A0F;}
        ::-webkit-scrollbar{display:none;}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.5);}
        input,select,textarea,button{font-family:'DM Sans',sans-serif;}
        select option{background:#1A1A24;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
      <div style={S.root}>
        {view==="home"   && renderHome()}
        {view==="detail" && renderDetail()}
        {view==="add"    && renderAddEdit()}
        {showCopied    && <div style={S.toast}><span>✓</span> Code copied!</div>}
        {notifToast    && <div style={{...S.toast,top:110,background:"rgba(251,146,60,0.15)",border:"1px solid rgba(251,146,60,0.3)",color:"#fb923c",borderRadius:16,padding:"14px 18px",flexDirection:"column",alignItems:"flex-start",gap:4,maxWidth:340}}><div style={{fontWeight:700,fontSize:13}}>⏰ Reminder Sent!</div><div style={{fontSize:12,color:"#D97706"}}>{notifToast.store} — {daysLeft(notifToast.expiredBy)} days left</div></div>}
        {lightboxPhoto && renderLightbox()}
      </div>
    </>
  );
}
