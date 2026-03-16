# SEGURANCA DO PROJETO UPPI

> Ultima atualizacao: 16/03/2026

## VISAO GERAL

O UPPI implementa multiplas camadas de seguranca para proteger dados de usuarios, motoristas e transacoes financeiras.

---

## 1. AUTENTICACAO

### Supabase Auth
- JWT tokens com expiracao configuravel
- Refresh tokens seguros (HttpOnly cookies)
- Session management automatico

### OTP (One-Time Password)
- Codigo de 6 digitos
- Expira em 10 minutos
- Maximo 5 tentativas
- Rate limiting por IP (10 req/min)

### 2FA (Autenticacao de 2 Fatores)
- TOTP compativel com Google Authenticator e Authy
- Codigos de backup (8 codigos de uso unico)
- Opcional para usuarios, obrigatorio para admins
- Secret criptografado com AES-256-GCM no banco

---

## 2. AUTORIZACAO (RLS)

### Row Level Security — 275 tabelas, 100%
Todas as 275 tabelas tem RLS habilitado.

**Exemplo — Tabela `profiles`:**
```sql
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

**Exemplo — Tabela `rides`:**
```sql
CREATE POLICY "rides_passenger" ON rides
  FOR SELECT USING (auth.uid() = passenger_id);

CREATE POLICY "rides_driver" ON rides
  FOR SELECT USING (auth.uid() = driver_id);
```

### Politicas por Tipo de Tabela

| Tipo | Politica |
|------|----------|
| Dados pessoais | Apenas dono acessa |
| Corridas | Passageiro + Motorista envolvido |
| Financeiro | Apenas dono + Admin |
| Lookup tables | Leitura publica, escrita admin |
| Admin tables | Apenas admins |

---

## 3. CRIPTOGRAFIA

### Dados Sensiveis Criptografados
- CPF — `profiles.cpf`
- Segredo 2FA — `user_2fa.secret`
- Chave de webhook — `webhook_endpoints.secret`

### Implementacao
```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  // ... criptografa e retorna com iv + authTag
}

export function decrypt(encrypted: string): string {
  // ... decriptografa e retorna texto original
}
```

### Gerar Chave de Criptografia
```bash
openssl rand -base64 32
```

Adicionar como `ENCRYPTION_KEY` nas variaveis de ambiente do Vercel.

---

## 4. VALIDACAO DE ENTRADA

### APIs — Zod
Todas as 100 rotas de API validam entrada com Zod:

```typescript
const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive().max(10000),
  phone: z.string().regex(/^\+55\d{10,11}$/),
  vehicle_type: z.enum(['standard', 'premium', 'electric', 'moto']),
});
```

### Banco de Dados — CHECK Constraints

```sql
-- Valores financeiros nao podem ser negativos
ALTER TABLE wallets ADD CONSTRAINT wallet_balance_positive CHECK (balance >= 0);

-- Status validos
ALTER TABLE rides ADD CONSTRAINT valid_status
  CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled'));

