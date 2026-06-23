const STORAGE_KEY = "vokabel-trainer-data";
const OLD_STORAGE_KEY = "vokabel-trainer-vocabs";
const DEFAULT_TITLE = "Vokabeltrainer";

const FLIP_LABELS = {
  front: "Immer vorne",
  both: "Beidseitig",
};

const LEARN_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 1 9l4 2.18V17c0 2.21 3.13 4 7 4s7-1.79 7-4v-5.82L23 9 12 3zm0 2.18L19.35 9 12 12.82 4.65 9 12 5.18zM5 17v-4.73l7 3.82 7-3.82V17c0 1.1-2.62 2-7 2s-7-.9-7-2z"/></svg>`;
const EDIT_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92L5.92 19.58zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
const DELETE_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;

let data = loadData();
let currentListId = null;
let learnListId = null;
let learnOrder = [];
let learnIndex = 0;

const els = {
  appTitle: document.getElementById("app-title"),
  listsOverview: document.getElementById("lists-overview"),
  listDetail: document.getElementById("list-detail"),
  listsList: document.getElementById("lists-list"),
  listsEmpty: document.getElementById("lists-empty"),
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
  learnArea: document.getElementById("learn-area"),
  btnBackLearn: document.getElementById("btn-back-learn"),
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

function setAppTitle(title) {
  els.appTitle.textContent = title;
}

function getSelectedFlipMode() {
  return els.flipBoth.checked ? "both" : "front";
}

function setFlipModeRadio(mode) {
  const normalized = normalizeFlipMode(mode);
  els.flipFront.checked = normalized === "front";
  els.flipBoth.checked = normalized === "both";
}

function positionDialogForKeyboard(dialog) {
  const vv = window.visualViewport;
  if (!vv) return;

  const update = () => {
    const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
    if (keyboardHeight > 50) {
      dialog.style.top = `${Math.max(vv.offsetTop + 8, 8)}px`;
      dialog.style.maxHeight = `${vv.height - 16}px`;
    } else {
      dialog.style.top = "";
      dialog.style.maxHeight = "";
    }
  };

  vv.addEventListener("resize", update);
  vv.addEventListener("scroll", update);
  dialog.addEventListener(
    "close",
    () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      dialog.style.top = "";
      dialog.style.maxHeight = "";
    },
    { once: true },
  );
  update();
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
  positionDialogForKeyboard(els.dialogVocab);
  els.inputFront.focus();
}

function showListsOverview() {
  currentListId = null;
  learnListId = null;
  els.listsOverview.classList.remove("hidden");
  els.listDetail.classList.add("hidden");
  els.learnArea.classList.add("hidden");
  setAppTitle(DEFAULT_TITLE);
  renderLists();
}

function openList(id) {
  currentListId = id;
  const list = getList(id);
  if (!list) return;

  els.listsOverview.classList.add("hidden");
  els.listDetail.classList.remove("hidden");
  els.learnArea.classList.add("hidden");
  setAppTitle(list.name);
  renderVocabs();
}

function renderLists() {
  els.listsList.innerHTML = "";
  els.listsEmpty.style.display = data.lists.length ? "none" : "block";

  data.lists.forEach((list) => {
    const li = document.createElement("li");
    li.className = "card list-card";
    const learnDisabled = list.vocabs.length === 0 ? "disabled" : "";
    li.innerHTML = `
      <div class="card-body list-info">
        <strong>${escapeHtml(list.name)}</strong>
        <span>${list.vocabs.length} Vokabel${list.vocabs.length === 1 ? "" : "n"}</span>
      </div>
      <div class="list-actions">
        <button type="button" class="icon-btn learn-btn" data-id="${list.id}" aria-label="Lernen" ${learnDisabled}>
          ${LEARN_ICON}
        </button>
        <button type="button" class="icon-btn edit-btn" data-id="${list.id}" aria-label="Bearbeiten">
          ${EDIT_ICON}
        </button>
        <button type="button" class="icon-btn delete-btn" data-id="${list.id}" aria-label="Löschen">
          ${DELETE_ICON}
        </button>
      </div>
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
        <button type="button" class="icon-btn delete-btn" data-id="${vocab.id}" aria-label="Vokabel löschen">
          ${DELETE_ICON}
        </button>
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
  if (currentListId === id || learnListId === id) showListsOverview();
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

function startLearn(listId) {
  const list = getList(listId);
  if (!list || list.vocabs.length === 0) return;

  learnListId = listId;
  learnOrder = list.vocabs.map((v) => v.id);
  learnIndex = 0;

  els.listsOverview.classList.add("hidden");
  els.listDetail.classList.add("hidden");
  els.learnArea.classList.remove("hidden");
  setAppTitle(list.name);
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
  const learn = e.target.closest(".learn-btn");
  if (learn && !learn.disabled) {
    startLearn(learn.dataset.id);
    return;
  }
  const edit = e.target.closest(".edit-btn");
  if (edit) {
    openList(edit.dataset.id);
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

els.btnBackLearn.addEventListener("click", showListsOverview);

els.flashcard.addEventListener("click", () => {
  els.flashcard.classList.toggle("flipped");
});

els.btnNext.addEventListener("click", nextCard);
els.btnPrev.addEventListener("click", prevCard);
els.btnShuffle.addEventListener("click", shuffleCards);

showListsOverview();
