
// ─── TicketUp — Checkout, Sell Flow, Seller Panel ─────────────────────────

// ══ CHECKOUT FLOW ══════════════════════════════════════════════════════════
function CheckoutPage({ data, setPage }) {
  const [step, setStep] = React.useState(0); // 0=review 1=payment 2=confirm
  const [agreed, setAgreed] = React.useState(false);
  const [cardNum, setCardNum] = React.useState("");
  const [cardExp, setCardExp] = React.useState("");
  const [cardCvc, setCardCvc] = React.useState("");
  const [done, setDone] = React.useState(false);

  if (!data) return null;
  const { listing, event } = data;

  const steps = ["Resumen", "Pago", "Confirmación"];

  function handlePay() {
    setStep(2);
    setDone(true);
  }

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 24px 60px" }}>
      {/* Back */}
      <button onClick={() => setPage("event")} style={{
        background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
        fontSize:13, color:"var(--muted)", padding:0, marginBottom:20
      }}>← Volver al evento</button>

      <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.03em", marginBottom:24 }}>Comprar entrada</h1>

      {/* Step indicator */}
      <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{
                width:28, height:28, borderRadius:999, display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700,
                background: i <= step ? "var(--accent)" : "var(--border)",
                color: i <= step ? "#fff" : "var(--muted)"
              }}>{i < step ? "✓" : i+1}</div>
              <span style={{ fontSize:13, fontWeight: i===step ? 700 : 400, color: i===step ? "var(--text)" : "var(--muted)" }}>{s}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1, height:1, background:"var(--border)", margin:"0 10px" }}/>}
          </React.Fragment>
        ))}
      </div>

      {step === 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Order summary */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
            <EventBanner type={event.event_type} name={event.name} height={120}/>
            <div style={{ padding:20 }}>
              <div style={{ fontWeight:700, fontSize:18, letterSpacing:"-0.02em", marginBottom:6 }}>{event.name}</div>
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:16 }}>
                {event.city} · {formatDate(event.start_datetime)}
              </div>
              <Divider/>
              <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  ["Tipo de entrada", listing.ticket_type === "PDF" ? "PDF / e-ticket" : "Transferencia oficial"],
                  ["Cantidad", `${listing.bundle_size} ${listing.bundle_size===1?"entrada":"entradas"}`],
                  listing.zone ? ["Zona", listing.zone] : null,
                  listing.row  ? ["Fila",  listing.row]  : null,
                ].filter(Boolean).map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}>
                    <span style={{ color:"var(--muted)" }}>{k}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <Divider/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                  <span style={{ fontWeight:700, fontSize:16 }}>Total a pagar</span>
                  <span style={{ fontWeight:800, fontSize:24, letterSpacing:"-0.03em" }}>{eur(listing.buyer_total_price)}</span>
                </div>
                <div style={{ fontSize:12, color:"var(--accent)", fontWeight:600 }}>✓ Precio final · gastos de gestión incluidos</div>
              </div>
            </div>
          </div>

          {/* Escrow notice */}
          <div style={{
            background:"var(--accent-faint)", border:"1px solid var(--accent-faint2)",
            borderRadius:12, padding:16, fontSize:13, color:"var(--accent)", lineHeight:1.6
          }}>
            <strong>🔒 Tu pago queda retenido hasta después del evento.</strong><br/>
            No se libera al vendedor hasta que el evento haya tenido lugar. Si la entrada no funciona, tienes 24 h para reclamar el reembolso completo.
          </div>

          {/* Agreement */}
          <label style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer", fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop:2, accentColor:"var(--accent)", flexShrink:0 }}/>
            He leído y acepto los <a href="#" onClick={e=>e.preventDefault()} style={{ color:"var(--accent)" }}>Términos de uso</a> y entiendo que el precio mostrado es el precio final.
          </label>

          <Btn onClick={() => agreed && setStep(1)} disabled={!agreed} size="lg" full>
            Continuar al pago →
          </Btn>
        </div>
      )}

      {step === 1 && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:20 }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:16, letterSpacing:"-0.01em" }}>Datos de pago</div>
            {[
              { label:"Número de tarjeta", ph:"0000 0000 0000 0000", val:cardNum, fn:setCardNum },
              { label:"Caducidad", ph:"MM/AA", val:cardExp, fn:setCardExp },
              { label:"CVC", ph:"123", val:cardCvc, fn:setCardCvc },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--muted)", marginBottom:6 }}>{f.label}</label>
                <input
                  value={f.val} onChange={e => f.fn(e.target.value)}
                  placeholder={f.ph}
                  style={{
                    width:"100%", padding:"11px 14px", borderRadius:9,
                    border:"1px solid var(--border)", fontSize:14,
                    fontFamily:"inherit", outline:"none", background:"#FAFAF8"
                  }}
                  onFocus={e => e.target.style.borderColor="var(--accent)"}
                  onBlur={e  => e.target.style.borderColor="var(--border)"}
                />
              </div>
            ))}
            <div style={{ marginTop:4, padding:"10px 14px", borderRadius:8, background:"#F8F7F4", fontSize:12, color:"var(--muted)" }}>
              🔒 Pago procesado de forma segura. TicketUp no almacena datos de tarjeta.
            </div>
          </div>

          {/* Summary aside */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, marginBottom:6 }}>
              <span style={{ color:"var(--muted)" }}>{event.name}</span>
              <span style={{ fontWeight:700 }}>{eur(listing.buyer_total_price)}</span>
            </div>
            <div style={{ fontSize:12, color:"var(--accent)", fontWeight:600 }}>✓ precio final incluido</div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="ghost" size="lg" onClick={() => setStep(0)}>← Atrás</Btn>
            <Btn size="lg" full onClick={handlePay}>Pagar {eur(listing.buyer_total_price)}</Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign:"center", padding:"32px 0" }}>
          <div style={{
            width:72, height:72, borderRadius:999,
            background:"var(--accent-faint)", border:"2px solid var(--accent)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 20px", fontSize:32
          }}>✓</div>
          <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em", marginBottom:10 }}>¡Compra confirmada!</h2>
          <p style={{ color:"var(--muted)", fontSize:15, maxWidth:420, margin:"0 auto 24px", lineHeight:1.6 }}>
            Tu entrada está en camino. El importe quedará retenido hasta después del evento.
            Si tienes algún problema, tienes <strong>24 horas</strong> desde el inicio del evento para reclamar.
          </p>
          <div style={{ background:"var(--accent-faint)", borderRadius:12, padding:18, maxWidth:360, margin:"0 auto 28px", fontSize:13, color:"var(--accent)", textAlign:"left", lineHeight:1.7 }}>
            <div>✓ Pago retenido hasta el evento</div>
            <div>✓ Recibirás la entrada por email</div>
            <div>✓ Reclamación disponible 24 h tras el inicio</div>
          </div>
          <Btn size="lg" onClick={() => setPage("home")}>Volver al inicio</Btn>
        </div>
      )}
    </div>
  );
}


