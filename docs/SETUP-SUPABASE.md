# Guia de Setup - Supabase

**Data:** 16/03/2026

---

## Status Atual

O projeto ja esta conectado ao Supabase:
- **Projeto:** ullmjdgppucworavoiia
- **Tabelas:** 164
- **RLS:** 163/164 com politicas ativas
- **Realtime:** 22 tabelas
- **Storage:** 5 buckets

**NAO e necessario criar novo projeto.** O banco ja esta 100% configurado.

---

## Variaveis de Ambiente

As seguintes variaveis ja estao configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ullmjdgppucworavoiia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Para Criar Novo Projeto (Opcional)

Se precisar criar um novo projeto Supabase:

### 1. Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as chaves API

### 2. Habilitar Extensoes
No SQL Editor, execute:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 3. Executar Migrations
Execute as migrations na ordem numerica (001, 002, ..., 038).

### 4. Configurar Storage
Criar os 5 buckets:
- avatars (public)
- driver-documents (private)
- vehicle-photos (private)
- ride-recordings (private)
- support-attachments (private)

### 5. Atualizar Variaveis
Atualizar as variaveis de ambiente no Vercel.

---

## Verificar Conexao

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data, error } = await supabase.from('profiles').select('count')
console.log('Conexao OK:', data)
```

---

## Documentos Relacionados

- `docs/STATUS.md` - Status completo do projeto
- `docs/SCHEMA-BANCO.md` - Schema do banco de dados
- `scripts/database-master.sql` - Documentacao do schema SQL
