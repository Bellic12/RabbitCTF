-- =============================================
-- SEED DATA FOR RabbitCTF DATABASE
-- =============================================

-- =============================================
-- 1. REFERENCE DATA (ROLES & DIFFICULTY LEVELS)
-- =============================================

-- Insert default roles
INSERT INTO role (name, description) VALUES 
('admin', 'System administrator with full access'),
('captain', 'Team captain with team management permissions'),
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
('alice', 'alice@example.com', (SELECT id FROM role WHERE name = 'captain')),
('bob', 'bob@example.com', (SELECT id FROM role WHERE name = 'user')),
('charlie', 'charlie@example.com', (SELECT id FROM role WHERE name = 'captain')),
('diana', 'diana@example.com', (SELECT id FROM role WHERE name = 'user')),
('eve', 'eve@example.com', (SELECT id FROM role WHERE name = 'captain')),
('frank', 'frank@example.com', (SELECT id FROM role WHERE name = 'user')),
('grace', 'grace@example.com', (SELECT id FROM role WHERE name = 'captain')),
('hank', 'hank@example.com', (SELECT id FROM role WHERE name = 'captain')),
('ivy', 'ivy@example.com', (SELECT id FROM role WHERE name = 'user')),
('jack', 'jack@example.com', (SELECT id FROM role WHERE name = 'captain')),
('kate', 'kate@example.com', (SELECT id FROM role WHERE name = 'captain')),
('leo', 'leo@example.com', (SELECT id FROM role WHERE name = 'captain')),
('maya', 'maya@example.com', (SELECT id FROM role WHERE name = 'user')),
('noah', 'noah@example.com', (SELECT id FROM role WHERE name = 'captain')),
('olivia', 'olivia@example.com', (SELECT id FROM role WHERE name = 'captain')),
('peter', 'peter@example.com', (SELECT id FROM role WHERE name = 'captain')),
('quinn', 'quinn@example.com', (SELECT id FROM role WHERE name = 'captain')),
('ryan', 'ryan@example.com', (SELECT id FROM role WHERE name = 'captain')),
('sarah', 'sarah@example.com', (SELECT id FROM role WHERE name = 'captain')),
('tom', 'tom@example.com', (SELECT id FROM role WHERE name = 'captain')),
('uma', 'uma@example.com', (SELECT id FROM role WHERE name = 'user')),
('victor', 'victor@example.com', (SELECT id FROM role WHERE name = 'captain')),
('wendy', 'wendy@example.com', (SELECT id FROM role WHERE name = 'captain')),
('xavier', 'xavier@example.com', (SELECT id FROM role WHERE name = 'captain')),
('yara', 'yara@example.com', (SELECT id FROM role WHERE name = 'captain')),
('zack', 'zack@example.com', (SELECT id FROM role WHERE name = 'captain'))
ON CONFLICT (username) DO NOTHING;

