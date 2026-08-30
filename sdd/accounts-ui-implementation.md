# Bank Accounts Management UI Implementation

## Overview

Implemented a complete bank accounts management UI following the same structure as the RecurringExpenses components. The UI integrates with the backend account management API (as defined in ACCOUNT_FEATURE_SUMMARY.md).

## Components Created

### 1. **AccountModalForm** (`src/components/Accounts/AccountModalForm/AccountModalForm.tsx`)

Modal form for creating and editing bank accounts.

**Features:**

- Create new accounts with required fields (ref, name, icon, type, balance)
- Edit existing accounts (ref becomes read-only to prevent duplication)
- Account type dropdown with options: Saving, Credit, Investment
- Currency input for balance field
- Optional description field
- Form validation
- Error handling with user-friendly messages
- Success toast notifications

**Fields:**

- `ref` - Account reference (e.g., C1408, AFC) - Read-only on edit
- `icon` - Emoji icon for visual identification (1-2 chars)
- `name` - Display name
- `type` - Account type selector (Saving, Credit, Investment)
- `balance` - Current balance with currency formatting
- `description` - Optional account description

---

### 2. **AccountsTable** (`src/components/Accounts/AccountsTable/AccountsTable.tsx`)

Responsive data table displaying all accounts with search and CRUD actions.

**Features:**

- Virtual scrolling for optimal performance
- Search filtering by account name, reference, or type
- Create button (opens modal)
- Edit button per row (opens modal with existing data)
- Delete button per row (soft-delete with confirmation)
- Responsive design (Desktop and Mobile layouts)
- Loading state with skeleton
- Empty state message
- Compact and striped table styling

**Desktop Columns:**

- Icon
- Reference (Chip)
- Name
- Type (Chip)
- Balance (formatted currency, right-aligned)
- Actions

**Mobile Layout:**

- Single column showing Icon + Name + Balance

---

### 3. **Columns** (`src/components/Accounts/AccountsTable/Columns.tsx`)

Reusable column definitions and cell rendering logic.

**Exports:**

- `useRenderCell()` - Hook that returns:
  - `columns` - Responsive column definitions
  - `renderCell()` - Function to render table cells
  - `rowHeight` - Dynamic row height (80px mobile, 52px desktop)
  - `renderSeparator()` - Function to render section separators

**Features:**

- Mobile-responsive rendering
- Formatted currency display
- Chip components for ref and type
- Icon emoji display

---

### 4. **PageContent** (`src/components/Accounts/PageContent/index.tsx`)

Main page component for account management.

**Features:**

- Total balance summary card (gradient background)
- Integrates with useAccountStore for state management
- Fetches accounts from `/api/account` endpoint
- Sets page title and subtitle
- Displays AccountsTable with loading state
- Real-time total balance calculation
- Layout: Summary card + Data table

---

## Hooks Created

### **useMutateAccount** (`src/hooks/useMutateAccount.ts`)

Custom hook for account CRUD operations using SWR mutations.

**Methods:**

- `createAccount(account)` - POST to create account
- `updateAccount(account)` - PUT to update account
- `deleteAccount(id)` - DELETE to soft-delete account
- `isMutating` - Loading state boolean

**Endpoint:** `/api/account`

---

## State Management

### **useAccountStore** (`src/stores/useAccountStore.ts`)

Zustand store for managing account state (already existed, used by PageContent).

**State:**

- `accounts[]` - Array of accounts
- `isLoading` - Loading state
- `error` - Error message

**Actions:**

- `setAccounts()` - Update accounts array
- `addAccount()` - Add single account
- `updateAccount()` - Update single account
- `removeAccount()` - Remove account from store
- `fetchAccounts()` - Fetch from API
- `setIsLoading()` - Set loading state
- `setError()` - Set error state
- `reset()` - Reset to initial state

---

## i18n Integration

### **Translation Keys** (`src/i18n/locales/{en,es}/accounts.json`)

Added complete translation support for English and Spanish.

**Key Translation Groups:**

- **Page & UI:** subtitle, emptyContent, accounts
- **Account Types:** saving, credit, investment
- **Fields:** name, ref, type, balance, description, icon
- **Actions:** save, cancel, delete
- **Messages:** accountCreated, accountUpdated, accountDeleted, refAlreadyExists, allFieldAreRequired, deleteConfirmation
- **Helpers:** selectAccountType

### **LocaleNamespace Update** (`src/i18n/namespace.ts`)

Added `Accounts = "accounts"` to enum for proper namespace routing.

---

## File Structure