-- Avaliacoes de 1 a 5
ALTER TABLE reviews ADD CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5);
```

---

## 5. PROTECAO CONTRA ATAQUES

### SQL Injection
- Queries parametrizadas via Supabase client
- Nunca concatenar strings em SQL diretamente

### XSS (Cross-Site Scripting)
- React escapa automaticamente conteudo JSX
- Headers CSP configurados no Next.js
- Sanitizacao de HTML em inputs livres

### CSRF (Cross-Site Request Forgery)
- Supabase Auth usa cookies HttpOnly com SameSite=Strict
- Tokens Bearer validados server-side

### Rate Limiting
```typescript
// Implementado em cada rota critica
const LIMITS = {
  auth: { limit: 10, window: 60000 },      // 10 req/min
  public: { limit: 100, window: 60000 },   // 100 req/min
  authenticated: { limit: 1000, window: 60000 }, // 1000 req/min
};
```

---

## 6. SEGURANCA DO MOTORISTA

### Verificacao de Documentos
- CNH valida e vigente
- CRLV do veiculo
- Foto recente do rosto
- Verificacao de antecedentes criminais

### Aprovacao Manual
- Admin revisa todos os documentos via `/admin/drivers`
- Checklist de aprovacao com historico
- Motorista so pode operar apos aprovacao completa

---

## 7. SEGURANCA DO PASSAGEIRO

### Compartilhamento de Corrida
- Link em tempo real para contatos de emergencia
- Exibe localizacao GPS do motorista
- Mostra nome, foto, placa e avaliacao do motorista

### Botao SOS
- Aciona emergencia com 1 toque via `/uppi/emergency`
- Notifica contatos de emergencia cadastrados
- Grava audio automaticamente (com consentimento)
- Admin recebe alerta em tempo real via `/admin/emergency`

### Gravacao de Audio
- Opt-in pelo usuario em `/uppi/settings/recording`
- Armazenada criptografada no bucket `ride-recordings` (privado)
- Disponivel apenas para revisao em disputas

### Trust Score
- Score de confianca calculado automaticamente
- Baseado em: avaliacoes, tempo de uso, comportamento
- Visivel para o usuario em `/uppi/trust-score`

---

## 8. SEGURANCA FINANCEIRA

### Transacoes
- Todas logadas em `wallet_transactions` e `pix_transactions`
- Valores validados (sem negativos por CHECK constraint)
- Saldo verificado antes de qualquer debito
- Audit trail completo imutavel

### Saques
- Verificacao de identidade obrigatoria
- Limite diario configuravel
- Aprovacao manual via admin para valores altos
- PIX apenas para chave cadastrada e verificada

---

## 9. STORAGE

### Buckets e Permissoes

| Bucket | Publico | Uso |
|--------|---------|-----|
| `avatars` | SIM | Fotos de perfil |
| `driver-documents` | NAO | CNH, CRLV |
| `vehicle-photos` | NAO | Fotos do veiculo |
| `ride-recordings` | NAO | Gravacoes de audio |
| `support-attachments` | NAO | Anexos de suporte |

### Politicas de Storage
```sql
-- Usuarios so acessam seus proprios documentos
CREATE POLICY "driver_documents_policy" ON storage.objects
  FOR ALL USING (
    bucket_id = 'driver-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 10. LOGS E AUDITORIA

### Tabelas de Log
- `error_logs` — Erros do sistema
- `admin_logs` — Acoes de admin
- `webhook_deliveries` — Chamadas de webhook
- `sms_logs` + `sms_deliveries` — SMS enviados
- `push_log` — Push notifications
- `user_activity_log` — Atividades do usuario

### Informacoes Logadas
- Timestamp exato
- ID do usuario
- Tipo de acao
- IP de origem
- User Agent
- Dados da acao

---

## 11. VARIAVEIS DE AMBIENTE CRITICAS

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `ENCRYPTION_KEY` | Chave AES-256 para CPF/2FA | **SIM** |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin Supabase | **SIM** |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto | **SIM** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publica | **SIM** |
| `FIREBASE_SERVER_KEY` | FCM push notifications | Para producao |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapas e geocoding | Para producao |
| `PARADISE_API_KEY` | Gateway PIX | Para producao |

---

## 12. CHECKLIST DE SEGURANCA

### Implementado
- [x] RLS em 275/275 tabelas (100%)
- [x] Criptografia AES-256-GCM para dados sensiveis
- [x] Validacao com Zod em todas as 100 APIs
- [x] Rate limiting por IP e por usuario
- [x] HTTPS obrigatorio (Vercel)
- [x] Logs de auditoria ativos
- [x] Backup automatico Supabase
- [x] Politicas de storage configuradas
- [x] CHECK constraints em valores financeiros
- [x] Nenhuma FK sem indice no banco

### Periodicamente
- [ ] Rotacionar ENCRYPTION_KEY a cada 6 meses
- [ ] Revisar logs de erro semanalmente
- [ ] Atualizar dependencias npm mensalmente
- [ ] Penetration testing antes de publicacao

---

## CONTATO DE SEGURANCA

Para reportar vulnerabilidades:
- Email: security@uppi.app
- Programa de Bug Bounty (em breve)
