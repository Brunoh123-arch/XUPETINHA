# FUNCIONALIDADES DO APP UPPI

> Ultima atualizacao: 16/03/2026 — Versao 31.0

## VISAO GERAL

O UPPI e um app de mobilidade urbana completo com 3 perfis de usuario:
- **Passageiro** — Solicita corridas, entregas, viagens intermunicipais
- **Motorista** — Aceita e realiza corridas
- **Admin** — Gerencia a plataforma

---

## FUNCIONALIDADES DO PASSAGEIRO

### Autenticacao
- [x] Login com email + OTP (codigo de 6 digitos)
- [x] Login com telefone + SMS
- [x] Cadastro de novo usuario
- [x] Recuperacao de senha
- [x] Autenticacao 2FA (TOTP — Google Authenticator, Authy)
- [x] Codigos de backup 2FA
- [x] Logout

### Solicitar Corrida
- [x] Buscar endereco de origem (geolocalizacao automatica)
- [x] Buscar endereco de destino (autocomplete Google)
- [x] Ver estimativa de preco por tipo de veiculo
- [x] Escolher tipo de veiculo (Standard, Premium, Electric, Moto)
- [x] Escolher forma de pagamento (PIX, Cartao, Dinheiro, Carteira)
- [x] Aplicar cupom de desconto
- [x] Agendar corrida para data/hora futura (/ride/schedule)
- [x] Corrida em grupo — dividir com amigos (/ride/group)
- [x] Rotas alternativas (/ride/route-alternatives)
- [x] Corrida em leilao — negociacao por lances (/ride/auction)

### Servicos Extras
- [x] Entregas de pacotes (/uppi/entregas)
- [x] Viagens intermunicipais (/uppi/cidade-a-cidade)

### Negociacao de Preco
- [x] Fazer contra-oferta ao motorista
- [x] Ver ofertas de motoristas proximos (/ride/[id]/offers)
- [x] Aceitar/rejeitar ofertas
- [x] Negociacao em tempo real via Supabase Realtime

### Durante a Corrida
- [x] Rastreamento em tempo real no mapa (/ride/[id]/tracking)
- [x] Ver dados do motorista (nome, foto, placa, avaliacao) (/ride/[id]/driver-profile)
- [x] Chat com motorista (/ride/[id]/chat)
- [x] Compartilhar corrida com contatos (/ride/[id]/share)
- [x] Botao de emergencia SOS (/uppi/emergency)
- [x] Gravacao de audio da corrida
- [x] Cancelar corrida (/ride/[id]/cancel)

### Apos a Corrida
- [x] Avaliar motorista — estrelas + comentario (/ride/[id]/rate)
- [x] Avaliacao simples (/ride/[id]/review)
- [x] Avaliacao detalhada por categorias (/ride/[id]/review-enhanced)
- [x] Dar gorjeta ao motorista (/ride/[id]/payment)
- [x] Ver recibo detalhado (/ride/[id]/receipt)
- [x] Ver detalhes da corrida (/ride/[id]/details)
- [x] Dividir corrida entre amigos (/ride/[id]/split) — NOVO
- [x] Abrir disputa sobre a corrida (/ride/[id]/dispute) — NOVO
- [x] Solicitar reembolso (/ride/[id]/refund) — NOVO
- [x] Denunciar motorista (/ride/[id]/report) — NOVO
- [x] Contratar seguro de viagem (/ride/[id]/insurance) — NOVO
- [x] Avaliar experiencia de viagem (/ride/[id]/experience) — NOVO

### Pagamentos
- [x] Pagar com PIX (QR Code + copia-e-cola)
- [x] Pagar com cartao de credito
- [x] Pagar com dinheiro
- [x] Pagar com saldo da carteira
- [x] Ver historico de pagamentos (/uppi/payments)

### Carteira Digital
- [x] Ver saldo (/uppi/wallet)
- [x] Adicionar creditos via PIX
- [x] Ver extrato de transacoes
- [x] Cashback automatico

