-- =============================================
-- SEED DATA FOR RabbitCTF DATABASE
-- =============================================

-- =============================================
-- 1. REFERENCE DATA (ROLES & DIFFICULTY LEVELS)
-- =============================================

-- Insert default roles
INSERT INTO role (name, description) VALUES 
('admin', 'System administrator with full access'),
('moderator', 'Event moderator with challenge management'),
('user', 'Regular user/competitor')
ON CONFLICT (name) DO NOTHING;

-- Insert difficulty levels
INSERT INTO difficulty (name, sort_order, description) VALUES 
('Easy', 1, 'Basic challenges for beginners'),
('Medium', 2, 'Intermediate challenges'),
('Hard', 3, 'Advanced challenges for experienced participants'),
('Insane', 4, 'Expert-level challenges')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. CHALLENGE CATEGORIES
-- =============================================

INSERT INTO challenge_category (name, description, is_active) VALUES 
('Web', 'Web application security challenges', TRUE),
('Crypto', 'Cryptography and encryption challenges', TRUE),
('Reverse', 'Reverse engineering challenges', TRUE),
('Pwn', 'Binary exploitation challenges', TRUE),
('Forensics', 'Digital forensics challenges', TRUE),
('Misc', 'Miscellaneous challenges', TRUE),
('OSINT', 'Open Source Intelligence challenges', TRUE),
('Steganography', 'Hidden information challenges', TRUE)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 3. USERS & CREDENTIALS
-- =============================================

-- Insert initial admin user (password: "admin123" - MUST be changed after first login)
-- Password hash generated with bcrypt rounds=12
INSERT INTO "user" (username, email, role_id) VALUES 
('admin', 'admin@rabbitctf.com', (SELECT id FROM role WHERE name = 'admin')),
('moderator', 'moderator@rabbitctf.com', (SELECT id FROM role WHERE name = 'moderator')),
('alice', 'alice@example.com', (SELECT id FROM role WHERE name = 'user')),
('bob', 'bob@example.com', (SELECT id FROM role WHERE name = 'user')),
('charlie', 'charlie@example.com', (SELECT id FROM role WHERE name = 'user')),
('diana', 'diana@example.com', (SELECT id FROM role WHERE name = 'user')),
('eve', 'eve@example.com', (SELECT id FROM role WHERE name = 'user')),
('frank', 'frank@example.com', (SELECT id FROM role WHERE name = 'user'))
ON CONFLICT (username) DO NOTHING;

-- Insert user credentials (password: "admin123" for admin, "password123" for others)
-- Note: These are placeholder hashes - replace with actual bcrypt hashes in production
INSERT INTO user_credential (user_id, password_hash, is_temp_password, must_change_password)
SELECT id, 
    CASE 
        WHEN username = 'admin' THEN '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEg3F6'
        ELSE '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
    END,
    CASE WHEN username IN ('admin', 'moderator') THEN TRUE ELSE FALSE END,
    CASE WHEN username IN ('admin', 'moderator') THEN TRUE ELSE FALSE END
FROM "user"
WHERE username IN ('admin', 'moderator', 'alice', 'bob', 'charlie', 'diana', 'eve', 'frank')
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- 4. TEAMS & MEMBERS
-- =============================================

-- Insert teams (captains: alice, charlie, eve)
INSERT INTO team (name, captain_id, total_score) VALUES 
('Team Alpha', (SELECT id FROM "user" WHERE username = 'alice'), 0),
('Team Beta', (SELECT id FROM "user" WHERE username = 'charlie'), 0),
('Team Gamma', (SELECT id FROM "user" WHERE username = 'eve'), 0)
ON CONFLICT (name) DO NOTHING;

-- Insert team credentials (password: "team123")
INSERT INTO team_credential (team_id, password_hash)
SELECT id, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
FROM team
WHERE name IN ('Team Alpha', 'Team Beta', 'Team Gamma')
ON CONFLICT (team_id) DO NOTHING;

-- Insert team members
INSERT INTO team_member (user_id, team_id) VALUES 
-- Team Alpha members
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha')),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha')),
-- Team Beta members
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta')),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta')),
-- Team Gamma members
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma')),
((SELECT id FROM "user" WHERE username = 'frank'), (SELECT id FROM team WHERE name = 'Team Gamma'))
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- 5. EVENT CONFIGURATION
-- =============================================

