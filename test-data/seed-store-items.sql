-- Seed data for Cheersly Store
-- Items under 50 points for easy testing

-- Test users
INSERT INTO "Users" ("Id", "Email", "FirstName", "LastName", "PointsToGive", "PointsReceived", "CreatedAt", "LastLoginAt", "LastPointsReset", "Role")
VALUES
(gen_random_uuid(), 'alex.admin@cheersly.local', 'Alex', 'Admin', 50, 240, NOW(), NOW(), NOW(), 'Admin'),
(gen_random_uuid(), 'sam.giver@cheersly.local', 'Sam', 'Giver', 35, 125, NOW(), NOW(), NOW(), 'Normal'),
(gen_random_uuid(), 'taylor.receiver@cheersly.local', 'Taylor', 'Receiver', 20, 310, NOW(), NOW(), NOW(), 'Normal'),
(gen_random_uuid(), 'jamie.newhire@cheersly.local', 'Jamie', 'Newhire', 50, 15, NOW(), NOW(), NOW(), 'Normal')
ON CONFLICT ("Email") DO UPDATE
SET "FirstName" = EXCLUDED."FirstName",
	"LastName" = EXCLUDED."LastName",
	"PointsToGive" = EXCLUDED."PointsToGive",
	"PointsReceived" = EXCLUDED."PointsReceived",
	"LastLoginAt" = EXCLUDED."LastLoginAt",
	"LastPointsReset" = EXCLUDED."LastPointsReset",
	"Role" = EXCLUDED."Role";

