package de.vokabeltrainer.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Widget")
public class WidgetPlugin extends Plugin {
    private static final int NOTIFICATION_PERMISSION_CODE = 3001;

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        try {
            int dueCount = call.getInt("dueCount", 0);
            int streak = call.getInt("streak", 0);
            boolean allComplete = call.getBoolean("allComplete", false);
            String language = call.getString("language", "de");

            WidgetDataStore.saveWidgetData(getContext(), dueCount, streak, allComplete, language);
            VocabWidgetProvider.updateAllWidgets(getContext());
            call.resolve();
        } catch (Exception e) {
            call.reject("Widget update failed", e);
        }
    }

    @PluginMethod
    public void updateNotificationSchedule(PluginCall call) {
        try {
            boolean enabled = call.getBoolean("enabled", false);
            int hour = call.getInt("hour", 9);
            int dueCount = call.getInt("dueCount", 0);
            String language = call.getString("language", "de");

            if (enabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                requestNotificationPermissionIfNeeded();
            }

            WidgetDataStore.saveNotificationSettings(getContext(), enabled, hour);
            WidgetDataStore.saveWidgetData(
                    getContext(),
                    dueCount,
                    call.getInt("streak", 0),
                    dueCount == 0,
                    language);
            NotificationScheduler.reschedule(getContext());
            call.resolve(new JSObject());
        } catch (Exception e) {
            call.reject("Notification schedule failed", e);
        }
    }

    private void requestNotificationPermissionIfNeeded() {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED) {
            return;
        }

        getBridge()
                .executeOnMainThread(
                        () -> {
                            if (getActivity() == null) {
                                return;
                            }
                            ActivityCompat.requestPermissions(
                                    getActivity(),
                                    new String[] {Manifest.permission.POST_NOTIFICATIONS},
                                    NOTIFICATION_PERMISSION_CODE);
                        });
    }
}
