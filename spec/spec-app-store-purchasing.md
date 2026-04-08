---
title: Store Purchasing Workflow
version: 1.0
date_created: 2025-11-12
last_updated: 2025-11-12
owner: Product Team
tags: [app, schema, data, infrastructure]
---

# Introduction

This specification defines the core purchasing workflow for the Cheersly Store, enabling users to browse a catalog of rewards and redeem their accumulated recognition points. The focus is on creating a seamless user experience for discovering available items, making purchase decisions, and tracking redemption history. This specification intentionally excludes back-office fulfillment processes (physical shipping, vendor integrations, external payment systems) to maintain focus on the core digital purchasing experience.

## 1. Purpose & Scope

**Purpose**: Define the core purchasing workflow for the Cheersly Store, enabling users to browse available rewards and redeem their accumulated points through a simple, reliable transaction system.

**Scope**: This specification covers:
- Store item catalog data model and display
- Point redemption transaction processing
- Order creation and basic status tracking
- Inventory availability management
- User redemption history viewing
- Administrative catalog management (create/edit items, update inventory)
- Basic order status updates for administrators
- Integration with existing User.PointsReceived system

**Out of Scope**:
- Physical fulfillment logistics and shipping workflows
- Third-party vendor integrations and external API connections
- Payment processing with external payment gateways
- Gift card code generation and activation systems
- Automated inventory replenishment and purchasing
- Email/SMS notification systems for order updates
- Shipping address collection and validation
- External CRM or ERP system integrations
- Advanced reporting and analytics dashboards
- Refund and return processing workflows

**Intended Audience**: Backend developers, frontend developers, product managers, AI code generators

**Assumptions**:
- Users have accumulated points from receiving Cheers (User.PointsReceived)
- User authentication and authorization (including Admin role) are operational
- Physical item fulfillment is handled manually outside the system
- Administrators manually update order status when items are delivered

## 2. Definitions

- **Store Item**: A reward or product available for redemption with points
- **Points Received**: The cumulative points balance a user has earned from receiving Cheers (the currency for store purchases)
- **Redemption**: The transaction exchanging points for a store item
- **Order**: A record of a completed redemption transaction
- **Inventory**: The quantity of available items in the store
- **Category**: A grouping mechanism for organizing store items (e.g., Gift Cards, Swag, Experiences)
- **Active Item**: A store item visible and purchasable by users
- **Inactive Item**: A store item hidden from users, cannot be purchased
- **Order Status**: The current state of an order (Pending, Processing, Fulfilled, Cancelled)

## 3. Requirements, Constraints & Guidelines

### Store Item Data Model Requirements

- **REQ-001**: The StoreItem entity MUST contain the following properties:
  - `Id` (Guid) - Primary key, auto-generated
  - `Name` (string, max 200 chars) - Display name of the item
  - `Description` (string, max 2000 chars) - Detailed description with markdown support
  - `PointCost` (int) - Number of points required to redeem
  - `ImageUrl` (string, optional) - URL to item image
  - `Category` (string, max 50 chars) - Category for filtering/organization
  - `QuantityAvailable` (int, nullable) - Available stock (null = unlimited)
  - `IsActive` (bool) - Whether item is visible and purchasable
  - `CreatedAt` (DateTime) - When the item was added
  - `UpdatedAt` (DateTime) - Last modification timestamp

- **REQ-002**: PointCost MUST be a positive integer greater than 0

- **REQ-003**: Name MUST be required and unique within the store

- **REQ-004**: Description MUST support markdown formatting for rich text display

- **REQ-005**: Category MUST be one of: "Gift Cards", "Swag", "Experiences", "Time Off", "Charitable Donations", "Other"

- **REQ-006**: QuantityAvailable NULL value MUST indicate unlimited availability

- **REQ-007**: QuantityAvailable when set MUST be a non-negative integer

- **REQ-008**: Only items with IsActive = true MUST be visible to non-admin users

### Order Data Model Requirements

- **REQ-010**: The Order entity MUST contain the following properties:
  - `Id` (Guid) - Primary key, auto-generated
  - `UserId` (Guid) - Foreign key to User entity
  - `StoreItemId` (Guid) - Foreign key to StoreItem entity
  - `PointsSpent` (int) - Points deducted from user's balance
  - `Status` (string) - Current order status
  - `OrderedAt` (DateTime) - Timestamp of redemption
  - `FulfilledAt` (DateTime, nullable) - Timestamp when marked fulfilled
  - `Notes` (string, optional, max 1000 chars) - Admin notes

