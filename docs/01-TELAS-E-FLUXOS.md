# Telas e Fluxos — Uppi

Total: **160 telas** (85 passageiro, 41 admin, 10 auth/onboarding, 24 motorista dentro de /uppi)

---

## Autenticacao e Onboarding

| Rota | Tela | Descricao |
|---|---|---|
| `/` | Landing | Pagina de entrada — redireciona para login ou home |
| `/onboarding` | Onboarding | Carrossel de apresentacao do app |
| `/onboarding/splash` | Splash | Tela de loading inicial |
| `/onboarding/create-account` | Criar Conta | Escolha de tipo de usuario |
| `/auth/selection` | Selecao | Passageiro ou Motorista |
| `/auth/welcome` | Boas Vindas | Tela de boas vindas |
| `/auth/user-type` | Tipo de Usuario | Definir tipo |
| `/auth/login` | Login | Login passageiro |
| `/auth/passenger` | Login Passageiro | Formulario de login |
| `/auth/driver/login` | Login Motorista | Formulario de login motorista |
| `/auth/driver/sign-up` | Cadastro Motorista | Registro motorista |
| `/auth/driver/welcome` | Bem-vindo Motorista | Pos-cadastro |
| `/auth/sign-up-success` | Sucesso | Confirmacao de cadastro |
| `/auth/error` | Erro | Tela de erro de autenticacao |
| `/login` | Login Alternativo | Login simplificado |
| `/signup` | Cadastro | Cadastro passageiro |
| `/phone` | Telefone | Verificacao por telefone |
| `/forgot-password` | Esqueci Senha | Recuperacao de senha |
| `/reset-password` | Redefinir Senha | Nova senha |
| `/google-setup` | Setup Google | Completar perfil apos OAuth |
| `/offline` | Offline | Tela sem conexao |

---

## Fluxo Principal do Passageiro

```
/uppi/home
  → /uppi/ride/route-input         (digitar destino)
    → /uppi/ride/route-alternatives (rotas alternativas)
      → /uppi/ride/price-estimate   (estimativa de preco)
        → /uppi/ride/select         (escolher tipo de corrida)
          → /uppi/ride/searching    (procurando motorista)
            → /uppi/ride/[id]/tracking  (acompanhar corrida)
              → /uppi/ride/[id]/payment (pagar — PIX ou carteira)
                → /uppi/ride/[id]/review (avaliar motorista)
```

---

## Telas do Passageiro (/uppi)

### Home e Corrida
| Rota | Descricao |
|---|---|
| `/uppi/home` | Home com mapa, destinos favoritos e opcoes rapidas |
| `/uppi/ride/route-input` | Input de origem e destino com autocomplete |
| `/uppi/ride/route-alternatives` | Rotas alternativas no mapa |
| `/uppi/ride/price-estimate` | Estimativa de preco por tipo de corrida |
| `/uppi/ride/select` | Selecao de categoria (Economy, Comfort, Premium, Moto) |
| `/uppi/ride/searching` | Buscando motorista — animacao e cancelar |
| `/uppi/ride/auction` | Modo leilao — motoristas fazem ofertas |
| `/uppi/ride/group` | Corrida em grupo — compartilhar rota |
| `/uppi/ride/schedule` | Agendar corrida para horario futuro |
| `/uppi/request-ride` | Solicitar corrida direta |

### Corrida Ativa
| Rota | Descricao |
|---|---|
| `/uppi/ride/[id]/tracking` | Tracking em tempo real com mapa |
| `/uppi/ride/[id]/chat` | Chat com motorista durante corrida |
| `/uppi/ride/[id]/share` | Compartilhar corrida com contato de emergencia |
| `/uppi/ride/[id]/cancel` | Cancelar corrida |
| `/uppi/ride/[id]/details` | Detalhes da corrida |
| `/uppi/ride/[id]/driver-profile` | Perfil do motorista da corrida |
| `/uppi/ride/[id]/offers` | Ofertas recebidas (modo leilao) |

