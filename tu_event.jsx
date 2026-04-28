
// ─── TicketUp — Event Detail + Ticket Table ────────────────────────────────

function EventPage({ event, setPage, setCheckoutListing }) {
  const [listings, setListings]   = React.useState([]);
  const [loading, setLoading]     = React.useState(true);
  const [sortBy, setSortBy]       = React.useState("price"); // price | zone | qty
  const [filterZone, setFilterZone] = React.useState("");
  const [filterQty, setFilterQty]   = React.useState("");

  React.useEffect(() => {
    if (!event) return;
    window.scrollTo({ top:0 });
    loadListings();
  }, [event]);

  async function loadListings() {
    setLoading(true);
    try {
      const data = await sbFetch(
        `listing?select=id,buyer_total_price,currency,ticket_type,listing_type,bundle_size,zone,row,seat_from,seat_to,status,event_id&event_id=eq.${event.id}&order=buyer_total_price.asc`
      );
      setListings(data || []);
    } catch { setListings([]); }
    finally { setLoading(false); }
  }

  if (!event) return null;

  const zones = Array.from(new Set(listings.map(l => l.zone).filter(Boolean))).sort();

  const sorted = [...listings]
    .filter(l => !filterZone || l.zone === filterZone)
    .filter(l => !filterQty  || String(l.bundle_size) === filterQty)
    .sort((a, b) => {
      if (sortBy === "price") return Number(a.buyer_total_price) - Number(b.buyer_total_price);
      if (sortBy === "zone")  return (a.zone||"").localeCompare(b.zone||"");
      if (sortBy === "qty")   return a.bundle_size - b.bundle_size;
      return 0;
    });

  const minPrice = listings.length ? Math.min(...listings.map(l => Number(l.buyer_total_price))) : null;

  function handleBuy(listing) {
    setCheckoutListing({ listing, event });
    setPage("checkout");
    window.scrollTo({ top:0 });
  }

  const m = TYPE_META[event.event_type] || TYPE_META.OTHER;

  return (
    <div>
      {/* ── EVENT HERO ── */}
      <div style={{ background:`linear-gradient(160deg, ${m.grad[0]}, ${m.grad[1]})`, position:"relative", overflow:"hidden" }}>
        {/* dot pattern */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.06 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="hero-dots" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="white"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#hero-dots)"/>
        </svg>

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px 36px", position:"relative", zIndex:1 }}>
          {/* Breadcrumb */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, fontSize:13 }}>
            <button onClick={() => setPage("home")} style={{
              background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
              color:"rgba(255,255,255,0.6)", fontSize:13, padding:0
            }}>← Eventos</button>
            <span style={{ color:"rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color:"rgba(255,255,255,0.8)" }}>{event.name}</span>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:20, flexWrap:"wrap" }}>
            <div>
              <TypeBadge type={event.event_type} size="md"/>
              <h1 style={{
                fontSize:38, fontWeight:800, color:"#fff",
                letterSpacing:"-0.04em", lineHeight:1.1, margin:"10px 0 10px"
              }}>{event.name}</h1>
              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                {[
                  { icon:"📍", text:`${event.city} · ${event.venue_name}` },
                  { icon:"🗓",  text: formatDate(event.start_datetime) },
                ].map(i => (
                  <div key={i.text} style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:"rgba(255,255,255,0.7)" }}>
                    <span>{i.icon}</span><span>{i.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price from box */}
            {minPrice !== null && (
              <div style={{
                background:"rgba(0,0,0,0.35)", backdropFilter:"blur(16px)",
                border:"1px solid rgba(255,255,255,0.15)",
                borderRadius:16, padding:"16px 22px", textAlign:"center", flexShrink:0
              }}>
                <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.5)", letterSpacing:"0.06em", marginBottom:4 }}>DESDE</div>
                <div style={{ fontSize:30, fontWeight:800, color:"#fff", letterSpacing:"-0.03em" }}>{eur(minPrice)}</div>
                <div style={{ fontSize:11, color:"var(--accent)", fontWeight:600, marginTop:3 }}>✓ precio final · gastos incluidos</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── LISTINGS ── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 60px" }}>

        {/* Trust strip */}
        <TrustRow/>

        <div style={{ marginTop:28, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:16 }}>
          <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.02em" }}>
            Entradas disponibles
            {!loading && <span style={{ fontSize:14, fontWeight:400, color:"var(--muted)", marginLeft:8 }}>{sorted.length} {sorted.length === 1 ? "resultado" : "resultados"}</span>}
          </h2>

          {/* Filters + sort */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            {zones.length > 1 && (
              <select value={filterZone} onChange={e => setFilterZone(e.target.value)} style={selectStyle}>
                <option value="">Todas las zonas</option>
                {zones.map(z => <option key={z} value={z}>Zona {z}</option>)}
              </select>
            )}
            <select value={filterQty} onChange={e => setFilterQty(e.target.value)} style={selectStyle}>
              <option value="">Cualquier cantidad</option>
              <option value="1">1 entrada</option>
              <option value="2">2 entradas</option>
              <option value="4">4 entradas</option>
            </select>
            <div style={{ display:"flex", gap:4 }}>
              {[{ k:"price", l:"Precio" },{ k:"zone", l:"Zona" },{ k:"qty", l:"Cantidad" }].map(s => (
                <button key={s.k} onClick={() => setSortBy(s.k)} style={{
                  padding:"7px 12px", borderRadius:8, border:"1px solid",
                  fontFamily:"inherit", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                  borderColor: sortBy===s.k ? "var(--accent)" : "var(--border)",
                  background: sortBy===s.k ? "var(--accent-faint)" : "#fff",
                  color: sortBy===s.k ? "var(--accent)" : "var(--muted)",
                }}>{s.l}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <TicketTableSkeleton/>
        ) : sorted.length === 0 ? (
          <div style={{ padding:"56px 24px", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12, opacity:0.3 }}>🎫</div>
            <div style={{ fontWeight:700, fontSize:17, marginBottom:6 }}>Sin entradas disponibles</div>
            <div style={{ color:"var(--muted)", fontSize:14 }}>Vuelve más tarde o activa alertas.</div>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{
              display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 120px",
              gap:12, padding:"10px 16px", borderRadius:"10px 10px 0 0",
              background:"#F4F3EF", border:"1px solid var(--border)", borderBottom:"none"
            }}>
              {["Tipo / Zona","Cantidad","Asientos","Precio final",""].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:"0.05em", textTransform:"uppercase" }}>{h}</div>
              ))}
            </div>

            {/* Table rows */}
            <div style={{ border:"1px solid var(--border)", borderRadius:"0 0 12px 12px", overflow:"hidden" }}>
              {sorted.map((l, i) => <TicketRow key={l.id} listing={l} isLast={i===sorted.length-1} onBuy={handleBuy}/>)}
            </div>

            <div style={{ marginTop:14, padding:"12px 16px", borderRadius:10, background:"#F8F7F4", border:"1px solid var(--border)", display:"flex", gap:8, alignItems:"center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="var(--accent)" strokeWidth="1.5"/>
                <path d="M7 5v2.5M7 9v.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize:12, color:"var(--muted)" }}>
                Todos los precios son finales. Los gastos de gestión ya están incluidos.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const selectStyle = {
  padding:"7px 12px", borderRadius:8, border:"1px solid var(--border)",
  background:"#fff", fontSize:13, fontFamily:"inherit",
  color:"var(--text)", outline:"none", cursor:"pointer"
};

function TicketRow({ listing, isLast, onBuy }) {
  const [h, setH] = React.useState(false);

  const seatLabel = [];
  if (listing.zone) seatLabel.push(`Zona ${listing.zone}`);
  if (listing.row)  seatLabel.push(`Fila ${listing.row}`);
  const seats = listing.seat_from && listing.seat_to && listing.seat_from !== listing.seat_to
    ? `${listing.seat_from}–${listing.seat_to}`
    : listing.seat_from ? `Asiento ${listing.seat_from}` : "—";

  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 120px",
        gap:12, padding:"14px 16px", alignItems:"center",
        background: h ? "#FAFAF8" : "#fff",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        transition:"background 0.1s"
      }}
    >
      <div>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>
          {listing.ticket_type === "PDF" ? "PDF · e-ticket" : "Transferencia oficial"}
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          <Chip>{listing.listing_type}</Chip>
          {seatLabel.length > 0 && <Chip>{seatLabel.join(" · ")}</Chip>}
          {listing.ticket_type === "OFFICIAL_TRANSFER" && <Badge color="blue">App oficial</Badge>}
        </div>
      </div>
      <div style={{ fontSize:14, fontWeight:600 }}>
        ×{listing.bundle_size} {listing.bundle_size === 1 ? "entrada" : "entradas"}
      </div>
      <div style={{ fontSize:13, color:"var(--muted)" }}>{seats}</div>
      <div>
        <div style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.03em" }}>
          {eur(listing.buyer_total_price)}
        </div>
        <div style={{ fontSize:10, color:"var(--accent)", fontWeight:600, marginTop:1 }}>✓ precio final</div>
      </div>
      <div>
        <Btn size="sm" onClick={() => onBuy(listing)} full>Comprar</Btn>
      </div>
    </div>
  );
}

function TicketTableSkeleton() {
  return (
    <div style={{ border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
      {Array.from({length:4}).map((_,i) => (
        <div key={i} style={{
          display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 120px",
          gap:12, padding:"16px", borderBottom:"1px solid var(--border)",
          background:"#fff"
        }}>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            <Skeleton h={14} w="70%"/>
            <Skeleton h={11} w="50%"/>
          </div>
          <Skeleton h={14} w="60%"/>
          <Skeleton h={14} w="50%"/>
          <Skeleton h={20} w="80%"/>
          <Skeleton h={34} r={8}/>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { EventPage });
