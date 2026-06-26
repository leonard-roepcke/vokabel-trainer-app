import { Capacitor, registerPlugin } from "@capacitor/core";

const ImportFile = registerPlugin("ImportFile");

export function setupImportFileListener(onImportText) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  ImportFile.addListener("importFile", (event) => {
    if (event.text) {
      onImportText(event.text);
    }
  });

  ImportFile.consumePendingImport().then(({ text }) => {
    if (text) {
      onImportText(text);
    }
  });
}
