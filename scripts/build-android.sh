#!/usr/bin/env bash
# =============================================================================
# Uppi — Script de build para Android (Play Store)
# =============================================================================
# Pre-requisitos:
#   - Node.js >= 18
#   - Android SDK instalado (ANDROID_HOME configurado)
#   - Java 17 (JAVA_HOME configurado)
#   - Keystore gerado (ver instrucoes abaixo)
#
# Gerando keystore (so precisa fazer uma vez):
#   keytool -genkey -v \
#     -keystore android/uppi-release.keystore \
#     -alias uppi \
#     -keyalg RSA \
#     -keysize 2048 \
#     -validity 10000
#
# Uso:
#   chmod +x scripts/build-android.sh
#   ./scripts/build-android.sh [--aab | --apk | --debug]
# =============================================================================

set -e

# ---- Cores no terminal ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()    { echo -e "${BLUE}[Uppi]${NC} $1"; }
success(){ echo -e "${GREEN}[OK]${NC} $1"; }
warn()   { echo -e "${YELLOW}[AVISO]${NC} $1"; }
error()  { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }

# ---- Argumentos ----
BUILD_TYPE="aab"   # padrao: Android App Bundle (Play Store)
for arg in "$@"; do
  case $arg in
    --aab)   BUILD_TYPE="aab" ;;
    --apk)   BUILD_TYPE="apk" ;;
    --debug) BUILD_TYPE="debug" ;;
  esac
done

log "Iniciando build Android — tipo: ${BUILD_TYPE}"
echo ""

# ---- 1. Verificar pre-requisitos ----
log "1/6 Verificando pre-requisitos..."

command -v node >/dev/null 2>&1 || error "Node.js nao encontrado. Instale em https://nodejs.org"
command -v java >/dev/null 2>&1 || error "Java nao encontrado. Instale Java 17 (https://adoptium.net)"

NODE_VER=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
[ "$NODE_VER" -lt 18 ] && error "Node.js 18+ necessario. Versao atual: $NODE_VER"

if [ ! -d "android" ]; then
  warn "Pasta android/ nao existe. Inicializando Capacitor..."
  npx cap add android
fi

if [ ! -f "android/app/google-services.json" ]; then
  error "android/app/google-services.json nao encontrado! Adicione o arquivo do Firebase Console."
fi

success "Pre-requisitos ok"

# ---- 2. Instalar dependencias ----
log "2/6 Instalando dependencias..."
npm install --silent
success "Dependencias instaladas"

# ---- 3. Build Next.js (export estatico) ----
log "3/6 Build Next.js (export estatico)..."
export BUILD_TARGET=android
npm run build 2>&1 | tail -20

if [ ! -d "out" ]; then
  error "Pasta out/ nao gerada. Verifique erros no build Next.js acima."
fi
success "Build Next.js concluido -> ./out"

# ---- 4. Sync Capacitor ----
log "4/6 Sincronizando Capacitor com Android..."
npx cap sync android
success "Capacitor sincronizado"

# ---- 5. Build Android ----
log "5/6 Compilando projeto Android..."
cd android

chmod +x gradlew

if [ "$BUILD_TYPE" = "debug" ]; then
  ./gradlew assembleDebug --quiet
  OUTPUT="app/build/outputs/apk/debug/app-debug.apk"
  success "APK debug gerado"

elif [ "$BUILD_TYPE" = "apk" ]; then
  # Verifica keystore
  if [ ! -f "uppi-release.keystore" ]; then
    error "Keystore nao encontrado em android/uppi-release.keystore\nGere com:\n  keytool -genkey -v -keystore android/uppi-release.keystore -alias uppi -keyalg RSA -keysize 2048 -validity 10000"
  fi
  ./gradlew assembleRelease --quiet \
    -Pandroid.injected.signing.store.file="$(pwd)/uppi-release.keystore" \
    -Pandroid.injected.signing.store.password="${KEYSTORE_PASSWORD:-uppi123}" \
    -Pandroid.injected.signing.key.alias="${KEY_ALIAS:-uppi}" \
    -Pandroid.injected.signing.key.password="${KEY_PASSWORD:-uppi123}"
  OUTPUT="app/build/outputs/apk/release/app-release.apk"
  success "APK release gerado"

else
  # AAB — formato obrigatorio para Play Store
  if [ ! -f "uppi-release.keystore" ]; then
    error "Keystore nao encontrado em android/uppi-release.keystore\nGere com:\n  keytool -genkey -v -keystore android/uppi-release.keystore -alias uppi -keyalg RSA -keysize 2048 -validity 10000"
  fi
  ./gradlew bundleRelease --quiet \
    -Pandroid.injected.signing.store.file="$(pwd)/uppi-release.keystore" \
    -Pandroid.injected.signing.store.password="${KEYSTORE_PASSWORD:-uppi123}" \
    -Pandroid.injected.signing.key.alias="${KEY_ALIAS:-uppi}" \
    -Pandroid.injected.signing.key.password="${KEY_PASSWORD:-uppi123}"
  OUTPUT="app/build/outputs/bundle/release/app-release.aab"
  success "AAB release gerado (Play Store)"
fi

cd ..

# ---- 6. Resultado ----
echo ""
echo "================================================================="
success "Build concluido com sucesso!"
echo ""
echo "  Arquivo: android/${OUTPUT}"
echo ""

if [ "$BUILD_TYPE" = "aab" ]; then
  echo "  Proximos passos (Play Store):"
  echo "  1. Acesse https://play.google.com/console"
  echo "  2. Selecione o app ou crie um novo (package: app.uppi.mobile)"
  echo "  3. Vá em Producao > Versoes > Criar nova versao"
  echo "  4. Faça upload do arquivo .aab"
  echo "  5. Preencha notas da versao e publique"
elif [ "$BUILD_TYPE" = "debug" ]; then
  echo "  Para instalar no dispositivo conectado:"
  echo "  adb install android/${OUTPUT}"
fi
echo "================================================================="