- **REQ-011**: Order MUST have a navigation property to User entity

- **REQ-012**: Order MUST have a navigation property to StoreItem entity

- **REQ-013**: Order Status MUST be one of: "Pending", "Processing", "Fulfilled", "Cancelled"

- **REQ-014**: PointsSpent MUST record the actual point cost at time of redemption

- **REQ-015**: FulfilledAt MUST be automatically set when Status transitions to "Fulfilled"

- **REQ-016**: New orders MUST be created with Status = "Pending"

### Point Redemption Requirements

- **REQ-020**: Users MUST only be able to redeem items using their PointsReceived balance

- **REQ-021**: The system MUST verify sufficient PointsReceived balance before allowing redemption

- **REQ-022**: Point deduction and Order creation MUST be atomic (single database transaction)

- **REQ-023**: Redemption MUST fail if user has insufficient points

- **REQ-024**: Redemption MUST fail if item IsActive = false

- **REQ-025**: Redemption MUST fail if QuantityAvailable = 0

- **REQ-026**: Successful redemption MUST decrement QuantityAvailable by 1 (if not unlimited)

- **REQ-027**: Successful redemption MUST deduct PointCost from user's PointsReceived

- **REQ-028**: Successful redemption MUST create an Order record with Status = "Pending"

- **REQ-029**: Failed redemption MUST NOT modify user points or item quantity

- **REQ-030**: Redemption transaction MUST use optimistic concurrency to handle simultaneous purchases

### Catalog Browsing Requirements

- **REQ-035**: Users MUST be able to view all active store items

- **REQ-036**: Users MUST be able to filter items by category

- **REQ-037**: Each item listing MUST display: name, point cost, availability status, category

- **REQ-038**: Item detail view MUST display: full description, point cost, user's current balance, availability

- **REQ-039**: Items with QuantityAvailable = 0 MUST show "Out of Stock" indicator

- **REQ-040**: Store catalog MUST be sorted with in-stock items before out-of-stock items

### Order History Requirements

- **REQ-045**: Users MUST be able to view their own order history

- **REQ-046**: Order history MUST display: item name, points spent, order date, current status

- **REQ-047**: Orders MUST be sorted by most recent first

- **REQ-048**: Users MUST NOT be able to view other users' orders

### Administrative Requirements

- **REQ-050**: Admin users MUST be able to create new store items

- **REQ-051**: Admin users MUST be able to update existing store items (name, description, price, category, image)

- **REQ-052**: Admin users MUST be able to activate/deactivate store items (toggle IsActive)

- **REQ-053**: Admin users MUST be able to adjust QuantityAvailable

- **REQ-054**: Admin users MUST be able to view all orders across all users

- **REQ-055**: Admin users MUST be able to update Order Status

- **REQ-056**: Admin users MUST be able to add Notes to orders

- **REQ-057**: Admin users MUST be able to filter orders by Status

- **REQ-058**: Deactivating an item MUST NOT affect existing orders for that item

### Security Requirements

- **SEC-001**: Only authenticated users MUST be able to access store endpoints

- **SEC-002**: Users MUST only be able to redeem items for themselves

- **SEC-003**: Users MUST only view their own order history

- **SEC-004**: All admin endpoints MUST require Admin role authorization

- **SEC-005**: Point balance verification MUST occur server-side only

- **SEC-006**: Redemption transactions MUST prevent race conditions via database transactions

### Constraints

- **CON-001**: The system MUST use existing User.PointsReceived field (no new point types)

- **CON-002**: Store redemptions MUST NOT affect User.PointsToGive (monthly allocation)

- **CON-003**: Orders MUST be immutable (no deletion, only status updates)

- **CON-004**: Price changes MUST NOT affect existing orders (PointsSpent is recorded)

- **CON-005**: The system MUST NOT handle physical fulfillment or shipping

### Guidelines

- **GUD-001**: Store item images SHOULD be optimized for web delivery

- **GUD-002**: Store catalog SHOULD be cached on frontend with periodic refresh

- **GUD-003**: Order history SHOULD be paginated for users with many orders

- **GUD-004**: Out of stock items SHOULD remain visible but clearly marked

- **GUD-005**: Admin inventory views SHOULD highlight low stock items (< 10)

