-- =====================================================
-- UPPI - PARTE 15: INDICES E SEED DATA
-- =====================================================

-- Indices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_rides_passenger ON rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created ON rides(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_offers_ride ON price_offers(ride_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_driver ON price_offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_status ON price_offers(status);

CREATE INDEX IF NOT EXISTS idx_messages_ride ON messages(ride_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_driver_profiles_user ON driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_status ON driver_profiles(status);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_online ON driver_profiles(is_online) WHERE is_online = true;

-- Seed: Configuracoes do sistema
INSERT INTO system_config (key, value, description) VALUES
('platform_fee_percentage', '"20"', 'Taxa da plataforma em percentual'),
('min_withdrawal_amount', '"50"', 'Valor minimo para saque em reais'),
('max_search_radius_km', '"10"', 'Raio maximo de busca de motoristas'),
('offer_expiry_minutes', '"2"', 'Tempo de expiracao de ofertas'),
('cancellation_fee', '"5"', 'Taxa de cancelamento em reais'),
('referral_bonus', '"20"', 'Bonus por indicacao em reais')
ON CONFLICT (key) DO NOTHING;

-- Seed: Achievements iniciais
INSERT INTO achievements (name, description, icon, points, requirement_type, requirement_value) VALUES
('Primeira Corrida', 'Complete sua primeira corrida', 'car', 10, 'rides_completed', 1),
('Motorista 5 Estrelas', 'Mantenha avaliacao 5 estrelas em 10 corridas', 'star', 50, 'rating_5_stars', 10),
('Viajante Frequente', 'Complete 50 corridas', 'road', 100, 'rides_completed', 50),
('Economizador', 'Economize R$100 em corridas compartilhadas', 'piggy-bank', 75, 'shared_savings', 100),
('Recomendador', 'Indique 5 amigos que completaram corridas', 'users', 100, 'referrals', 5),
('Madrugador', 'Complete 10 corridas antes das 7h', 'sunrise', 50, 'early_rides', 10),
('Noturno', 'Complete 10 corridas depois das 22h', 'moon', 50, 'night_rides', 10)
ON CONFLICT (name) DO NOTHING;

-- Seed: Pricing rules
INSERT INTO pricing_rules (vehicle_type, base_fare, per_km_rate, per_minute_rate, minimum_fare, cancellation_fee) VALUES
('economy', 5.00, 1.80, 0.30, 8.00, 5.00),
('comfort', 8.00, 2.50, 0.45, 12.00, 7.00),
('premium', 12.00, 3.50, 0.60, 18.00, 10.00),
('suv', 10.00, 3.00, 0.50, 15.00, 8.00),
('van', 15.00, 4.00, 0.70, 25.00, 12.00),
('moto', 3.00, 1.20, 0.20, 5.00, 3.00)
ON CONFLICT DO NOTHING;

-- Seed: Rating categories
INSERT INTO rating_categories (name, description, icon, is_positive) VALUES
('Direcao segura', 'Motorista dirige de forma segura', 'shield', true),
('Veiculo limpo', 'Veiculo bem conservado e limpo', 'sparkles', true),
('Conversacao agradavel', 'Motorista educado e conversador', 'message-circle', true),
('Pontual', 'Motorista chegou no horario', 'clock', true),
('Conhece a cidade', 'Motorista conhece bem as rotas', 'map', true),
('Direcao agressiva', 'Motorista dirige de forma imprudente', 'alert-triangle', false),
('Veiculo sujo', 'Veiculo mal conservado', 'trash', false),
('Demorou muito', 'Motorista demorou para chegar', 'timer', false)
ON CONFLICT (name) DO NOTHING;

-- Seed: FAQs
INSERT INTO faqs (question, answer, category, order_index) VALUES
('Como solicitar uma corrida?', 'Abra o app, digite seu destino, escolha o tipo de veiculo e confirme. Voce recebera ofertas de motoristas proximos.', 'corridas', 1),
('Como funciona o sistema de ofertas?', 'Motoristas enviam ofertas de preco para sua corrida. Voce pode aceitar a que preferir ou aguardar mais ofertas.', 'corridas', 2),
('Posso cancelar uma corrida?', 'Sim, mas pode haver cobranca de taxa de cancelamento dependendo do momento em que cancelar.', 'corridas', 3),
('Como me tornar motorista?', 'Acesse a area de motoristas no app, envie seus documentos e aguarde a aprovacao.', 'motoristas', 1),
('Como funciona o pagamento para motoristas?', 'Apos cada corrida, o valor e creditado na sua carteira. Voce pode sacar via PIX quando quiser.', 'motoristas', 2),
('O que e uma corrida compartilhada?', 'E quando voce divide a corrida com outros passageiros que vao para a mesma direcao, economizando no valor final.', 'corridas', 4)
ON CONFLICT DO NOTHING;

-- Seed: Legal documents
INSERT INTO legal_documents (type, title, content) VALUES
('terms', 'Termos de Uso', 'Ao utilizar nosso aplicativo, voce concorda com estes termos...'),
('privacy', 'Politica de Privacidade', 'Nos coletamos e usamos seus dados de acordo com esta politica...'),
('driver_terms', 'Termos para Motoristas', 'Como motorista parceiro, voce concorda em seguir estas diretrizes...')
ON CONFLICT (type) DO UPDATE SET updated_at = NOW();

-- Habilitar Realtime nas tabelas principais
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE driver_locations;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE rides;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE price_offers;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
