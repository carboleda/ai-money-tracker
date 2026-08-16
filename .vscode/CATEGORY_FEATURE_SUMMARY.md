# AI Money Tracker - Custom Transaction Categories Feature Implementation

## Project Summary

### Initial Request

**Goal:** Implement a complete custom transaction category management system for the AI Money Tracker application, enabling users to create, manage, and use custom categories alongside predefined categories.

For each new file you will create, look for an existing file as a reference so the same coding style is followed.

**Category Properties:**

- `id` - Firestore document ID (auto-generated, unique per category)
- `ref` - Auto-generated (UUID or nanoid), unique per user, serves as reference in transactions
- `name` - Display name of the category (e.g., "Pet Care", "Hobbies")
- `description` - Optional description/notes about the category
- `icon` - Emoji character for visual identification
- `color` - Optional hex color code for UI representation
- `type` - Category type: "income", "expense", or "transfer" (restricts usage to specific transaction types)
- `budget` (nested document) - Optional monthly budget configuration for expense categories:
  - `limit` - Monthly budget limit (number, in category currency)
  - `alertThreshold` - Optional alert threshold percentage (0-100, e.g., 80 for alert at 80% spent)
- `isDeleted` - Boolean for soft-delete support
- `createdAt` - Timestamp of category creation
- `updatedAt` - Timestamp of last modification

**Predefined Categories Management:**

Predefined categories are defined in a JSON file (`src/config/predefined-categories.json`) with all metadata (name, icon, color, type, description) but no budget support. When retrieving categories:

- Load predefined categories from JSON file (read-only)
- Load custom categories from Firestore
- Merge both lists, removing duplicates by ref
- If user modifies a predefined category, create a custom copy and omit the predefined one when merging

Transactions store categories as strings (refs), supporting both predefined refs and custom refs. API responses return category summaries:

```typescript
{
  ref: string;
  name: string;
  icon?: string;
  color?: string;
  isCustom: boolean;
  budget?: {
    limit: number;
    alertThreshold?: number;
  };
}
```

**Key Design Decisions:**