### Pos-Corrida
| Rota | Descricao |
|---|---|
| `/uppi/ride/[id]/payment` | Pagamento PIX ou carteira |
| `/uppi/ride/[id]/review` | Avaliacao padrao (1-5 estrelas) |
| `/uppi/ride/[id]/review-enhanced` | Avaliacao detalhada com categorias |
| `/uppi/ride/[id]/rate` | Rating rapido |
| `/uppi/ride/[id]/receipt` | Comprovante da corrida |

### Motorista (dentro de /uppi/driver)
| Rota | Descricao |
|---|---|
| `/uppi/driver` | Dashboard motorista |
| `/uppi/driver/home` | Home do motorista com mapa e modo online |
| `/uppi/driver/ride/[id]/accept` | Aceitar ou recusar corrida |
| `/uppi/driver/ride/[id]/active` | Corrida ativa — navegar e atualizar status |
| `/uppi/driver/ride/[id]/summary` | Resumo pos-corrida |
| `/uppi/driver/earnings` | Ganhos detalhados |
| `/uppi/driver/wallet` | Carteira do motorista |
| `/uppi/driver/history` | Historico de corridas |
| `/uppi/driver/hot-zones` | Zonas quentes no mapa |
| `/uppi/driver/ratings` | Avaliacoes recebidas |
| `/uppi/driver/profile` | Perfil publico |
| `/uppi/driver/verify` | Verificacao facial |
| `/uppi/driver/documents` | Documentos (CNH, CRLV) |
| `/uppi/driver/register` | Cadastro de motorista |
| `/uppi/driver/schedule` | Corridas agendadas |
| `/uppi/driver/settings` | Configuracoes do motorista |
| `/uppi/driver-mode` | Alternar modo passageiro/motorista |

### Perfil e Configuracoes
| Rota | Descricao |
|---|---|
| `/uppi/profile` | Perfil do usuario |
| `/uppi/settings` | Configuracoes gerais |
| `/uppi/settings/password` | Alterar senha |
| `/uppi/settings/sms` | Verificacao SMS |
| `/uppi/settings/2fa` | Autenticacao em dois fatores |
| `/uppi/settings/language` | Idioma |
| `/uppi/settings/emergency` | Contatos de emergencia nas configuracoes |
| `/uppi/settings/recording` | Gravacao de corridas |

### Servicos e Features
| Rota | Descricao |
|---|---|
| `/uppi/history` | Historico de corridas |
| `/uppi/payments` | Metodos de pagamento |
| `/uppi/wallet` | Carteira digital |
| `/uppi/notifications` | Central de notificacoes |
| `/uppi/favorites/add` | Adicionar lugar favorito |
| `/uppi/favorites/drivers` | Motoristas favoritos |
| `/uppi/schedule` | Corridas agendadas |
| `/uppi/cidade-a-cidade` | Viagens intermunicipais |
| `/uppi/entregas` | Servico de entregas |
| `/uppi/coupons` | Cupons de desconto |
| `/uppi/promotions` | Promocoes ativas |
| `/uppi/referrals` | Programa de indicacao |
| `/uppi/club` | Club Uppi — assinaturas Basic/Premium/VIP |
| `/uppi/social` | Feed social |
| `/uppi/social/create` | Criar post social |
| `/uppi/family` | Conta familia |
| `/uppi/leaderboard` | Ranking de usuarios |
| `/uppi/achievements` | Conquistas e badges |
| `/uppi/analytics` | Estatisticas pessoais |
| `/uppi/trust-score` | Score de confianca |
| `/uppi/rate` | Avaliar corrida |

### Suporte e Seguranca
| Rota | Descricao |
|---|---|
| `/uppi/help` | Central de ajuda e FAQ |
| `/uppi/support` | Suporte ao cliente |
| `/uppi/suporte` | Suporte alternativo |
| `/uppi/suporte/chat` | Chat com suporte |
| `/uppi/emergency` | SOS e emergencia |
| `/uppi/emergency-contacts` | Contatos de emergencia |
| `/uppi/seguranca` | Central de seguranca |

