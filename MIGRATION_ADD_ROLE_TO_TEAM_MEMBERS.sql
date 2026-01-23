-- Migration: Add role column to team_members table
-- Date: 2026-01-20
-- Purpose: Distinguish between KETUA (team leader) and ANGGOTA (team member)

-- Step 1: Add role column with default value 'ANGGOTA'
ALTER TABLE "team_members" 
ADD COLUMN "role" text DEFAULT 'ANGGOTA' NOT NULL;

-- Step 2: Update existing team leaders to have role 'KETUA'
-- This updates team members who are the team leader (matching leader_id in teams table)
UPDATE team_members tm
SET role = 'KETUA'
FROM teams t
WHERE tm.team_id = t.id 
  AND tm.user_id = t.leader_id;

-- Step 3: Ensure all other members have role 'ANGGOTA' (should already be default)
UPDATE team_members tm
SET role = 'ANGGOTA'
FROM teams t
WHERE tm.team_id = t.id 
  AND tm.user_id != t.leader_id
  AND tm.role IS NULL; -- Only update if NULL (shouldn't happen with NOT NULL constraint)

-- Verification queries:
-- Check that all team leaders have KETUA role:
-- SELECT t.id as team_id, t.code, u.name as leader_name, tm.role
-- FROM teams t
-- JOIN team_members tm ON t.id = tm.team_id AND t.leader_id = tm.user_id
-- JOIN users u ON tm.user_id = u.id;

-- Check all members and their roles:
-- SELECT t.code, u.name, tm.role, tm.invitation_status
-- FROM team_members tm
-- JOIN teams t ON tm.team_id = t.id
-- JOIN users u ON tm.user_id = u.id
-- ORDER BY t.code, tm.role DESC;