-- Insert user credentials
-- Password hashes generated with bcrypt 4.2.1
-- admin: admin123, others: password123
INSERT INTO user_credential (user_id, password_hash, is_temp_password, must_change_password)
SELECT id, 
    CASE 
        WHEN username = 'admin' THEN '$2b$12$hGgbPXqMSqhlHEGr6.Qobu9i0195UgBFZJlJp4zzgRu9Y81nNJv2q'
        ELSE '$2b$12$.6W.XaE8GOJ4h4Whqt1rGOhwMcfqckJVuL0fcB5s/oguaovy35yKu'
    END,
    CASE WHEN username = 'admin' THEN TRUE ELSE FALSE END,
    CASE WHEN username = 'admin' THEN TRUE ELSE FALSE END
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
    FALSE
),
-- Medium challenges (10)
(
    'SQL Injection 101',
    'Can you bypass the login form? URL: http://challenge.local/login',
    (SELECT id FROM challenge_category WHERE name = 'Web'),
    (SELECT id FROM difficulty WHERE name = 'Medium'),
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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

-- Insert challenge flags (plain text in RabbitCTF{} format)
INSERT INTO challenge_flag (challenge_id, flag_value)
SELECT 
    id,
    CASE 
        WHEN title = 'Welcome to RabbitCTF' THEN 'RabbitCTF{w3lc0m3_t0_th3_g4m3}'
        WHEN title = 'Basic Web' THEN 'RabbitCTF{1nsp3ct_th3_s0urc3}'
        WHEN title = 'Caesar Cipher' THEN 'RabbitCTF{c4es4r_c1ph3r}'
        WHEN title = 'Cookie Monster' THEN 'RabbitCTF{c00k13_m0nst3r}'
        WHEN title = 'Base64 Basics' THEN 'RabbitCTF{b4s364_d3c0d1ng}'
        WHEN title = 'Image Metadata' THEN 'RabbitCTF{3x1f_d4t4_h1dd3n}'
        WHEN title = 'Simple Reverse' THEN 'RabbitCTF{s1mpl3_r3v3rs3}'
        WHEN title = 'Network Traffic' THEN 'RabbitCTF{p4ck3t_4n4lys1s}'
        WHEN title = 'Social Media Hunt' THEN 'RabbitCTF{0s1nt_m4st3r}'
        WHEN title = 'Hidden in Plain Sight' THEN 'RabbitCTF{h1dd3n_1n_pl41n}'
        WHEN title = 'SQL Injection 101' THEN 'RabbitCTF{sql_1nj3ct10n}'
        WHEN title = 'Hidden Message' THEN 'RabbitCTF{st3g4n0gr4phy}'
        WHEN title = 'XOR Encryption' THEN 'RabbitCTF{x0r_3ncrypt10n}'
        WHEN title = 'JWT Manipulation' THEN 'RabbitCTF{jwt_f0rg3ry}'
        WHEN title = 'Memory Forensics' THEN 'RabbitCTF{m3m0ry_dump}'
        WHEN title = 'API Enumeration' THEN 'RabbitCTF{4p1_3num3r4t10n}'
        WHEN title = 'Binary Analysis' THEN 'RabbitCTF{b1n4ry_4n4lys1s}'
        WHEN title = 'Wireless Attack' THEN 'RabbitCTF{w1r3l3ss_cr4ck}'
        WHEN title = 'Digital Footprint' THEN 'RabbitCTF{d1g1t4l_tr4ck1ng}'
        WHEN title = 'Audio Steganography' THEN 'RabbitCTF{4ud10_st3g0}'
        WHEN title = 'Buffer Overflow' THEN 'RabbitCTF{buff3r_0v3rfl0w}'
        WHEN title = 'RSA Decryption' THEN 'RabbitCTF{rs4_d3crypt10n}'
        WHEN title = 'Advanced SQL Injection' THEN 'RabbitCTF{bl1nd_sql1}'
        WHEN title = 'Format String Exploit' THEN 'RabbitCTF{f0rm4t_str1ng}'
        WHEN title = 'Advanced Crypto' THEN 'RabbitCTF{4dv_crypt0}'
        WHEN title = 'Reverse Engineering Pro' THEN 'RabbitCTF{r3v3rs3_pr0}'
        WHEN title = 'Deep Web Investigation' THEN 'RabbitCTF{d33p_w3b}'
        WHEN title = 'Kernel Exploitation' THEN 'RabbitCTF{k3rn3l_3xpl01t}'
        WHEN title = 'Elliptic Curve Cryptography' THEN 'RabbitCTF{3cc_crypt0}'
        WHEN title = 'Multi-Layer Obfuscation' THEN 'RabbitCTF{mult1_0bfusc4t10n}'
        ELSE 'RabbitCTF{default_flag}'
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
1. **Respect**: Be respectful to other participants and organizers
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
- For technical issues, contact the administrators
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
    (SELECT id FROM "user" WHERE username = 'admin'),
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
INSERT INTO submission (user_id, team_id, challenge_id, submitted_flag, is_correct, awarded_score) VALUES
-- Team Alpha submissions (top performer - 9 correct)
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'RabbitCTF{c4es4r_c1ph3r}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Cookie Monster'), 'RabbitCTF{c00k13_m0nst3r}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Base64 Basics'), 'RabbitCTF{b4s364_d3c0d1ng}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), 'RabbitCTF{c00k13_m0nst3r}', TRUE, 250),
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Hidden Message'), 'RabbitCTF{b4s364_d3c0d1ng}', TRUE, 250),
((SELECT id FROM "user" WHERE username = 'bob'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'XOR Encryption'), 'RabbitCTF{x0r_3ncrypt10n}', TRUE, 250),
((SELECT id FROM "user" WHERE username = 'alice'), (SELECT id FROM team WHERE name = 'Team Alpha'), (SELECT id FROM challenge WHERE title = 'Buffer Overflow'), 'RabbitCTF{3x1f_d4t4_h1dd3n}', TRUE, 500),

