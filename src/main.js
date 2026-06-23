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
const BACK_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`;

let data = loadData();
let currentListId = null;
let learnListId = null;
let learnOrder = [];
let learnIndex = 0;

const els = {
  appTitle: document.getElementById("app-title"),
  headerSimple: document.getElementById("header-simple"),
  headerListNav: document.getElementById("header-list-nav"),
  listHeaderTitle: document.getElementById("list-header-title"),
  btnHeaderBack: document.getElementById("btn-header-back"),
  btnHeaderDeleteList: document.getElementById("btn-header-delete-list"),
  listsOverview: document.getElementById("lists-overview"),
  listDetail: document.getElementById("list-detail"),
  listsList: document.getElementById("lists-list"),
  listsEmpty: document.getElementById("lists-empty"),
  vocabList: document.getElementById("vocab-list"),
  vocabsEmpty: document.getElementById("vocabs-empty"),
  btnAddList: document.getElementById("btn-add-list"),
  btnImportList: document.getElementById("btn-import-list"),
  btnShareList: document.getElementById("btn-share-list"),
  btnAddVocab: document.getElementById("btn-add-vocab"),
  dialogImportList: document.getElementById("dialog-import-list"),
  importListForm: document.getElementById("import-list-form"),
  inputImportList: document.getElementById("input-import-list"),
  importError: document.getElementById("import-error"),
  cancelImportList: document.getElementById("cancel-import-list"),
  dialogAddList: document.getElementById("dialog-add-list"),
  addListForm: document.getElementById("add-list-form"),
  inputListName: document.getElementById("input-list-name"),
  cancelList: document.getElementById("cancel-list"),
  dialogRenameList: document.getElementById("dialog-rename-list"),
  renameListForm: document.getElementById("rename-list-form"),
  inputRenameList: document.getElementById("input-rename-list"),
  cancelRenameList: document.getElementById("cancel-rename-list"),
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
  flashcard: document.getElementById("flashcard"),
  cardFront: document.getElementById("card-front"),
  cardBack: document.getElementById("card-back"),
  cardIndex: document.getElementById("card-index"),
  cardTotal: document.getElementById("card-total"),
  btnKnew: document.getElementById("btn-knew"),
  btnUnknown: document.getElementById("btn-unknown"),
  learnCardActions: document.getElementById("learn-card-actions"),
  learnDone: document.getElementById("learn-done"),
  learnProgress: document.getElementById("learn-progress"),
  learnFlipHint: document.getElementById("learn-flip-hint"),
  dialogConfirm: document.getElementById("dialog-confirm"),
  confirmTitle: document.getElementById("confirm-title"),
  confirmMessage: document.getElementById("confirm-message"),
  confirmOk: document.getElementById("confirm-ok"),
};

els.btnHeaderBack.innerHTML = BACK_ICON;
els.btnHeaderDeleteList.innerHTML = DELETE_ICON;

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
        reviewInterval: 1,
        nextReview: null,
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

function todayDateString() {
  const now = new Date();
  return formatDate(now);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDaysToDateString(dateStr, days) {
  const base = dateStr ? parseDateString(dateStr) : new Date();
  base.setHours(0, 0, 0, 0);
  const result = new Date(base.getTime() + days * 86_400_000);
  return formatDate(result);
}

function formatReviewDate(dateStr) {
  if (!dateStr) return "Neu";
  const today = todayDateString();
  if (dateStr <= today) return "Fällig";
  const date = parseDateString(dateStr);
  return `Ab ${date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
}

function normalizeVocab(vocab) {
  vocab.flipMode = normalizeFlipMode(vocab.flipMode);
  vocab.reviewInterval =
    typeof vocab.reviewInterval === "number" && vocab.reviewInterval > 0
      ? vocab.reviewInterval
      : 1;
  vocab.nextReview =
    typeof vocab.nextReview === "string" && vocab.nextReview ? vocab.nextReview : null;
}

function isVocabDue(vocab) {
  if (!vocab.nextReview) return true;
  return vocab.nextReview <= todayDateString();
}

function countDueVocabs(list) {
  return list.vocabs.filter(isVocabDue).length;
}

