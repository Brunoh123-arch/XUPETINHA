package app.uppi.mobile;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.community.facebooklogin.FacebookLogin;

/**
 * Application class do Uppi.
 * Responsavel por criar canais de notificacao no Android 8+.
 */
public class MainApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
    }

    /**
     * Cria os canais de notificacao necessarios para Android 8.0+ (Oreo).
     * Sem isso, as notificacoes FCM nao aparecem no Android 8+.
     */
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            // Canal principal: corridas (alta prioridade — toca som e vibra)
            NotificationChannel ridesChannel = new NotificationChannel(
                "uppi_rides",
                "Corridas",
                NotificationManager.IMPORTANCE_HIGH
            );
            ridesChannel.setDescription("Alertas de novas corridas e atualizacoes de status");
            ridesChannel.enableVibration(true);
            ridesChannel.enableLights(true);
            ridesChannel.setShowBadge(true);
            manager.createNotificationChannel(ridesChannel);

            // Canal de mensagens do chat (prioridade alta)
            NotificationChannel chatChannel = new NotificationChannel(
                "uppi_chat",
                "Mensagens",
                NotificationManager.IMPORTANCE_HIGH
            );
            chatChannel.setDescription("Mensagens entre passageiro e motorista");
            chatChannel.enableVibration(true);
            manager.createNotificationChannel(chatChannel);

            // Canal de promocoes (prioridade baixa — nao toca som)
            NotificationChannel promoChannel = new NotificationChannel(
                "uppi_promos",
                "Promocoes e Novidades",
                NotificationManager.IMPORTANCE_LOW
            );
            promoChannel.setDescription("Cupons de desconto e novidades do Uppi");
            promoChannel.setShowBadge(false);
            manager.createNotificationChannel(promoChannel);
        }
    }
}