// ══ SELL FLOW ══════════════════════════════════════════════════════════════
function SellPage({ setPage }) {
  const [step, setStep] = React.useState(0);
  const [ticketType, setTicketType] = React.useState("");
  const [eventName, setEventName]   = React.useState("");
  const [zone, setZone]             = React.useState("");
  const [row, setRow]               = React.useState("");
  const [qty, setQty]               = React.useState("1");
  const [faceValue, setFaceValue]   = React.useState("");
  const [askPrice, setAskPrice]     = React.useState("");
  const [submitted, setSubmitted]   = React.useState(false);

  const sellerNet = askPrice ? (Number(askPrice) / 1.0526).toFixed(2) : null; // ≈ 5% de seller fee
  const buyerTotal = askPrice ? (Number(askPrice) * 1.05).toFixed(2) : null;  // 5% buyer fee

  const steps = ["Tipo de entrada", "Detalles", "Precio", "Revisar"];

  if (submitted) {
    return (
      <div style={{ maxWidth:580, margin:"0 auto", padding:"48px 24px", textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:999, background:"var(--accent-faint)", border:"2px solid var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:32 }}>📋</div>
        <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em", marginBottom:10 }}>Entrada enviada a revisión</h2>
        <p style={{ color:"var(--muted)", fontSize:15, maxWidth:400, margin:"0 auto 24px", lineHeight:1.6 }}>
          Revisamos manualmente cada listado antes de publicarlo. Te avisaremos por email cuando esté activo.
        </p>
        <div style={{ background:"#F8F7F4", borderRadius:12, padding:18, maxWidth:360, margin:"0 auto 28px", fontSize:13, color:"var(--muted)", textAlign:"left", lineHeight:1.7 }}>
          <div>⏱ Revisión manual en &lt;24 h</div>
          <div>💰 Cobras cuando el evento ocurra (48 h después)</div>
          <div>📄 Factura automática tras el cobro</div>
        </div>
        <Btn size="lg" onClick={() => setPage("panel")}>Ver mi panel →</Btn>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:620, margin:"0 auto", padding:"32px 24px 60px" }}>
      <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.03em", marginBottom:6 }}>Vender mi entrada</h1>
      <p style={{ color:"var(--muted)", fontSize:14, marginBottom:28 }}>Precio final para el comprador · Sin sorpresas · Cobras tras el evento</p>

      {/* Steps */}
      <div style={{ display:"flex", gap:0, marginBottom:32, alignItems:"center" }}>
        {steps.map((s,i) => (
          <React.Fragment key={s}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{
                width:28, height:28, borderRadius:999,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700,
                background: i < step ? "var(--accent)" : i===step ? "var(--text)" : "var(--border)",
                color: i <= step ? "#fff" : "var(--muted)"
              }}>{i < step ? "✓" : i+1}</div>
              <span style={{ fontSize:11, color: i===step ? "var(--text)" : "var(--muted)", fontWeight: i===step ? 700 : 400, whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1, height:1, background:"var(--border)", margin:"0 6px", marginBottom:18 }}/>}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Ticket type */}
      {step === 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontWeight:700, fontSize:17, marginBottom:4 }}>¿Qué tipo de entrada tienes?</div>
          {[
            { k:"PDF", icon:"📄", title:"PDF / e-ticket", desc:"Archivo PDF descargable con código QR estático." },
            { k:"OFFICIAL_TRANSFER", icon:"📱", title:"Transferencia oficial", desc:"Entrada en app oficial (Ticketmaster, Eventim, AXS…) con QR dinámico. Se transfiere por email." },
          ].map(t => (
            <div key={t.k} onClick={() => setTicketType(t.k)}
              style={{
                padding:18, borderRadius:14, border:"2px solid",
                borderColor: ticketType===t.k ? "var(--accent)" : "var(--border)",
                background: ticketType===t.k ? "var(--accent-faint)" : "#fff",
                cursor:"pointer", transition:"all 0.15s"
              }}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:24 }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{t.title}</div>
                  <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>{t.desc}</div>
                </div>
                {ticketType===t.k && <div style={{ marginLeft:"auto", color:"var(--accent)", fontSize:18 }}>✓</div>}
              </div>
            </div>
          ))}
          <div style={{ padding:14, borderRadius:10, background:"#FFF8EC", border:"1px solid #FBBF24", fontSize:12, color:"#92400E" }}>
            ⚠ No se admiten: screenshots, fotos de pantalla ni entradas físicas en el MVP.
          </div>
          <Btn size="lg" disabled={!ticketType} onClick={() => ticketType && setStep(1)} full>Continuar →</Btn>
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontWeight:700, fontSize:17, marginBottom:4 }}>Detalles del evento y entrada</div>
          {[
            { label:"Nombre del evento *", ph:"Ej: Real Madrid vs Barcelona", val:eventName, fn:setEventName },
            { label:"Zona / Sector", ph:"Ej: Tribuna Este, Preferente…", val:zone, fn:setZone },
            { label:"Fila", ph:"Ej: 12", val:row, fn:setRow },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--muted)", marginBottom:6 }}>{f.label}</label>
              <input value={f.val} onChange={e => f.fn(e.target.value)} placeholder={f.ph} style={inputStyle}
                onFocus={e => e.target.style.borderColor="var(--accent)"}
                onBlur={e  => e.target.style.borderColor="var(--border)"}
              />
            </div>
          ))}
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--muted)", marginBottom:6 }}>Número de entradas *</label>
            <select value={qty} onChange={e => setQty(e.target.value)} style={inputStyle}>
              <option value="1">1 entrada</option>
              <option value="2">2 entradas (contiguas)</option>
              <option value="4">4 entradas (contiguas)</option>
            </select>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="ghost" size="lg" onClick={() => setStep(0)}>← Atrás</Btn>
            <Btn size="lg" full disabled={!eventName} onClick={() => eventName && setStep(2)}>Continuar →</Btn>
          </div>
        </div>
      )}

      {/* Step 2: Price */}
      {step === 2 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontWeight:700, fontSize:17, marginBottom:4 }}>Precio</div>
          {[
            { label:"Precio facial total (lo que pagaste) *", ph:"Ej: 80.00 €", val:faceValue, fn:setFaceValue, note:"Incluye todos los impuestos." },
            { label:"Precio que quieres recibir (neto) *", ph:"Ej: 95.00 €", val:askPrice, fn:setAskPrice, note:"Lo que recibirás tú. TicketUp añade su comisión encima." },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--muted)", marginBottom:6 }}>{f.label}</label>
              <input type="number" value={f.val} onChange={e => f.fn(e.target.value)} placeholder={f.ph} style={inputStyle}
                onFocus={e => e.target.style.borderColor="var(--accent)"}
                onBlur={e  => e.target.style.borderColor="var(--border)"}
              />
              {f.note && <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>{f.note}</div>}
            </div>
          ))}

          {askPrice && faceValue && (
            <div style={{ background:"var(--accent-faint)", border:"1px solid var(--accent-faint2)", borderRadius:12, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:10, color:"var(--accent)" }}>Resumen de precios</div>
              {[
                ["Precio facial", `${eur(faceValue)}`],
                ["Tú recibes (neto)", `${eur(sellerNet)}`],
                ["Fee TicketUp (5%)", `${eur((Number(askPrice)*0.05).toFixed(2))}`],
                ["Precio final comprador", `${eur(buyerTotal)}`],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                  <span style={{ color:"var(--muted)" }}>{k}</span>
                  <span style={{ fontWeight:700 }}>{v}</span>
                </div>
              ))}
              {Number(buyerTotal) > Number(faceValue) * 2 && (
                <div style={{ marginTop:10, fontSize:12, color:"#B91C1C", fontWeight:600 }}>
                  ⚠ El precio supera el límite de ×2 sobre el precio facial. Ajústalo para poder publicar.
                </div>
              )}
            </div>
          )}

          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="ghost" size="lg" onClick={() => setStep(1)}>← Atrás</Btn>
            <Btn size="lg" full disabled={!askPrice || !faceValue} onClick={() => askPrice && faceValue && setStep(3)}>Continuar →</Btn>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontWeight:700, fontSize:17, marginBottom:4 }}>Revisa tu anuncio</div>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:20 }}>
            {[
              ["Evento", eventName],
              ["Tipo", ticketType==="PDF" ? "PDF / e-ticket" : "Transferencia oficial"],
              ["Cantidad", `${qty} ${Number(qty)===1?"entrada":"entradas"}`],
              zone ? ["Zona", zone] : null,
              row  ? ["Fila",  row]  : null,
              ["Precio facial", eur(faceValue)],
              ["Tú recibes", eur(sellerNet)],
              ["Precio para el comprador", eur(buyerTotal)],
            ].filter(Boolean).map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:14, marginBottom:8 }}>
                <span style={{ color:"var(--muted)" }}>{k}</span>
                <span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:14, borderRadius:10, background:"#F8F7F4", border:"1px solid var(--border)", fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>
            Tu entrada pasará por revisión manual antes de publicarse. Recibirás una notificación por email.
            Cobrarás <strong>48 h después del evento</strong> si no hay reclamación.
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="ghost" size="lg" onClick={() => setStep(2)}>← Atrás</Btn>
            <Btn size="lg" full onClick={() => setSubmitted(true)}>Publicar entrada</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"11px 14px", borderRadius:9, border:"1px solid var(--border)",
  fontSize:14, fontFamily:"inherit", outline:"none", background:"#FAFAF8",
  transition:"border-color 0.15s"
};


