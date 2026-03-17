# Guia Completo: Publicar o App Uppi na Google Play Store

Este guia detalha todos os passos necessários para compilar e publicar o app Uppi na Google Play Store.

---

## Sumário

1. [Requisitos do Sistema](#1-requisitos-do-sistema)
2. [Configurar Firebase](#2-configurar-firebase)
3. [Configurar Google Maps](#3-configurar-google-maps)
4. [Configurar Variáveis de Ambiente](#4-configurar-variaveis-de-ambiente)
5. [Baixar e Preparar o Projeto](#5-baixar-e-preparar-o-projeto)
6. [Gerar Keystore de Assinatura](#6-gerar-keystore-de-assinatura)
7. [Compilar o APK/AAB](#7-compilar-o-apkaab)
8. [Criar Conta de Desenvolvedor Google](#8-criar-conta-de-desenvolvedor-google)
9. [Preparar Assets da Loja](#9-preparar-assets-da-loja)
10. [Publicar na Play Store](#10-publicar-na-play-store)
11. [Checklist Final](#11-checklist-final)

---

## 1. Requisitos do Sistema

### Software Necessário

| Software | Versão Mínima | Download |
|----------|---------------|----------|
| Node.js | 18.x ou superior | https://nodejs.org/ |
| Android Studio | Hedgehog (2023.1.1) ou superior | https://developer.android.com/studio |
| JDK | 17 (incluído no Android Studio) | - |
| Git | Qualquer versão recente | https://git-scm.com/ |

### Instalação do Android Studio

1. Baixe o Android Studio do site oficial
2. Execute o instalador
3. Durante a instalação, certifique-se de instalar:
   - Android SDK
   - Android SDK Platform-Tools
   - Android Virtual Device (AVD)
4. Após instalar, abra o Android Studio e vá em **Tools > SDK Manager**
5. Na aba **SDK Platforms**, instale:
   - Android 14.0 (API 34)
   - Android 15.0 (API 35)
6. Na aba **SDK Tools**, instale:
   - Android SDK Build-Tools 35
   - Android SDK Command-line Tools
   - Android Emulator
   - Android SDK Platform-Tools

### Configurar Variáveis de Ambiente (Windows)

1. Abra **Configurações do Sistema > Variáveis de Ambiente**
2. Adicione em **Variáveis do Sistema**:
   ```
   ANDROID_HOME = C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk
   JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
   ```
3. Adicione ao **PATH**:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

### Configurar Variáveis de Ambiente (macOS/Linux)

Adicione ao `~/.bashrc` ou `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Execute: `source ~/.bashrc` ou `source ~/.zshrc`

---

## 2. Configurar Firebase

O Firebase é necessário para push notifications e analytics.

### Passo 1: Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **Adicionar projeto**
3. Nome do projeto: `Uppi`
4. Desative o Google Analytics (opcional) ou configure conforme preferir
5. Clique em **Criar projeto**

### Passo 2: Adicionar App Android

1. No painel do projeto, clique no ícone do Android
2. Preencha os campos:
   - **Nome do pacote Android**: `app.uppi.mobile`
   - **Apelido do app**: `Uppi`
   - **Certificado de assinatura SHA-1**: (adicione depois, veja seção 6)
3. Clique em **Registrar app**

### Passo 3: Baixar google-services.json

1. Clique em **Baixar google-services.json**
2. Salve o arquivo - você vai precisar dele na seção 5

### Passo 4: Configurar Cloud Messaging

1. No Firebase Console, vá em **Engajamento > Cloud Messaging**
2. Clique em **Configurar** se necessário
3. Anote a **Server Key** (será usada no backend para enviar push)

### Passo 5: Adicionar SHA-1 e SHA-256

Após gerar o keystore (seção 6), volte aqui e:

1. Vá em **Configurações do projeto > Geral**
2. Role até seu app Android
3. Clique em **Adicionar impressão digital**
4. Cole os hashes SHA-1 e SHA-256 do seu keystore

---

## 3. Configurar Google Maps

### Passo 1: Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou use o mesmo do Firebase (recomendado)
3. Selecione o projeto

### Passo 2: Ativar APIs Necessárias

Vá em **APIs e Serviços > Biblioteca** e ative:

- Maps SDK for Android
- Directions API
- Geocoding API
- Places API
- Distance Matrix API

### Passo 3: Criar API Key

1. Vá em **APIs e Serviços > Credenciais**
2. Clique em **Criar credenciais > Chave de API**
3. Clique em **Restringir chave**
4. Em **Restrições de aplicativo**, selecione **Apps Android**
5. Adicione seu app:
   - Nome do pacote: `app.uppi.mobile`
   - Impressão digital SHA-1: (do seu keystore)
6. Em **Restrições de API**, selecione as APIs que ativou
7. Salve e copie a API Key

### Passo 4: Configurar Faturamento

**IMPORTANTE**: As APIs do Google Maps requerem faturamento ativo.

1. Vá em **Faturamento** no Google Cloud Console
2. Vincule uma conta de faturamento
3. O Google oferece $200/mês de crédito gratuito

---

## 4. Configurar Variáveis de Ambiente

### No Vercel (Produção)

Acesse seu projeto no Vercel e adicione estas variáveis:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase |
| `ENCRYPTION_KEY` | Chave de 32+ caracteres para criptografia |
| `CRON_SECRET` | Secret para proteger endpoints de admin |
| `GOOGLE_MAPS_API_KEY` | API Key do Google Maps |
| `FIREBASE_SERVER_KEY` | Server Key do Firebase Cloud Messaging |

### Gerar ENCRYPTION_KEY

Execute no terminal:
```bash
openssl rand -base64 32
```

Ou use: https://generate-secret.vercel.app/32

### Gerar CRON_SECRET

Execute no terminal:
```bash
openssl rand -hex 32
```

---

## 5. Baixar e Preparar o Projeto

### Opção A: Via GitHub (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO

# Instale as dependências
npm install
```

### Opção B: Via Download ZIP

1. No v0, clique nos 3 pontinhos no canto superior direito
2. Selecione **Download ZIP**
3. Extraia o arquivo
4. Abra o terminal na pasta extraída
5. Execute: `npm install`

### Copiar Arquivos de Configuração

1. Copie `google-services.json` para `android/app/`

2. Edite `android/app/src/main/res/values/strings.xml`:
```xml
<string name="google_maps_api_key">SUA_API_KEY_AQUI</string>
```

### Verificar Configuração

Execute para verificar se tudo está correto:

```bash
# Verificar instalação do Capacitor
npx cap doctor

# Deve mostrar:
# ✔ Android Studio detected
# ✔ Android SDK detected
# ✔ capacitor.config.ts found
```

---

## 6. Gerar Keystore de Assinatura

O keystore é usado para assinar seu app. **GUARDE-O COM SEGURANÇA** - você precisará dele para todas as atualizações futuras.

### Gerar Keystore

```bash
# Navegue até a pasta android/app
cd android/app

# Gere o keystore
keytool -genkey -v -keystore uppi-release.keystore -alias uppi -keyalg RSA -keysize 2048 -validity 10000
```

Quando perguntado, preencha:
- **Senha do keystore**: (crie uma senha forte, anote!)
- **Nome e sobrenome**: Seu nome ou nome da empresa
- **Unidade organizacional**: Desenvolvimento
- **Nome da organização**: Sua empresa
- **Cidade**: Sua cidade
- **Estado**: Seu estado
- **Código do país**: BR

### Obter SHA-1 e SHA-256

```bash
keytool -list -v -keystore uppi-release.keystore -alias uppi
```

Copie os valores de:
- **SHA1**: Para o Firebase e Google Maps
- **SHA256**: Para o Firebase

### Configurar Assinatura no Gradle

Crie o arquivo `android/keystore.properties`:

```properties
storePassword=SUA_SENHA_DO_KEYSTORE
keyPassword=SUA_SENHA_DA_KEY
keyAlias=uppi
storeFile=uppi-release.keystore
```

**IMPORTANTE**: Adicione `keystore.properties` ao `.gitignore` para não commitar senhas!

### Backup do Keystore

Faça backup seguro de:
- `uppi-release.keystore`
- `keystore.properties`
- Senhas anotadas

**Se você perder o keystore, não poderá mais atualizar o app na Play Store!**

---

## 7. Compilar o APK/AAB

### Build do Projeto Web

```bash
# Na pasta raiz do projeto
npm run build:android
```

Este comando:
1. Faz o build do Next.js com output estático
2. Copia os arquivos para `android/app/src/main/assets/public`
3. Sincroniza com o Capacitor

### Abrir no Android Studio

```bash
npm run android:open
```

Ou abra o Android Studio e selecione: **File > Open** e navegue até a pasta `android/`

### Gerar AAB (Android App Bundle) - Recomendado para Play Store

1. No Android Studio, vá em **Build > Generate Signed Bundle / APK**
2. Selecione **Android App Bundle**
3. Clique em **Next**
4. Configure a assinatura:
   - **Key store path**: Selecione `uppi-release.keystore`
   - **Key store password**: Sua senha
   - **Key alias**: uppi
   - **Key password**: Sua senha
5. Clique em **Next**
6. Selecione **release**
7. Clique em **Create**

O arquivo será gerado em: `android/app/release/app-release.aab`

### Gerar APK (Para testes)

Para testar em dispositivos antes de publicar:

1. No Android Studio, vá em **Build > Generate Signed Bundle / APK**
2. Selecione **APK**
3. Siga os mesmos passos acima
4. O APK será gerado em: `android/app/release/app-release.apk`

### Testar o APK

```bash
# Conecte um dispositivo Android via USB com depuração ativada
adb install android/app/release/app-release.apk
```

Ou transfira o APK para o celular e instale manualmente.

---

## 8. Criar Conta de Desenvolvedor Google

### Passo 1: Criar Conta

1. Acesse [Google Play Console](https://play.google.com/console)
2. Clique em **Criar conta de desenvolvedor**
3. Faça login com sua conta Google
4. Aceite os termos de serviço
5. Pague a taxa única de **$25 USD**
6. Complete a verificação de identidade

### Passo 2: Verificação de Identidade

A Google exige verificação para novas contas:

1. **Conta pessoal**: Upload de documento de identidade
2. **Conta empresarial**: CNPJ e documentos da empresa

O processo pode levar de 2 a 7 dias.

### Passo 3: Configurar Perfil

1. Preencha as informações do desenvolvedor
2. Adicione email de contato público
3. Adicione política de privacidade (obrigatório)
4. Configure informações de pagamento (se for cobrar pelo app)

---

## 9. Preparar Assets da Loja

### Ícone do App

| Tipo | Tamanho | Formato |
|------|---------|---------|
| Ícone da loja | 512x512 px | PNG (32-bit, sem alfa) |
| Ícone adaptativo | 512x512 px | PNG com camadas |

### Screenshots

Você precisa de screenshots para cada tipo de dispositivo:

| Dispositivo | Quantidade | Tamanho |
|-------------|------------|---------|
| Telefone | 2-8 | 16:9 ou 9:16 (min 320px, max 3840px) |
| Tablet 7" | 0-8 | Mesmas proporções |
| Tablet 10" | 0-8 | Mesmas proporções |

**Dica**: Use o emulador do Android Studio para capturar screenshots.

### Gráfico de Recursos

| Tipo | Tamanho | Uso |
|------|---------|-----|
| Gráfico de recursos | 1024x500 px | Banner promocional |

### Vídeo Promocional (Opcional)

- Link do YouTube
- Duração: 30 segundos a 2 minutos
- Deve mostrar o app em funcionamento

### Textos

Prepare em português:

| Campo | Limite | Descrição |
|-------|--------|-----------|
| Nome do app | 30 caracteres | "Uppi - Mobilidade Urbana" |
| Descrição curta | 80 caracteres | Resumo para resultados de busca |
| Descrição completa | 4000 caracteres | Descrição detalhada do app |

#### Exemplo de Descrição Completa:

```
Uppi é o app de mobilidade urbana que conecta passageiros e motoristas de forma simples, segura e econômica.

PARA PASSAGEIROS:
• Solicite corridas com poucos toques
• Acompanhe seu motorista em tempo real no mapa
• Pague com PIX, cartão ou dinheiro
• Avalie motoristas e receba atendimento de qualidade
• Agende corridas para compromissos importantes
• Compartilhe sua localização em tempo real com familiares

PARA MOTORISTAS:
• Ganhe dinheiro no seu tempo livre
• Receba solicitações de corrida na sua região
• Navegação integrada turn-by-turn
• Receba pagamentos diretamente na sua conta
• Acompanhe seus ganhos em tempo real

SEGURANÇA:
• Verificação de identidade de todos os motoristas
• Botão de emergência SOS
• Compartilhamento de corrida em tempo real
• Gravação de áudio durante as corridas
• Suporte 24 horas

PAGAMENTOS:
• PIX instantâneo
• Cartão de crédito e débito
• Dinheiro
• Carteira digital com cashback

Baixe agora e experimente uma nova forma de se locomover!
```

---

## 10. Publicar na Play Store

### Passo 1: Criar o App

1. No Google Play Console, clique em **Criar app**
2. Preencha:
   - **Nome do app**: Uppi
   - **Idioma padrão**: Português (Brasil)
   - **App ou jogo**: App
   - **Gratuito ou pago**: Gratuito
3. Aceite as declarações
4. Clique em **Criar app**

### Passo 2: Configurar Ficha da Loja

Vá em **Aumentar usuários > Presença na loja > Ficha principal da loja**:

1. **Detalhes do app**:
   - Nome do app
   - Descrição curta
   - Descrição completa

2. **Gráficos**:
   - Ícone do app
   - Gráfico de recursos
   - Screenshots (telefone, tablet)

3. **Categorização**:
   - Categoria: Mapas e navegação
   - Tags: transporte, mobilidade, corrida, táxi

### Passo 3: Classificação de Conteúdo

Vá em **Políticas > Classificação de conteúdo**:

1. Clique em **Iniciar questionário**
2. Responda as perguntas sobre:
   - Violência
   - Sexualidade
   - Linguagem
   - Substâncias controladas
3. O app receberá uma classificação (provavelmente "Livre")

### Passo 4: Configurações de Segmentação

Vá em **Políticas > Público-alvo e conteúdo**:

1. **Público-alvo**: Adultos (18+) - apps de transporte geralmente requerem
2. **Presença de anúncios**: Não (ou sim, se tiver)

### Passo 5: Política de Privacidade

**OBRIGATÓRIO** - O app coleta dados de localização.

1. Crie uma política de privacidade e hospede online
2. Vá em **Políticas > Conteúdo do app > Política de privacidade**
3. Adicione a URL da sua política

### Passo 6: Segurança dos Dados

Vá em **Políticas > Conteúdo do app > Segurança dos dados**:

Declare todos os dados coletados:
- **Localização**: Aproximada e precisa
- **Informações pessoais**: Nome, email, telefone, endereço
- **Informações financeiras**: Histórico de compras, meios de pagamento
- **Fotos**: Documentos do motorista, foto de perfil

### Passo 7: Upload do AAB

1. Vá em **Testar e publicar > Produção**
2. Clique em **Criar nova versão**
3. Faça upload do arquivo `app-release.aab`
4. Aguarde o processamento
5. Preencha as notas da versão:
   ```
   Versão 1.0.0
   
   • Lançamento inicial do Uppi
   • Solicite corridas com facilidade
   • Acompanhe seu motorista em tempo real
   • Pague com PIX, cartão ou dinheiro
   • Chat com o motorista durante a corrida
   ```

### Passo 8: Revisão e Publicação

1. Vá em **Testar e publicar > Visão geral de publicação**
2. Revise todos os avisos e erros
3. Corrija qualquer problema indicado
4. Clique em **Enviar para revisão**

### Tempo de Revisão

- **Primeira revisão**: 3-7 dias (pode ser mais longo)
- **Atualizações**: 1-3 dias normalmente

Você receberá um email quando o app for aprovado ou se houver problemas.

---

## 11. Checklist Final

### Antes do Build

- [ ] Node.js 18+ instalado
- [ ] Android Studio instalado e configurado
- [ ] SDK Android 35 instalado
- [ ] `google-services.json` em `android/app/`
- [ ] Google Maps API Key configurada em `strings.xml`
- [ ] Keystore gerado e backup feito
- [ ] `keystore.properties` configurado

### Antes da Publicação

- [ ] App testado em dispositivo físico
- [ ] Todas as funcionalidades testadas
- [ ] Crash-free (sem travamentos)
- [ ] Performance aceitável
- [ ] Permissões funcionando (GPS, câmera, push)

### Na Play Store

- [ ] Conta de desenvolvedor criada e verificada
- [ ] Ícone 512x512 px
- [ ] Gráfico de recursos 1024x500 px
- [ ] Mínimo 2 screenshots de telefone
- [ ] Descrição curta (80 caracteres)
- [ ] Descrição completa (4000 caracteres)
- [ ] Classificação de conteúdo preenchida
- [ ] Política de privacidade publicada
- [ ] Segurança dos dados preenchida
- [ ] AAB uploaded

### Pós-Publicação

- [ ] Testar download da Play Store
- [ ] Verificar se push notifications funcionam
- [ ] Monitorar reviews e crashes no console
- [ ] Responder feedback dos usuários

---

## Problemas Comuns

### Erro: "SDK location not found"

Crie o arquivo `android/local.properties`:
```properties
sdk.dir=C:\\Users\\SEU_USUARIO\\AppData\\Local\\Android\\Sdk
```

### Erro: "Google Maps API key not found"

Verifique se `strings.xml` tem a API key correta e se a API está ativada no Google Cloud.

### Erro: "Firebase configuration not found"

Certifique-se de que `google-services.json` está em `android/app/` (não na pasta `android/`).

### Erro: "Keystore was tampered with"

A senha do keystore está incorreta. Verifique `keystore.properties`.

### App rejeitado: "Política de privacidade"

Crie uma política de privacidade completa mencionando:
- Dados coletados (localização, informações pessoais)
- Como os dados são usados
- Com quem são compartilhados
- Direitos do usuário (LGPD)

### App rejeitado: "Permissão de localização em segundo plano"

A Google é rigorosa com `ACCESS_BACKGROUND_LOCATION`. Você precisa:
1. Justificar o uso no formulário de permissões
2. Mostrar vídeo demonstrando a necessidade
3. Explicar que é essencial para motoristas em corrida

---

## Suporte

- **Documentação Capacitor**: https://capacitorjs.com/docs
- **Firebase**: https://firebase.google.com/docs
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **Google Maps Platform**: https://developers.google.com/maps/documentation

---

Última atualização: Março 2026