### Pontos e Recompensas — NOVO
- [x] Ver saldo de pontos e historico (/uppi/points)
- [x] Ver cashback ganho por corrida
- [x] Colecionar emblemas (badges)
- [x] Clube de fidelidade com niveis (/uppi/club)
- [x] Conquistas desbloqueadas (/uppi/achievements)
- [x] Leaderboard (/uppi/leaderboard)

### Perfil e Configuracoes
- [x] Editar nome, foto, telefone (/uppi/profile)
- [x] Gerenciar enderecos favoritos (/uppi/favorites, /uppi/favorites/add)
- [x] Motoristas favoritos (/uppi/favorites/drivers)
- [x] Contatos de emergencia (/uppi/emergency-contacts, /uppi/settings/emergency)
- [x] Gerenciar membros da familia (/uppi/family)
- [x] Preferencias de viagem (/uppi/settings/preferences) — NOVO
- [x] Preferencias de notificacao
- [x] Preferencias de SMS (/uppi/settings/sms)
- [x] Preferencias de gravacao (/uppi/settings/recording)
- [x] Sessoes e dispositivos ativos (/uppi/settings/security) — NOVO
- [x] Usuarios bloqueados (/uppi/settings/blocked) — NOVO
- [x] Ativar/desativar 2FA (/uppi/settings/2fa)
- [x] Alterar senha (/uppi/settings/password)
- [x] Alterar idioma (/uppi/settings/language)
- [x] Modo escuro
- [x] Deletar conta (LGPD)

### Social e Gamificacao
- [x] Ver feed de posts (/uppi/social)
- [x] Criar posts com foto (/uppi/social/create)
- [x] Curtir e comentar
- [x] Seguir outros usuarios
- [x] Ver leaderboard (/uppi/leaderboard)
- [x] Conquistas e badges (/uppi/achievements, /uppi/points)
- [x] Programa de indicacao (/uppi/referral, /uppi/referrals)
- [x] Club de fidelidade (/uppi/club)
- [x] Trust Score (/uppi/trust-score)

### Corporativo — NOVO
- [x] Ver conta corporativa da empresa (/uppi/corporate)
- [x] Acompanhar limite mensal de corridas
- [x] Ver funcionarios cadastrados
- [x] Ver faturas mensais da empresa

### Suporte e Legal
- [x] Chat com suporte (/uppi/suporte/chat)
- [x] FAQ (/uppi/help)
- [x] Abrir ticket (/uppi/suporte, /uppi/support)
- [x] Enviar feedback sobre o app (/uppi/feedback) — NOVO
- [x] Politica de privacidade (/uppi/privacy, /uppi/legal/privacy)
- [x] Termos de uso (/uppi/terms, /uppi/legal/terms)

### Notificacoes
- [x] Ver todas as notificacoes (/uppi/notifications)
- [x] Marcar como lidas
- [x] Push notifications via Firebase

### Seguranca
- [x] Botao de emergencia SOS (/uppi/seguranca)
- [x] Historico de corridas (/uppi/history)
- [x] Agendamentos (/uppi/schedule)
- [x] Analytics pessoal (/uppi/analytics)

---

## FUNCIONALIDADES DO MOTORISTA

### Cadastro e Verificacao
- [x] Cadastro como motorista (/uppi/driver/register)
- [x] Upload de documentos (CNH, CRLV, foto) (/uppi/driver/documents)
- [x] Cadastro do veiculo (/uppi/driver/vehicle) — NOVO
- [x] Verificacao de antecedentes
- [x] Aprovacao pelo admin (/uppi/driver/verify)

### Modo Motorista
- [x] Ativar/desativar modo online (/uppi/driver-mode)
- [x] Ver corridas disponiveis
- [x] Aceitar/rejeitar corridas (/uppi/driver/ride/[id]/accept)
- [x] Fazer oferta de preco
- [x] Navegar ate o passageiro
- [x] Iniciar corrida (/uppi/driver/ride/[id]/active)
- [x] Navegar ate o destino
- [x] Finalizar corrida (/uppi/driver/ride/[id]/summary)
- [x] Home do motorista (/uppi/driver/home)

