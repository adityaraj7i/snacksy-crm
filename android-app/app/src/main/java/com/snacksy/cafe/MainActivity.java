package com.snacksy.cafe;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Dialog;
import android.app.DownloadManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.URLUtil;
import android.widget.ProgressBar;
import android.widget.FrameLayout;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://snacksycrm-nine.vercel.app/";
    private static final String APP_HOST = "snacksycrm-nine.vercel.app";
    private static final int FILE_PICKER_REQUEST = 1407;

    private WebView webView;
    private ProgressBar progress;
    private ValueCallback<Uri[]> pendingFiles;
    private final Map<WebView, Dialog> popupDialogs = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        getWindow().setStatusBarColor(getColor(R.color.snacksy_brown));
        getWindow().setNavigationBarColor(getColor(R.color.snacksy_background));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        }
        webView = findViewById(R.id.web_view);
        progress = findViewById(R.id.progress);
        applyAndroid15SystemBarInsets();
        configureWebView(webView, true);
        if (savedInstanceState == null) {
            webView.loadUrl(APP_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void applyAndroid15SystemBarInsets() {
        if (Build.VERSION.SDK_INT < 35) return;
        View root = findViewById(R.id.app_root);
        View statusBarScrim = findViewById(R.id.status_bar_scrim);
        root.setOnApplyWindowInsetsListener((view, windowInsets) -> {
            Insets safe = windowInsets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());

            FrameLayout.LayoutParams webParams = (FrameLayout.LayoutParams) webView.getLayoutParams();
            webParams.setMargins(safe.left, safe.top, safe.right, safe.bottom);
            webView.setLayoutParams(webParams);

            FrameLayout.LayoutParams progressParams = (FrameLayout.LayoutParams) progress.getLayoutParams();
            progressParams.setMargins(safe.left, safe.top, safe.right, 0);
            progress.setLayoutParams(progressParams);

            FrameLayout.LayoutParams scrimParams = (FrameLayout.LayoutParams) statusBarScrim.getLayoutParams();
            scrimParams.height = safe.top;
            statusBarScrim.setLayoutParams(scrimParams);
            return windowInsets;
        });
        root.requestApplyInsets();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView(WebView target, boolean mainWindow) {
        target.setBackgroundColor(Color.rgb(246, 242, 237));
        WebSettings settings = target.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setUserAgentString(settings.getUserAgentString() + " SnacksyCafeAndroid/1.0.1");

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(target, false);
        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0);
        target.addJavascriptInterface(new SnacksyBridge(target), "SnacksyAndroid");
        target.setWebViewClient(new AppWebViewClient(mainWindow));
        target.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) ->
                handleDownload(target, url, contentDisposition, mimeType));
        target.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (!mainWindow) return;
                progress.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
                progress.setProgress(newProgress);
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (pendingFiles != null) pendingFiles.onReceiveValue(null);
                pendingFiles = callback;
                try {
                    Intent intent = params.createIntent();
                    intent.setType("image/*");
                    startActivityForResult(intent, FILE_PICKER_REQUEST);
                } catch (Exception error) {
                    pendingFiles = null;
                    Toast.makeText(MainActivity.this, "Photo picker is unavailable.", Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                Dialog dialog = new Dialog(MainActivity.this, android.R.style.Theme_Material_Light_NoActionBar);
                WebView popup = new WebView(MainActivity.this);
                configureWebView(popup, false);
                dialog.setContentView(popup, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                popupDialogs.put(popup, dialog);
                dialog.setOnDismissListener(ignored -> {
                    popupDialogs.remove(popup);
                    popup.destroy();
                });
                dialog.show();
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popup);
                resultMsg.sendToTarget();
                return true;
            }

            @Override
            public void onCloseWindow(WebView window) {
                Dialog dialog = popupDialogs.remove(window);
                if (dialog != null) dialog.dismiss();
            }
        });
    }

    private final class AppWebViewClient extends WebViewClient {
        private final boolean mainWindow;

        private AppWebViewClient(boolean mainWindow) {
            this.mainWindow = mainWindow;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String scheme = uri.getScheme();
            if ("about".equals(scheme) || ("https".equals(scheme) && APP_HOST.equalsIgnoreCase(uri.getHost()))) {
                return false;
            }
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (Exception error) {
                Toast.makeText(MainActivity.this, "No app can open this link.", Toast.LENGTH_SHORT).show();
            }
            return true;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (mainWindow && request.isForMainFrame()) showOfflinePage(view);
        }
    }

    private void showOfflinePage(WebView view) {
        String html = "<!doctype html><html><meta name='viewport' content='width=device-width,initial-scale=1'>" +
                "<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f2ed;color:#302925;font-family:Arial;text-align:center;padding:28px;box-sizing:border-box}" +
                ".card{background:#fffdfa;border:1px solid #e4ddd7;border-radius:18px;padding:34px 24px;max-width:340px;box-shadow:0 16px 40px #66544c18}h1{font-size:26px;margin:0 0 10px}p{color:#817670;line-height:1.5}button{border:0;border-radius:10px;background:#66544c;color:white;padding:13px 22px;font-weight:bold}</style>" +
                "<body><div class='card'><h1>SNACKSY</h1><p>Internet connection nahi mil raha hai. Wi-Fi ya mobile data check karke dobara try karein.</p><button onclick=\"location.href='" + APP_URL + "'\">Retry</button></div></body></html>";
        view.loadDataWithBaseURL(APP_URL, html, "text/html", "UTF-8", null);
    }

    private void handleDownload(WebView source, String url, String contentDisposition, String mimeType) {
        String filename = URLUtil.guessFileName(url, contentDisposition, mimeType);
        if (url.startsWith("blob:")) {
            String script = "(async()=>{try{const r=await fetch(" + JSONObject.quote(url) + ");const b=await r.blob();const reader=new FileReader();reader.onload=()=>SnacksyAndroid.saveBase64(reader.result," + JSONObject.quote(filename) + "," + JSONObject.quote(mimeType) + ");reader.readAsDataURL(b)}catch(e){}})()";
            source.evaluateJavascript(script, null);
            return;
        }
        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setMimeType(mimeType);
            request.addRequestHeader("User-Agent", source.getSettings().getUserAgentString());
            request.setTitle(filename);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);
            ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(request);
            Toast.makeText(this, "Download started.", Toast.LENGTH_SHORT).show();
        } catch (Exception error) {
            Toast.makeText(this, "Could not download this file.", Toast.LENGTH_SHORT).show();
        }
    }

    private final class SnacksyBridge {
        private final WebView source;

        private SnacksyBridge(WebView source) {
            this.source = source;
        }

        @JavascriptInterface
        public void printPage() {
            runOnUiThread(() -> {
                PrintManager manager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                PrintDocumentAdapter adapter = source.createPrintDocumentAdapter("Snacksy receipt");
                manager.print("Snacksy receipt", adapter, null);
            });
        }

        @JavascriptInterface
        public void saveBase64(String dataUrl, String suggestedName, String mimeType) {
            new Thread(() -> {
                try {
                    int comma = dataUrl.indexOf(',');
                    byte[] data = Base64.decode(comma >= 0 ? dataUrl.substring(comma + 1) : dataUrl, Base64.DEFAULT);
                    String filename = sanitizeFilename(suggestedName, mimeType);
                    saveDownload(data, filename, mimeType);
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, filename + " saved to Downloads.", Toast.LENGTH_LONG).show());
                } catch (Exception error) {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Could not save this report.", Toast.LENGTH_SHORT).show());
                }
            }).start();
        }
    }

    private String sanitizeFilename(String name, String mimeType) {
        String safe = name == null ? "snacksy-report" : name.replaceAll("[^a-zA-Z0-9._-]", "-");
        if (!safe.contains(".")) {
            String extension = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType);
            safe += "." + (extension == null ? "csv" : extension);
        }
        return safe;
    }

    private void saveDownload(byte[] data, String filename, String mimeType) throws Exception {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
            values.put(MediaStore.Downloads.MIME_TYPE, mimeType == null || mimeType.isEmpty() ? "text/csv" : mimeType);
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Snacksy");
            Uri destination = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (destination == null) throw new IllegalStateException("Download destination unavailable");
            try (OutputStream output = getContentResolver().openOutputStream(destination)) {
                if (output == null) throw new IllegalStateException("Could not open download");
                output.write(data);
            }
        } else {
            File directory = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "Snacksy");
            if (!directory.exists() && !directory.mkdirs()) throw new IllegalStateException("Could not create download directory");
            try (OutputStream output = new FileOutputStream(new File(directory, filename))) {
                output.write(data);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_PICKER_REQUEST || pendingFiles == null) return;
        Uri[] result = resultCode == RESULT_OK ? WebChromeClient.FileChooserParams.parseResult(resultCode, data) : null;
        pendingFiles.onReceiveValue(result);
        pendingFiles = null;
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onDestroy() {
        if (pendingFiles != null) pendingFiles.onReceiveValue(null);
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
