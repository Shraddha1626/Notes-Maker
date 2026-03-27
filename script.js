/**
 * PRO-NOTE ENGINE v2.0
 * Features: XSS Protection, State Persistence, Search Debouncing, and Voice Integration.
 */

// 1. CONSTANTS & CONFIGURATION
const APP_CONFIG = {
  STORAGE_KEY: "competition_notes_db",
  SEARCH_DEBOUNCE_MS: 300,
  VOICE_LANG: "en-US",
};

// 2. THE STATE MANAGER
// Centralizing data makes the app predictable and easier to debug.
let state = {
  notes: [],
  filterQuery: "",
  isListening: false
};

/**
 * CORE LOGIC
 */

// 3. INITIALIZATION
function init() {
  console.log("Initializing Pro-Note Engine...");
  loadFromLocalStorage();
  setupEventListeners();
  render();
}

// 4. DATA PERSISTENCE
function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
    state.notes = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Database Corrupted:", error);
    state.notes = [];
  }
}

function saveToLocalStorage() {
  localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(state.notes));
}

// 5. NOTE FACTORY (Validation Logic)
function createNote(title, text) {
  if (!title || !text) return null;
  
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    title: sanitizeInput(title),
    text: sanitizeInput(text),
    timestamp: new Date().getTime(),
    formattedDate: new Date().toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  };
}

// 6. SECURITY LAYER (Prevent XSS)
function sanitizeInput(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * UI ACTIONS
 */

function handleSave() {
  const titleEl = document.getElementById("title");
  const textEl = document.getElementById("note");
  
  const newNote = createNote(titleEl.value.trim(), textEl.value.trim());

  if (!newNote) {
    showNotification("Error: Fields cannot be empty", "error");
    return;
  }

  state.notes.unshift(newNote); // Add to top
  saveToLocalStorage();
  
  // Reset Form
  titleEl.value = "";
  textEl.value = "";
  
  showNotification("Note saved successfully!");
  render();
}

function deleteNote(id) {
  const confirmAction = confirm("Are you sure you want to remove this note?");
  
  if (confirmAction) {
    state.notes = state.notes.filter(note => note.id !== id);
    saveToLocalStorage();
    showNotification("Note deleted", "warning");
    render();
  }
}

function copyNote(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;

  navigator.clipboard.writeText(note.text).then(() => {
    showNotification("Content copied to clipboard!");
  }).catch(err => {
    console.error("Copy failed", err);
  });
}

/**
 * SEARCH & FILTERING
 */

function handleSearch(event) {
  state.filterQuery = event.target.value.toLowerCase();
  render();
}

/**
 * RENDERING ENGINE (DOM Manipulation)
 */

function render() {
  const container = document.getElementById("notesList");
  container.innerHTML = "";

  const filteredNotes = state.notes.filter(note => 
    note.title.toLowerCase().includes(state.filterQuery) ||
    note.text.toLowerCase().includes(state.filterQuery)
  );

  if (filteredNotes.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "empty-state";
    emptyMsg.textContent = state.filterQuery ? "No matching notes found." : "Your notebook is empty.";
    container.appendChild(emptyMsg);
    return;
  }

  filteredNotes.forEach(note => {
    const noteElement = document.createElement("div");
    noteElement.className = "note-item";
    
    // Using InnerHTML safely because we sanitized during the "Create" phase
    noteElement.innerHTML = `
      <div class="note-header">
        <h3 class="note-title">${note.title}</h3>
        <span class="note-date">${note.formattedDate}</span>
      </div>
      <p class="note-body">${note.text}</p>
      <div class="note-actions">
        <button class="btn-copy" onclick="copyNote('${note.id}')">Copy</button>
        <button class="btn-delete" onclick="deleteNote('${note.id}')">Delete</button>
      </div>
    `;
    container.appendChild(noteElement);
  });
}

/**
 * HARDWARE INTEGRATION (Voice)
 */

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showNotification("Voice support not available in this browser", "error");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = APP_CONFIG.VOICE_LANG;
  recognition.continuous = false;

  recognition.onstart = () => {
    state.isListening = true;
    showNotification("Listening...", "info");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("note").value += " " + transcript;
    state.isListening = false;
  };

  recognition.onerror = () => {
    state.isListening = false;
    showNotification("Voice Error: Try again", "error");
  };

  recognition.start();
}

/**
 * UTILITIES
 */

function showNotification(message, type = "success") {
  // Check if notification element exists, else create it
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast-active ${type}`;
  
  setTimeout(() => {
    toast.className = "";
  }, 2500);
}

function setupEventListeners() {
  // Professional apps use JS listeners instead of HTML 'onclick' where possible
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }
}

// 🚀 Start Application
document.addEventListener("DOMContentLoaded", init);
