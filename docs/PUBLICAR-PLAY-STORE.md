# Publicar Uppi na Play Store (Android)

O Uppi usa **TWA (Trusted Web Activity)** para rodar como app nativo no Android.
TWA empacota o PWA como APK/AAB sem precisar reescrever codigo.

---

## Requisitos

1. Conta de desenvolvedor Google Play ($25 taxa unica)
2. Dominio verificado com HTTPS (ja temos: uppi.app ou vercel.app)
3. Keystore para assinar o app

---

## Passo a Passo

### 1. Gerar o APK/AAB com PWABuilder

1. Acesse [pwabuilder.com](https://www.pwabuilder.com)
2. Cole a URL do app: `https://seu-dominio.vercel.app`
3. Clique em "Start" e aguarde a analise
4. Clique em "Package for stores" > "Android"
5. Configure:
   - **Package ID**: `app.uppi.twa`
   - **App name**: `Uppi`
   - **Launcher name**: `Uppi`
   - **App version**: `1.0.0`
   - **App version code**: `1`
   - **Host**: `seu-dominio.vercel.app`
   - **Start URL**: `/uppi/home`
   - **Theme color**: `#FF6B00`
   - **Background color**: `#000000`
   - **Navigation color**: `#000000`
   - **Icon**: Upload o `/public/icons/icon-512x512.jpg`
   - **Signing key**: "Create new" (guarde bem o keystore!)
6. Clique em "Generate" e baixe o ZIP
7. Dentro do ZIP voce tera:
   - `app-release-signed.aab` (para Play Store)
   - `assetlinks.json` (copie o SHA256)

### 2. Configurar Digital Asset Links

1. Copie o `sha256_cert_fingerprints` do `assetlinks.json` gerado
2. Edite `/public/.well-known/assetlinks.json` no projeto:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "app.uppi.twa",
      "sha256_cert_fingerprints": [
        "SEU_SHA256_AQUI"
      ]
    }
  }
]
```

3. Faca deploy para o Vercel
4. Verifique em: `https://seu-dominio/.well-known/assetlinks.json`

### 3. Criar Listing na Play Console

1. Acesse [play.google.com/console](https://play.google.com/console)
2. Clique em "Criar app"
3. Preencha:
   - **Nome**: Uppi - Viagens com Preco Justo
   - **Idioma**: Portugues (Brasil)
   - **Tipo**: App
   - **Gratuito/Pago**: Gratuito
4. Complete as secoes obrigatorias:

#### Detalhes do app
- **Descricao curta** (80 chars):
  > Peca corridas e negocie o preco direto com motoristas. Economize!

- **Descricao completa** (4000 chars):
  > Uppi e o app de mobilidade urbana que coloca voce no controle...

#### Graficos
- **Icone**: 512x512 PNG (use icon-512x512.jpg convertido)
- **Graficos de recursos**: 1024x500 (banner promocional)
- **Screenshots**: Minimo 2 (use /screenshots/home.jpg e ride.jpg)

#### Classificacao de conteudo
- Preencha o questionario IARC (app de transporte, sem violencia)

#### Preco e distribuicao
- Gratuito
- Paises: Brasil (ou todos)

### 4. Upload do AAB

1. Va em "Producao" > "Criar nova versao"
2. Faca upload do `app-release-signed.aab`
3. Adicione notas da versao:
   > Versao inicial do Uppi. Peca corridas, negocie precos, pague com PIX.
4. Clique em "Revisar versao" > "Iniciar lancamento"

### 5. Aguardar Revisao

- A revisao do Google leva 1-7 dias uteis
- Voce recebera email quando aprovado

---

## Atualizacoes Futuras

Para atualizar o app:

1. **Mudancas no PWA** (codigo web): Apenas faca deploy no Vercel. O TWA carrega a versao mais recente automaticamente.

2. **Mudancas no manifest/icones**: Gere novo AAB no PWABuilder, incremente o version code, e faca upload na Play Console.

---

## Checklist Final

- [x] Icones PWA gerados (8 tamanhos)
- [x] manifest.json configurado
- [x] Service Worker funcionando
- [x] Pagina /offline criada
- [x] Screenshots gerados
- [x] assetlinks.json no lugar certo
- [ ] SHA256 do keystore adicionado ao assetlinks.json
- [ ] Deploy feito no Vercel
- [ ] AAB gerado no PWABuilder
- [ ] Listing criado na Play Console
- [ ] App publicado

---

## Solucao de Problemas

### "Untrusted web activity" (barra de navegador aparece)

O assetlinks.json nao esta configurado corretamente:
1. Verifique se o SHA256 esta correto
2. Verifique se o package_name bate com o do APK
3. Aguarde ate 24h para o cache do Chrome atualizar
4. Teste em: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seu-dominio

### App nao instala

1. Verifique se o AAB foi assinado corretamente
2. Verifique se o version code e maior que a versao anterior

### Push notifications nao funcionam

1. Verifique se o Firebase Server Key esta configurado
2. Verifique se o gcm_sender_id no manifest.json esta correto
3. Teste primeiro no navegador antes de testar no TWA

---

## Links Uteis

- [PWABuilder](https://pwabuilder.com)
- [Google Play Console](https://play.google.com/console)
- [TWA Documentation](https://developer.chrome.com/docs/android/trusted-web-activity)
- [Digital Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)
