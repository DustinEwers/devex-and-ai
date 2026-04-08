-- Script to manually set a user as admin for testing
-- Replace 'your-admin-email@domain.com' with the actual admin user's email

-- First, run the migration to add the Role column
-- dotnet ef database update

-- Show all current users first
SELECT "Email", "FirstName", "LastName", "Role" 
FROM "Users" 
ORDER BY "Email";

-- Update ALL users to be admin for development (TEMPORARY - for testing only)
UPDATE "Users" 
SET "Role" = 'Admin';

-- Or update a specific user to be an admin (preferred approach)
-- UPDATE "Users" 
-- SET "Role" = 'Admin' 
-- WHERE "Email" = 'your-admin-email@domain.com';

-- Verify the update
SELECT "Email", "FirstName", "LastName", "Role" 
FROM "Users" 
WHERE "Role" = 'Admin';

-- To create a new admin user manually (if needed):
-- INSERT INTO "Users" (
--     "Id", "Email", "FirstName", "LastName", "Role",
--     "PointsToGive", "PointsReceived", "CreatedAt", "LastLoginAt", "LastPointsReset"
-- ) VALUES (
--     gen_random_uuid(), 
--     'admin@example.com', 
--     'Admin', 
--     'User', 
--     'Admin',
--     50, 
--     0, 
--     NOW(), 
--     NOW(), 
--     NOW()
-- );