1. `ref` is auto-generated (UUID/nanoid), unique per user, immutable after creation
2. Predefined categories loaded from JSON file at service layer (not repository)
3. Custom categories stored in Firestore, accessed via repository
4. Predefined/custom merging happens at service layer (reusable across storage drivers)
5. Repository layer focused on custom categories only (no predefined logic)
6. When merging: custom categories override predefined by same ref
7. Category retrieval: merge predefined JSON + custom Firestore, deduplicate by ref
8. Category enrichment happens at service layer for transactions (portable design)
9. API response includes both predefined and custom categories
10. Category type restrictions prevent misuse (e.g., can't use expense category for income transaction)
11. Budget is optional per category; only "expense" type categories support budgets
12. Budget period is monthly only (simplifies spent amount calculation and period determination)
13. Budget alerts trigger when spending reaches alert threshold percentage
14. Budget tracking calculated from transactions within the current calendar month
15. Predefined categories have no budget by default; users can create custom copies with budgets
16. Budget spent amount calculated dynamically from transactions (not stored)
17. Budget stored as nested document within category (Firestore field)
18. No `order` field - categories ordered by type, then by predefined/custom status
19. Entities use Firestore driver pattern (entity.ts, adapter.ts, repository.ts) not interfaces

---

## Implementation Steps

### Step 1: Extend Category Entity and Model

**Objective:** Create the domain model and Firestore entity for custom transaction categories

**Files to Create:**

- `src/app/api/drivers/firestore/category/category.entity.ts` - Firestore entity interface (following account.entity.ts pattern):

  ```typescript
  interface CategoryEntity extends FirebaseFirestore.DocumentData {
    ref: string; // Auto-generated, unique per user
    name: string;
    icon: string; // Emoji
    color?: string; // Hex color
    type: CategoryType; // "income" | "expense" | "transfer"
    description?: string;
    budget?: {
      // Nested document
      limit: number;
      alertThreshold?: number;
    };
    isCustom: boolean;
    isDeleted: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  ```

- `src/app/api/domain/category/model/category.model.ts` - Domain model with:

  - `CategoryType` enum: `"income" | "expense" | "transfer"`
  - `CategoryBudget` type: `{ limit: number; alertThreshold?: number }`
  - `CategoryModel` class with all properties (matching entity) plus ID
  - `CategorySummary` interface for API responses: `{ref: string; name: string; icon?: string; color?: string}`
  - `BudgetStatus` interface for enriched budget responses

- `src/config/predefined-categories.json` - JSON file with predefined categories:
  ```json
  [
    {
      "ref": "GROCERIES",
      "name": "Groceries",
      "icon": "🛒",
      "color": "#10B981",
      "type": "expense",
      "description": "Grocery shopping and food items"
    }
    // ... more predefined categories
  ]
  ```

**Files to Create:**

- `src/app/api/domain/category/ports/inbound/create-category.port.ts` - Inbound port:

  ```typescript
  export interface CreateCategoryInput {
    name: string;
    icon: string; // Emoji
    type: "income" | "expense" | "transfer";
    description?: string;
    color?: string; // Hex color
    budget?: {
      limit: number;
      alertThreshold?: number;
    };
  }
  ```

- `src/app/api/domain/category/ports/inbound/update-category.port.ts` - Inbound port:

  ```typescript
  export interface UpdateCategoryInput {
    name?: string;
    icon?: string;
    description?: string;
    color?: string;
    budget?: {
      limit: number;
      alertThreshold?: number;
    };
  }
  ```

- `src/app/api/domain/category/ports/outbound/get-categories.port.ts` - Outbound ports:

  ```typescript
  export interface CategoryOutput {
    id: string;
    ref: string;
    name: string;
    icon: string;
    color?: string;
    type: "income" | "expense" | "transfer";
    description?: string;
    budget?: {
      limit: number;
      alertThreshold?: number;
    };
    isCustom: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface CategoryWithBudgetStatusOutput extends CategoryOutput {
    budget?: {
      limit: number;
      alertThreshold?: number;
      spent: number;
      remaining: number;
      percentageUsed: number;
      isAlerted: boolean;
    };
  }
  ```

**Files to Modify:**

- `src/app/api/domain/transaction/model/transaction.model.ts`:
  - Add `CategorySummary` type:
    ```typescript
    type CategorySummary = {
      ref: string;
      name: string;
      icon?: string;
      color?: string;
    };
    ```
  - Update `category` field to accept `CategorySummary | string` (string for backward compatibility)

**Expected Outcomes:**

- Domain model clearly defines category structure
- Type safety through TypeScript interfaces
- Separation of create/update inputs
- No compilation errors

---

### Step 2: Create Firestore Category Repository

**Objective:** Implement repository pattern for category persistence

**Files to Create:**

- `src/app/api/domain/category/repository/category.repository.ts` - Interface with methods:

  - `getAll()` - Returns only custom non-deleted categories from Firestore
  - `getCategoryByRef(ref: string)` - Get single custom category by ref from Firestore
  - `create(data: CreateCategoryInput)` - Creates category with auto-generated ref, uniqueness check per user
  - `update(id: string, data: UpdateCategoryInput)` - Updates metadata only
  - `delete(id: string)` - Soft-deletes by setting `isDeleted: true`

- `src/app/api/drivers/firestore/category/category.adapter.ts` - Maps between entity and model

- `src/app/api/drivers/firestore/category/category-firestore.repository.ts` - Implementation with:

  - Queries custom categories from Firestore (no predefined loading)
  - Auto-generates ref for new custom categories (UUID/nanoid)
  - Ref uniqueness validation per user (against custom categories only, predefined refs reserved)
  - Soft-delete support
  - Firestore collection: `users/{userId}/categories`
  - Note: Predefined categories loaded separately at service layer

- `src/app/api/domain/category/category.module.ts` - IoC container registration for category services

**Expected Outcomes:**

- Full CRUD operations for custom categories in repository layer
- Ref uniqueness validation at user level
- Soft-delete prevents hard deletion
- Repository focused on custom categories only (no predefined logic)
- No compilation errors

---

### Step 3: Create Category API Route Handler

**Objective:** Expose category management endpoints via REST API

**Files to Create:**

- `src/app/api/domain/category/service/create-category.service.ts` - Service for category creation with:

  - Validation of category type against predefined categories
  - Ref uniqueness check
  - Throws `DomainError` (from `@/app/api/domain/shared/errors/domain.error.ts`) for validation failures:
    - `409` if ref already exists for user
    - `400` for invalid/missing fields or invalid category type

- `src/app/api/domain/category/service/update-category.service.ts` - Service for category updates with:

  - Validation that custom categories only
  - Type validation consistency
  - Throws `DomainError` for validation failures:
    - `404` if category not found
    - `400` if attempting to modify predefined category
    - `400` if budget applied to non-expense category

- `src/app/api/domain/category/service/delete-category.service.ts` - Service for category deletion with:
  - Cascade check (warn if transactions exist with this category)
  - Soft-delete implementation
  - Throws `DomainError` for validation failures:
    - `404` if category not found
    - `400` if attempting to delete predefined category

**Files to Create:**

- `src/app/api/(routes)/category/route.ts` - REST API endpoints (Router layer):

  - Handles all route definitions and request/response mapping
  - Calls appropriate domain services (CreateCategoryService, UpdateCategoryService, DeleteCategoryService)
  - Wraps service calls in try-catch to handle `DomainError` exceptions
  - Maps `DomainError.statusCode` and `DomainError.message` to HTTP responses
  - Performs Zod validation on incoming payloads and throws `DomainError` for validation failures

  - **GET** `/api/category` - Returns all categories (predefined + custom non-deleted)

    - No parameters
    - Returns array of `CategoryOutput[]`
    - Includes both predefined and custom categories

  - **POST** `/api/category` - Creates custom category

    - Accepts: `CreateCategoryInput` from inbound port
    - Required: name, icon, type
    - Optional: description, color, budget (nested object with limit and alertThreshold)
    - `ref` auto-generated (UUID/nanoid), returned in response
    - Validates payload via Zod, throws `DomainError` on validation failure
    - Calls `CreateCategoryService.execute()`, catches `DomainError`
    - Returns 409 if ref conflicts with predefined category (from DomainError.statusCode)
    - Returns 400 for invalid/missing fields or invalid type (from DomainError.statusCode)
    - Returns 201 with created category as `CategoryOutput`

  - **PUT** `/api/category/:id` - Updates custom category metadata

    - Accepts: `UpdateCategoryInput` from inbound port
    - Optional: name, icon, color, description, budget (nested object with limit and alertThreshold)
    - Validates payload via Zod, throws `DomainError` on validation failure
    - Calls `UpdateCategoryService.execute()`, catches `DomainError`
    - Returns 404 if category not found (from DomainError.statusCode)
    - Returns 400 if attempting to modify predefined category (from DomainError.statusCode)
    - Returns 400 if budget applied to non-expense category (from DomainError.statusCode)
    - Returns 200 with updated category as `CategoryOutput`

  - **GET** `/api/category/with-budget` - Returns all categories with current month budget status

    - No required parameters
    - Returns array of `CategoryWithBudgetStatusOutput[]` (predefined + custom non-deleted)
    - Each category includes budget status if budget is configured:
      - `budget.limit` - Monthly budget limit
      - `budget.spent` - Total spent in current calendar month (sum of all COMPLETE transactions)
      - `budget.remaining` - Remaining budget (limit - spent)
      - `budget.percentageUsed` - Percentage of budget used (spent / limit \* 100)
      - `budget.alertThreshold` - Alert threshold percentage (if configured)
      - `budget.isAlerted` - Boolean indicating if alert threshold reached
    - Calls `GetAllCategoriesWithBudgetStatusService.execute()`, catches `DomainError`
    - Returns 200 with category array
    - Performance: Single batch query of all transactions in current month, grouped by category

  - **DELETE** `/api/category/:id` - Soft-deletes custom category

    - Required: id
    - Optional: reassignTo (ref of category to reassign transactions to)
    - Calls `DeleteCategoryService.execute()`, catches `DomainError`
    - Returns 404 if category not found (from DomainError.statusCode)
    - Returns 400 if attempting to delete predefined category (from DomainError.statusCode)
    - Returns 200 with deleted category as `CategoryOutput`
      - `budget.isAlerted` - Boolean indicating if alert threshold reached
    - Returns 200 with category array
    - Performance: Single batch query of all transactions in current month, grouped by category

  - **DELETE** `/api/category/:id` - Soft-deletes custom category
    - Required: id
    - Optional: reassignTo (ref of category to reassign transactions to)
    - Returns 404 if category not found
    - Returns 400 if attempting to delete predefined category
    - Returns 200 with deleted category as `CategoryOutput`

**Validation Schema (Zod):**

```typescript
BudgetSchema = z.object({
  limit: z.number().positive(),
  alertThreshold: z.number().int().min(0).max(100).optional(),
});

CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().emoji(),
  type: z.enum(["income", "expense", "transfer"]),
  description: z.string().max(200).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  budget: BudgetSchema.optional(),
});

UpdateCategorySchema = CreateCategorySchema.omit({
  type: true,
}).partial();

CategoryOutputSchema = z.object({
  id: z.string(),
  ref: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string().optional(),
  type: z.enum(["income", "expense", "transfer"]),
  description: z.string().optional(),
  budget: BudgetSchema.optional(),
  isCustom: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

CategoryWithBudgetStatusOutputSchema = CategoryOutputSchema.extend({
  budget: z
    .object({
      limit: z.number(),
      alertThreshold: z.number().optional(),
      spent: z.number(),
      remaining: z.number(),
      percentageUsed: z.number(),
      isAlerted: z.boolean(),
    })
    .optional(),
});
```

**Expected Outcomes:**

- Complete CRUD API for custom categories
- Input validation via Zod
- Type-safe error responses
- Clear separation between predefined and custom operations
- No compilation errors

---

### Step 4: Modify Transaction Query/Response Mapping for Category Enrichment

**Objective:** Enrich transaction responses with category metadata

**Files to Modify:**

- `src/app/api/domain/transaction/model/transaction.model.ts`:

  - Add `CategorySummary` type: `{ref: string; name: string; icon?: string; color?: string}`
  - Change `category: TransactionCategory | string` → `category: CategorySummary | TransactionCategory | string` (for backward compatibility)

- `src/app/api/drivers/firestore/transaction/transaction-firestore.repository.ts`:

  - Inject `CategoryRepository`
  - Add `enrichTransactionsWithCategories()` private method:
    - Fetches all predefined categories (map from enum)
    - Fetches all custom categories via `categoryRepository.getAll()`
    - Creates lookup map by ref (combining predefined enum values as refs)
    - Enriches transactions with category summaries
    - Returns partial data if category not found: `{ref, name, icon: null}`
  - Update `getById()` to enrich response
  - Update `searchTransactions()` to enrich all results
  - Handle category field for all transaction statuses

- `src/app/api/drivers/firestore/transaction/transaction.adapter.ts`:
  - Update `toModel()` to handle CategorySummary objects
  - Update `toEntity()` to extract `ref` from CategorySummary back to string for storage

**Storage:** Remains as strings in Firestore (no migration)
**Response:** Returns enriched CategorySummary objects
**Performance:** Single batch query of all categories, no N+1 problem

**Expected Outcomes:**

- Transaction responses include category metadata
- Support for both predefined and custom categories
- Efficient single-pass enrichment
- Backward compatibility with string categories
- No compilation errors

---

### Step 5: Update Transaction Validation for Category Existence and Type Matching

**Objective:** Validate category references and type constraints

**Files to Create:**

- `src/app/api/domain/category/service/validate-category.service.ts` - Service in category module:
  - `execute(categoryRef: string, transactionType: TransactionType)` - Validates:
    - Category exists (predefined or custom)
    - Category is not deleted
    - Category type matches transaction type (e.g., can't use expense category for income)
  - Throws `DomainError` (400) with message: "Category 'X' does not exist, is deleted, or is not valid for transaction type"

**Files to Modify:**

- `src/app/api/domain/transaction/service/create-transaction.service.ts`:

  - Inject `ValidateCategoryService` from category module
  - Call `validateCategoryService.execute(category, type)` before creating transaction
  - Skip validation if category not provided (optional field)

- `src/app/api/domain/transaction/service/update-transaction.service.ts`:

  - Inject `ValidateCategoryService` from category module
  - Call `validateCategoryService.execute(category, type)` if category is being updated
  - Maintain backward compatibility with optional category

- `src/app/api/domain/category/category.module.ts`:
  - Register services in IoC container:
    - `CreateCategoryService`
    - `UpdateCategoryService`
    - `DeleteCategoryService`
    - `ValidateCategoryService`

**Architecture:**

- Category Validation Service (Category Module) → Validates category existence and type
- Create/Update Transaction Services (Transaction Module) → Validate category before transaction changes
- Flow: Create/Update Transaction Service → ValidateCategoryService → CategoryRepository.getCategoryByRef() / EnumCheck

**Expected Outcomes:**

- Transaction-category type constraints enforced
- Referential integrity maintained
- Clear error messages for validation failures
- No compilation errors

---

### Step 6: Implement Budget Tracking Services

**Objective:** Enable budget monitoring with simplified calculation using monthly transactions, with predefined/custom merging at service layer

**Files to Create:**

- `src/app/api/domain/category/service/get-all-categories.service.ts` - Service to retrieve all categories:

  - `execute()` - Returns:
    - Array of all non-deleted categories (predefined + custom merged, deduplicated by ref)
    - Loads predefined categories from JSON at service layer
    - Calls repository `getAll()` to get custom categories (userId from injected UserContext)
    - Merges: predefined refs can be overridden by custom categories
    - Each category includes basic metadata (ref, name, icon, color, isCustom, budget limit/alertThreshold)
    - No budget calculation or transaction lookup
  - Merge logic portable to any storage driver (SQL, etc.)

- `src/app/api/domain/category/service/get-all-categories-with-budget-status.service.ts` - Service for categories with budget status:

  - `execute()` - Returns:
    - Calls `GetAllCategoriesService.execute()` to get merged predefined + custom categories
    - Injects `FilterTransactionsService` to fetch COMPLETE transactions for current calendar month
    - For each category with budget configured:
      - Uses `FilterTransactionsService.execute()` with appropriate filters (current month, status: COMPLETE)
      - Groups transactions by category ref
      - Sums transaction amounts by category
      - Enriches category with: spent, remaining, percentageUsed (spent / limit \* 100), isAlerted (true if percentageUsed >= alertThreshold)
    - Categories without budget remain unchanged (budget fields contain only limit/alertThreshold)
  - Single batch query of all transactions for month (no N+1)
  - Returns array of all categories with budget status enriched where applicable
  - Reuses merging logic from GetAllCategoriesService (no duplication)

- `src/app/api/domain/category/service/validate-budget.service.ts` - Service for budget validation:

  - `validateBudgetConfig(budget?: { limit: number; alertThreshold?: number }, categoryType?: string)` - Validates:
    - Budget only applies to "expense" category type
    - Budget limit is positive number
    - alertThreshold is 0-100 if provided
  - Throws `DomainError` (400) with descriptive messages for validation failures

**Files to Create:**

- `src/app/api/(routes)/category/route.ts` - REST API endpoints:

  - **GET** `/api/category` - Returns all categories (uses GetAllCategoriesService)
    - No query parameters
    - Returns simple category array with budget configuration (limit/alertThreshold) but not status
    - Returns 200

- `src/app/api/(routes)/category/with-budget/route.ts` - REST API endpoint:

  - **GET** `/api/category/with-budget` - Returns categories with budget status enrichment (uses GetAllCategoriesWithBudgetStatusService)
    - No query parameters
    - Route slug "with-budget" triggers budget status calculation
    - Returns array of all categories (predefined + custom non-deleted)
    - Categories with budget configured include enriched status: spent, remaining, percentageUsed, alertThreshold, isAlerted
    - Categories without budget remain unchanged (only configuration available)
    - Single batch query of all transactions for current month
    - Returns 200

**Files to Modify:**

- `src/app/api/(routes)/category/route.ts`:

  - Inject `ValidateBudgetService` in POST handler
  - Call validation for budget fields before creating category
  - Inject `ValidateBudgetService` in PUT handler
  - Call validation for budget fields if budget is being updated

- `src/app/api/domain/category/category.module.ts`:
  - Register new services in IoC container:
    - `GetAllCategoriesService`
    - `GetAllCategoriesWithBudgetStatusService`
  - Ensure predefined categories JSON path is resolved at service initialization
  - Verify FilterTransactionsService injection for fetching monthly transactions

**Expected Outcomes:**

- Budget validation prevents invalid configurations
- Two API endpoints with clear separation of concerns:
  - Simple endpoint for listing categories (no budget calculation overhead)
  - Separate endpoint for categories with budget status enrichment (opt-in calculation)
- Route slug "with-budget" triggers budget status calculation and enrichment
- Single monthly transaction query for all categories with budgets (efficient)
- Budget status enriched directly on category objects when requested
- No N+1 queries
- No duplication of merge logic (GetAllCategoriesWithBudgetStatusService reuses GetAllCategoriesService)
- Consumers can choose to fetch categories or budget-enriched categories
- Consistent response format (categories array) across both endpoints
- No compilation errors

---

## Implementation Sequencing

### Phase 1: Foundation (Steps 1-2)

- Create category domain model
- Set up Firestore storage and repository
- Establishes data persistence layer

### Phase 2: API & Enrichment (Steps 3-4)

- Build REST API endpoints
- Implement transaction enrichment
- Provides user-facing functionality

### Phase 3: Validation (Step 5)

- Add category validation service
- Integrate with transaction services
- Enforces data integrity

### Phase 4: Budget Management (Step 6)

- Implement budget validation
- Add two category endpoints (with/without budget status)
- Enables financial planning and monitoring features

---

## Acceptance Criteria

### General Criteria

- [ ] All TypeScript code compiles without errors
- [ ] All new services follow dependency injection pattern
- [ ] Error messages are clear and actionable
- [ ] HTTP status codes are semantically correct
- [ ] All APIs are RESTful
- [ ] Soft-delete implemented consistently across all operations
- [ ] User-level isolation verified (categories scoped to user)

### Step 1: Model & Interface

- [ ] `CategoryModel` class created with all required properties
- [ ] `CategorySummary` type defined and exported
- [ ] `CreateCategoryInput` and `UpdateCategoryInput` types created
- [ ] `CategoryType` enum created: "income" | "expense" | "transfer"
- [ ] `src/interfaces/category.ts` created with `CategoryEntity` interface
- [ ] Category interface properly extends domain model concepts

### Step 2: Repository & Firestore Driver

- [ ] `category.repository.ts` interface defines CRUD methods for custom categories only
- [ ] `category-firestore.repository.ts` implements repository interface
- [ ] `category.entity.ts` maps Firestore documents to domain model
- [ ] `category.adapter.ts` provides bidirectional conversion
- [ ] `getAll()` returns only custom categories from Firestore
- [ ] `getCategoryByRef(ref)` retrieves custom category by ref from Firestore
- [ ] `create()` validates ref uniqueness per user
- [ ] `create()` throws error if duplicate ref exists
- [ ] `update()` modifies only non-immutable fields
- [ ] `delete()` implements soft-delete (sets `isDeleted: true`)
- [ ] Hard-delete is impossible (no method for it)
- [ ] Firestore collection path: `users/{userId}/categories`
- [ ] All queries filter out deleted categories (except delete operation)
- [ ] Repository does NOT load or merge predefined categories (service layer responsibility)

### Step 3: API Route Handler

- [ ] `GET /api/category` returns all non-deleted categories
- [ ] `GET /api/category` response includes both predefined and custom
- [ ] `POST /api/category` accepts required fields: name, ref, icon, type
- [ ] `POST /api/category` accepts optional fields: description, color
- [ ] `POST /api/category` returns 409 if ref already exists for user
- [ ] `POST /api/category` returns 400 for missing/invalid fields
- [ ] `POST /api/category` returns 400 for invalid category type
- [ ] `POST /api/category` returns 201 with created category
- [ ] `PUT /api/category/:id` updates metadata only
- [ ] `PUT /api/category/:id` prevents modification of ref and type
- [ ] `PUT /api/category/:id` returns 404 if not found
- [ ] `PUT /api/category/:id` prevents modification of predefined categories
- [ ] `PUT /api/category/:id` returns 200 with updated category
- [ ] `DELETE /api/category/:id` soft-deletes category
- [ ] `DELETE /api/category/:id` returns 404 if not found
- [ ] `DELETE /api/category/:id` prevents deletion of predefined categories
- [ ] `DELETE /api/category/:id` supports optional reassignTo parameter
- [ ] `DELETE /api/category/:id` returns 200 with deletion confirmation
- [ ] All Zod validation schemas properly enforce constraints
- [ ] ref field regex ensures format consistency (e.g., "CUSTOM_001")
- [ ] icon field validates emoji characters
- [ ] color field validates hex color format
- [ ] Error responses include descriptive messages

### Step 4: Transaction Enrichment

- [ ] Transactions include `CategorySummary` in responses
- [ ] `CategorySummary` contains: ref, name, icon, color
- [ ] Predefined categories enriched with metadata from enum
- [ ] Custom categories enriched from Firestore lookup
- [ ] Missing categories return partial summary with name: null
- [ ] Enrichment occurs for all transaction statuses (PENDING/COMPLETE)
- [ ] Enrichment handles optional category field gracefully
- [ ] Single batch query used for all transactions (no N+1)
- [ ] Storage remains as strings in Firestore (no schema migration)
- [ ] Backward compatibility maintained with existing transaction data

### Step 5: Category Validation

- [ ] `ValidateCategoryService` validates category existence
- [ ] `ValidateCategoryService` validates category is not deleted
- [ ] `ValidateCategoryService` validates category type matches transaction type
- [ ] Create transaction validates category before transaction creation
- [ ] Update transaction validates category before transaction update
- [ ] Validation skipped if category field is not provided (optional)
- [ ] Error thrown if category doesn't exist: "Category 'X' does not exist..."
- [ ] Error thrown if category type doesn't match transaction type
- [ ] Services registered in `category.module.ts` IoC container
- [ ] `ValidateCategoryService` injected in transaction services
- [ ] Cross-module dependency properly structured (Category → Transaction)
- [ ] All validation errors have clear messages

### Step 6: Budget Tracking

- [ ] `GetAllCategoriesService` retrieves all categories without budget status
- [ ] `GetAllCategoriesService` merges predefined (from JSON) and custom (from repository) categories
- [ ] `GetAllCategoriesService` deduplicates merged categories by ref (custom overrides predefined)
- [ ] `GetAllCategoriesWithBudgetStatusService` calls GetAllCategoriesService for merged categories
- [ ] `GetAllCategoriesWithBudgetStatusService` enriches categories with budget status on top
- [ ] `GetAllCategoriesWithBudgetStatusService` reuses GetAllCategoriesService (no merge duplication)
- [ ] `ValidateBudgetService` validates budget configuration correctly
- [ ] Merging logic localized to single service (GetAllCategoriesService)
- [ ] Merging logic portable across storage drivers (JSON + any repository implementation)
- [ ] Budget field is optional (no budget for non-expense categories)
- [ ] Budget only allowed for "expense" type categories
- [ ] Budget is nested document (not separate flat fields)
- [ ] Budget spent amount calculated from COMPLETE transactions only
- [ ] Budget calculations use current calendar month (1st to last day)
- [ ] Budget calculations correctly sum transaction amounts by category ref
- [ ] `GET /api/category` returns all categories with budget config (limit/alertThreshold)
- [ ] `GET /api/category` includes both predefined and custom categories (merged at service layer)
- [ ] `GET /api/category` does NOT include budget status (spent/remaining/percentageUsed)
- [ ] `GET /api/category/with-budget` returns categories array (same structure as /api/category)
- [ ] `GET /api/category/with-budget` uses GetAllCategoriesService for merged categories
- [ ] `GET /api/category/with-budget` enriches with budget status on top of merged categories
- [ ] `GET /api/category/with-budget` includes both predefined and custom categories (via GetAllCategoriesService)
- [ ] `GET /api/category/with-budget` enriches categories with budget status when budget is configured
- [ ] Budget status includes: spent, remaining, percentageUsed, isAlerted, alertThreshold
- [ ] Categories without budget remain unchanged in both endpoints
- [ ] `GET /api/category/with-budget` uses single batch query for current month transactions
- [ ] Single batch transaction query (no N+1 queries)
- [ ] "with-budget" slug triggers budget status calculation
- [ ] Budget validation prevents budget on income/transfer categories
- [ ] Budget validation prevents negative budget amounts
- [ ] Budget validation prevents invalid alert percentages (0-100)
- [ ] Services registered in `category.module.ts` IoC container
- [ ] All budget errors have clear, actionable messages
- [ ] Both endpoints return consistent response format (categories array)
- [ ] Budget enrichment happens in place on category objects
- [ ] Predefined/custom merging logic reusable across storage drivers
- [ ] No merge logic duplication between GetAllCategoriesService and GetAllCategoriesWithBudgetStatusService

### Database

- [ ] Firestore collection structure: `users/{userId}/categories`
- [ ] Category documents have all required fields with defaults
- [ ] Budget stored as nested document within category (not separate fields)
- [ ] Budget nested structure: `{limit: number; alertThreshold?: number}`
- [ ] Indexes created for queries: ref, isDeleted, createdAt, type
- [ ] Composite index for: (userId, isDeleted)
- [ ] Data migration not required (string-based storage)
- [ ] Budget data stored alongside category (no separate collection)

### User Experience

- [ ] Custom categories accessible via category management interface
- [ ] Predefined categories available as fallback/default
- [ ] Users can customize predefined categories and customization overrides predefined ones
- [ ] Users cannot permanently delete categories (only soft-delete)
- [ ] Soft-deleted categories not visible in dropdown selections
- [ ] Category assignment prevents type mismatches
- [ ] Budget configuration available in category edit form
- [ ] Budget limit, period, and alert threshold configurable for expense categories
- [ ] Budget status visible in category detail view or dashboard
- [ ] Budget alerts displayed when threshold reached
- [ ] Budget spending shown as percentage and amount
- [ ] Clear error messages for validation failures
- [ ] Category metadata (icon, color, budget) displayed in transaction UI
- [ ] Budget overview accessible (summary view of all categories with budgets)

---

## Summary Table

| Step | Component                     | Files Created | Files Modified      | Status     |
| ---- | ----------------------------- | ------------- | ------------------- | ---------- |
| 1    | Category Model & Interface    | 2             | 1                   | ⏳ Planned |
| 2    | Repository & Firestore Driver | 4             | 1                   | ⏳ Planned |
| 3    | API Routes & Services         | 4             | 0                   | ⏳ Planned |
| 4    | Transaction Enrichment        | 0             | 3                   | ⏳ Planned |
| 5    | Category Validation           | 1             | 3 + Category Module | ⏳ Planned |
| 6    | Budget Tracking               | 3             | 1                   | ⏳ Planned |

**Total New Files:** 14
**Total Modified Files:** 9

---

## Key Architectural Patterns

### Similarity to Accounts Feature

- Same repository pattern for persistence
- Same Firestore driver structure
- Same soft-delete approach
- Same ref-based user-level uniqueness
- Same enrichment pattern for transactions
- Same validation service approach
- Same IoC container registration

### Differences from Accounts Feature

- Categories have type constraints (income/expense/transfer)
- Both predefined enum and custom categories supported
- Color metadata for visual distinction
- Cascading considerations when deleting (reassignTo option)
- Category metadata enrichment instead of account metadata enrichment
- Budget tracking and monitoring for expense categories (monthly only)
- Budget stored as nested document (Firestore native structure)
- Budget alert thresholds for user notifications
- Simplified budget calculation (single monthly period, no date range parameters)

### Budget-Specific Design Patterns

- Budget is optional; only "expense" categories support budgets
- Budget stored as nested document (Firestore field)
- Budget period fixed to monthly only (simplifies calculation)
- Budget spent amount calculated dynamically (not stored) from transactions
- Single batch query for all transactions in current calendar month (efficient)
- Predefined categories have no budget (read-only from JSON); users create custom copies with budgets
- Budget validation prevents invalid configurations at API layer (POST/PUT endpoints)
- Budget alerts trigger based on percentage thresholds
- Two API endpoints with clear separation:
  - `/api/category` returns all categories without budget status (lightweight)
  - `/api/category/with-budget` returns same categories enriched with budget status (on-demand calculation)
- Route slug "with-budget" semantically indicates budget status will be included
- Budget status enriched directly on category objects (not returned as separate map)
- Consumers can independently request categories or budget-enriched categories
- Both endpoints return same response format (categories array) for consistency
- Predefined/custom merging happens at service layer (portable across storage drivers)

### Benefits

- Consistent architecture across features
- Familiar patterns for developers
- Easier maintenance and testing
- Scalable to additional custom entities
- Budget feature integrates seamlessly with category system
- Financial planning capabilities without schema migration
- Flexible budget periods support various planning horizons
