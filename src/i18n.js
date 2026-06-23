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
    listsEmpty: "Noch keine Listen. Lege eine neue an.",
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
    importListTitle: "Liste importieren",
    pasteListData: "Listendaten einfügen",
    cancel: "Abbrechen",
    import: "Importieren",
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
    flipModeLegend: "Anzeige beim Lernen",
    flipFront: "Immer vorne",
    flipBoth: "Beidseitig",
    add: "Hinzufügen",
    delete: "Löschen",
    darkMode: "Dunkelmodus",
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
    shareProgressTitle: "Lernfortschritt teilen?",
    shareProgressMessage: "Soll der Lernfortschritt mit in die geteilten Listendaten?",
    shareWithProgress: "Mit Lernfortschritt",
    shareWithoutProgress: "Ohne Lernfortschritt",
    shareCopied: "Die Listendaten wurden in die Zwischenablage kopiert.",
    shareFailed: "Die Listendaten konnten nicht geteilt werden. Bitte versuche es erneut.",
    importInvalidJson: "Ungültiges JSON. Bitte das komplette Listendaten-Format einfügen.",
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
    listsEmpty: "No lists yet. Create a new one.",
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
    importListTitle: "Import list",
    pasteListData: "Paste list data",
    cancel: "Cancel",
    import: "Import",
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
    flipModeLegend: "Display while learning",
    flipFront: "Always front",
    flipBoth: "Both sides",
    add: "Add",
    delete: "Delete",
    darkMode: "Dark mode",
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
    shareProgressTitle: "Share learning progress?",
    shareProgressMessage: "Should learning progress be included in the shared list data?",
    shareWithProgress: "With progress",
    shareWithoutProgress: "Without progress",
    shareCopied: "List data was copied to the clipboard.",
    shareFailed: "List data could not be shared. Please try again.",
    importInvalidJson: "Invalid JSON. Please paste the complete list data format.",
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
