# TROUBLESHOOTING - SOLUCAO DE PROBLEMAS

> Ultima atualizacao: 16/03/2026 — Versao 31.0

## PROBLEMAS COMUNS E SOLUCOES

---

## 1. ERROS DE BUILD

### "Module not found"
```
Error: Cannot find module '@/components/xyz'
```
**Solucao:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
npm install
npm run build
```

### "Type error"
```
Type 'X' is not assignable to type 'Y'
```
**Solucao:**
```bash
# Verificar tipos
npx tsc --noEmit

# Atualizar tipos do Supabase
npx supabase gen types typescript --project-id ullmjdgppucworavoiia > lib/types/database.ts
```

### "ENOSPC: System limit for number of file watchers reached"
**Solucao (Linux):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 2. ERROS DE SUPABASE

### "JWT expired"
```
Error: JWT expired
```
**Solucao:**
- Fazer logout e login novamente
- Verificar se o token esta sendo renovado

### "Row Level Security violation"
```
Error: new row violates row-level security policy
```
**Solucao:**
1. Verificar se usuario esta autenticado
2. Verificar se a politica RLS permite a acao
3. Checar no Supabase Dashboard > Authentication > Policies

### "relation does not exist"
```
Error: relation "xyz" does not exist
```
**Solucao:**
- Executar a migration que cria a tabela
- Verificar se esta conectado ao projeto correto

### "permission denied for table"
```
Error: permission denied for table xyz
```
**Solucao:**
1. Habilitar RLS na tabela
2. Criar politica de acesso
```sql
ALTER TABLE xyz ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xyz_policy" ON xyz FOR ALL USING (true);
```

---

## 3. ERROS DE ANDROID/CAPACITOR

### "SDK location not found"
```
Error: SDK location not found. Define location with sdk.dir
```
**Solucao:**
Criar arquivo `android/local.properties`:
```properties
sdk.dir=/Users/SEU_USUARIO/Library/Android/sdk
# ou no Windows:
# sdk.dir=C:\\Users\\SEU_USUARIO\\AppData\\Local\\Android\\Sdk
```

### "AAPT: error: resource not found"
**Solucao:**
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### "Execution failed for task ':app:processDebugGoogleServices'"
```
Error: File google-services.json is missing
```
**Solucao:**
1. Baixar `google-services.json` do Firebase Console
2. Colocar em `android/app/google-services.json`

### "minSdkVersion 21 < minSdkVersion 24"
**Solucao:**
Editar `android/app/build.gradle`:
```gradle
defaultConfig {
    minSdkVersion 24  // Aumentar para 24
    targetSdkVersion 34
}
```

### APK nao instala no celular
**Solucao:**
1. Verificar se "Fontes desconhecidas" esta habilitado
2. Desinstalar versao anterior
3. Verificar se o APK foi assinado corretamente

---

## 4. ERROS DE API

### "CORS error"
```
Access to fetch blocked by CORS policy
```
**Solucao:**
- APIs internas (Next.js): nao precisa configurar
- APIs externas: usar proxy ou configurar headers no servidor

### "429 Too Many Requests"
**Solucao:**
- Aguardar alguns minutos
- Implementar retry com backoff exponencial
- Verificar rate limits da API

### "500 Internal Server Error"
**Solucao:**
1. Verificar logs do servidor (Vercel > Logs)
2. Adicionar console.log para debug
3. Verificar variaveis de ambiente

### "Network request failed"
**Solucao:**
- Verificar conexao com internet
- Verificar se a URL esta correta
- Verificar certificado SSL

---

## 5. ERROS DE AUTENTICACAO

### "Invalid login credentials"
**Solucao:**
1. Verificar email/senha
2. Verificar se usuario existe
3. Checar se email foi confirmado

### "OTP expired"
**Solucao:**
- Solicitar novo codigo
- Verificar se horario do servidor esta correto

### "User already registered"
**Solucao:**
- Fazer login ao inves de cadastro
- Usar "Esqueci a senha" se necessario

### "Email not confirmed"
**Solucao:**
1. Verificar caixa de spam
2. Reenviar email de confirmacao
3. Confirmar manualmente no Supabase Dashboard

---

## 6. ERROS DE MAPA

### "Google Maps API key is invalid"
**Solucao:**
1. Verificar se a chave esta correta em `.env.local`
2. Verificar se as APIs estao habilitadas no Google Cloud
3. Verificar restricoes da chave (dominio, IP)

### Mapa nao carrega
**Solucao:**
1. Verificar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
2. Habilitar APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
3. Verificar faturamento no Google Cloud

### Geolocalizacao nao funciona
**Solucao:**
1. Verificar permissoes do navegador/app
2. HTTPS obrigatorio para geolocation
3. No Android, verificar permissoes no AndroidManifest.xml

---

## 7. ERROS DE PAGAMENTO

### "PIX timeout"
**Solucao:**
- QR Code expira em 30 minutos
- Gerar novo QR Code
- Verificar status no webhook

### "Saldo insuficiente"
**Solucao:**
- Adicionar creditos na carteira
- Usar outra forma de pagamento

### "Saque pendente"
**Solucao:**
- Aguardar aprovacao do admin
- Verificar dados bancarios

---

## 8. ERROS DE REALTIME

### "Realtime subscription failed"
**Solucao:**
1. Verificar se RLS permite SELECT
2. Verificar se tabela esta na publicacao
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE nome_tabela;
```