-- Team Beta submissions (7 correct)
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'RabbitCTF{c4es4r_c1ph3r}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Cookie Monster'), 'RabbitCTF{c00k13_m0nst3r}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), 'RabbitCTF{c00k13_m0nst3r}', TRUE, 240),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Hidden Message'), 'RabbitCTF{b4s364_d3c0d1ng}', TRUE, 240),
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'XOR Encryption'), 'RabbitCTF{x0r_3ncrypt10n}', TRUE, 240),

-- Team Gamma submissions (6 correct)
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'frank'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'RabbitCTF{c4es4r_c1ph3r}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'frank'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'Simple Reverse'), 'RabbitCTF{s1mpl3_r3v3rs3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), 'RabbitCTF{c00k13_m0nst3r}', TRUE, 230),
((SELECT id FROM "user" WHERE username = 'frank'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'JWT Manipulation'), 'RabbitCTF{jwt_f0rg3ry}', TRUE, 230),

-- Team Delta submissions (5 correct)
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'RabbitCTF{c4es4r_c1ph3r}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Image Metadata'), 'RabbitCTF{3x1f_d4t4_h1dd3n}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), 'RabbitCTF{c00k13_m0nst3r}', TRUE, 220),

-- Team Epsilon submissions (4 correct)
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'RabbitCTF{c4es4r_c1ph3r}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Network Traffic'), 'RabbitCTF{p4ck3t_4n4lys1s}', TRUE, 100),

-- Team Zeta submissions (5 correct)
((SELECT id FROM "user" WHERE username = 'leo'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'maya'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'leo'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'RabbitCTF{c4es4r_c1ph3r}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'maya'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'Social Media Hunt'), 'RabbitCTF{0s1nt_m4st3r}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'leo'), (SELECT id FROM team WHERE name = 'Team Zeta'), (SELECT id FROM challenge WHERE title = 'API Enumeration'), 'RabbitCTF{4p1_3num3r4t10n}', TRUE, 210),

-- Team Eta submissions (3 correct)
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM team WHERE name = 'Team Eta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM team WHERE name = 'Team Eta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM team WHERE name = 'Team Eta'), (SELECT id FROM challenge WHERE title = 'Caesar Cipher'), 'RabbitCTF{c4es4r_c1ph3r}', TRUE, 100),

-- Team Theta submissions (3 correct)
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM team WHERE name = 'Team Theta'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM team WHERE name = 'Team Theta'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM team WHERE name = 'Team Theta'), (SELECT id FROM challenge WHERE title = 'Hidden in Plain Sight'), 'RabbitCTF{h1dd3n_1n_pl41n}', TRUE, 100),

