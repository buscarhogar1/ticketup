
// ─── TicketUp — Shared Utils, Supabase, Design Tokens, Base Components ───────

const SUPABASE_URL = "https://vfgrldputubahgydvjyp.supabase.co";
const SUPABASE_KEY = "sb_publishable_HS4VO8tJULsRqgG51AMbtA_b4SVB4ID";

async function sbFetch(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sbCount(table, filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Prefer": "count=exact",
      "Range": "0-0",
    },
  });
  const raw = res.headers.get("Content-Range") || "0/0";
  return parseInt(raw.split("/")[1] || "0", 10);
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }); }
  catch { return iso; }
}
function formatDateShort(iso) {
  try { return new Date(iso).toLocaleString("es-ES", { weekday:"short", day:"numeric", month:"short" }); }
  catch { return iso; }
}
function formatDateMini(iso) {
  try { return new Date(iso).toLocaleString("es-ES", { day:"numeric", month:"short" }); }
  catch { return iso; }
}
function eur(n) {
  const v = Number(n);
  if (isNaN(v)) return "—";
  return new Intl.NumberFormat("es-ES", { style:"currency", currency:"EUR" }).format(v);
}

const EVENT_TYPES = [
  { key:"",          label:"Todos",    icon:"🎟" },
  { key:"FOOTBALL",  label:"Fútbol",   icon:"⚽" },
  { key:"CONCERT",   label:"Música",   icon:"🎵" },
  { key:"THEATRE",   label:"Teatro",   icon:"🎭" },
  { key:"FESTIVAL",  label:"Festival", icon:"🎪" },
  { key:"SPORT",     label:"Deporte",  icon:"🏆" },
  { key:"COMEDY",    label:"Comedia",  icon:"😄" },
  { key:"OTHER",     label:"Otros",    icon:"✨" },
];

const TYPE_META = {
  FOOTBALL:  { grad:["#0D3B8E","#1A6FCC"], accent:"#4A9EFF" },
  CONCERT:   { grad:["#4A0080","#9333EA"], accent:"#C084FC" },
  THEATRE:   { grad:["#7C2400","#EA580C"], accent:"#FB923C" },
  FESTIVAL:  { grad:["#831843","#E11D78"], accent:"#F472B6" },
  SPORT:     { grad:["#064E3B","#059669"], accent:"#34D399" },
  COMEDY:    { grad:["#713F12","#CA8A04"], accent:"#FCD34D" },
  OTHER:     { grad:["#1E293B","#475569"], accent:"#94A3B8" },
};

// ─── Base UI Components ────────────────────────────────────────────────────

function EventBanner({ type, name, height = 200 }) {
  const m = TYPE_META[type] || TYPE_META.OTHER;
  const initials = (name || "??").split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase();
  return (
    <div style={{
      height, background:`linear-gradient(135deg, ${m.grad[0]}, ${m.grad[1]})`,
      position:"relative", overflow:"hidden", display:"flex",
      alignItems:"center", justifyContent:"center", flexShrink:0
    }}>
      {/* subtle pattern */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.08}} viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id={`p-${type}`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <circle cx="6" cy="6" r="1.5" fill="white"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#p-${type})`}/>
      </svg>
      <span style={{
        fontSize: height > 120 ? 48 : 28, fontWeight:800, color:"white",
        opacity:0.25, letterSpacing:"-0.04em", position:"relative", zIndex:1
      }}>{initials}</span>
    </div>
  );
}

function TypeBadge({ type, size = "sm" }) {
  const m = TYPE_META[type];
  const t = EVENT_TYPES.find(x => x.key === type);
  if (!m || !type) return null;
  const p = size === "sm" ? "3px 8px" : "5px 12px";
  const fs = size === "sm" ? 11 : 13;
  return (
    <span style={{
      display:"inline-block", padding:p, borderRadius:999,
      background: m.grad[0] + "22", color: m.grad[1],
      fontSize:fs, fontWeight:600, letterSpacing:"0.02em",
      border:`1px solid ${m.grad[1]}33`
    }}>{t?.label || type}</span>
  );
}