function normalizeData(parsed) {
  parsed.lists?.forEach((list) => {
    list.vocabs?.forEach(normalizeVocab);
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

function showSimpleHeader(title) {
  els.headerSimple.classList.remove("hidden");
  els.headerListNav.classList.add("hidden");
  setAppTitle(title);
}

function showListHeader(title) {
  els.headerSimple.classList.add("hidden");
  els.headerListNav.classList.remove("hidden");
  els.listHeaderTitle.textContent = title;
}

function openRenameListDialog() {
  if (!currentListId) return;
  const list = getList(currentListId);
  if (!list) return;

  els.inputRenameList.value = list.name;
  els.dialogRenameList.showModal();
  positionDialogForKeyboard(els.dialogRenameList);
  els.inputRenameList.focus();
  els.inputRenameList.select();
}

function cloneListForExport(list) {
  return {
    id: list.id,
    name: list.name,
    vocabs: list.vocabs.map((vocab) => ({
      id: vocab.id,
      front: vocab.front,
      back: vocab.back,
      flipMode: normalizeFlipMode(vocab.flipMode),
      reviewInterval: vocab.reviewInterval,
      nextReview: vocab.nextReview,
    })),
  };
}

function serializeListForExport(list) {
  return JSON.stringify(cloneListForExport(list), null, 2);
}

function parseImportedListText(text) {
  let parsed;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    throw new Error("Ungültiges JSON. Bitte das komplette Listendaten-Format einfügen.");
  }

  let listData;
  if (parsed?.lists && Array.isArray(parsed.lists)) {
    if (parsed.lists.length !== 1) {
      throw new Error("Es muss genau eine Liste im Datenformat enthalten sein.");
    }
    listData = parsed.lists[0];
  } else if (parsed?.name && Array.isArray(parsed.vocabs)) {
    listData = parsed;
  } else {
    throw new Error("Unbekanntes Format. Erwartet wird eine Liste mit name und vocabs.");
  }

  if (!String(listData.name ?? "").trim()) {
    throw new Error("Der Listenname fehlt.");
  }

  if (!Array.isArray(listData.vocabs) || listData.vocabs.length === 0) {
    throw new Error("Die Liste enthält keine Vokabeln.");
  }

  const vocabs = listData.vocabs
    .map((vocab) => {
      const front = String(vocab?.front ?? "").trim();
      const back = String(vocab?.back ?? "").trim();
      if (!front || !back) return null;

      const imported = {
        id: crypto.randomUUID(),
        front,
        back,
        flipMode: normalizeFlipMode(vocab.flipMode),
        reviewInterval: vocab.reviewInterval,
        nextReview: vocab.nextReview ?? null,
      };
      normalizeVocab(imported);
      return imported;
    })
    .filter(Boolean);

  if (vocabs.length === 0) {
    throw new Error("Keine gültigen Vokabeln gefunden.");
  }

  return {
    id: crypto.randomUUID(),
    name: String(listData.name).trim(),
    vocabs,
  };
}

function importListFromText(text) {
  const list = parseImportedListText(text);
  data.lists.push(list);
  saveData();
  renderLists();
  return list;
}

async function shareCurrentList() {
  if (!currentListId) return;
  const list = getList(currentListId);
  if (!list) return;

  const text = serializeListForExport(list);

  if (navigator.share) {
    try {
      await navigator.share({ title: list.name, text });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    window.alert("Die Listendaten wurden in die Zwischenablage kopiert.");
  } catch {
    window.alert("Die Listendaten konnten nicht geteilt werden. Bitte versuche es erneut.");
  }
}

function openImportListDialog() {
  els.inputImportList.value = "";
  els.importError.textContent = "";
  els.importError.classList.add("hidden");
  els.dialogImportList.showModal();
  positionDialogForKeyboard(els.dialogImportList);
  els.inputImportList.focus();
}

function renameList(id, name) {
  const list = getList(id);
  if (!list) return;

  const trimmed = name.trim();
  if (!trimmed) return;

  list.name = trimmed;
  saveData();
  showListHeader(list.name);
  renderLists();
}

function openConfirmDialog({ title, message, confirmLabel = "Löschen" }) {
  els.confirmTitle.textContent = title;
  els.confirmMessage.textContent = message;
  els.confirmOk.textContent = confirmLabel;
  els.dialogConfirm.showModal();
  return new Promise((resolve) => {
    els.dialogConfirm.addEventListener(
      "close",
      () => resolve(els.dialogConfirm.returnValue === "confirm"),
      { once: true },
    );
  });
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
  showSimpleHeader(DEFAULT_TITLE);
  renderLists();
}

function openList(id) {
  currentListId = id;
  const list = getList(id);
  if (!list) return;

  els.listsOverview.classList.add("hidden");
  els.listDetail.classList.remove("hidden");
  els.learnArea.classList.add("hidden");
  showListHeader(list.name);
  renderVocabs();
}

function renderLists() {
  els.listsList.innerHTML = "";
  els.listsEmpty.style.display = data.lists.length ? "none" : "block";

  data.lists.forEach((list) => {
    const li = document.createElement("li");
    li.className = "card list-card";
    const dueCount = countDueVocabs(list);
    const learnDisabled = dueCount === 0 ? "disabled" : "";
    const dueLabel =
      dueCount > 0
        ? `<div class="badge-row"><span class="badge">${dueCount} fällig</span></div>`
        : "";
    li.innerHTML = `
      <div class="card-body list-info">
        <strong>${escapeHtml(list.name)}</strong>
        <div class="list-meta">
          <span>${list.vocabs.length} Vokabel${list.vocabs.length === 1 ? "" : "n"}</span>
          ${dueLabel}
        </div>
      </div>
      <div class="list-actions">
        <button type="button" class="icon-btn learn-btn" data-id="${list.id}" aria-label="Lernen" ${learnDisabled}>
          ${LEARN_ICON}
        </button>
        <button type="button" class="icon-btn edit-btn" data-id="${list.id}" aria-label="Bearbeiten">
          ${EDIT_ICON}
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
        <div class="badge-row">
          <span class="badge">${FLIP_LABELS[normalizeFlipMode(vocab.flipMode)]}</span>
          <span class="badge">${formatReviewDate(vocab.nextReview)}</span>
        </div>
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
    reviewInterval: 1,
    nextReview: null,
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

function shuffleArray(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

function startLearn(listId) {
  const list = getList(listId);
  if (!list) return;

  const dueVocabs = list.vocabs.filter(isVocabDue);
  if (dueVocabs.length === 0) return;

  learnListId = listId;
  learnOrder = dueVocabs.map((v) => v.id);
  shuffleArray(learnOrder);
  learnIndex = 0;

  els.listsOverview.classList.add("hidden");
  els.listDetail.classList.add("hidden");
  els.learnArea.classList.remove("hidden");
  showSimpleHeader(list.name);
  showLearnState();
}

function showLearnState() {
  const hasCards = learnOrder.length > 0;
  els.flashcard.classList.toggle("hidden", !hasCards);
  els.learnCardActions.classList.toggle("hidden", !hasCards);
  els.learnFlipHint.classList.toggle("hidden", !hasCards);
  els.learnProgress.classList.toggle("hidden", !hasCards);
  els.learnDone.classList.toggle("hidden", hasCards);

  if (hasCards) showCard();
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
  els.cardTotal.textContent = learnOrder.length;
  applyStartSide(vocab);
}

function answerCard(knew) {
  const vocabs = getLearnVocabs();
  const vocabId = learnOrder[learnIndex];
  const vocab = vocabs.find((v) => v.id === vocabId);
  if (!vocab) return;

  if (knew) {
    const intervalDays = vocab.reviewInterval;
    const today = todayDateString();
    const baseDate =
      vocab.nextReview && vocab.nextReview > today ? vocab.nextReview : today;
    vocab.nextReview = addDaysToDateString(baseDate, intervalDays);
    vocab.reviewInterval *= 1.5;
    learnOrder.splice(learnIndex, 1);
    if (learnIndex >= learnOrder.length) learnIndex = 0;
  } else {
    vocab.reviewInterval = 1;
    const [current] = learnOrder.splice(learnIndex, 1);
    learnOrder.push(current);
    if (learnIndex >= learnOrder.length) learnIndex = 0;
  }

  saveData();
  renderLists();
  if (currentListId === learnListId) renderVocabs();
  showLearnState();
}

els.btnAddList.addEventListener("click", () => {
  els.inputListName.value = "";
  els.dialogAddList.showModal();
  els.inputListName.focus();
});

els.btnImportList.addEventListener("click", openImportListDialog);

els.cancelImportList.addEventListener("click", () => els.dialogImportList.close());

els.importListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  els.importError.textContent = "";
  els.importError.classList.add("hidden");

  try {
    importListFromText(els.inputImportList.value);
    els.dialogImportList.close();
  } catch (error) {
    els.importError.textContent = error.message;
    els.importError.classList.remove("hidden");
  }
});

els.cancelList.addEventListener("click", () => els.dialogAddList.close());

els.addListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addList(els.inputListName.value);
  els.dialogAddList.close();
});

els.cancelRenameList.addEventListener("click", () => els.dialogRenameList.close());

els.renameListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentListId) return;
  renameList(currentListId, els.inputRenameList.value);
  els.dialogRenameList.close();
});

els.listHeaderTitle.addEventListener("click", openRenameListDialog);

els.btnHeaderBack.addEventListener("click", showListsOverview);

els.btnHeaderDeleteList.addEventListener("click", async () => {
  if (!currentListId) return;
  const list = getList(currentListId);
  if (!list) return;

  const confirmed = await openConfirmDialog({
    title: "Liste löschen?",
    message: `„${list.name}" und alle Vokabeln darin werden unwiderruflich gelöscht.`,
  });
  if (confirmed) deleteList(currentListId);
});

els.btnAddVocab.addEventListener("click", () => openVocabDialog());

els.btnShareList.addEventListener("click", () => shareCurrentList());

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

els.flashcard.addEventListener("click", () => {
  els.flashcard.classList.toggle("flipped");
});

els.btnKnew.addEventListener("click", () => answerCard(true));
els.btnUnknown.addEventListener("click", () => answerCard(false));

showListsOverview();
