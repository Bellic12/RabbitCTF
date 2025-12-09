-- RabbitCTF Database Schema - MVP Complete Version
-- Para uso con Docker Compose

-- =============================================
-- REFERENCE DATA (ENUMS AS TABLES)
-- =============================================

CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS difficulty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL,
    sort_order INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- USER MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role(id)
);

CREATE TABLE IF NOT EXISTS user_credential (
    user_id INT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    is_temp_password BOOLEAN DEFAULT FALSE,
    must_change_password BOOLEAN DEFAULT FALSE,
    last_changed TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_request (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    requested_at TIMESTAMP DEFAULT NOW(),
    is_processed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES "user"(id)
);

-- =============================================
-- TEAMS & MEMBERSHIP
-- =============================================

CREATE TABLE IF NOT EXISTS team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    captain_id INT UNIQUE NOT NULL,
    total_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (captain_id) REFERENCES "user"(id)
);

CREATE TABLE IF NOT EXISTS team_credential (
    team_id INT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_member (
    user_id INT PRIMARY KEY,
    team_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE
);

-- =============================================
-- CHALLENGES & CATEGORIES
-- =============================================

CREATE TABLE IF NOT EXISTS challenge_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category_id INT,
    difficulty_id INT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    operational_data TEXT,
    is_draft BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES challenge_category(id),
    FOREIGN KEY (difficulty_id) REFERENCES difficulty(id),
    FOREIGN KEY (created_by) REFERENCES "user"(id)
);

