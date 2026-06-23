const STORAGE_KEY = "vokabel-trainer-vocabs";

let vocabs = loadVocabs();
let learnOrder = [];
let learnIndex = 0;

const els = {
  navBtns: document.querySelectorAll(".nav-btn"),
  viewManage: document.getElementById("view-manage"),
  viewLearn: document.getElementById("view-learn"),
  addForm: document.getElementById("add-form"),
  inputFront: document.getElementById("input-front"),
  inputBack: document.getElementById("input-back"),
  vocabList: document.getElementById("vocab-list"),
  count: document.getElementById("count"),
  emptyHint: document.getElementById("empty-hint"),
  learnEmpty: document.getElementById("learn-empty"),
  learnArea: document.getElementById("learn-area"),
  flashcard: document.getElementById("flashcard"),
  cardFront: document.getElementById("card-front"),
  cardBack: document.getElementById("card-back"),
  cardIndex: document.getElementById("card-index"),
  cardTotal: document.getElementById("card-total"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  btnShuffle: document.getElementById("btn-shuffle"),
};

function loadVocabs() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveVocabs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabs));
}

function switchView(view) {
  els.navBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  els.viewManage.classList.toggle("hidden", view !== "manage");
  els.viewLearn.classList.toggle("hidden", view !== "learn");

  if (view === "learn") {
    initLearnMode();
  }
}

function renderList() {
  els.count.textContent = vocabs.length;
  els.vocabList.innerHTML = "";
  els.emptyHint.classList.toggle("hidden", vocabs.length > 0);

  vocabs.forEach((vocab) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="vocab-text">
        <strong>${escapeHtml(vocab.front)}</strong>
        <span>${escapeHtml(vocab.back)}</span>
      </div>
      <button type="button" class="delete-btn" data-id="${vocab.id}">Löschen</button>
    `;
    els.vocabList.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addVocab(front, back) {
  vocabs.push({
    id: crypto.randomUUID(),
    front: front.trim(),
    back: back.trim(),
  });
  saveVocabs();
  renderList();
}

function deleteVocab(id) {
  vocabs = vocabs.filter((v) => v.id !== id);
  saveVocabs();
  renderList();
}

function initLearnMode() {
  if (vocabs.length === 0) {
    els.learnEmpty.classList.remove("hidden");
    els.learnArea.classList.add("hidden");
    return;
  }

  els.learnEmpty.classList.add("hidden");
  els.learnArea.classList.remove("hidden");

  if (learnOrder.length !== vocabs.length) {
    learnOrder = vocabs.map((v) => v.id);
    learnIndex = 0;
  }

  showCard();
}

function showCard() {
  const vocab = vocabs.find((v) => v.id === learnOrder[learnIndex]);
  if (!vocab) return;

  els.cardFront.textContent = vocab.front;
  els.cardBack.textContent = vocab.back;
  els.cardIndex.textContent = learnIndex + 1;
  els.cardTotal.textContent = vocabs.length;
  els.flashcard.classList.remove("flipped");
}

function nextCard() {
  learnIndex = (learnIndex + 1) % vocabs.length;
  showCard();
}

function prevCard() {
  learnIndex = (learnIndex - 1 + vocabs.length) % vocabs.length;
  showCard();
}

function shuffleCards() {
  learnOrder = vocabs.map((v) => v.id);
  for (let i = learnOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [learnOrder[i], learnOrder[j]] = [learnOrder[j], learnOrder[i]];
  }
  learnIndex = 0;
  showCard();
}

els.navBtns.forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

els.addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addVocab(els.inputFront.value, els.inputBack.value);
  els.inputFront.value = "";
  els.inputBack.value = "";
  els.inputFront.focus();
});

els.vocabList.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (btn) deleteVocab(btn.dataset.id);
});

els.flashcard.addEventListener("click", () => {
  els.flashcard.classList.toggle("flipped");
});

els.btnNext.addEventListener("click", nextCard);
els.btnPrev.addEventListener("click", prevCard);
els.btnShuffle.addEventListener("click", shuffleCards);

renderList();
