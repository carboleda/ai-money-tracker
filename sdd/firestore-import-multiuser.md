## Purpose

This document contains instructions for using the Firestore import script that transforms exported Firestore collections from a single-user structure into a multi-user structure. The script reads JSON export files and imports them as subcollections under a `users/{userId}/` document structure, where the user ID is generated from an email address using the same hashing algorithm used by the application.

## Prerequisites

- Exported Firestore data in JSON format (see `firestore-export.md` for export instructions)
- Firebase service account credentials (either via `GOOGLE_APPLICATION_CREDENTIALS` environment variable or `--key` flag)
- `USER_ID_SEED` environment variable set with a numeric seed value (must match the value used by the application)
- Node.js 16+

## Input Structure

The script expects to read from `.firestore-export/` (or a custom path via `--input`) with the following files:

- `accounts.json` - Account records with fields: `account`, `balance`, `_id`
- `accounts-history.json` - Monthly account summaries with fields: `incomes`, `expenses`, `transfers`, `createdAt`, `_id`
- `recurring-expenses.json` - Recurring expense definitions with fields: `description`, `frequency`, `dueDate`, `category`, `notes`, `amount`, `disabled`, `paymentLink`, `_id`
- `transactions.json` - Individual transaction records with fields: `description`, `type`, `sourceAccount`, `createdAt`, `status`, `category`, `isReccurent`, `destinationAccount`, `amount`, `_id`

## Output Structure

The script writes data to Firestore in the following hierarchical structure:

```
users/
  {userId}/
    accounts/
      {documentId}: { account, balance }
    accounts-history/
      {documentId}: { incomes, expenses, transfers, createdAt }
    recurring-expenses/
      {documentId}: { description, frequency, dueDate, category, notes, amount, disabled, paymentLink }
    transactions/
      {documentId}: { description, type, sourceAccount, createdAt, status, category, isReccurent, destinationAccount, amount }
```

Where `{userId}` is generated from the provided email using XXHash64 with the `USER_ID_SEED` seed, and `{documentId}` preserves the original `_id` from the exported data.

## User ID Generation

The script generates a user ID from an email address using the same algorithm as the application:

```javascript
const userId = XXH.h64(email, userIdSeed).toString(32);
```

This ensures consistency with user IDs in your application's authentication system. The `USER_ID_SEED` must be an integer and should match the value used by the running application.

## High-Level Steps

1. **Prepare credentials**: Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your Firebase service account JSON file, or prepare to pass `--key` flag.
2. **Set environment seed**: Export `USER_ID_SEED` environment variable with the numeric seed value.
3. **Prepare export files**: Ensure you have exported data in `.firestore-export/` directory (see `firestore-export.md`).
4. **Run import script**: Execute the script with the target user's email address.
5. **Verify**: Check Firestore console to confirm data is now organized under `users/{userId}/`.

## Usage

### Basic Usage

```bash
GOOGLE_APPLICATION_CREDENTIALS=~/secrets/firebase-service-account.json \
USER_ID_SEED=1234566789 \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
node scripts/firestore-import-multiuser.mjs --email "arbofercho@gmail.com"
```

### With Custom Input Directory

```bash
USER_ID_SEED=1234566789 \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
node scripts/firestore-import-multiuser.mjs --email "arbofercho@gmail.com" --input ./backup/firestore-export
```

### With Service Account Key Path Flag

```bash
USER_ID_SEED=1234566789 \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
node scripts/firestore-import-multiuser.mjs --email "user@example.com" --key ~/secrets/firebase-service-account.json
```

### Dry Run Mode (Preview Only)

```bash
USER_ID_SEED=1234566789 \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT="ai-money-tracker" \
node scripts/firestore-import-multiuser.mjs --email "arbofercho@gmail.com"
```

The dry-run mode will:

- Read and parse all export files
- Generate the user ID
- Display a summary of what would be imported
- NOT write any data to Firestore

## CLI Flags

| Flag       | Type    | Required | Default               | Description                                                                                                 |
| ---------- | ------- | -------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `--email`  | string  | Yes      | -                     | Email address for the user being imported. Used to generate the user ID.                                    |
| `--key`    | string  | No       | -                     | Path to Firebase service account JSON file. If not provided, uses `GOOGLE_APPLICATION_CREDENTIALS` env var. |
| `--input`  | string  | No       | `./.firestore-export` | Path to directory containing exported JSON files.                                                           |
| `--dryRun` | boolean | No       | `false`               | Preview the import without writing to Firestore.                                                            |

## Environment Variables

| Variable                         | Required    | Description                                                                                                                |
| -------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `USER_ID_SEED`                   | Yes         | Numeric seed for XXHash64 user ID generation. Must be an integer and should match the application's `USER_ID_SEED` config. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Conditional | Path to Firebase service account JSON file. Required unless `--key` flag is provided.                                      |

## Data Behavior

### Document Preservation

