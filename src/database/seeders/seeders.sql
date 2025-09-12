-- =====================================================
-- RESET DATI
-- =====================================================

DELETE FROM graph_weight_change_request;
DELETE FROM graph_simulation_result;
DELETE FROM graph_simulation;
DELETE FROM graph_token_transaction;
DELETE FROM graph_version;
DELETE FROM graph_model;
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
-- =====================================================
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
    SELECT crypt('12345678', gen_salt('bf', 12)) INTO _hash_user;

    -- Admin (id = 1)
    INSERT INTO graph_user (email_user, password_user, role_user, tokens_user)
    VALUES ('admin@test.com', _hash_admin, 'admin', 999)
    RETURNING id_user INTO _admin_id;

    -- User02 (id = 2)
    INSERT INTO graph_user (email_user, password_user, role_user, tokens_user)
    VALUES ('user02@test.com', _hash_user, 'user', 100)
    RETURNING id_user INTO _user02_id;

    -- User03 (id = 3)
    INSERT INTO graph_user (email_user, password_user, role_user, tokens_user)
    VALUES ('user03@test.com', _hash_user, 'user', 100)
    RETURNING id_user INTO _user03_id;

    -- ======================
    -- Modello 1 (User02 owner → nodi A-L)
    -- ======================
    INSERT INTO graph_model (id_owner_user, name_model)
    VALUES (_user02_id, 'Model_1')
    RETURNING id_model INTO _model1_id;

    -- Versione 1
    INSERT INTO graph_version (id_model, version_number_version, graph_version,
                               node_count_version, edge_count_version, id_creator_user)
    VALUES (
        _model1_id, 1,
        '{
          "A": {"B": 1.2, "C": 2.5},
          "B": {"A": 1.2, "D": 2.3, "E": 1.8},
          "C": {"A": 2.5, "F": 1.7, "G": 2.9},
          "D": {"B": 2.3, "H": 2.4},
          "E": {"B": 1.8, "I": 1.6, "J": 2.1},
          "F": {"C": 1.7, "K": 2.5},
          "G": {"C": 2.9, "L": 1.9},
          "H": {"D": 2.4, "I": 2.2},
          "I": {"E": 1.6, "H": 2.2, "J": 1.5},
          "J": {"E": 2.1, "I": 1.5, "K": 2.7},
          "K": {"F": 2.5, "J": 2.7, "L": 1.4},
          "L": {"G": 1.9, "K": 1.4}
        }'::jsonb,
        12, 15, _user02_id
    );

    -- Versione 2 (pesos modificados)
    INSERT INTO graph_version (id_model, version_number_version, graph_version,
                               node_count_version, edge_count_version, id_creator_user)
    VALUES (
        _model1_id, 2,
        '{
          "A": {"B": 1.5, "C": 2.7},
          "B": {"A": 1.5, "D": 2.1, "E": 2.0},
          "C": {"A": 2.7, "F": 1.9, "G": 3.0},
          "D": {"B": 2.1, "H": 2.2},
          "E": {"B": 2.0, "I": 1.8, "J": 2.3},
          "F": {"C": 1.9, "K": 2.8},
          "G": {"C": 3.0, "L": 2.0},
          "H": {"D": 2.2, "I": 2.4},
          "I": {"E": 1.8, "H": 2.4, "J": 1.7},
          "J": {"E": 2.3, "I": 1.7, "K": 2.9},
          "K": {"F": 2.8, "J": 2.9, "L": 1.6},
          "L": {"G": 2.0, "K": 1.6}
        }'::jsonb,
        12, 15, _user02_id
    );

    -- ======================
    -- Modello 2 (User03 owner → nodi N1-N12)
    -- ======================
    INSERT INTO graph_model (id_owner_user, name_model)
    VALUES (_user03_id, 'Model_2')
    RETURNING id_model INTO _model2_id;

    -- Versione 1
    INSERT INTO graph_version (id_model, version_number_version, graph_version,
                               node_count_version, edge_count_version, id_creator_user)
    VALUES (
        _model2_id, 1,
        '{
          "N1": {"N2": 1.3, "N3": 2.1},
          "N2": {"N1": 1.3, "N4": 2.5, "N5": 1.9},
          "N3": {"N1": 2.1, "N6": 1.8},
          "N4": {"N2": 2.5, "N7": 2.0},
          "N5": {"N2": 1.9, "N8": 2.2},
          "N6": {"N3": 1.8, "N9": 2.6},
          "N7": {"N4": 2.0, "N10": 2.3},
          "N8": {"N5": 2.2, "N11": 1.7},
          "N9": {"N6": 2.6, "N12": 2.8},
          "N10": {"N7": 2.3, "N11": 2.4},
          "N11": {"N8": 1.7, "N10": 2.4, "N12": 1.5},
          "N12": {"N9": 2.8, "N11": 1.5}
        }'::jsonb,
        12, 15, _user03_id
    );

    -- Versione 2 (pesos modificados)
    INSERT INTO graph_version (id_model, version_number_version, graph_version,
                               node_count_version, edge_count_version, id_creator_user)
    VALUES (
        _model2_id, 2,
        '{
          "N1": {"N2": 1.4, "N3": 2.2},
          "N2": {"N1": 1.4, "N4": 2.6, "N5": 2.0},
          "N3": {"N1": 2.2, "N6": 2.0},
          "N4": {"N2": 2.6, "N7": 2.1},
          "N5": {"N2": 2.0, "N8": 2.4},
          "N6": {"N3": 2.0, "N9": 2.7},
          "N7": {"N4": 2.1, "N10": 2.5},
          "N8": {"N5": 2.4, "N11": 1.9},
          "N9": {"N6": 2.7, "N12": 3.0},
          "N10": {"N7": 2.5, "N11": 2.6},
          "N11": {"N8": 1.9, "N10": 2.6, "N12": 1.7},
          "N12": {"N9": 3.0, "N11": 1.7}
        }'::jsonb,
        12, 15, _user03_id
    );
END$$;