// ══ SELLER PANEL ══════════════════════════════════════════════════════════
const MOCK_LISTINGS = [
  { id:"l1", event:"Taylor Swift – The Eras Tour", date:"2025-06-15", zone:"Pista A", qty:2, status:"PUBLISHED",  price:320, payout:290 },
  { id:"l2", event:"El Clásico – Bernabéu",       date:"2025-04-06", zone:"Tribuna",qty:1, status:"IN_REVIEW",  price:150, payout:136 },
  { id:"l3", event:"Primavera Sound 2025",         date:"2025-05-29", zone:"General",qty:2, status:"SOLD",       price:210, payout:190, payStatus:"RETAINED" },
  { id:"l4", event:"Coldplay – Music of the Spheres", date:"2025-07-20", zone:"Preferente",qty:1, status:"SOLD", price:175, payout:159, payStatus:"PAID", paidOn:"2025-07-22" },
];

const STATUS_META = {
  PUBLISHED:  { label:"Publicada",    color:"green" },
  IN_REVIEW:  { label:"En revisión",  color:"yellow" },
  SOLD:       { label:"Vendida",      color:"blue" },
  REJECTED:   { label:"Rechazada",    color:"red" },
  WITHDRAWN:  { label:"Retirada",     color:"gray" },
};
const PAY_META = {
  RETAINED: { label:"Pago retenido",    color:"yellow" },
  PAID:     { label:"Pagado",           color:"green" },
  IN_REVIEW:{ label:"Pago en revisión", color:"red" },
  SCHEDULED:{ label:"Pago programado",  color:"blue" },
};

