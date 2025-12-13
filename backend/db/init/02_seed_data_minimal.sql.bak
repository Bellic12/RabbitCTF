-- =============================================
-- SEED DATA FOR RabbitCTF DATABASE (MINIMAL)
-- =============================================
-- This file contains only the essential structure data required for the application to run.
-- It does NOT contain any users, teams, or challenges.
-- Use this seed to test the "First Run" setup flow.

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
-- 3. CONFIGURATION (Optional defaults)
-- =============================================

-- No users, teams, or challenges are created initially.
-- The first administrator must be registered via the /setup page.
