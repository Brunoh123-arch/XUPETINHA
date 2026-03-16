# FUNCIONALIDADES DO APP UPPI

> Ultima atualizacao: 16/03/2026

## VISAO GERAL

O UPPI e um app de mobilidade urbana completo com 3 perfis de usuario:
- **Passageiro** - Solicita corridas
- **Motorista** - Aceita e realiza corridas
- **Admin** - Gerencia a plataforma

---

## FUNCIONALIDADES DO PASSAGEIRO

### Autenticacao
- [x] Login com email + OTP (codigo de 6 digitos)
- [x] Login com telefone + SMS
- [x] Cadastro de novo usuario
- [x] Recuperacao de senha
- [x] Autenticacao 2FA (opcional)
- [x] Logout

### Solicitar Corrida
- [x] Buscar endereco de origem (geolocalizacao automatica)
- [x] Buscar endereco de destino (autocomplete Google)
- [x] Ver estimativa de preco
- [x] Escolher tipo de veiculo (UberX, Comfort, Black, Moto)
- [x] Escolher forma de pagamento (PIX, Cartao, Dinheiro, Carteira)
- [x] Aplicar cupom de desconto
- [x] Agendar corrida para depois
- [x] Corrida em grupo (dividir com amigos)
- [x] Corrida compartilhada (carona)

### Negociacao de Preco
- [x] Fazer contra-oferta ao motorista
- [x] Ver ofertas de motoristas proximos
- [x] Aceitar/rejeitar ofertas
- [x] Negociacao em tempo real

### Durante a Corrida
- [x] Rastreamento em tempo real no mapa
- [x] Ver dados do motorista (nome, foto, placa, avaliacao)
- [x] Chat com motorista
- [x] Compartilhar corrida com contatos
- [x] Botao de emergencia (SOS)
- [x] Gravacao de audio da corrida
- [x] Alterar destino durante corrida
- [x] Cancelar corrida

### Apos a Corrida
- [x] Avaliar motorista (1-5 estrelas)
- [x] Deixar comentario
- [x] Dar gorjeta
- [x] Ver recibo detalhado
- [x] Reportar problema
- [x] Abrir disputa

### Pagamentos
- [x] Pagar com PIX (QR Code)
- [x] Pagar com cartao de credito
- [x] Pagar com dinheiro
- [x] Pagar com saldo da carteira
- [x] Dividir pagamento com amigos
- [x] Ver historico de pagamentos
- [x] Solicitar reembolso

### Carteira Digital
- [x] Ver saldo
- [x] Adicionar creditos (PIX)
- [x] Ver extrato de transacoes
- [x] Cashback automatico

### Perfil
- [x] Editar nome, foto, telefone
- [x] Gerenciar enderecos favoritos (casa, trabalho)
- [x] Contatos de emergencia
- [x] Preferencias de notificacao
- [x] Ativar/desativar 2FA
- [x] Alterar idioma
- [x] Modo escuro
- [x] Deletar conta

### Social
- [x] Ver feed de posts
- [x] Criar posts
- [x] Curtir e comentar
- [x] Seguir outros usuarios
- [x] Ver leaderboard
- [x] Conquistas e badges

### Suporte
- [x] Chat com suporte
- [x] FAQ
- [x] Abrir ticket
- [x] Ver historico de tickets

---

## FUNCIONALIDADES DO MOTORISTA

### Cadastro e Verificacao
- [x] Cadastro como motorista
- [x] Upload de documentos (CNH, CRLV, foto)
- [x] Verificacao de antecedentes
- [x] Aprovacao pelo admin
- [x] Treinamento obrigatorio

### Modo Motorista
- [x] Ativar/desativar modo online
- [x] Ver corridas disponiveis no mapa
- [x] Aceitar/rejeitar corridas
- [x] Fazer oferta de preco
- [x] Navegar ate o passageiro
- [x] Iniciar corrida
- [x] Navegar ate o destino
- [x] Finalizar corrida