- **GUD-006**: Item descriptions SHOULD include estimated fulfillment timeframe

### UI/UX Patterns

- **PAT-001**: Store listing MUST display items in a grid/card layout

- **PAT-002**: Each item card MUST show: image, name, point cost, availability badge

- **PAT-003**: Item detail view MUST show user's current point balance

- **PAT-004**: Redeem button MUST be disabled if: insufficient points, out of stock, or item inactive

- **PAT-005**: Successful redemption MUST show confirmation with order ID

- **PAT-006**: Redemption confirmation MUST show new point balance

- **PAT-007**: Category filter MUST be prominent in store navigation

## 4. Interfaces & Data Contracts

### StoreItem Entity

```csharp
public class StoreItem
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    [Range(1, int.MaxValue)]
    public int PointCost { get; set; }
    
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "Other";
    
    [Range(0, int.MaxValue)]
    public int? QuantityAvailable { get; set; } // null = unlimited
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
```

### Order Entity

```csharp
public class Order
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    public Guid StoreItemId { get; set; }
    
    [Range(1, int.MaxValue)]
    public int PointsSpent { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";
    
    public DateTime OrderedAt { get; set; }
    public DateTime? FulfilledAt { get; set; }
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public StoreItem StoreItem { get; set; } = null!;
}
```

### API Endpoints

#### GET /api/store/items
**Purpose**: Retrieve active store items for browsing

**Query Parameters**:
- `category` (optional): Filter by category

**Authorization**: Authenticated users

**Response**: `200 OK`
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "$25 Amazon Gift Card",
    "description": "Redeem your points for a $25 Amazon.com gift card...",
    "pointCost": 2500,
    "imageUrl": "https://example.com/images/amazon-card.jpg",
    "category": "Gift Cards",
    "quantityAvailable": 50,
    "isInStock": true
  }
]
```

#### GET /api/store/items/{id}
**Purpose**: Get detailed information about a specific store item

**Authorization**: Authenticated users

**Response**: `200 OK` or `404 Not Found`
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "$25 Amazon Gift Card",
  "description": "Redeem your points for a $25 Amazon.com gift card. Delivered via email within 2 business days.",
  "pointCost": 2500,
  "imageUrl": "https://example.com/images/amazon-card.jpg",
  "category": "Gift Cards",
  "quantityAvailable": 50,
  "isInStock": true,
  "userCurrentPoints": 3000,
  "userCanAfford": true
}
```

#### POST /api/store/redeem
**Purpose**: Redeem points for a store item

**Authorization**: Authenticated users

**Request Body**:
```json
{
  "storeItemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response**: `201 Created` or `400 Bad Request`

**Success Response**:
```json
{
  "orderId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "storeItemName": "$25 Amazon Gift Card",
  "pointsSpent": 2500,
  "remainingPoints": 500,
  "orderedAt": "2025-11-12T10:30:00Z",
  "status": "Pending"
}
```

**Error Responses**:
- `400 Bad Request`: `{ "error": "Insufficient points. You have 1000 points but need 2500." }`
- `400 Bad Request`: `{ "error": "Item is out of stock." }`
- `400 Bad Request`: `{ "error": "Item is not available for purchase." }`
- `404 Not Found`: `{ "error": "Store item not found." }`

#### GET /api/store/orders
**Purpose**: Get authenticated user's order history

**Authorization**: Authenticated users

**Query Parameters**:
- `pageSize` (optional, default: 20): Number of results per page
- `pageNumber` (optional, default: 1): Page number

**Response**: `200 OK`
```json
{
  "orders": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "storeItemName": "$25 Amazon Gift Card",
      "storeItemImageUrl": "https://example.com/images/amazon-card.jpg",
      "pointsSpent": 2500,
      "status": "Fulfilled",
      "orderedAt": "2025-11-01T10:30:00Z",
      "fulfilledAt": "2025-11-03T14:20:00Z"
    }
  ],
  "totalCount": 15,
  "pageNumber": 1,
  "pageSize": 20
}
```

#### POST /api/admin/store/items
**Purpose**: Create a new store item

**Authorization**: Admin role required

**Request Body**:
```json
{
  "name": "$25 Amazon Gift Card",
  "description": "Redeem your points for a $25 Amazon.com gift card delivered via email.",
  "pointCost": 2500,
  "imageUrl": "https://example.com/images/amazon-card.jpg",
  "category": "Gift Cards",
  "quantityAvailable": 100,
  "isActive": true
}
```

**Response**: `201 Created`
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "$25 Amazon Gift Card",
  "createdAt": "2025-11-12T10:00:00Z"
}
```

