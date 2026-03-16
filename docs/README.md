# UPPI - Documentacao

**Ultima Atualizacao:** 16/03/2026

---

## Documentos Disponiveis

| Documento | Descricao |
|-----------|-----------|
| [STATUS.md](./STATUS.md) | Status atual do projeto, auditoria completa |
| [GUIA-PUBLICACAO-PLAY-STORE.md](./GUIA-PUBLICACAO-PLAY-STORE.md) | Passo a passo para publicar na Play Store |
| [SETUP-SUPABASE.md](./SETUP-SUPABASE.md) | Como configurar novo projeto Supabase |
| [SCHEMA-BANCO.md](./SCHEMA-BANCO.md) | Documentacao completa do banco de dados |
| [EMAIL-TEMPLATES.md](./EMAIL-TEMPLATES.md) | Templates de email personalizados |
| [DEEP_LINKS_SETUP.md](./DEEP_LINKS_SETUP.md) | Configuracao de deep links Android/iOS |
| [SPLASH_ICON_SETUP.md](./SPLASH_ICON_SETUP.md) | Icones e splash screen |

---

## Resumo do Projeto

| Item | Quantidade |
|------|------------|
| Tabelas | 164 |
| RLS Ativo | 163/164 (99.4%) |
| Realtime | 22 tabelas |
| APIs | 99 rotas |
| Componentes | 215 |
| Paginas | 162 |

---

## Stack Tecnologica

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Mobile:** Capacitor 8 (Android)
- **Mapas:** Google Maps
- **Pagamentos:** PIX (Paradise Gateway)
- **Push:** Firebase Cloud Messaging

---

## Scripts SQL

Os scripts SQL estao organizados em:

```
scripts/
  database-master.sql    # Script consolidado completo
  seed-data.sql          # Dados de teste
```

Para configurar um novo banco, execute apenas `database-master.sql`.
