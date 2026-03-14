# Google Maps Navigation SDK — Guia de Configuração

Este guia cobre os passos necessários para ativar o Navigation SDK nativo no Android e iOS do app Uppi.

---

## 1. Solicitar acesso ao Navigation SDK

O SDK é **gratuito mas de acesso fechado**. Preencha o formulário de interesse:

- https://developers.google.com/maps/documentation/navigation/android-sdk/get-started

O Google costuma aprovar em alguns dias úteis. Você receberá acesso ao repositório Maven privado (Android) e ao pod privado (iOS).

---

## 2. Android

### 2.1 Credenciais do repositório Maven

Após a aprovação, você receberá um arquivo `google_navigation_credentials.json`.
Coloque-o em `android/app/google_navigation_credentials.json`.

No `android/build.gradle` (raiz do projeto), adicione dentro de `allprojects > repositories`:

```groovy
maven {
    url 'https://maven.pkg.github.com/googlemaps/android-navigation-sdk'
    credentials {
        username = System.getenv("GOOGLE_NAV_MAVEN_USER") ?: ""
        password = System.getenv("GOOGLE_NAV_MAVEN_TOKEN") ?: ""
    }
}
```

Defina as variáveis `GOOGLE_NAV_MAVEN_USER` e `GOOGLE_NAV_MAVEN_TOKEN` nas Vars do projeto Vercel **e** no `~/.gradle/gradle.properties` local.

### 2.2 Dependência

No `android/app/build.gradle`:

```groovy
dependencies {
    // Navigation SDK (substitui o com.google.android.gms:play-services-maps se presente)
    implementation 'com.google.android.libraries.navigation:navigation:5.2.0'
}
```

### 2.3 Copiar o plugin

```bash
cp plugins/navigation/android/CapacitorNavigationPlugin.kt \
   android/app/src/main/java/com/uppi/app/plugins/navigation/CapacitorNavigationPlugin.kt
```

### 2.4 Registrar no MainActivity.kt

```kotlin
import com.uppi.app.plugins.navigation.CapacitorNavigationPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(CapacitorNavigationPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
```

### 2.5 AndroidManifest.xml

Garanta que as permissões e a API key estejam declaradas:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<application ...>
    <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="${GOOGLE_MAPS_API_KEY}" />
</application>
```

---

## 3. iOS

### 3.1 Podfile

Em `ios/App/Podfile`, substitua `pod 'GoogleMaps'` (se existir) por:

```ruby
pod 'GoogleNavigation', '~> 9.1'
# GoogleNavigation já inclui GoogleMaps — não declare os dois juntos
```

Depois:

```bash
cd ios/App && pod install
```

### 3.2 Copiar o plugin

```bash
cp plugins/navigation/ios/CapacitorNavigationPlugin.swift \
   ios/App/App/plugins/navigation/CapacitorNavigationPlugin.swift
```

Adicione o arquivo ao target `App` dentro do Xcode:
`File > Add Files to "App"` → selecione `CapacitorNavigationPlugin.swift`.

### 3.3 Info.plist

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Usamos sua localização para exibir sua posição no mapa durante as corridas.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Usamos sua localização em segundo plano para navegação contínua durante corridas.</string>
```

### 3.4 AppDelegate.swift

```swift
import GoogleMaps
import GoogleNavigation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        GMSServices.provideAPIKey("SUA_GOOGLE_MAPS_API_KEY")
        GMSNavigationServices.setAbnormalTerminationReportingEnabled(true)
        return true
    }
}
```

---

## 4. Verificação

Após instalar:

1. Execute `npx cap sync` para sincronizar os plugins Capacitor.
2. Abra uma corrida ativa como motorista.
3. Toque em **Navegar com Google Maps**.
4. Se o SDK estiver disponível, a tela de navegação in-app abrirá diretamente. Caso contrário, o app abrirá o Google Maps externo como fallback.

---

## 5. Fallback (sem acesso aprovado)

Enquanto o acesso não for aprovado, a função `isAvailable()` retornará `false` e o app usará automaticamente o deep link `google.navigation:q=lat,lng` (Android) ou `comgooglemaps://` (iOS), mantendo a experiência funcional.

---

## 6. Custos

- Navigation SDK: **gratuito** dentro dos limites de uso do Google Maps Platform. Verifique as cotas no [Console do Google Cloud](https://console.cloud.google.com/).
- A mesma `GOOGLE_MAPS_API_KEY` usada pelo app já cobre o Navigation SDK, desde que a API **Navigation SDK** esteja habilitada no console.
