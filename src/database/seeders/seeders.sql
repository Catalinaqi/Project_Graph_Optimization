-- ============================================
-- Seeders provide:
-- * 1 Admin user, multiple standard users
-- * Initial graph models (≥ 10 nodes, ≥ 15 edges)
-- * At least 2 versions each
-- ============================================
DO $$
DECLARE
    _hash_admin TEXT;
    _hash_user  TEXT;
    _admin_id   INT;
    _user1_id   INT;
    _user2_id   INT;
    _model1_id  INT;
    _model2_id  INT;
BEGIN
    -- Creazione hash password
    SELECT crypt('admin123', gen_salt('bf', 12)) INTO _hash_admin;
    SELECT crypt('user123', gen_salt('bf', 12)) INTO _hash_user;

    -- ======================
    -- Admin
    -- ======================
    INSERT INTO graph_user (email_user, password_user, role_user, tokens_user)
    VALUES ('admin@test.com', _hash_admin, 'admin', 999)
    ON CONFLICT (email_user) DO NOTHING
    RETURNING id_user INTO _admin_id;

    IF _admin_id IS NULL THEN
        SELECT id_user INTO _admin_id
        FROM graph_user WHERE email_user = 'admin@test.com'
        LIMIT 1;
    END IF;

    -- ======================
    -- User1
    -- ======================
    INSERT INTO graph_user (email_user, password_user, role_user, tokens_user)
    VALUES ('user1@test.com', _hash_user, 'user', 100)
    ON CONFLICT (email_user) DO NOTHING
    RETURNING id_user INTO _user1_id;

    IF _user1_id IS NULL THEN
        SELECT id_user INTO _user1_id
        FROM graph_user WHERE email_user = 'user1@test.com'
        LIMIT 1;
    END IF;

    -- ======================
    -- User2
    -- ======================
    INSERT INTO graph_user (email_user, password_user, role_user, tokens_user)
    VALUES ('user2@test.com', _hash_user, 'user', 100)
    ON CONFLICT (email_user) DO NOTHING
    RETURNING id_user INTO _user2_id;

    IF _user2_id IS NULL THEN
        SELECT id_user INTO _user2_id
        FROM graph_user WHERE email_user = 'user2@test.com'
        LIMIT 1;
    END IF;

    -- ======================
    -- Modello 1 (Admin owner)
    -- ======================
    INSERT INTO graph_model (id_owner_user, name_model)
    VALUES (_admin_id, 'Model_1')
    RETURNING id_model INTO _model1_id;

    -- Versione 1
    INSERT INTO graph_version (id_model, version_number_version, graph_version, node_count_version, edge_count_version, id_creator_user)
    VALUES (
        _model1_id, 1,
        '{
          "nodes": ["A","B","C","D","E","F","G","H","I","J"],
          "edges": [
            {"from":"A","to":"B","weight":1}, {"from":"A","to":"C","weight":2}, {"from":"B","to":"D","weight":3},
            {"from":"C","to":"D","weight":4}, {"from":"D","to":"E","weight":2}, {"from":"E","to":"F","weight":5},
            {"from":"F","to":"G","weight":1}, {"from":"G","to":"H","weight":3}, {"from":"H","to":"I","weight":2},
            {"from":"I","to":"J","weight":4}, {"from":"A","to":"J","weight":6}, {"from":"B","to":"I","weight":2},
            {"from":"C","to":"H","weight":3}, {"from":"D","to":"G","weight":1}, {"from":"E","to":"F","weight":2}
          ]
        }'::jsonb,
        10, 15, _admin_id
    );

    -- Versione 2
    INSERT INTO graph_version (id_model, version_number_version, graph_version, node_count_version, edge_count_version, id_creator_user)
    VALUES (
        _model1_id, 2,
        '{
          "nodes": ["A","B","C","D","E","F","G","H","I","J"],
          "edges": [
            {"from":"A","to":"B","weight":2}, {"from":"B","to":"C","weight":1}, {"from":"C","to":"D","weight":2},
            {"from":"D","to":"E","weight":3}, {"from":"E","to":"F","weight":4}, {"from":"F","to":"G","weight":2},
            {"from":"G","to":"H","weight":2}, {"from":"H","to":"I","weight":5}, {"from":"I","to":"J","weight":1},
            {"from":"J","to":"A","weight":3}, {"from":"B","to":"H","weight":2}, {"from":"C","to":"I","weight":3},
            {"from":"D","to":"F","weight":4}, {"from":"E","to":"J","weight":2}, {"from":"G","to":"A","weight":1}
          ]
        }'::jsonb,
        10, 15, _admin_id
    );

    -- ======================
    -- Modello 2 (User1 owner)
    -- ======================
    INSERT INTO graph_model (id_owner_user, name_model)
    VALUES (_user1_id, 'Model_2')
    RETURNING id_model INTO _model2_id;

    -- Versione 1
    INSERT INTO graph_version (id_model, version_number_version, graph_version, node_count_version, edge_count_version, id_creator_user)
    VALUES (
        _model2_id, 1,
        '{
          "nodes": ["N1","N2","N3","N4","N5","N6","N7","N8","N9","N10"],
          "edges": [
            {"from":"N1","to":"N2","weight":1}, {"from":"N2","to":"N3","weight":2}, {"from":"N3","to":"N4","weight":3},
            {"from":"N4","to":"N5","weight":1}, {"from":"N5","to":"N6","weight":2}, {"from":"N6","to":"N7","weight":3},
            {"from":"N7","to":"N8","weight":4}, {"from":"N8","to":"N9","weight":1}, {"from":"N9","to":"N10","weight":5},
            {"from":"N10","to":"N1","weight":2}, {"from":"N2","to":"N8","weight":2}, {"from":"N3","to":"N9","weight":3},
            {"from":"N4","to":"N10","weight":1}, {"from":"N5","to":"N7","weight":2}, {"from":"N6","to":"N1","weight":4}
          ]
        }'::jsonb,
        10, 15, _user1_id
    );

    -- Versione 2
    INSERT INTO graph_version (id_model, version_number_version, graph_version, node_count_version, edge_count_version, id_creator_user)
    VALUES (
        _model2_id, 2,
        '{
          "nodes": ["N1","N2","N3","N4","N5","N6","N7","N8","N9","N10"],
          "edges": [
            {"from":"N1","to":"N3","weight":2}, {"from":"N2","to":"N4","weight":3}, {"from":"N3","to":"N5","weight":1},
            {"from":"N4","to":"N6","weight":4}, {"from":"N5","to":"N7","weight":2}, {"from":"N6","to":"N8","weight":5},
            {"from":"N7","to":"N9","weight":3}, {"from":"N8","to":"N10","weight":1}, {"from":"N9","to":"N1","weight":2},
            {"from":"N10","to":"N2","weight":4}, {"from":"N3","to":"N7","weight":3}, {"from":"N4","to":"N8","weight":2},
            {"from":"N5","to":"N9","weight":4}, {"from":"N6","to":"N10","weight":1}, {"from":"N7","to":"N2","weight":2}
          ]
        }'::jsonb,
        10, 15, _user1_id
    );
END$$;
