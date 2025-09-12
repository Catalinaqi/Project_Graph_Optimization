-- =====================================================
-- RESET DATI
-- =====================================================

-- 1) Elimina richieste di cambio peso
DELETE FROM graph_weight_change_request;

-- 2) Elimina risultati simulazioni
DELETE FROM graph_simulation_result;

-- 3) Elimina simulazioni
DELETE FROM graph_simulation;

-- 4) Elimina transazioni token
DELETE FROM graph_token_transaction;

-- 5) Elimina versioni modelli
DELETE FROM graph_version;

-- 6) Elimina modelli
DELETE FROM graph_model;

-- 7) Elimina tutti gli utenti (compresi non admin)
DELETE FROM graph_user;

-- =====================================================
-- RESET SEQUENCE
-- =====================================================
ALTER SEQUENCE graph_user_id_user_seq RESTART WITH 1;
ALTER SEQUENCE graph_model_id_model_seq RESTART WITH 1;
ALTER SEQUENCE graph_weight_change_request_id_weight_change_request_seq RESTART WITH 1;
ALTER SEQUENCE graph_version_id_version_seq RESTART WITH 1;
ALTER SEQUENCE graph_token_transaction_id_token_transaction_seq RESTART WITH 1;

-- =====================================================
-- SEEDER: utenti + modelli + versioni

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
    _user02_id  INT;
    _user03_id  INT;
    _model1_id  INT;
    _model2_id  INT;
BEGIN
    -- Hash password
    SELECT crypt('admin123', gen_salt('bf', 12)) INTO _hash_admin;
    SELECT crypt('user123', gen_salt('bf', 12)) INTO _hash_user;

    -- ======================
    -- Admin
    -- ======================
    INSERT INTO graph_user (email_user, password_user, role_user, tokens_user)
    VALUES ('admin@test.com', _hash_admin, 'admin', 999)
    RETURNING id_user INTO _admin_id;

    -- ======================
    -- User 02
    -- ======================
    INSERT INTO graph_user (email_user, password_user, role_user, tokens_user)
    VALUES ('user02@test.com', _hash_user, 'user', 100)
    RETURNING id_user INTO _user02_id;

    -- ======================
    -- User 03
    -- ======================
    INSERT INTO graph_user (email_user, password_user, role_user, tokens_user)
    VALUES ('user03@test.com', _hash_user, 'user', 100)
    RETURNING id_user INTO _user03_id;

    -- ======================
    -- Modello 1 (Admin)
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
    -- Modello 2 (User02)
    -- ======================
    INSERT INTO graph_model (id_owner_user, name_model)
    VALUES (_user02_id, 'Model_2')
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
        10, 15, _user02_id
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
        10, 15, _user02_id
    );
END$$;
