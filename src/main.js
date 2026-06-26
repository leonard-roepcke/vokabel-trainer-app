import {
  applyStaticTranslations,
  flipLabel,
  getLanguage,
  setLanguage,
  t,
  vocabCountLabel,
} from "./i18n.js";
import { processImageFile } from "./images.js";
import { shareListJsonFile } from "./exportList.js";
import { setupImportFileListener } from "./importFile.js";

const STORAGE_KEY = "vokabel-trainer-data";
const SETTINGS_KEY = "vokabel-trainer-settings";
const OLD_STORAGE_KEY = "vokabel-trainer-vocabs";

const LEARN_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 1 9l4 2.18V17c0 2.21 3.13 4 7 4s7-1.79 7-4v-5.82L23 9 12 3zm0 2.18L19.35 9 12 12.82 4.65 9 12 5.18zM5 17v-4.73l7 3.82 7-3.82V17c0 1.1-2.62 2-7 2s-7-.9-7-2z"/></svg>`;
const EDIT_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92L5.92 19.58zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
const DELETE_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
const BACK_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`;
const HOME_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`;
const SETTINGS_ICON = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>`;

let settings = loadSettings();
setLanguage(settings.language);
let data = loadData();
let currentListId = null;
let learnListId = null;
let learnOrder = [];
let learnIndex = 0;
let learnPassedSides = {};
let dialogFrontImage = null;
let dialogBackImage = null;

const els = {
  appTitle: document.getElementById("app-title"),
  headerSimple: document.getElementById("header-simple"),
  headerListNav: document.getElementById("header-list-nav"),
  listHeaderTitle: document.getElementById("list-header-title"),
  btnHeaderBack: document.getElementById("btn-header-back"),
  btnHeaderDeleteList: document.getElementById("btn-header-delete-list"),
  btnSettings: document.getElementById("btn-settings"),
  listsOverview: document.getElementById("lists-overview"),
  settingsArea: document.getElementById("settings-area"),
  settingDarkMode: document.getElementById("setting-dark-mode"),
  settingShowListAnswers: document.getElementById("setting-show-list-answers"),
  btnLanguage: document.getElementById("btn-language"),
  settingLanguageLabel: document.getElementById("setting-language-label"),
  dialogLanguage: document.getElementById("dialog-language"),
  languageForm: document.getElementById("language-form"),
  languageDe: document.getElementById("language-de"),
  languageEn: document.getElementById("language-en"),
  cancelLanguage: document.getElementById("cancel-language"),
  listDetail: document.getElementById("list-detail"),
  listsList: document.getElementById("lists-list"),
  listsEmpty: document.getElementById("lists-empty"),
  vocabList: document.getElementById("vocab-list"),
  vocabsEmpty: document.getElementById("vocabs-empty"),
  btnAddList: document.getElementById("btn-add-list"),
  btnImportList: document.getElementById("btn-import-list"),
  btnShareList: document.getElementById("btn-share-list"),
  btnLearnList: document.getElementById("btn-learn-list"),
  btnAddVocab: document.getElementById("btn-add-vocab"),
  dialogShareList: document.getElementById("dialog-share-list"),
  shareListForm: document.getElementById("share-list-form"),
  cancelShareList: document.getElementById("cancel-share-list"),
  inputImportFile: document.getElementById("input-import-file"),
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
  inputFrontPhoto: document.getElementById("input-front-photo"),
  inputBackPhoto: document.getElementById("input-back-photo"),
  btnFrontPhoto: document.getElementById("btn-front-photo"),
  btnBackPhoto: document.getElementById("btn-back-photo"),
  thumbFrontImage: document.getElementById("thumb-front-image"),
  thumbBackImage: document.getElementById("thumb-back-image"),
  vocabFormError: document.getElementById("vocab-form-error"),
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

setHeaderBack();
els.btnHeaderDeleteList.innerHTML = DELETE_ICON;
els.btnLearnList.innerHTML = LEARN_ICON;
els.btnSettings.innerHTML = SETTINGS_ICON;

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        darkMode: Boolean(parsed.darkMode),
        showListAnswers: parsed.showListAnswers !== false,
        language: parsed.language === "en" ? "en" : "de",
      };
    }
  } catch {
    /* ignore */
  }
  return { darkMode: false, showListAnswers: true, language: "de" };
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

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
        lists: [{ id: crypto.randomUUID(), name: t("defaultListName"), vocabs }],
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

function dateLocale() {
  return getLanguage() === "en" ? "en-US" : "de-DE";
}

function formatReviewDate(dateStr) {
  if (!dateStr) return t("reviewNew");
  const today = todayDateString();
  if (dateStr <= today) return t("reviewDue");
  const date = parseDateString(dateStr);
  return t("reviewFrom", {
    date: date.toLocaleDateString(dateLocale(), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  });
}

function normalizeImageField(value) {
  if (typeof value !== "string" || !value.startsWith("data:image/")) return null;
  return value;
}

function normalizeVocab(vocab) {
  vocab.flipMode = normalizeFlipMode(vocab.flipMode);
  vocab.reviewInterval =
    typeof vocab.reviewInterval === "number" && vocab.reviewInterval > 0
      ? vocab.reviewInterval
      : 1;
  vocab.nextReview =
    typeof vocab.nextReview === "string" && vocab.nextReview ? vocab.nextReview : null;
  vocab.frontImage = normalizeImageField(vocab.frontImage);
  vocab.backImage = normalizeImageField(vocab.backImage);
}

function hasVocabSideContent(text, image) {
  return Boolean(String(text ?? "").trim() || image);
}

function isValidVocabContent(vocab) {
  return (
    hasVocabSideContent(vocab.front, vocab.frontImage) &&
    hasVocabSideContent(vocab.back, vocab.backImage)
  );
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

function vocabSidePreviewHtml(text, image, { primary = false } = {}) {
  const parts = [];
  const trimmed = String(text ?? "").trim();
  if (trimmed) {
    const tag = primary ? "strong" : "span";
    const className = primary ? "" : ' class="vocab-side-text"';
    parts.push(`<${tag}${className}>${escapeHtml(trimmed)}</${tag}>`);
  }
  if (image) {
    parts.push(
      `<img class="vocab-thumb" src="${image}" alt="${escapeHtml(t("photoAlt"))}" />`,
    );
  }
  return parts.join("");
}

function setCardSideContent(element, text, image) {
  element.innerHTML = "";
  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = t("photoAlt");
    img.className = "card-side-image";
    element.appendChild(img);
  }
  const trimmed = String(text ?? "").trim();
  if (trimmed) {
    const span = document.createElement("span");
    span.textContent = trimmed;
    element.appendChild(span);
  }
}

function updateDialogImagePreview(side) {
  const image = side === "front" ? dialogFrontImage : dialogBackImage;
  const thumb = side === "front" ? els.thumbFrontImage : els.thumbBackImage;

  if (image) {
    thumb.src = image;
    thumb.alt = t("photoAlt");
    thumb.classList.remove("hidden");
  } else {
    thumb.removeAttribute("src");
    thumb.alt = "";
    thumb.classList.add("hidden");
  }
}

function resetDialogImages(frontImage = null, backImage = null) {
  dialogFrontImage = frontImage;
  dialogBackImage = backImage;
  els.inputFrontPhoto.value = "";
  els.inputBackPhoto.value = "";
  updateDialogImagePreview("front");
  updateDialogImagePreview("back");
}

async function handleDialogImagePick(side, file) {
  if (!file) return;

  try {
    const dataUrl = await processImageFile(file);
    if (side === "front") dialogFrontImage = dataUrl;
    else dialogBackImage = dataUrl;
    updateDialogImagePreview(side);
    els.vocabFormError.classList.add("hidden");
  } catch {
    els.vocabFormError.textContent = t("photoLoadFailed");
    els.vocabFormError.classList.remove("hidden");
  }
}

function setAppTitle(title) {
  els.appTitle.textContent = title;
}

function showSimpleHeader(title) {
  els.headerSimple.classList.remove("hidden");
  els.headerListNav.classList.add("hidden");
  setAppTitle(title);
}

function setHeaderBack({ icon = BACK_ICON, ariaKey = "backToLists" } = {}) {
  els.btnHeaderBack.innerHTML = icon;
  els.btnHeaderBack.setAttribute("aria-label", t(ariaKey));
}

function showNavHeader(
  title,
  { showDelete = false, editableTitle = false, learnMode = false } = {},
) {
  els.headerSimple.classList.add("hidden");
  els.headerListNav.classList.remove("hidden");
  els.headerListNav.classList.toggle("learn-header", learnMode);
  els.listHeaderTitle.textContent = title;
  els.btnHeaderDeleteList.classList.toggle("hidden", !showDelete || learnMode);
  els.listHeaderTitle.classList.toggle("list-header-title-readonly", !editableTitle);
}

function showLearnHeader(title) {
  setHeaderBack({ icon: HOME_ICON, ariaKey: "backToHome" });
  showNavHeader(title, { showDelete: false, editableTitle: false, learnMode: true });
}

function languageLabel(code) {
  return code === "en" ? "English" : "Deutsch";
}

function updateLanguageLabel() {
  els.settingLanguageLabel.textContent = languageLabel(settings.language);
  els.languageDe.checked = settings.language === "de";
  els.languageEn.checked = settings.language === "en";
}

function openLanguageDialog() {
  updateLanguageLabel();
  applyStaticTranslations(els.dialogLanguage);
  els.dialogLanguage.showModal();
}

function applySettings() {
  document.documentElement.lang = settings.language;
  document.documentElement.dataset.theme = settings.darkMode ? "dark" : "light";
  setLanguage(settings.language);
  document.title = t("appTitle");
  els.settingDarkMode.checked = settings.darkMode;
  els.settingShowListAnswers.checked = settings.showListAnswers;
  updateLanguageLabel();
  applyStaticTranslations();
  refreshVisibleUi();
}

function refreshVisibleUi() {
  if (!els.listsOverview.classList.contains("hidden")) renderLists();
  if (!els.listDetail.classList.contains("hidden")) renderVocabs();
  if (!els.settingsArea.classList.contains("hidden")) showNavHeader(t("settings"));
  if (!els.learnArea.classList.contains("hidden") && learnListId) {
    const list = getList(learnListId);
    if (list) showLearnHeader(list.name);
  } else if (
    els.headerSimple.classList.contains("hidden") === false &&
    els.listsOverview.classList.contains("hidden") === false
  ) {
    showSimpleHeader(t("appTitle"));
  }
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

function sanitizeFileName(name) {
  const cleaned = String(name ?? "liste")
    .trim()
    .replace(/[^\w\s-äöüÄÖÜß]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return cleaned || "liste";
}

function cloneListForExport(list, includeProgress) {
  return {
    id: list.id,
    name: list.name,
    vocabs: list.vocabs.map((vocab) => {
      const exported = {
        id: vocab.id,
        front: vocab.front,
        back: vocab.back,
        flipMode: normalizeFlipMode(vocab.flipMode),
        reviewInterval: includeProgress ? vocab.reviewInterval : 1,
        nextReview: includeProgress ? vocab.nextReview : null,
      };
      if (vocab.frontImage) exported.frontImage = vocab.frontImage;
      if (vocab.backImage) exported.backImage = vocab.backImage;
      if (!includeProgress) normalizeVocab(exported);
      return exported;
    }),
  };
}

function serializeListForExport(list, includeProgress) {
  return JSON.stringify(cloneListForExport(list, includeProgress), null, 2);
}

function parseImportedListText(text) {
  let parsed;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    throw new Error(t("importInvalidJson"));
  }

  let listData;
  if (parsed?.lists && Array.isArray(parsed.lists)) {
    if (parsed.lists.length !== 1) {
      throw new Error(t("importSingleList"));
    }
    listData = parsed.lists[0];
  } else if (parsed?.name && Array.isArray(parsed.vocabs)) {
    listData = parsed;
  } else {
    throw new Error(t("importInvalidFormat"));
  }

  if (!String(listData.name ?? "").trim()) {
    throw new Error(t("importMissingName"));
  }

  if (!Array.isArray(listData.vocabs) || listData.vocabs.length === 0) {
    throw new Error(t("importNoVocabs"));
  }

  const vocabs = listData.vocabs
    .map((vocab) => {
      const front = String(vocab?.front ?? "").trim();
      const back = String(vocab?.back ?? "").trim();

      const imported = {
        id: crypto.randomUUID(),
        front,
        back,
        flipMode: normalizeFlipMode(vocab.flipMode),
        reviewInterval: vocab.reviewInterval,
        nextReview: vocab.nextReview ?? null,
        frontImage: normalizeImageField(vocab?.frontImage),
        backImage: normalizeImageField(vocab?.backImage),
      };
      normalizeVocab(imported);
      if (!isValidVocabContent(imported)) return null;
      return imported;
    })
    .filter(Boolean);

  if (vocabs.length === 0) {
    throw new Error(t("importNoValidVocabs"));
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

function handleImportFromText(text) {
  try {
    const list = importListFromText(text);
    openList(list.id);
  } catch (error) {
    window.alert(error.message);
  }
}

function openShareListDialog() {
  applyStaticTranslations(els.dialogShareList);
  els.dialogShareList.showModal();
  return new Promise((resolve) => {
    els.dialogShareList.addEventListener(
      "close",
      () => {
        const value = els.dialogShareList.returnValue;
        if (value === "with") resolve(true);
        else if (value === "without") resolve(false);
        else resolve(null);
      },
      { once: true },
    );
  });
}

async function shareListData(list, includeProgress) {
  const jsonText = serializeListForExport(list, includeProgress);
  const fileName = `${sanitizeFileName(list.name)}.json`;
  await shareListJsonFile({
    fileName,
    jsonText,
    title: list.name,
    t,
  });
}

async function shareCurrentList() {
  if (!currentListId) return;
  const list = getList(currentListId);
  if (!list) return;

  const includeProgress = await openShareListDialog();
  if (includeProgress === null) return;
  await shareListData(list, includeProgress);
}

function renameList(id, name) {
  const list = getList(id);
  if (!list) return;

  const trimmed = name.trim();
  if (!trimmed) return;

  list.name = trimmed;
  saveData();
  showNavHeader(list.name, { showDelete: true, editableTitle: true });
  renderLists();
}

function openConfirmDialog({ title, message, confirmLabel = t("delete") }) {
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

  let positioned = false;

  const update = () => {
    if (positioned) return;

    const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
    if (keyboardHeight <= 50) return;

    positioned = true;
    vv.removeEventListener("resize", update);

    dialog.style.top = "auto";
    dialog.style.bottom = `${keyboardHeight + 16}px`;
    dialog.style.maxHeight = `${vv.height - 32}px`;
  };

  vv.addEventListener("resize", update);
  dialog.addEventListener(
    "close",
    () => {
      vv.removeEventListener("resize", update);
      dialog.style.top = "";
      dialog.style.bottom = "";
      dialog.style.maxHeight = "";
    },
    { once: true },
  );
}

function openVocabDialog(vocab = null) {
  els.vocabFormError.textContent = "";
  els.vocabFormError.classList.add("hidden");

  if (vocab) {
    els.editVocabId.value = vocab.id;
    els.inputFront.value = vocab.front;
    els.inputBack.value = vocab.back;
    setFlipModeRadio(vocab.flipMode);
    resetDialogImages(vocab.frontImage ?? null, vocab.backImage ?? null);
  } else {
    els.editVocabId.value = "";
    els.inputFront.value = "";
    els.inputBack.value = "";
    setFlipModeRadio("front");
    resetDialogImages();
  }

  applyStaticTranslations(els.dialogVocab);
  els.vocabDialogTitle.textContent = vocab ? t("editVocab") : t("newVocab");
  els.vocabSubmitBtn.textContent = vocab ? t("save") : t("add");
  els.dialogVocab.showModal();
  positionDialogForKeyboard(els.dialogVocab);
  els.inputFront.focus();
}

function hideAllViews() {
  els.listsOverview.classList.add("hidden");
  els.settingsArea.classList.add("hidden");
  els.listDetail.classList.add("hidden");
  els.learnArea.classList.add("hidden");
}

function showListsOverview() {
  currentListId = null;
  learnListId = null;
  hideAllViews();
  els.listsOverview.classList.remove("hidden");
  showSimpleHeader(t("appTitle"));
  renderLists();
}

function showSettings() {
  currentListId = null;
  learnListId = null;
  hideAllViews();
  els.settingsArea.classList.remove("hidden");
  setHeaderBack();
  showNavHeader(t("settings"));
}

function openList(id) {
  currentListId = id;
  const list = getList(id);
  if (!list) return;

  hideAllViews();
  els.listDetail.classList.remove("hidden");
  setHeaderBack();
  showNavHeader(list.name, { showDelete: true, editableTitle: true });
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
        ? `<div class="badge-row"><span class="badge">${dueCount} ${escapeHtml(t("due"))}</span></div>`
        : "";
    li.innerHTML = `
      <div class="card-body list-info">
        <strong>${escapeHtml(list.name)}</strong>
        <div class="list-meta">
          <span>${escapeHtml(vocabCountLabel(list.vocabs.length))}</span>
          ${dueLabel}
        </div>
      </div>
      <div class="list-actions">
        <button type="button" class="icon-btn learn-btn" data-id="${list.id}" aria-label="${escapeHtml(t("learn"))}" ${learnDisabled}>
          ${LEARN_ICON}
        </button>
        <button type="button" class="icon-btn edit-btn" data-id="${list.id}" aria-label="${escapeHtml(t("edit"))}">
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
  els.btnLearnList.disabled = countDueVocabs(list) === 0;
  els.btnLearnList.setAttribute("aria-label", t("learn"));

  list.vocabs.forEach((vocab) => {
    const li = document.createElement("li");
    li.className = "card vocab-card";
    const backHtml = settings.showListAnswers
      ? vocabSidePreviewHtml(vocab.back, vocab.backImage)
      : "";
    li.innerHTML = `
      <div class="card-body vocab-text">
        ${vocabSidePreviewHtml(vocab.front, vocab.frontImage, { primary: true })}
        ${backHtml}
        <div class="badge-row">
          <span class="badge">${escapeHtml(flipLabel(normalizeFlipMode(vocab.flipMode)))}</span>
          <span class="badge">${escapeHtml(formatReviewDate(vocab.nextReview))}</span>
        </div>
      </div>
      <div class="vocab-actions">
        <button type="button" class="icon-btn edit-btn" data-id="${vocab.id}" aria-label="${escapeHtml(t("editVocabAria"))}">
          ${EDIT_ICON}
        </button>
        <button type="button" class="icon-btn delete-btn" data-id="${vocab.id}" aria-label="${escapeHtml(t("deleteVocabAria"))}">
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

function addVocab(listId, front, back, flipMode, frontImage, backImage) {
  const list = getList(listId);
  if (!list) return;

  const vocab = {
    id: crypto.randomUUID(),
    front: front.trim(),
    back: back.trim(),
    flipMode: normalizeFlipMode(flipMode),
    reviewInterval: 1,
    nextReview: null,
    frontImage: frontImage ?? null,
    backImage: backImage ?? null,
  };
  normalizeVocab(vocab);
  if (!isValidVocabContent(vocab)) return;

  list.vocabs.push(vocab);
  saveData();
  renderVocabs();
  renderLists();
}

function updateVocab(listId, vocabId, front, back, flipMode, frontImage, backImage) {
  const list = getList(listId);
  if (!list) return;

  const vocab = list.vocabs.find((v) => v.id === vocabId);
  if (!vocab) return;

  vocab.front = front.trim();
  vocab.back = back.trim();
  vocab.flipMode = normalizeFlipMode(flipMode);
  vocab.frontImage = frontImage ?? null;
  vocab.backImage = backImage ?? null;
  normalizeVocab(vocab);
  if (!isValidVocabContent(vocab)) return;

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

function arrangeLearnOrder(entries) {
  if (entries.length <= 1) return [...entries];

  const pool = [...entries];
  shuffleArray(pool);
  const result = [];

  while (pool.length > 0) {
    const lastVocabId = result.length > 0 ? result[result.length - 1].vocabId : null;
    const candidates = pool
      .map((entry, index) => index)
      .filter((index) => pool[index].vocabId !== lastVocabId);
    const picked =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : 0;
    result.push(pool[picked]);
    pool.splice(picked, 1);
  }

  return result;
}

function buildLearnEntries(vocab) {
  if (normalizeFlipMode(vocab.flipMode) === "both") {
    return [
      { vocabId: vocab.id, showBack: false },
      { vocabId: vocab.id, showBack: true },
    ];
  }
  return [{ vocabId: vocab.id, showBack: false }];
}

function scheduleReview(vocab) {
  const intervalDays = vocab.reviewInterval;
  const today = todayDateString();
  const baseDate =
    vocab.nextReview && vocab.nextReview > today ? vocab.nextReview : today;
  vocab.nextReview = addDaysToDateString(baseDate, intervalDays);
  vocab.reviewInterval *= 1.5;
}

function startLearn(listId) {
  const list = getList(listId);
  if (!list) return;

  const dueVocabs = list.vocabs.filter(isVocabDue);
  if (dueVocabs.length === 0) return;

  learnListId = listId;
  learnOrder = arrangeLearnOrder(dueVocabs.flatMap(buildLearnEntries));
  learnIndex = 0;
  learnPassedSides = {};

  hideAllViews();
  els.learnArea.classList.remove("hidden");
  showLearnHeader(list.name);
  showLearnState();
}

function showLearnState() {
  const hasCards = learnOrder.length > 0;
  if (!hasCards) {
    showListsOverview();
    return;
  }

  els.flashcard.classList.remove("hidden");
  els.learnCardActions.classList.remove("hidden");
  els.learnFlipHint.classList.remove("hidden");
  els.learnProgress.classList.remove("hidden");
  els.learnDone.classList.add("hidden");
  showCard();
}

function getLearnVocabs() {
  const list = getList(learnListId);
  return list?.vocabs ?? [];
}

function resetFlashcardFlip(showBack) {
  els.flashcard.classList.add("no-transition");
  els.flashcard.classList.toggle("flipped", showBack);
  void els.flashcard.offsetHeight;
  els.flashcard.classList.remove("no-transition");
}

function showCard() {
  const entry = learnOrder[learnIndex];
  if (!entry) return;

  const vocabs = getLearnVocabs();
  const vocab = vocabs.find((v) => v.id === entry.vocabId);
  if (!vocab) return;

  resetFlashcardFlip(entry.showBack);
  setCardSideContent(els.cardFront, vocab.front, vocab.frontImage);
  setCardSideContent(els.cardBack, vocab.back, vocab.backImage);
  els.cardIndex.textContent = learnIndex + 1;
  els.cardTotal.textContent = learnOrder.length;
}

function answerCard(knew) {
  const entry = learnOrder[learnIndex];
  if (!entry) return;

  const vocabs = getLearnVocabs();
  const vocabId = entry.vocabId;
  const vocab = vocabs.find((v) => v.id === vocabId);
  if (!vocab) return;

  const isBothMode = normalizeFlipMode(vocab.flipMode) === "both";
  const sideKey = entry.showBack ? "back" : "front";

  if (knew) {
    if (isBothMode) {
      if (!learnPassedSides[vocabId]) learnPassedSides[vocabId] = new Set();
      learnPassedSides[vocabId].add(sideKey);
      if (learnPassedSides[vocabId].size === 2) {
        scheduleReview(vocab);
        delete learnPassedSides[vocabId];
      }
    } else {
      scheduleReview(vocab);
    }
    learnOrder.splice(learnIndex, 1);
    if (learnIndex >= learnOrder.length) learnIndex = 0;
  } else {
    vocab.reviewInterval = 1;
    delete learnPassedSides[vocabId];
    if (isBothMode) {
      learnOrder = arrangeLearnOrder([
        ...learnOrder.filter((e) => e.vocabId !== vocabId),
        ...buildLearnEntries(vocab),
      ]);
      if (learnIndex >= learnOrder.length) learnIndex = 0;
    } else {
      const [current] = learnOrder.splice(learnIndex, 1);
      learnOrder.push(current);
      if (learnIndex >= learnOrder.length) learnIndex = 0;
    }
  }

  saveData();
  renderLists();
  if (currentListId === learnListId) renderVocabs();
  showLearnState();
}

els.btnSettings.addEventListener("click", showSettings);

els.settingDarkMode.addEventListener("change", () => {
  settings.darkMode = els.settingDarkMode.checked;
  saveSettings();
  applySettings();
});

els.settingShowListAnswers.addEventListener("change", () => {
  settings.showListAnswers = els.settingShowListAnswers.checked;
  saveSettings();
  if (!els.listDetail.classList.contains("hidden")) renderVocabs();
});

els.btnLanguage.addEventListener("click", openLanguageDialog);

els.cancelLanguage.addEventListener("click", () => els.dialogLanguage.close());

els.languageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const selected = els.languageForm.querySelector('input[name="language"]:checked');
  settings.language = selected?.value === "en" ? "en" : "de";
  saveSettings();
  applySettings();
  els.dialogLanguage.close();
});

els.btnAddList.addEventListener("click", () => {
  els.inputListName.value = "";
  els.dialogAddList.showModal();
  els.inputListName.focus();
});

els.btnImportList.addEventListener("click", () => {
  els.inputImportFile.value = "";
  els.inputImportFile.click();
});

els.inputImportFile.addEventListener("change", async () => {
  const file = els.inputImportFile.files?.[0];
  if (!file) return;

  try {
    handleImportFromText(await file.text());
  } catch (error) {
    window.alert(error.message);
  }
});

els.cancelShareList.addEventListener("click", () => els.dialogShareList.close());

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

els.listHeaderTitle.addEventListener("click", () => {
  if (!els.listHeaderTitle.classList.contains("list-header-title-readonly")) {
    openRenameListDialog();
  }
});

els.btnHeaderBack.addEventListener("click", showListsOverview);

els.btnHeaderDeleteList.addEventListener("click", async () => {
  if (!currentListId) return;
  const list = getList(currentListId);
  if (!list) return;

  const confirmed = await openConfirmDialog({
    title: t("deleteListTitle"),
    message: t("deleteListMessage", { name: list.name }),
  });
  if (confirmed) deleteList(currentListId);
});

els.btnAddVocab.addEventListener("click", () => openVocabDialog());

els.btnLearnList.addEventListener("click", () => {
  if (!currentListId || els.btnLearnList.disabled) return;
  startLearn(currentListId);
});

els.btnShareList.addEventListener("click", () => shareCurrentList());

els.cancelVocab.addEventListener("click", () => els.dialogVocab.close());

els.btnFrontPhoto.addEventListener("click", () => els.inputFrontPhoto.click());
els.btnBackPhoto.addEventListener("click", () => els.inputBackPhoto.click());

els.inputFrontPhoto.addEventListener("change", () => {
  handleDialogImagePick("front", els.inputFrontPhoto.files?.[0]);
});

els.inputBackPhoto.addEventListener("change", () => {
  handleDialogImagePick("back", els.inputBackPhoto.files?.[0]);
});

els.vocabForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentListId) return;

  const front = els.inputFront.value;
  const back = els.inputBack.value;
  const flipMode = getSelectedFlipMode();
  const editId = els.editVocabId.value;

  if (
    !hasVocabSideContent(front, dialogFrontImage) ||
    !hasVocabSideContent(back, dialogBackImage)
  ) {
    els.vocabFormError.textContent = t("vocabSideRequired");
    els.vocabFormError.classList.remove("hidden");
    return;
  }

  if (editId) {
    updateVocab(
      currentListId,
      editId,
      front,
      back,
      flipMode,
      dialogFrontImage,
      dialogBackImage,
    );
  } else {
    addVocab(currentListId, front, back, flipMode, dialogFrontImage, dialogBackImage);
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

applySettings();
showListsOverview();
setupImportFileListener(handleImportFromText);
