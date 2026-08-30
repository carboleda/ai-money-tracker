# AI Money Tracker - Account Management Feature Implementation

## Project Summary

### Initial Request

**Goal:** Implement a complete account management system for the AI Money Tracker application with the following expected behavior:

**Account Properties:**

- `ref` (e.g., C1408, AFC) - User-defined, unique per user, serves as JOIN key with transactions
- `name` - Display name
- `description` - Optional
- `icon` - Emoji character
- `type` - One of: "saving", "credit", "investment"
- `balance` - Current account balance
- `isDeleted` - Boolean for soft-delete support

**Transaction Account Mapping:**
Transactions store accounts as strings in the database, but API responses should return enriched account objects:

```typescript
{
  ref: string;
  name: string;
  icon: string;
}
```

**Key Design Decisions:**

1. `ref` is unique per user (not globally) - error if duplicate
2. Accounts support soft-delete (not hard delete)
3. Both `sourceAccount` and `destinationAccount` in transactions should be enriched (regardless of PENDING/COMPLETE status)
4. Storage: Accounts stored as string refs in Firestore transactions (no migration)
5. No fallback to environment config - use only database accounts
6. Account enrichment happens at Firestore driver level (database-specific, portable to SQL via joins)

---

## Completed Steps

### Step 1: Extend Account Interface and Model ✅

**Files Modified:**

- `src/interfaces/account.ts` - Added AccountEntity interface with new fields
- `src/app/api/domain/account/model/account.model.ts` - Added AccountModel class and types:
  - `AccountType = "saving" | "credit" | "investment"`
  - `CreateAccountInput = Omit<AccountModel, "id" | "isDeleted">`
  - `UpdateAccountInput = Partial<Omit<AccountModel, "id" | "ref" | "balance" | "isDeleted">>`

**Status:** ✅ Complete, no compilation errors

---

### Step 2: Update Firestore Account Repository for CRUD and Validation ✅

**Files Modified:**

- `src/app/api/domain/account/repository/account.repository.ts` - Interface with CRUD methods:

  - `getAll()` - Returns non-deleted accounts
  - `getAccountById(id)` - By Firestore document ID
  - `getAccountByRef(ref)` - By user-defined reference
  - `create(data)` - Creates account with ref uniqueness check per user
  - `update(id, data)` - Updates metadata (name, icon, type, description)
  - `delete(id)` - Soft-deletes by setting `isDeleted: true`
  - `updateOrCreateAccount()` - Legacy method for balance updates

- `src/app/api/drivers/firestore/account/account.entity.ts` - Extended with new fields
- `src/app/api/drivers/firestore/account/account.adapter.ts` - Maps between entity and model
- `src/app/api/drivers/firestore/account/account-firestore.repository.ts` - Implementation with:
  - Ref uniqueness validation (throws error if duplicate)
  - Soft-delete support
  - Backward compatibility with legacy `account` field
  - All CRUD operations

**Status:** ✅ Complete, no compilation errors

---

### Step 3: Create/Enhance Account API Route Handler ✅

**Files Created:**

- `src/app/api/domain/account/service/create-account.service.ts` - Service for account creation
- `src/app/api/domain/account/service/update-account.service.ts` - Service for account updates
- `src/app/api/domain/account/service/delete-account.service.ts` - Service for account deletion

**Files Modified:**

- `src/app/api/(routes)/account/route.ts` - Implemented full REST API with Zod validation:
  - **GET** - Returns all non-deleted accounts
  - **POST** - Creates account with validation (required: ref, name, icon, type, balance)
    - Returns 409 if ref already exists
    - Returns 400 for invalid/missing fields
  - **PUT** - Updates account metadata with validation
    - Required: id
    - Optional: name, icon, type, description
    - Returns 404 if account not found
  - **DELETE** - Soft-deletes account
    - Required: id
    - Returns 404 if account not found

**Validation:**

- Added Zod schemas for request validation
- Validates account type enum
- Validates required fields and types

**Status:** ✅ Complete, no compilation errors

---

### Step 4: Modify Transaction Query/Response Mapping for Account Enrichment ✅

**Files Modified:**

- `src/app/api/domain/transaction/model/transaction.model.ts`:

  - Added `AccountSummary` type: `{ref: string; name: string | null; icon: string | null}`
  - Changed `sourceAccount: string` → `sourceAccount: AccountSummary`
  - Changed `destinationAccount?: string` → `destinationAccount?: AccountSummary`

- `src/app/api/drivers/firestore/transaction/transaction-firestore.repository.ts`:

  - Injected `AccountRepository`
  - Added `enrichTransactionsWithAccounts()` private method:
    - Fetches all accounts once via `accountRepository.getAll()`
    - Creates lookup map by ref
    - Enriches transactions with account summaries
    - Returns partial data if account not found: `{ref, name: null, icon: null}`
  - Updated `getById()` to enrich response
  - Updated `searchTransactions()` to enrich all results
  - Handles both sourceAccount and destinationAccount for all transaction statuses

- `src/app/api/drivers/firestore/transaction/transaction.adapter.ts`:
  - Updated `toModel()` to handle AccountSummary objects
  - Updated `toEntity()` to extract `ref` from AccountSummary back to string for storage

**Storage:** Remains as strings in Firestore (no migration)
**Response:** Returns enriched AccountSummary objects
**Performance:** Single batch query of all accounts, no N+1 problem

