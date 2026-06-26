package de.vokabeltrainer.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ImportFile")
public class ImportFilePlugin extends Plugin {
    private static String pendingJson = null;
    private static ImportFilePlugin instance = null;

    @Override
    public void load() {
        instance = this;
        super.load();
    }

    public static void setPendingJson(String json) {
        pendingJson = json;
        if (instance != null && json != null && !json.isBlank()) {
            JSObject data = new JSObject();
            data.put("text", json);
            instance.notifyListeners("importFile", data);
        }
    }

    @PluginMethod
    public void consumePendingImport(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("text", pendingJson != null ? pendingJson : "");
        pendingJson = null;
        call.resolve(ret);
    }
}