#### PUT /api/admin/store/items/{id}
**Purpose**: Update an existing store item

**Authorization**: Admin role required

**Request Body**: Same as POST create item

**Response**: `200 OK` or `404 Not Found`

#### PATCH /api/admin/store/items/{id}/inventory
**Purpose**: Update item quantity availability

**Authorization**: Admin role required

**Request Body**:
```json
{
  "quantityAvailable": 75
}
```

**Response**: `200 OK`

#### GET /api/admin/store/orders
**Purpose**: Get all orders (admin view)

**Authorization**: Admin role required

**Query Parameters**:
- `status` (optional): Filter by order status
- `pageSize` (optional, default: 50)
- `pageNumber` (optional, default: 1)

**Response**: `200 OK`
```json
{
  "orders": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "userId": "8a7e9832-1234-5678-abcd-123456789abc",
      "userEmail": "john.doe@company.com",
      "userName": "John Doe",
      "storeItemName": "$25 Amazon Gift Card",
      "pointsSpent": 2500,
      "status": "Pending",
      "orderedAt": "2025-11-12T10:30:00Z",
      "fulfilledAt": null,
      "notes": null
    }
  ],
  "totalCount": 42,
  "pageNumber": 1,
  "pageSize": 50
}
```

#### PUT /api/admin/store/orders/{id}/status
**Purpose**: Update order status

**Authorization**: Admin role required

**Request Body**:
```json
{
  "status": "Fulfilled",
  "notes": "Gift card code sent via email on 2025-11-12"
}
```

**Response**: `200 OK`

## 5. Acceptance Criteria

### Store Catalog Browsing

- **AC-001**: Given I am an authenticated user, When I navigate to the store, Then I see all active items with their names, images, point costs, and availability

- **AC-002**: Given I am viewing the store catalog, When I filter by "Gift Cards" category, Then I only see items in the Gift Cards category

- **AC-003**: Given I am viewing the store catalog, When an item has QuantityAvailable = 0, Then it displays "Out of Stock" badge

- **AC-004**: Given I am viewing the store catalog, When I click on an item, Then I see the full item details including markdown-formatted description

### Point Redemption

- **AC-010**: Given I am a user with 3000 PointsReceived, When I redeem an item costing 2500 points, Then my PointsReceived balance is reduced to 500 and an Order is created

- **AC-011**: Given I am a user with 1000 PointsReceived, When I attempt to redeem an item costing 2500 points, Then the redemption fails with "Insufficient points" error

- **AC-012**: Given I am redeeming an item with QuantityAvailable = 5, When my redemption succeeds, Then QuantityAvailable is updated to 4

- **AC-013**: Given two users simultaneously redeem the last item in stock, When both requests are processed, Then only one redemption succeeds due to transaction isolation

- **AC-014**: Given I successfully redeem an item, When the transaction completes, Then I receive a confirmation with my order ID and new point balance

- **AC-015**: Given I attempt to redeem an inactive item directly via API, When the request is processed, Then the redemption fails with "Item not available" error

### Order History

- **AC-020**: Given I am a user with previous orders, When I view my order history, Then I see all my orders sorted by most recent first

- **AC-021**: Given I am viewing my order history, When I look at an order, Then I see the item name, points spent, order date, and current status

- **AC-022**: Given I am a user, When I attempt to view another user's order, Then I receive 403 Forbidden

### Admin Catalog Management

- **AC-030**: Given I am an admin user, When I create a new store item with valid data, Then the item is saved and assigned a unique ID

- **AC-031**: Given I am an admin user, When I set QuantityAvailable to null, Then the item shows unlimited availability

- **AC-032**: Given I am an admin user, When I set IsActive to false, Then the item is hidden from non-admin users

- **AC-033**: Given I am an admin user, When I update an item's point cost, Then existing orders are not affected (they show historical price)

### Admin Order Management

- **AC-040**: Given I am an admin user, When I view all orders, Then I see orders from all users with user details

- **AC-041**: Given I am an admin user, When I filter orders by "Pending" status, Then I only see orders with Status = "Pending"

- **AC-042**: Given I am an admin user, When I update an order status to "Fulfilled", Then the FulfilledAt timestamp is automatically set

