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
('frank', 'frank@example.com', (SELECT id FROM role WHERE name = 'user')),
('grace', 'grace@example.com', (SELECT id FROM role WHERE name = 'user')),
('hank', 'hank@example.com', (SELECT id FROM role WHERE name = 'user')),
('ivy', 'ivy@example.com', (SELECT id FROM role WHERE name = 'user')),
('jack', 'jack@example.com', (SELECT id FROM role WHERE name = 'user')),
('kate', 'kate@example.com', (SELECT id FROM role WHERE name = 'user')),
('leo', 'leo@example.com', (SELECT id FROM role WHERE name = 'user')),
('maya', 'maya@example.com', (SELECT id FROM role WHERE name = 'user')),
('noah', 'noah@example.com', (SELECT id FROM role WHERE name = 'user')),
('olivia', 'olivia@example.com', (SELECT id FROM role WHERE name = 'user')),
('peter', 'peter@example.com', (SELECT id FROM role WHERE name = 'user')),
('quinn', 'quinn@example.com', (SELECT id FROM role WHERE name = 'user')),
('ryan', 'ryan@example.com', (SELECT id FROM role WHERE name = 'user')),
('sarah', 'sarah@example.com', (SELECT id FROM role WHERE name = 'user')),
('tom', 'tom@example.com', (SELECT id FROM role WHERE name = 'user')),
('uma', 'uma@example.com', (SELECT id FROM role WHERE name = 'user')),
('victor', 'victor@example.com', (SELECT id FROM role WHERE name = 'user')),
('wendy', 'wendy@example.com', (SELECT id FROM role WHERE name = 'user')),
('xavier', 'xavier@example.com', (SELECT id FROM role WHERE name = 'user')),
('yara', 'yara@example.com', (SELECT id FROM role WHERE name = 'user')),
('zack', 'zack@example.com', (SELECT id FROM role WHERE name = 'user'))
ON CONFLICT (username) DO NOTHING;

-- Insert user credentials
-- Password hashes generated with bcrypt 4.2.1
-- admin: admin123, moderator: moderator123, others: password123
INSERT INTO user_credential (user_id, password_hash, is_temp_password, must_change_password)
SELECT id, 
    CASE 
        WHEN username = 'admin' THEN '$2b$12$hGgbPXqMSqhlHEGr6.Qobu9i0195UgBFZJlJp4zzgRu9Y81nNJv2q'
        WHEN username = 'moderator' THEN '$2b$12$oX6/w5bJj9QYl7M4qoyeFelLRGF8vRgcJqw8xB8/4I5o29N4ImY0y'
        ELSE '$2b$12$.6W.XaE8GOJ4h4Whqt1rGOhwMcfqckJVuL0fcB5s/oguaovy35yKu'
    END,
    CASE WHEN username IN ('admin', 'moderator') THEN TRUE ELSE FALSE END,
    CASE WHEN username IN ('admin', 'moderator') THEN TRUE ELSE FALSE END
FROM "user"
ON CONFLICT (user_id) DO NOTHING;

-- Insert password reset requests (at least 20)
INSERT INTO password_reset_request (user_id, requested_at, is_processed) VALUES
((SELECT id FROM "user" WHERE username = 'alice'), NOW() - INTERVAL '5 days', TRUE),
((SELECT id FROM "user" WHERE username = 'bob'), NOW() - INTERVAL '4 days', TRUE),
((SELECT id FROM "user" WHERE username = 'charlie'), NOW() - INTERVAL '3 days', FALSE),
((SELECT id FROM "user" WHERE username = 'diana'), NOW() - INTERVAL '2 days', FALSE),
((SELECT id FROM "user" WHERE username = 'eve'), NOW() - INTERVAL '1 day', FALSE),
((SELECT id FROM "user" WHERE username = 'frank'), NOW() - INTERVAL '6 hours', FALSE),
((SELECT id FROM "user" WHERE username = 'grace'), NOW() - INTERVAL '10 days', TRUE),
((SELECT id FROM "user" WHERE username = 'hank'), NOW() - INTERVAL '9 days', TRUE),
((SELECT id FROM "user" WHERE username = 'ivy'), NOW() - INTERVAL '8 days', TRUE),
((SELECT id FROM "user" WHERE username = 'jack'), NOW() - INTERVAL '7 days', TRUE),
((SELECT id FROM "user" WHERE username = 'kate'), NOW() - INTERVAL '6 days', FALSE),
((SELECT id FROM "user" WHERE username = 'leo'), NOW() - INTERVAL '11 days', TRUE),
((SELECT id FROM "user" WHERE username = 'maya'), NOW() - INTERVAL '12 days', TRUE),
((SELECT id FROM "user" WHERE username = 'noah'), NOW() - INTERVAL '13 days', TRUE),
((SELECT id FROM "user" WHERE username = 'olivia'), NOW() - INTERVAL '14 days', TRUE),
((SELECT id FROM "user" WHERE username = 'peter'), NOW() - INTERVAL '15 days', TRUE),
((SELECT id FROM "user" WHERE username = 'quinn'), NOW() - INTERVAL '16 days', FALSE),
((SELECT id FROM "user" WHERE username = 'ryan'), NOW() - INTERVAL '17 days', TRUE),
((SELECT id FROM "user" WHERE username = 'sarah'), NOW() - INTERVAL '18 days', TRUE),
((SELECT id FROM "user" WHERE username = 'tom'), NOW() - INTERVAL '19 days', TRUE),
((SELECT id FROM "user" WHERE username = 'uma'), NOW() - INTERVAL '20 days', TRUE),
((SELECT id FROM "user" WHERE username = 'victor'), NOW() - INTERVAL '21 days', FALSE),
((SELECT id FROM "user" WHERE username = 'wendy'), NOW() - INTERVAL '22 days', TRUE),
((SELECT id FROM "user" WHERE username = 'xavier'), NOW() - INTERVAL '23 days', TRUE)
ON CONFLICT DO NOTHING;

