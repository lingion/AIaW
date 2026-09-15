package app.aiaw;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LocalFsPlugin.class);
        // Set this before Capacitor creates the WebView; its edge-to-edge
        // initialization otherwise overwrites the manifest/runtime mode.
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        super.onCreate(savedInstanceState);
        // Always enable WebView remote debugging so the v2.0.8.12 release
        // APK is verifiable on-device (real device + ADB forward
        // tcp:9222 localabstract:webview_devtools_remote_<pid>). Capacitor
        // defaults this to BuildConfig.DEBUG; we explicitly want it on
        // for release too so the runtime crashes and stream rendering can
        // be inspected. Harmless for end users — only a dev tool exposed
        // over ADB/USB.
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