- **AC-043**: Given I am an admin user, When I add notes to an order, Then the notes are saved and visible in admin order views

### Security and Authorization

- **AC-050**: Given I am not authenticated, When I attempt to access /api/store/items, Then I receive 401 Unauthorized

- **AC-051**: Given I am a non-admin user, When I attempt to access /api/admin/store/items, Then I receive 403 Forbidden

- **AC-052**: Given I am authenticated, When point balance is checked during redemption, Then verification occurs server-side only

## 6. Test Automation Strategy

### Test Levels

**Unit Tests**:
- Service layer point redemption logic
- Inventory calculations and updates
- Order status transitions
- Validation rules for store items and orders
- Point balance verification methods

**Integration Tests**:
- Complete redemption flow with database transactions
- Concurrent redemption race condition handling
- User point balance updates with database persistence
- Order creation and status update workflows
- Admin catalog management operations
- Authorization on admin endpoints

**End-to-End Tests**:
- User browses store, redeems item, views confirmation
- User views order history after redemption
- Admin creates item, user redeems, admin fulfills order
- Out of stock and insufficient points handling

### Frameworks

- **Backend**: MSTest, FluentAssertions, Moq, EF Core InMemory provider
- **Frontend**: Vitest, React Testing Library

### Test Data Management

- Use in-memory database for integration tests
- Create test fixtures for common scenarios (users with various point balances, items in different states)
- Reset database state between tests
- Use deterministic test data (fixed GUIDs, predictable timestamps)

### CI/CD Integration

- Run all tests on pull requests
- Require passing tests before merge to main
- Generate code coverage reports
- Block merge if coverage drops below threshold

### Coverage Requirements

- Minimum 80% code coverage for service layer
- 100% coverage for critical redemption transaction logic
- All API endpoints must have integration tests
- All authorization rules must have dedicated tests

### Performance Testing

- Test concurrent redemption attempts (10+ simultaneous users on same item)
- Verify transaction isolation prevents overselling
- Load test store catalog retrieval with 100+ items
- Verify database query performance with large order history

## 7. Rationale & Context

### Why Focus on the Purchasing Workflow?

This specification prioritizes the core digital purchasing experience because:
- **Immediate Value**: Users can start redeeming points as soon as the feature deploys
- **Reduced Complexity**: Separating purchasing from fulfillment allows faster implementation
- **Flexibility**: Back-office fulfillment can be handled manually or through future integrations
- **Clear Scope**: Focused specification reduces ambiguity and accelerates development
- **Iterative Approach**: Core workflow can be enhanced later with automation

### Why Separate PointsReceived from PointsToGive?

The system uses PointsReceived (accumulated recognition) as store currency rather than PointsToGive (monthly allocation). This design:
- Preserves the giving/receiving distinction in the recognition system
- Prevents "gaming" by redeeming instead of giving
- Creates long-term value accumulation
- Encourages continued engagement to earn more points
- Aligns with recognition principles (reward receivers, not givers)

### Why Track Detailed Order History?

Maintaining Order records provides:
- Transparency for users about redemption history
- Audit trail for administrative and compliance purposes
- Ability to handle status updates and basic order management
- Historical pricing (items may change cost over time)
- Foundation for future fulfillment system integration
- Analytics on popular items and redemption patterns

### Why Use Database Transactions?

Point redemption must be atomic to prevent:
- **Race conditions**: Multiple simultaneous redemptions of the last item
- **Partial failures**: Points deducted but order not created (or vice versa)
- **Inventory inconsistencies**: Item quantity not properly decremented
- **Double-spending**: Same points used for multiple items

Database transactions ensure all-or-nothing semantics for redemption operations.

### Why Allow Unlimited Quantity?

Setting QuantityAvailable to null (unlimited) supports:
- Digital items with no inventory constraints (e.g., charitable donations)
- Items ordered on-demand from external systems
- Simplified administration for common items
- Prevents admin oversight from blocking redemptions

### Why Immutable Order History?

Orders are never deleted to maintain:
- Complete audit trail for compliance
- User redemption history integrity
- Simple data model without complex cascading deletes
- Ability to analyze redemption patterns over time
- Accountability for point transactions

Status updates and cancellations tracked via Status field rather than deletion.

### What Happens After Order Creation?

