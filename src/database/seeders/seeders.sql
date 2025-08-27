-- select * from graph_user gu ;
-- select * from graph_token_transaction gtt ;


DO $$
DECLARE _hash TEXT;
BEGIN
    -- bcrypt with 12 rounds (requires pgcrypto extension if using crypt/salt)
    -- If you don't have pgcrypto for crypt(), generate the hash in Node and paste the string here.
  SELECT crypt('admin123', gen_salt('bf', 12)) INTO _hash;

  IF NOT EXISTS (SELECT 1 FROM graph_user WHERE email_user = 'admin@test.com') THEN
    INSERT INTO graph_user
      (id_user, email_user, password_user, role_user, tokens_user, created_at_user, updated_at_user)
    VALUES
      (gen_random_uuid(), 'admin@test.com', _hash, 'admin', 999, NOW(), NOW());
  END IF;
END$$;
