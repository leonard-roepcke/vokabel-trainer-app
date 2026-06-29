package de.vokabeltrainer.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class VocabWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, manager, appWidgetId);
        }
    }

    static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, VocabWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(component);
        for (int id : ids) {
            updateWidget(context, manager, id);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        int dueCount = WidgetDataStore.getDueCount(context);
        int streak = WidgetDataStore.getStreak(context);
        boolean allComplete = WidgetDataStore.isAllComplete(context);
        String language = WidgetDataStore.getLanguage(context);
        boolean isGerman = !"en".equals(language);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_vocab);

        if (allComplete || dueCount == 0) {
            views.setTextViewText(
                    R.id.widget_main_text,
                    isGerman ? "🔥 " + streak + " Tage" : "🔥 " + streak + " days");
            views.setTextViewText(
                    R.id.widget_sub_text,
                    isGerman ? "Alles erledigt!" : "All done!");
        } else {
            views.setTextViewText(
                    R.id.widget_main_text,
                    String.valueOf(dueCount));
            views.setTextViewText(
                    R.id.widget_sub_text,
                    isGerman ? (dueCount == 1 ? "Vokabel fällig" : "Vokabeln fällig") : (dueCount == 1 ? "word due" : "words due"));
        }

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent =
                PendingIntent.getActivity(
                        context,
                        0,
                        launchIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        manager.updateAppWidget(appWidgetId, views);
    }
}
