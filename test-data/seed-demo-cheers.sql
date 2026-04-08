BEGIN;

CREATE TEMP TABLE demo_users (
    email text PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text NOT NULL,
    created_at timestamptz NOT NULL
) ON COMMIT DROP;

INSERT INTO demo_users (email, first_name, last_name, role, created_at)
VALUES
    ('avery.chen@cheersly.demo.local', 'Avery', 'Chen', 'Normal', NOW() - INTERVAL '180 days'),
    ('jordan.lee@cheersly.demo.local', 'Jordan', 'Lee', 'Normal', NOW() - INTERVAL '170 days'),
    ('priya.patel@cheersly.demo.local', 'Priya', 'Patel', 'Normal', NOW() - INTERVAL '165 days'),
    ('mateo.garcia@cheersly.demo.local', 'Mateo', 'Garcia', 'Normal', NOW() - INTERVAL '160 days'),
    ('riley.brooks@cheersly.demo.local', 'Riley', 'Brooks', 'Normal', NOW() - INTERVAL '155 days'),
    ('quinn.adams@cheersly.demo.local', 'Quinn', 'Adams', 'Normal', NOW() - INTERVAL '150 days'),
    ('casey.nguyen@cheersly.demo.local', 'Casey', 'Nguyen', 'Normal', NOW() - INTERVAL '145 days'),
    ('morgan.davis@cheersly.demo.local', 'Morgan', 'Davis', 'Admin', NOW() - INTERVAL '140 days');

INSERT INTO "Users" (
    "Id",
    "Email",
    "FirstName",
    "LastName",
    "PointsToGive",
    "PointsReceived",
    "CreatedAt",
    "LastLoginAt",
    "LastPointsReset",
    "Role"
)
SELECT
    gen_random_uuid(),
    du.email,
    du.first_name,
    du.last_name,
    50,
    0,
    du.created_at,
    NOW(),
    date_trunc('month', NOW()),
    du.role
FROM demo_users du
ON CONFLICT ("Email") DO UPDATE
SET
    "FirstName" = EXCLUDED."FirstName",
    "LastName" = EXCLUDED."LastName",
    "LastLoginAt" = EXCLUDED."LastLoginAt",
    "LastPointsReset" = EXCLUDED."LastPointsReset",
    "Role" = EXCLUDED."Role";

DELETE FROM "CheerRecipients"
WHERE "CheerId" IN (
    SELECT c."Id"
    FROM "Cheers" c
    INNER JOIN "Users" sender ON sender."Id" = c."SenderId"
    INNER JOIN demo_users du ON du.email = sender."Email"
);

DELETE FROM "Cheers"
WHERE "SenderId" IN (
    SELECT u."Id"
    FROM "Users" u
    INNER JOIN demo_users du ON du.email = u."Email"
);

CREATE TEMP TABLE demo_cheers (
    cheer_id uuid PRIMARY KEY,
    sender_email text NOT NULL,
    recipient_email text NOT NULL,
    points integer NOT NULL,
    message text NOT NULL,
    created_at timestamptz NOT NULL
) ON COMMIT DROP;

