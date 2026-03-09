package app.uppi.mobile;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

/**
 * MainActivity do Uppi — estende BridgeActivity do Capacitor.
 * Todos os plugins Capacitor (@capacitor/push-notifications, @capacitor/geolocation, etc.)
 * sao registrados automaticamente via auto-discovery do Capacitor 8.
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Instala a Splash Screen nativa antes de qualquer outra coisa
        SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);
    }
}
