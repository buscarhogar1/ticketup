import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://vfgrldputubahgydvjyp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HS4VO8tJULsRqgG51AMbtA_b4SVB4ID";

const EVENT_ID = "0b1187ce-bca7-41eb-893f-95fc17c23355";
const LISTING_ID = "756c4104-d958-4bad-a383-81bd69039cc2";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const eventBox = document.getElementById("eventBox");
const listingBox = document.getElementById("listingBox");
const errorBox = document.getElementById("errorBox");
const errorText = document.getElementById("errorText");

function showError(msg) {
  errorText.textContent = msg;
  errorBox.style.display = "block";
}

async function main() {
  // 1) Evento
  const { data: eventData, error: eventErr } = await supabase
    .from("event")
    .select("*")
    .eq("id", EVENT_ID)
    .single();

  if (eventErr) {
    showError("Error cargando evento: " + eventErr.message);
    eventBox.textContent = "";
    return;
  }
  eventBox.textContent = JSON.stringify(eventData, null, 2);

  // 2) Listing
  const { data: listingData, error: listingErr } = await supabase
    .from("listing")
    .select("*")
    .eq("id", LISTING_ID)
    .single();

  if (listingErr) {
    showError("Error cargando listing: " + listingErr.message);
    listingBox.textContent = "";
    return;
  }
  listingBox.textContent = JSON.stringify(listingData, null, 2);
}

main();
