import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
import { useVouchers } from "./hooks/useVouchers";
import { colors, statusConfig, gradients, breakpoints, typography, spacing, radius } from "./styles/theme";
import Button from "./components/Button";
import IconBtn from "./components/IconBtn";
import Badge from "./components/Badge";
import Tab from "./components/Tab";
import Field from "./components/Field";
import SummaryCard from "./components/SummaryCard";
import ConfirmModal from "./components/ConfirmModal";
import VoucherCard from "./components/VoucherCard";
import PercyLogo from "./components/PercyLogo";

// ─── RESPONSIVE HOOK ────────────────────────────────────────────────
const useBreakpoint = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return {
    isMobile: width < breakpoints.mobile,
    isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,
    isDesktop: width >= breakpoints.tablet,
    width,
  };
};

// ─── EMAILJS CONFIG ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID  || "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY  || "YOUR_PUBLIC_KEY";

// ─── ICON COMPONENT ─────────────────────────────────────────
function Icon({ name, size = 22, color = "currentColor" }) {
  const svgProps = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  const iconMap = {
    bell: <svg {...svgProps}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    settings: <svg {...svgProps}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6m-17.78 7.78l4.24-4.24m5.08-5.08l4.24-4.24"/></svg>,
    wallet: <svg {...svgProps}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/></svg>,
    star: <svg {...svgProps}><polygon points="12 2 15.09 10.26 23.77 10.5 17.94 16.51 20.16 25.5 12 20.13 3.84 25.5 6.06 16.51 0.23 10.5 8.91 10.26 12 2"/></svg>,
    "bar-chart-2": <svg {...svgProps}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    upload: <svg {...svgProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    search: <svg {...svgProps}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    clock: <svg {...svgProps}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    "trending-up": <svg {...svgProps}><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="23 6 23 12 17 12"/></svg>,
    type: <svg {...svgProps}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
    "alert-circle": <svg {...svgProps}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    "check-circle": <svg {...svgProps}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    ticket: <svg {...svgProps}><path d="M2 9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M15 9h2a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z"/><path d="M2 12c0-.552.895-1 2-1h16c1.105 0 2 .448 2 1s-.895 1-2 1H4c-1.105 0-2-.448-2-1z"/></svg>,
    "trash-2": <svg {...svgProps}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
    zap: <svg {...svgProps}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  };
  return iconMap[name] || <span style={{display:"inline-block",width:size,height:size}} />;
}

// ─── CONSTANTS ──────────────────────────────────────────────────
const CATEGORIES     = ["הכל","סופרמרקט","מסעדות","ביגוד","ספרים","בית מרקחת","בידור","נסיעות","אחר"];
const STATUS_OPTIONS = ["active","partial","used"];
const EMPTY_FORM     = { store:"", barcode:"", amount:"", currency:"₪", location:"", expiredBy:"", status:"active", remaining:"", category:"", color:"#10B981", notes:"", favorite:false, photo:null, photo_url:null };

function formatDate(d)      { if (!d) return "—"; return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
function isExpired(d)       { return d && new Date(d) < new Date(); }
function daysLeft(d)        { return Math.ceil((new Date(d)-new Date())/86400000); }
function isExpiringSoon(d)  { const dl=daysLeft(d); return dl>0&&dl<=30; }

async function sendExpiryEmail(toEmail, v) {
  await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service_id:EMAILJS_SERVICE_ID,template_id:EMAILJS_TEMPLATE_ID,user_id:EMAILJS_PUBLIC_KEY,template_params:{to_email:toEmail,store:v.store,code:v.barcode,amount:(v.remaining||0).toFixed(2),currency:v.currency,days_left:daysLeft(v.expiredBy),expiry_date:formatDate(v.expiredBy)}})});
}

function sendBrowserNotification(v) {
  if ("Notification" in window && Notification.permission==="granted") new Notification("Voucher Expiring Soon!",{body:`${v.store} (${v.currency}${v.remaining}) expires ${formatDate(v.expiredBy)} — ${daysLeft(v.expiredBy)}d left.`,tag:`v-${v.id}`});
}