### Durante a Corrida
- [x] Navegacao GPS integrada
- [x] Chat com passageiro
- [x] Botao de emergencia
- [x] Gravacao de audio
- [x] Reportar problema com passageiro

### Ganhos
- [x] Ver ganhos do dia/semana/mes
- [x] Ver detalhamento por corrida
- [x] Solicitar saque (PIX)
- [x] Ver historico de saques
- [x] Bonus e incentivos

### Avaliacoes
- [x] Ver media de avaliacao
- [x] Ver comentarios recebidos
- [x] Avaliar passageiros
- [x] Sistema de niveis (Bronze, Prata, Ouro, Diamante)

### Ferramentas
- [x] Mapa de zonas quentes (alta demanda)
- [x] Rotas populares
- [x] Previsao de demanda
- [x] Calculadora de ganhos

### Perfil
- [x] Editar dados pessoais
- [x] Atualizar documentos
- [x] Gerenciar veiculos
- [x] Configuracoes de notificacao

---

## FUNCIONALIDADES DO ADMIN

### Dashboard
- [x] Metricas em tempo real
- [x] Total de corridas hoje
- [x] Receita do dia
- [x] Usuarios ativos
- [x] Graficos e relatorios

### Gestao de Usuarios
- [x] Listar todos os usuarios
- [x] Buscar por nome/email/telefone
- [x] Ver detalhes do usuario
- [x] Editar usuario
- [x] Banir/desbanir usuario
- [x] Resetar senha

### Gestao de Motoristas
- [x] Listar motoristas pendentes
- [x] Aprovar/rejeitar documentos
- [x] Verificar antecedentes
- [x] Listar motoristas ativos
- [x] Suspender motorista

### Gestao de Corridas
- [x] Listar todas as corridas
- [x] Filtrar por status/data/motorista
- [x] Ver detalhes da corrida
- [x] Cancelar corrida
- [x] Resolver disputas

### Financeiro
- [x] Ver receita total
- [x] Listar saques pendentes
- [x] Aprovar/rejeitar saques
- [x] Processar reembolsos
- [x] Relatorios financeiros

### Marketing
- [x] Criar cupons de desconto
- [x] Gerenciar promocoes
- [x] Campanhas de marketing
- [x] Push notifications em massa

### Suporte
- [x] Ver tickets abertos
- [x] Responder tickets
- [x] Chat com usuarios
- [x] Alertas de emergencia (SOS)

### Configuracoes
- [x] Precos por tipo de veiculo
- [x] Taxas da plataforma
- [x] Zonas de atendimento
- [x] Feature flags
- [x] Configuracoes do sistema

---

## FUNCIONALIDADES TECNICAS

### Seguranca
- [x] RLS em todas as tabelas (Row Level Security)
- [x] Criptografia de dados sensiveis
- [x] Rate limiting nas APIs
- [x] Validacao de entrada
- [x] Protecao contra SQL injection
- [x] HTTPS obrigatorio

### Performance
- [x] Indices otimizados no banco
- [x] Cache de dados frequentes
- [x] Lazy loading de componentes
- [x] Compressao de imagens

### Realtime
- [x] Atualizacao de localizacao em tempo real
- [x] Chat em tempo real
- [x] Notificacoes push
- [x] Status de corrida em tempo real

### Integracao
- [x] Google Maps (geocoding, rotas)
- [x] Firebase (push notifications)
- [x] Supabase (banco, auth, storage)
- [x] PIX (pagamentos)

---

## TOTAL DE FUNCIONALIDADES

| Categoria | Quantidade |
|-----------|------------|
| Passageiro | 58 |
| Motorista | 32 |
| Admin | 28 |
| Tecnico | 14 |
| **TOTAL** | **132 funcionalidades** |

---

## PROXIMAS FUNCIONALIDADES (Roadmap)

- [ ] Login com Google/Apple
- [ ] Corridas internacionais
- [ ] Aluguel de veiculos
- [ ] Entrega de pacotes (expandir)
- [ ] Integracao com Apple Pay
- [ ] App para iOS nativo