### Atualizacoes nao chegam
**Solucao:**
1. Verificar conexao WebSocket
2. Verificar se esta inscrito no canal correto
3. Verificar policies RLS

---

## 9. ERROS DE NOTIFICACAO

### Push notification nao chega
**Solucao:**
1. Verificar token FCM
2. Verificar FIREBASE_SERVER_KEY
3. Verificar permissoes no dispositivo
4. Testar no Firebase Console

### "FirebaseMessagingException"
**Solucao:**
1. Verificar google-services.json
2. Verificar SHA-1/SHA-256 no Firebase
3. Reinstalar app

---

## 10. COMANDOS UTEIS DE DEBUG

### Verificar conexao Supabase
```typescript
const { data, error } = await supabase.from('profiles').select('count');
console.log('Supabase:', data, error);
```

### Verificar usuario logado
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

### Verificar RLS
```sql
-- No Supabase SQL Editor
SELECT * FROM profiles WHERE id = 'USER_ID';
-- Se retornar vazio, RLS esta bloqueando
```

### Limpar cache Next.js
```bash
rm -rf .next
npm run dev
```

### Rebuild Android
```bash
cd android && ./gradlew clean && cd ..
npx cap sync android
npx cap build android
```

---

## 11. LOGS E MONITORAMENTO

### Vercel Logs
1. Acessar vercel.com
2. Ir no projeto
3. Clicar em "Logs"
4. Filtrar por "Error"

### Supabase Logs
1. Acessar supabase.com
2. Ir no projeto
3. Clicar em "Logs"
4. Ver "API", "Auth", "Database"

### Console do Navegador
- F12 > Console
- Filtrar por erros (vermelho)

---

## 13. ERROS NOS NOVOS MODULOS (v31)

### "corporate_accounts: permission denied"
**Solucao:**
- Apenas o dono da conta corporativa ou admin pode acessar
- Verificar se o user_id bate com o campo `owner_id` da tabela `corporate_accounts`

### Split de corrida nao notifica participantes
**Solucao:**
1. Verificar se os participantes aceitaram o convite na tabela `payment_split_members`
2. Status deve ser `'accepted'` para cobrar
3. Verificar se o `ride_id` esta correto

### Reembolso fica em "pendente" eternamente
**Solucao:**
- Reembolsos precisam de aprovacao manual do admin em `/admin/refunds`
- Verificar se existe admin com permissao de `can_approve_refunds`

### Feature flag nao ativa para o usuario
**Solucao:**
1. Verificar se `rollout_percentage` esta acima de 0 em `/admin/feature-flags`
2. Feature flags usam hash do user_id — nem todos os usuarios recebem na mesma hora
3. Flag de tipo `boolean` ativa para todos; tipo `percentage` usa distribuicao gradual

### Incentivo nao aparece para o motorista
**Solucao:**
1. Verificar datas `start_date` e `end_date` em `driver_incentives`
2. Campo `is_active = true` deve estar habilitado
3. Verificar `driver_level_required` — motorista precisa ter o nivel minimo

### Experimento A/B nao registra participante
**Solucao:**
- A tabela `ab_test_participants` so registra na primeira vez que o usuario acessa a feature
- Verificar se `experiment_id` existe e esta ativo em `pricing_experiments`

## 14. COMANDOS UTEIS v31

### Verificar tabelas novas
```sql
-- Verificar status das 192 tabelas
SELECT table_name, (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.table_name) AS rls_policies
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Verificar feature flags ativos
```sql
SELECT name, rollout_percentage, is_active, type
FROM feature_flags
WHERE is_active = true
ORDER BY name;
```

### Verificar incentivos ativos hoje
```sql
SELECT di.*, dp.full_name
FROM driver_incentives di
JOIN driver_profiles dp ON dp.user_id = di.driver_id
WHERE di.is_active = true
AND di.start_date <= NOW()
AND (di.end_date IS NULL OR di.end_date >= NOW());
```

---

## 15. SUPORTE

Se nenhuma solucao funcionar:

1. Verificar `/api/v1/health` para status das integracoes
2. Consultar `docs/STATUS.md` para ver metricas reais do projeto
3. Consultar `docs/API-REFERENCE.md` para payloads esperados
4. Contatar suporte: suporte@uppi.app

Se nenhuma solucao funcionar:

1. Verificar se o problema ja foi reportado no GitHub
2. Criar issue com:
   - Descricao do problema
   - Passos para reproduzir
   - Logs de erro
   - Versao do sistema/navegador
3. Contatar suporte: suporte@uppi.app
