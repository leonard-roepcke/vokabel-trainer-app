const STORAGE_KEY = "vokabel-trainer-data";
const OLD_STORAGE_KEY = "vokabel-trainer-vocabs";

const FLIP_LABELS = {
  front: "Immer vorne",
  both: "Beidseitig",
};

const EDIT_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92L5.92 19.58zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;

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
  dialogVocab: document.getElementById("dialog-vocab"),
  vocabForm: document.getElementById("vocab-form"),
  vocabDialogTitle: document.getElementById("vocab-dialog-title"),
  vocabSubmitBtn: document.getElementById("vocab-submit-btn"),
  editVocabId: document.getElementById("edit-vocab-id"),
  inputFront: document.getElementById("input-front"),
  inputBack: document.getElementById("input-back"),
  flipFront: document.getElementById("flip-front"),
  flipBoth: document.getElementById("flip-both"),
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
    if (stored) return normalizeData(JSON.parse(stored));
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
        flipMode: "both",
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

function normalizeFlipMode(mode) {
  if (mode === "front") return "front";
  return "both";
}

function normalizeData(parsed) {
  parsed.lists?.forEach((list) => {
    list.vocabs?.forEach((vocab) => {
      vocab.flipMode = normalizeFlipMode(vocab.flipMode);
    });
  });
  return parsed;
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

function getSelectedFlipMode() {
  return els.flipBoth.checked ? "both" : "front";
}

function setFlipModeRadio(mode) {
  const normalized = normalizeFlipMode(mode);
  els.flipFront.checked = normalized === "front";
  els.flipBoth.checked = normalized === "both";
}

function openVocabDialog(vocab = null) {
  if (vocab) {
    els.vocabDialogTitle.textContent = "Vokabel bearbeiten";
    els.vocabSubmitBtn.textContent = "Speichern";
    els.editVocabId.value = vocab.id;
    els.inputFront.value = vocab.front;
    els.inputBack.value = vocab.back;
    setFlipModeRadio(vocab.flipMode);
  } else {
    els.vocabDialogTitle.textContent = "Neue Vokabel";
    els.vocabSubmitBtn.textContent = "Hinzufügen";
    els.editVocabId.value = "";
    els.inputFront.value = "";
    els.inputBack.value = "";
    setFlipModeRadio("front");
  }

  els.dialogVocab.showModal();
  els.inputFront.focus();
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
    li.className = "card list-card";
    li.innerHTML = `
      <button type="button" class="card-body list-open" data-id="${list.id}">
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
    li.className = "card vocab-card";
    li.innerHTML = `
      <div class="card-body vocab-text">
        <strong>${escapeHtml(vocab.front)}</strong>
        <span>${escapeHtml(vocab.back)}</span>
        <span class="mode-badge">${FLIP_LABELS[normalizeFlipMode(vocab.flipMode)]}</span>
      </div>
      <div class="vocab-actions">
        <button type="button" class="icon-btn edit-btn" data-id="${vocab.id}" aria-label="Vokabel bearbeiten">
          ${EDIT_ICON}
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

function addVocab(listId, front, back, flipMode) {
  const list = getList(listId);
  if (!list) return;

  list.vocabs.push({
    id: crypto.randomUUID(),
    front: front.trim(),
    back: back.trim(),
    flipMode: normalizeFlipMode(flipMode),
  });
  saveData();
  renderVocabs();
  renderLists();
}

function updateVocab(listId, vocabId, front, back, flipMode) {
  const list = getList(listId);
  if (!list) return;

  const vocab = list.vocabs.find((v) => v.id === vocabId);
  if (!vocab) return;

  vocab.front = front.trim();
  vocab.back = back.trim();
  vocab.flipMode = normalizeFlipMode(flipMode);
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

function renderLearnListPicker() {
  els.learnPickList.classList.remove("hidden");
  els.learnEmpty.classList.add("hidden");
  els.learnArea.classList.add("hidden");

  const withVocabs = data.lists.filter((l) => l.vocabs.length > 0);
  els.learnLists.innerHTML = "";
  els.learnListsEmpty.classList.toggle("hidden", withVocabs.length > 0);

  withVocabs.forEach((list) => {
    const li = document.createElement("li");
    li.className = "card list-card";
    li.innerHTML = `
      <button type="button" class="card-body list-open learn-pick" data-id="${list.id}">
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
  const mode = normalizeFlipMode(vocab.flipMode);
  const showBack = mode === "both" && Math.random() < 0.5;
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

els.btnAddVocab.addEventListener("click", () => openVocabDialog());

els.cancelVocab.addEventListener("click", () => els.dialogVocab.close());

els.vocabForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentListId) return;

  const front = els.inputFront.value;
  const back = els.inputBack.value;
  const flipMode = getSelectedFlipMode();
  const editId = els.editVocabId.value;

  if (editId) {
    updateVocab(currentListId, editId, front, back, flipMode);
  } else {
    addVocab(currentListId, front, back, flipMode);
  }

  els.dialogVocab.close();
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
  const edit = e.target.closest(".edit-btn");
  if (edit) {
    const list = getList(currentListId);
    const vocab = list?.vocabs.find((v) => v.id === edit.dataset.id);
    if (vocab) openVocabDialog(vocab);
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