The system creates an Order with Status = "Pending". Fulfillment activities (sending gift cards, arranging delivery) happen outside this system:
- **Manual Processing**: Administrators handle fulfillment through existing channels
- **Status Updates**: Admins update Order Status when item delivered
- **Future Integration**: System can integrate with external fulfillment platforms later
- **Flexibility**: Different item types can have different fulfillment processes

## 8. Dependencies & External Integrations

### Internal Dependencies

- **INT-001**: User Service - For accessing and updating PointsReceived balances
- **INT-002**: User Entity - Order entity references User for ownership
- **INT-003**: Authentication System - Requires authenticated user context for all operations
- **INT-004**: Authorization System - Requires Admin role verification for admin endpoints

### External Systems

- **EXT-001**: Microsoft Entra ID - User authentication and Admin role authorization

### Infrastructure Dependencies

- **INF-001**: PostgreSQL Database - Primary data store with ACID transaction support
- **INF-002**: Image Storage - For hosting store item images (file system or CDN)

### Data Dependencies

- **DAT-001**: User.PointsReceived - Must be accurate and up-to-date for redemption validation
- **DAT-002**: User.Email - For displaying order history and admin order management views

### Technology Platform Dependencies

- **PLT-001**: .NET 10.0 Runtime - For API implementation
- **PLT-002**: Entity Framework Core 10.0+ - For data access and transaction management
- **PLT-003**: React - For frontend store UI components
- **PLT-004**: Markdown Rendering Library - For displaying store item descriptions

## 9. Examples & Edge Cases

### Example 1: Successful Redemption

**Scenario**: User with 5000 points redeems a $25 gift card (2500 points)

```csharp
// Initial State
user.PointsReceived = 5000;
storeItem.QuantityAvailable = 10;
storeItem.PointCost = 2500;

// Redemption Transaction
using var transaction = await dbContext.Database.BeginTransactionAsync();
try 
{
    // Deduct points
    user.PointsReceived -= storeItem.PointCost;
    
    // Create order
    var order = new Order 
    {
        UserId = user.Id,
        StoreItemId = storeItem.Id,
        PointsSpent = storeItem.PointCost,
        Status = "Pending",
        OrderedAt = DateTime.UtcNow
    };
    dbContext.Orders.Add(order);
    
    // Decrement inventory
    if (storeItem.QuantityAvailable.HasValue) 
    {
        storeItem.QuantityAvailable--;
    }
    
    await dbContext.SaveChangesAsync();
    await transaction.CommitAsync();
}
catch 
{
    await transaction.RollbackAsync();
    throw;
}

// Final State
user.PointsReceived = 2500;
storeItem.QuantityAvailable = 9;
order.Status = "Pending";
order.PointsSpent = 2500;
```

### Example 2: Insufficient Points

**Scenario**: User with 1000 points attempts $25 gift card (2500 points)

```csharp
// Initial State
user.PointsReceived = 1000;
storeItem.PointCost = 2500;

// Validation Before Transaction
if (user.PointsReceived < storeItem.PointCost)
{
    return new RedemptionResult 
    {
        Success = false,
        ErrorMessage = $"Insufficient points. You have {user.PointsReceived} points but need {storeItem.PointCost}."
    };
}

// State Unchanged (transaction never started)
user.PointsReceived = 1000;
```

### Example 3: Out of Stock

**Scenario**: User attempts item with zero quantity

```csharp
// Initial State
user.PointsReceived = 5000;
storeItem.QuantityAvailable = 0;
storeItem.PointCost = 2500;

// Validation Before Transaction
if (storeItem.QuantityAvailable.HasValue && storeItem.QuantityAvailable <= 0)
{
    return new RedemptionResult 
    {
        Success = false,
        ErrorMessage = "This item is currently out of stock."
    };
}

// State Unchanged
user.PointsReceived = 5000;
storeItem.QuantityAvailable = 0;
```

### Example 4: Race Condition - Last Item

**Scenario**: Two users simultaneously redeem last item with transaction isolation

