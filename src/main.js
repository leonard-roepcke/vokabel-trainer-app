import {
  applyStaticTranslations,
  flipLabel,
  getLanguage,
  setLanguage,
  t,
  vocabCountLabel,
  listCountLabel,
} from "./i18n.js";
import { processImageFile } from "./images.js";
import { shareListJsonFile } from "./exportList.js";
import { setupImportFileListener } from "./importFile.js";
import { evaluateStreak } from "./streak.js";
import { updateNotificationSchedule, updateWidgetData } from "./widget.js";

const STORAGE_KEY = "vokabel-trainer-data";
const SETTINGS_KEY = "vokabel-trainer-settings";
const OLD_STORAGE_KEY = "vokabel-trainer-vocabs";

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
let collapsedFolders = new Set();
let editingFolderId = null;

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
  settingNotifications: document.getElementById("setting-notifications"),
  settingNotificationTimeRow: document.getElementById("setting-notification-time-row"),
  settingNotificationHour: document.getElementById("setting-notification-hour"),
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
  btnAddFolder: document.getElementById("btn-add-folder"),
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
  selectAddListFolder: document.getElementById("select-add-list-folder"),
  cancelList: document.getElementById("cancel-list"),
  dialogAddFolder: document.getElementById("dialog-add-folder"),
  addFolderForm: document.getElementById("add-folder-form"),
  inputFolderName: document.getElementById("input-folder-name"),
  cancelFolder: document.getElementById("cancel-folder"),
  dialogRenameFolder: document.getElementById("dialog-rename-folder"),
  renameFolderForm: document.getElementById("rename-folder-form"),
  inputRenameFolder: document.getElementById("input-rename-folder"),
  cancelRenameFolder: document.getElementById("cancel-rename-folder"),
  dialogRenameList: document.getElementById("dialog-rename-list"),
  renameListForm: document.getElementById("rename-list-form"),
  inputRenameList: document.getElementById("input-rename-list"),
  selectRenameListFolder: document.getElementById("select-rename-list-folder"),
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
  frontImageAdd: document.getElementById("front-image-add"),
  frontImageHas: document.getElementById("front-image-has"),
  backImageAdd: document.getElementById("back-image-add"),
  backImageHas: document.getElementById("back-image-has"),
  thumbFrontImage: document.getElementById("thumb-front-image"),
  thumbBackImage: document.getElementById("thumb-back-image"),
  btnRemoveFrontImage: document.getElementById("btn-remove-front-image"),
  btnRemoveBackImage: document.getElementById("btn-remove-back-image"),
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
els.btnSettings.innerHTML = SETTINGS_ICON;

function populateNotificationHourSelect() {
  els.settingNotificationHour.innerHTML = "";
  for (let hour = 0; hour < 24; hour++) {
    const option = document.createElement("option");
    option.value = String(hour);
    option.textContent = `${String(hour).padStart(2, "0")}:00`;
    els.settingNotificationHour.appendChild(option);
  }
}

populateNotificationHourSelect();

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        darkMode: Boolean(parsed.darkMode),
        showListAnswers: parsed.showListAnswers !== false,
        language: parsed.language === "en" ? "en" : "de",
        notificationsEnabled: Boolean(parsed.notificationsEnabled),
        notificationHour:
          typeof parsed.notificationHour === "number" &&
          parsed.notificationHour >= 0 &&
          parsed.notificationHour <= 23
            ? parsed.notificationHour
            : 9,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    darkMode: false,
    showListAnswers: true,
    language: "de",
    notificationsEnabled: false,
    notificationHour: 9,
  };
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
        lists: [{ id: crypto.randomUUID(), name: t("defaultListName"), folderId: null, vocabs }],
        folders: [],
      };
    }
  } catch {
    /* ignore */
  }

  return { lists: [], folders: [] };
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

function countTotalDueVocabs() {
  return data.lists.reduce((total, list) => total + countDueVocabs(list), 0);
}