- **Original IDs**: The script preserves the original `_id` from exported documents as Firestore document IDs. This maintains referential integrity if documents reference each other by ID.
- **Field Preservation**: All fields from the exported documents are imported as-is. No fields are added or removed (except `_id`, which becomes the document ID).
- **No Merging**: When a user already exists, the script overwrites the data with the contents of the export files. This is an all-or-nothing operation per collection.

### Data Ordering

- Documents are imported in batches of up to 500 documents to respect Firestore's batch operation limits.
- There is no guaranteed order within a collection, though the export files are processed in the order they appear in the input directory.

## Error Handling

The script performs validation for:

- **Missing `--email` flag**: Required argument, will exit with error code 1.
- **Missing `USER_ID_SEED`**: Required environment variable, will exit with error code 1.
- **Firebase credentials**: Will error if neither `--key` nor `GOOGLE_APPLICATION_CREDENTIALS` is available.
- **Export file access**: Will report errors for missing or unparseable JSON files per collection and continue with others.
- **User ID generation**: Will report errors if user ID generation fails.

If any collection fails to import, the script will still attempt to import other collections. A summary is printed at the end showing success/failure counts.

## Verification

After running the import script:

1. **Check Firestore console**: Navigate to the Firestore database and expand the `users` collection.
2. **Verify user document**: Click on the user ID (the hashed email) to view the document.
3. **Check subcollections**: Verify that the following subcollections exist under the user document:
   - `accounts`
   - `accounts-history`
   - `recurring-expenses`
   - `transactions`
4. **Spot-check documents**: Open a few documents in each subcollection to confirm fields are present and data looks correct.

Example verification:

- Check `users/{userId}/transactions` contains ~9,458 documents with fields like `description`, `type`, `amount`, `createdAt`, etc.
- Check `users/{userId}/recurring-expenses` contains ~386 documents with fields like `description`, `frequency`, `dueDate`, etc.
- Check `users/{userId}/accounts` contains ~5 documents with fields like `account` and `balance`.
- Check `users/{userId}/accounts-history` contains ~14 documents with fields like `incomes`, `expenses`, `transfers`, `createdAt`.

## Notes and Caveats

### Data Isolation

This import script enables proper data isolation per user. Each user's financial data (transactions, accounts, recurring expenses, and history) is now organized under their own document path, making it easy to:

- Query user-specific data without cross-user filtering
- Implement Firestore security rules that restrict access to `users/{userId}/*` based on authentication
- Migrate individual users or reset a user's data by deleting the entire `users/{userId}` document tree

### Email Consistency

The email provided to the script (`--email`) is used ONLY for generating the user ID via hashing. It is not stored in Firestore during import. If you need to associate emails with user IDs, consider:

- Adding an email field to a `users/{userId}` root document
- Maintaining a separate email-to-userId mapping collection

### Re-running the Import

If you run the import script multiple times for the same email and user ID, the data will be **overwritten** (not merged). This is intentional and allows for data refresh/correction, but be aware that if you run the script twice with different source files, the first import's data will be replaced.

### Seed Value Consistency

The `USER_ID_SEED` environment variable **must match** the value your application uses for user ID generation (as defined in `src/config/env.ts`). If the seeds differ, the same email will generate different user IDs, creating orphaned data. Always verify seed consistency with your application deployment.

## Troubleshooting

### "USER_ID_SEED environment variable is not set"

Ensure you export the variable before running:

```bash
export USER_ID_SEED=1234567890
node scripts/firestore-import-multiuser.mjs --email "user@example.com"
```

### "No Firebase credentials provided"

Either set `GOOGLE_APPLICATION_CREDENTIALS`:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/secrets/firebase-service-account.json
```

Or pass the `--key` flag:

```bash
node scripts/firestore-import-multiuser.mjs --email "user@example.com" --key ~/secrets/firebase-service-account.json
```

### "Failed to read export file"

Ensure the export files exist in the input directory with correct names:

- `accounts.json`
- `accounts-history.json`
- `recurring-expenses.json`
- `transactions.json`

If files are in a different location, use the `--input` flag.

### "No Firebase credentials provided. Set GOOGLE_APPLICATION_CREDENTIALS or use --key"

Your Firebase service account key file is not accessible. Verify:

- The file path is correct
- You have read permissions
- The JSON file is valid

## Next Steps

After successfully importing data for one user:

1. **Test data access**: Verify that your application can read the imported data under the new `users/{userId}/` structure.
2. **Update application routes**: If your API routes still query top-level collections, update them to query `users/{userId}/` subcollections instead.
3. **Import other users**: If migrating from a single-user system, repeat the import process for each additional user email.
4. **Update Firestore security rules**: Add rules to restrict access to `users/{userId}/*` based on authentication.
5. **Clean up old collections**: Once all data is migrated and verified, delete the old top-level collections (`transactions`, `recurring-expenses`, `accounts-history`, `accounts`) to avoid confusion.

## Related Documentation

- **Export**: See `firestore-export.md` for instructions on exporting data from Firestore.
- **User ID Generation**: The application uses `src/config/utils.ts` and `XXHash64` with `USER_ID_SEED` to generate user IDs.
- **User Context**: See `src/context/user-context.ts` for how the application manages user context.

End
