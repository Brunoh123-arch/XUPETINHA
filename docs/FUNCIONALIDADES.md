# FUNCIONALIDADES DO APP UPPI

> Ultima atualizacao: 16/03/2026

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
- [x] Reportar problema

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

### Perfil e Configuracoes
- [x] Editar nome, foto, telefone (/uppi/profile)
- [x] Gerenciar enderecos favoritos (/uppi/favorites, /uppi/favorites/add)
- [x] Motoristas favoritos (/uppi/favorites/drivers)
- [x] Contatos de emergencia (/uppi/emergency-contacts, /uppi/settings/emergency)
- [x] Gerenciar membros da familia (/uppi/family)
- [x] Preferencias de notificacao
- [x] Preferencias de SMS (/uppi/settings/sms)
- [x] Preferencias de gravacao (/uppi/settings/recording)
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
- [x] Conquistas e badges (/uppi/achievements)
- [x] Programa de indicacao (/uppi/referral, /uppi/referrals)
- [x] Club de fidelidade (/uppi/club)
- [x] Trust Score (/uppi/trust-score)

### Suporte e Legal
- [x] Chat com suporte (/uppi/suporte/chat)
- [x] FAQ (/uppi/help)
- [x] Abrir ticket (/uppi/suporte, /uppi/support)
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

### Ganhos
- [x] Ver ganhos do dia/semana/mes (/uppi/driver/earnings)
- [x] Ver detalhamento por corrida
- [x] Solicitar saque PIX (/uppi/driver/wallet)
- [x] Ver historico de saques

### Avaliacoes
- [x] Ver media de avaliacao (/uppi/driver/ratings)
- [x] Ver comentarios recebidos
- [x] Avaliar passageiros
- [x] Sistema de niveis e performance

### Ferramentas
- [x] Mapa de zonas quentes (/uppi/driver/hot-zones)
- [x] Historico de corridas (/uppi/driver/history)
- [x] Agenda de turnos (/uppi/driver/schedule)
- [x] Configuracoes do motorista (/uppi/driver/settings)
- [x] Perfil do motorista (/uppi/driver/profile)

---

## FUNCIONALIDADES DO ADMIN (42 paginas)

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

### Marketing
- [x] Promocoes (/admin/promotions)
- [x] Cupons (/admin/cupons)
- [x] Indicacoes (/admin/referrals)

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

### Suporte
- [x] Tickets de suporte (/admin/suporte)
- [x] FAQ (/admin/faq)
- [x] Documentos legais (/admin/legal)
- [x] Emergencias SOS (/admin/emergency)
- [x] Contatos de emergencia (/admin/emergency-contacts)
- [x] Gravacoes (/admin/recordings)

### Sistema
- [x] Logs do sistema (/admin/logs)
- [x] Precificacao dinamica (surge) (/admin/surge)
- [x] Zonas de atendimento (/admin/zones)
- [x] Configuracoes (/admin/settings)

---

## FUNCIONALIDADES TECNICAS

### Seguranca
- [x] RLS em 275 tabelas (100%)
- [x] Criptografia AES-256-GCM para dados sensiveis
- [x] Rate limiting nas APIs
- [x] Validacao com Zod em todas as rotas
- [x] HTTPS obrigatorio

### Performance
- [x] 702+ indices otimizados no banco
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

### APIs (100 rotas)
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
| Passageiro | 75+ |
| Motorista | 25+ |
| Admin (42 paginas) | 42 |
| Tecnico | 20+ |
| **TOTAL** | **160+ funcionalidades** |

---

## PAGINAS DO APP

| Categoria | Quantidade |
|-----------|------------|
| /uppi (passageiro + motorista) | 85 |
| /admin | 42 |
| /auth | 8 |
| **Total** | **135** |

---

## ROADMAP

- [ ] Login com Google/Apple
- [ ] Corridas internacionais
- [ ] Aluguel de veiculos
- [ ] Apple Pay / Google Pay
- [ ] App para iOS (App Store)
