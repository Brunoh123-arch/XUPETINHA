# Scripts SQL - UPPI

**Ultima Atualizacao:** 16/03/2026

---

## Status Atual

O banco de dados Supabase (ullmjdgppucworavoiia) ja esta 100% configurado com:
- 164 tabelas
- 280 politicas RLS
- 483 indices
- 38 migrations aplicadas

---

## Arquivos Importantes

| Arquivo | Descricao | Usar? |
|---------|-----------|-------|
| `database-master.sql` | Documentacao do schema completo | Apenas referencia |

---

## Scripts Obsoletos

Os seguintes scripts foram consolidados e NAO devem ser executados:

- 000-migration-consolidada.sql
- 001-*.sql (todos)
- 002-*.sql (todos)
- 003-*.sql (todos)
- 004-*.sql (todos)
- 005-*.sql (todos)
- 006-*.sql (todos)
- 007-*.sql (todos)
- 008-*.sql (todos)
- 009-*.sql (todos)
- 01-*.sql (todos)
- 010-*.sql (todos)
- 011-*.sql (todos)
- 012-*.sql (todos)
- 016-*.sql (todos)
- 017-*.sql (todos)
- 02-*.sql (todos)
- 03-*.sql (todos)
- 04-*.sql (todos)
- 05-*.sql (todos)
- 050-*.sql (todos)
- 051-*.sql (todos)
- 06-*.sql (todos)
- 07-*.sql (todos)
- 08-*.sql (todos)
- add-*.sql (todos)
- admin-*.sql (todos)
- create-*.sql (todos)
- enable-*.sql (todos)
- final-*.sql (todos)
- fix-*.sql (todos)
- migration-part-*.sql (todos)
- promote-*.sql (todos)
- push-*.sql (todos)
- rename-*.sql (todos)
- seed-*.sql (todos)
- setup-*.sql (todos)
- SETUP-*.sql (todos)
- verify-*.sql (todos)

---

## IMPORTANTE

**NAO execute nenhum script no banco atual.**

O banco ullmjdgppucworavoiia ja tem tudo configurado. As migrations foram aplicadas diretamente via Supabase Dashboard.

Para criar um NOVO banco, use as migrations em `supabase/migrations/` (se existirem) ou configure manualmente via Dashboard.

---

## Limpeza Recomendada

Voce pode deletar todos os arquivos .sql obsoletos listados acima. Mantenha apenas:
- `database-master.sql` (documentacao)
- `README.md` (este arquivo)