function PanelPage({ user, setPage }) {
  const [tab, setTab] = React.useState("listings");

  if (!user) {
    return (
      <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 24px" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🔐</div>
        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:10 }}>Inicia sesión para acceder a tu panel</h2>
        <p style={{ color:"var(--muted)", marginBottom:24, fontSize:14 }}>Gestiona tus entradas, pagos y facturas desde aquí.</p>
        <Btn size="lg" onClick={() => {}}>Iniciar sesión</Btn>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"32px 24px 60px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em" }}>Mi panel</h1>
          <div style={{ fontSize:14, color:"var(--muted)", marginTop:2 }}>{user.email}</div>
        </div>
        <Btn onClick={() => setPage("sell")}>+ Nueva entrada</Btn>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
        {[
          { label:"Publicadas", val:1, icon:"✅" },
          { label:"En revisión", val:1, icon:"⏱" },
          { label:"Vendidas",   val:2, icon:"🎟" },
          { label:"Total cobrado", val:eur(349), icon:"💶" },
        ].map(s => (
          <div key={s.label} style={{
            background:"var(--card)", border:"1px solid var(--border)",
            borderRadius:12, padding:"14px 16px", boxShadow:"var(--shadow-sm)"
          }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em" }}>{s.val}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:"1px solid var(--border)", paddingBottom:0 }}>
        {[["listings","Mis entradas"],["payments","Pagos y facturas"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding:"10px 18px", background:"none", border:"none",
            fontFamily:"inherit", fontSize:14, fontWeight:600, cursor:"pointer",
            color: tab===k ? "var(--text)" : "var(--muted)",
            borderBottom: tab===k ? "2px solid var(--text)" : "2px solid transparent",
            transition:"all 0.15s", marginBottom:-1
          }}>{l}</button>
        ))}
      </div>

      {tab === "listings" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {MOCK_LISTINGS.map(l => (
            <div key={l.id} style={{
              background:"var(--card)", border:"1px solid var(--border)",
              borderRadius:12, padding:"16px 20px",
              display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr",
              gap:12, alignItems:"center", boxShadow:"var(--shadow-sm)"
            }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15, letterSpacing:"-0.01em", marginBottom:3 }}>{l.event}</div>
                <div style={{ fontSize:12, color:"var(--muted)" }}>
                  {l.date} · {l.zone} · ×{l.qty}
                </div>
              </div>
              <Badge color={STATUS_META[l.status]?.color || "gray"}>{STATUS_META[l.status]?.label}</Badge>
              <div style={{ fontSize:15, fontWeight:700 }}>{eur(l.price)}</div>
              {l.status === "SOLD" && l.payStatus
                ? <Badge color={PAY_META[l.payStatus]?.color || "gray"}>{PAY_META[l.payStatus]?.label}</Badge>
                : <div/>
              }
            </div>
          ))}
        </div>
      )}

      {tab === "payments" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {MOCK_LISTINGS.filter(l => l.status==="SOLD").map(l => (
            <div key={l.id} style={{
              background:"var(--card)", border:"1px solid var(--border)",
              borderRadius:12, padding:"16px 20px", boxShadow:"var(--shadow-sm)"
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{l.event}</div>
                  {l.payStatus === "PAID"
                    ? <div style={{ fontSize:12, color:"var(--muted)" }}>Pagado el {l.paidOn}</div>
                    : <div style={{ fontSize:12, color:"var(--muted)" }}>Pago retenido hasta después del evento</div>
                  }
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.02em" }}>{eur(l.payout)}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>neto para ti</div>
                </div>
              </div>
              <div style={{ marginTop:12, display:"flex", gap:8, alignItems:"center" }}>
                <Badge color={PAY_META[l.payStatus]?.color || "gray"}>{PAY_META[l.payStatus]?.label}</Badge>
                {l.payStatus === "PAID" && (
                  <button style={{
                    padding:"4px 12px", borderRadius:999, border:"1px solid var(--border)",
                    background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer",
                    fontFamily:"inherit", color:"var(--muted)"
                  }}>📄 Descargar factura</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CheckoutPage, SellPage, PanelPage });
