package de.vokabeltrainer.app;

import android.content.Context;
import android.content.SharedPreferences;

public final class WidgetDataStore {
    private static final String PREFS = "VocabWidgetData";
    private static final String KEY_DUE_COUNT = "dueCount";
    private static final String KEY_STREAK = "streak";
    private static final String KEY_ALL_COMPLETE = "allComplete";
    private static final String KEY_NOTIFICATION_HOUR = "notificationHour";
    private static final String KEY_NOTIFICATIONS_ENABLED = "notificationsEnabled";
    private static final String KEY_LANGUAGE = "language";

    private WidgetDataStore() {}

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static void saveWidgetData(
            Context context,
            int dueCount,
            int streak,
            boolean allComplete,
            String language) {
        prefs(context)
                .edit()
                .putInt(KEY_DUE_COUNT, dueCount)
                .putInt(KEY_STREAK, streak)
                .putBoolean(KEY_ALL_COMPLETE, allComplete)
                .putString(KEY_LANGUAGE, language != null ? language : "de")
                .apply();
    }

    public static void saveNotificationSettings(Context context, boolean enabled, int hour) {
        prefs(context)
                .edit()
                .putBoolean(KEY_NOTIFICATIONS_ENABLED, enabled)
                .putInt(KEY_NOTIFICATION_HOUR, hour)
                .apply();
    }

    public static int getDueCount(Context context) {
        return prefs(context).getInt(KEY_DUE_COUNT, 0);
    }

    public static int getStreak(Context context) {
        return prefs(context).getInt(KEY_STREAK, 0);
    }

    public static boolean isAllComplete(Context context) {
        return prefs(context).getBoolean(KEY_ALL_COMPLETE, false);
    }

    public static boolean areNotificationsEnabled(Context context) {
        return prefs(context).getBoolean(KEY_NOTIFICATIONS_ENABLED, false);
    }

    public static int getNotificationHour(Context context) {
        return prefs(context).getInt(KEY_NOTIFICATION_HOUR, 9);
    }

    public static String getLanguage(Context context) {
        return prefs(context).getString(KEY_LANGUAGE, "de");
    }
}
