/**
 * Wedding Website — Mirtha & Andres
 *
 * ⚙️  CONFIGURATION — update these values before publishing
 * =========================================================
 */
const WEDDING_CONFIG = {
  /** ISO date string for the wedding day — e.g. "2025-12-20" */
  date: "2025-12-20",

  /** Display-friendly date strings (update to match above) */
  dateLabelEN: "December 20, 2025",
  dateLabelES: "20 de diciembre de 2025",

  /** Ceremony start/end (24-h for calendar; 12-h for display) */
  startTime: "16:30",   // 4:30 PM
  endTime:   "22:00",   // 10:00 PM

  /** Venue details */
  venue: "Finka Las Palmas",
  address: "10401 SW 186th Ave, Miami, FL 33196",

  /** Calendar event title */
  titleEN: "Mirtha & Andres Wedding",
  titleES: "Boda de Mirtha y Andres",
};


/* ==========================================================
   HELPER — format date for Google Calendar & ICS
   ========================================================== */
function toCalDate(dateStr, timeStr) {
  // Returns "YYYYMMDDTHHmmss" (local time, no Z)
  const [year, month, day]   = dateStr.split("-");
  const [hour, minute]       = timeStr.split(":");
  return `${year}${month}${day}T${hour}${minute}00`;
}


/* ==========================================================
   LANGUAGE SYSTEM
   ========================================================== */
let currentLang = localStorage.getItem("weddingLang") || "en";

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("weddingLang", lang);

  // Flip toggle UI
  const toggle = document.getElementById("langToggle");
  toggle.dataset.lang = lang;
  toggle.setAttribute("aria-checked", lang === "es" ? "true" : "false");

  document.getElementById("labelEN").classList.toggle("active", lang === "en");
  document.getElementById("labelES").classList.toggle("active", lang === "es");

  // Update html lang attribute
  document.documentElement.lang = lang;

  // Swap all [data-en] / [data-es] text nodes
  document.querySelectorAll("[data-en]").forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text !== null) el.textContent = text;
  });

  // Swap placeholder attributes
  document.querySelectorAll("[data-placeholder-en]").forEach(el => {
    el.placeholder = el.getAttribute(`data-placeholder-${lang}`);
  });

  // Inject wedding date labels
  const dateLabel = lang === "es" ? WEDDING_CONFIG.dateLabelES : WEDDING_CONFIG.dateLabelEN;
  const heroDate  = document.getElementById("heroDate");
  const cardDate  = document.getElementById("cardDate");
  if (heroDate) heroDate.textContent = dateLabel;
  if (cardDate) cardDate.textContent = dateLabel;
}

function toggleLang() {
  applyLang(currentLang === "en" ? "es" : "en");
}

// Keyboard & click support on toggle
document.getElementById("langToggle").addEventListener("click", toggleLang);
document.getElementById("langToggle").addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleLang(); }
});

// Apply saved language on load
applyLang(currentLang);


/* ==========================================================
   CALENDAR MODAL
   ========================================================== */
const calendarModal  = document.getElementById("calendarModal");
const calendarBtn    = document.getElementById("calendarBtn");
const closeModalBtn  = document.getElementById("closeModal");
const gcalLink       = document.getElementById("gcalLink");
const icsDownloadBtn = document.getElementById("icsDownload");

