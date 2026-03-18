-- ================================================================
-- 007-final-10-tables.sql
-- Cria as ~10 tabelas documentadas que ainda nao existem no banco
-- ================================================================

-- 1. surge_pricing
CREATE TABLE IF NOT EXISTS surge_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name VARCHAR(255),
  multiplier DECIMAL(5,2),
  active_from TIMESTAMP WITH TIME ZONE,
  active_until TIMESTAMP WITH TIME ZONE,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE surge_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see surge pricing" ON surge_pricing FOR SELECT USING (TRUE);

-- 2. service_areas
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name VARCHAR(255) UNIQUE,
  city VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see service areas" ON service_areas FOR SELECT USING (active = TRUE);

-- 3. zone_availability
CREATE TABLE IF NOT EXISTS zone_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES geographic_zones(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  available BOOLEAN DEFAULT TRUE
);
ALTER TABLE zone_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see zone availability" ON zone_availability FOR SELECT USING (TRUE);

-- 4. zone_restrictions
CREATE TABLE IF NOT EXISTS zone_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES geographic_zones(id) ON DELETE CASCADE,
  restriction_type VARCHAR(50),
  restriction_value VARCHAR(255),
  applies_to VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE zone_restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see zone restrictions" ON zone_restrictions FOR SELECT USING (TRUE);

-- 5. zone_stats
CREATE TABLE IF NOT EXISTS zone_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES geographic_zones(id) ON DELETE CASCADE,
  date DATE,
  rides_count INTEGER DEFAULT 0,
  revenue DECIMAL(15,2) DEFAULT 0,
  average_wait_time INTEGER DEFAULT 0
);
ALTER TABLE zone_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see zone stats" ON zone_stats FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 6. social_posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see social posts" ON social_posts FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own posts" ON social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. social_post_likes
CREATE TABLE IF NOT EXISTS social_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their likes" ON social_post_likes FOR ALL USING (auth.uid() = user_id);

-- 8. post_comments
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see post comments" ON post_comments FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. user_follows
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id != followed_id)
);
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their follows" ON user_follows FOR ALL USING (auth.uid() = follower_id);

-- 10. referral_achievements
CREATE TABLE IF NOT EXISTS referral_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100),
  points_earned INTEGER DEFAULT 0,
  bonus_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE referral_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their referral achievements" ON referral_achievements FOR SELECT USING (
  auth.uid() IN (SELECT referrer_id FROM referrals WHERE id = referral_id)
);

-- 11. leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type VARCHAR(100),
  rank INTEGER,
  score DECIMAL(15,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see leaderboard" ON leaderboard FOR SELECT USING (TRUE);

-- 12. driver_training
CREATE TABLE IF NOT EXISTS driver_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  training_type VARCHAR(100),
  module_name VARCHAR(255),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_training ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their training" ON driver_training FOR ALL USING (
  auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id)
);

-- 13. admin_actions
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action_type VARCHAR(100),
  target_resource VARCHAR(100),
  target_id VARCHAR(100),
  action_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see admin actions" ON admin_actions FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 14. webhook_deliveries
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see webhook deliveries" ON webhook_deliveries FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 15. live_activities
CREATE TABLE IF NOT EXISTS live_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50),
  activity_id VARCHAR(100),
  push_token VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'stale')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE live_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their live activities" ON live_activities FOR ALL USING (auth.uid() = user_id);