### Ganhos e Financeiro
- [x] Ver ganhos do dia/semana/mes (/uppi/driver/earnings)
- [x] Ver detalhamento por corrida
- [x] Solicitar saque PIX (/uppi/driver/wallet)
- [x] Ver historico de saques
- [x] Ver incentivos ativos (/uppi/driver/incentives) — NOVO
- [x] Relatorio fiscal / declaracao IR (/uppi/driver/tax) — NOVO

### Performance e Niveis — NOVO
- [x] Ver score de desempenho (/uppi/driver/performance)
- [x] Ver nivel atual (Bronze/Prata/Ouro/Diamante)
- [x] Progresso para proximo nivel
- [x] Metricas: taxa de aceitacao, conclusao, pontualidade
- [x] Historico de turnos

### Preferencias e Configuracoes — NOVO
- [x] Preferencias de corridas (pets, malas, silencio) (/uppi/driver/preferences)
- [x] Zonas de trabalho preferidas
- [x] Preferencias de tipos de corrida

### Avaliacoes
- [x] Ver media de avaliacao (/uppi/driver/ratings)
- [x] Ver comentarios recebidos
- [x] Avaliar passageiros

### Ferramentas
- [x] Mapa de zonas quentes (/uppi/driver/hot-zones)
- [x] Historico de corridas (/uppi/driver/history)
- [x] Agenda de turnos (/uppi/driver/schedule)
- [x] Configuracoes do motorista (/uppi/driver/settings)
- [x] Perfil do motorista (/uppi/driver/profile)
- [x] Treinamentos obrigatorios e opcionais (/uppi/driver/training) — NOVO

---

## FUNCIONALIDADES DO ADMIN (59 paginas)

### Dashboard
- [x] Metricas em tempo real (/admin)
- [x] Total de corridas, receita, usuarios ativos
- [x] Monitor em tempo real (/admin/monitor)
- [x] Analytics completo (/admin/analytics)

### Gestao de Usuarios
- [x] Listar todos os usuarios (/admin/users)
- [x] Ver, editar, banir usuarios
- [x] Gestao de motoristas (/admin/drivers)
- [x] Ganhos dos motoristas (/admin/drivers/earnings, /admin/driver-earnings)
- [x] Verificacao de documentos dos motoristas (/admin/verifications) — NOVO
- [x] Performance individual do motorista (/admin/drivers/[id]/performance) — NOVO

### Gestao de Corridas
- [x] Todas as corridas (/admin/rides)
- [x] Detalhe de cada corrida (/admin/rides/[id])
    - [x] Corridas em grupo (/admin/group-rides)
    - [x] Corridas intermunicipais (/admin/cidade-a-cidade)
    - [x] Agendamentos (/admin/agendamentos)
    - [x] Entregas (/admin/entregas)
    - [x] Ofertas de preco (/admin/price-offers)

### Financeiro
- [x] Pagamentos (/admin/payments)
- [x] Financeiro completo (/admin/financeiro)
- [x] Saques pendentes (/admin/withdrawals)
- [x] Assinaturas (/admin/subscriptions)
- [x] Reembolsos — aprovar/rejeitar (/admin/refunds) — NOVO
- [x] Disputas de corridas (/admin/disputes) — NOVO
- [x] Incentivos e bonus para motoristas (/admin/incentives) — NOVO
- [x] Regras de cashback (/admin/cashback) — NOVO
- [x] Faturas gerais (/admin/invoices) — NOVO

### Marketing e Experimentos
- [x] Promocoes (/admin/promotions)
- [x] Cupons (/admin/cupons)
- [x] Indicacoes (/admin/referrals)
- [x] Feature Flags — ativar/desativar features (/admin/feature-flags) — NOVO
- [x] Testes A/B e experimentos de preco (/admin/experiments) — NOVO

### Avaliacoes e Social
- [x] Avaliacoes (/admin/reviews)
- [x] Posts sociais (/admin/social)
- [x] Leaderboard (/admin/leaderboard)
- [x] Conquistas (/admin/achievements)
- [x] Favoritos (/admin/favoritos)

### Comunicacao
- [x] Notificacoes (/admin/notifications)
- [x] Mensagens (/admin/messages)
- [x] SMS (/admin/sms)
- [x] Webhooks (/admin/webhooks)
- [x] Integracoes (/admin/integrations)
- [x] Comunicacoes — templates, anuncios, banners (/admin/communications) — NOVO

