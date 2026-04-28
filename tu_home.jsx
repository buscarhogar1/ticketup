
// ─── TicketUp — Home Page ──────────────────────────────────────────────────

function HomePage({ setPage, setActiveEvent }) {
  const { useState, useEffect } = React;

  const [events, setEvents]   = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [query, setQuery]         = React.useState("");
  const [liveQ, setLiveQ]         = React.useState("");
  const [dateFrom, setDateFrom]   = React.useState("");
  const [dateTo, setDateTo]       = React.useState("");
  const [city, setCity]           = React.useState("");
  const [type, setType]           = React.useState("");
  const [onlyTickets, setOnly]    = React.useState(false);

  React.useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const data = await sbFetch("event?select=id,name,start_datetime,venue_name,city,event_type,is_paused&is_paused=eq.false&order=start_datetime.asc");
      const with_counts = await Promise.all((data || []).map(async ev => {
        try {
          const c = await sbCount("listing", `event_id=eq.${ev.id}&status=eq.PUBLISHED`);
          return { ...ev, _count: c };
        } catch { return { ...ev, _count: 0 }; }
      }));
      setEvents(with_counts);
    } catch (e) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const cities = Array.from(new Set(events.map(e => e.city))).filter(Boolean).sort((a,b) => a.localeCompare(b,"es"));

  const filtered = events.filter(ev => {
    const q = liveQ.toLowerCase().trim();
    if (q && !`${ev.name} ${ev.city} ${ev.venue_name}`.toLowerCase().includes(q)) return false;
    if (city && ev.city !== city) return false;
    if (type && (ev.event_type||"") !== type) return false;
    if (dateFrom && new Date(ev.start_datetime) < new Date(dateFrom+"T00:00:00")) return false;
    if (dateTo   && new Date(ev.start_datetime) > new Date(dateTo+"T23:59:59"))   return false;
    if (onlyTickets && !ev._count) return false;
    return true;
  });

  const featured = [...events].sort((a,b) => (b._count||0)-(a._count||0)).slice(0,8);

  function openEvent(ev) {
    setActiveEvent(ev);
    setPage("event");
    window.scrollTo({ top:0 });
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        background:"linear-gradient(160deg, #0A0A0F 0%, #111827 55%, #0F1F10 100%)",
        padding:"56px 24px 48px", marginBottom:0
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <h1 style={{
              fontSize:52, fontWeight:800, color:"#fff",
              letterSpacing:"-0.04em", lineHeight:1.05, marginBottom:12
            }}>
              Entradas reales.<br/>
              <span style={{ color:"var(--accent)" }}>Precio final.</span>
            </h1>
            <p style={{ fontSize:17, color:"rgba(255,255,255,0.5)", maxWidth:480, margin:"0 auto" }}>
              El precio que ves es el precio que pagas. Siempre. Sin gastos de gestión ocultos.
            </p>
          </div>

          {/* Search card */}
          <div style={{
            background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)",
            border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:20, padding:20, maxWidth:800, margin:"0 auto"
          }}>
            {/* Main search row */}
            <div style={{
              display:"flex", gap:10, marginBottom:14,
              background:"#fff", borderRadius:12, padding:"6px 6px 6px 16px",
              alignItems:"center"
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ color:"#9CA3AF", flexShrink:0 }}>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setLiveQ(query)}
                placeholder="Artista, equipo, sala o evento…"
                style={{
                  flex:1, border:0, outline:"none", fontSize:15,
                  fontFamily:"inherit", background:"transparent",
                  padding:"9px 0", color:"var(--text)"
                }}
              />
              <button onClick={() => setLiveQ(query)} style={{
                padding:"10px 22px", borderRadius:9, border:"none",
                background:"var(--accent)", color:"#fff", fontWeight:700,
                fontSize:14, fontFamily:"inherit", cursor:"pointer",
                transition:"background 0.15s", whiteSpace:"nowrap"
              }}
                onMouseEnter={e => e.target.style.background="var(--accent-hover)"}
                onMouseLeave={e => e.target.style.background="var(--accent)"}
              >Buscar</button>
            </div>

            {/* Filters row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { id:"df", label:"Desde", type:"date", val:dateFrom, fn:setDateFrom },
                { id:"dt", label:"Hasta", type:"date", val:dateTo,   fn:setDateTo },
              ].map(f => (
                <div key={f.id}>
                  <label style={{ display:"block", fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:5 }}>{f.label}</label>
                  <input type={f.type} value={f.val} onChange={e => f.fn(e.target.value)} style={{
                    width:"100%", padding:"9px 12px", borderRadius:9,
                    border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.08)",
                    fontSize:13, fontFamily:"inherit", color:"#fff", outline:"none",
                    colorScheme:"dark"
                  }}/>
                </div>
              ))}
              <div>
                <label style={{ display:"block", fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:5 }}>Ciudad</label>
                <select value={city} onChange={e => setCity(e.target.value)} style={{
                  width:"100%", padding:"9px 12px", borderRadius:9,
                  border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.08)",
                  fontSize:13, fontFamily:"inherit", color:"#fff", outline:"none", cursor:"pointer"
                }}>
                  <option value="" style={{ background:"#1a1a2e" }}>Cualquier ciudad</option>
                  {cities.map(c => <option key={c} value={c} style={{ background:"#1a1a2e" }}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Type chips */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginTop:16 }}>
            {EVENT_TYPES.map(t => (
              <button key={t.key} onClick={() => setType(t.key)} style={{
                padding:"7px 14px", borderRadius:999, fontSize:13, fontWeight:500,
                border:"1px solid", fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s",
                borderColor: type === t.key ? "var(--accent)" : "rgba(255,255,255,0.15)",
                background:   type === t.key ? "var(--accent)" : "rgba(255,255,255,0.06)",
                color:        type === t.key ? "#fff" : "rgba(255,255,255,0.6)",
              }}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>

        {/* Trust bar */}
        <TrustRow/>

        {/* Featured carousel */}
        {!loading && featured.length > 0 && (
          <section style={{ marginTop:40 }}>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.03em" }}>Más entradas disponibles</h2>
              <span style={{ fontSize:13, color:"var(--muted)" }}>Desliza →</span>
            </div>
            <div style={{
              display:"flex", gap:14, overflowX:"auto", paddingBottom:8,
              scrollSnapType:"x mandatory", scrollbarWidth:"thin"
            }}>
              {featured.map(ev => <FeaturedCard key={ev.id} ev={ev} onClick={openEvent}/>)}
            </div>
          </section>
        )}

        {/* Events grid */}
        <section style={{ marginTop:44 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, gap:8 }}>
            <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.03em" }}>
              {liveQ ? `Resultados para "${liveQ}"` : "Próximos eventos"}
            </h2>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {!loading && <span style={{ fontSize:13, color:"var(--muted)" }}>{filtered.length} eventos</span>}
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"var(--muted)", cursor:"pointer" }}>
                <input type="checkbox" checked={onlyTickets} onChange={e => setOnly(e.target.checked)} style={{ accentColor:"var(--accent)" }}/>
                Solo con entradas
              </label>
            </div>
          </div>

          {loading ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
              {Array.from({length:6}).map((_,i) => (
                <div key={i} style={{ background:"var(--card)", borderRadius:14, border:"1px solid var(--border)", overflow:"hidden" }}>
                  <div style={{ height:160, background:"#F0EFEB" }}/>
                  <div style={{ padding:14, display:"flex", flexDirection:"column", gap:8 }}>
                    <Skeleton h={16} w="75%"/>
                    <Skeleton h={12} w="55%"/>
                    <Skeleton h={12} w="40%"/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:"64px 24px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12, opacity:0.4 }}>🎫</div>
              <div style={{ fontWeight:700, fontSize:17, marginBottom:6 }}>Sin resultados</div>
              <div style={{ color:"var(--muted)", fontSize:14 }}>Prueba con otros filtros o amplía las fechas.</div>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
              {filtered.map(ev => <EventCard key={ev.id} ev={ev} onClick={openEvent}/>)}
            </div>
          )}
        </section>

        {/* How it works */}
        <section style={{ marginTop:64 }}>
          <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.03em", textAlign:"center", marginBottom:32 }}>¿Cómo funciona TicketUp?</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:20 }}>
            {[
              { n:"01", t:"Precio final desde el primer clic", d:"Lo que ves es lo que pagas. Sin cargos añadidos en el checkout." },
              { n:"02", t:"Pago seguro y retenido", d:"Tu dinero queda retenido hasta después del evento. No se libera antes." },
              { n:"03", t:"Entradas verificadas", d:"Revisamos manualmente cada listado antes de publicarlo." },
              { n:"04", t:"Reclamación en 24 h", d:"Si la entrada no funciona, tienes 24 h desde el inicio del evento para reclamar." },
            ].map(s => (
              <div key={s.n} style={{
                background:"var(--card)", borderRadius:14, border:"1px solid var(--border)",
                padding:20, boxShadow:"var(--shadow-sm)"
              }}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--accent)", letterSpacing:"0.1em", marginBottom:10 }}>{s.n}</div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:7, letterSpacing:"-0.01em" }}>{s.t}</div>
                <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.55 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Featured Card
function FeaturedCard({ ev, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <div onClick={() => onClick(ev)}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        minWidth:260, maxWidth:280, borderRadius:16, border:"1px solid var(--border)",
        overflow:"hidden", background:"var(--card)", cursor:"pointer", flexShrink:0,
        scrollSnapAlign:"start", transform: h ? "translateY(-3px)" : "translateY(0)",
        boxShadow: h ? "var(--shadow-md)" : "var(--shadow-sm)", transition:"all 0.2s ease"
      }}>
      <EventBanner type={ev.event_type} name={ev.name} height={150}/>
      <div style={{ padding:"12px 14px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6, marginBottom:5 }}>
          <div style={{ fontWeight:700, fontSize:14, lineHeight:1.3, letterSpacing:"-0.01em" }}>{ev.name}</div>
          <TypeBadge type={ev.event_type}/>
        </div>
        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:8 }}>
          {ev.city} · {formatDateMini(ev.start_datetime)}
        </div>
        {ev._count > 0
          ? <Badge color="accent">● {ev._count} entradas</Badge>
          : <Badge color="gray">Sin entradas</Badge>
        }
      </div>
    </div>
  );
}

// Event Card (grid)
function EventCard({ ev, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <div onClick={() => onClick(ev)}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background:"var(--card)", borderRadius:14, border:"1px solid var(--border)",
        overflow:"hidden", cursor:"pointer",
        transform: h ? "translateY(-2px)" : "translateY(0)",
        boxShadow: h ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition:"all 0.2s ease"
      }}>
      <EventBanner type={ev.event_type} name={ev.name} height={140}/>
      <div style={{ padding:"12px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:6, marginBottom:4, alignItems:"flex-start" }}>
          <div style={{ fontWeight:700, fontSize:14, letterSpacing:"-0.01em", lineHeight:1.3 }}>{ev.name}</div>
          <TypeBadge type={ev.event_type}/>
        </div>
        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>
          {ev.venue_name} · {ev.city}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>
            {formatDateShort(ev.start_datetime)}
          </span>
          {ev._count > 0
            ? <span style={{ fontSize:12, fontWeight:700, color:"var(--accent)" }}>{ev._count} entradas →</span>
            : <span style={{ fontSize:12, color:"var(--muted)", fontStyle:"italic" }}>Sin entradas</span>
          }
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomePage });
