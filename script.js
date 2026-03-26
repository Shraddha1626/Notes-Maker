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