```
src/components/Accounts/
├── AccountModalForm/
│   └── AccountModalForm.tsx          # Modal form component
├── AccountsTable/
│   ├── AccountsTable.tsx             # Table component
│   └── Columns.tsx                   # Column definitions & rendering
├── PageContent/
│   └── index.tsx                     # Main page component
└── index.ts                          # Barrel exports

src/hooks/
└── useMutateAccount.ts               # CRUD operations hook

src/i18n/
└── locales/
    ├── en/
    │   └── accounts.json             # English translations
    └── es/
        └── accounts.json             # Spanish translations

src/i18n/
└── namespace.ts                      # Updated with Accounts enum
```

---

## API Integration

### **Endpoints Used**

All endpoints as defined in backend (ACCOUNT_FEATURE_SUMMARY.md):

| Method | Endpoint       | Purpose              |
| ------ | -------------- | -------------------- |
| GET    | `/api/account` | Fetch all accounts   |
| POST   | `/api/account` | Create new account   |
| PUT    | `/api/account` | Update account       |
| DELETE | `/api/account` | Delete (soft-delete) |

### **Request Payload (Create/Update)**

```typescript
{
  id?: string;          // Required for update only
  ref: string;          // Required, unique per user
  name: string;         // Required
  icon: string;         // Required, emoji
  type: AccountType;    // Required: "saving" | "credit" | "investment"
  balance: number;      // Required
  description?: string; // Optional
}
```

### **Response**

```typescript
Account[] or Account
{
  id: string;
  ref: string;
  name: string;
  icon: string;
  type: AccountType;
  balance: number;
  description?: string;
  isDeleted: boolean;
}
```

---

## Features & Behavior

### **Account Creation**

- Modal form with all required fields
- Validates: ref, name, icon, type, balance
- Checks for duplicate ref (409 error)
- Shows success toast on creation
- Clears form and closes modal

### **Account Editing**

- Opens modal with existing account data
- `ref` field is read-only (cannot change reference)
- Can update: name, icon, type, balance, description
- Shows success toast on update

### **Account Deletion**

- Soft-delete (sets isDeleted flag, doesn't remove from DB)
- Delete button with confirmation dialog
- Shows success toast after deletion
- Account removed from table immediately (optimistic update)

### **Search & Filter**

- Real-time filtering by:
  - Account name
  - Account reference (ref)
  - Account type
- Case-insensitive search

### **Responsive Design**

- **Desktop:** Full table with 6 columns (Icon, Ref, Name, Type, Balance, Actions)
- **Mobile:** Single column layout showing Icon + Name + Balance
- Adapts row height and rendering based on screen size

### **Loading & Empty States**

- Shows skeleton loader while fetching
- Shows "No accounts to display" when empty
- Graceful error handling

---

## Styling

### **Colors & Theme**

- Uses HeroUI component library
- Balance card: Blue gradient (from-blue-600 to-blue-500)
- Chips: Flat style for ref, bordered for type
- Buttons: Success (green) for create, Warning (yellow) for edit, Danger (red) for delete

### **Layout**

- Flexbox for alignment and spacing
- Gap utilities for consistent spacing
- Responsive grid on mobile
- Full-width table with max-height virtualization

---

## Integration Checklist

- [x] Create AccountModalForm component
- [x] Create AccountsTable component with search
- [x] Create Columns with responsive rendering
- [x] Create PageContent with summary card
- [x] Create useMutateAccount hook
- [x] Add English translations
- [x] Add Spanish translations
- [x] Update LocaleNamespace enum
- [x] Create barrel exports (index.ts)
- [x] Fix TypeScript compilation errors
- [x] Responsive mobile layout

---

## Known Limitations & Future Enhancements

### **Current Limitations**

- Switch statement lint warning (not a compilation error)
- Type translations hardcoded in enum keys (could use i18n translation function in display)

### **Future Enhancements**

- Sorting by column (name, balance, type)
- Bulk operations (select multiple, delete together)
- Account groups/categories
- Account balance history chart
- Import/export accounts
- Account templates

---

## Testing Recommendations

1. **Create Account**

   - Create account with valid data
   - Try creating with duplicate ref → should show error
   - Verify account appears in table

2. **Edit Account**

   - Edit account metadata (name, icon, type, description)
   - Verify ref field is read-only
   - Verify changes appear in table

3. **Delete Account**

   - Delete account with confirmation
   - Verify it's removed from table
   - Verify soft-delete in database (isDeleted flag)

4. **Search**

   - Filter by name
   - Filter by ref
   - Filter by type
   - Clear filter

5. **Responsive**

   - Check desktop layout (6 columns)
   - Check mobile layout (1 column)
   - Test on various screen sizes

6. **Data Sync**
   - Verify store updates after create/update/delete
   - Verify total balance recalculates
   - Test page refresh

---
