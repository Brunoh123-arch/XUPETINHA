# Seguranca e RLS — Uppi

**Atualizado em:** 10/03/2026

## Resumo

| Metrica | Valor |
|---------|-------|
| Tabelas com RLS | **86 de 100** (exceto spatial_ref_sys e novas) |
| Politicas RLS | **162** |
| Tabelas com Realtime | **51** |

## Row Level Security (RLS)

86 tabelas tem RLS habilitado. Nenhum usuario pode acessar dados de outro usuario diretamente via Supabase client.

### Padrao de Politicas

**Passageiro — acesso proprio:**
```sql
-- Exemplo: rides
CREATE POLICY "rides_passenger" ON rides
  FOR SELECT USING (passenger_id = auth.uid());
```

**Motorista — acesso as suas corridas:**
```sql
CREATE POLICY "rides_driver" ON rides
  FOR SELECT USING (driver_id = auth.uid());
```

**Admin — acesso total:**
```sql
CREATE POLICY "rides_admin" ON rides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
```

---

## Autenticacao

### Fluxo JWT
1. Login via Supabase Auth (email + senha)
2. Supabase emite JWT com `sub = user_id`
3. JWT salvo em cookie HTTP-only via `proxy.ts`
4. Cada request server-side cria `createServerClient` com o cookie
5. `supabase.auth.getUser()` valida o JWT antes de qualquer query

### proxy.ts (Next.js 16)
```typescript
// Verifica sessao em toda request
export default async function proxy(request: NextRequest) {
  // Atualiza cookie de sessao automaticamente
  await supabase.auth.getUser()
  return supabaseResponse
}
```

---

## Protecao das APIs

### Validacao de usuario nas rotas
```typescript
// Padrao usado em todas as APIs
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
}
```

### Validacao de admin
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('user_type')
  .eq('id', user.id)
  .single()

if (profile?.user_type !== 'admin') {
  return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
}
```

---

## Variaveis Sensiveis

| Variavel | Exposicao | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publica (cliente) | Queries com RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | SECRETA (server only) | Bypass RLS em webhooks |
| `FIREBASE_SERVER_KEY` | SECRETA (server only) | Enviar push FCM |
| `PARADISE_API_KEY` | SECRETA (server only) | Cobranças PIX |
| `GOOGLE_MAPS_API_KEY` | Publica com restricoes | Maps, Places |

---

## Protecao de Dados

- Senhas: nunca armazenadas — Supabase Auth usa bcrypt
- Dados de cartao: nao armazenados — tokenizados pela Paradise
- CPF/documentos: armazenados criptografados no Supabase
- Logs de localizacao: retidos por 30 dias

---

## Webhook Security (Paradise PIX)

```typescript
// Validacao HMAC do webhook Paradise
const signature = request.headers.get('x-paradise-signature')
const body = await request.text()
const expected = crypto
  .createHmac('sha256', process.env.PARADISE_API_KEY!)
  .update(body)
  .digest('hex')

if (signature !== expected) {
  return NextResponse.json({ error: 'Assinatura invalida' }, { status: 401 })
}
```

---

## Checklist de Seguranca para Producao

- [x] RLS habilitado em 86 de 100 tabelas (162 policies)
- [x] JWT validado em todas as APIs via `supabase.auth.getUser()`
- [x] Service role key apenas server-side (nunca exposta no client)
- [x] Webhook PIX com validacao HMAC (Paradise Gateway)
- [x] Queries com Supabase client (sem SQL injection)
- [x] Tabela `admin_logs` para auditoria de acoes admin
- [x] Tabela `error_logs` para monitoramento de erros
- [ ] Configurar dominio customizado (HTTPS automatico)
- [ ] Ativar 2FA para conta admin (tabela `user_2fa` existe)
- [ ] Revisar RLS policies trimestralmente
- [ ] Configurar alertas de anomalia no Supabase Dashboard
