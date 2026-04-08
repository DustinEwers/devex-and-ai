---
title: Cheer Message Schema and Point Deduction
version: 1.0
date_created: 2025-11-11
last_updated: 2025-11-11
owner: Backend & Frontend Teams
tags: [schema, data, api, features, recognition]
---

# Introduction

This specification defines the data model, API contracts, and user interface requirements for creating and displaying "Cheers" — messages of recognition and appreciation that award points to recipients, deducting points from the sender's monthly allocation. A Cheer is the core feature of Cheersly and represents one instance of workplace recognition with an associated point transfer.

## 1. Purpose & Scope

**Purpose**: Define the requirements for creating, storing, and displaying Cheers with atomic point transfers between users, ensuring data integrity and clear user feedback throughout the recognition flow.

**Scope**: This specification covers:
- Cheer entity data model and database schema
- Point deduction and accumulation mechanics
- API endpoints for creating and retrieving Cheers
- Frontend UI components and messaging templates
- Validation and error handling for point transfers
- Audit trail and timestamps

**Out of Scope**:
- Point redemption in the Store (future specification)
- Rich text rendering implementation (assumed handled by markdown library)
- Image/file upload infrastructure
- Hashtag indexing and search (future specification)
- Feed sorting and pagination algorithms (future specification)

**Intended Audience**: Full-stack developers, backend engineers, frontend engineers, product designers

**Assumptions**:
- User synchronization and authentication are already implemented
- User points (PointsToGive, PointsReceived) are managed via the User entity
- The application uses PostgreSQL with Entity Framework Core
- Point transfers must be atomic (all-or-nothing transactions)
- Frontend has access to authenticated MSAL tokens and msalApiClient utilities

## 2. Definitions

- **Cheer**: A message of recognition sent from one user (sender) to one or more users (recipients), with an associated point transfer.
- **Sender**: The user initiating the Cheer and deducting points from their PointsToGive balance.
- **Recipient**: A user receiving a Cheer and gaining points in their PointsReceived balance.
- **PointsToGive**: Monthly allocation (resets monthly); the pool a sender deducts from when creating a Cheer.
- **PointsReceived**: Cumulative points earned through Cheers; persistent across months and redeemable in the Store.
- **Atomic Transaction**: A database operation that either completes fully or rolls back entirely; no partial updates.
- **Feed**: Public or user-specific chronologically ordered list of Cheers.
- **Rich Text Message**: Markdown-formatted text with support for hashtags, bold, italic, links, and embedded images.
- **Markdown**: Plain-text formatting syntax for creating structured messages.
- **Hashtag**: Text prefixed with `#` (e.g., `#teamwork`) for categorizing Cheers.

## 3. Requirements, Constraints & Guidelines

### Data Model Requirements

- **REQ-001**: A Cheer entity MUST contain the following properties:
  - `Id` (Guid) – Primary key, auto-generated
  - `SenderId` (Guid) – Foreign key to User, sender of the Cheer
  - `Message` (string, up to 2000 chars) – Rich text message (Markdown)
  - `PointsPerRecipient` (int) – Points awarded to each recipient
  - `CreatedAt` (DateTime) – Timestamp when Cheer was created (UTC)
  - Navigation: `Sender` (User object)
  - Navigation: `Recipients` (collection of CheerRecipient join entities)

- **REQ-002**: A CheerRecipient join entity MUST contain:
  - `Id` (Guid) – Primary key
  - `CheerId` (Guid) – Foreign key to Cheer
  - `RecipientId` (Guid) – Foreign key to User
  - `PointsAwarded` (int) – Points actually awarded to this recipient (cached from Cheer.PointsPerRecipient)
  - Navigation: `Cheer` (Cheer object)
  - Navigation: `Recipient` (User object)

- **REQ-003**: PointsPerRecipient MUST be a positive integer (> 0).