-- =============================================
-- 4. TEAMS & MEMBERS
-- =============================================

-- Insert teams (captains: alice, charlie, eve, grace, jack, leo, noah, peter, ryan, sarah, victor, yara)
INSERT INTO team (name, captain_id, total_score) VALUES 
('Team Alpha', (SELECT id FROM "user" WHERE username = 'alice'), 0),
('Team Beta', (SELECT id FROM "user" WHERE username = 'charlie'), 0),
('Team Gamma', (SELECT id FROM "user" WHERE username = 'eve'), 0),
('Team Delta', (SELECT id FROM "user" WHERE username = 'grace'), 0),
('Team Epsilon', (SELECT id FROM "user" WHERE username = 'jack'), 0),
('Team Zeta', (SELECT id FROM "user" WHERE username = 'leo'), 0),
('Team Eta', (SELECT id FROM "user" WHERE username = 'noah'), 0),
('Team Theta', (SELECT id FROM "user" WHERE username = 'peter'), 0),
('Team Iota', (SELECT id FROM "user" WHERE username = 'ryan'), 0),
('Team Kappa', (SELECT id FROM "user" WHERE username = 'sarah'), 0),
('Team Lambda', (SELECT id FROM "user" WHERE username = 'victor'), 0),
('Team Mu', (SELECT id FROM "user" WHERE username = 'yara'), 0),
('Team Nu', (SELECT id FROM "user" WHERE username = 'wendy'), 0),
('Team Xi', (SELECT id FROM "user" WHERE username = 'xavier'), 0),
('Team Omicron', (SELECT id FROM "user" WHERE username = 'zack'), 0),
('Team Pi', (SELECT id FROM "user" WHERE username = 'hank'), 0),
('Team Rho', (SELECT id FROM "user" WHERE username = 'kate'), 0),
('Team Sigma', (SELECT id FROM "user" WHERE username = 'olivia'), 0),
('Team Tau', (SELECT id FROM "user" WHERE username = 'quinn'), 0),
('Team Upsilon', (SELECT id FROM "user" WHERE username = 'tom'), 0)
ON CONFLICT (name) DO NOTHING;

-- Insert team credentials (password: "team123")
INSERT INTO team_credential (team_id, password_hash)
SELECT id, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
FROM team
ON CONFLICT (team_id) DO NOTHING;

-- Insert team members (at least 20)
INSERT INTO team_member (user_id, team_id) VALUES 
-- Team Alpha members
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha')),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha')),
-- Team Beta members
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta')),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta')),
-- Team Gamma members
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma')),
((SELECT id FROM "user" WHERE username = 'frank'), (SELECT id FROM team WHERE name = 'Team Gamma')),
-- Team Delta members
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta')),
-- Team Epsilon members
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon')),
-- Team Zeta members
((SELECT id FROM "user" WHERE username = 'leo'), (SELECT id FROM team WHERE name = 'Team Zeta')),
((SELECT id FROM "user" WHERE username = 'maya'), (SELECT id FROM team WHERE name = 'Team Zeta')),
-- Team Eta members
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM team WHERE name = 'Team Eta')),
-- Team Theta members
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM team WHERE name = 'Team Theta')),
-- Team Iota members
((SELECT id FROM "user" WHERE username = 'ryan'), (SELECT id FROM team WHERE name = 'Team Iota')),
-- Team Kappa members
((SELECT id FROM "user" WHERE username = 'sarah'), (SELECT id FROM team WHERE name = 'Team Kappa')),
((SELECT id FROM "user" WHERE username = 'uma'), (SELECT id FROM team WHERE name = 'Team Kappa')),
-- Team Lambda members
((SELECT id FROM "user" WHERE username = 'victor'), (SELECT id FROM team WHERE name = 'Team Lambda')),
-- Team Mu members
((SELECT id FROM "user" WHERE username = 'yara'), (SELECT id FROM team WHERE name = 'Team Mu')),
-- Team Nu members
((SELECT id FROM "user" WHERE username = 'wendy'), (SELECT id FROM team WHERE name = 'Team Nu')),
-- Team Xi members
((SELECT id FROM "user" WHERE username = 'xavier'), (SELECT id FROM team WHERE name = 'Team Xi')),
-- Team Omicron members
((SELECT id FROM "user" WHERE username = 'zack'), (SELECT id FROM team WHERE name = 'Team Omicron')),
-- Team Pi members
((SELECT id FROM "user" WHERE username = 'hank'), (SELECT id FROM team WHERE name = 'Team Pi')),
((SELECT id FROM "user" WHERE username = 'ivy'), (SELECT id FROM team WHERE name = 'Team Pi')),
-- Team Rho members
((SELECT id FROM "user" WHERE username = 'kate'), (SELECT id FROM team WHERE name = 'Team Rho')),
-- Team Sigma members
((SELECT id FROM "user" WHERE username = 'olivia'), (SELECT id FROM team WHERE name = 'Team Sigma')),
-- Team Tau members
((SELECT id FROM "user" WHERE username = 'quinn'), (SELECT id FROM team WHERE name = 'Team Tau')),
-- Team Upsilon members
((SELECT id FROM "user" WHERE username = 'tom'), (SELECT id FROM team WHERE name = 'Team Upsilon'))
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