function Pill({ children, accent, onClick, active }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding:"7px 14px", borderRadius:999, fontSize:13, fontWeight:500,
        border:`1px solid`, fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s",
        borderColor: active ? "var(--accent)" : h ? "#CBD5E1" : "var(--border)",
        background: active ? "var(--accent-faint)" : h ? "#F8F7F4" : "#fff",
        color: active ? "var(--accent)" : "var(--text)",
      }}>{children}</button>
  );
}

function Btn({ children, variant="primary", size="md", onClick, disabled, full, style:sx }) {
  const [h, setH] = React.useState(false);
  const base = {
    fontFamily:"inherit", cursor: disabled ? "not-allowed" : "pointer",
    border:"none", borderRadius:10, fontWeight:600, transition:"all 0.15s",
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
    opacity: disabled ? 0.5 : 1, width: full ? "100%" : undefined,
    ...sx
  };
  const sizes = { sm:"8px 14px", md:"11px 20px", lg:"14px 28px" };
  const fss = { sm:13, md:14, lg:16 };
  const variants = {
    primary: { background: h ? "var(--accent-hover)" : "var(--accent)", color:"#fff" },
    ghost:   { background: h ? "#F0F0ED" : "transparent", color:"var(--text)", border:"1px solid var(--border)" },
    white:   { background: h ? "#F0F0ED" : "#fff", color:"var(--text)" },
    danger:  { background: h ? "#B91C1C" : "#DC2626", color:"#fff" },
  };
  return (
    <button onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...base, padding:sizes[size], fontSize:fss[size], ...variants[variant] }}
    >{children}</button>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      padding:"3px 9px", borderRadius:999, border:"1px solid var(--border)",
      fontSize:12, color:"var(--muted)", background:"#FAFAF8", fontWeight:500
    }}>{children}</span>
  );
}

function Badge({ children, color = "green" }) {
  const c = {
    green:  { bg:"#DCFCE7", text:"#15803D" },
    yellow: { bg:"#FEF9C3", text:"#854D0E" },
    red:    { bg:"#FEE2E2", text:"#B91C1C" },
    gray:   { bg:"#F1F5F9", text:"#475569" },
    blue:   { bg:"#DBEAFE", text:"#1D4ED8" },
    accent: { bg:"var(--accent-faint)", text:"var(--accent)" },
  }[color] || { bg:"#F1F5F9", text:"#475569" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"3px 8px", borderRadius:999, fontSize:11, fontWeight:600,
      background:c.bg, color:c.text
    }}>{children}</span>
  );
}

function Skeleton({ w, h = 14, r = 6 }) {
  return (
    <div style={{
      width: w || "100%", height: h, borderRadius: r,
      background:"linear-gradient(90deg,#EEECEA 25%,#E5E3DF 50%,#EEECEA 75%)",
      backgroundSize:"200% 100%", animation:"tu-shimmer 1.4s infinite"
    }}/>
  );
}

function Divider() {
  return <div style={{height:1, background:"var(--border)", margin:"0"}} />;
}