-- Insert initial event config
INSERT INTO event_config (
    event_name, 
    status, 
    max_team_size, 
    max_submission_attempts,
    submission_time_window_seconds,
    submission_block_minutes,
    max_file_size_mb,
    max_challenge_files_mb,
    allowed_file_types,
    event_timezone
) VALUES (
    'RabbitCTF 2025', 
    'not_started',
    4,
    5,
    60,
    5,
    100,
    500,
    '["zip", "tar.gz", "txt", "pdf", "pcap", "png", "jpg", "py", "c", "cpp"]'::json,
    'UTC'
);

-- =============================================
-- 6. CHALLENGES
-- =============================================

-- Insert sample challenges
INSERT INTO challenge (title, description, category_id, difficulty_id, created_by, is_draft) VALUES 
-- Easy challenges
(
    'Welcome to RabbitCTF',
    'This is a simple welcome challenge. Find the flag hidden in the description!\n\nHint: The flag format is RabbitCTF{...}\n\nFlag: RabbitCTF{w3lc0m3_t0_r4bb1t_ctf}',
    (SELECT id FROM challenge_category WHERE name = 'Misc'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Basic Web',
    'A simple web challenge. Inspect the page source to find the flag.',
    (SELECT id FROM challenge_category WHERE name = 'Web'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Caesar Cipher',
    'Decode this message: EnooviPGU{p4h45e_pvcuh4}',
    (SELECT id FROM challenge_category WHERE name = 'Crypto'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
-- Medium challenges
(
    'SQL Injection 101',
    'Can you bypass the login form? URL: http://challenge.local/login',
    (SELECT id FROM challenge_category WHERE name = 'Web'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Hidden Message',
    'There is a hidden message in this image. Can you find it?',
    (SELECT id FROM challenge_category WHERE name = 'Steganography'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
-- Hard challenges
(
    'Buffer Overflow',
    'Exploit this vulnerable binary to get the flag. Download: challenge.bin',
    (SELECT id FROM challenge_category WHERE name = 'Pwn'),
    (SELECT id FROM difficulty WHERE name = 'Hard'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'RSA Decryption',
    'Break this RSA encryption with weak keys. n=143, e=7, c=106',
    (SELECT id FROM challenge_category WHERE name = 'Crypto'),
    (SELECT id FROM difficulty WHERE name = 'Hard'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. CHALLENGE CONFIGURATIONS
-- =============================================

-- Insert score configurations for challenges
INSERT INTO challenge_score_config (challenge_id, scoring_mode, base_score, decay_factor, min_score)
SELECT 
    c.id,
    CASE 
        WHEN d.name = 'Easy' THEN 'STATIC'
        WHEN d.name = 'Medium' THEN 'DYNAMIC'
        ELSE 'DYNAMIC'
    END,
    CASE 
        WHEN d.name = 'Easy' THEN 100
        WHEN d.name = 'Medium' THEN 250
        WHEN d.name = 'Hard' THEN 500
        ELSE 750
    END,
    CASE 
        WHEN d.name IN ('Medium', 'Hard', 'Insane') THEN 0.9
        ELSE NULL
    END,
    CASE 
        WHEN d.name = 'Medium' THEN 100
        WHEN d.name = 'Hard' THEN 200
        WHEN d.name = 'Insane' THEN 300
        ELSE NULL
    END
FROM challenge c
JOIN difficulty d ON c.difficulty_id = d.id
ON CONFLICT (challenge_id) DO NOTHING;

-- Insert rule configurations
INSERT INTO challenge_rule_config (challenge_id, attempt_limit, is_case_sensitive)
SELECT 
    c.id,
    CASE 
        WHEN d.name = 'Easy' THEN 10
        WHEN d.name = 'Medium' THEN 7
        ELSE 5
    END,
    TRUE
FROM challenge c
JOIN difficulty d ON c.difficulty_id = d.id
ON CONFLICT (challenge_id) DO NOTHING;

-- Insert challenge flags (hashed with SHA256)
-- Example flags:
-- Challenge 1: RabbitCTF{w3lc0m3_t0_r4bb1t_ctf}
-- Challenge 2: RabbitCTF{1nsp3ct_th3_s0urc3}
-- Challenge 3: RabbitCTF{c43s4r_c1ph3r}
-- etc.
INSERT INTO challenge_flag (challenge_id, flag_hash)
SELECT 
    id,
    CASE 
        WHEN title = 'Welcome to RabbitCTF' THEN 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        WHEN title = 'Basic Web' THEN 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
        WHEN title = 'Caesar Cipher' THEN 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
        WHEN title = 'SQL Injection 101' THEN '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
        WHEN title = 'Hidden Message' THEN '2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6'
        WHEN title = 'Buffer Overflow' THEN '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4'
        WHEN title = 'RSA Decryption' THEN '3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea'
        ELSE 'default_hash'
    END
FROM challenge
WHERE title IN ('Welcome to RabbitCTF', 'Basic Web', 'Caesar Cipher', 'SQL Injection 101', 'Hidden Message', 'Buffer Overflow', 'RSA Decryption')
ON CONFLICT (challenge_id) DO NOTHING;

-- Insert visibility configurations
INSERT INTO challenge_visibility_config (challenge_id, is_visible)
SELECT id, TRUE
FROM challenge
WHERE is_draft = FALSE
ON CONFLICT (challenge_id) DO NOTHING;

-- =============================================
-- 8. EVENT RULES
-- =============================================

-- Insert initial event rules
INSERT INTO event_rule_version (content_md, version_number, created_by) VALUES
('# RabbitCTF 2025 - Official Rules

## Welcome to RabbitCTF!

This document contains the official rules for the RabbitCTF competition.

### General Rules:
1. **Respect**: Be respectful to other participants, organizers, and moderators
2. **Fair Play**: No sharing of flags or solutions during the competition
3. **Team Play**: Work only with your registered team members
4. **Attacks**: Do not attack the competition infrastructure
5. **Tools**: You may use any tools and techniques to solve challenges

### Flag Format:
- All flags follow the format: `RabbitCTF{...}`
- Flags are case-sensitive unless otherwise specified
- Submit only the complete flag including the format

### Scoring:
- Easy challenges: 100 points (static)
- Medium challenges: 100-250 points (dynamic)
- Hard challenges: 200-500 points (dynamic)
- Dynamic scoring decreases as more teams solve a challenge

### Submissions:
- Limited attempts per challenge (check individual challenge rules)
- Rate limiting applies to prevent brute-forcing
- Incorrect submissions may result in temporary blocks

### Prohibited Actions:
- Sharing flags or solutions with other teams
- Attacking other teams or the platform
- Using multiple accounts
- Automated mass flag submission
- DoS attacks on challenges or infrastructure

### Contact:
- For technical issues, contact the moderators
- For rule clarifications, check announcements or ask in general chat

**Good luck and have fun!**

*Last updated: November 2025*', 1, (SELECT id FROM "user" WHERE username = 'admin'))
ON CONFLICT DO NOTHING;

-- Set the current event rule version
INSERT INTO event_rule_current (id, active_version_id) 
SELECT 1, id FROM event_rule_version WHERE version_number = 1
ON CONFLICT (id) DO UPDATE SET active_version_id = EXCLUDED.active_version_id;

-- =============================================
-- 9. NOTIFICATIONS
-- =============================================

-- Insert welcome notification
INSERT INTO notification (title, message, type, is_published, created_by, published_at) VALUES 
(
    'Welcome to RabbitCTF 2025!',
    'The competition will begin soon. Please read the rules and prepare your team. Good luck!',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW()
),
(
    'Platform Maintenance',
    'The platform may undergo brief maintenance periods. We will notify you in advance.',
    'warning',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW()
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 10. SAMPLE AUDIT LOGS
-- =============================================

-- Insert sample audit logs
INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address) VALUES 
(
    (SELECT id FROM "user" WHERE username = 'admin'),
    'CREATE',
    'challenge',
    1,
    '{"action": "created_challenge", "challenge_title": "Welcome to RabbitCTF"}'::json,
    '127.0.0.1'
),
(
    (SELECT id FROM "user" WHERE username = 'alice'),
    'CREATE',
    'team',
    1,
    '{"action": "created_team", "team_name": "Team Alpha"}'::json,
    '192.168.1.100'
)
ON CONFLICT DO NOTHING;