function syncWidgetAndStreak() {
  const dueCount = countTotalDueVocabs();
  const streak = evaluateStreak(data.lists, todayDateString(), dueCount);
  const allComplete = dueCount === 0;

  updateWidgetData({
    dueCount,
    streak,
    allComplete,
    language: settings.language,
  });

  updateNotificationSchedule({
    enabled: settings.notificationsEnabled,
    hour: settings.notificationHour,
    dueCount,
    streak,
    language: settings.language,
  });
}

function normalizeData(parsed) {
  if (!Array.isArray(parsed.folders)) {
    parsed.folders = [];
  }

  const folderIds = new Set(parsed.folders.map((folder) => folder.id));
  parsed.lists?.forEach((list) => {
    if (list.folderId && !folderIds.has(list.folderId)) {
      list.folderId = null;
    }
    if (list.folderId === undefined) {
      list.folderId = null;
    }
    list.vocabs?.forEach(normalizeVocab);
  });
  return parsed;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  syncWidgetAndStreak();
}

function getList(id) {
  return data.lists.find((l) => l.id === id);
}

function getFolder(id) {
  return data.folders.find((folder) => folder.id === id);
}

function populateFolderSelect(selectEl, selectedId = null) {
  selectEl.innerHTML = "";
  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = t("noFolder");
  selectEl.appendChild(noneOption);

  data.folders.forEach((folder) => {
    const option = document.createElement("option");
    option.value = folder.id;
    option.textContent = folder.name;
    selectEl.appendChild(option);
  });

  selectEl.value = selectedId ?? "";
}

function listStatusBadgeHtml(list) {
  const dueCount = countDueVocabs(list);
  if (dueCount > 0) {
    return `<div class="badge-row"><span class="badge">${dueCount} ${escapeHtml(t("due"))}</span></div>`;
  }
  if (list.vocabs.length > 0) {
    return `<div class="badge-row"><span class="badge badge-success">${escapeHtml(t("allLearned"))}</span></div>`;
  }
  return "";
}

