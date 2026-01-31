import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://vfgrldputubahgydvjyp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HS4VO8tJULsRqgG51AMbtA_b4SVB4ID";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const eventsStatus = document.getElementById("eventsStatus");
const eventsGrid = document.getElementById("eventsGrid");

const searchInput = document.getElementById("searchInput");
const cityFilter = document.getElementById("cityFilter");
const onlyWithTickets = document.getElementById("onlyWithTickets");

const eventDetail = document.getElementById("eventDetail");
const backBtn = document.getElementById("backBtn");
const backLink = document.getElementById("backLink");

const crumbEventName = document.getElementById("crumbEventName");
const eventTitle = document.getElementById("eventTitle");
const eventMeta = document.getElementById("eventMeta");

const listingsStatus = document.getElementById("listingsStatus");
const listingsGrid = document.getElementById("listingsGrid");
const listingsCount = document.getElementById("listingsCount");

const errorBox = document.getElementById("errorBox");
const errorText = document.getElementById("errorText");

let allEvents = [];

function showError(msg) {
  errorText.textContent = msg;
  errorBox.style.display = "block";
}
function clearError() {
  errorBox.style.display = "none";
  errorText.textContent = "";
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}
function eur(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return String(n);
  return v.toFixed(2) + " €";
}
function seatLabel(l) {
  const parts = [];
  if (l.zone) parts.push(`Zona: ${l.zone}`);
  if (l.row) parts.push(`Fila: ${l.row}`);
  if (l.seat_from && l.seat_to && l.seat_from !== l.seat_to) parts.push(`Asientos: ${l.seat_from}-${l.seat_to}`);
  else if (l.seat_from) parts.push(`Asiento: ${l.seat_from}`);
  return parts.join(" · ");
}

function normalize(s) {
  return (s || "").toString().toLowerCase().trim();
}

function renderEvents(list) {
  eventsGrid.innerHTML = "";

  if (!list || list.length === 0) {
    eventsStatus.textContent = "No hay eventos que coincidan con el filtro.";
    return;
  }

  eventsStatus.textContent = "";
  for (const ev of list) {
    const div = document.createElement("div");
    div.className = "event-card";
    div.innerHTML = `
      <div class="event-name">${ev.name}</div>
      <div class="event-meta">${ev.city} · ${formatDate(ev.start_datetime)} · ${ev.venue_name}</div>
      <div class="event-pill">Ver entradas</div>
    `;
    div.addEventListener("click", () => openEvent(ev));
    eventsGrid.appendChild(div);
  }
}

function applyFilters() {
  const q = normalize(searchInput.value);
  const city = cityFilter.value;

  let filtered = allEvents;

  if (q) {
    filtered = filtered.filter(ev => {
      const hay = `${ev.name} ${ev.city} ${ev.venue_name}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (city) {
    filtered = filtered.filter(ev => ev.city === city);
  }

  if (onlyWithTickets.checked) {
    filtered = filtered.filter(ev => (ev._published_count || 0) > 0);
  }

  renderEvents(filtered);
}

function fillCityOptions() {
  const cities = Array.from(new Set(allEvents.map(e => e.city))).sort((a,b) => a.localeCompare(b, "es"));
  for (const c of cities) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    cityFilter.appendChild(opt);
  }
}

async function loadEvents() {
  clearError();
  eventsStatus.textContent = "Cargando eventos...";

  const { data: events, error } = await supabase
    .from("event")
    .select("id,name,start_datetime,venue_name,city,is_paused")
    .eq("is_paused", false)
    .order("start_datetime", { ascending: true });

  if (error) {
    showError("Error cargando eventos: " + error.message);
    eventsStatus.textContent = "";
    return;
  }

  allEvents = events || [];

  // Contador de entradas publicadas por evento (para el checkbox "solo con entradas")
  // Esto hace 1 query por evento. Para MVP con pocos eventos vale.
  for (const ev of allEvents) {
    const { count } = await supabase
      .from("listing")
      .select("id", { count: "exact", head: true })
      .eq("event_id", ev.id);
    ev._published_count = count || 0;
  }

  fillCityOptions();
  applyFilters();
}

function renderListings(listings) {
  listingsGrid.innerHTML = "";

  if (!listings || listings.length === 0) {
    listingsStatus.textContent = "No hay entradas publicadas para este evento.";
    listingsCount.textContent = "";
    return;
  }

  listingsStatus.textContent = "";
  listingsCount.textContent = `${listings.length} disponibles`;

  for (const l of listings) {
    const div = document.createElement("div");
    div.className = "ticket-card";
    div.innerHTML = `
      <p class="price">${eur(l.buyer_total_price)}</p>
      <div class="muted">Gastos de gestión incluidos</div>

      <div class="badges">
        <span class="badge">${l.ticket_type}</span>
        <span class="badge">${l.listing_type}</span>
        <span class="badge">x${l.bundle_size}</span>
      </div>

      <div class="muted" style="margin-top:10px;">${seatLabel(l) || "Ubicación no especificada"}</div>
    `;
    listingsGrid.appendChild(div);
  }
}

async function openEvent(ev) {
  clearError();
  eventDetail.style.display = "block";
  crumbEventName.textContent = ev.name;
  eventTitle.textContent = ev.name;
  eventMeta.textContent = `${ev.city} · ${formatDate(ev.start_datetime)} · ${ev.venue_name}`;

  listingsStatus.textContent = "Cargando entradas...";
  listingsCount.textContent = "";
  listingsGrid.innerHTML = "";

  const { data, error } = await supabase
    .from("listing")
    .select("id,buyer_total_price,currency,ticket_type,listing_type,bundle_size,zone,row,seat_from,seat_to,status,event_id")
    .eq("event_id", ev.id)
    .order("buyer_total_price", { ascending: true });

  if (error) {
    showError("Error cargando entradas: " + error.message);
    listingsStatus.textContent = "";
    return;
  }

  renderListings(data);
}

function closeEvent() {
  eventDetail.style.display = "none";
  clearError();
}

backBtn.addEventListener("click", closeEvent);
backLink.addEventListener("click", (e) => { e.preventDefault(); closeEvent(); });

searchInput.addEventListener("input", applyFilters);
cityFilter.addEventListener("change", applyFilters);
onlyWithTickets.addEventListener("change", applyFilters);

// Botones sin funcionalidad todavía
document.getElementById("sellBtn").addEventListener("click", () => alert("MVP: vender aún no está activo."));
document.getElementById("loginBtn").addEventListener("click", () => alert("MVP: login aún no está activo."));

loadEvents();