function buildGCalURL() {
  const start   = toCalDate(WEDDING_CONFIG.date, WEDDING_CONFIG.startTime);
  const end     = toCalDate(WEDDING_CONFIG.date, WEDDING_CONFIG.endTime);
  const title   = encodeURIComponent(WEDDING_CONFIG.titleEN);
  const details = encodeURIComponent(`Venue: ${WEDDING_CONFIG.venue}\n${WEDDING_CONFIG.address}`);
  const location= encodeURIComponent(`${WEDDING_CONFIG.venue}, ${WEDDING_CONFIG.address}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

function buildICS() {
  const uid   = `mirtha-andres-wedding-${Date.now()}@wedding`;
  const now   = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = toCalDate(WEDDING_CONFIG.date, WEDDING_CONFIG.startTime);
  const end   = toCalDate(WEDDING_CONFIG.date, WEDDING_CONFIG.endTime);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mirtha & Andres Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=America/New_York:${start}`,
    `DTEND;TZID=America/New_York:${end}`,
    `SUMMARY:${WEDDING_CONFIG.titleEN}`,
    `DESCRIPTION:Venue: ${WEDDING_CONFIG.venue}\\n${WEDDING_CONFIG.address}`,
    `LOCATION:${WEDDING_CONFIG.venue}\\, ${WEDDING_CONFIG.address}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function openCalendarModal() {
  gcalLink.href = buildGCalURL();
  calendarModal.classList.add("open");
  calendarModal.focus?.();
}

function closeCalendarModal() {
  calendarModal.classList.remove("open");
}

calendarBtn.addEventListener("click", openCalendarModal);
closeModalBtn.addEventListener("click", closeCalendarModal);

// Close on backdrop click
calendarModal.addEventListener("click", e => {
  if (e.target === calendarModal) closeCalendarModal();
});

// Close on Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && calendarModal.classList.contains("open")) closeCalendarModal();
});

// ICS download
icsDownloadBtn.addEventListener("click", () => {
  const blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "mirtha-andres-wedding.ics";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
});


/* ==========================================================
   GUEST AUTOCOMPLETE
   ========================================================== */
let guestList = [];

async function loadGuests() {
  try {
    const res  = await fetch("guests.json");
    const data = await res.json();
    guestList  = data.map(g => `${g.first} ${g.last}`);
  } catch (e) {
    // guests.json not found or malformed — autocomplete simply won't activate
    console.warn("guests.json could not be loaded:", e);
  }
}

loadGuests();

const guestInput      = document.getElementById("guestName");
const suggestionsList = document.getElementById("guestSuggestions");
let highlightedIndex  = -1;

function showSuggestions(query) {
  suggestionsList.innerHTML = "";
  highlightedIndex = -1;
  if (!query || query.length < 1) { suggestionsList.classList.remove("open"); return; }

  const lower   = query.toLowerCase();
  const matches = guestList.filter(name => name.toLowerCase().includes(lower)).slice(0, 8);

  if (!matches.length) { suggestionsList.classList.remove("open"); return; }

  matches.forEach((name, idx) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.setAttribute("role", "option");
    li.dataset.index = idx;
    li.addEventListener("mousedown", e => {
      e.preventDefault(); // prevent blur firing before click
      selectGuest(name);
    });
    suggestionsList.appendChild(li);
  });

  suggestionsList.classList.add("open");
}

function selectGuest(name) {
  guestInput.value = name;
  suggestionsList.classList.remove("open");
  highlightedIndex = -1;
}

guestInput.addEventListener("input", () => showSuggestions(guestInput.value));
guestInput.addEventListener("blur",  () => setTimeout(() => suggestionsList.classList.remove("open"), 150));
guestInput.addEventListener("focus", () => showSuggestions(guestInput.value));

guestInput.addEventListener("keydown", e => {
  const items = suggestionsList.querySelectorAll("li");
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
    refreshHighlight(items);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    highlightedIndex = Math.max(highlightedIndex - 1, -1);
    refreshHighlight(items);
  } else if (e.key === "Enter" && highlightedIndex >= 0) {
    e.preventDefault();
    selectGuest(items[highlightedIndex].textContent);
  } else if (e.key === "Escape") {
    suggestionsList.classList.remove("open");
  }
});

function refreshHighlight(items) {
  items.forEach((li, i) => li.classList.toggle("highlighted", i === highlightedIndex));
}


/* ==========================================================
   GUEST COUNT (+/−)
   ========================================================== */
let guestCount = 1;
const countDisplay = document.getElementById("countDisplay");
const numGuestsInput = document.getElementById("numGuests");

document.getElementById("countMinus").addEventListener("click", () => {
  if (guestCount > 1) {
    guestCount--;
    countDisplay.textContent   = guestCount;
    numGuestsInput.value       = guestCount;
  }
});

document.getElementById("countPlus").addEventListener("click", () => {
  if (guestCount < 10) {
    guestCount++;
    countDisplay.textContent   = guestCount;
    numGuestsInput.value       = guestCount;
  }
});


/* ==========================================================
   SHOW / HIDE guest-count group based on attendance selection
   ========================================================== */
const guestCountGroup = document.getElementById("guestCountGroup");

document.querySelectorAll('input[name="attendance"]').forEach(radio => {
  radio.addEventListener("change", () => {
    guestCountGroup.style.display = radio.value === "yes" ? "" : "none";
  });
});


/* ==========================================================
   RSVP FORM SUBMISSION (Formspree)
   ========================================================== */
const rsvpForm   = document.getElementById("rsvpForm");
const successMsg = document.getElementById("formSuccess");
const errorMsg   = document.getElementById("formError");
const submitBtn  = document.getElementById("submitBtn");

rsvpForm.addEventListener("submit", async e => {
  e.preventDefault();

  // Basic validation
  if (!guestInput.value.trim()) {
    guestInput.focus();
    return;
  }
  const selectedAttendance = rsvpForm.querySelector('input[name="attendance"]:checked');
  if (!selectedAttendance) return;

  submitBtn.disabled   = true;
  submitBtn.textContent = currentLang === "es" ? "Enviando…" : "Sending…";

  const formData = new FormData(rsvpForm);

  try {
    const res = await fetch(rsvpForm.action, {
      method:  "POST",
      body:    formData,
      headers: { "Accept": "application/json" },
    });

    if (res.ok) {
      successMsg.classList.add("success");
      errorMsg.classList.remove("error");
      rsvpForm.reset();
      guestCount = 1;
      countDisplay.textContent = "1";
      numGuestsInput.value     = "1";
      // Re-apply lang so message text is correct
      applyLang(currentLang);
    } else {
      throw new Error("Server returned " + res.status);
    }
  } catch (err) {
    console.error("RSVP submission failed:", err);
    errorMsg.classList.add("error");
    successMsg.classList.remove("success");
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = currentLang === "es" ? "Enviar RSVP ✦" : "Send RSVP ✦";
  }
});
