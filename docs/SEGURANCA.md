# SEGURANCA DO PROJETO UPPI

> Ultima atualizacao: 16/03/2026

## VISAO GERAL

O UPPI implementa multiplas camadas de seguranca para proteger dados de usuarios, motoristas e transacoes financeiras.

---

## 1. AUTENTICACAO

### Supabase Auth
- JWT tokens com expiracao
- Refresh tokens seguros
- Session management automatico

### OTP (One-Time Password)
- Codigo de 6 digitos
- Expira em 10 minutos
- Maximo 5 tentativas
- Rate limiting por IP

### 2FA (Autenticacao de 2 Fatores)
- TOTP (Google Authenticator, Authy)
- Codigos de backup
- Opcional para usuarios, obrigatorio para admins

---

## 2. AUTORIZACAO (RLS)

### Row Level Security
Todas as 164 tabelas tem RLS habilitado.

**Exemplo - Tabela `profiles`:**
```sql
-- Usuario so ve seu proprio perfil
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuario so edita seu proprio perfil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

**Exemplo - Tabela `rides`:**
```sql
-- Passageiro ve suas corridas
CREATE POLICY "rides_passenger" ON rides
  FOR SELECT USING (auth.uid() = passenger_id);

-- Motorista ve corridas atribuidas a ele
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
- CPF
- Segredos 2FA
- Chaves de webhook
- Tokens de API

### Implementacao
```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  // ... criptografa e retorna
}

export function decrypt(encrypted: string): string {
  // ... decriptografa e retorna
}
```

### Gerar Chave de Criptografia
```bash
openssl rand -base64 32
```

---

## 4. VALIDACAO DE ENTRADA

### APIs
Todas as APIs validam entrada com Zod:

```typescript
const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive().max(10000),
  phone: z.string().regex(/^\+55\d{11}$/),
});
```

### Banco de Dados
CHECK constraints validam dados:

```sql
-- Valores financeiros devem ser >= 0
ALTER TABLE wallets ADD CONSTRAINT wallet_balance_positive
  CHECK (balance >= 0);

-- Status validos
ALTER TABLE rides ADD CONSTRAINT valid_status
  CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled'));
```

---

## 5. PROTECAO CONTRA ATAQUES

### SQL Injection
- Queries parametrizadas (Supabase client)
- Nunca concatenar strings em SQL

### XSS (Cross-Site Scripting)
- React escapa automaticamente
- CSP headers configurados
- Sanitizacao de HTML

### CSRF (Cross-Site Request Forgery)
- Supabase Auth usa cookies HttpOnly
- SameSite=Strict

### Rate Limiting
```typescript
// APIs criticas tem rate limiting
const rateLimit = new Map();
const LIMIT = 10; // requests
const WINDOW = 60000; // 1 minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  const recent = requests.filter(t => now - t < WINDOW);
  if (recent.length >= LIMIT) return false;
  recent.push(now);
  rateLimit.set(ip, recent);
  return true;
}
```

---

## 6. SEGURANCA DO MOTORISTA

### Verificacao de Documentos
- CNH valida e vigente
- CRLV do veiculo
- Foto recente
- Verificacao de antecedentes criminais

### Aprovacao Manual
- Admin revisa todos os documentos
- Checklist de aprovacao
- Historico de verificacoes

---

## 7. SEGURANCA DO PASSAGEIRO

### Compartilhamento de Corrida
- Envia link para contatos de emergencia
- Mostra localizacao em tempo real
- Dados do motorista e veiculo

### Botao SOS
- Aciona emergencia com 1 toque
- Notifica contatos de emergencia
- Grava audio automaticamente
- Admin recebe alerta

### Gravacao de Audio
- Opcional durante corrida
- Armazenado criptografado
- Disponivel para disputas

---

## 8. SEGURANCA FINANCEIRA

### Transacoes
- Todas logadas
- Valores validados
- Saldo verificado antes de debito
- Audit trail completo

### Saques
- Verificacao de identidade
- Limite diario
- Aprovacao manual para valores altos
- PIX apenas para conta verificada

---

## 9. STORAGE

### Buckets e Permissoes

| Bucket | Publico | Uso |
|--------|---------|-----|
| avatars | Sim | Fotos de perfil |
| driver-documents | Nao | CNH, CRLV |
| vehicle-photos | Nao | Fotos do veiculo |
| ride-recordings | Nao | Gravacoes de audio |
| support-attachments | Nao | Prints de suporte |

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
- `error_logs` - Erros do sistema
- `admin_actions` - Acoes de admin
- `webhook_logs` - Chamadas de webhook
- `sms_logs` - SMS enviados
- `email_logs` - Emails enviados
- `push_logs` - Push notifications

### Informacoes Logadas
- Timestamp
- Usuario
- Acao
- IP
- User Agent
- Dados da acao

---

## 11. AMBIENTE

### Variaveis de Ambiente
- Nunca commitar .env
- Usar Vercel Environment Variables
- Rotacionar chaves periodicamente

### Separacao de Ambientes
- Development: dados de teste
- Staging: replica de producao
- Production: dados reais

---

## 12. CHECKLIST DE SEGURANCA

### Antes de Publicar
- [x] RLS em todas as tabelas
- [x] Criptografia de dados sensiveis
- [x] Validacao de entrada em todas as APIs
- [x] Rate limiting configurado
- [x] HTTPS obrigatorio
- [x] Logs de auditoria ativos
- [x] Backup automatico do banco
- [x] Politicas de storage configuradas

### Periodicamente
- [ ] Rotacionar ENCRYPTION_KEY
- [ ] Revisar logs de erro
- [ ] Atualizar dependencias
- [ ] Penetration testing
- [ ] Revisar acessos de admin

---

## CONTATO DE SEGURANCA

Para reportar vulnerabilidades:
- Email: security@uppi.app
- Programa de Bug Bounty (em breve)
