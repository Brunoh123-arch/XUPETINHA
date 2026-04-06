-- =============================================================================
-- XUPETINHA — DADOS INICIAIS (SEED)
-- =============================================================================

-- =============================================================================
-- CATEGORIAS DE VEÍCULOS
-- =============================================================================
INSERT INTO public.vehicle_categories (name, display_name, description, icon, base_price, price_per_km, price_per_minute, min_price, max_passengers, sort_order)
VALUES 
  ('economy', 'Econômico', 'Carros compactos e econômicos', 'car', 5.00, 1.20, 0.25, 8.00, 4, 1),
  ('comfort', 'Conforto', 'Carros espaçosos e confortáveis', 'car-front', 7.00, 1.50, 0.35, 12.00, 4, 2),
  ('premium', 'Premium', 'Carros de luxo e executivos', 'crown', 12.00, 2.50, 0.50, 20.00, 4, 3),
  ('suv', 'SUV', 'SUVs para grupos maiores', 'truck', 10.00, 2.00, 0.40, 15.00, 6, 4),
  ('moto', 'Moto', 'Transporte rápido de moto', 'bike', 3.00, 0.80, 0.15, 5.00, 1, 5)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- TIPOS DE VEÍCULOS
-- =============================================================================
INSERT INTO public.vehicle_types (name, display_name, description, icon, multiplier)
VALUES 
  ('sedan', 'Sedan', 'Carros sedan', 'car', 1.0),
  ('hatch', 'Hatch', 'Carros hatchback', 'car', 1.0),
  ('suv', 'SUV', 'Utilitários esportivos', 'truck', 1.2),
  ('van', 'Van', 'Vans para grupos', 'bus', 1.3),
  ('motorcycle', 'Moto', 'Motocicletas', 'bike', 0.8)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- RECURSOS DE ACESSIBILIDADE
-- =============================================================================
INSERT INTO public.accessibility_features (name, description, icon, category)
VALUES 
  ('wheelchair', 'Acessível para cadeira de rodas', 'accessibility', 'mobility'),
  ('hearing_aid', 'Motorista com conhecimento em Libras', 'ear', 'hearing'),
  ('guide_dog', 'Aceita cão-guia', 'dog', 'vision'),
  ('child_seat', 'Cadeirinha para criança', 'baby', 'family'),
  ('air_conditioning', 'Ar-condicionado', 'snowflake', 'comfort')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- CONQUISTAS
-- =============================================================================
INSERT INTO public.achievements (title, description, icon, category, points, criteria)
VALUES 
  ('Primeira Viagem', 'Complete sua primeira viagem', 'rocket', 'rides', 10, '{"rides": 1}'),
  ('Viajante Frequente', 'Complete 10 viagens', 'map', 'rides', 50, '{"rides": 10}'),
  ('Explorador', 'Complete 50 viagens', 'compass', 'rides', 200, '{"rides": 50}'),
  ('Mestre Viajante', 'Complete 100 viagens', 'trophy', 'rides', 500, '{"rides": 100}'),
  ('Avaliador', 'Avalie 10 motoristas', 'star', 'ratings', 30, '{"ratings": 10}'),
  ('Indicador', 'Indique 5 amigos', 'users', 'referrals', 100, '{"referrals": 5}'),
  ('Economizador', 'Economize R$100 em viagens', 'piggy-bank', 'savings', 75, '{"savings": 100}')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- BADGES
-- =============================================================================
INSERT INTO public.badge_definitions (name, description, icon, category, points)
VALUES 
  ('Novato', 'Bem-vindo ao Xupetinha!', 'baby', 'level', 0),
  ('Bronze', 'Atingiu nível Bronze', 'medal', 'level', 100),
  ('Prata', 'Atingiu nível Prata', 'medal', 'level', 500),
  ('Ouro', 'Atingiu nível Ouro', 'medal', 'level', 1000),
  ('Diamante', 'Atingiu nível Diamante', 'gem', 'level', 5000),
  ('Ecológico', 'Preferência por veículos elétricos', 'leaf', 'special', 200),
  ('Noturno', 'Viajante da madrugada', 'moon', 'special', 150)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ROLES DE ADMIN
-- =============================================================================
INSERT INTO public.admin_roles (name, description, permissions)
VALUES 
  ('super_admin', 'Administrador com acesso total', '["all"]'),
  ('admin', 'Administrador geral', '["users", "rides", "drivers", "support"]'),
  ('support', 'Equipe de suporte', '["support", "users_read"]'),
  ('moderator', 'Moderador de conteúdo', '["users_read", "reports"]'),
  ('finance', 'Equipe financeira', '["payments", "reports"]')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- CONFIGURAÇÕES DO SISTEMA
-- =============================================================================
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('commission_rate', '{"default": 0.20, "premium": 0.15}', 'Taxa de comissão por categoria'),
  ('surge_config', '{"enabled": true, "max_multiplier": 2.5, "min_drivers": 3}', 'Configuração de preço dinâmico'),
  ('referral_bonus', '{"referrer": 10, "referred": 15}', 'Bônus de indicação em reais'),
  ('cancellation_fee', '{"passenger": 5, "driver": 10, "free_cancellation_time": 120}', 'Taxa de cancelamento'),
  ('driver_requirements', '{"min_age": 21, "min_license_years": 2, "max_vehicle_age": 10}', 'Requisitos para motoristas'),
  ('support_hours', '{"start": "06:00", "end": "22:00", "timezone": "America/Sao_Paulo"}', 'Horário de atendimento')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
