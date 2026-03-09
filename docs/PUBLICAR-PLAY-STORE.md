# Publicar Uppi na Play Store (Capacitor Nativo)

O Uppi usa **Capacitor** para rodar como app nativo no Android com acesso completo a APIs nativas (GPS background, Push FCM, Camera, etc).

---

## Pre-requisitos

1. **Android Studio** instalado — https://developer.android.com/studio
2. **Java JDK 17+** — `java -version` para verificar
3. **Node.js 18+** — `node -v` para verificar
4. **Conta Google Play Console** — $25 taxa unica
5. **Firebase Project** — para Push Notifications (FCM)

---

## Passo 1: Instalar Dependencias

```bash
# Clonar o projeto
git clone https://github.com/uppiapp/XUPETINHA.git
cd XUPETINHA

# Instalar dependencias
pnpm install

# Adicionar plataforma Android
npx cap add android
```

---

## Passo 2: Configurar Firebase (FCM)

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie projeto ou use existente
3. Clique em "Adicionar app" > Android
4. Package name: `app.uppi.mobile`
5. Baixe `google-services.json`
6. Copie para `android/app/google-services.json`

---

## Passo 3: Configurar URL do Servidor

Edite `capacitor.config.ts`:

```ts
server: {
  url: 'https://SEU-PROJETO.vercel.app', // URL do deploy Vercel
  androidScheme: 'https',
}
```

---

## Passo 4: Sincronizar e Abrir Android Studio

```bash
# Sincronizar arquivos
npx cap sync android

# Abrir no Android Studio
npx cap open android
```

---

## Passo 5: Configurar Icones

No Android Studio:

1. Clique direito em `app/res` > **New** > **Image Asset**
2. Icon Type: **Launcher Icons (Adaptive and Legacy)**
3. Path: selecione `/public/icons/icon-512x512.jpg`
4. Clique **Next** > **Finish**

---

## Passo 6: Configurar Splash Screen

Crie `android/app/src/main/res/drawable/splash.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_color"/>
</layer-list>
```

Adicione em `android/app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splash_color">#FF6B00</color>
</resources>
```

---

## Passo 7: Verificar Permissoes

Confira `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

---

## Passo 8: Criar Keystore (primeira vez)

```bash
keytool -genkey -v -keystore uppi-release.keystore -alias uppi -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANTE:** Guarde a senha e o arquivo em local seguro! Voce precisara para TODAS as atualizacoes futuras.

---

## Passo 9: Configurar Assinatura

Crie `android/keystore.properties`:

```properties
storePassword=SUA_SENHA_AQUI
keyPassword=SUA_SENHA_AQUI
keyAlias=uppi
storeFile=../uppi-release.keystore
```

Edite `android/app/build.gradle` e adicione ANTES de `android {`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dentro de `android { ... }` adicione:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

## Passo 10: Gerar AAB (Android App Bundle)

### Opcao A: Via Android Studio

1. **Build** > **Generate Signed Bundle / APK**
2. Selecione **Android App Bundle**
3. Selecione o keystore e preencha as senhas
4. Build variant: **release**
5. Clique **Create**

### Opcao B: Via Terminal

```bash
cd android
./gradlew bundleRelease
```

O arquivo estara em:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## Passo 11: Criar Listing na Play Console

1. Acesse [play.google.com/console](https://play.google.com/console)
2. Clique **Criar app**
3. Preencha:
   - Nome: **Uppi**
   - Idioma: Portugues (Brasil)
   - Tipo: App
   - Categoria: Viagens e local
   - Gratuito

### Informacoes do App

**Descricao curta (80 chars):**
```
Corridas rapidas, seguras e com preco justo. Peca agora!
```

**Descricao completa:**
```
Uppi e o app de corridas que voce merece. Rapido, seguro e com precos justos.

PARA PASSAGEIROS:
• Solicite corridas em segundos
• Acompanhe seu motorista em tempo real
• Pague com PIX, cartao ou saldo
• Avalie e seja avaliado
• Compartilhe sua viagem com amigos e familia
• Botao de emergencia SOS

PARA MOTORISTAS:
• Ganhe dinheiro no seu horario
• Receba pagamentos instantaneos via PIX
• Veja zonas de alta demanda
• Acompanhe seus ganhos diarios e semanais

CLUB UPPI:
• Descontos exclusivos em todas as corridas
• Suporte prioritario 24h
• Cashback em cada viagem

Baixe agora e experimente uma nova forma de se locomover!
```

### Graficos Obrigatorios

| Item | Tamanho | Arquivo |
|------|---------|---------|
| Icone | 512x512 | `/public/icons/icon-512x512.jpg` |
| Feature Graphic | 1024x500 | Criar no Canva |
| Screenshots | Min 2 | `/public/screenshots/home.jpg`, `ride.jpg` |

---

## Passo 12: Upload e Publicacao

1. Va em **Producao** > **Criar nova versao**
2. Faca upload do `app-release.aab`
3. Notas da versao:
   ```
   Versao 1.0.0
   - Lancamento inicial
   - Solicitar corridas
   - Pagamento via PIX
   - Acompanhamento em tempo real
   ```
4. **Revisar versao** > **Iniciar lancamento para producao**

---

## Comandos Uteis

```bash
# Sincronizar apos mudancas no codigo
npx cap sync android

# Abrir Android Studio
npx cap open android

# Rodar em dispositivo conectado (debug)
npx cap run android

# Rodar com live reload (desenvolvimento)
npx cap run android --livereload --external

# Gerar APK debug (para testes)
cd android && ./gradlew assembleDebug

# Gerar AAB release (para Play Store)
cd android && ./gradlew bundleRelease
```

---

## Atualizacoes Futuras

### Mudancas apenas no codigo web:
1. Faca deploy no Vercel
2. O app carrega automaticamente a nova versao

### Mudancas no app nativo (permissoes, plugins, etc):
1. Incremente `versionCode` e `versionName` em `android/app/build.gradle`
2. `npx cap sync android`
3. Gere novo AAB
4. Upload na Play Console

---

## Checklist Final

- [ ] Android Studio instalado
- [ ] `google-services.json` em `android/app/`
- [ ] URL do Vercel configurada em `capacitor.config.ts`
- [ ] Keystore criado e guardado em local seguro
- [ ] `keystore.properties` configurado
- [ ] Icones gerados via Android Studio
- [ ] Permissoes configuradas no AndroidManifest
- [ ] AAB gerado e assinado
- [ ] Screenshots prontos (min 2)
- [ ] Listing criado na Play Console
- [ ] Politica de privacidade publicada
- [ ] App enviado para revisao

---

## Tempo de Revisao

- Apps novos: **3-7 dias uteis**
- Apps de ride-sharing: podem levar mais devido a verificacoes de seguranca
- Atualizacoes: **1-3 dias uteis**

Voce recebera email quando aprovado!

---

## Solucao de Problemas

### Build falha com erro de Java
```bash
# Verificar versao do Java (precisa ser 17+)
java -version

# No Mac, configurar JAVA_HOME
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

### Push notifications nao funcionam
1. Verifique se `google-services.json` esta em `android/app/`
2. Verifique se o package name bate: `app.uppi.mobile`
3. Teste no dispositivo fisico (emulador nem sempre funciona)

### GPS nao funciona em background
Adicione ao AndroidManifest:
```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

### App fecha ao abrir
1. Verifique se a URL do Vercel esta correta
2. Verifique se o deploy foi feito
3. Teste a URL no navegador primeiro
