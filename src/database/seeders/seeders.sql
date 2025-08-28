-- ============================================
-- Seeders provide:
-- * 1 Admin user, multiple standard users
-- * Initial graph models (≥ 10 nodes, ≥ 15 edges)
-- * At least 2 versions each
-- ============================================

DO $$
DECLARE
_hash_admin TEXT;
    _hash_user TEXT;
BEGIN
    -- bcrypt with 12 rounds (requires pgcrypto extension)
SELECT crypt('admin123', gen_salt('bf', 12)) INTO _hash_admin;
SELECT crypt('user123', gen_salt('bf', 12)) INTO _hash_user;

-- Insert Admin user if not exists
IF NOT EXISTS (SELECT 1 FROM graph_user WHERE email_user = 'admin@test.com') THEN
        INSERT INTO graph_user (email_user, password_user, role_user, tokens_user, created_at_user, updated_at_user)
        VALUES ('admin@test.com', _hash_admin, 'admin', 999, NOW(), NOW());
END IF;

    -- Insert standard users if not exists
    IF NOT EXISTS (SELECT 1 FROM graph_user WHERE email_user = 'user1@test.com') THEN
        INSERT INTO graph_user (email_user, password_user, role_user, tokens_user, created_at_user, updated_at_user)
        VALUES 
            ('user1@test.com', _hash_user, 'user', 100, NOW(), NOW()),
            ('user2@test.com', _hash_user, 'user', 100, NOW(), NOW());
END IF;

    -- Insert initial graph models (≥ 10 nodes, ≥ 15 edges)
    -- Model 1 - Version 1
INSERT INTO graph_model (name_model, owner_id, created_at_model)
VALUES ('Model_1_v1', (SELECT id_user FROM graph_user WHERE email_user = 'admin@test.com'), NOW());

-- Model 1 - Version 2
INSERT INTO graph_model (name_model, owner_id, created_at_model)
VALUES ('Model_1_v2', (SELECT id_user FROM graph_user WHERE email_user = 'admin@test.com'), NOW());

-- Model 2 - Version 1
INSERT INTO graph_model (name_model, owner_id, created_at_model)
VALUES ('Model_2_v1', (SELECT id_user FROM graph_user WHERE email_user = 'user1@test.com'), NOW());

-- Model 2 - Version 2
INSERT INTO graph_model (name_model, owner_id, created_at_model)
VALUES ('Model_2_v2', (SELECT id_user FROM graph_user WHERE email_user = 'user1@test.com'), NOW());

-- Insert nodes and edges (example with >=10 nodes, >=15 edges)
-- You would adapt with your real schema for graph_node and graph_edge
-- Example for Model_1_v1
INSERT INTO graph_node (id_model, name_node) VALUES
                                                 (1, 'A'), (1, 'B'), (1, 'C'), (1, 'D'), (1, 'E'),
                                                 (1, 'F'), (1, 'G'), (1, 'H'), (1, 'I'), (1, 'J');

INSERT INTO graph_edge (id_model, source_node, target_node, weight_edge) VALUES
                                                                             (1, 'A', 'B', 1), (1, 'A', 'C', 2), (1, 'B', 'D', 3), (1, 'C', 'D', 4),
                                                                             (1, 'D', 'E', 2), (1, 'E', 'F', 5), (1, 'F', 'G', 1), (1, 'G', 'H', 3),
                                                                             (1, 'H', 'I', 2), (1, 'I', 'J', 4), (1, 'A', 'J', 6), (1, 'B', 'I', 2),
                                                                             (1, 'C', 'H', 3), (1, 'D', 'G', 1), (1, 'E', 'F', 2);

END$$;
