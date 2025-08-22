// ===== Utilities & Storage =====
const LS_KEYS = {
  announcements: "sns_announcements",
  events: "sns_events",
  students: "sns_students",
  theme: "sns_theme"
};

const todayISO = () => new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2,9);

// LocalStorage helpers
const load = (k, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(fallback) && !Array.isArray(v) ? fallback : (v ?? fallback); }
  catch { return fallback; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// ===== Seed Sample Data (only first run) =====
function seedIfEmpty() {
  if (!localStorage.getItem(LS_KEYS.announcements)) {
    save(LS_KEYS.announcements, [
      { id: uid(), title:"Welcome to the new semester!", date:"2025-08-15", content:"Orientation and classes start next week.", archived:false },
      { id: uid(), title:"Tech Seminar coming soon", date:"2025-09-10", content:"Join the Dept. seminar on Cloud & AI.", archived:false }
    ]);
  }
  if (!localStorage.getItem(LS_KEYS.events)) {
    save(LS_KEYS.events, [
      { id: uid(), name:"Orientation Day", date:"2025-09-01", location:"Main Hall", archived:false }
    ]);
  }
  if (!localStorage.getItem(LS_KEYS.students)) {
    save(LS_KEYS.students, [
      { id: uid(), name:"Jane Doe", email:"jane@example.com", program:"Computer Science (3rd Year)" },
      { id: uid(), name:"John Okafor", email:"john.okafor@example.com", program:"Electrical Engineering (2nd Year)" }
    ]);
  }
}
seedIfEmpty();

// ===== State =====
let announcements = load(LS_KEYS.announcements, []);
let events = load(LS_KEYS.events, []);
let students = load(LS_KEYS.students, []);
let theme = localStorage.getItem(LS_KEYS.theme) || "light";

// ===== DOM Refs =====
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");
const toggleBtn = document.getElementById("toggleBtn");
const darkToggleBtn = document.getElementById("darkToggle");
const darkSwitch = document.getElementById("darkSwitch");

// Tables
const annTableBody = document.querySelector("#announcementTable tbody");
const evtTableBody = document.querySelector("#eventsTable tbody");
const archAnnTBody = document.querySelector("#archiveAnnouncementTable tbody");
const archEvtTBody = document.querySelector("#archiveEventsTable tbody");
const studentsTBody = document.querySelector("#studentsTable tbody");

// Counters & alerts
const totalStudentsEl = document.getElementById("totalStudents");
const upcomingEventsEl = document.getElementById("upcomingEvents");
const announcementsCountEl = document.getElementById("announcementsCount");
const alertsCountEl = document.getElementById("alertsCount");
const alertsContainer = document.getElementById("alertsContainer");

// Searches
const announcementSearch = document.getElementById("announcementSearch");
const eventSearch = document.getElementById("eventSearch");
const studentSearch = document.getElementById("studentSearch");
const archiveAnnSearch = document.getElementById("archiveAnnSearch");
const archiveEventSearch = document.getElementById("archiveEventSearch");

// Forms
const announcementForm = document.getElementById("announcementForm");
const eventForm = document.getElementById("eventForm");
const passwordForm = document.getElementById("passwordForm");

// Confirm modal state
let confirmAction = null; // function to call
const confirmModalEl = document.getElementById("confirmModal");
const confirmModal = new bootstrap.Modal(confirmModalEl);
const confirmTitle = document.getElementById("confirmTitle");
const confirmBody = document.getElementById("confirmBody");
const confirmOk = document.getElementById("confirmOk");

// ===== Sidebar Toggle =====
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("collapsed");
});

// Enable tooltips
[...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(el => new bootstrap.Tooltip(el));

// ===== Section Navigation =====
document.querySelectorAll(".sidebar .nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.section;
    document.querySelectorAll(".sidebar .nav-link").forEach(a => a.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll(".section").forEach(sec => sec.classList.add("d-none"));
    document.getElementById(target).classList.remove("d-none");
  });
});