-- Team Iota submissions (2 correct)
((SELECT id FROM "user" WHERE username = 'ryan'), (SELECT id FROM team WHERE name = 'Team Iota'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'ryan'), (SELECT id FROM team WHERE name = 'Team Iota'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),

-- Team Kappa submissions (3 correct)
((SELECT id FROM "user" WHERE username = 'sarah'), (SELECT id FROM team WHERE name = 'Team Kappa'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'uma'), (SELECT id FROM team WHERE name = 'Team Kappa'), (SELECT id FROM challenge WHERE title = 'Basic Web'), 'RabbitCTF{1nsp3ct_th3_s0urc3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'sarah'), (SELECT id FROM team WHERE name = 'Team Kappa'), (SELECT id FROM challenge WHERE title = 'Binary Analysis'), 'RabbitCTF{b1n4ry_4n4lys1s}', TRUE, 200),

-- Team Lambda submissions (2 correct)
((SELECT id FROM "user" WHERE username = 'victor'), (SELECT id FROM team WHERE name = 'Team Lambda'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'victor'), (SELECT id FROM team WHERE name = 'Team Lambda'), (SELECT id FROM challenge WHERE title = 'Base64 Basics'), 'RabbitCTF{b4s364_d3c0d1ng}', TRUE, 100),

-- Team Mu submissions (2 correct)
((SELECT id FROM "user" WHERE username = 'yara'), (SELECT id FROM team WHERE name = 'Team Mu'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'yara'), (SELECT id FROM team WHERE name = 'Team Mu'), (SELECT id FROM challenge WHERE title = 'Audio Steganography'), 'RabbitCTF{4ud10_st3g0}', TRUE, 190),

-- Team Nu submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'wendy'), (SELECT id FROM team WHERE name = 'Team Nu'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),

-- Team Xi submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'xavier'), (SELECT id FROM team WHERE name = 'Team Xi'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),

-- Team Omicron submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'zack'), (SELECT id FROM team WHERE name = 'Team Omicron'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),

-- Team Pi submissions (2 correct)
((SELECT id FROM "user" WHERE username = 'hank'), (SELECT id FROM team WHERE name = 'Team Pi'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),
((SELECT id FROM "user" WHERE username = 'ivy'), (SELECT id FROM team WHERE name = 'Team Pi'), (SELECT id FROM challenge WHERE title = 'Digital Footprint'), 'RabbitCTF{d1g1t4l_tr4ck1ng}', TRUE, 180),

-- Team Rho submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'kate'), (SELECT id FROM team WHERE name = 'Team Rho'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),

-- Team Sigma submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'olivia'), (SELECT id FROM team WHERE name = 'Team Sigma'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),

-- Team Tau submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'quinn'), (SELECT id FROM team WHERE name = 'Team Tau'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),

-- Team Upsilon submissions (1 correct)
((SELECT id FROM "user" WHERE username = 'tom'), (SELECT id FROM team WHERE name = 'Team Upsilon'), (SELECT id FROM challenge WHERE title = 'Welcome to RabbitCTF'), 'RabbitCTF{w3lc0m3_t0_th3_g4m3}', TRUE, 100),

-- Some incorrect submissions for realism
((SELECT id FROM "user" WHERE username = 'charlie'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Buffer Overflow'), 'RabbitCTF{wr0ng_fl4g_1}', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'eve'), (SELECT id FROM team WHERE name = 'Team Gamma'), (SELECT id FROM challenge WHERE title = 'RSA Decryption'), 'RabbitCTF{wr0ng_fl4g_2}', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'jack'), (SELECT id FROM team WHERE name = 'Team Epsilon'), (SELECT id FROM challenge WHERE title = 'Hidden Message'), 'RabbitCTF{wr0ng_fl4g_3}', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'noah'), (SELECT id FROM team WHERE name = 'Team Eta'), (SELECT id FROM challenge WHERE title = 'XOR Encryption'), 'RabbitCTF{wr0ng_fl4g_4}', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'peter'), (SELECT id FROM team WHERE name = 'Team Theta'), (SELECT id FROM challenge WHERE title = 'SQL Injection 101'), 'RabbitCTF{wr0ng_fl4g_5}', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'diana'), (SELECT id FROM team WHERE name = 'Team Beta'), (SELECT id FROM challenge WHERE title = 'Advanced Crypto'), 'RabbitCTF{wr0ng_fl4g_6}', FALSE, 0),
((SELECT id FROM "user" WHERE username = 'grace'), (SELECT id FROM team WHERE name = 'Team Delta'), (SELECT id FROM challenge WHERE title = 'Kernel Exploitation'), 'RabbitCTF{wr0ng_fl4g_7}', FALSE, 0)
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