### Suporte
- [x] Tickets de suporte (/admin/suporte)
- [x] FAQ (/admin/faq)
- [x] Documentos legais (/admin/legal)
- [x] Emergencias SOS (/admin/emergency)
- [x] Contatos de emergencia (/admin/emergency-contacts)
- [x] Gravacoes (/admin/recordings)

### Sistema e Equipe — NOVO
- [x] Equipe admin com roles e permissoes (/admin/team)
- [x] Feature Flags por percentual de rollout (/admin/feature-flags)
- [x] Logs do sistema (/admin/logs)
- [x] Precificacao dinamica (surge) (/admin/surge)
- [x] Zonas de atendimento e aeroportos (/admin/zones, /admin/airports)
- [x] Versoes app e janelas de manutencao (/admin/system)
- [x] Banimentos e IPs bloqueados (/admin/security)
- [x] Configuracoes (/admin/settings)

### Parceiros e Corporativo — NOVO
- [x] Empresas corporativas com funcionarios e faturas (/admin/corporate)
- [x] Parceiros, hoteis e lista de espera (/admin/partners)

### Conhecimento e Comunicacoes — NOVO
- [x] Base de conhecimento / central de ajuda (/admin/knowledge-base)
- [x] Templates push/email, anuncios e banners in-app (/admin/communications)

---

## FUNCIONALIDADES TECNICAS

### Seguranca
- [x] RLS em 192 tabelas (100%)
- [x] Criptografia AES-256-GCM para dados sensiveis
- [x] Rate limiting nas APIs
- [x] Validacao com Zod em todas as rotas
- [x] HTTPS obrigatorio
- [x] 88 tabelas duplicadas removidas

### Performance
- [x] 508 indices otimizados no banco
- [x] Lazy loading de componentes
- [x] Capacitor para acesso nativo

### Realtime
- [x] 36 tabelas com Supabase Realtime
- [x] GPS em tempo real
- [x] Chat em tempo real
- [x] Push notifications via Firebase (FCM)
- [x] Status de corrida em tempo real

### Integracoes
- [x] Google Maps (geocoding, rotas, autocomplete)
- [x] Firebase FCM (push notifications)
- [x] Supabase (banco, auth, storage, realtime)
- [x] PIX — Paradise/EfiPay
- [x] Capacitor 8 (Android nativo)

### APIs (98 rotas)
- [x] Auth (OTP email, OTP SMS, 2FA, JWT verify)
- [x] Perfil e configuracoes
- [x] Corridas completo (CRUD + fluxo inteiro)
- [x] Motorista (documentos, ganhos, localizacao, saque)
- [x] Ofertas e negociacao
- [x] Pagamentos (PIX, cartao, carteira, reembolso)
- [x] Cupons e promocoes
- [x] Social (posts, likes, comentarios, follows)
- [x] Suporte (tickets, mensagens, emergencia, SOS)
- [x] Admin (stats, usuarios, saques, setup)
- [x] Webhooks (registro e processamento)
- [x] Notificacoes (push, FCM, broadcast)
- [x] Geocoding, rotas, distancia
- [x] Familia, favoritos, assinaturas, referrals
- [x] Gravacoes, SMS, logs

---

## TOTAL DE FUNCIONALIDADES

| Categoria | Quantidade |
|-----------|------------|
| Passageiro | 85+ |
| Motorista | 35+ |
| Admin (50 paginas) | 50+ |
| Tecnico | 20+ |
| **TOTAL** | **190+ funcionalidades** |

---

## PAGINAS DO APP

| Categoria | Quantidade |
|-----------|------------|
| /uppi (passageiro + motorista) | 103 |
| /admin | 50 |
| /auth | 8 |
| **Total** | **161+** |

---

## ROADMAP

- [ ] Login com Google/Apple
- [ ] Corridas internacionais
- [ ] Aluguel de veiculos
- [ ] Apple Pay / Google Pay
- [ ] App para iOS (App Store)
- [ ] Conta corporativa (/uppi/corporate)
- [ ] Live Activities iOS (tela de bloqueio)