### Legal
| Rota | Descricao |
|---|---|
| `/uppi/terms` | Termos de uso |
| `/uppi/privacy` | Politica de privacidade |
| `/uppi/legal/terms` | Termos (alternativo) |
| `/uppi/legal/privacy` | Privacidade (alternativo) |
| `/terms` | Termos publicos |
| `/privacy` | Privacidade publica |

---

## Telas do Admin (/admin)

| Rota | Descricao |
|---|---|
| `/admin` | Dashboard com KPIs em tempo real |
| `/admin/login` | Login admin |
| `/admin/users` | Gestao de usuarios |
| `/admin/drivers` | Gestao de motoristas |
| `/admin/drivers/earnings` | Ganhos por motorista |
| `/admin/rides` | Todas as corridas |
| `/admin/rides/[id]` | Detalhes de corrida |
| `/admin/monitor` | Monitor em tempo real (mapa ao vivo) |
| `/admin/payments` | Transacoes financeiras |
| `/admin/financeiro` | Relatorio financeiro |
| `/admin/withdrawals` | Saques de motoristas |
| `/admin/driver-earnings` | Earnings detalhados |
| `/admin/analytics` | Analytics avancado |
| `/admin/promotions` | Gestao de promocoes |
| `/admin/cupons` | Gestao de cupons |
| `/admin/surge` | Surge pricing por zona |
| `/admin/zones` | Zonas de operacao |
| `/admin/notifications` | Enviar notificacoes push |
| `/admin/messages` | Mensagens em massa |
| `/admin/sms` | Gestao de SMS |
| `/admin/push` | Push notifications (broadcast) |
| `/admin/support / suporte` | Tickets de suporte |
| `/admin/reviews` | Avaliacoes e reviews |
| `/admin/ratings` | Ratings dos usuarios |
| `/admin/referrals` | Programa de indicacao |
| `/admin/achievements` | Gestao de conquistas |
| `/admin/leaderboard` | Ranking |
| `/admin/social` | Moderacao feed social |
| `/admin/subscriptions` | Assinantes Club Uppi |
| `/admin/webhooks` | Webhooks externos |
| `/admin/integrations` | Integracoes ativas |
| `/admin/logs` | Logs do sistema |
| `/admin/recordings` | Gravacoes de corridas |
| `/admin/emergency` | Emergencias ativas |
| `/admin/emergency-contacts` | Contatos de emergencia |
| `/admin/faq` | Base de conhecimento |
| `/admin/legal` | Documentos legais |
| `/admin/settings` | Configuracoes do sistema |
| `/admin/agendamentos` | Corridas agendadas |
| `/admin/group-rides` | Corridas em grupo |
| `/admin/price-offers` | Ofertas de preco |
| `/admin/cidade-a-cidade` | Rotas intermunicipais |
| `/admin/entregas` | Servico de entregas |
| `/admin/favoritos` | Favoritos dos usuarios |

---

## Fluxo de Pagamento PIX

```
Corrida finalizada
  → /uppi/ride/[id]/payment
    → Gera cobranca PIX (Paradise Gateway)
      → QR Code exibido no PixModal
        → Polling a cada 3s em /api/pix/status
          → Webhook /api/pix/webhook confirma pagamento
            → /uppi/ride/[id]/review
```

---

## Realtime (Supabase)

| Canal | Evento | Receptor |
|---|---|---|
| `rides` | Status atualizado | Passageiro (tracking) |
| `rides` | Nova corrida disponivel | Motorista (home) |
| `driver_locations` | Posicao atualizada | Passageiro (tracking) |
| `messages` | Nova mensagem | Chat corrida |
| `notifications` | Nova notificacao | Central de notificacoes |
