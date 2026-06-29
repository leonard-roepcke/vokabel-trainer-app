const STRINGS = {
  de: {
    appTitle: "Vokabeltrainer",
    backToLists: "Zurück zu Listen",
    backToHome: "Zur Startseite",
    editListName: "Listenname bearbeiten",
    deleteList: "Liste löschen",
    settings: "Einstellungen",
    lists: "Listen",
    importList: "Liste importieren",
    addList: "+ Liste",
    allLearned: "Alle Vokabeln gelernt",
    addFolder: "+ Ordner",
    newFolder: "Neuer Ordner",
    renameFolder: "Ordner umbenennen",
    folderNamePlaceholder: "z.B. Englisch",
    folder: "Ordner",
    noFolder: "Kein Ordner",
    deleteFolderTitle: "Ordner löschen?",
    deleteFolderMessage: "„{name}\" wird gelöscht. Die Listen darin bleiben erhalten.",
    editFolderAria: "Ordner bearbeiten",
    deleteFolderAria: "Ordner löschen",
    toggleFolderAria: "Ordner ein- oder ausklappen",
    dragHandleAria: "Liste verschieben",
    listCountOne: "1 Liste",
    listCountMany: "{count} Listen",
    listsEmpty: "Noch keine Listen oder Ordner. Lege etwas Neues an.",
    shareList: "Liste teilen",
    addVocab: "+ Vokabel",
    vocabsEmpty: "Noch keine Vokabeln in dieser Liste.",
    flipCard: "Karte umdrehen",
    cardFront: "Vorderseite",
    cardBack: "Rückseite",
    flipHint: "Klicke auf die Karte zum Umdrehen",
    knew: "Wusste ich",
    unknown: "Wusste ich nicht",
    learnDone: "Alle fälligen Vokabeln für heute erledigt.",
    cancel: "Abbrechen",
    renameList: "Liste umbenennen",
    name: "Name",
    save: "Speichern",
    newList: "Neue Liste",
    create: "Erstellen",
    listNamePlaceholder: "z.B. Englisch Unit 3",
    editVocab: "Vokabel bearbeiten",
    newVocab: "Neue Vokabel",
    front: "Vorderseite",
    back: "Rückseite",
    frontPlaceholder: "z.B. Haus",
    backPlaceholder: "z.B. house",
    addPhoto: "Foto hinzufügen",
    deletePhoto: "Foto löschen",
    vocabSideRequired: "Vorder- und Rückseite brauchen jeweils Text oder ein Foto.",
    photoLoadFailed: "Das Foto konnte nicht geladen werden.",
    photoAlt: "Vokabelfoto",
    flipModeLegend: "Anzeige beim Lernen",
    flipFront: "Immer vorne",
    flipBoth: "Beidseitig",
    add: "Hinzufügen",
    delete: "Löschen",
    darkMode: "Dunkelmodus",
    showListAnswers: "Lösungen in Listen anzeigen",
    notifications: "Benachrichtigungen",
    notificationTime: "Uhrzeit",
    language: "Sprache",
    learn: "Lernen",
    edit: "Bearbeiten",
    editVocabAria: "Vokabel bearbeiten",
    deleteVocabAria: "Vokabel löschen",
    due: "fällig",
    flipFrontLabel: "Immer vorne",
    flipBothLabel: "Beidseitig",
    reviewNew: "Neu",
    reviewDue: "Fällig",
    reviewFrom: "Ab {date}",
    deleteListTitle: "Liste löschen?",
    deleteListMessage: "„{name}\" und alle Vokabeln darin werden unwiderruflich gelöscht.",
    shareListTitle: "Liste teilen",
    shareWithProgress: "Mit Lernfortschritt",
    shareWithoutProgress: "Ohne Lernfortschritt",
    shareFailed: "Die Liste konnte nicht geteilt werden. Bitte versuche es erneut.",
    importInvalidJson: "Ungültige JSON-Datei.",
    importSingleList: "Es muss genau eine Liste im Datenformat enthalten sein.",
    importInvalidFormat: "Unbekanntes Format. Erwartet wird eine Liste mit name und vocabs.",
    importMissingName: "Der Listenname fehlt.",
    importNoVocabs: "Die Liste enthält keine Vokabeln.",
    importNoValidVocabs: "Keine gültigen Vokabeln gefunden.",
    defaultListName: "Meine Vokabeln",
    vocabOne: "1 Vokabel",
    vocabMany: "{count} Vokabeln",
  },
  en: {
    appTitle: "Vocabulary Trainer",
    backToLists: "Back to lists",
    backToHome: "Back to home",
    editListName: "Edit list name",
    deleteList: "Delete list",
    settings: "Settings",
    lists: "Lists",
    importList: "Import list",
    addList: "+ List",
    allLearned: "All vocabulary learned",
    addFolder: "+ Folder",
    newFolder: "New folder",
    renameFolder: "Rename folder",
    folderNamePlaceholder: "e.g. English",
    folder: "Folder",
    noFolder: "No folder",
    deleteFolderTitle: "Delete folder?",
    deleteFolderMessage: "\"{name}\" will be deleted. Lists inside will be kept.",
    editFolderAria: "Edit folder",
    deleteFolderAria: "Delete folder",
    toggleFolderAria: "Expand or collapse folder",
    dragHandleAria: "Move list",
    listCountOne: "1 list",
    listCountMany: "{count} lists",
    listsEmpty: "No lists or folders yet. Create something new.",
    shareList: "Share list",
    addVocab: "+ Vocabulary",
    vocabsEmpty: "No vocabulary in this list yet.",
    flipCard: "Flip card",
    cardFront: "Front",
    cardBack: "Back",
    flipHint: "Tap the card to flip",
    knew: "I knew it",
    unknown: "I didn't know",
    learnDone: "All due vocabulary for today completed.",
    cancel: "Cancel",
    renameList: "Rename list",
    name: "Name",
    save: "Save",
    newList: "New list",
    create: "Create",
    listNamePlaceholder: "e.g. English Unit 3",
    editVocab: "Edit vocabulary",
    newVocab: "New vocabulary",
    front: "Front",
    back: "Back",
    frontPlaceholder: "e.g. house",
    backPlaceholder: "e.g. Haus",
    addPhoto: "Add photo",
    deletePhoto: "Delete photo",
    vocabSideRequired: "Front and back each need text or a photo.",
    photoLoadFailed: "The photo could not be loaded.",
    photoAlt: "Vocabulary photo",
    flipModeLegend: "Display while learning",
    flipFront: "Always front",
    flipBoth: "Both sides",
    add: "Add",
    delete: "Delete",
    darkMode: "Dark mode",
    showListAnswers: "Show answers in lists",
    notifications: "Notifications",
    notificationTime: "Time",
    language: "Language",
    learn: "Learn",
    edit: "Edit",
    editVocabAria: "Edit vocabulary",
    deleteVocabAria: "Delete vocabulary",
    due: "due",
    flipFrontLabel: "Always front",
    flipBothLabel: "Both sides",
    reviewNew: "New",
    reviewDue: "Due",
    reviewFrom: "From {date}",
    deleteListTitle: "Delete list?",
    deleteListMessage: "\"{name}\" and all vocabulary in it will be permanently deleted.",
    shareListTitle: "Share list",
    shareWithProgress: "With progress",
    shareWithoutProgress: "Without progress",
    shareFailed: "The list could not be shared. Please try again.",
    importInvalidJson: "Invalid JSON file.",
    importSingleList: "The data must contain exactly one list.",
    importInvalidFormat: "Unknown format. Expected a list with name and vocabs.",
    importMissingName: "List name is missing.",
    importNoVocabs: "The list contains no vocabulary.",
    importNoValidVocabs: "No valid vocabulary found.",
    defaultListName: "My vocabulary",
    vocabOne: "1 word",
    vocabMany: "{count} words",
  },
};

let currentLanguage = "de";

export function setLanguage(language) {
  currentLanguage = language === "en" ? "en" : "de";
}

export function getLanguage() {
  return currentLanguage;
}

export function t(key, params = {}) {
  const template = STRINGS[currentLanguage]?.[key] ?? STRINGS.de[key] ?? key;
  return Object.entries(params).reduce(
    (text, [param, value]) => text.replaceAll(`{${param}}`, String(value)),
    template,
  );
}

export function flipLabel(mode) {
  return mode === "front" ? t("flipFrontLabel") : t("flipBothLabel");
}

export function vocabCountLabel(count) {
  return count === 1 ? t("vocabOne") : t("vocabMany", { count });
}

export function listCountLabel(count) {
  return count === 1 ? t("listCountOne") : t("listCountMany", { count });
}

export function applyStaticTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
}
