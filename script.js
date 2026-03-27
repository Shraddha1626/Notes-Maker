let notes = [];

// 🔥 INIT (always load from storage first)
function init() {
  const stored = localStorage.getItem("notes");
  notes = stored ? JSON.parse(stored) : [];
  displayNotes();
}

// 💾 SAVE
function saveNote() {
  const title = document.getElementById("title").value.trim();
  const text = document.getElementById("note").value.trim();

  if (!title || !text) {
    alert("Fill all fields");
    return;
  }

  const note = {
    id: Date.now(),
    title,
    text
  };

  notes.push(note);

  // ✅ Always overwrite storage
  localStorage.setItem("notes", JSON.stringify(notes));

  displayNotes();
}

// 📂 LOAD (force reload from storage)
function loadNotes() {
  const stored = localStorage.getItem("notes");

  if (!stored) {
    alert("No saved notes");
    return;
  }

  notes = JSON.parse(stored);
  displayNotes();
}

// 🖥 DISPLAY
function displayNotes(filtered = notes) {
  const container = document.getElementById("notesList");
  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = "<p>No notes found</p>";
    return;
  }

  [...filtered].reverse().forEach(n => {
    const div = document.createElement("div");
    div.className = "note";

    div.innerHTML = `
      <h3>${n.title}</h3>
      <p>${n.text}</p>
      <div class="actions">
        <button onclick="copyNote(\${n.text}\)">Copy</button>
        <button onclick="deleteNote(${n.id})">Delete</button>
      </div>
    `;

    container.appendChild(div);
  });
}
// ❌ DELETE
function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem("notes", JSON.stringify(notes));
  displayNotes();
}

// 📋 COPY
function copyNote(text) {
  navigator.clipboard.writeText(text);
}

// 🔍 SEARCH
function searchNotes() {
  const q = document.getElementById("search").value.toLowerCase();

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.text.toLowerCase().includes(q)
  );

  displayNotes(filtered);
}

// 🎤 VOICE
function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    alert("Voice not supported");
    return;
  }

  const rec = new SR();
  rec.lang = "en-US";

  rec.onresult = (e) => {
    document.getElementById("note").value += " " + e.results[0][0].transcript;
  };

  rec.start();
}

// 🚀 RUN APP
init();
