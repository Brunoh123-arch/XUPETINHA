-- Tabela de logs de erros (substitui o Sentry)
create table if not exists public.error_logs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  level         text not null default 'error' check (level in ('error', 'warning', 'info')),
  message       text not null,
  stack         text,
  context       jsonb,
  url           text,
  user_id       uuid references auth.users(id) on delete set null,
  user_agent    text,
  app_version   text,
  resolved      boolean not null default false,
  resolved_at   timestamptz,
  resolved_by   uuid references auth.users(id) on delete set null
);

-- Índices para consultas frequentes no painel admin
create index if not exists error_logs_created_at_idx on public.error_logs (created_at desc);
create index if not exists error_logs_level_idx       on public.error_logs (level);
create index if not exists error_logs_user_id_idx     on public.error_logs (user_id);
create index if not exists error_logs_resolved_idx    on public.error_logs (resolved);

-- Habilita RLS
alter table public.error_logs enable row level security;

-- Qualquer usuário autenticado (ou anônimo via service role) pode INSERIR erros
create policy "Qualquer um pode inserir logs de erro"
  on public.error_logs for insert
  with check (true);

-- Apenas admins podem LER logs de erro
create policy "Admins podem ler logs de erro"
  on public.error_logs for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

-- Apenas admins podem ATUALIZAR (marcar como resolvido)
create policy "Admins podem atualizar logs de erro"
  on public.error_logs for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );
