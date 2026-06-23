const STORAGE_KEY = "vokabel-trainer-data";
const OLD_STORAGE_KEY = "vokabel-trainer-vocabs";

const FLIP_MODES = ["random", "front", "back"];
const FLIP_LABELS = {
  random: "Zufällig",
  front: "Immer vorne",
  back: "Immer hinten",
};

let data = loadData();
let currentListId = null;
let learnListId = null;
let learnOrder = [];
let learnIndex = 0;

const els = {
  navBtns: document.querySelectorAll(".nav-btn"),
  viewManage: document.getElementById("view-manage"),
  viewLearn: document.getElementById("view-learn"),
  listsOverview: document.getElementById("lists-overview"),
  listDetail: document.getElementById("list-detail"),
  listsList: document.getElementById("lists-list"),
  listsEmpty: document.getElementById("lists-empty"),
  listTitle: document.getElementById("list-title"),
  vocabList: document.getElementById("vocab-list"),
  vocabsEmpty: document.getElementById("vocabs-empty"),
  btnAddList: document.getElementById("btn-add-list"),
  btnBackLists: document.getElementById("btn-back-lists"),
  btnAddVocab: document.getElementById("btn-add-vocab"),
  dialogAddList: document.getElementById("dialog-add-list"),
  addListForm: document.getElementById("add-list-form"),
  inputListName: document.getElementById("input-list-name"),
  cancelList: document.getElementById("cancel-list"),
  dialogAddVocab: document.getElementById("dialog-add-vocab"),
  addVocabForm: document.getElementById("add-vocab-form"),
  inputFront: document.getElementById("input-front"),
  inputBack: document.getElementById("input-back"),
  cancelVocab: document.getElementById("cancel-vocab"),
  learnPickList: document.getElementById("learn-pick-list"),
  learnLists: document.getElementById("learn-lists"),
  learnListsEmpty: document.getElementById("learn-lists-empty"),
  learnEmpty: document.getElementById("learn-empty"),
  learnArea: document.getElementById("learn-area"),
  btnBackLearn: document.getElementById("btn-back-learn"),
  learnListName: document.getElementById("learn-list-name"),
  flashcard: document.getElementById("flashcard"),
  cardFront: document.getElementById("card-front"),
  cardBack: document.getElementById("card-back"),
  cardIndex: document.getElementById("card-index"),
  cardTotal: document.getElementById("card-total"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  btnShuffle: document.getElementById("btn-shuffle"),
};

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }

  try {
    const old = localStorage.getItem(OLD_STORAGE_KEY);
    if (old) {
      const vocabs = JSON.parse(old).map((v) => ({
        id: v.id,
        front: v.front,
        back: v.back,
        flipMode: "random",
      }));
      localStorage.removeItem(OLD_STORAGE_KEY);
      return {
        lists: [{ id: crypto.randomUUID(), name: "Meine Vokabeln", vocabs }],
      };
    }
  } catch {
    /* ignore */
  }

  return { lists: [] };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getList(id) {
  return data.lists.find((l) => l.id === id);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function nextFlipMode(mode) {
  const i = FLIP_MODES.indexOf(mode ?? "random");
  return FLIP_MODES[(i + 1) % FLIP_MODES.length];
}

function switchView(view) {
  els.navBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  els.viewManage.classList.toggle("hidden", view !== "manage");
  els.viewLearn.classList.toggle("hidden", view !== "learn");

  if (view === "learn") {
    learnListId = null;
    renderLearnListPicker();
  }
}

function showListsOverview() {
  currentListId = null;
  els.listsOverview.classList.remove("hidden");
  els.listDetail.classList.add("hidden");
  renderLists();
}

function openList(id) {
  currentListId = id;
  const list = getList(id);
  if (!list) return;

  els.listsOverview.classList.add("hidden");
  els.listDetail.classList.remove("hidden");
  els.listTitle.textContent = list.name;
  renderVocabs();
}

function renderLists() {
  els.listsList.innerHTML = "";
  els.listsEmpty.style.display = data.lists.length ? "none" : "block";

  data.lists.forEach((list) => {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `
      <button type="button" class="list-open" data-id="${list.id}">
        <strong>${escapeHtml(list.name)}</strong>
        <span>${list.vocabs.length} Vokabel${list.vocabs.length === 1 ? "" : "n"}</span>
      </button>
      <button type="button" class="delete-btn" data-id="${list.id}" aria-label="Liste löschen">Löschen</button>
    `;
    els.listsList.appendChild(li);
  });
}

function renderVocabs() {
  const list = getList(currentListId);
  if (!list) return;

  els.vocabList.innerHTML = "";
  els.vocabsEmpty.classList.toggle("hidden", list.vocabs.length > 0);

  list.vocabs.forEach((vocab) => {
    const li = document.createElement("li");
    li.className = "vocab-item";
    li.innerHTML = `
      <div class="vocab-text">
        <strong>${escapeHtml(vocab.front)}</strong>
        <span>${escapeHtml(vocab.back)}</span>
      </div>
      <div class="vocab-actions">
        <button type="button" class="flip-mode-btn" data-id="${vocab.id}" title="Anzeigemodus wechseln">
          ${FLIP_LABELS[vocab.flipMode ?? "random"]}
        </button>
        <button type="button" class="delete-btn" data-id="${vocab.id}">Löschen</button>
      </div>
    `;
    els.vocabList.appendChild(li);
  });
}

function addList(name) {
  data.lists.push({
    id: crypto.randomUUID(),
    name: name.trim(),
    vocabs: [],
  });
  saveData();
  renderLists();
}

function deleteList(id) {
  data.lists = data.lists.filter((l) => l.id !== id);
  saveData();
  if (currentListId === id) showListsOverview();
  else renderLists();
}

function addVocab(listId, front, back) {
  const list = getList(listId);
  if (!list) return;

  list.vocabs.push({
    id: crypto.randomUUID(),
    front: front.trim(),
    back: back.trim(),
    flipMode: "random",
  });
  saveData();
  renderVocabs();
  renderLists();
}

function deleteVocab(listId, vocabId) {
  const list = getList(listId);
  if (!list) return;

  list.vocabs = list.vocabs.filter((v) => v.id !== vocabId);
  saveData();
  renderVocabs();
  renderLists();
}

function toggleFlipMode(listId, vocabId) {
  const list = getList(listId);
  if (!list) return;

  const vocab = list.vocabs.find((v) => v.id === vocabId);
  if (!vocab) return;

  vocab.flipMode = nextFlipMode(vocab.flipMode);
  saveData();
  renderVocabs();
}

function renderLearnListPicker() {
  els.learnPickList.classList.remove("hidden");
  els.learnEmpty.classList.add("hidden");
  els.learnArea.classList.add("hidden");

  const withVocabs = data.lists.filter((l) => l.vocabs.length > 0);
  els.learnLists.innerHTML = "";
  els.learnListsEmpty.classList.toggle("hidden", withVocabs.length > 0);

  withVocabs.forEach((list) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <button type="button" class="list-open learn-pick" data-id="${list.id}">
        <strong>${escapeHtml(list.name)}</strong>
        <span>${list.vocabs.length} Vokabel${list.vocabs.length === 1 ? "" : "n"}</span>
      </button>
    `;
    els.learnLists.appendChild(li);
  });
}

function startLearn(listId) {
  const list = getList(listId);
  if (!list || list.vocabs.length === 0) return;

  learnListId = listId;
  learnOrder = list.vocabs.map((v) => v.id);
  learnIndex = 0;

  els.learnPickList.classList.add("hidden");
  els.learnEmpty.classList.add("hidden");
  els.learnArea.classList.remove("hidden");
  els.learnListName.textContent = list.name;
  showCard();
}

function getLearnVocabs() {
  const list = getList(learnListId);
  return list?.vocabs ?? [];
}

function applyStartSide(vocab) {
  const mode = vocab.flipMode ?? "random";
  let showBack = false;

  if (mode === "front") showBack = false;
  else if (mode === "back") showBack = true;
  else showBack = Math.random() < 0.5;

  els.flashcard.classList.toggle("flipped", showBack);
}

function showCard() {
  const vocabs = getLearnVocabs();
  const vocab = vocabs.find((v) => v.id === learnOrder[learnIndex]);
  if (!vocab) return;

  els.cardFront.textContent = vocab.front;
  els.cardBack.textContent = vocab.back;
  els.cardIndex.textContent = learnIndex + 1;
  els.cardTotal.textContent = vocabs.length;
  applyStartSide(vocab);
}

function nextCard() {
  const vocabs = getLearnVocabs();
  learnIndex = (learnIndex + 1) % vocabs.length;
  showCard();
}

function prevCard() {
  const vocabs = getLearnVocabs();
  learnIndex = (learnIndex - 1 + vocabs.length) % vocabs.length;
  showCard();
}

function shuffleCards() {
  const vocabs = getLearnVocabs();
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

els.btnAddList.addEventListener("click", () => {
  els.inputListName.value = "";
  els.dialogAddList.showModal();
  els.inputListName.focus();
});

els.cancelList.addEventListener("click", () => els.dialogAddList.close());

els.addListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addList(els.inputListName.value);
  els.dialogAddList.close();
});

els.btnBackLists.addEventListener("click", showListsOverview);

els.btnAddVocab.addEventListener("click", () => {
  els.inputFront.value = "";
  els.inputBack.value = "";
  els.dialogAddVocab.showModal();
  els.inputFront.focus();
});

els.cancelVocab.addEventListener("click", () => els.dialogAddVocab.close());

els.addVocabForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentListId) return;
  addVocab(currentListId, els.inputFront.value, els.inputBack.value);
  els.dialogAddVocab.close();
});

els.listsList.addEventListener("click", (e) => {
  const open = e.target.closest(".list-open");
  if (open) {
    openList(open.dataset.id);
    return;
  }
  const del = e.target.closest(".delete-btn");
  if (del) deleteList(del.dataset.id);
});

els.vocabList.addEventListener("click", (e) => {
  const flip = e.target.closest(".flip-mode-btn");
  if (flip) {
    toggleFlipMode(currentListId, flip.dataset.id);
    return;
  }
  const del = e.target.closest(".delete-btn");
  if (del) deleteVocab(currentListId, del.dataset.id);
});

els.learnLists.addEventListener("click", (e) => {
  const pick = e.target.closest(".learn-pick");
  if (pick) startLearn(pick.dataset.id);
});

els.btnBackLearn.addEventListener("click", renderLearnListPicker);

els.flashcard.addEventListener("click", () => {
  els.flashcard.classList.toggle("flipped");
});

els.btnNext.addEventListener("click", nextCard);
els.btnPrev.addEventListener("click", prevCard);
els.btnShuffle.addEventListener("click", shuffleCards);

showListsOverview();