INSERT INTO demo_cheers (cheer_id, sender_email, recipient_email, points, message, created_at)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'avery.chen@cheersly.demo.local', 'jordan.lee@cheersly.demo.local', 4, 'Huge thanks for jumping on the onboarding checklist cleanup. The new flow reads so much better. #teamwork', NOW() - INTERVAL '2 days'),
    ('10000000-0000-0000-0000-000000000002', 'avery.chen@cheersly.demo.local', 'priya.patel@cheersly.demo.local', 5, 'Your release notes were crisp, complete, and easy for support to reuse. **Exactly** what we needed.', NOW() - INTERVAL '6 days'),
    ('10000000-0000-0000-0000-000000000003', 'avery.chen@cheersly.demo.local', 'riley.brooks@cheersly.demo.local', 3, 'Thanks for pairing on the API timeout issue and staying patient through the logs. #debugging', NOW() - INTERVAL '14 days'),
    ('10000000-0000-0000-0000-000000000004', 'avery.chen@cheersly.demo.local', 'morgan.davis@cheersly.demo.local', 2, 'Appreciate the quick decision on the pilot rollout. It unblocked the team fast.', NOW() - INTERVAL '37 days'),
    ('10000000-0000-0000-0000-000000000005', 'avery.chen@cheersly.demo.local', 'casey.nguyen@cheersly.demo.local', 6, 'The dashboard mockups gave everyone a clear path forward. Great eye for detail. #design', NOW() - INTERVAL '63 days'),

    ('10000000-0000-0000-0000-000000000006', 'jordan.lee@cheersly.demo.local', 'mateo.garcia@cheersly.demo.local', 5, 'Thanks for owning the migration rehearsal and documenting the sharp edges before launch.', NOW() - INTERVAL '1 day'),
    ('10000000-0000-0000-0000-000000000007', 'jordan.lee@cheersly.demo.local', 'avery.chen@cheersly.demo.local', 4, 'The customer summary you posted after the incident review was clear and useful. #customer-love', NOW() - INTERVAL '4 days'),
    ('10000000-0000-0000-0000-000000000008', 'jordan.lee@cheersly.demo.local', 'quinn.adams@cheersly.demo.local', 3, 'Appreciate the quiet consistency on test coverage. It keeps us honest every sprint.', NOW() - INTERVAL '12 days'),
    ('10000000-0000-0000-0000-000000000009', 'jordan.lee@cheersly.demo.local', 'priya.patel@cheersly.demo.local', 2, 'Thanks for turning around the stakeholder notes so quickly after the demo.', NOW() - INTERVAL '29 days'),
    ('10000000-0000-0000-0000-000000000010', 'jordan.lee@cheersly.demo.local', 'morgan.davis@cheersly.demo.local', 6, 'Your feedback on scope helped us keep the sprint realistic without losing momentum.', NOW() - INTERVAL '58 days'),

    ('10000000-0000-0000-0000-000000000011', 'priya.patel@cheersly.demo.local', 'casey.nguyen@cheersly.demo.local', 4, 'Thank you for polishing the empty states. The product feels much more intentional now.', NOW() - INTERVAL '3 days'),
    ('10000000-0000-0000-0000-000000000012', 'priya.patel@cheersly.demo.local', 'jordan.lee@cheersly.demo.local', 5, 'Your handoff notes saved a lot of time for support and QA. #operations', NOW() - INTERVAL '8 days'),
    ('10000000-0000-0000-0000-000000000013', 'priya.patel@cheersly.demo.local', 'riley.brooks@cheersly.demo.local', 3, 'Appreciate the careful validation on the points math before we shipped.', NOW() - INTERVAL '18 days'),
    ('10000000-0000-0000-0000-000000000014', 'priya.patel@cheersly.demo.local', 'avery.chen@cheersly.demo.local', 2, 'Thanks for keeping the planning doc tight and actionable.', NOW() - INTERVAL '41 days'),
    ('10000000-0000-0000-0000-000000000015', 'priya.patel@cheersly.demo.local', 'mateo.garcia@cheersly.demo.local', 6, 'That deployment checklist was calm, thorough, and easy to follow under pressure.', NOW() - INTERVAL '74 days'),

    ('10000000-0000-0000-0000-000000000016', 'mateo.garcia@cheersly.demo.local', 'quinn.adams@cheersly.demo.local', 4, 'Thanks for catching the flaky integration test before it wasted another morning.', NOW() - INTERVAL '2 days 6 hours'),
    ('10000000-0000-0000-0000-000000000017', 'mateo.garcia@cheersly.demo.local', 'priya.patel@cheersly.demo.local', 5, 'The API examples in your notes made onboarding much easier for the new folks.', NOW() - INTERVAL '5 days'),
    ('10000000-0000-0000-0000-000000000018', 'mateo.garcia@cheersly.demo.local', 'morgan.davis@cheersly.demo.local', 3, 'Appreciate the fast approval on the vendor request. It kept procurement moving.', NOW() - INTERVAL '16 days'),
    ('10000000-0000-0000-0000-000000000019', 'mateo.garcia@cheersly.demo.local', 'casey.nguyen@cheersly.demo.local', 2, 'Your icon refresh made the store page feel far more polished. #ux', NOW() - INTERVAL '33 days'),
    ('10000000-0000-0000-0000-000000000020', 'mateo.garcia@cheersly.demo.local', 'avery.chen@cheersly.demo.local', 6, 'Thanks for stepping in during the bug bash and keeping the room focused.', NOW() - INTERVAL '61 days'),

    ('10000000-0000-0000-0000-000000000021', 'riley.brooks@cheersly.demo.local', 'morgan.davis@cheersly.demo.local', 5, 'Your summary after the leadership review gave us a clear next step list. #clarity', NOW() - INTERVAL '1 day 8 hours'),
    ('10000000-0000-0000-0000-000000000022', 'riley.brooks@cheersly.demo.local', 'casey.nguyen@cheersly.demo.local', 4, 'Thank you for the lightweight prototype. It helped us choose fast instead of debating.', NOW() - INTERVAL '7 days'),
    ('10000000-0000-0000-0000-000000000023', 'riley.brooks@cheersly.demo.local', 'jordan.lee@cheersly.demo.local', 3, 'Appreciate the steady follow-through on the customer feedback board.', NOW() - INTERVAL '11 days'),
    ('10000000-0000-0000-0000-000000000024', 'riley.brooks@cheersly.demo.local', 'quinn.adams@cheersly.demo.local', 2, 'Thanks for keeping the CI pipeline readable and boring in the best way.', NOW() - INTERVAL '26 days'),
    ('10000000-0000-0000-0000-000000000025', 'riley.brooks@cheersly.demo.local', 'priya.patel@cheersly.demo.local', 6, 'Your notes from the customer interview turned into immediate product changes. Great synthesis.', NOW() - INTERVAL '57 days'),

    ('10000000-0000-0000-0000-000000000026', 'quinn.adams@cheersly.demo.local', 'avery.chen@cheersly.demo.local', 4, 'Thanks for the clean refactor in the auth flow. It is much easier to reason about now.', NOW() - INTERVAL '2 days 2 hours'),
    ('10000000-0000-0000-0000-000000000027', 'quinn.adams@cheersly.demo.local', 'mateo.garcia@cheersly.demo.local', 5, 'You handled the hotfix with a very steady hand. **Excellent** execution.', NOW() - INTERVAL '9 days'),
    ('10000000-0000-0000-0000-000000000028', 'quinn.adams@cheersly.demo.local', 'riley.brooks@cheersly.demo.local', 3, 'Appreciate the extra pass on accessibility before the preview build went out. #a11y', NOW() - INTERVAL '15 days'),
    ('10000000-0000-0000-0000-000000000029', 'quinn.adams@cheersly.demo.local', 'jordan.lee@cheersly.demo.local', 2, 'Thanks for keeping the release checklist updated while the plan was shifting.', NOW() - INTERVAL '31 days'),
    ('10000000-0000-0000-0000-000000000030', 'quinn.adams@cheersly.demo.local', 'morgan.davis@cheersly.demo.local', 6, 'Your support during hiring debriefs kept the process structured and fair.', NOW() - INTERVAL '66 days'),

    ('10000000-0000-0000-0000-000000000031', 'casey.nguyen@cheersly.demo.local', 'priya.patel@cheersly.demo.local', 5, 'Thanks for turning rough requirements into a plan everyone could execute.', NOW() - INTERVAL '1 day 3 hours'),
    ('10000000-0000-0000-0000-000000000032', 'casey.nguyen@cheersly.demo.local', 'morgan.davis@cheersly.demo.local', 4, 'Appreciate the quick call on priority changes. It prevented a lot of churn.', NOW() - INTERVAL '6 days'),
    ('10000000-0000-0000-0000-000000000033', 'casey.nguyen@cheersly.demo.local', 'avery.chen@cheersly.demo.local', 3, 'The markdown preview fix was small but made authoring much smoother. #quality', NOW() - INTERVAL '13 days'),
    ('10000000-0000-0000-0000-000000000034', 'casey.nguyen@cheersly.demo.local', 'mateo.garcia@cheersly.demo.local', 2, 'Thanks for writing up the rollback steps before we needed them.', NOW() - INTERVAL '28 days'),
    ('10000000-0000-0000-0000-000000000035', 'casey.nguyen@cheersly.demo.local', 'quinn.adams@cheersly.demo.local', 6, 'Your test matrix caught edge cases that would have landed in production. Great work.', NOW() - INTERVAL '52 days'),

    ('10000000-0000-0000-0000-000000000036', 'morgan.davis@cheersly.demo.local', 'riley.brooks@cheersly.demo.local', 4, 'Thank you for keeping the sprint review grounded in real outcomes and not just output.', NOW() - INTERVAL '2 days 12 hours'),
    ('10000000-0000-0000-0000-000000000037', 'morgan.davis@cheersly.demo.local', 'casey.nguyen@cheersly.demo.local', 5, 'The visual cleanup on the store cards noticeably improved the demo. #craft', NOW() - INTERVAL '10 days'),
    ('10000000-0000-0000-0000-000000000038', 'morgan.davis@cheersly.demo.local', 'jordan.lee@cheersly.demo.local', 3, 'Appreciate the way you kept everyone aligned during the launch window.', NOW() - INTERVAL '17 days'),
    ('10000000-0000-0000-0000-000000000039', 'morgan.davis@cheersly.demo.local', 'avery.chen@cheersly.demo.local', 2, 'Thanks for the concise incident notes. They made follow-up actions obvious.', NOW() - INTERVAL '34 days'),
    ('10000000-0000-0000-0000-000000000040', 'morgan.davis@cheersly.demo.local', 'mateo.garcia@cheersly.demo.local', 6, 'Your release prep was reliable from start to finish, including the screenshot pack ![release snapshot](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400).', NOW() - INTERVAL '69 days');

