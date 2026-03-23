-- Corrige RLS da tabela vehicles
-- A tabela tem RLS habilitado mas nenhuma policy, bloqueando todos os INSERTs/SELECTs

-- Policy: motorista pode gerenciar seus próprios veículos
CREATE POLICY "Drivers can manage own vehicles"
  ON vehicles
  FOR ALL
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- Policy: admins têm acesso total
CREATE POLICY "Admins full access vehicles"
  ON vehicles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: qualquer usuário pode ver veículos verificados (para mostrar no app do passageiro)
CREATE POLICY "Anyone can view verified vehicles"
  ON vehicles
  FOR SELECT
  USING (is_verified = true AND is_active = true);