CREATE TABLE IF NOT EXISTS challenge_score_config (
    challenge_id INT PRIMARY KEY,
    scoring_mode VARCHAR(20) DEFAULT 'STATIC' NOT NULL,
    base_score INT NOT NULL,
    decay_factor FLOAT,
    min_score INT,
    FOREIGN KEY (challenge_id) REFERENCES challenge(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS challenge_rule_config (
    challenge_id INT PRIMARY KEY,
    attempt_limit INT DEFAULT 5,
    is_case_sensitive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (challenge_id) REFERENCES challenge(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS challenge_flag (
    challenge_id INT PRIMARY KEY,
    flag_value VARCHAR(255) NOT NULL,
    FOREIGN KEY (challenge_id) REFERENCES challenge(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS challenge_visibility_config (
    challenge_id INT PRIMARY KEY,
    is_visible BOOLEAN DEFAULT FALSE,
    visible_from TIMESTAMP,
    visible_until TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenge(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS challenge_file (
    id SERIAL PRIMARY KEY,
    challenge_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size_mb FLOAT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (challenge_id) REFERENCES challenge(id) ON DELETE CASCADE
);

-- =============================================
-- PARTICIPATION & FLAG SUBMISSIONS
-- =============================================

CREATE TABLE IF NOT EXISTS submission (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    team_id INT NOT NULL,
    challenge_id INT NOT NULL,
    submitted_flag VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    awarded_score INT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    FOREIGN KEY (team_id) REFERENCES team(id),
    FOREIGN KEY (challenge_id) REFERENCES challenge(id)
);

CREATE TABLE IF NOT EXISTS submission_block (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT,
    blocked_until TIMESTAMP NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    FOREIGN KEY (challenge_id) REFERENCES challenge(id)
);

-- =============================================
-- EVENT CONFIGURATION
-- =============================================

CREATE TABLE IF NOT EXISTS event_config (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'not_started',
    max_team_size INT DEFAULT 4,
    max_submission_attempts INT DEFAULT 5,
    submission_time_window_seconds INT DEFAULT 60,
    submission_block_minutes INT DEFAULT 5,
    max_file_size_mb FLOAT DEFAULT 100,
    max_challenge_files_mb FLOAT DEFAULT 500,
    allowed_file_types JSON DEFAULT '["zip", "tar.gz", "txt", "pdf", "pcap", "png", "jpg"]',
    discord_webhook_url VARCHAR(255),
    discord_bot_token_encrypted VARCHAR(255),
    discord_notifications_enabled BOOLEAN DEFAULT FALSE,
    allow_solution_history BOOLEAN DEFAULT FALSE,
    event_timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- =============================================
-- EVENT RULES
-- =============================================

CREATE TABLE IF NOT EXISTS event_rule_version (
    id SERIAL PRIMARY KEY,
    content_md TEXT NOT NULL,
    version_number INT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (created_by) REFERENCES "user"(id)
);

CREATE TABLE IF NOT EXISTS event_rule_current (
    id INT PRIMARY KEY DEFAULT 1,
    active_version_id INT UNIQUE NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (active_version_id) REFERENCES event_rule_version(id)
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS notification (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES "user"(id)
);

-- =============================================
-- AUDIT LOGGING
-- =============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(30),
    resource_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "user"(id)
);

-- =============================================
-- CRITICAL INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role_id);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "user"(created_at);

-- Team indexes
CREATE INDEX IF NOT EXISTS idx_team_name ON team(name);
CREATE INDEX IF NOT EXISTS idx_team_captain ON team(captain_id);
CREATE INDEX IF NOT EXISTS idx_team_score ON team(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_team_created_at ON team(created_at);

-- Team member indexes
CREATE INDEX IF NOT EXISTS idx_team_member_team ON team_member(team_id);
CREATE INDEX IF NOT EXISTS idx_team_member_joined ON team_member(joined_at);

-- Challenge indexes
CREATE INDEX IF NOT EXISTS idx_challenge_category ON challenge(category_id);
CREATE INDEX IF NOT EXISTS idx_challenge_difficulty ON challenge(difficulty_id);
CREATE INDEX IF NOT EXISTS idx_challenge_created_by ON challenge(created_by);
CREATE INDEX IF NOT EXISTS idx_challenge_visible ON challenge(is_draft, category_id, difficulty_id);
CREATE INDEX IF NOT EXISTS idx_challenge_created_at ON challenge(created_at);

-- Challenge file indexes
CREATE INDEX IF NOT EXISTS idx_challenge_file_challenge ON challenge_file(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_file_uploaded ON challenge_file(uploaded_at);

-- Submission indexes (CRITICAL for performance)
CREATE INDEX IF NOT EXISTS idx_submission_user ON submission(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_team ON submission(team_id);
CREATE INDEX IF NOT EXISTS idx_submission_challenge ON submission(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submission_team_correct ON submission(team_id, is_correct);
CREATE INDEX IF NOT EXISTS idx_submission_user_challenge_time ON submission(user_id, challenge_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_submission_challenge_correct ON submission(challenge_id, is_correct);
CREATE INDEX IF NOT EXISTS idx_submission_submitted_at ON submission(submitted_at);

-- Unique constraint to prevent duplicate solves per team
CREATE UNIQUE INDEX IF NOT EXISTS idx_submission_team_challenge_unique 
ON submission(team_id, challenge_id) 
WHERE is_correct = true;

-- Submission block indexes
CREATE INDEX IF NOT EXISTS idx_submission_block_user ON submission_block(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_block_challenge ON submission_block(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submission_block_until ON submission_block(blocked_until);

-- Event config indexes
CREATE INDEX IF NOT EXISTS idx_event_config_status ON event_config(status);
CREATE INDEX IF NOT EXISTS idx_event_config_times ON event_config(start_time, end_time);

-- Event rule indexes
CREATE INDEX IF NOT EXISTS idx_event_rule_version_number ON event_rule_version(version_number);
CREATE INDEX IF NOT EXISTS idx_event_rule_version_created_by ON event_rule_version(created_by);
CREATE INDEX IF NOT EXISTS idx_event_rule_version_created_at ON event_rule_version(created_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notification_type ON notification(type);
CREATE INDEX IF NOT EXISTS idx_notification_published ON notification(is_published);
CREATE INDEX IF NOT EXISTS idx_notification_published_created ON notification(is_published, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notification(created_at);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);