-- Insert sample challenges (30 challenges covering all categories and difficulties)
INSERT INTO challenge (title, description, category_id, difficulty_id, created_by, is_draft) VALUES 
-- Easy challenges (10)
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
(
    'Cookie Monster',
    'Analyze the cookies to find the hidden flag.',
    (SELECT id FROM challenge_category WHERE name = 'Web'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Base64 Basics',
    'Decode this: UmFiYml0Q1RGe2I0czM2NF9kM2MwZDFuZ30=',
    (SELECT id FROM challenge_category WHERE name = 'Crypto'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Image Metadata',
    'Find the flag hidden in the image EXIF data.',
    (SELECT id FROM challenge_category WHERE name = 'Forensics'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Simple Reverse',
    'Reverse this string to get the flag: }3sr3v3r_3lpm1s{FTCtibb4R',
    (SELECT id FROM challenge_category WHERE name = 'Reverse'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Network Traffic',
    'Analyze this PCAP file to find credentials.',
    (SELECT id FROM challenge_category WHERE name = 'Forensics'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Social Media Hunt',
    'Find the hidden account on Twitter related to RabbitCTF.',
    (SELECT id FROM challenge_category WHERE name = 'OSINT'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Hidden in Plain Sight',
    'The flag is in this text file, but you need to look carefully.',
    (SELECT id FROM challenge_category WHERE name = 'Misc'),
    (SELECT id FROM difficulty WHERE name = 'Easy'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
-- Medium challenges (10)
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
(
    'XOR Encryption',
    'Decrypt the message encrypted with XOR cipher. Key length: 5',
    (SELECT id FROM challenge_category WHERE name = 'Crypto'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'JWT Manipulation',
    'Can you forge a valid JWT token to access admin panel?',
    (SELECT id FROM challenge_category WHERE name = 'Web'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Memory Forensics',
    'Analyze this memory dump to extract the password.',
    (SELECT id FROM challenge_category WHERE name = 'Forensics'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'API Enumeration',
    'Find the hidden API endpoint that returns the flag.',
    (SELECT id FROM challenge_category WHERE name = 'Web'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Binary Analysis',
    'Analyze this binary to find the hardcoded password.',
    (SELECT id FROM challenge_category WHERE name = 'Reverse'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Wireless Attack',
    'Crack the WPA2 password from this capture file.',
    (SELECT id FROM challenge_category WHERE name = 'Forensics'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Digital Footprint',
    'Track down the location of this person using available information.',
    (SELECT id FROM challenge_category WHERE name = 'OSINT'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Audio Steganography',
    'Extract the hidden message from this audio file.',
    (SELECT id FROM challenge_category WHERE name = 'Steganography'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
-- Hard challenges (7)
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
),
(
    'Advanced SQL Injection',
    'Blind SQL injection challenge. Extract the admin password.',
    (SELECT id FROM challenge_category WHERE name = 'Web'),
    (SELECT id FROM difficulty WHERE name = 'Hard'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Format String Exploit',
    'Exploit the format string vulnerability to read the flag.',
    (SELECT id FROM challenge_category WHERE name = 'Pwn'),
    (SELECT id FROM difficulty WHERE name = 'Hard'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Advanced Crypto',
    'Break the AES encryption with side-channel attack.',
    (SELECT id FROM challenge_category WHERE name = 'Crypto'),
    (SELECT id FROM difficulty WHERE name = 'Hard'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Reverse Engineering Pro',
    'Reverse this obfuscated binary to find the flag.',
    (SELECT id FROM challenge_category WHERE name = 'Reverse'),
    (SELECT id FROM difficulty WHERE name = 'Hard'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Deep Web Investigation',
    'Use OSINT techniques to find the hidden service.',
    (SELECT id FROM challenge_category WHERE name = 'OSINT'),
    (SELECT id FROM difficulty WHERE name = 'Hard'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
-- Insane challenges (3)
(
    'Kernel Exploitation',
    'Exploit the Linux kernel vulnerability to escalate privileges.',
    (SELECT id FROM challenge_category WHERE name = 'Pwn'),
    (SELECT id FROM difficulty WHERE name = 'Insane'),
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
(
    'Elliptic Curve Cryptography',
    'Break the ECC implementation with mathematical attack.',
    (SELECT id FROM challenge_category WHERE name = 'Crypto'),
    (SELECT id FROM difficulty WHERE name = 'Insane'),
    (SELECT id FROM "user" WHERE username = 'moderator'),
    FALSE
),
(
    'Multi-Layer Obfuscation',
    'Reverse engineer this heavily obfuscated malware.',
    (SELECT id FROM challenge_category WHERE name = 'Reverse'),
    (SELECT id FROM difficulty WHERE name = 'Insane'),
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
INSERT INTO challenge_flag (challenge_id, flag_hash)
SELECT 
    id,
    CASE 
        WHEN title = 'Welcome to RabbitCTF' THEN 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        WHEN title = 'Basic Web' THEN 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
        WHEN title = 'Caesar Cipher' THEN 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
        WHEN title = 'Cookie Monster' THEN '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
        WHEN title = 'Base64 Basics' THEN '2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6'
        WHEN title = 'Image Metadata' THEN '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4'
        WHEN title = 'Simple Reverse' THEN '3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea'
        WHEN title = 'Network Traffic' THEN '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
        WHEN title = 'Social Media Hunt' THEN '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
        WHEN title = 'Hidden in Plain Sight' THEN '6b51d431df5d7f141cbececcf79edf3dd861c3b4069f0b11661a3eefacbba918'
        WHEN title = 'SQL Injection 101' THEN '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
        WHEN title = 'Hidden Message' THEN '2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6'
        WHEN title = 'XOR Encryption' THEN '5267768822ee624d48fce15ec5ca79cbd602cb7f4c2157a516556991f22ef8c7'
        WHEN title = 'JWT Manipulation' THEN '7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451'
        WHEN title = 'Memory Forensics' THEN '8f14e45fceea167a5a36dedd4bea2543fa38d84fe8be4c7e4c5e1d1e4fbe5c8c'
        WHEN title = 'API Enumeration' THEN '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
        WHEN title = 'Binary Analysis' THEN 'a3b14d2f3c6e8b7a1d5c9f4e2b8a7c6d5f9e1a3b7c4d8e2f6a1b5c9d3e7f4a8b'
        WHEN title = 'Wireless Attack' THEN 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2'
        WHEN title = 'Digital Footprint' THEN 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4'
        WHEN title = 'Audio Steganography' THEN 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6'
        WHEN title = 'Buffer Overflow' THEN '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4'
        WHEN title = 'RSA Decryption' THEN '3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea'
        WHEN title = 'Advanced SQL Injection' THEN 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8'
        WHEN title = 'Format String Exploit' THEN 'f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0'
        WHEN title = 'Advanced Crypto' THEN 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
        WHEN title = 'Reverse Engineering Pro' THEN 'b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4'
        WHEN title = 'Deep Web Investigation' THEN 'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
        WHEN title = 'Kernel Exploitation' THEN 'd7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8'
        WHEN title = 'Elliptic Curve Cryptography' THEN 'e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0'
        WHEN title = 'Multi-Layer Obfuscation' THEN 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2'
        ELSE 'default_hash'
    END
FROM challenge
ON CONFLICT (challenge_id) DO NOTHING;

-- Insert challenge files (at least 20)
INSERT INTO challenge_file (challenge_id, file_path, file_name, file_type, file_size_mb) VALUES
((SELECT id FROM challenge WHERE title = 'Basic Web'), '/uploads/challenges/basic_web/index.html', 'index.html', 'html', 0.001),
((SELECT id FROM challenge WHERE title = 'Caesar Cipher'), '/uploads/challenges/caesar/encrypted.txt', 'encrypted.txt', 'txt', 0.001),
((SELECT id FROM challenge WHERE title = 'Image Metadata'), '/uploads/challenges/metadata/photo.jpg', 'photo.jpg', 'jpg', 2.5),
((SELECT id FROM challenge WHERE title = 'Simple Reverse'), '/uploads/challenges/reverse/message.txt', 'message.txt', 'txt', 0.001),
((SELECT id FROM challenge WHERE title = 'Network Traffic'), '/uploads/challenges/network/capture.pcap', 'capture.pcap', 'pcap', 15.3),
((SELECT id FROM challenge WHERE title = 'SQL Injection 101'), '/uploads/challenges/sqli/webapp.zip', 'webapp.zip', 'zip', 5.2),
((SELECT id FROM challenge WHERE title = 'Hidden Message'), '/uploads/challenges/stego/hidden.png', 'hidden.png', 'png', 3.1),
((SELECT id FROM challenge WHERE title = 'XOR Encryption'), '/uploads/challenges/xor/encrypted_data.bin', 'encrypted_data.bin', 'bin', 0.5),
((SELECT id FROM challenge WHERE title = 'JWT Manipulation'), '/uploads/challenges/jwt/token_example.txt', 'token_example.txt', 'txt', 0.001),
((SELECT id FROM challenge WHERE title = 'Memory Forensics'), '/uploads/challenges/forensics/memory_dump.raw', 'memory_dump.raw', 'raw', 512.0),
((SELECT id FROM challenge WHERE title = 'API Enumeration'), '/uploads/challenges/api/api_docs.pdf', 'api_docs.pdf', 'pdf', 1.2),
((SELECT id FROM challenge WHERE title = 'Binary Analysis'), '/uploads/challenges/binary/app.bin', 'app.bin', 'bin', 2.3),
((SELECT id FROM challenge WHERE title = 'Wireless Attack'), '/uploads/challenges/wireless/wifi_capture.cap', 'wifi_capture.cap', 'cap', 45.7),
((SELECT id FROM challenge WHERE title = 'Digital Footprint'), '/uploads/challenges/osint/clues.txt', 'clues.txt', 'txt', 0.01),
((SELECT id FROM challenge WHERE title = 'Audio Steganography'), '/uploads/challenges/audio/secret.wav', 'secret.wav', 'wav', 8.5),
((SELECT id FROM challenge WHERE title = 'Buffer Overflow'), '/uploads/challenges/pwn/vuln_binary', 'vuln_binary', 'bin', 0.8),
((SELECT id FROM challenge WHERE title = 'RSA Decryption'), '/uploads/challenges/rsa/public_key.pem', 'public_key.pem', 'pem', 0.001),
((SELECT id FROM challenge WHERE title = 'Advanced SQL Injection'), '/uploads/challenges/blind_sqli/source.zip', 'source.zip', 'zip', 3.4),
((SELECT id FROM challenge WHERE title = 'Format String Exploit'), '/uploads/challenges/format/vulnerable', 'vulnerable', 'bin', 1.2),
((SELECT id FROM challenge WHERE title = 'Advanced Crypto'), '/uploads/challenges/aes/ciphertext.bin', 'ciphertext.bin', 'bin', 0.2),
((SELECT id FROM challenge WHERE title = 'Reverse Engineering Pro'), '/uploads/challenges/re_pro/obfuscated.exe', 'obfuscated.exe', 'exe', 4.5),
((SELECT id FROM challenge WHERE title = 'Deep Web Investigation'), '/uploads/challenges/osint_hard/intel.txt', 'intel.txt', 'txt', 0.05),
((SELECT id FROM challenge WHERE title = 'Kernel Exploitation'), '/uploads/challenges/kernel/vmlinuz', 'vmlinuz', 'bin', 8.9),
((SELECT id FROM challenge WHERE title = 'Elliptic Curve Cryptography'), '/uploads/challenges/ecc/params.txt', 'params.txt', 'txt', 0.002),
((SELECT id FROM challenge WHERE title = 'Multi-Layer Obfuscation'), '/uploads/challenges/malware/sample.exe', 'sample.exe', 'exe', 12.3)
ON CONFLICT DO NOTHING;

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

-- Insert notifications (at least 20)
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
    NOW() - INTERVAL '1 day'
),
(
    'New Challenge Released!',
    'A new Hard difficulty challenge has been added to the Web category. Check it out!',
    'success',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '2 days'
),
(
    'Competition Rules Updated',
    'Please review the updated competition rules. Some clarifications have been added.',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '3 days'
),
(
    'Server Downtime Scheduled',
    'The server will be down for maintenance on December 10, 2025 from 2:00 AM to 4:00 AM UTC.',
    'warning',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '4 days'
),
(
    'First Blood Achievement!',
    'Team Alpha has achieved first blood on the Buffer Overflow challenge!',
    'success',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '5 days'
),
(
    'Hint Released',
    'A hint has been released for the RSA Decryption challenge. Check the challenge page.',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '6 days'
),
(
    'Leaderboard Update',
    'The leaderboard has been updated with dynamic scoring. Check your team position!',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '7 days'
),
(
    'Final Hours Warning!',
    'Only 6 hours remaining until the competition ends. Give it your all!',
    'warning',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '8 days'
),
(
    'New Category Added',
    'OSINT challenges have been added. Sharpen your investigation skills!',
    'success',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '9 days'
),
(
    'Team Registration Open',
    'Team registration is now open. Invite your teammates and start competing!',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '10 days'
),
(
    'Forensics Workshop Announced',
    'Join our forensics workshop this Saturday to improve your skills!',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '11 days'
),
(
    'Discord Server Now Live',
    'Our official Discord server is now live. Join for real-time updates and discussions!',
    'success',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '12 days'
),
(
    'Challenge Update',
    'The Memory Forensics challenge has been updated with additional hints.',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '13 days'
),
(
    'Top 10 Prizes Announced',
    'The top 10 teams will receive special prizes. Keep pushing!',
    'success',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '14 days'
),
(
    'Cryptography Webinar',
    'Attend our cryptography webinar next week to learn advanced techniques.',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '15 days'
),
(
    'Bug Bounty Program',
    'Found a bug? Report it through our bug bounty program and earn rewards!',
    'warning',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '16 days'
),
(
    'Challenge Difficulty Adjusted',
    'Some challenge difficulties have been adjusted based on solve rates.',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '17 days'
),
(
    'Sponsor Announcement',
    'We are proud to announce our new sponsors! Check them out on our website.',
    'success',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '18 days'
),
(
    'Competition Extended',
    'Due to popular demand, the competition has been extended by 24 hours!',
    'warning',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '19 days'
),
(
    'Practice Mode Available',
    'Practice mode is now available for beginners. No points, just learning!',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '20 days'
),
(
    'Mobile App Released',
    'Download our new mobile app to track challenges and leaderboard on the go!',
    'success',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '21 days'
),
(
    'Security Reminder',
    'Remember to use strong passwords and enable two-factor authentication!',
    'warning',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'moderator'),
    NOW() - INTERVAL '22 days'
),
(
    'Weekly Challenge Rotation',
    'New challenges will be released every week. Stay tuned!',
    'info',
    TRUE,
    (SELECT id FROM "user" WHERE username = 'admin'),
    NOW() - INTERVAL '23 days'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 10. SAMPLE AUDIT LOGS
-- =============================================

-- Insert sample audit logs (at least 20)
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
),
(
    (SELECT id FROM "user" WHERE username = 'charlie'),
    'CREATE',
    'team',
    2,
    '{"action": "created_team", "team_name": "Team Beta"}'::json,
    '192.168.1.101'
),
(
    (SELECT id FROM "user" WHERE username = 'eve'),
    'CREATE',
    'team',
    3,
    '{"action": "created_team", "team_name": "Team Gamma"}'::json,
    '192.168.1.102'
),
(
    (SELECT id FROM "user" WHERE username = 'moderator'),
    'UPDATE',
    'challenge',
    2,
    '{"action": "updated_challenge", "challenge_title": "Basic Web"}'::json,
    '127.0.0.1'
),
(
    (SELECT id FROM "user" WHERE username = 'bob'),
    'LOGIN',
    'user',
    NULL,
    '{"action": "user_login", "username": "bob"}'::json,
    '192.168.1.103'
),
(
    (SELECT id FROM "user" WHERE username = 'diana'),
    'LOGIN',
    'user',
    NULL,
    '{"action": "user_login", "username": "diana"}'::json,
    '192.168.1.104'
),
(
    (SELECT id FROM "user" WHERE username = 'frank'),
    'LOGIN',
    'user',
    NULL,
    '{"action": "user_login", "username": "frank"}'::json,
    '192.168.1.105'
),
(
    (SELECT id FROM "user" WHERE username = 'grace'),
    'CREATE',
    'team',
    4,
    '{"action": "created_team", "team_name": "Team Delta"}'::json,
    '192.168.1.106'
),
(
    (SELECT id FROM "user" WHERE username = 'admin'),
    'CREATE',
    'notification',
    1,
    '{"action": "created_notification", "title": "Welcome to RabbitCTF 2025!"}'::json,
    '127.0.0.1'
),
(
    (SELECT id FROM "user" WHERE username = 'jack'),
    'CREATE',
    'team',
    5,
    '{"action": "created_team", "team_name": "Team Epsilon"}'::json,
    '192.168.1.109'
),
(
    (SELECT id FROM "user" WHERE username = 'leo'),
    'CREATE',
    'team',
    6,
    '{"action": "created_team", "team_name": "Team Zeta"}'::json,
    '192.168.1.111'
),
(
    (SELECT id FROM "user" WHERE username = 'noah'),
    'CREATE',
    'team',
    7,
    '{"action": "created_team", "team_name": "Team Eta"}'::json,
    '192.168.1.113'
),
(
    (SELECT id FROM "user" WHERE username = 'peter'),
    'CREATE',
    'team',
    8,
    '{"action": "created_team", "team_name": "Team Theta"}'::json,
    '192.168.1.115'
),
(
    (SELECT id FROM "user" WHERE username = 'ryan'),
    'CREATE',
    'team',
    9,
    '{"action": "created_team", "team_name": "Team Iota"}'::json,
    '192.168.1.117'
),
(
    (SELECT id FROM "user" WHERE username = 'sarah'),
    'CREATE',
    'team',
    10,
    '{"action": "created_team", "team_name": "Team Kappa"}'::json,
    '192.168.1.119'
),
(
    (SELECT id FROM "user" WHERE username = 'admin'),
    'UPDATE',
    'event_config',
    1,
    '{"action": "updated_event_config", "status": "not_started"}'::json,
    '127.0.0.1'
),
(
    (SELECT id FROM "user" WHERE username = 'moderator'),
    'CREATE',
    'challenge',
    5,
    '{"action": "created_challenge", "challenge_title": "SQL Injection 101"}'::json,
    '127.0.0.1'
),
(
    (SELECT id FROM "user" WHERE username = 'alice'),
    'SUBMIT',
    'submission',
    NULL,
    '{"action": "flag_submission", "challenge": "Welcome to RabbitCTF", "correct": true}'::json,
    '192.168.1.100'
),
(
    (SELECT id FROM "user" WHERE username = 'bob'),
    'SUBMIT',
    'submission',
    NULL,
    '{"action": "flag_submission", "challenge": "Basic Web", "correct": true}'::json,
    '192.168.1.103'
),
(
    (SELECT id FROM "user" WHERE username = 'charlie'),
    'SUBMIT',
    'submission',
    NULL,
    '{"action": "flag_submission", "challenge": "Caesar Cipher", "correct": false}'::json,
    '192.168.1.101'
),
(
    (SELECT id FROM "user" WHERE username = 'admin'),
    'DELETE',
    'challenge',
    NULL,
    '{"action": "deleted_draft_challenge", "reason": "duplicate"}'::json,
    '127.0.0.1'
),
(
    (SELECT id FROM "user" WHERE username = 'moderator'),
    'UPDATE',
    'notification',
    2,
    '{"action": "updated_notification", "title": "Platform Maintenance"}'::json,
    '127.0.0.1'
),
(
    (SELECT id FROM "user" WHERE username = 'victor'),
    'CREATE',
    'team',
    11,
    '{"action": "created_team", "team_name": "Team Lambda"}'::json,
    '192.168.1.121'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 11. SUBMISSIONS FOR LEADERBOARD
-- =============================================

-- Insert submissions (ensuring varied distribution for realistic leaderboard, at least 60 submissions)
INSERT INTO submission (user_id, team_id, challenge_id, submitted_flag_hash, is_correct, awarded_score) VALUES
-- Team Alpha submissions (top performer - 9 correct)
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Cookie Monster'), '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Base64 Basics'), '2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d', TRUE, 250),
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Hidden Message'), '2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6', TRUE, 250),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'XOR Encryption'), '5267768822ee624d48fce15ec5ca79cbd602cb7f4c2157a516556991f22ef8c7', TRUE, 250),
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Buffer Overflow'), '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4', TRUE, 500),

-- Team Beta submissions (7 correct)
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Cookie Monster'), '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d', TRUE, 240),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Hidden Message'), '2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6', TRUE, 240),
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'XOR Encryption'), '5267768822ee624d48fce15ec5ca79cbd602cb7f4c2157a516556991f22ef8c7', TRUE, 240),

-- Team Gamma submissions (6 correct)
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'frank'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'frank'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'Simple Reverse'), '3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d', TRUE, 230),
((SELECT id FROM "user" WHERE username = 'frank'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'JWT Manipulation'), '7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451', TRUE, 230),

-- Team Delta submissions (5 correct)
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Image Metadata'), '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d', TRUE, 220),

-- Team Epsilon submissions (4 correct)
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Network Traffic'), '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce', TRUE, 100),

-- Team Zeta submissions (5 correct)
((SELECT id FROM "user" WHERE username = 'leo'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'maya'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'leo'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'maya'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'Social Media Hunt'), '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'leo'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'API Enumeration'), '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', TRUE, 210),

-- Team Eta submissions (3 correct)
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM team WHERE name = 'Team Eta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM team WHERE name = 'Team Eta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM team WHERE name = 'Team Eta'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', TRUE, 100),

-- Team Theta submissions (3 correct)
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM team WHERE name = 'Team Theta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM team WHERE name = 'Team Theta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM team WHERE name = 'Team Theta'), (SELECT id FROM challenge WHERE title = 'Hidden in Plain Sight'), '6b51d431df5d7f141cbececcf79edf3dd861c3b4069f0b11661a3eefacbba918', TRUE, 100),

-- Team Iota submissions (2 correct)
((SELECT id FROM "user" WHERE username = 'ryan'), (SELECT id FROM team WHERE name = 'Team Iota'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'ryan'), (SELECT id FROM team WHERE name = 'Team Iota'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),

-- Team Kappa submissions (3 correct)
((SELECT id FROM "user" WHERE username = 'sarah'), (SELECT id FROM team WHERE name = 'Team Kappa'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'uma'), (SELECT id FROM team WHERE name = 'Team Kappa'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'sarah'), (SELECT id FROM team WHERE name = 'Team Kappa'), (SELECT id FROM challenge WHERE title = 'Binary Analysis'), 'a3b14d2f3c6e8b7a1d5c9f4e2b8a7c6d5f9e1a3b7c4d8e2f6a1b5c9d3e7f4a8b', TRUE, 200),

-- Team Lambda submissions (2 correct)
((SELECT id FROM "user" WHERE username = 'victor'), (SELECT id FROM team WHERE name = 'Team Lambda'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'victor'), (SELECT id FROM team WHERE name = 'Team Lambda'), (SELECT id FROM challenge WHERE title = 'Base64 Basics'), '2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6', TRUE, 100),

-- Team Mu submissions (2 correct)
((SELECT id FROM "user" WHERE username = 'yara'), (SELECT id FROM team WHERE name = 'Team Mu'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'yara'), (SELECT id FROM team WHERE name = 'Team Mu'), (SELECT id FROM challenge WHERE title = 'Audio Steganography'), 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6', TRUE, 190),

-- Team Nu submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'wendy'), (SELECT id FROM team WHERE name = 'Team Nu'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),

-- Team Xi submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'xavier'), (SELECT id FROM team WHERE name = 'Team Xi'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),

-- Team Omicron submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'zack'), (SELECT id FROM team WHERE name = 'Team Omicron'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),

-- Team Pi submissions (2 correct)
((SELECT id FROM "user" WHERE username = 'hank'), (SELECT id FROM team WHERE name = 'Team Pi'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'ivy'), (SELECT id FROM team WHERE name = 'Team Pi'), (SELECT id FROM challenge WHERE title = 'Digital Footprint'), 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', TRUE, 180),

-- Team Rho submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'kate'), (SELECT id FROM team WHERE name = 'Team Rho'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),

-- Team Sigma submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'olivia'), (SELECT id FROM team WHERE name = 'Team Sigma'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),

-- Team Tau submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'quinn'), (SELECT id FROM team WHERE name = 'Team Tau'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),

-- Team Upsilon submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'tom'), (SELECT id FROM team WHERE name = 'Team Upsilon'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, 100),

-- Some incorrect submissions for realism
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Buffer Overflow'), 'wrong_hash_1', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'RSA Decryption'), 'wrong_hash_2', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Hidden Message'), 'wrong_hash_3', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM team WHERE name = 'Team Eta'), (SELECT id FROM challenge WHERE title = 'XOR Encryption'), 'wrong_hash_4', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM team WHERE name = 'Team Theta'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), 'wrong_hash_5', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Advanced Crypto'), 'wrong_hash_6', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Kernel Exploitation'), 'wrong_hash_7', FALSE, 0)
ON CONFLICT DO NOTHING;

-- Insert submission blocks (at least 20)
INSERT INTO submission_block (user_id, challenge_id, blocked_until, reason) VALUES
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM challenge WHERE title = 'Buffer Overflow'), NOW() + INTERVAL '5 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM challenge WHERE title = 'RSA Decryption'), NOW() + INTERVAL '10 minutes', 'Rate limit exceeded'),
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM challenge WHERE title = 'Hidden Message'), NOW() + INTERVAL '3 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM challenge WHERE title = 'XOR Encryption'), NOW() + INTERVAL '7 minutes', 'Rate limit exceeded'),
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), NOW() + INTERVAL '4 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM challenge WHERE title = 'Advanced Crypto'), NOW() + INTERVAL '15 minutes', 'Suspicious activity'),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM challenge WHERE title = 'Kernel Exploitation'), NOW() + INTERVAL '20 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'frank'), (SELECT id FROM challenge WHERE title = 'Format String Exploit'), NOW() + INTERVAL '8 minutes', 'Rate limit exceeded'),
((SELECT id FROM "user" WHERE username = 'maya'), (SELECT id FROM challenge WHERE title = 'Binary Analysis'), NOW() + INTERVAL '6 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM challenge WHERE title = 'Advanced SQL Injection'), NOW() + INTERVAL '12 minutes', 'Rate limit exceeded'),
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM challenge WHERE title = 'Elliptic Curve Cryptography'), NOW() + INTERVAL '25 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'leo'), (SELECT id FROM challenge WHERE title = 'Multi-Layer Obfuscation'), NOW() + INTERVAL '18 minutes', 'Suspicious activity'),
((SELECT id FROM "user" WHERE username = 'ryan'), (SELECT id FROM challenge WHERE title = 'Memory Forensics'), NOW() + INTERVAL '5 minutes', 'Rate limit exceeded'),
((SELECT id FROM "user" WHERE username = 'sarah'), (SELECT id FROM challenge WHERE title = 'Wireless Attack'), NOW() + INTERVAL '9 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'uma'), (SELECT id FROM challenge WHERE title = 'Deep Web Investigation'), NOW() + INTERVAL '11 minutes', 'Rate limit exceeded'),
((SELECT id FROM "user" WHERE username = 'victor'), (SELECT id FROM challenge WHERE title = 'Reverse Engineering Pro'), NOW() + INTERVAL '14 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'wendy'), (SELECT id FROM challenge WHERE title = 'JWT Manipulation'), NOW() + INTERVAL '6 minutes', 'Rate limit exceeded'),
((SELECT id FROM "user" WHERE username = 'xavier'), (SELECT id FROM challenge WHERE title = 'API Enumeration'), NOW() + INTERVAL '7 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'yara'), (SELECT id FROM challenge WHERE title = 'Cookie Monster'), NOW() + INTERVAL '3 minutes', 'Rate limit exceeded'),
((SELECT id FROM "user" WHERE username = 'zack'), (SELECT id FROM challenge WHERE title = 'Image Metadata'), NOW() + INTERVAL '5 minutes', 'Too many incorrect attempts'),
((SELECT id FROM "user" WHERE username = 'hank'), (SELECT id FROM challenge WHERE title = 'Simple Reverse'), NOW() + INTERVAL '4 minutes', 'Rate limit exceeded'),
((SELECT id FROM "user" WHERE username = 'ivy'), (SELECT id FROM challenge WHERE title = 'Social Media Hunt'), NOW() + INTERVAL '8 minutes', 'Too many incorrect attempts')
ON CONFLICT DO NOTHING;