DO $$
DECLARE _hash TEXT;
BEGIN
    -- bcrypt with 12 rounds (requires pgcrypto extension if using crypt/salt)
SELECT crypt('admin123', gen_salt('bf', 12)) INTO _hash;

IF NOT EXISTS (SELECT 1 FROM graph_user WHERE email_user = 'admin@test.com') THEN
        INSERT INTO graph_user
          (email_user, password_user, role_user, tokens_user, created_at_user, updated_at_user)
        VALUES
          ('admin@test.com', _hash, 'admin', 999, NOW(), NOW());
END IF;
END$$;