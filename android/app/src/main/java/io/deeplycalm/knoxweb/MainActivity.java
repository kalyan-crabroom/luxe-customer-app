package io.deeplycalm.knoxweb;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable WebView debugging for autofill inspection
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        
        // Configure WebView for better autofill support
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            
            // Enable autofill for API 26+
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                webView.setImportantForAutofill(WebView.IMPORTANT_FOR_AUTOFILL_YES);
            }
            
            // Enable DOM storage which can help with form recognition
            webView.getSettings().setDomStorageEnabled(true);
            webView.getSettings().setDatabaseEnabled(true);
        }
    }
}