-- Gift Cards
INSERT INTO "StoreItems" ("Id", "Name", "Description", "PointCost", "ImageUrl", "Category", "QuantityAvailable", "IsActive", "CreatedAt", "UpdatedAt")
VALUES 
(gen_random_uuid(), 'Coffee Shop Gift Card', 'Enjoy a **free coffee** on us! Redeem this $5 gift card at your favorite local coffee shop.

Perfect for:
- Morning pick-me-ups ☕
- Afternoon caffeine boost
- Treating a colleague', 25, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'Gift Cards', NULL, true, NOW(), NOW()),

(gen_random_uuid(), '$10 Amazon Gift Card', 'Shop for anything on Amazon with this **$10 gift card**. From books to gadgets, the choice is yours!

🎁 Instant delivery
📦 No expiration date
🌟 Use for anything on Amazon', 40, 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400', 'Gift Cards', 50, true, NOW(), NOW()),

(gen_random_uuid(), '$25 Amazon Gift Card', 'Unlock bigger purchases with this **$25 Amazon gift card**. Perfect for books, electronics, home goods, and more.

✨ Great value
📚 Millions of products
🚀 Digital delivery', 100, 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400', 'Gift Cards', 30, true, NOW(), NOW()),

(gen_random_uuid(), '$50 Restaurant Gift Card', 'Treat yourself to a **fine dining experience** with this $50 restaurant gift card. Valid at participating local restaurants.

🍽️ Great food awaits
👥 Perfect for date night
🎉 Celebrate your success', 200, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 'Gift Cards', 20, true, NOW(), NOW())
ON CONFLICT ("Name") DO UPDATE
SET "Description" = EXCLUDED."Description",
	"PointCost" = EXCLUDED."PointCost",
	"ImageUrl" = EXCLUDED."ImageUrl",
	"Category" = EXCLUDED."Category",
	"QuantityAvailable" = EXCLUDED."QuantityAvailable",
	"IsActive" = EXCLUDED."IsActive",
	"UpdatedAt" = NOW();

-- Swag
INSERT INTO "StoreItems" ("Id", "Name", "Description", "PointCost", "ImageUrl", "Category", "QuantityAvailable", "IsActive", "CreatedAt", "UpdatedAt")
VALUES 
(gen_random_uuid(), 'Company Water Bottle', 'Stay hydrated in style with our **premium insulated water bottle**!

Features:
- 🌡️ Keeps drinks cold for 24 hours
- ♨️ Keeps drinks hot for 12 hours
- 🎨 Company logo engraved
- 💪 Durable stainless steel', 30, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 'Swag', 100, true, NOW(), NOW()),

(gen_random_uuid(), 'Wireless Mouse', 'Upgrade your workspace with this **ergonomic wireless mouse**. Say goodbye to wrist strain!

✅ Ergonomic design
🔋 Long battery life
📡 Bluetooth connectivity
🖱️ Precision tracking', 45, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', 'Swag', 25, true, NOW(), NOW()),

(gen_random_uuid(), 'Company Hoodie', 'Show your team pride with our **premium fleece hoodie**!

👕 Sizes: S, M, L, XL, XXL
🧵 Ultra-soft fleece
🎨 Embroidered logo
🔥 Perfect for casual Friday', 75, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 'Swag', 50, true, NOW(), NOW()),

(gen_random_uuid(), 'Mechanical Keyboard', 'Elevate your typing experience with this **premium mechanical keyboard**!

Features:
⌨️ Cherry MX switches
🌈 RGB backlighting
💼 Professional grade
🎮 Great for work and play', 150, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400', 'Swag', 15, true, NOW(), NOW())
ON CONFLICT ("Name") DO UPDATE
SET "Description" = EXCLUDED."Description",
	"PointCost" = EXCLUDED."PointCost",
	"ImageUrl" = EXCLUDED."ImageUrl",
	"Category" = EXCLUDED."Category",
	"QuantityAvailable" = EXCLUDED."QuantityAvailable",
	"IsActive" = EXCLUDED."IsActive",
	"UpdatedAt" = NOW();

-- Experiences
INSERT INTO "StoreItems" ("Id", "Name", "Description", "PointCost", "ImageUrl", "Category", "QuantityAvailable", "IsActive", "CreatedAt", "UpdatedAt")
VALUES 
(gen_random_uuid(), 'Team Lunch', 'Join your team for a **catered lunch** on us! Pizza, salads, and drinks included.

🍕 Choose your favorite cuisine
👥 Bond with your team
🎉 Celebrate your achievements', 35, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 'Experiences', NULL, true, NOW(), NOW()),

(gen_random_uuid(), 'Reserved Parking Spot (1 Month)', 'Park like a VIP! Get a **reserved parking spot** for one month right next to the entrance.

🚗 Prime location
📅 30 days
⭐ No more circling the lot!', 80, 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400', 'Experiences', 5, true, NOW(), NOW()),

(gen_random_uuid(), 'Movie Tickets (2)', 'Enjoy a night out with **two movie tickets** to your local cinema!

🎬 Latest releases
🍿 Popcorn not included (yet!)
👥 Great for date night', 60, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', 'Experiences', 20, true, NOW(), NOW()),

(gen_random_uuid(), 'Spa Day Package', 'Relax and unwind with a **full spa day package**. You deserve it!

💆 90-minute massage
🧖 Facial treatment
🛀 Sauna access
🧘 Yoga class included', 300, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400', 'Experiences', 10, true, NOW(), NOW())
ON CONFLICT ("Name") DO UPDATE
SET "Description" = EXCLUDED."Description",
	"PointCost" = EXCLUDED."PointCost",
	"ImageUrl" = EXCLUDED."ImageUrl",
	"Category" = EXCLUDED."Category",
	"QuantityAvailable" = EXCLUDED."QuantityAvailable",
	"IsActive" = EXCLUDED."IsActive",
	"UpdatedAt" = NOW();

-- Time Off
INSERT INTO "StoreItems" ("Id", "Name", "Description", "PointCost", "ImageUrl", "Category", "QuantityAvailable", "IsActive", "CreatedAt", "UpdatedAt")
VALUES 
(gen_random_uuid(), 'Half Day Off', 'Take a **half day off** to recharge! Leave at noon with full pay.

🌅 Leave at noon
💰 Full pay
📅 Use within 90 days
😌 Relax and recharge', 50, 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400', 'Time Off', NULL, true, NOW(), NOW()),

(gen_random_uuid(), 'Full Day Off', 'Enjoy a **full day off** on us! Perfect for extending a weekend or handling personal matters.

📅 Full paid day
🏖️ Use within 90 days
✨ No questions asked
🎉 You earned it!', 100, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'Time Off', NULL, true, NOW(), NOW()),

(gen_random_uuid(), 'Work From Home Friday', 'Skip the commute! Work from home on a **Friday of your choice**.

🏡 Comfort of home
💼 Full productivity
📅 One Friday
☕ More coffee, less commute', 30, 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400', 'Time Off', NULL, true, NOW(), NOW())
ON CONFLICT ("Name") DO UPDATE
SET "Description" = EXCLUDED."Description",
	"PointCost" = EXCLUDED."PointCost",
	"ImageUrl" = EXCLUDED."ImageUrl",
	"Category" = EXCLUDED."Category",
	"QuantityAvailable" = EXCLUDED."QuantityAvailable",
	"IsActive" = EXCLUDED."IsActive",
	"UpdatedAt" = NOW();

-- Charitable Donations
INSERT INTO "StoreItems" ("Id", "Name", "Description", "PointCost", "ImageUrl", "Category", "QuantityAvailable", "IsActive", "CreatedAt", "UpdatedAt")
VALUES 
(gen_random_uuid(), '$25 Charity Donation', 'Make a difference! We''ll donate **$25 to a charity of your choice** in your name.

❤️ Choose your cause
📜 Tax-deductible
🌍 Make an impact
✨ Feel good giving back', 25, 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400', 'Charitable Donations', NULL, true, NOW(), NOW()),

(gen_random_uuid(), '$50 Charity Donation', 'Double your impact! We''ll donate **$50 to your chosen charity**.

💝 Your choice of charity
📧 Receipt provided
🌟 Tax-deductible
🤝 Corporate matching', 50, 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400', 'Charitable Donations', NULL, true, NOW(), NOW()),

(gen_random_uuid(), '$100 Charity Donation', 'Make a significant impact with a **$100 donation** to your favorite cause.

🎯 Maximum impact
📜 Official receipt
💫 Recognition letter
🏆 Champion of giving', 100, 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400', 'Charitable Donations', NULL, true, NOW(), NOW())
ON CONFLICT ("Name") DO UPDATE
SET "Description" = EXCLUDED."Description",
	"PointCost" = EXCLUDED."PointCost",
	"ImageUrl" = EXCLUDED."ImageUrl",
	"Category" = EXCLUDED."Category",
	"QuantityAvailable" = EXCLUDED."QuantityAvailable",
	"IsActive" = EXCLUDED."IsActive",
	"UpdatedAt" = NOW();

-- Other
INSERT INTO "StoreItems" ("Id", "Name", "Description", "PointCost", "ImageUrl", "Category", "QuantityAvailable", "IsActive", "CreatedAt", "UpdatedAt")
VALUES 
(gen_random_uuid(), 'Desk Plant', 'Brighten up your workspace with a beautiful **succulent desk plant**!

🌱 Low maintenance
🪴 Includes decorative pot
💚 Improves air quality
😊 Boosts mood', 20, 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400', 'Other', 30, true, NOW(), NOW()),

(gen_random_uuid(), 'Noise-Cancelling Headphones', 'Focus better with **premium noise-cancelling headphones**!

🎧 Active noise cancellation
🔋 30-hour battery life
🎵 Superior sound quality
💼 Perfect for open offices', 120, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400', 'Other', 20, true, NOW(), NOW()),

(gen_random_uuid(), 'Portable Phone Charger', 'Never run out of battery again! **10,000mAh portable charger**.

🔌 Fast charging
📱 Charges 3 devices
⚡ Compact design
✈️ TSA approved', 35, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', 'Other', 40, true, NOW(), NOW())
ON CONFLICT ("Name") DO UPDATE
SET "Description" = EXCLUDED."Description",
	"PointCost" = EXCLUDED."PointCost",
	"ImageUrl" = EXCLUDED."ImageUrl",
	"Category" = EXCLUDED."Category",
	"QuantityAvailable" = EXCLUDED."QuantityAvailable",
	"IsActive" = EXCLUDED."IsActive",
	"UpdatedAt" = NOW();
