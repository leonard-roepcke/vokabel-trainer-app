package de.vokabeltrainer.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.NotificationCompat;

public class NotificationReceiver extends BroadcastReceiver {
    private static final String CHANNEL_ID = "vocab_reminder";
    private static final int NOTIFICATION_ID = 1001;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!WidgetDataStore.areNotificationsEnabled(context)) {
            return;
        }

        int dueCount = WidgetDataStore.getDueCount(context);
        if (dueCount <= 0) {
            return;
        }

        String language = WidgetDataStore.getLanguage(context);
        boolean isGerman = !"en".equals(language);

        String title = isGerman ? "Vokabeltrainer" : "Vocabulary Trainer";
        String body =
                isGerman
                        ? (dueCount == 1
                                ? "1 Vokabel wartet auf dich!"
                                : dueCount + " Vokabeln warten auf dich!")
                        : (dueCount == 1
                                ? "1 word is waiting for you!"
                                : dueCount + " words are waiting for you!");

        NotificationManager manager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        NotificationChannel channel =
                new NotificationChannel(CHANNEL_ID, title, NotificationManager.IMPORTANCE_DEFAULT);
        manager.createNotificationChannel(channel);

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent =
                PendingIntent.getActivity(
                        context,
                        0,
                        launchIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(context, CHANNEL_ID)
                        .setSmallIcon(R.mipmap.ic_launcher)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setContentIntent(pendingIntent)
                        .setAutoCancel(true)
                        .setPriority(NotificationCompat.PRIORITY_DEFAULT);

        manager.notify(NOTIFICATION_ID, builder.build());

        NotificationScheduler.scheduleNext(context);
    }
}