INSERT INTO "Cheers" (
    "Id",
    "SenderId",
    "Message",
    "PointsPerRecipient",
    "CreatedAt"
)
SELECT
    dc.cheer_id,
    sender."Id",
    dc.message,
    dc.points,
    dc.created_at
FROM demo_cheers dc
INNER JOIN "Users" sender ON sender."Email" = dc.sender_email;

INSERT INTO "CheerRecipients" (
    "Id",
    "CheerId",
    "RecipientId",
    "PointsAwarded"
)
SELECT
    gen_random_uuid(),
    dc.cheer_id,
    recipient."Id",
    dc.points
FROM demo_cheers dc
INNER JOIN "Users" recipient ON recipient."Email" = dc.recipient_email;

WITH demo_user_ids AS (
    SELECT u."Id"
    FROM "Users" u
    INNER JOIN demo_users du ON du.email = u."Email"
),
current_month_sent AS (
    SELECT
        c."SenderId" AS user_id,
        COALESCE(SUM(c."PointsPerRecipient"), 0) AS points_sent
    FROM "Cheers" c
    WHERE c."SenderId" IN (SELECT "Id" FROM demo_user_ids)
      AND c."CreatedAt" >= date_trunc('month', NOW())
    GROUP BY c."SenderId"
),
all_time_received AS (
    SELECT
        cr."RecipientId" AS user_id,
        COALESCE(SUM(cr."PointsAwarded"), 0) AS points_received
    FROM "CheerRecipients" cr
    WHERE cr."RecipientId" IN (SELECT "Id" FROM demo_user_ids)
    GROUP BY cr."RecipientId"
)
UPDATE "Users" u
SET
    "PointsToGive" = GREATEST(0, 50 - COALESCE(cms.points_sent, 0)),
    "PointsReceived" = COALESCE(atr.points_received, 0),
    "LastLoginAt" = NOW(),
    "LastPointsReset" = date_trunc('month', NOW())
FROM demo_user_ids dui
LEFT JOIN current_month_sent cms ON cms.user_id = dui."Id"
LEFT JOIN all_time_received atr ON atr.user_id = dui."Id"
WHERE u."Id" = dui."Id";

COMMIT;