- **REQ-004**: The Message field MUST support Markdown syntax including:
  - Bold (`**text**`), Italic (`*text*`), Links (`[text](url)`)
  - Hashtags (`#hashtag`)
  - Line breaks and paragraphs
  - NO executable code or scripts (sanitized on render)

- **REQ-005**: A Cheer MUST have at least one recipient (minimum 1).

- **REQ-006**: A Cheer MAY have multiple recipients; each recipient receives the same PointsPerRecipient.

- **REQ-007**: The creation timestamp MUST be immutable (set at insert, never updated).

### Point Transfer Requirements

- **REQ-010**: Point deduction from sender and addition to recipients MUST be atomic.
  - If any recipient update fails, the entire transaction MUST roll back.
  - Sender's PointsToGive MUST NOT be reduced if the operation is rolled back.

- **REQ-011**: Total points deducted from sender = PointsPerRecipient × RecipientCount.

- **REQ-012**: The system MUST validate sender has sufficient PointsToGive before allowing the Cheer creation.
  - Validation MUST be performed in the backend; frontend is for UX only.

- **REQ-013**: If sender has insufficient points, the Cheer creation MUST fail with HTTP 400 (Bad Request).

- **REQ-014**: On successful Cheer creation:
  - Sender's PointsToGive is decremented by (PointsPerRecipient × RecipientCount)
  - Each recipient's PointsReceived is incremented by PointsPerRecipient

- **REQ-015**: Each recipient MUST receive the same number of points (no variable point allocation per recipient in a single Cheer).

- **REQ-016**: Point transfers MUST NOT be reversible via API (Cheers are immutable; no edit or delete endpoints).

### Database Schema Requirements

- **REQ-020**: Cheer table MUST include a non-clustered index on `SenderId` for efficient filtering by sender.

- **REQ-021**: Cheer table MUST include a non-clustered index on `CreatedAt` (DESC) for feed ordering.

- **REQ-022**: CheerRecipient table MUST include a composite index on (`CheerId`, `RecipientId`) for efficient lookups.

- **REQ-023**: CheerRecipient table MUST include a non-clustered index on `RecipientId` for filtering by recipient.

- **REQ-024**: Foreign key constraints MUST be enforced; deleting a User MUST NOT cascade delete Cheers (use soft delete or archive user).

- **REQ-025**: A CHECK constraint MUST enforce `PointsPerRecipient > 0`.

### API Endpoint Requirements

- **REQ-030**: POST `/api/cheers` endpoint MUST accept a request body with:
  - `message` (string, max 2000 chars)
  - `pointsPerRecipient` (int, > 0)
  - `recipientIds` (array of Guid, min 1 item)

- **REQ-031**: POST `/api/cheers` MUST return:
  - HTTP 201 (Created) on success with the created Cheer object (including all recipients)
  - HTTP 400 (Bad Request) if validation fails (e.g., insufficient points, invalid input)
  - HTTP 401 (Unauthorized) if user is not authenticated
  - HTTP 500 (Internal Server Error) on transaction failure

- **REQ-032**: GET `/api/cheers` MUST return a paginated feed of all Cheers, ordered by `CreatedAt` DESC.
  - Query parameters: `page` (int, default 1), `pageSize` (int, default 20, max 100)
  - Response includes sender and recipient details for each Cheer

- **REQ-033**: GET `/api/cheers/sent` MUST return paginated Cheers sent by the authenticated user.

- **REQ-034**: GET `/api/cheers/received` MUST return paginated Cheers received by the authenticated user.

- **REQ-035**: GET `/api/cheers/{id}` MUST return a single Cheer with full sender and recipient details.

- **REQ-036**: Cheers MUST NOT support PATCH, PUT, or DELETE endpoints (immutable).

### Frontend UI Requirements