// ===== Renders =====
function renderAnnouncements() {
  annTableBody.innerHTML = "";
  announcements.filter(a => !a.archived).forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.title}</td>
      <td>${a.date}</td>
      <td>${a.content}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-warning me-1 btn-icon" data-action="archive-ann" data-id="${a.id}">
          <i class="bi bi-archive"></i> Archive
        </button>
        <button class="btn btn-sm btn-danger btn-icon" data-action="delete-ann" data-id="${a.id}">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>`;
    annTableBody.appendChild(tr);
  });
}

function renderEvents() {
  evtTableBody.innerHTML = "";
  events.filter(ev => !ev.archived).forEach(ev => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ev.name}</td>
      <td>${ev.date}</td>
      <td>${ev.location}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-warning me-1 btn-icon" data-action="archive-evt" data-id="${ev.id}">
          <i class="bi bi-archive"></i> Archive
        </button>
        <button class="btn btn-sm btn-danger btn-icon" data-action="delete-evt" data-id="${ev.id}">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>`;
    evtTableBody.appendChild(tr);
  });
}

function renderArchive() {
  archAnnTBody.innerHTML = "";
  announcements.filter(a => a.archived).forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.title}</td>
      <td>${a.date}</td>
      <td>${a.content}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-danger btn-icon" data-action="purge-ann" data-id="${a.id}">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>`;
    archAnnTBody.appendChild(tr);
  });

  archEvtTBody.innerHTML = "";
  events.filter(ev => ev.archived).forEach(ev => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ev.name}</td>
      <td>${ev.date}</td>
      <td>${ev.location}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-danger btn-icon" data-action="purge-evt" data-id="${ev.id}">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>`;
    archEvtTBody.appendChild(tr);
  });
}

function renderStudents() {
  studentsTBody.innerHTML = "";
  students.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${s.name}</td><td>${s.email}</td><td>${s.program}</td>`;
    studentsTBody.appendChild(tr);
  });
}

function renderCountersAndAlerts() {
  // Counters
  const upcoming = events.filter(e => !e.archived && new Date(e.date) >= new Date()).length;
  const annCount = announcements.filter(a => !a.archived).length;
  totalStudentsEl.textContent = students.length;
  upcomingEventsEl.textContent = upcoming;
  announcementsCountEl.textContent = annCount;

  // Alerts: events in next 7 days
  const now = new Date();
  const soon = events.filter(e => !e.archived).filter(e => {
    const d = new Date(e.date);
    const diffDays = Math.ceil((d - now) / (1000*60*60*24));
    return diffDays >= 0 && diffDays <= 7;
  });
  alertsCountEl.textContent = soon.length;

  alertsContainer.innerHTML = "";
  if (soon.length) {
    soon.forEach(e => {
      const al = document.createElement("div");
      al.className = "alert alert-warning alert-dismissible fade show";
      al.innerHTML = `
        <strong><i class="bi bi-bell me-1"></i>Upcoming:</strong> ${e.name} on ${e.date} at ${e.location}.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
      alertsContainer.appendChild(al);
    });
  }
}

// ===== Initial Render =====
function renderAll(){
  renderAnnouncements();
  renderEvents();
  renderArchive();
  renderStudents();
  renderCountersAndAlerts();
}
renderAll();

// ===== Filters (Search) =====
function attachSearch(inputEl, tableBody) {
  inputEl.addEventListener("input", () => {
    const q = inputEl.value.toLowerCase();
    [...tableBody.querySelectorAll("tr")].forEach(tr => {
      tr.style.display = tr.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  });
}
attachSearch(announcementSearch, annTableBody);
attachSearch(eventSearch, evtTableBody);
attachSearch(studentSearch, studentsTBody);
attachSearch(archiveAnnSearch, archAnnTBody);
attachSearch(archiveEventSearch, archEvtTBody);

// ===== Archive Tabs =====
document.querySelectorAll("#archiveTabs .nav-link").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#archiveTabs .nav-link").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const pane = btn.dataset.archpane;
    document.querySelectorAll(".arch-pane").forEach(p => p.classList.add("d-none"));
    document.getElementById(pane).classList.remove("d-none");
  });
});

