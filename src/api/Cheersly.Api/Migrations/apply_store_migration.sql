-- Add Store Entities Migration

-- Create StoreItems table
CREATE TABLE "StoreItems" (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Description" character varying(2000) NOT NULL,
    "PointCost" integer NOT NULL,
    "ImageUrl" character varying(500) NULL,
    "Category" character varying(50) NOT NULL DEFAULT 'Other',
    "QuantityAvailable" integer NULL,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_StoreItems" PRIMARY KEY ("Id"),
    CONSTRAINT "CK_StoreItem_PointCost" CHECK ("PointCost" > 0),
    CONSTRAINT "CK_StoreItem_QuantityAvailable" CHECK ("QuantityAvailable" IS NULL OR "QuantityAvailable" >= 0)
);

-- Create Orders table
CREATE TABLE "Orders" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "StoreItemId" uuid NOT NULL,
    "PointsSpent" integer NOT NULL,
    "Status" character varying(50) NOT NULL DEFAULT 'Pending',
    "OrderedAt" timestamp with time zone NOT NULL,
    "FulfilledAt" timestamp with time zone NULL,
    "Notes" character varying(1000) NULL,
    CONSTRAINT "PK_Orders" PRIMARY KEY ("Id"),
    CONSTRAINT "CK_Order_PointsSpent" CHECK ("PointsSpent" > 0),
    CONSTRAINT "FK_Orders_StoreItems_StoreItemId" FOREIGN KEY ("StoreItemId") REFERENCES "StoreItems" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Orders_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

-- Create indexes
CREATE INDEX "IX_Orders_OrderedAt" ON "Orders" ("OrderedAt" DESC);
CREATE INDEX "IX_Orders_Status" ON "Orders" ("Status");
CREATE INDEX "IX_Orders_StoreItemId" ON "Orders" ("StoreItemId");
CREATE INDEX "IX_Orders_UserId" ON "Orders" ("UserId");
CREATE INDEX "IX_StoreItems_Category" ON "StoreItems" ("Category");
CREATE INDEX "IX_StoreItems_IsActive" ON "StoreItems" ("IsActive");
CREATE UNIQUE INDEX "IX_StoreItems_Name" ON "StoreItems" ("Name");

-- Update EF Migrations History
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20251113150614_AddStoreEntities', '10.0.0');
