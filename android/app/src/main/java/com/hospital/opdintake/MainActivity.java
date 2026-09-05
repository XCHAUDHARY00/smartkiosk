package com.hospital.opdintake;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Base64;
import android.util.Log;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.view.animation.LinearInterpolator;
import android.view.animation.ScaleAnimation;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.splashscreen.SplashScreenViewProvider;
import android.view.animation.AccelerateDecelerateInterpolator;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private SplashScreen splashScreen;
    private WebView webView;
    private LinearLayout splashLoadingView;
    private ImageView splashLogo;
    private ProgressBar splashProgress;
    private TextView splashStatus;
    private LinearLayout splashErrorView;
    private TextView splashErrorText;
    private Button btnSplashRetry;
    private volatile boolean isAppLoaded = false;

    // Native Android Text-to-Speech & Speech Recognition
    private TextToSpeech textToSpeech;
    private volatile boolean isTtsInitialized = false;
    private SpeechRecognizer speechRecognizer;

    private ValueCallback<Uri[]> mFilePathCallback;
    private String mCameraPhotoPath;
    private static final int INPUT_FILE_REQUEST_CODE = 1001;
    private static final int PERMISSION_REQUEST_CODE = 101;

    // Public web app URL (Zero login required, directly loads Role Selection screen)
    private static final String APP_URL = "https://ais-pre-mcpyzqfd3p43addzv7u2gn-152867556518.asia-southeast1.run.app";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Initialize Android core-splashscreen API BEFORE super.onCreate()
        splashScreen = SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Keep native splash screen active until the web application signals it is fully ready
        splashScreen.setKeepOnScreenCondition(new SplashScreen.KeepOnScreenCondition() {
            @Override
            public boolean shouldKeepOnScreen() {
                return !isAppLoaded;
            }
        });

        // Set smooth exit animation on splash screen to seamlessly reveal the WebView
        splashScreen.setOnExitAnimationListener(new SplashScreen.OnExitAnimationListener() {
            @Override
            public void onSplashScreenExit(@NonNull final SplashScreenViewProvider splashScreenViewProvider) {
                final View splashView = splashScreenViewProvider.getView();
                final View iconView = splashScreenViewProvider.getIconView();

                if (iconView != null) {
                    iconView.animate()
                            .scaleX(1.12f)
                            .scaleY(1.12f)
                            .alpha(0.0f)
                            .setDuration(320)
                            .setInterpolator(new AccelerateDecelerateInterpolator())
                            .start();
                }

                splashView.animate()
                        .alpha(0.0f)
                        .setDuration(380)
                        .setInterpolator(new AccelerateDecelerateInterpolator())
                        .withEndAction(new Runnable() {
                            @Override
                            public void run() {
                                splashScreenViewProvider.remove();
                            }
                        })
                        .start();
            }
        });

        checkAndRequestPermissions();

        // Bind volume keys to media/music stream for clear voice & audio guidance
        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        // Initialize Native Android Text-to-Speech Engine
        initNativeTextToSpeech();

        // Bind Native Splash & Loading Screen Views
        splashLoadingView = findViewById(R.id.splash_loading_view);
        splashLogo = findViewById(R.id.splash_logo);
        splashProgress = findViewById(R.id.splash_progress);
        splashStatus = findViewById(R.id.splash_status);
        splashErrorView = findViewById(R.id.splash_error_view);
        splashErrorText = findViewById(R.id.splash_error_text);
        btnSplashRetry = findViewById(R.id.btn_splash_retry);

        // Start subtle breathing pulse on Hospital Logo
        if (splashLogo != null) {
            ScaleAnimation pulse = new ScaleAnimation(
                    0.96f, 1.04f, 0.96f, 1.04f,
                    Animation.RELATIVE_TO_SELF, 0.5f,
                    Animation.RELATIVE_TO_SELF, 0.5f
            );
            pulse.setDuration(1200);
            pulse.setRepeatCount(Animation.INFINITE);
            pulse.setRepeatMode(Animation.REVERSE);
            pulse.setInterpolator(new LinearInterpolator());
            splashLogo.startAnimation(pulse);
        }

        if (btnSplashRetry != null) {
            btnSplashRetry.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (splashErrorView != null) splashErrorView.setVisibility(View.GONE);
                    if (splashProgress != null) splashProgress.setVisibility(View.VISIBLE);
                    if (splashStatus != null) splashStatus.setText("Reconnecting to OPD services...");
                    if (webView != null) webView.loadUrl(APP_URL);
                }
            });
        }

        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setLoadsImagesAutomatically(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Add Native JavaScript Bridge for sharing, downloading, and haptic feedback
        webView.addJavascriptInterface(new WebAppInterface(this), "AndroidApp");

        // Handle file downloads
        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                if (url.startsWith("data:") || url.startsWith("blob:")) {
                    Toast.makeText(MainActivity.this, "Downloading OPD Token Slip...", Toast.LENGTH_SHORT).show();
                } else {
                    Intent i = new Intent(Intent.ACTION_VIEW);
                    i.setData(Uri.parse(url));
                    startActivity(i);
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                if (!isAppLoaded && splashStatus != null) {
                    splashStatus.setText("Loading OPD Consultation Interface...");
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                String pageTitle = view.getTitle();

                // If container is still in cold start / showing Google AI Studio startup screen:
                // NEVER display it to user! Keep showing native hospital splash and reload silently.
                if (pageTitle != null && (
                        pageTitle.contains("Please wait") ||
                        pageTitle.contains("AI Studio") ||
                        pageTitle.contains("Cloud Run") ||
                        pageTitle.contains("503") ||
                        pageTitle.contains("Starting") ||
                        pageTitle.contains("Google")
                )) {
                    if (splashStatus != null) {
                        splashStatus.setText("Hospital Cloud Server Initializing... Almost ready");
                    }
                    view.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            if (!isAppLoaded && webView != null) {
                                webView.reload();
                            }
                        }
                    }, 2000);
                    return;
                }

                // If real OPD web app is ready, check DOM root readiness
                view.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        if (!isAppLoaded) {
                            view.evaluateJavascript(
                                    "(function() { return (document.getElementById('root') && document.getElementById('root').children.length > 0) ? 'READY' : 'PENDING'; })();",
                                    new ValueCallback<String>() {
                                        @Override
                                        public void onReceiveValue(String value) {
                                            if (value != null && value.contains("READY")) {
                                                setAppReady();
                                            }
                                        }
                                    }
                            );
                        }
                    }
                }, 400);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request != null && request.isForMainFrame()) {
                    showNetworkError("Could not reach hospital server. Please check internet connection.");
                }
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                showNetworkError(description);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            // Camera & Audio permission grant in WebView
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                MainActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }

            // Native File & Camera Chooser for Prescription upload
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mFilePathCallback != null) {
                    mFilePathCallback.onReceiveValue(null);
                }
                mFilePathCallback = filePathCallback;

                Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                File photoFile = null;
                try {
                    photoFile = createImageFile();
                    takePictureIntent.putExtra("PhotoPath", mCameraPhotoPath);
                } catch (IOException ex) {
                    // Error occurred while creating the File
                }

                if (photoFile != null) {
                    mCameraPhotoPath = "file:" + photoFile.getAbsolutePath();
                    Uri photoURI = FileProvider.getUriForFile(MainActivity.this,
                            getApplicationContext().getPackageName() + ".fileprovider",
                            photoFile);
                    takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
                    takePictureIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                } else {
                    takePictureIntent = null;
                }

                Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
                contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
                contentSelectionIntent.setType("image/*");

                Intent[] intentArray;
                if (takePictureIntent != null) {
                    intentArray = new Intent[]{takePictureIntent};
                } else {
                    intentArray = new Intent[0];
                }

                Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                chooserIntent.putExtra(Intent.EXTRA_TITLE, "Take Photo or Select Prescription");
                chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);

                startActivityForResult(chooserIntent, INPUT_FILE_REQUEST_CODE);
                return true;
            }
        });

        // Load the web app
        webView.loadUrl(APP_URL);
    }

    public void setAppReady() {
        if (isAppLoaded) return;
        isAppLoaded = true;
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (splashLoadingView != null && splashLoadingView.getVisibility() == View.VISIBLE) {
                    AlphaAnimation fadeOut = new AlphaAnimation(1.0f, 0.0f);
                    fadeOut.setDuration(350);
                    fadeOut.setAnimationListener(new Animation.AnimationListener() {
                        @Override
                        public void onAnimationStart(Animation animation) {}

                        @Override
                        public void onAnimationEnd(Animation animation) {
                            splashLoadingView.setVisibility(View.GONE);
                            if (splashLogo != null) {
                                splashLogo.clearAnimation();
                            }
                        }

                        @Override
                        public void onAnimationRepeat(Animation animation) {}
                    });
                    splashLoadingView.startAnimation(fadeOut);
                }
            }
        });
    }

    public void hideSplashScreen() {
        setAppReady();
    }

    private void showNetworkError(final String description) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                // Ensure splashScreen completes exit so error view is visible
                isAppLoaded = true;
                if (splashLoadingView != null) splashLoadingView.setVisibility(View.VISIBLE);
                if (splashProgress != null) splashProgress.setVisibility(View.GONE);
                if (splashErrorView != null) splashErrorView.setVisibility(View.VISIBLE);
                if (splashStatus != null) splashStatus.setText("Connection Interrupted");
                if (splashErrorText != null && description != null && !description.isEmpty()) {
                    splashErrorText.setText(description);
                }
            }
        });
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File image = File.createTempFile(imageFileName, ".jpg", storageDir);
        mCameraPhotoPath = image.getAbsolutePath();
        return image;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != INPUT_FILE_REQUEST_CODE || mFilePathCallback == null) {
            super.onActivityResult(requestCode, resultCode, data);
            return;
        }

        Uri[] results = null;
        if (resultCode == Activity.RESULT_OK) {
            if (data == null || data.getData() == null) {
                // Photo from camera
                if (mCameraPhotoPath != null) {
                    results = new Uri[]{Uri.parse(mCameraPhotoPath)};
                }
            } else {
                String dataString = data.getDataString();
                ClipData clipData = data.getClipData();
                if (clipData != null) {
                    results = new Uri[clipData.getItemCount()];
                    for (int i = 0; i < clipData.getItemCount(); i++) {
                        results[i] = clipData.getItemAt(i).getUri();
                    }
                } else if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
        }

        mFilePathCallback.onReceiveValue(results);
        mFilePathCallback = null;
    }

    private void checkAndRequestPermissions() {
        String[] permissions = {
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.MODIFY_AUDIO_SETTINGS
        };

        boolean allGranted = true;
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }

        if (!allGranted) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private void initNativeTextToSpeech() {
        try {
            textToSpeech = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
                @Override
                public void onInit(int status) {
                    if (status == TextToSpeech.SUCCESS) {
                        isTtsInitialized = true;
                        Locale hindi = new Locale("hi", "IN");
                        int result = textToSpeech.isLanguageAvailable(hindi);
                        if (result >= TextToSpeech.LANG_AVAILABLE) {
                            textToSpeech.setLanguage(hindi);
                        } else {
                            textToSpeech.setLanguage(Locale.getDefault());
                        }

                        textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                            @Override
                            public void onStart(final String utteranceId) {
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (webView != null) {
                                            webView.evaluateJavascript("window.onAndroidTtsStart && window.onAndroidTtsStart('" + utteranceId + "');", null);
                                        }
                                    }
                                });
                            }

                            @Override
                            public void onDone(final String utteranceId) {
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (webView != null) {
                                            webView.evaluateJavascript("window.onAndroidTtsDone && window.onAndroidTtsDone('" + utteranceId + "');", null);
                                        }
                                    }
                                });
                            }

                            @Override
                            public void onError(final String utteranceId) {
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (webView != null) {
                                            webView.evaluateJavascript("window.onAndroidTtsError && window.onAndroidTtsError('" + utteranceId + "');", null);
                                        }
                                    }
                                });
                            }
                        });
                        Log.i("MainActivity", "Native Android TextToSpeech initialized successfully");
                    } else {
                        Log.e("MainActivity", "Native Android TextToSpeech init failed with status: " + status);
                    }
                }
            });
        } catch (Exception e) {
            Log.e("MainActivity", "Error initializing TextToSpeech", e);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (textToSpeech != null) {
            try {
                textToSpeech.stop();
            } catch (Exception e) {}
        }
        if (speechRecognizer != null) {
            try {
                speechRecognizer.stopListening();
            } catch (Exception e) {}
        }
    }

    @Override
    protected void onDestroy() {
        if (textToSpeech != null) {
            try {
                textToSpeech.stop();
                textToSpeech.shutdown();
            } catch (Exception e) {}
            textToSpeech = null;
        }
        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception e) {}
            speechRecognizer = null;
        }
        super.onDestroy();
    }

    // JavaScript Interface for Web to Native Android Calls
    public class WebAppInterface {
        Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void notifyAppReady() {
            hideSplashScreen();
        }

        @JavascriptInterface
        public boolean isAndroidApp() {
            return true;
        }

        @JavascriptInterface
        public void speak(final String text, final String langCode, final float pitch, final float rate) {
            if (text == null || text.trim().isEmpty()) return;
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (textToSpeech == null || !isTtsInitialized) {
                        initNativeTextToSpeech();
                    }
                    if (textToSpeech != null) {
                        try {
                            Locale targetLocale;
                            String l = (langCode != null ? langCode.toLowerCase().replace("_", "-") : "hi-in");
                            if (l.startsWith("hi") || l.startsWith("bho")) {
                                targetLocale = new Locale("hi", "IN");
                            } else if (l.startsWith("pa")) {
                                targetLocale = new Locale("pa", "IN");
                            } else if (l.startsWith("en")) {
                                targetLocale = new Locale("en", "IN");
                            } else if (l.startsWith("mr")) {
                                targetLocale = new Locale("mr", "IN");
                            } else if (l.startsWith("bn")) {
                                targetLocale = new Locale("bn", "IN");
                            } else if (l.startsWith("gu")) {
                                targetLocale = new Locale("gu", "IN");
                            } else if (l.startsWith("ta")) {
                                targetLocale = new Locale("ta", "IN");
                            } else if (l.startsWith("te")) {
                                targetLocale = new Locale("te", "IN");
                            } else if (l.startsWith("kn")) {
                                targetLocale = new Locale("kn", "IN");
                            } else if (l.startsWith("ml")) {
                                targetLocale = new Locale("ml", "IN");
                            } else if (l.startsWith("ur")) {
                                targetLocale = new Locale("ur", "IN");
                            } else {
                                targetLocale = new Locale("hi", "IN");
                            }

                            int avail = textToSpeech.isLanguageAvailable(targetLocale);
                            if (avail >= TextToSpeech.LANG_AVAILABLE) {
                                textToSpeech.setLanguage(targetLocale);
                            } else {
                                textToSpeech.setLanguage(new Locale("hi", "IN"));
                            }

                            textToSpeech.setPitch(pitch > 0 ? pitch : 1.0f);
                            textToSpeech.setSpeechRate(rate > 0 ? rate : 0.92f);

                            Bundle params = new Bundle();
                            params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f);
                            params.putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_MUSIC);

                            String utteranceId = "opd_tts_" + System.currentTimeMillis();
                            textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId);
                        } catch (Exception e) {
                            Log.e("MainActivity", "Error during native TTS speak", e);
                        }
                    }
                }
            });
        }

        @JavascriptInterface
        public void stopSpeech() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (textToSpeech != null) {
                        try {
                            textToSpeech.stop();
                        } catch (Exception e) {}
                    }
                }
            });
        }

        @JavascriptInterface
        public boolean isTtsReady() {
            return isTtsInitialized;
        }

        @JavascriptInterface
        public void startSpeechRecognition(final String langCode) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (!SpeechRecognizer.isRecognitionAvailable(MainActivity.this)) {
                        if (webView != null) {
                            webView.evaluateJavascript("window.onAndroidSpeechError && window.onAndroidSpeechError('Speech recognition not supported on this device');", null);
                        }
                        return;
                    }

                    if (speechRecognizer != null) {
                        try {
                            speechRecognizer.destroy();
                        } catch (Exception e) {}
                    }

                    try {
                        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(MainActivity.this);
                        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);

                        String l = (langCode != null ? langCode.replace("_", "-") : "hi-IN");
                        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, l);
                        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);

                        speechRecognizer.setRecognitionListener(new RecognitionListener() {
                            @Override
                            public void onReadyForSpeech(Bundle params) {}

                            @Override
                            public void onBeginningOfSpeech() {}

                            @Override
                            public void onRmsChanged(float rmsdB) {}

                            @Override
                            public void onBufferReceived(byte[] buffer) {}

                            @Override
                            public void onEndOfSpeech() {
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (webView != null) {
                                            webView.evaluateJavascript("window.onAndroidSpeechEnd && window.onAndroidSpeechEnd();", null);
                                        }
                                    }
                                });
                            }

                            @Override
                            public void onError(final int error) {
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        String errStr = "Speech error (" + error + ")";
                                        if (error == SpeechRecognizer.ERROR_NO_MATCH) {
                                            errStr = "no-match";
                                        } else if (error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) {
                                            errStr = "timeout";
                                        }
                                        if (webView != null) {
                                            webView.evaluateJavascript("window.onAndroidSpeechError && window.onAndroidSpeechError('" + errStr + "');", null);
                                        }
                                    }
                                });
                            }

                            @Override
                            public void onResults(Bundle results) {
                                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                                if (matches != null && !matches.isEmpty()) {
                                    final String text = matches.get(0).replace("'", "\\'").replace("\"", "\\\"");
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            if (webView != null) {
                                                webView.evaluateJavascript("window.onAndroidSpeechResult && window.onAndroidSpeechResult('" + text + "', true);", null);
                                            }
                                        }
                                    });
                                }
                            }

                            @Override
                            public void onPartialResults(Bundle partialResults) {
                                ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                                if (matches != null && !matches.isEmpty()) {
                                    final String text = matches.get(0).replace("'", "\\'").replace("\"", "\\\"");
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            if (webView != null) {
                                                webView.evaluateJavascript("window.onAndroidSpeechResult && window.onAndroidSpeechResult('" + text + "', false);", null);
                                            }
                                        }
                                    });
                                }
                            }

                            @Override
                            public void onEvent(int eventType, Bundle params) {}
                        });

                        speechRecognizer.startListening(intent);
                    } catch (Exception ex) {
                        Log.e("MainActivity", "Error starting speech recognition", ex);
                    }
                }
            });
        }

        @JavascriptInterface
        public void stopSpeechRecognition() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (speechRecognizer != null) {
                        try {
                            speechRecognizer.stopListening();
                        } catch (Exception e) {}
                    }
                }
            });
        }

        @JavascriptInterface
        public void performHapticFeedback() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (webView != null) {
                        webView.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
                    }
                }
            });
        }

        @JavascriptInterface
        public void shareTokenSlip(String shareText) {
            Intent sendIntent = new Intent();
            sendIntent.setAction(Intent.ACTION_SEND);
            sendIntent.putExtra(Intent.EXTRA_TEXT, shareText);
            sendIntent.setType("text/plain");
            Intent shareIntent = Intent.createChooser(sendIntent, "Share OPD Slip");
            mContext.startActivity(shareIntent);
        }

        @JavascriptInterface
        public void savePdfBase64(String base64Data, String filename) {
            try {
                byte[] pdfAsBytes = Base64.decode(base64Data, Base64.DEFAULT);
                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!downloadsDir.exists()) {
                    downloadsDir.mkdirs();
                }
                File file = new File(downloadsDir, filename);
                FileOutputStream os = new FileOutputStream(file, false);
                os.write(pdfAsBytes);
                os.flush();
                os.close();

                Toast.makeText(mContext, "PDF Saved to Downloads: " + filename, Toast.LENGTH_LONG).show();

                // Open downloaded PDF in native viewer
                try {
                    Uri fileUri = FileProvider.getUriForFile(mContext,
                            mContext.getPackageName() + ".fileprovider", file);
                    Intent viewIntent = new Intent(Intent.ACTION_VIEW);
                    viewIntent.setDataAndType(fileUri, "application/pdf");
                    viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    mContext.startActivity(viewIntent);
                } catch (Exception ex) {
                    // Ignore if no default PDF viewer installed
                }
            } catch (Exception e) {
                Toast.makeText(mContext, "Error saving PDF: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        }

        @JavascriptInterface
        public void showToast(String toast) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
        }
    }

}
