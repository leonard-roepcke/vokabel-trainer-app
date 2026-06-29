import { Capacitor, registerPlugin } from "@capacitor/core";

const Widget = registerPlugin("Widget");

export async function updateWidgetData({ dueCount, streak, allComplete, language }) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Widget.updateWidgetData({
      dueCount,
      streak,
      allComplete,
      language,
    });
  } catch {
    /* ignore on unsupported platforms */
  }
}

export async function updateNotificationSchedule({
  enabled,
  hour,
  dueCount,
  streak,
  language,
}) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Widget.updateNotificationSchedule({
      enabled,
      hour,
      dueCount,
      streak,
      language,
    });
  } catch {
    /* ignore on unsupported platforms */
  }
}