// ===== Forms =====
announcementForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("aTitle").value.trim();
  const date = document.getElementById("aDate").value || todayISO();
  const content = document.getElementById("aContent").value.trim();
  if (!title || !content) return;

  announcements.unshift({ id: uid(), title, date, content, archived:false });
  save(LS_KEYS.announcements, announcements);
  announcementForm.reset();
  renderAnnouncements();
  renderCountersAndAlerts();
});

eventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("eName").value.trim();
  const date = document.getElementById("eDate").value || todayISO();
  const location = document.getElementById("eLocation").value.trim();
  if (!name || !location) return;

  events.unshift({ id: uid(), name, date, location, archived:false });
  save(LS_KEYS.events, events);
  eventForm.reset();
  renderEvents();
  renderCountersAndAlerts();
});

// Password form
passwordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const np = document.getElementById("newPassword").value;
  const cp = document.getElementById("confirmPassword").value;
  if (np !== cp) {
    alert("Passwords do not match.");
    return;
  }
  // pretend save...
  alert("Password updated successfully.");
  passwordForm.reset();
});

// Dark mode (button + switch stay in sync)
function setTheme(mode){
  document.body.classList.toggle("theme-dark", mode === "dark");
  document.body.classList.toggle("theme-light", mode !== "dark");
  darkSwitch.checked = mode === "dark";
  localStorage.setItem(LS_KEYS.theme, mode);
}
setTheme(theme);

darkToggleBtn.addEventListener("click", () => {
  theme = (localStorage.getItem(LS_KEYS.theme) || "light") === "dark" ? "light" : "dark";
  setTheme(theme);
});
darkSwitch.addEventListener("change", () => {
  theme = darkSwitch.checked ? "dark" : "light";
  setTheme(theme);
});

// ===== Row Actions with Confirm Modal =====
document.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]");
  if (!action) return;
  const act = action.dataset.action;
  const id = action.dataset.id;

  // Configure modal text
  const texts = {
    "delete-ann": ["Delete Announcement", "Are you sure you want to permanently delete this announcement?"],
    "archive-ann": ["Archive Announcement", "Move this announcement to Archive?"],
    "purge-ann": ["Delete Archived Announcement", "Permanently delete from Archive?"],
    "delete-evt": ["Delete Event", "Are you sure you want to permanently delete this event?"],
    "archive-evt": ["Archive Event", "Move this event to Archive?"],
    "purge-evt": ["Delete Archived Event", "Permanently delete from Archive?"],
  };
  const [title, body] = texts[act] || ["Confirm", "Are you sure?"];
  confirmTitle.textContent = title;
  confirmBody.textContent = body;

  confirmAction = () => {
    if (act === "delete-ann") {
      announcements = announcements.filter(a => a.id !== id);
      save(LS_KEYS.announcements, announcements);
      renderAnnouncements(); renderArchive(); renderCountersAndAlerts();
    }
    if (act === "archive-ann") {
      announcements = announcements.map(a => a.id === id ? {...a, archived:true} : a);
      save(LS_KEYS.announcements, announcements);
      renderAnnouncements(); renderArchive(); renderCountersAndAlerts();
    }
    if (act === "purge-ann") {
      announcements = announcements.filter(a => a.id !== id);
      save(LS_KEYS.announcements, announcements);
      renderArchive(); renderCountersAndAlerts();
    }
    if (act === "delete-evt") {
      events = events.filter(ev => ev.id !== id);
      save(LS_KEYS.events, events);
      renderEvents(); renderArchive(); renderCountersAndAlerts();
    }
    if (act === "archive-evt") {
      events = events.map(ev => ev.id === id ? {...ev, archived:true} : ev);
      save(LS_KEYS.events, events);
      renderEvents(); renderArchive(); renderCountersAndAlerts();
    }
    if (act === "purge-evt") {
      events = events.filter(ev => ev.id !== id);
      save(LS_KEYS.events, events);
      renderArchive(); renderCountersAndAlerts();
    }
  };

  confirmModal.show();
});

confirmOk.addEventListener("click", () => {
  if (typeof confirmAction === "function") confirmAction();
  confirmModal.hide();
});

// ===== Live Search keeps counts accurate when rows hidden (optional) =====
// (Counters reflect data model, not filtered views — by design)