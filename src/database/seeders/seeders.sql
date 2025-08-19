-- select * from graph_user gu ;
-- select * from graph_token_transaction gtt ;

-- Ajusta los valores entre comillas si quieres otros
DO $$
DECLARE _hash TEXT;
BEGIN
  -- bcrypt con 12 rounds (requiere extensión pgcrypto si usas crypt/salt)
  -- Si no tienes pgcrypto para crypt(), genera el hash en Node y pega el string aquí.
  SELECT crypt('admin123', gen_salt('bf', 12)) INTO _hash;

  IF NOT EXISTS (SELECT 1 FROM graph_user WHERE email_user = 'admin@test.com') THEN
    INSERT INTO graph_user
      (id_user, email_user, password_user, role_user, tokens_user, created_at_user, updated_at_user)
    VALUES
      (gen_random_uuid(), 'admin@test.com', _hash, 'admin', 999, NOW(), NOW());
  END IF;
END$$;
