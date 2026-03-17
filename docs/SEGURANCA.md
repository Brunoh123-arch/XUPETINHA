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

### Sessoes e Dispositivos
- Tabela `user_sessions` rastreia sessoes ativas
- Tabela `user_devices` registra dispositivos conhecidos
- Tabela `user_login_history` guarda historico de logins com IP
- Usuario pode encerrar sessoes remotas via /settings/security

---

## 2. AUTORIZACAO (RLS)

### Row Level Security — 192 tabelas, 100%
Todas as 192 tabelas tem RLS habilitado — **302 politicas configuradas**.

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
Todas as 98 rotas de API validam entrada com Zod:

```typescript
const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive().max(10000),
  phone: z.string().regex(/^\+55\d{10,11}$/),
  vehicle_type: z.enum(['economy', 'comfort', 'exec', 'moto', 'van']),
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
const LIMITS = {
  auth: { limit: 10, window: 60000 },           // 10 req/min
  public: { limit: 100, window: 60000 },        // 100 req/min
  authenticated: { limit: 1000, window: 60000 }, // 1000 req/min
};
```

---

## 6. SEGURANCA DO BANCO

### Limpeza de Duplicatas
- 88 tabelas duplicadas removidas em 16/03/2026
- Banco passou de ~280 para 192 tabelas unicas
- Reducao de superficie de ataque e complexidade desnecessaria

### Indices
- 508 indices configurados
- Todas as FKs indexadas (0 FKs sem indice)
- Performance e seguranca nos queries

---

## 7. SEGURANCA DO MOTORISTA

### Verificacao de Documentos
- CNH valida e vigente
- CRLV do veiculo
- Foto recente do rosto
- Verificacao de antecedentes criminais

### Aprovacao Manual
- Admin revisa todos os documentos via `/admin/verifications`
- Checklist de aprovacao com historico
- Tabela `driver_verifications` rastreia cada etapa
- Motorista so pode operar apos aprovacao completa

### Performance e Penalidades
- Tabela `driver_performance` monitora taxa de aceitacao/cancelamento
- Tabela `driver_penalties` registra punicoes com motivo e duracao
- Niveis Bronze/Prata/Ouro/Diamante incentivam bom comportamento

---

## 8. SEGURANCA DO PASSAGEIRO

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

### Disputas e Reembolsos
- Passageiro pode abrir disputa via `/ride/[id]/dispute`
- Tabela `ride_disputes` rastreia status e resolucao
- Solicitacoes de reembolso via `/ride/[id]/refund`
- Admin analisa e aprova/rejeita via `/admin/disputes` e `/admin/refunds`

---

## 9. SEGURANCA FINANCEIRA

### Transacoes
- Todas logadas em `wallet_transactions`
- Valores validados (sem negativos por CHECK constraint)
- Saldo verificado antes de qualquer debito
- Audit trail completo imutavel

### Divisao de Pagamento
- Tabela `payment_splits` com status por membro
- Cada participante em `payment_split_members`
- Expirar splits nao concluidos automaticamente

### Saques
- Verificacao de identidade obrigatoria
- Limite diario configuravel
- Aprovacao manual via admin para valores altos
- PIX apenas para chave cadastrada e verificada

---

## 10. CONTROLE DE ACESSO ADMIN

### Roles e Permissoes
- Tabela `admin_roles` define papeis (super, financeiro, suporte, ops)
- Tabela `admin_permissions` define permissoes granulares por role
- Tabela `admin_users` usuarios admin separados do `profiles`
- Tabela `admin_actions` registra todas as acoes administrativas

### Auditoria
- Cada acao admin e registrada com timestamp, IP e dados modificados
- Visivel em `/admin/team` na aba de auditoria

---

## 11. STORAGE

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
CREATE POLICY "driver_documents_policy" ON storage.objects
  FOR ALL USING (
    bucket_id = 'driver-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 12. LOGS E AUDITORIA

### Tabelas de Log
- `error_logs` — Erros do sistema
- `admin_actions` — Acoes de admins
- `audit_logs` — Auditoria geral
- `webhook_deliveries` — Chamadas de webhook
- `sms_logs` + `sms_deliveries` — SMS enviados
- `push_log` — Push notifications
- `user_activity_log` — Atividades do usuario
- `user_login_history` — Historico de logins com IP

---

## 13. VARIAVEIS DE AMBIENTE CRITICAS

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

## 14. CHECKLIST DE SEGURANCA

### Implementado
- [x] RLS em 192/192 tabelas (100%)
- [x] 302 politicas de seguranca configuradas
- [x] Criptografia AES-256-GCM para dados sensiveis
- [x] Validacao com Zod em todas as 98 APIs
- [x] Rate limiting por IP e por usuario
- [x] HTTPS obrigatorio (Vercel)
- [x] Logs de auditoria ativos
- [x] Backup automatico Supabase
- [x] Politicas de storage configuradas
- [x] CHECK constraints em valores financeiros
- [x] Nenhuma FK sem indice no banco
- [x] 88 tabelas duplicadas removidas
- [x] Sessoes e dispositivos rastreados
- [x] Disputas e reembolsos com workflow de aprovacao
- [x] Roles e permissoes granulares para admins

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