```csharp
// Initial State
storeItem.QuantityAvailable = 1;

// User A starts transaction
using var transactionA = await dbContextA.Database.BeginTransactionAsync();
storeItem = await dbContextA.StoreItems.FindAsync(itemId); // Reads: 1
storeItem.QuantityAvailable--; // Sets to 0
await dbContextA.SaveChangesAsync();
await transactionA.CommitAsync(); // SUCCESS

// User B starts transaction (milliseconds later)
using var transactionB = await dbContextB.Database.BeginTransactionAsync();
storeItem = await dbContextB.StoreItems.FindAsync(itemId); // Reads: 0 (committed by A)
if (storeItem.QuantityAvailable <= 0) 
{
    await transactionB.RollbackAsync();
    return "Out of stock"; // FAILS
}

// Final State
// User A: Order created, points deducted
// User B: No order, points unchanged
storeItem.QuantityAvailable = 0;
```

### Example 5: Unlimited Quantity Item

**Scenario**: User redeems unlimited availability item

```csharp
// Initial State
user.PointsReceived = 5000;
storeItem.QuantityAvailable = null; // Unlimited
storeItem.PointCost = 1000;

// Redemption
await RedeemItemAsync(userId, storeItemId);

// Final State
user.PointsReceived = 4000;
storeItem.QuantityAvailable = null; // Still unlimited
// Order created successfully
```

### Example 6: Price Change Doesn't Affect Historical Orders

**Scenario**: Admin changes price, old orders unaffected

```csharp
// User redeems at original price
storeItem.PointCost = 2500;
await RedeemItemAsync(userId, storeItemId);
var order1 = dbContext.Orders.OrderByDescending(o => o.OrderedAt).First();
// order1.PointsSpent = 2500 (recorded at redemption)

// Admin changes price
storeItem.PointCost = 3000;
await dbContext.SaveChangesAsync();

// Second user redeems at new price
await RedeemItemAsync(user2Id, storeItemId);
var order2 = dbContext.Orders.OrderByDescending(o => o.OrderedAt).First();
// order2.PointsSpent = 3000 (new price recorded)

// Historical integrity maintained
Assert.AreEqual(2500, order1.PointsSpent);
Assert.AreEqual(3000, order2.PointsSpent);
```

### Example 7: Admin Fulfills Order

**Scenario**: Admin marks order as fulfilled

```csharp
// Initial State
order.Status = "Pending";
order.FulfilledAt = null;

// Admin updates status via API
var request = new UpdateOrderStatusDto 
{
    Status = "Fulfilled",
    Notes = "Amazon gift card code emailed to user on 2025-11-12"
};

await adminService.UpdateOrderStatusAsync(orderId, request);

// Final State
order.Status = "Fulfilled";
order.FulfilledAt = DateTime.UtcNow;
order.Notes = "Amazon gift card code emailed to user on 2025-11-12";
```

## 10. Validation Criteria

### Data Validation

- **VAL-001**: StoreItem.Name must be unique (database constraint)
- **VAL-002**: StoreItem.PointCost must be > 0
- **VAL-003**: StoreItem.QuantityAvailable must be >= 0 or null
- **VAL-004**: StoreItem.Category must be one of predefined categories
- **VAL-005**: Order.Status must be one of predefined statuses
- **VAL-006**: Order.PointsSpent must equal StoreItem.PointCost at creation time

### Business Logic Validation

- **VAL-010**: Redemption fails if user.PointsReceived < storeItem.PointCost
- **VAL-011**: Redemption fails if storeItem.IsActive = false
- **VAL-012**: Redemption fails if storeItem.QuantityAvailable = 0
- **VAL-013**: Point deduction and order creation occur in single atomic transaction
- **VAL-014**: Quantity decrement skipped if QuantityAvailable is null
- **VAL-015**: FulfilledAt automatically set when Status = "Fulfilled"

### Integration Validation

- **VAL-020**: User.PointsReceived accurately reflects all redemption transactions
- **VAL-021**: StoreItem.QuantityAvailable accurately reflects all redemptions
- **VAL-022**: Order count per item matches quantity sold
- **VAL-023**: Sum of Order.PointsSpent per user equals total points deducted

## 11. Related Specifications / Further Reading

- [User Data Tracking and Management](./spec-data-user-tracking.md) - Defines User entity and PointsReceived field
- [Application Architecture](./architecture.md) - Overall system architecture
- [Application Functions](./app-functions.md) - High-level feature overview
- [Microsoft Entra Authentication](./spec-infrastructure-microsoft-entra-auth.md) - Authentication and authorization patterns

### External Resources

- [Entity Framework Core Transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions)
- [ASP.NET Core Authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction)
- [Optimistic Concurrency in EF Core](https://learn.microsoft.com/en-us/ef/core/saving/concurrency)