**Status:** ✅ Complete, no compilation errors

---

### Step 5: Update Transaction Validation for Account Existence ✅

**Files Created:**

- `src/app/api/domain/account/service/validate-account.service.ts` - Service in account module:
  - `execute(sourceAccount, destinationAccount?)` - Validates account existence
  - Fetches all accounts once
  - Creates lookup map by ref
  - Throws error if account doesn't exist or is deleted
  - Error messages: "Source/Destination account 'X' does not exist or has been deleted"

**Files Modified:**

- `src/app/api/domain/transaction/service/create-transaction.service.ts`:

  - Injected `ValidateAccountService` from account module
  - Added TRANSFER validation: Throws error if TRANSFER without destinationAccount
  - Calls `validateAccountService.execute()` before creating transaction

- `src/app/api/domain/transaction/service/update-transaction.service.ts`:

  - Injected `ValidateAccountService` from account module
  - Added TRANSFER validation: Throws error if TRANSFER without destinationAccount
  - Calls `validateAccountService.execute()` before updating transaction

- `src/app/api/domain/account/account.module.ts`:
  - Registered all new services in IoC container:
    - `CreateAccountService`
    - `UpdateAccountService`
    - `DeleteAccountService`
    - `ValidateAccountService`

**Architecture:**

- Account Validation Service (Account Module) → Validates account existence
- Create/Update Transaction Services (Transaction Module) → Validates TRANSFER requires destinationAccount
- Flow: Create/Update Transaction Service → ValidateAccountService → AccountRepository.getAll()

**Status:** ✅ Complete, no compilation errors

---

## Summary Table

| Step  | Component                     | Files Created | Files Modified     | Status          |
| ----- | ----------------------------- | ------------- | ------------------ | --------------- |
| 1     | Account Model & Interface     | 0             | 2                  | ✅ Complete     |
| 2     | Repository & Firestore Driver | 0             | 4                  | ✅ Complete     |
| 3     | API Routes & Services         | 3             | 1                  | ✅ Complete     |
| 4     | Transaction Enrichment        | 0             | 3                  | ✅ Complete     |
| 5     | Account Validation            | 1             | 3 + Account Module | ✅ Complete     |
| **6** | **UI Components**             | **~8**        | **~5**             | **Not Started** |

---

## Next Steps (Step 6 - UI Implementation)

**Remaining Work:**

1. Create Zustand account store (`useAccountStore`)
2. Create account management page with CRUD UI
3. Update BankAccounsDropdown component to use store accounts
4. Update transactions table to display enriched account names/icons

   - src/components/Transactions/TransactionTable/Columns.tsx

5. Add "Accounts" menu item to navigation
6. Initialize account store on app load

**Key Points for Step 6:**

- Accounts loaded from API and cached in Zustand store
- All UI components read from store instead of environment config
- Transaction tables display `account.name` and `account.icon` (already enriched from Step 4)
- Account management UI for create/update/delete operations
- Soft-delete with confirmation dialog

---

## Architecture Overview

### Data Flow - Account Management

```
Account API Route (REST)
  ↓
Account Services (Create/Update/Delete/GetAll)
  ↓
Account Repository (CRUD operations)
  ↓
Firestore Driver (Account collection)
```

### Data Flow - Transaction with Account Enrichment

```
Transaction Query
  ↓
Firestore Repository
  ↓
Enrich with Accounts
  ├─ Fetch all accounts once
  ├─ Create lookup map by ref
  └─ Map transactions with AccountSummary
  ↓
Transaction Adapter
  ↓
API Response (enriched)
```

### Data Flow - Transaction Validation

```
Create/Update Transaction Service
  ↓
Validate Transfer Type
  ├─ Check TRANSFER has destinationAccount
  ↓
Validate Account Service
  ├─ Fetch all accounts
  ├─ Check sourceAccount exists
  └─ Check destinationAccount exists (if provided)
  ↓
Repository Create/Update
```

---

## API Endpoints

### Account Management

- **GET** `/api/account` - Get all non-deleted accounts
- **POST** `/api/account` - Create account (ref, name, icon, type, balance, description?)
- **PUT** `/api/account` - Update account (id, name?, icon?, type?, description?)
- **DELETE** `/api/account` - Soft-delete account (id)

### Transaction (Existing, now with enriched accounts)

- **GET** `/api/transaction/{id}` - Returns transaction with enriched accounts
- **POST** `/api/transaction` - Creates transaction with account validation
- **PUT** `/api/transaction` - Updates transaction with account validation

---

## Testing Checklist

- [ ] Create account with valid data
- [ ] Try creating account with duplicate ref (should fail)
- [ ] Update account metadata
- [ ] Soft-delete account
- [ ] Get all accounts (should not include deleted)
- [ ] Create transaction with valid accounts
- [ ] Create transaction with non-existent account (should fail)
- [ ] Create TRANSFER without destinationAccount (should fail)
- [ ] Get transaction and verify account enrichment
- [ ] Verify transaction table displays account names/icons

---

## Notes

- Account enrichment uses single batch query for efficiency
- All validation happens at appropriate layers (repository, service)
- Soft-delete preserves transaction history
- No environment config fallback - all accounts come from database
- Firestore storage remains unchanged (accounts as string refs)
