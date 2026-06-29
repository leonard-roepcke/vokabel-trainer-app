package de.vokabeltrainer.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ImportFilePlugin.class);
        registerPlugin(WidgetPlugin.class);
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) {
            return;
        }

        String action = intent.getAction();
        if (!Intent.ACTION_VIEW.equals(action) && !Intent.ACTION_SEND.equals(action)) {
            return;
        }

        if (Intent.ACTION_SEND.equals(action) && "text/plain".equals(intent.getType())) {
            String text = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (text != null && text.trim().startsWith("{")) {
                ImportFilePlugin.setPendingJson(text.trim());
            }
            return;
        }

        Uri uri = intent.getData();
        if (Intent.ACTION_SEND.equals(action)) {
            uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        }

        if (uri == null) {
            return;
        }

        try {
            String text = readTextFromUri(uri);
            if (text != null && !text.isBlank()) {
                ImportFilePlugin.setPendingJson(text);
            }
        } catch (Exception ignored) {
            /* ignore invalid files */
        }
    }

    private String readTextFromUri(Uri uri) throws Exception {
        InputStream stream;
        if ("file".equals(uri.getScheme())) {
            stream = new FileInputStream(uri.getPath());
        } else {
            stream = getContentResolver().openInputStream(uri);
        }

        if (stream == null) {
            return null;
        }

        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader =
                new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line).append('\n');
            }
        }
        return builder.toString().trim();
    }
}
