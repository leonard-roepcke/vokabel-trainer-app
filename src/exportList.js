import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const EXPORT_DIR = "Vokabeltrainer";

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 2000);
}

async function writeNativeJsonFile(fileName, jsonText) {
  await Filesystem.mkdir({
    path: EXPORT_DIR,
    directory: Directory.Documents,
    recursive: true,
  }).catch(() => {});

  const path = `${EXPORT_DIR}/${fileName}`;
  await Filesystem.writeFile({
    path,
    data: jsonText,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });

  return Filesystem.getUri({
    path,
    directory: Directory.Documents,
  });
}

export async function shareListJsonFile({ fileName, jsonText, title, t }) {
  if (Capacitor.isNativePlatform()) {
    try {
      const { uri } = await writeNativeJsonFile(fileName, jsonText);

      try {
        await Share.share({
          title,
          url: uri,
          dialogTitle: t("shareList"),
        });
      } catch (error) {
        const message = String(error?.message ?? "");
        if (!message.toLowerCase().includes("cancel")) {
          throw error;
        }
      }

      return;
    } catch {
      window.alert(t("shareFailed"));
      return;
    }
  }

  const blob = new Blob([jsonText], { type: "application/json" });
  downloadBlob(blob, fileName);
}
