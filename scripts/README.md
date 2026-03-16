# Scripts SQL - UPPI

**Ultima Atualizacao:** 16/03/2026

---

## Status: BANCO 100% CONFIGURADO

O banco Supabase ja esta completo com:
- 164 tabelas
- 280 politicas RLS
- 483 indices
- 579 CHECK constraints
- 222 Foreign Keys
- 52 triggers
- 762 funcoes
- 22 tabelas Realtime
- 5 Storage Buckets

**NAO execute scripts** - tudo ja funciona.

---

## Arquivos

| Script | Uso |
|--------|-----|
| `database-master.sql` | Documentacao/referencia |
| `create-first-admin.sql` | Criar primeiro admin |
| `promote-admin.sql` | Promover usuario a admin |

---

## Criar Admin

No SQL Editor do Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com';
```