function createListCardElement(list) {
  const li = document.createElement("li");
  li.className = "card list-card list-card-clickable";
  li.innerHTML = `
    <div class="card-body list-info" data-id="${list.id}">
      <strong>${escapeHtml(list.name)}</strong>
      <div class="list-meta">
        <span>${escapeHtml(vocabCountLabel(list.vocabs.length))}</span>
        ${listStatusBadgeHtml(list)}
      </div>
    </div>
    <div class="list-actions">
      <button type="button" class="icon-btn edit-btn" data-id="${list.id}" aria-label="${escapeHtml(t("edit"))}">
        ${EDIT_ICON}
      </button>
    </div>
  `;
  return li;
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

function getImageSideElements(side) {
  const isFront = side === "front";
  return {
    addBlock: isFront ? els.frontImageAdd : els.backImageAdd,
    hasBlock: isFront ? els.frontImageHas : els.backImageHas,
    thumb: isFront ? els.thumbFrontImage : els.thumbBackImage,
    photoInput: isFront ? els.inputFrontPhoto : els.inputBackPhoto,
  };
}

function updateDialogImagePreview(side) {
  const image = side === "front" ? dialogFrontImage : dialogBackImage;
  const { addBlock, hasBlock, thumb } = getImageSideElements(side);

  if (image) {
    addBlock.classList.add("hidden");
    hasBlock.classList.remove("hidden");
    thumb.src = image;
    thumb.alt = t("photoAlt");
    thumb.classList.remove("hidden");
  } else {
    addBlock.classList.remove("hidden");
    hasBlock.classList.add("hidden");
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

function updateNotificationSettingsUi() {
  els.settingNotifications.checked = settings.notificationsEnabled;
  els.settingNotificationHour.value = String(settings.notificationHour);
  els.settingNotificationTimeRow.classList.toggle("hidden", !settings.notificationsEnabled);
}

function applySettings() {
  document.documentElement.lang = settings.language;
  document.documentElement.dataset.theme = settings.darkMode ? "dark" : "light";
  setLanguage(settings.language);
  document.title = t("appTitle");
  els.settingDarkMode.checked = settings.darkMode;
  els.settingShowListAnswers.checked = settings.showListAnswers;
  updateNotificationSettingsUi();
  updateLanguageLabel();
  applyStaticTranslations();
  refreshVisibleUi();
  syncWidgetAndStreak();
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
  populateFolderSelect(els.selectRenameListFolder, list.folderId);
  els.dialogRenameList.showModal();
  positionDialogForKeyboard(els.dialogRenameList);
  els.inputRenameList.focus();
  els.inputRenameList.select();
}

function openRenameFolderDialog(folderId) {
  const folder = getFolder(folderId);
  if (!folder) return;

  editingFolderId = folderId;
  els.inputRenameFolder.value = folder.name;
  applyStaticTranslations(els.dialogRenameFolder);
  els.dialogRenameFolder.showModal();
  positionDialogForKeyboard(els.dialogRenameFolder);
  els.inputRenameFolder.focus();
  els.inputRenameFolder.select();
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
    folderId: null,
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

function renameList(id, name, folderId = null) {
  const list = getList(id);
  if (!list) return;

  const trimmed = name.trim();
  if (!trimmed) return;

  list.name = trimmed;
  list.folderId = folderId || null;
  saveData();
  showNavHeader(list.name, { showDelete: true, editableTitle: true });
  renderLists();
}

function addFolder(name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  data.folders.push({
    id: crypto.randomUUID(),
    name: trimmed,
  });
  saveData();
  renderLists();
}

function renameFolder(id, name) {
  const folder = getFolder(id);
  if (!folder) return;

  const trimmed = name.trim();
  if (!trimmed) return;

  folder.name = trimmed;
  saveData();
  renderLists();
}

async function deleteFolder(id) {
  const folder = getFolder(id);
  if (!folder) return;

  const confirmed = await openConfirmDialog({
    title: t("deleteFolderTitle"),
    message: t("deleteFolderMessage", { name: folder.name }),
  });
  if (!confirmed) return;

  data.lists.forEach((list) => {
    if (list.folderId === id) {
      list.folderId = null;
    }
  });
  data.folders = data.folders.filter((folder) => folder.id !== id);
  collapsedFolders.delete(id);
  saveData();
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
  const hasContent = data.lists.length > 0 || data.folders.length > 0;
  els.listsEmpty.style.display = hasContent ? "none" : "block";

  data.folders.forEach((folder) => {
    const folderLists = data.lists.filter((list) => list.folderId === folder.id);
    const isCollapsed = collapsedFolders.has(folder.id);
    const group = document.createElement("li");
    group.className = "folder-group";

    const header = document.createElement("div");
    header.className = "card folder-card";
    header.innerHTML = `
      <button
        type="button"
        class="folder-toggle"
        data-id="${folder.id}"
        aria-expanded="${!isCollapsed}"
        aria-label="${escapeHtml(t("toggleFolderAria"))}"
      >
        <span class="folder-chevron">${isCollapsed ? "▶" : "▼"}</span>
        <strong>${escapeHtml(folder.name)}</strong>
        <span class="folder-count">${escapeHtml(listCountLabel(folderLists.length))}</span>
      </button>
      <div class="list-actions">
        <button type="button" class="icon-btn edit-folder-btn" data-id="${folder.id}" aria-label="${escapeHtml(t("editFolderAria"))}">
          ${EDIT_ICON}
        </button>
        <button type="button" class="icon-btn delete-btn delete-folder-btn" data-id="${folder.id}" aria-label="${escapeHtml(t("deleteFolderAria"))}">
          ${DELETE_ICON}
        </button>
      </div>
    `;
    group.appendChild(header);

    const listsContainer = document.createElement("ul");
    listsContainer.className = `folder-lists${isCollapsed ? " hidden" : ""}`;
    listsContainer.dataset.folderId = folder.id;
    folderLists.forEach((list) => {
      listsContainer.appendChild(createListCardElement(list));
    });
    group.appendChild(listsContainer);
    els.listsList.appendChild(group);
  });

  data.lists
    .filter((list) => !list.folderId)
    .forEach((list) => {
      els.listsList.appendChild(createListCardElement(list));
    });
}

function renderVocabs() {
  const list = getList(currentListId);
  if (!list) return;

  els.vocabList.innerHTML = "";
  els.vocabsEmpty.classList.toggle("hidden", list.vocabs.length > 0);
  els.btnLearnList.disabled = countDueVocabs(list) === 0;
  els.btnLearnList.textContent = t("learn");

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

function addList(name, folderId = null) {
  data.lists.push({
    id: crypto.randomUUID(),
    name: name.trim(),
    folderId: folderId || null,
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

els.settingNotifications.addEventListener("change", () => {
  settings.notificationsEnabled = els.settingNotifications.checked;
  saveSettings();
  updateNotificationSettingsUi();
  syncWidgetAndStreak();
});

els.settingNotificationHour.addEventListener("change", () => {
  settings.notificationHour = Number(els.settingNotificationHour.value);
  saveSettings();
  syncWidgetAndStreak();
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
  populateFolderSelect(els.selectAddListFolder);
  applyStaticTranslations(els.dialogAddList);
  els.dialogAddList.showModal();
  els.inputListName.focus();
});

els.btnAddFolder.addEventListener("click", () => {
  els.inputFolderName.value = "";
  applyStaticTranslations(els.dialogAddFolder);
  els.dialogAddFolder.showModal();
  els.inputFolderName.focus();
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

els.cancelFolder.addEventListener("click", () => els.dialogAddFolder.close());

els.cancelRenameFolder.addEventListener("click", () => els.dialogRenameFolder.close());

els.addListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const folderId = els.selectAddListFolder.value || null;
  addList(els.inputListName.value, folderId);
  els.dialogAddList.close();
});

els.addFolderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addFolder(els.inputFolderName.value);
  els.dialogAddFolder.close();
});

els.renameFolderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!editingFolderId) return;
  renameFolder(editingFolderId, els.inputRenameFolder.value);
  editingFolderId = null;
  els.dialogRenameFolder.close();
});

els.cancelRenameList.addEventListener("click", () => els.dialogRenameList.close());

els.renameListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentListId) return;
  const folderId = els.selectRenameListFolder.value || null;
  renameList(currentListId, els.inputRenameList.value, folderId);
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

els.btnRemoveFrontImage.addEventListener("click", () => {
  dialogFrontImage = null;
  els.inputFrontPhoto.value = "";
  updateDialogImagePreview("front");
});

els.btnRemoveBackImage.addEventListener("click", () => {
  dialogBackImage = null;
  els.inputBackPhoto.value = "";
  updateDialogImagePreview("back");
});

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
  const folderToggle = e.target.closest(".folder-toggle");
  if (folderToggle) {
    const folderId = folderToggle.dataset.id;
    if (collapsedFolders.has(folderId)) {
      collapsedFolders.delete(folderId);
    } else {
      collapsedFolders.add(folderId);
    }
    renderLists();
    return;
  }

  const editFolder = e.target.closest(".edit-folder-btn");
  if (editFolder) {
    openRenameFolderDialog(editFolder.dataset.id);
    return;
  }

  const deleteFolderBtn = e.target.closest(".delete-folder-btn");
  if (deleteFolderBtn) {
    deleteFolder(deleteFolderBtn.dataset.id);
    return;
  }

  const edit = e.target.closest(".edit-btn");
  if (edit) {
    openList(edit.dataset.id);
    return;
  }

  const listInfo = e.target.closest(".list-info");
  if (listInfo) {
    const listId = listInfo.dataset.id;
    const list = getList(listId);
    if (!list) return;
    if (countDueVocabs(list) > 0) {
      startLearn(listId);
    } else {
      openList(listId);
    }
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
