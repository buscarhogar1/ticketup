import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://vfgrldputubahgydvjyp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HS4VO8tJULsRqgG51AMbtA_b4SVB4ID";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const eventsStatus = document.getElementById("eventsStatus");
const eventsList = document.getElementById("eventsList");

const eventDetailCard = document.getElementById("eventDetailCard");
const eventTitle = document.getElementById("eventTitle");
const eventMeta = document.getElementById("eventMeta");
const backBtn = document.getElementById("backBtn");

const listingsStatus = document.getElementById("listingsStatus");
const listingsGrid = document.getElementById("listingsGrid");

const errorBox = document.getElementById("errorBox");
const errorText = document.getElementById("errorText");

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
  if (n === null || n === undefined) return "";
  const value = Number(n);
  if (Number.isNaN(value)) return String(n);
  return value.toFixed(2) + " €";
}

function seatLabel(listing) {
  const parts = [];
  if (listing.zone) parts.push(`Zona: ${listing.zone}`);
  if (listing.row) parts.push(`Fila: ${listing.row}`);
  if (listing.seat_from && listing.seat_to && listing.seat_from !== listing.seat_to) {
    parts.push(`Asientos: ${listing.seat_from}-${listing.seat_to}`);
  } else if (listing.seat_from) {
    parts.push(`Asiento: ${listing.seat_from}`);
  }
  return parts.join(" · ");
}

function renderEvents(events) {
  eventsList.innerHTML = "";

  if (!events || events.length === 0) {
    eventsStatus.textContent = "No hay eventos todavía.";
    return;
  }

  eventsStatus.textContent = "";
  for (const ev of events) {
    const li = document.createElement("li");
    li.className = "listItem";
    li.innerHTML = `
      <div class="row-between">
        <div>
          <div>${ev.name}</div>
          <div class="small">${ev.city} · ${formatDate(ev.start_datetime)} · ${ev.venue_name}</div>
        </div>
        <div class="badge">Ver entradas</div>
      </div>
    `;
    li.addEventListener("click", () => openEvent(ev));
    eventsList.appendChild(li);
  }
}

function renderListings(listings) {
  listingsGrid.innerHTML = "";

  if (!listings || listings.length === 0) {
    listingsStatus.textContent = "No hay entradas publicadas para este evento.";
    return;
  }

  listingsStatus.textContent = "";
  for (const l of listings) {
    const div = document.createElement("div");
    div.className = "ticketCard";
    div.innerHTML = `
      <div class="ticketPrice">${eur(l.buyer_total_price)}</div>
      <div class="small">Gastos de gestión incluidos</div>
      <div style="margin-top:8px;">
        <span class="badge">${l.ticket_type}</span>
        <span class="badge">${l.listing_type}</span>
        <span class="badge">x${l.bundle_size}</span>
      </div>
      <div class="small" style="margin-top:8px;">${seatLabel(l) || "Ubicación no especificada"}</div>
    `;
    listingsGrid.appendChild(div);
  }
}

async function loadEvents() {
  clearError();
  eventsStatus.textContent = "Cargando eventos...";

  const { data, error } = await supabase
    .from("event")
    .select("id,name,start_datetime,venue_name,city,is_paused")
    .eq("is_paused", false)
    .order("start_datetime", { ascending: true });

  if (error) {
    showError("Error cargando eventos: " + error.message);
    eventsStatus.textContent = "";
    return;
  }

  renderEvents(data);
}

async function openEvent(ev) {
  clearError();
  eventDetailCard.style.display = "block";
  eventTitle.textContent = ev.name;
  eventMeta.textContent = `${ev.city} · ${formatDate(ev.start_datetime)} · ${ev.venue_name}`;

  listingsStatus.textContent = "Cargando entradas...";
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

backBtn.addEventListener("click", () => {
  eventDetailCard.style.display = "none";
  clearError();
});

loadEvents();