- **REQ-040**: A "Create Cheer" form MUST include:
  - Text input for message (with Markdown preview or support indicator)
  - Multi-select user picker for recipients (shows recipient names and current PointsReceived)
  - Numeric input for points per recipient (validates > 0 and sender's available balance)
  - Real-time display of total points to be deducted (PointsPerRecipient × RecipientCount)
  - "Send" button that is disabled if validation fails
  - Confirmation dialog before final submission

- **REQ-041**: The form MUST display the sender's current PointsToGive and warn if insufficient.

- **REQ-042**: Success message MUST confirm the point transfer:
  - "You gave {recipientNames} {points} points each. {points*count} deducted from your balance."
  - Show updated PointsToGive balance

- **REQ-043**: Error messages MUST be specific:
  - "Insufficient points. You have {available}, but this Cheer requires {needed}."
  - "All recipients must be valid users."
  - "Message must not be empty."
  - "Points per recipient must be at least 1."

- **REQ-044**: The Cheer feed MUST display each Cheer with:
  - Sender's name and avatar (if available)
  - Timestamp (e.g., "2 hours ago")
  - Message (rendered as Markdown)
  - Recipients and total points awarded (e.g., "{names} +{points} each")
  - Sender's remaining PointsToGive at the time (optional, for context)

- **REQ-045**: The profile page MUST show two Cheer sections:
  - "Cheers I've Sent" (paginated list)
  - "Cheers I've Received" (paginated list with total PointsReceived summary)

### Validation & Error Handling Requirements

- **REQ-050**: Frontend MUST validate before API call:
  - Message is not empty and ≤ 2000 chars
  - PointsPerRecipient > 0
  - At least one recipient selected
  - Total points ≤ sender's available PointsToGive (informational; backend is authoritative)

- **REQ-051**: Backend MUST validate and reject if:
  - Message is empty or > 2000 chars
  - PointsPerRecipient ≤ 0
  - RecipientIds is empty or contains duplicates
  - Any RecipientId is invalid (user does not exist)
  - RecipientIds contains the sender's own Id (users cannot give themselves points)
  - Sender has insufficient PointsToGive

- **REQ-052**: Database-level constraints MUST prevent:
  - PointsPerRecipient ≤ 0 (CHECK constraint)
  - Null SenderId or Message (NOT NULL constraints)
  - Foreign key violations (FOREIGN KEY constraints)

### Logging & Audit Requirements

- **REQ-060**: Every successful Cheer creation MUST be logged with:
  - SenderId, RecipientIds, PointsPerRecipient
  - Timestamp and IP address (if available)
  - Result (success or failure reason)

- **REQ-061**: Failed Cheer creation attempts (validation failures, insufficient balance) MUST be logged for monitoring and debugging.

### Constraints

- **CON-001**: All database operations MUST be asynchronous.

- **CON-002**: Point transfers MUST use database transactions with appropriate isolation levels to prevent race conditions.

- **CON-003**: Maximum message length is 2000 characters to prevent excessive storage and rendering overhead.

- **CON-004**: Maximum recipients per Cheer is 100 (enforced to prevent bulk operations and ensure performance).

- **CON-005**: Cheers are immutable; no edit/delete after creation (design simplicity and audit trail integrity).

- **CON-006**: Users cannot send Cheers to themselves.

- **CON-007**: Frontend MUST use authenticated MSAL tokens; API calls must include Authorization header.

### Guidelines

- **GUD-001**: Use descriptive HTTP status codes (201 for creation, 400 for validation, 409 for conflict).

- **GUD-002**: Log all point transfer transactions for audit compliance.

- **GUD-003**: Display real-time feedback on form validation (disable Send button with helpful hints).

- **GUD-004**: Render Markdown safely; use a sanitizer library to prevent XSS attacks.

- **GUD-005**: Use optimistic UI updates on the frontend (show success immediately, then sync if API call succeeds).

- **GUD-006**: Provide a "copy link to Cheer" feature for sharing recognition on other platforms (future).

### Patterns

- **PAT-001**: Transaction Pattern – Use DbContext SaveChanges within a transaction for atomic point updates.

- **PAT-002**: Repository Pattern – Create a CheerRepository for data access abstraction.

- **PAT-003**: Service Layer Pattern – Create a CheerService to encapsulate business logic (validation, point transfers).

- **PAT-004**: Form State Pattern – Use React state hooks (useState, useReducer) to manage form input and validation state.

- **PAT-005**: Optimistic Update Pattern – Update UI immediately, then verify with API call; rollback on failure.

## 4. Interfaces & Data Contracts

### Cheer Entity (C#)

```csharp
namespace Cheersly.Api.Models;

public class Cheer
{
    public Guid Id { get; set; }
    
    public required Guid SenderId { get; set; }
    
    public required string Message { get; set; }
    
    public int PointsPerRecipient { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public User? Sender { get; set; }
    
    public ICollection<CheerRecipient> Recipients { get; set; } = new List<CheerRecipient>();
}

public class CheerRecipient
{
    public Guid Id { get; set; }
    
    public required Guid CheerId { get; set; }
    
    public required Guid RecipientId { get; set; }
    
    public int PointsAwarded { get; set; }
    
    // Navigation properties
    public Cheer? Cheer { get; set; }
    
    public User? Recipient { get; set; }
}
```

### Create Cheer Request (API)

```typescript
interface CreateCheerRequest {
  message: string; // max 2000 chars, required, non-empty
  pointsPerRecipient: number; // > 0, required
  recipientIds: string[]; // array of user IDs, min 1, max 100
}
```

### Cheer Response DTO (API)

```typescript
interface CheerDTO {
  id: string; // Guid
  senderId: string;
  senderName: string; // "{FirstName} {LastName}"
  senderEmail: string;
  message: string;
  pointsPerRecipient: number;
  createdAt: string; // ISO 8601 datetime
  recipients: CheerRecipientDTO[];
}

interface CheerRecipientDTO {
  id: string; // Guid
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  pointsAwarded: number;
}
```

### Error Response (API)

```typescript
interface ErrorResponse {
  detail: string; // User-friendly error message
  statusCode: number;
  timestamp: string; // ISO 8601 datetime
  traceId: string; // for logging/debugging
}

// Example: insufficient points
{
  "detail": "Insufficient points. You have 15 points remaining, but this Cheer requires 20 points.",
  "statusCode": 400,
  "timestamp": "2025-11-11T15:30:00Z",
  "traceId": "0HN1GJ2K3L4M5N6O"
}
```

### Database Schema (PostgreSQL)

**Table: Cheers**

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| Id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| SenderId | uuid | NO | – | FOREIGN KEY (Users.Id) |
| Message | varchar(2000) | NO | – | – |
| PointsPerRecipient | integer | NO | – | CHECK (PointsPerRecipient > 0) |
| CreatedAt | timestamp | NO | NOW() | – |

**Indexes on Cheers:**
- PRIMARY KEY on `Id`
- Non-clustered on `SenderId` (ASC)
- Non-clustered on `CreatedAt` (DESC)

**Table: CheerRecipients**

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| Id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| CheerId | uuid | NO | – | FOREIGN KEY (Cheers.Id) |
| RecipientId | uuid | NO | – | FOREIGN KEY (Users.Id) |
| PointsAwarded | integer | NO | – | CHECK (PointsAwarded > 0) |

**Indexes on CheerRecipients:**
- PRIMARY KEY on `Id`
- Composite on `(CheerId, RecipientId)` (ASC, ASC) – unique constraint
- Non-clustered on `RecipientId` (ASC)

### Frontend Component Interface (React/TypeScript)

```typescript
interface CheerFormProps {
  onSubmit?: (cheer: CheerDTO) => void;
  onError?: (error: string) => void;
}

interface CheerFeedProps {
  page?: number;
  pageSize?: number;
  onLoadMore?: () => void;
}

interface CheerCardProps {
  cheer: CheerDTO;
  showSender?: boolean;
  showRecipients?: boolean;
}

interface CreateCheerFormState {
  message: string;
  pointsPerRecipient: number;
  recipientIds: string[];
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}
```

## 5. Acceptance Criteria

- **AC-001**: Given a user with 50 PointsToGive, When they create a Cheer with 10 points to 1 recipient, Then the API returns HTTP 201, the user's PointsToGive is decremented to 40, and the recipient's PointsReceived is incremented by 10.

- **AC-002**: Given a user with 15 PointsToGive, When they attempt to create a Cheer with 20 points to 1 recipient, Then the API returns HTTP 400 with message "Insufficient points...", and no point transfers occur.

- **AC-003**: Given a user creates a Cheer to 3 recipients with 10 points each, When the Cheer is successfully created, Then the sender's PointsToGive is decremented by 30 (10 × 3).

- **AC-004**: Given a Cheer is created, When the user views the feed, Then the Cheer appears at the top (most recent) showing sender, recipients, points, message, and timestamp.

- **AC-005**: Given a user views their profile, When they click "Cheers Received", Then they see all Cheers where they are a recipient, with total PointsReceived summary.

- **AC-006**: Given a user creates a Cheer with invalid recipient IDs, When the form is submitted, Then the API returns HTTP 400 "One or more recipients are invalid."

- **AC-007**: Given a user attempts to send a Cheer to themselves, When the form is submitted, Then the API returns HTTP 400 "You cannot send a Cheer to yourself."

- **AC-008**: Given a Cheer is successfully created, When a second attempt to create an identical Cheer is made immediately after, Then both Cheers are created independently (no deduplication).

- **AC-009**: Given a Cheer is created, When the user attempts to edit or delete it, Then no PATCH/PUT/DELETE endpoints exist (immutable by design).

- **AC-010**: Given a user with insufficient points views the Create Cheer form, When they adjust the point slider upward, Then the "Send" button remains disabled and shows a warning message.

## 6. Test Automation Strategy

### Test Levels

- **Unit Tests**: Test Cheer entity validation, service layer business logic (point calculation, validation).
- **Integration Tests**: Test database transactions, point deduction/addition atomicity, foreign key constraints.
- **End-to-End Tests**: Test complete Cheer creation flow from form submission through feed display.

### Frameworks

- **Backend**: MSTest, FluentAssertions, Moq, Testcontainers (PostgreSQL).
- **Frontend**: Vitest, React Testing Library, MSW (Mock Service Worker) for API mocking.

### Test Scenarios

**Backend Unit Tests:**
- CheerService.ValidateCheerAsync with sufficient/insufficient points
- Point calculation (PointsPerRecipient × RecipientCount)
- Duplicate recipient detection
- Self-send prevention

**Backend Integration Tests:**
- Atomic transaction: sender deducted, all recipients incremented
- Transaction rollback on recipient update failure
- Database constraints (PointsPerRecipient > 0, NOT NULL)
- Index efficiency on feed queries

**Frontend Unit Tests:**
- CreateCheerForm validation (empty message, invalid points)
- Recipient selection UI
- Real-time point calculation display
- Error message rendering

**Frontend Integration Tests:**
- Form submission → API call → success toast
- Error response → error message display
- Feed pagination
- Optimistic UI update and sync verification

### Test Data Management

- Use in-memory database for fast unit tests
- Use Testcontainers for integration tests with real PostgreSQL
- Mock MSAL and API responses in frontend tests

### CI/CD Integration

- Run all tests on pull requests before merge
- Generate code coverage reports (target 80% service layer, 100% validation logic)
- Performance test: Cheer creation < 500ms, feed query with 1000 Cheers < 1s

## 7. Rationale & Context

### Why Separate Cheer and CheerRecipient Tables?

Separating into two tables allows:
- Multiple recipients per Cheer without data redundancy
- Efficient queries filtering by recipient (index on CheerRecipient.RecipientId)
- Future scalability (e.g., per-recipient metadata like read status)

### Why Immutable Cheers?

Immutability ensures:
- Audit trail integrity (no retroactive message changes)
- Simplified logic (no cascading updates or deletions)
- User trust (recognition cannot be withdrawn or altered)

### Why Atomic Transactions?

Point transfers must be all-or-nothing:
- Prevents race conditions (e.g., oversending points due to concurrent requests)
- Maintains data consistency (sender debited IFF all recipients credited)
- Compliance-ready audit logs (no partial transfers)

### Why Markdown for Messages?

Markdown provides:
- Lightweight formatting without HTML/CSS complexity
- Safe sanitization against XSS attacks
- User-friendly syntax for bold, links, lists
- Rendering flexibility (client-side with libraries like remark)

## 8. Dependencies & External Integrations

### External Systems

- **EXT-001**: Microsoft Entra ID – Authentication and authorization via MSAL tokens.

### Third-Party Services

- **SVC-001**: PostgreSQL Database – Transactional storage with foreign key and check constraints.

### Infrastructure Dependencies

- **INF-001**: Docker/Container Runtime – For running PostgreSQL in development.

### Data Dependencies

- **DAT-001**: User entity from spec-data-user-tracking.md – Provides User model, PointsToGive, PointsReceived.

### Technology Platform Dependencies

- **PLT-001**: .NET 10.0 – Runtime for API.
- **PLT-002**: Entity Framework Core 10.0 – ORM for data access and transactions.
- **PLT-003**: React 18+ – Frontend framework.
- **PLT-004**: TypeScript – Type safety for frontend.
- **PLT-005**: Markdown rendering library (e.g., remark, markdown-it) – Safe Markdown parsing and HTML generation.
- **PLT-006**: Sanitization library (e.g., DOMPurify, xss) – XSS prevention in rendered content.

## 9. Examples & Edge Cases

### Example: Successful Cheer Creation

```csharp
// Request
POST /api/cheers
{
  "message": "Great presentation today! **Really impressed** with your communication skills.",
  "pointsPerRecipient": 10,
  "recipientIds": ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
}

// Response (HTTP 201 Created)
{
  "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "senderId": "110e8400-e29b-41d4-a716-446655440002",
  "senderName": "Alice Johnson",
  "senderEmail": "alice@company.com",
  "message": "Great presentation today! **Really impressed** with your communication skills.",
  "pointsPerRecipient": 10,
  "createdAt": "2025-11-11T15:30:00Z",
  "recipients": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "recipientId": "550e8400-e29b-41d4-a716-446655440000",
      "recipientName": "Bob Smith",
      "recipientEmail": "bob@company.com",
      "pointsAwarded": 10
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "recipientId": "550e8400-e29b-41d4-a716-446655440001",
      "recipientName": "Carol White",
      "recipientEmail": "carol@company.com",
      "pointsAwarded": 10
    }
  ]
}

// Result: Alice's PointsToGive: 50 → 30; Bob's PointsReceived: 0 → 10; Carol's PointsReceived: 0 → 10
```

### Example: Insufficient Points

```csharp
// User has 15 PointsToGive, tries to give 20
POST /api/cheers
{
  "message": "Excellent work!",
  "pointsPerRecipient": 20,
  "recipientIds": ["550e8400-e29b-41d4-a716-446655440000"]
}

// Response (HTTP 400 Bad Request)
{
  "detail": "Insufficient points. You have 15 points remaining, but this Cheer requires 20 points.",
  "statusCode": 400,
  "timestamp": "2025-11-11T15:31:00Z",
  "traceId": "0HN1GJ2K3L4M5N6O"
}

// Result: No points transferred; no Cheer created.
```

### Example: Multiple Recipients

```csharp
// Sender: Alice (50 PointsToGive)
// Recipients: Bob, Carol, Diana (3 recipients)
// Points per recipient: 12

POST /api/cheers
{
  "message": "Awesome #teamwork on the project launch!",
  "pointsPerRecipient": 12,
  "recipientIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}

// Total deducted from Alice: 12 × 3 = 36 points
// Alice: 50 → 14
// Bob: +12
// Carol: +12
// Diana: +12
```

### Edge Case: Self-Send Attempt

```csharp
// User tries to send Cheer to themselves
POST /api/cheers
{
  "message": "I'm awesome!",
  "pointsPerRecipient": 5,
  "recipientIds": ["550e8400-e29b-41d4-a716-446655440000"] // Same as sender
}

// Response (HTTP 400 Bad Request)
{
  "detail": "You cannot send a Cheer to yourself.",
  "statusCode": 400,
  "timestamp": "2025-11-11T15:32:00Z",
  "traceId": "0HN1GJ2K3L4M5N6P"
}
```

### Edge Case: Duplicate Recipients

```csharp
// User provides same recipient ID twice
POST /api/cheers
{
  "message": "Great work!",
  "pointsPerRecipient": 10,
  "recipientIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440000" // Duplicate
  ]
}

// Response (HTTP 400 Bad Request)
{
  "detail": "Duplicate recipients are not allowed.",
  "statusCode": 400,
  "timestamp": "2025-11-11T15:33:00Z",
  "traceId": "0HN1GJ2K3L4M5N6Q"
}
```

### Edge Case: Transaction Rollback

```csharp
// Scenario: Sender deducted, but recipient #2's update fails (e.g., user deleted)
// Expected: ENTIRE transaction rolls back → sender NOT deducted, recipient #1 NOT credited

// Request succeeds atomically or fails atomically (no partial state).
```

## 10. Validation Criteria

### Code Review Checklist

- [ ] Cheer entity includes all required properties with correct types
- [ ] CheerRecipient join entity properly links Cheer and User
- [ ] PointsPerRecipient > 0 enforced at database and service layer
- [ ] Message max length 2000 chars enforced
- [ ] Point deduction and addition in same transaction
- [ ] Foreign key constraints prevent referencing deleted users
- [ ] Cheers are immutable (no PATCH/PUT/DELETE endpoints)
- [ ] Self-send validation prevents users sending to themselves
- [ ] Duplicate recipient detection
- [ ] All async/await patterns used correctly

### Testing Checklist

- [ ] Unit tests verify point calculation (PointsPerRecipient × RecipientCount)
- [ ] Integration tests verify atomic transaction (all-or-nothing)
- [ ] Integration tests verify rollback on recipient update failure
- [ ] API tests verify 201 on success, 400 on validation failure
- [ ] API tests verify insufficient points rejection
- [ ] Frontend tests verify form validation (empty message, invalid points)
- [ ] Frontend tests verify error message display
- [ ] Frontend tests verify feed display with sender, recipients, points
- [ ] Feed pagination tested
- [ ] Concurrent Cheer creation does not cause race conditions

### Deployment Checklist

- [ ] Database migrations applied for Cheer and CheerRecipient tables
- [ ] Indexes created on SenderId, CreatedAt, RecipientId
- [ ] Foreign key constraints verified
- [ ] Markdown sanitization library configured
- [ ] API and frontend error messages reviewed
- [ ] Logging configured for Cheer creation (success and failure)
- [ ] Performance baseline: Cheer creation < 500ms, feed query < 1s

## 11. Related Specifications / Further Reading

- [User Data Tracking and Management](/spec/spec-data-user-tracking.md) – User entity, PointsToGive, PointsReceived
- [Application Functions Specification](/spec/app-functions.md) – Cheersly feature overview
- [Architecture Overview](/spec/architecture.md) – System design and layers
- [Entity Framework Core Transactions](https://learn.microsoft.com/ef/core/saving/transactions)
- [PostgreSQL ACID Compliance](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Markdown Specification](https://commonmark.org/)
- [OWASP Markdown XSS Prevention](https://owasp.org/www-community/attacks/xss/)
- Future: Feed Pagination and Filtering Specification
- Future: Hashtag Indexing and Search Specification
- Future: Point Redemption and Store Specification