function TrustRow() {
  return (
    <div style={{
      display:"flex", gap:20, flexWrap:"wrap", padding:"12px 16px",
      borderRadius:10, background:"var(--accent-faint)",
      border:"1px solid var(--accent-faint2)"
    }}>
      {[
        { icon:"✓", text:"Precio final · sin sorpresas" },
        { icon:"🔒", text:"Pago retenido hasta el evento" },
        { icon:"↩", text:"Reembolso si la entrada no es válida" },
      ].map(t => (
        <div key={t.text} style={{display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:500, color:"var(--accent)"}}>
          <span>{t.icon}</span><span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

// Modal backdrop
function Modal({ children, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
        display:"flex", alignItems:"center", justifyContent:"center",
        zIndex:1000, padding:16, backdropFilter:"blur(4px)"
      }}>
      <div style={{
        background:"var(--card)", borderRadius:20, padding:28,
        maxWidth:480, width:"100%", boxShadow:"0 24px 60px rgba(0,0,0,0.18)",
        maxHeight:"90vh", overflowY:"auto"
      }}>
        {children}
      </div>
    </div>
  );
}

// Topbar
function Topbar({ page, setPage, user, setUser }) {
  return (
    <header style={{
      background:"#0A0A0F", position:"sticky", top:0, zIndex:200,
      borderBottom:"1px solid rgba(255,255,255,0.07)"
    }}>
      <div style={{
        maxWidth:1200, margin:"0 auto", padding:"0 24px",
        display:"flex", alignItems:"center", height:60, gap:16
      }}>
        {/* Logo */}
        <button onClick={() => setPage("home")} style={{
          display:"flex", alignItems:"center", gap:9, background:"none",
          border:"none", cursor:"pointer", padding:0, flexShrink:0
        }}>
          <div style={{
            width:32, height:32, borderRadius:9,
            background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M8 2v12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <div style={{fontWeight:800, fontSize:15, color:"#fff", letterSpacing:"-0.02em"}}>TicketUp</div>
            <div style={{fontSize:9, color:"rgba(255,255,255,0.4)", letterSpacing:"0.04em", marginTop:-1}}>PRECIO FINAL</div>
          </div>
        </button>

        {/* Nav */}
        <nav style={{display:"flex", gap:4, marginLeft:16}}>
          {[
            { id:"home", label:"Eventos" },
            { id:"sell", label:"Vender" },
            { id:"panel", label:"Mi panel" },
          ].map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              background:"none", border:"none", cursor:"pointer",
              padding:"6px 12px", borderRadius:8, fontFamily:"inherit",
              fontSize:14, fontWeight:500, transition:"all 0.15s",
              color: page === n.id ? "#fff" : "rgba(255,255,255,0.5)",
              background: page === n.id ? "rgba(255,255,255,0.1)" : "none",
            }}>{n.label}</button>
          ))}
        </nav>

        <div style={{flex:1}}/>

        {/* Actions */}
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          {user ? (
            <>
              <span style={{fontSize:13, color:"rgba(255,255,255,0.6)"}}>{user.name}</span>
              <Btn size="sm" variant="ghost" onClick={() => setUser(null)}
                style={{color:"rgba(255,255,255,0.7)", borderColor:"rgba(255,255,255,0.15)"}}>
                Salir
              </Btn>
            </>
          ) : (
            <>
              <Btn size="sm" variant="ghost" onClick={() => setUser({ name:"María G.", email:"maria@example.com" })}
                style={{color:"rgba(255,255,255,0.7)", borderColor:"rgba(255,255,255,0.15)"}}>
                Iniciar sesión
              </Btn>
              <Btn size="sm" onClick={() => setPage("sell")}
                style={{background:"var(--accent)"}}>
                Vende tu entrada
              </Btn>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Footer
function Footer({ setPage }) {
  return (
    <footer style={{ background:"#0A0A0F", borderTop:"1px solid rgba(255,255,255,0.07)", padding:"32px 24px", marginTop:48 }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:32 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2v12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontWeight:800, fontSize:15, color:"#fff" }}>TicketUp</span>
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6, maxWidth:220 }}>
              Marketplace de reventa de entradas. Precio final, sin sorpresas.
            </p>
          </div>
          {[
            { title:"Comprar", links:["Cómo funciona","Garantías","Reclamaciones"] },
            { title:"Vender",  links:["Publicar entrada","Tipos aceptados","Pagos"] },
            { title:"Legal",   links:["Términos de uso","Privacidad","Cookies"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", marginBottom:10, textTransform:"uppercase" }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ marginBottom:6 }}>
                  <a href="#" onClick={e => e.preventDefault()} style={{ fontSize:13, color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>{l}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <Divider/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20, gap:12, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>© 2026 TicketUp. Todos los derechos reservados.</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>Solo operamos en España 🇪🇸</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, {
  sbFetch, sbCount,
  formatDate, formatDateShort, formatDateMini, eur,
  EVENT_TYPES, TYPE_META,
  EventBanner, TypeBadge, Pill, Btn, Chip, Badge, Skeleton, Divider, TrustRow, Modal,
  Topbar, Footer,
});