export default function Percy({ session }) {
  const user = session?.user;
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { vouchers, loading, addVoucher, updateVoucher, deleteVoucher, toggleFavorite, markUsed } = useVouchers();

  const [view,              setView]              = useState("home");
  const [selectedId,        setSelectedId]        = useState(null);
  const [filterCategory,    setFilterCategory]    = useState("All");
  const [filterStatus,      setFilterStatus]      = useState("all");
  const [searchQuery,       setSearchQuery]       = useState("");
  const [form,              setForm]              = useState(EMPTY_FORM);
  const [editingId,         setEditingId]         = useState(null);
  const [photoFile,         setPhotoFile]         = useState(null);
  const [sortBy,            setSortBy]            = useState("expiry");
  const [showCopied,        setShowCopied]        = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab,         setActiveTab]         = useState("wallet");
  const [scanState,         setScanState]         = useState("idle");
  const [scanImage,         setScanImage]         = useState(null);
  const [scanError,         setScanError]         = useState("");
  const [scanFields,        setScanFields]        = useState([]);
  const [notifEmail,        setNotifEmail]        = useState("");
  const [browserPermission, setBrowserPermission] = useState("Notification" in window ? Notification.permission : "denied");
  const [inAppAlerts,       setInAppAlerts]       = useState([]);
  const [notifSent,         setNotifSent]         = useState({});
  const [showNotifSetup,    setShowNotifSetup]    = useState(false);
  const [notifToast,        setNotifToast]        = useState(null);
  const [lightboxPhoto,     setLightboxPhoto]     = useState(null);
  const [swipedId,          setSwipedId]          = useState(null);
  const [customCategory,    setCustomCategory]    = useState("");
  const [saving,            setSaving]            = useState(false);
  const [purchaseReminders, setPurchaseReminders] = useState([]);
  const [showReminderForm,  setShowReminderForm]  = useState(false);
  const [reminderForm,      setReminderForm]      = useState({voucherName:"",reminderDate:"",frequency:"monthly",notifications:{inApp:true,email:false,googleCalendar:false}});

  const fileInputRef     = useRef(null);
  const photoFileRef     = useRef(null);
  const selectedVoucher = vouchers.find(v=>v.id===selectedId);

  useEffect(()=>{
    const expiring = vouchers.filter(v=>v.status!=="used"&&isExpiringSoon(v.expiredBy));
    setInAppAlerts(expiring.map(v=>({id:v.id,voucher:v})));
  },[vouchers]);

  // Favorites pinned to top, rest sorted by chosen key
  const sortedVouchers = (list) => {
    const fav     = list.filter(v=>v.favorite);
    const nonFav  = list.filter(v=>!v.favorite);
    const sorter  = (a,b) => sortBy==="expiry"?new Date(a.expiredBy)-new Date(b.expiredBy):sortBy==="amount"?b.remaining-a.remaining:a.store.localeCompare(b.store);
    return [...fav.sort(sorter), ...nonFav.sort(sorter)];
  };

  const filtered = sortedVouchers(vouchers.filter(v=>{
    const matchCat    = filterCategory==="All"||v.category===filterCategory;
    const matchStatus = filterStatus==="all"||v.status===filterStatus;
    const matchSearch = !searchQuery||v.store.toLowerCase().includes(searchQuery.toLowerCase())||(v.barcode||"").toLowerCase().includes(searchQuery.toLowerCase())||v.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab    = activeTab!=="favorites"||v.favorite;
    return matchCat&&matchStatus&&matchSearch&&matchTab;
  }));

  const totalValue        = vouchers.filter(v=>v.status!=="used").reduce((s,v)=>s+(v.remaining||0),0);
  const activeCount       = vouchers.filter(v=>v.status==="active").length;
  const expiringSoonCount = vouchers.filter(v=>v.status!=="used"&&isExpiringSoon(v.expiredBy)).length;

  const requestBrowserPermission = useCallback(async()=>{
    if (!("Notification" in window)) return;
    try {
      setBrowserPermission(await Notification.requestPermission());
    } catch (e) {
      setBrowserPermission("denied");
    }
  },[]);

  const sendAllNotifications = useCallback(async(voucher)=>{
    if (notifSent[voucher.id]) return;
    setNotifSent(p=>({...p,[voucher.id]:true}));
    if (browserPermission==="granted") sendBrowserNotification(voucher);
    if (notifEmail&&EMAILJS_SERVICE_ID!=="YOUR_SERVICE_ID") { try{ await sendExpiryEmail(notifEmail,voucher); }catch(e){} }
    setNotifToast(voucher); setTimeout(()=>setNotifToast(null),5000);
  },[notifSent,browserPermission,notifEmail]);

  function handleCopyCode(code) { navigator.clipboard?.writeText(code).catch(()=>{}); setShowCopied(true); setTimeout(()=>setShowCopied(false),1800); }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const amt = parseFloat(form.amount)||0;
      const rem = form.status==="used"?0:form.status==="partial"?(parseFloat(form.remaining)||amt/2):amt;
      const data = {...form, amount:amt, remaining:rem};
      if (editingId) {
        await updateVoucher(editingId, data, photoFile);
      } else {
        await addVoucher(data, photoFile);
      }
      setForm(EMPTY_FORM); setEditingId(null); setScanState("idle"); setScanImage(null); setPhotoFile(null); setView("home");
    } catch(e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try { await deleteVoucher(id); } catch(e) { console.error(e); }
    setView("home"); setShowDeleteConfirm(false);
  }

  function handleEdit(v) {
    setForm({...v, amount:String(v.amount), remaining:String(v.remaining), photo_url:v.photo});
    setEditingId(v.id); setScanState("idle"); setScanImage(null); setPhotoFile(null); setView("add");
  }

  async function handleImageUpload(e) {
    const file=e.target.files?.[0]; if (!file) return;
    setPhotoFile(file);
    setScanState("scanning"); setScanError(""); setScanFields([]);
    const reader=new FileReader();
    reader.onload=async(ev)=>{
      const dataUrl=ev.target.result; setScanImage(dataUrl);
      setForm(f=>({...f, photo:dataUrl}));
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || process.env.REACT_APP_SUPABASE_ANON_KEY;
        const res = await fetch(`https://epwzytysunutipyabomr.supabase.co/functions/v1/scan-voucher`, {
          method: "POST",
          headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          body: JSON.stringify({ imageBase64: dataUrl.split(",")[1], mimeType: file.type||"image/jpeg" }),
        });
        const extracted = await res.json();
        if (!res.ok) throw new Error(extracted.error||"Scan failed");

        const filled=[]; const next={...EMPTY_FORM, photo:dataUrl};
        if(extracted.store)    { next.store=extracted.store;                                                      filled.push("store"); }
        if(extracted.barcode)  { next.barcode=extracted.barcode;                                                  filled.push("barcode"); }
        if(extracted.amount!=null){ next.amount=String(extracted.amount); next.remaining=String(extracted.amount); filled.push("amount"); }
        if(extracted.currency) next.currency=extracted.currency;
        if(extracted.location) { next.location=extracted.location;                                                filled.push("location"); }
        if(extracted.expiredBy){ next.expiredBy=extracted.expiredBy;                                              filled.push("expiredBy"); }
        if(extracted.category) { next.category=extracted.category;                                                filled.push("category"); }
        if(extracted.notes)    { next.notes=extracted.notes;                                                      filled.push("notes"); }
        if(extracted.color)    next.color=extracted.color;
        setForm(next); setScanFields(filled); setScanState("preview");
      } catch(err) { setScanError("Couldn't read the voucher. Try a clearer photo or fill in manually."); setScanState("error"); }
    };
    reader.readAsDataURL(file); e.target.value="";
  }


  // ── STYLES ───────────────────────────────────────────────────
  const S = {
    root:        { fontFamily:"'DM Sans',sans-serif", background:colors.bg, height:"100%", width:"100%", maxWidth:isDesktop?1280:isTablet?768:"100%", margin:"0 auto", position:"relative", overflow:"hidden", color:colors.textPrimary, transition:"background 0.3s, color 0.3s" },
    phone:       { height:"100%", width:"100%", display:"flex", flexDirection:"column", position:"relative", background:colors.bg },
    statusBar:   { minHeight:56, padding:"max(12px, env(safe-area-inset-top)) 24px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, fontWeight:600, color:colors.textPrimary, flexShrink:0, backgroundColor:colors.surface },
    scrollArea:  { flex:1, overflowY:"auto", paddingBottom:24, WebkitOverflowScrolling:"touch" },
    summaryCard: { flex:1, background:colors.fill1, borderRadius:16, padding:"14px 16px", border:`1px solid ${colors.border}` },
    tab:    (a)=>({ padding:"8px 16px", borderRadius:50, fontSize:13, fontWeight:a?600:500, background:a?colors.primary:"transparent", color:a?colors.bg:colors.textMuted, border:a?`1px solid ${colors.primaryBorder}`:0, cursor:"pointer", whiteSpace:"nowrap" }),
    filterChip:(a)=>({ padding:"6px 14px", borderRadius:50, fontSize:12, fontWeight:a?600:400, background:a?colors.primaryGlow:"transparent", color:a?colors.primary:colors.textMuted, border:a?`1px solid ${colors.primaryBorder}`:`1px solid ${colors.border}`, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }),
    statusBadge:(s)=>({ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:50, fontSize:11, fontWeight:600, background:statusConfig[s]?.bg, color:statusConfig[s]?.color }),
    expiry:(expired,soon)=>({ fontSize:11, color:expired?colors.danger:soon?colors.warning:colors.textMuted, fontWeight:500 }),
    backBtn:     { width:36, height:36, borderRadius:12, background:colors.fill1, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:`1px solid ${colors.border}`, color:colors.textPrimary, fontSize:18 },
    actionBtn:(v)=>({ flex:1, padding:"14px", borderRadius:14, border:"none", fontSize:14, fontWeight:600, cursor:"pointer", background:v==="primary"?gradients.primary:v==="danger"?colors.dangerBg:colors.fill1, color:v==="primary"?"#fff":v==="danger"?colors.danger:colors.textPrimary, boxShadow:v==="primary"?colors.shadowGlow:"none" }),
    formSection: { padding:"0 24px", marginBottom:16 },
    formLabel:   { fontSize:12, color:colors.textSecondary, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:8, display:"block" },
    formInput:   { width:"100%", background:colors.fill1, border:`1px solid ${colors.border}`, borderRadius:14, padding:"13px 16px", fontSize:15, color:colors.textPrimary, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
    formInputFilled:{ width:"100%", background:colors.primaryGlow, border:`1px solid ${colors.primaryBorder}`, borderRadius:14, padding:"13px 16px", fontSize:15, color:colors.textPrimary, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
    segment: (a)=>({ flex:1, padding:"10px 6px", borderRadius:12, fontSize:12, fontWeight:600, background:a?colors.primaryGlow:colors.fill1, color:a?colors.primary:colors.textMuted, border:a?`1px solid ${colors.primaryBorder}`:`1px solid ${colors.border}`, cursor:"pointer", textAlign:"center" }),
    textarea:    { width:"100%", background:colors.fill1, border:`1px solid ${colors.border}`, borderRadius:14, padding:"13px 16px", fontSize:14, color:colors.textPrimary, outline:"none", boxSizing:"border-box", fontFamily:"inherit", resize:"none", minHeight:72 },
    saveBtn:     { margin:"20px 24px", width:"calc(100% - 48px)", padding:"16px", borderRadius:16, border:"none", background:gradients.primary, color:colors.bg, fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:`0 8px 20px ${colors.shadowGlow}` },
    toast:       { position:"fixed", top:60, left:"50%", transform:"translateX(-50%)", background:colors.surfaceRaised, color:colors.textPrimary, padding:"10px 20px", borderRadius:50, fontSize:13, fontWeight:600, zIndex:999, boxShadow:colors.shadowCard, display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap" },
    overlay:     { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200, backdropFilter:"blur(4px)" },
    sheet:       { background:colors.surfaceRaised, borderRadius:"24px 24px 0 0", padding:"28px 24px 48px", width:"100%", maxWidth:390 },
    statGrid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:"0 24px", marginBottom:20 },
    statBox:     { background:colors.fill1, borderRadius:18, padding:"18px 16px", border:`1px solid ${colors.border}` },
    fab:         { position:"fixed", bottom:32, right:24, width:60, height:60, borderRadius:16, background:colors.primary, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:`0 8px 24px ${colors.shadowGlow}`, zIndex:99, border:"none", color:"#fff", fontSize:32, fontWeight:700 },
    navItem: (a)=>({ display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", color:a?colors.primary:colors.textMuted }),
    navLabel:    { fontSize:10, fontWeight:600, letterSpacing:"0.03em" },
    shadowCard:  colors.shadowCard,
    shadowRaised:colors.shadowRaised,
    shadowGlow:  colors.shadowGlow,
    shadowThumb: colors.shadowThumb,
  };

  const isFilled = (f)=>scanState==="preview"&&scanFields.includes(f);
  const inp      = (f)=>isFilled(f)?S.formInputFilled:S.formInput;

  // ── SCAN BANNER ─────────────────────────────────────────────
  const renderScanBanner = () => {
    if (scanState==="idle") return (
      <div>
        <div onClick={()=>fileInputRef.current?.click()} style={{border:`1.5px dashed ${colors.primaryBorder}`,borderRadius:20,padding:"18px 20px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",background:colors.primaryGlow,height:"100%"}}>
          <div style={{width:46,height:46,borderRadius:14,background:"rgba(16,185,129,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>📷</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:colors.primary,marginBottom:3}}>סרוק שובר עם AI</div>
            <div style={{fontSize:12,color:colors.textMuted,lineHeight:1.5}}>תמונה, צילום מסך או דוא״ל — כל השדות מתמלאים באופן אוטומטי</div>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleImageUpload}/>
      </div>
    );
    if (scanState==="scanning") return (
      <div style={{borderRadius:20,overflow:"hidden",background:colors.primaryGlow,border:`1px solid ${colors.primaryBorder}`}}>
        {scanImage&&<img src={scanImage} alt="" style={{width:"100%",maxHeight:160,objectFit:"cover",opacity:0.4,display:"block"}}/>}
        <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:28,height:28,borderRadius:"50%",border:`3px solid ${colors.primary}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
          <div><div style={{fontSize:14,fontWeight:700,color:colors.primary}}>סורק עם AI…</div><div style={{fontSize:12,color:colors.textMuted}}>מחלץ פרטי שובר</div></div>
        </div>
      </div>
    );
    if (scanState==="error") return (
      <div style={{borderRadius:20,padding:"16px 20px",background:colors.dangerBg,border:`1px solid rgba(239,68,68,0.2)`,display:"flex",gap:12}}>
        <div style={{fontSize:20}}>⚠️</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:colors.danger,marginBottom:4}}>Scan failed</div>
          <div style={{fontSize:12,color:colors.textSecondary,marginBottom:10}}>{scanError}</div>
          <button onClick={()=>setScanState("idle")} style={{fontSize:12,fontWeight:600,color:colors.primary,background:colors.primaryGlow,border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer"}}>Try Again</button>
        </div>
      </div>
    );
    if (scanState==="preview") return (
      <div style={{borderRadius:20,overflow:"hidden",background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.2)"}}>
        {scanImage&&<img src={scanImage} alt="" style={{width:"100%",maxHeight:150,objectFit:"cover",display:"block"}}/>}
        <div style={{padding:"14px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:16}}>✅</span>
            <span style={{fontSize:14,fontWeight:700,color:colors.success}}>סריקה הושלמה!</span>
            <span style={{fontSize:12,color:colors.textSecondary,marginLeft:2}}>{scanFields.length} שדות מולאו</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            {scanFields.map(f=><span key={f} style={{fontSize:11,padding:"3px 10px",borderRadius:50,background:colors.activeBg,color:colors.active,fontWeight:600,textTransform:"capitalize"}}>{f==="expiredBy"?"תאריך תפוגה":f==="barcode"?"קוד":f}</span>)}
          </div>
          <button onClick={()=>{setScanState("idle");setScanImage(null);setForm(EMPTY_FORM);setPhotoFile(null);}} style={{fontSize:12,fontWeight:600,color:colors.textSecondary,background:"rgba(255,255,255,0.06)",border:"none",borderRadius:10,padding:"8px 16px",cursor:"pointer"}}>🔄 סרוק שוב</button>
        </div>
      </div>
    );
  };

  // ── IN-APP ALERTS ────────────────────────────────────────────
  const renderInAppAlerts = () => {
    if (inAppAlerts.length===0) return null;
    return (
      <div style={{margin:"16px 24px 20px"}}>
        {inAppAlerts.map(({id,voucher:v})=>(
          <div key={id} style={{borderRadius:16,padding:"16px",background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.25)",marginBottom:12,display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:20}}>⏰</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:colors.warning,marginBottom:3}}>{v.store} פוגים בעוד {daysLeft(v.expiredBy)} ימים</div>
              <div style={{fontSize:11,color:colors.textSecondary}}>{v.currency}{v.remaining} · {formatDate(v.expiredBy)}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
              <button onClick={()=>sendAllNotifications(v)} style={{fontSize:11,fontWeight:600,padding:"6px 12px",borderRadius:8,background:"rgba(251,146,60,0.2)",border:"1px solid rgba(251,146,60,0.4)",color:colors.warning,cursor:"pointer",whiteSpace:"nowrap"}}>{notifSent[v.id]?"✓ נשלח":"הודע לי"}</button>
              <button onClick={()=>setInAppAlerts(a=>a.filter(x=>x.id!==id))} style={{fontSize:10,color:colors.textMuted,background:"none",border:"none",cursor:"pointer"}}>סגור</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── CARD ────────────────────────────────────────────────────
  const renderCard = (v) => {
    const pct     = v.amount>0?(v.remaining/v.amount)*100:0;
    const expired = isExpired(v.expiredBy);
    const days    = daysLeft(v.expiredBy);
    const soon30  = days>0&&days<=30;
    const soon14  = days>0&&days<=14;
    const isOpen  = swipedId===v.id;

    return (
      <div key={v.id} style={{margin:"0 24px 12px",position:"relative",borderRadius:20,overflow:"hidden"}}>
        {/* Card */}
        <div style={{borderRadius:20,overflow:"hidden",background:v.status==="used"?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.06)",border:`1px solid ${v.status==="used"?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.1)"}`,opacity:v.status==="used"?0.55:1,position:"relative",transform:isOpen?"translateX(-108px)":"translateX(0)",transition:"transform 0.25s cubic-bezier(0.4,0,0.2,1)"}}>
          {/* Expiry badge */}
          {soon30&&!expired&&<div style={{position:"absolute",top:10,left:10,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:50,background:"rgba(251,146,60,0.15)",color:colors.warning,border:"1px solid rgba(251,146,60,0.3)",zIndex:2}}>{days}d</div>}

          {/* Swipe handle */}
          {v.status!=="used"&&<button onClick={e=>{e.stopPropagation(); setSwipedId(isOpen?null:v.id);}} style={{position:"absolute",top:10,right:10,zIndex:3,width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.1)",border:`1px solid ${colors.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:colors.textMuted}} title="Mark as used">✓</button>}

          {/* Top color strip */}
          <div style={{height:3,background:v.color,borderRadius:"20px 20px 0 0"}}/>

          <div style={{padding:"14px 16px"}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              {/* Photo thumbnail */}
              {v.photo&&(
                <div onClick={e=>{e.stopPropagation(); setLightboxPhoto(v.photo);}} style={{width:52,height:52,borderRadius:12,overflow:"hidden",flexShrink:0,border:"2px solid rgba(255,255,255,0.12)",cursor:"zoom-in",marginTop:soon30&&!expired?14:2,boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
                  <img src={v.photo} alt="voucher" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
              )}

              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{paddingTop:soon30&&!expired?14:0,paddingRight:v.status!=="used"?32:8,flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:700,color:colors.textPrimary,letterSpacing:"-0.01em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.store}</div>
                    <div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:colors.textSecondary,background:"rgba(255,255,255,0.06)",padding:"4px 10px",borderRadius:8,marginTop:4,display:"inline-block",letterSpacing:"0.08em"}}>{v.barcode}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:16,fontWeight:700,color:colors.textPrimary}}>{v.currency}{(v.remaining||0).toFixed(0)}</div>
                    {v.status==="partial"&&<div style={{fontSize:10,color:colors.textSecondary}}>מתוך {v.currency}{v.amount}</div>}
                  </div>
                </div>
                {v.status==="partial"&&(
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
                    <div style={S.expiry(expired,soon14)}>{expired?"⚠ פג תוקף":soon14?`⏰ ${days} ימים נותרים`:`פוגים ${formatDate(v.expiredBy)}`}</div>
                    {v.location&&<div style={{fontSize:10,color:colors.textMuted}}>📍 {v.location}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite star — pinned */}
          {v.favorite&&<div style={{position:"absolute",top:14,right:v.status!=="used"?46:14,fontSize:14,zIndex:2}}>★</div>}

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
        <div style={S.statusBar}><span>Percy</span><span>▮</span></div>
        <div style={S.scrollArea}>
          <div style={{padding:"8px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button style={S.backBtn} onClick={()=>setView("home")}>←</button>
            <div style={{display:"flex",gap:10}}>
              {isExpiringSoon(v.expiredBy)&&v.status!=="used"&&(
                <button style={{...S.backBtn,background:"rgba(251,146,60,0.12)",color:colors.warning,fontSize:14}} onClick={()=>sendAllNotifications(v)}>{notifSent[v.id]?"✓":"🔔"}</button>
              )}
              <button style={{...S.backBtn,color:v.favorite?"#fbbf24":"inherit"}} onClick={()=>toggleFavorite(v.id)}>{v.favorite?"★":"☆"}</button>
              <button style={S.backBtn} onClick={()=>handleEdit(v)}>✏️</button>
            </div>
          </div>

          {/* Banner */}
          <div style={{margin:"20px 24px 0",borderRadius:24,background:"rgba(255,255,255,0.06)",border:`1px solid ${colors.border}`,overflow:"hidden"}}>
            <div style={{background:v.color,padding:"28px 24px 24px"}}>
              <div style={{fontSize:30,fontWeight:800,color:"#fff",letterSpacing:"-0.02em",marginBottom:4,textShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>{v.store}</div>
              <div style={{fontSize:44,fontWeight:800,color:"#fff",letterSpacing:"-0.03em",textShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>{v.currency}{(v.remaining||0).toFixed(2)}</div>
              {v.status==="partial"&&<div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginTop:4}}>נותר מתוך {v.currency}{v.amount}</div>}
              <div style={{marginTop:12}}><div style={S.statusBadge(v.status)}><span style={{width:5,height:5,borderRadius:"50%",background:statusConfig[v.status]?.dot,display:"inline-block"}}/>{statusConfig[v.status]?.label}</div></div>
            </div>

            {/* Voucher photo */}
            {v.photo&&(
              <div onClick={()=>setLightboxPhoto(v.photo)} style={{cursor:"zoom-in",position:"relative",overflow:"hidden",background:"#0d0d0d",borderBottom:`1px solid ${colors.border}`}}>
                <img src={v.photo} alt="Voucher" style={{width:"100%",maxHeight:210,objectFit:"contain",display:"block"}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,background:"linear-gradient(transparent,rgba(0,0,0,0.5))",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:8}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:600,letterSpacing:"0.08em"}}>לחץ להרחבה</span>
                </div>
              </div>
            )}

            {v.status==="partial"&&(
              <div style={{padding:"12px 24px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:colors.textSecondary,marginBottom:6}}><span>יתרה בשימוש</span><span>{(100-pct).toFixed(0)}%</span></div>
                <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:v.color,borderRadius:6}}/>
                </div>
              </div>
            )}

            <div style={{padding:"20px 24px"}}>
              {[["קטגוריה",v.category||"—"],["מיקום",v.location||"—"],["פוגים",expired?`פג תוקף (${formatDate(v.expiredBy)})`:days<=30?`${days} ימים נותרים (${formatDate(v.expiredBy)})`:formatDate(v.expiredBy)],["ערך מקורי",`${v.currency}${v.amount}`],...(v.notes?[["הערות",v.notes]]:[])].map(([label,val])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid rgba(255,255,255,0.05)`}}>
                  <span style={{fontSize:13,color:colors.textMuted,fontWeight:500}}>{label}</span>
                  <span style={{fontSize:14,color:label==="Expires"&&expired?colors.danger:label==="Expires"&&days<=30?colors.warning:colors.textPrimary,fontWeight:600,textAlign:"right",maxWidth:"60%"}}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${colors.border}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",margin:"16px 24px 0"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,letterSpacing:"0.12em",color:colors.primary}}>{v.barcode}</span>
            <button style={{background:colors.primaryGlow,border:`1px solid ${colors.primaryBorder}`,borderRadius:10,padding:"6px 14px",color:colors.primary,fontSize:12,fontWeight:600,cursor:"pointer"}} onClick={()=>handleCopyCode(v.barcode)}>העתק</button>
          </div>

          <div style={{display:"flex",gap:10,padding:"16px 24px 0"}}>
            {v.status!=="used"&&<button style={S.actionBtn("primary")} onClick={()=>{markUsed(v.id);setView("home");}}>✓ סמן כנוצל</button>}
            <button style={S.actionBtn("secondary")} onClick={()=>handleEdit(v)}>ערוך</button>
            <button style={S.actionBtn("danger")} onClick={()=>setShowDeleteConfirm(true)}>מחק</button>
          </div>
          <div style={{height:40}}/>
        </div>

        {showDeleteConfirm&&(
          <div style={S.overlay} onClick={()=>setShowDeleteConfirm(false)}>
            <div style={S.sheet} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:20,fontWeight:700,marginBottom:8}}>מחק שובר?</div>
              <div style={{color:colors.textSecondary,marginBottom:24,fontSize:14}}>זה יסיר לצמיתות את השובר של "{v.store}".</div>
              <div style={{display:"flex",gap:10}}>
                <button style={{...S.actionBtn("secondary"),flex:1,padding:14}} onClick={()=>setShowDeleteConfirm(false)}>ביטול</button>
                <button style={{...S.actionBtn("danger"),flex:1,padding:14}} onClick={()=>handleDelete(v.id)}>מחק</button>
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
      <div style={S.statusBar}><span>Percy</span><span>▮</span></div>
      <div style={S.scrollArea}>
        <div style={{padding:"8px 24px 20px",display:"flex",alignItems:"center",gap:12}}>
          <button style={S.backBtn} onClick={()=>{setView("home");setEditingId(null);setForm(EMPTY_FORM);setScanState("idle");setScanImage(null);setPhotoFile(null);}}>←</button>
          <div style={{fontSize:22,fontWeight:700,color:colors.textPrimary}}>{editingId?"ערוך שובר":"שובר חדש"}</div>
        </div>

        {!editingId&&(
          <>
            <div style={{padding:"0 24px 10px",fontSize:11,fontWeight:600,color:colors.textMuted,letterSpacing:"0.05em",textTransform:"uppercase"}}>מילוי AI אוטומטי</div>

            {/* Upload and AI Scan side by side */}
            <div style={{margin:"0 24px 10px",display:"flex",gap:10,alignItems:"stretch"}}>
              <button onClick={()=>photoFileRef.current?.click()} style={{minWidth:50,borderRadius:12,border:`1.5px solid ${colors.primaryBorder}`,background:colors.primaryGlow,cursor:"pointer",color:colors.primary,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:"0 12px",fontSize:20}}>
                📁
              </button>
              <div style={{flex:1}}>
                {renderScanBanner()}
              </div>
              <input ref={photoFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload}/>
            </div>

            {/* Photo preview */}
            {form.photo&&(
              <div style={{margin:"0 24px 10px"}}>
                <div style={{position:"relative",borderRadius:14,overflow:"hidden",border:`1px solid ${colors.border}`}}>
                  <img src={form.photo} alt="" style={{width:"100%",maxHeight:160,objectFit:"contain",background:"#111",display:"block"}}/>
                  <button onClick={()=>{setForm(f=>({...f,photo:null,photo_url:null}));setPhotoFile(null);}} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:8,background:"rgba(0,0,0,0.6)",border:"none",color:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>
              </div>
            )}

            <div style={{padding:"16px 24px 10px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
              <span style={{fontSize:11,color:colors.textMuted,fontWeight:600}}>{scanState==="preview"?"בדוק וערוך":"מלא ידנית"}</span>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
            </div>
          </>
        )}

        <div style={S.formSection}>
          <label style={S.formLabel}>שם החנות {isFilled("store")&&<span style={{color:colors.active,fontSize:10,fontWeight:700}}>✦ מולא על ידי AI</span>}</label>
          <input style={inp("store")} placeholder="למשל ניקי, אמזון..." value={form.store} onChange={e=>setForm(f=>({...f,store:e.target.value}))}/>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>ברקוד / קוד {isFilled("barcode")&&<span style={{color:colors.active,fontSize:10,fontWeight:700}}>✦ מולא על ידי AI</span>}</label>
          <input style={{...inp("barcode"),fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}} placeholder="למשל SAVE20XYZ" value={form.barcode} onChange={e=>setForm(f=>({...f,barcode:e.target.value.toUpperCase()}))}/>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>סכום {isFilled("amount")&&<span style={{color:colors.active,fontSize:10,fontWeight:700}}>✦ מולא על ידי AI</span>}</label>
          <div style={{display:"flex",gap:8}}>
            <select style={{...S.formInput,width:70,flexShrink:0}} value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>
              {["₪","$","€","£","¥"].map(c=><option key={c} value={c} style={{background:"#1A1A24"}}>{c}</option>)}
            </select>
            <input style={inp("amount")} type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value,remaining:e.target.value}))}/>
          </div>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>סטטוס</label>
          <div style={{display:"flex",gap:6}}>{STATUS_OPTIONS.map(s=><button key={s} style={S.segment(form.status===s)} onClick={()=>setForm(f=>({...f,status:s}))}>{statusConfig[s].label}</button>)}</div>
        </div>
        {form.status==="partial"&&(
          <div style={S.formSection}>
            <label style={S.formLabel}>הסכום הנותר</label>
            <input style={S.formInput} type="number" placeholder="יתרת הקרדיט" value={form.remaining} onChange={e=>setForm(f=>({...f,remaining:e.target.value}))}/>
          </div>
        )}
        <div style={S.formSection}>
          <label style={S.formLabel}>קטגוריה {isFilled("category")&&<span style={{color:colors.active,fontSize:10,fontWeight:700}}>✦ מולא על ידי AI</span>}</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
            {CATEGORIES.filter(c=>c!=="All").map(c=><button key={c} style={S.filterChip(form.category===c)} onClick={()=>setForm(f=>({...f,category:c}))}>{c}</button>)}
          </div>
          <input style={S.formInput} placeholder="או הקלד קטגוריה מותאמת…" value={customCategory} onChange={e=>setCustomCategory(e.target.value)} onBlur={e=>{if(e.target.value.trim()){setForm(f=>({...f,category:e.target.value.trim()}));setCustomCategory("");}}}/>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>מיקום {isFilled("location")&&<span style={{color:colors.active,fontSize:10,fontWeight:700}}>✦ מולא על ידי AI</span>}</label>
          <input style={inp("location")} placeholder="מקוון / שם החנות..." value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>תאריך תפוגה {isFilled("expiredBy")&&<span style={{color:colors.active,fontSize:10,fontWeight:700}}>✦ מולא על ידי AI</span>}</label>
          <input style={inp("expiredBy")} type="date" value={form.expiredBy} onChange={e=>setForm(f=>({...f,expiredBy:e.target.value}))}/>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>צבע המותג</label>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            {["#10B981","#1DB954","#00704A","#FF9900","#e11d48","#0ea5e9","#b5e550","#1a1a2e"].map(c=>(
              <div key={c} onClick={()=>setForm(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:8,background:c,cursor:"pointer",border:form.color===c?"2px solid #fff":"2px solid transparent",boxShadow:form.color===c?`0 0 0 2px ${c}`:"none"}}/>
            ))}
            <input type="color" value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} style={{width:28,height:28,borderRadius:8,cursor:"pointer",border:"none",padding:0}}/>
          </div>
        </div>
        <div style={S.formSection}>
          <label style={S.formLabel}>הערות {isFilled("notes")&&<span style={{color:colors.active,fontSize:10,fontWeight:700}}>✦ מולא על ידי AI</span>}</label>
          <textarea style={{...S.textarea,...(isFilled("notes")?{background:colors.primaryGlow,border:`1px solid ${colors.primaryBorder}`}:{})}} placeholder="כל פרט נוסף..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
        </div>
        <div style={S.formSection}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0"}}>
            <span style={{fontSize:14,color:colors.textPrimary,fontWeight:500}}>★ נקד לעדפים</span>
            <div onClick={()=>setForm(f=>({...f,favorite:!f.favorite}))} style={{width:44,height:26,borderRadius:50,cursor:"pointer",background:form.favorite?colors.primary:"rgba(255,255,255,0.1)",position:"relative",transition:"background 0.2s"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:form.favorite?colors.bg:"#fff",position:"absolute",top:3,left:form.favorite?21:3,transition:"left 0.2s"}}/>
            </div>
          </div>
        </div>
        <button style={{...S.saveBtn,opacity:(!form.store||saving)?0.5:1}} onClick={handleSave} disabled={!form.store||saving}>{saving?"שומר…":editingId?"שמור שינויים":"הוסף שובר"}</button>
      </div>
    </div>
  );

  // ── STATS ────────────────────────────────────────────────────
  const renderStats = () => {
    const usedCount   = vouchers.filter(v=>v.status==="used").length;
    const halfCount   = vouchers.filter(v=>v.status==="partial").length;
    const savedTotal  = vouchers.reduce((s,v)=>s+(v.amount||0),0);
    const remaining   = vouchers.filter(v=>v.status!=="used").reduce((s,v)=>s+(v.remaining||0),0);
    const expiredCount= vouchers.filter(v=>v.status!=="used"&&isExpired(v.expiredBy)).length;
    const allCats     = [...new Set(vouchers.map(v=>v.category).filter(Boolean))];
    const catBreakdown= allCats.map(c=>({name:c,count:vouchers.filter(v=>v.category===c).length,value:vouchers.filter(v=>v.category===c).reduce((s,v)=>s+(v.remaining||0),0)})).sort((a,b)=>b.value-a.value);
    return (
      <div>
        <div style={{padding:"0 24px 16px",fontSize:18,fontWeight:700}}>סקירה כללית</div>
        <div style={S.statGrid}>
          {[["wallet",vouchers.length,"סה״כ"],["check-circle",activeCount,"פעיל"],["zap",halfCount,"חלקי"],["trash-2",usedCount,"נוצל"],["trending-up",`${vouchers[0]?.currency||"₪"}${remaining.toFixed(0)}`,"זמין"],["alert-circle",expiredCount,"פג תוקף"]].map(([icon,num,lbl])=>(
            <div key={lbl} style={S.statBox}><div style={{fontSize:24,fontWeight:800,marginBottom:2}}>{num}</div><div style={{fontSize:11,color:colors.textMuted,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em"}}>{lbl}</div></div>
          ))}
        </div>
        {catBreakdown.length>0&&savedTotal>0&&(
          <div style={{padding:"0 24px"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:12}}>לפי קטגוריה</div>
            {catBreakdown.map(c=>(
              <div key={c.name} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span style={{color:"#D1D5DB"}}>{c.name}</span><span style={{color:colors.textSecondary}}>{c.value.toFixed(0)} · {c.count} {c.count>1?"שוברים":"שובר"}</span></div>
                <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(c.value/savedTotal)*100)}%`,background:colors.primary,borderRadius:4}}/></div>
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
          <div><div style={{fontSize:20,fontWeight:800,marginBottom:4}}>🔔 הגדרות תזכורות</div><div style={{fontSize:13,color:colors.textMuted}}>קבל התראה 30 יום לפני התפוגה</div></div>
          <button style={{...S.backBtn,fontSize:16}} onClick={()=>setShowNotifSetup(false)}>✕</button>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${colors.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>📱</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>התראות בתוך האפליקציה</div><div style={{fontSize:12,color:colors.textMuted}}>רצועות מוצגות כשאתה פותח את האפליקציה</div></div><div style={{padding:"4px 12px",borderRadius:50,background:colors.activeBg,color:colors.active,fontSize:11,fontWeight:600}}>פעיל</div></div>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${colors.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:18}}>🖥</span><div><div style={{fontSize:14,fontWeight:700}}>התראות דפדפן</div><div style={{fontSize:12,color:colors.textMuted}}>התראות פוש של שולחן עבודה</div></div></div>
          {browserPermission==="granted"?<div style={{display:"flex",gap:8}}><div style={{padding:"4px 12px",borderRadius:50,background:colors.activeBg,color:colors.active,fontSize:11,fontWeight:600}}>✓ מופעל</div><button onClick={()=>{const v=vouchers.find(x=>x.status!=="used"&&isExpiringSoon(x.expiredBy));if(v)sendBrowserNotification(v);}} style={{fontSize:11,color:colors.primary,background:colors.primaryGlow,border:`1px solid ${colors.primaryBorder}`,borderRadius:8,padding:"4px 12px",cursor:"pointer"}}>שלח בדיקה</button></div>:browserPermission==="denied"?<div style={{fontSize:12,color:colors.danger}}>חסום בהגדרות הדפדפן.</div>:<button onClick={requestBrowserPermission} style={{...S.actionBtn("primary"),flex:"none",padding:"10px 20px",fontSize:13}}>אפשר התראות דפדפן</button>}
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"16px",marginBottom:16,border:`1px solid ${colors.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:18}}>📧</span><div><div style={{fontSize:14,fontWeight:700}}>תזכורות דוא״ל</div><div style={{fontSize:12,color:colors.textMuted}}>דוא״ל תפוגה של 30 יום</div></div></div>
          <input style={{...S.formInput,marginBottom:10}} type="email" placeholder="your@email.com" value={notifEmail} onChange={e=>setNotifEmail(e.target.value)}/>
        </div>
        {inAppAlerts.length>0&&<div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>פוגים תוך 30 יום:</div>
          {inAppAlerts.map(({voucher:v})=>(
            <div key={v.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"rgba(251,146,60,0.06)",borderRadius:12,marginBottom:8,border:"1px solid rgba(251,146,60,0.15)"}}>
              <div><div style={{fontSize:13,fontWeight:600}}>{v.store}</div><div style={{fontSize:11,color:colors.textSecondary}}>{daysLeft(v.expiredBy)} ימים · {formatDate(v.expiredBy)}</div></div>
              <button onClick={()=>sendAllNotifications(v)} style={{fontSize:11,fontWeight:600,padding:"6px 14px",borderRadius:8,background:notifSent[v.id]?colors.activeBg:"rgba(251,146,60,0.15)",border:`1px solid ${notifSent[v.id]?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,color:notifSent[v.id]?colors.active:colors.warning,cursor:"pointer"}}>{notifSent[v.id]?"✓ הודעתי":"הודע →"}</button>
            </div>
          ))}
        </div>}

        {/* Purchase Reminders */}
        <div style={{marginTop:24,borderTop:`1px solid ${colors.border}`,paddingTop:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700}}>🔔 תזכורות רכישה</div>
            <button onClick={()=>setShowReminderForm(!showReminderForm)} style={{fontSize:12,color:colors.primary,background:colors.primaryGlow,border:`1px solid ${colors.primaryBorder}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:600}}>+ הוסף</button>
          </div>

          {showReminderForm&&(
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"16px",marginBottom:16,border:`1px solid ${colors.border}`}}>
              <input style={{...S.formInput,marginBottom:12}} placeholder="שם השובר (למשל: Netflix)" value={reminderForm.voucherName} onChange={e=>setReminderForm(f=>({...f,voucherName:e.target.value}))}/>
              <select style={{...S.formInput,marginBottom:12}} value={reminderForm.frequency} onChange={e=>setReminderForm(f=>({...f,frequency:e.target.value}))}>
                <option value="monthly">כל חודש</option>
                <option value="yearly">כל שנה</option>
                <option value="weekly">כל שבוע</option>
                <option value="custom">בתאריך ספציפי</option>
              </select>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,fontWeight:600,color:colors.textSecondary,marginBottom:6,display:"block"}}>בחר תאריך</label>
                <input style={{...S.formInput,width:"100%",boxSizing:"border-box"}} type="date" value={reminderForm.reminderDate} onChange={e=>setReminderForm(f=>({...f,reminderDate:e.target.value}))}/>
              </div>

              <div style={{fontSize:12,fontWeight:600,marginBottom:10,color:colors.textSecondary}}>אפשרויות הודעה:</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:12,border:`1px solid ${colors.border}`,cursor:"pointer"}} onClick={()=>setReminderForm(f=>({...f,notifications:{...f.notifications,inApp:!f.notifications.inApp}}))}>
                  <div style={{width:20,height:20,borderRadius:6,background:reminderForm.notifications.inApp?colors.primary:"transparent",border:`2px solid ${reminderForm.notifications.inApp?colors.primary:colors.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {reminderForm.notifications.inApp&&<span style={{fontSize:12,color:"#fff"}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,color:colors.textPrimary}}>הודעה בתוך האפליקציה</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:12,border:`1px solid ${colors.border}`,cursor:"pointer"}} onClick={()=>setReminderForm(f=>({...f,notifications:{...f.notifications,email:!f.notifications.email}}))}>
                  <div style={{width:20,height:20,borderRadius:6,background:reminderForm.notifications.email?colors.primary:"transparent",border:`2px solid ${reminderForm.notifications.email?colors.primary:colors.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {reminderForm.notifications.email&&<span style={{fontSize:12,color:"#fff"}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,color:colors.textPrimary}}>הודעה למייל</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:12,border:`1px solid ${colors.border}`,cursor:"pointer"}} onClick={()=>setReminderForm(f=>({...f,notifications:{...f.notifications,googleCalendar:!f.notifications.googleCalendar}}))}>
                  <div style={{width:20,height:20,borderRadius:6,background:reminderForm.notifications.googleCalendar?colors.primary:"transparent",border:`2px solid ${reminderForm.notifications.googleCalendar?colors.primary:colors.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {reminderForm.notifications.googleCalendar&&<span style={{fontSize:12,color:"#fff"}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,color:colors.textPrimary}}>Google Calendar</span>
                </div>
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{if(reminderForm.voucherName&&reminderForm.reminderDate){setPurchaseReminders([...purchaseReminders,{...reminderForm,id:Date.now()}]);setReminderForm({voucherName:"",reminderDate:"",frequency:"monthly",notifications:{inApp:true,email:false,googleCalendar:false}});setShowReminderForm(false);}}} style={{flex:1,...S.actionBtn("primary"),fontSize:12}}>שמור תזכורת</button>
                <button onClick={()=>setShowReminderForm(false)} style={{flex:1,...S.actionBtn("primary"),background:colors.fill1,color:colors.textPrimary,fontSize:12}}>ביטול</button>
              </div>
            </div>
          )}

          {purchaseReminders.length>0&&(
            <div>
              {purchaseReminders.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"rgba(52,211,153,0.08)",borderRadius:12,marginBottom:8,border:"1px solid rgba(52,211,153,0.2)"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:colors.textPrimary}}>{r.voucherName}</div>
                    <div style={{fontSize:11,color:colors.textSecondary}}>{r.reminderDate} · {r.frequency==="monthly"?"כל חודש":r.frequency==="yearly"?"כל שנה":r.frequency==="weekly"?"כל שבוע":"בתאריך ספציפי"}</div>
                  </div>
                  <button onClick={()=>setPurchaseReminders(purchaseReminders.filter(x=>x.id!==r.id))} style={{fontSize:12,color:colors.danger,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>מחק</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign out */}
        <button onClick={()=>supabase.auth.signOut()} style={{width:"100%",padding:"12px",borderRadius:14,border:`1px solid ${colors.border}`,background:"transparent",color:colors.danger,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:8,fontFamily:"inherit"}}>התנתק</button>
        <button style={{...S.saveBtn,margin:"8px 0 0"}} onClick={()=>setShowNotifSetup(false)}>בוצע</button>
      </div>
    </div>
  );

  // ── HOME ────────────────────────────────────────────────────
  const renderHome = () => (
    <div style={S.phone}>
      <div style={S.statusBar}>
        <PercyLogo variant="icon" size="xs" />
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowNotifSetup(true)} style={{position:"relative",width:40,height:40,borderRadius:13,background:"rgba(255,255,255,0.06)",border:`1px solid ${colors.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>
            🔔{inAppAlerts.length>0&&<div style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:colors.warning,border:"2px solid #0A0A0F"}}/>}
          </button>
          <button onClick={()=>setShowNotifSetup(true)} style={{width:40,height:40,borderRadius:13,background:"rgba(255,255,255,0.06)",border:`1px solid ${colors.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>
            ⚙️
          </button>
        </div>
      </div>
      <div style={S.scrollArea} onClick={()=>swipedId&&setSwipedId(null)}>
        <div style={{padding:"16px 24px 20px"}}>
          <div style={{fontSize:13,color:colors.textSecondary,marginBottom:6}}>ברוך הבא{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!</div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <div style={S.summaryCard}><div style={{fontSize:11,color:colors.textSecondary,fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:6}}>סה״כ ערך</div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em"}}>{vouchers[0]?.currency||"₪"}{totalValue.toFixed(0)}</div></div>
            <div style={S.summaryCard}><div style={{fontSize:11,color:colors.textSecondary,fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:6}}>פעיל</div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em"}}>{activeCount}</div></div>
            <div style={{...S.summaryCard,borderColor:expiringSoonCount>0?"rgba(251,146,60,0.3)":undefined}}><div style={{fontSize:11,color:colors.textSecondary,fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:6}}>פג בקרוב</div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em",color:expiringSoonCount>0?colors.warning:colors.textPrimary}}>{expiringSoonCount}</div></div>
          </div>
        </div>
        {renderInAppAlerts()}
        <div style={{display:"flex",gap:6,padding:"0 24px",marginBottom:20}}>
          {[["wallet","הכל"],["favorites","שמורים"],["stats","סטטיסטיקה"]].map(([t,l])=><button key={t} style={S.tab(activeTab===t)} onClick={()=>setActiveTab(t)}>{l}</button>)}
        </div>
        {activeTab==="stats"?renderStats():(
          loading?(
            <div style={{textAlign:"center",padding:"60px",color:colors.textMuted}}>
              <div style={{fontSize:24,marginBottom:8}}>⏳</div>
              <div>טוען שוברים...</div>
            </div>
          ):(
            <>
              <div style={{margin:"0 24px 16px",background:"rgba(255,255,255,0.06)",borderRadius:14,display:"flex",alignItems:"center",padding:"0 14px",gap:10,border:`1px solid ${colors.border}`}}>
                <span style={{color:colors.textMuted}}>🔍</span>
                <input style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:15,color:colors.textPrimary,padding:"12px 0"}} placeholder="חפש חנות, קוד..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                {searchQuery&&<span style={{cursor:"pointer",color:colors.textMuted}} onClick={()=>setSearchQuery("")}>✕</span>}
              </div>
              <div style={{display:"flex",gap:8,padding:"0 24px",marginBottom:16,overflowX:"auto",scrollbarWidth:"none"}}>
                {[["all","הכל"],["active","פעיל"],["partial","חלקי"],["used","נוצל"]].map(([k,l])=>(
                  <button key={k} style={{...S.filterChip(filterStatus===k),color:k!=="all"&&filterStatus===k?statusConfig[k]?.color:undefined}} onClick={()=>setFilterStatus(k)}>{l}</button>
                ))}
                <div style={{marginLeft:"auto",display:"flex",gap:6,flexShrink:0}}>
                  {[["expiry","תפוגה"],["amount","סכום"],["store","שם"]].map(([k,label])=>(
                    <button key={k} style={{padding:"6px 10px",borderRadius:50,fontSize:11,background:sortBy===k?colors.primaryGlow:"transparent",border:`1px solid ${colors.border}`,cursor:"pointer",color:sortBy===k?colors.primary:colors.textMuted}} onClick={()=>setSortBy(k)}>{label}</button>
                  ))}
                </div>
              </div>
              {filtered.length===0?(
                <div style={{textAlign:"center",padding:"60px 40px",color:colors.textMuted}}>
                  <div style={{marginBottom:12,fontSize:48}}>🎫</div>
                  <div style={{fontSize:16,fontWeight:600,marginBottom:6,color:colors.textSecondary}}>אין שוברים עדיין</div>
                  <div style={{fontSize:13}}>לחץ + להוספת השובר הראשון</div>
                </div>
              ):filtered.map(v=>renderCard(v))}
            </>
          )
        )}
      </div>
      <button onClick={()=>{setForm(EMPTY_FORM);setEditingId(null);setScanState("idle");setScanImage(null);setPhotoFile(null);setView("add");}} style={{position:"fixed",bottom:32,right:24,width:60,height:60,borderRadius:16,background:colors.primary,border:"none",color:"#fff",fontSize:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 8px 24px ${colors.shadowGlow}`,zIndex:99}}>+</button>
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
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap');
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
        {notifToast    && <div style={{...S.toast,top:110,background:"rgba(251,146,60,0.15)",border:"1px solid rgba(251,146,60,0.3)",color:colors.warning,borderRadius:16,padding:"14px 18px",flexDirection:"column",alignItems:"flex-start",gap:4,maxWidth:340}}><div style={{fontWeight:700,fontSize:13}}>Reminder Sent!</div><div style={{fontSize:12,color:"#D97706"}}>{notifToast.store} — {daysLeft(notifToast.expiredBy)} days left</div></div>}
        {lightboxPhoto && renderLightbox()}
      </div>
    </>
  );
}
