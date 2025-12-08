## Purpose

This document contains instructions for Copilot Assistant (or a developer) to create a Firestore export script that reads data from this project's Firebase Firestore and writes the data to disk as JSON files. It describes the collection structures expected in this project, a sample Node.js script plan (using the Firebase Admin SDK), authentication and running steps, and verification steps.

## Output

- One JSON file per top-level collection, stored under `./firestore-export/<collection>.json`.
- Optionally, one JSON file per document in subfolders: `./firestore-export/<collection>/<docId>.json`.

## Collections and Schemas

The repository stores finance, user, and app data in Firestore. Below are the main collections and expected field shapes. These schemas are illustrations; the script should not rely on strict typing but should preserve every field present.

- `transactions`

  - `id` (string, document id)
  - `userId` (string)
  - `amount` (number)
  - `category` (string)
  - `createdAt` (timestamp or ISO string)
  - `description` (string)
  - `destinationAccount` (string)
  - `isReccurent` (boolean)
  - `isRecurrent` (boolean)
  - `notes` (string)
  - `paymentLink` (string | null)
  - `sourceAccount` (string)
  - `status` (string)
  - `type` (string: `expense` | `income` | `transfer`)

- `recurring-expenses`

  - `id` (string, document id)
  - `amount` (number)
  - `category` (string)
  - `description` (string)
  - `disabled` (boolean)
  - `dueDate` (timestamp)
  - `frequency` (string: `monthly` | `weekly` | `yearly`)
  - `notes` (string)
  - `paymentLink` (string | null)

- `accounts-history`

  - `id` (string, document id)
  - `createdAt` (timestamp or ISO string)
  - `expenses` (number)
  - `incomes` (number)
  - `transfers` (number)

- `accounts`

  - `id` (string, document id)
  - `account` (string)
  - `balance` (number)

Note: If your project uses subcollections (for example `users/{userId}/transactions`), the script will walk subcollections and export them as nested JSON or separate files.

## High-Level Steps for the Export Script

1. Initialize Firebase Admin SDK using a service account key specified by an environment variable `GOOGLE_APPLICATION_CREDENTIALS` or a path provided by the user.
2. Enumerate top-level collections (or use a configured list in the script for safety).
3. For each collection, read every document and expand its subcollections recursively (optional, configurable).
4. Convert Firestore types (Timestamp, GeoPoint, DocumentReference) to JSON-safe representations.
5. Save results as JSON files under `./firestore-export`.

## Security and Auth

- Use a Firebase service account key with read permissions for Firestore. Never commit that key to git.
- Recommended: set env var `GOOGLE_APPLICATION_CREDENTIALS` to the JSON key path, or pass the file path to the script as `--key <path>`.

## Sample Node.js Script (outline)

This outline uses Node.js 16+ and the Firebase Admin SDK. The actual implementation should include robust error handling, logging, and optional concurrency limits.

Filename: `scripts/firestore-export.js`

Key behaviors:

- Accept CLI flags: `--out <dir>`, `--collections <comma-separated-list>`, `--perDocFiles` (boolean), `--recursive` (walk subcollections), `--key <service-account.json>`.
- Read collections list from flags or default to `['transactions','recurring-expenses','accounts-history','accounts']`.

Pseudocode:

1. Parse CLI args and resolve output directory.
2. Initialize `admin.initializeApp({ credential: admin.credential.cert(keyJson) })`.
3. For each collection:
   a. Query all documents (pagination using cursors or `get()` for modest dataset sizes).
   b. For each document, convert special Firestore types:
   - `Timestamp` => ISO string via `toDate().toISOString()`
   - `GeoPoint` => `{ _type: 'GeoPoint', latitude, longitude }`
   - `DocumentReference` => path string
     c. If `--recursive` then list subcollections via `doc.ref.listCollections()` and process them recursively.
     d. Append document to an array for the collection, or write individual doc files if `--perDocFiles`.
4. Write the collection file as pretty JSON with `fs.writeFileSync(path, JSON.stringify(data, null, 2))`.

Example conversion helper (JS):

function convertFirestoreValue(value, admin) {
if (value && typeof value === 'object') {
// Firestore Timestamp-like shape
if (value.\_seconds !== undefined && value.\_nanoseconds !== undefined) {
return new Date(value.\_seconds \* 1000 + Math.round(value.\_nanoseconds / 1e6)).toISOString();
}
// GeoPoint-like shape
if (value.latitude !== undefined && value.longitude !== undefined) {
return { \_type: 'GeoPoint', latitude: value.latitude, longitude: value.longitude };
}
// DocumentReference
if (typeof value.get === 'function' && typeof value.path === 'string') {
return value.path;
}
// Recurse for maps/arrays
const out = Array.isArray(value) ? [] : {};
for (const k of Object.keys(value)) {
out[k] = convertFirestoreValue(value[k], admin);
}
return out;
}
return value;
}

## Run steps

1. Install deps (in project root):

```bash
npm install firebase-admin minimist mkdirp
```

2. Create a directory to store exports (script will create if missing):

```bash
mkdir -p firestore-export
```

3. Run the script (example):

```bash
GOOGLE_APPLICATION_CREDENTIALS=~/secrets/my-service-account.json node scripts/firestore-export.js --out ./firestore-export --collections users,transactions --perDocFiles
```

## Verification

- After the script completes, confirm files exist under `./firestore-export`.
- Open `./firestore-export/users.json` and check that fields like `email`, `displayName`, and `createdAt` are present and `createdAt` is an ISO string.
- Spot-check a few `transactions` documents for `amount`, `userId`, `date`.

## Notes and Caveats

- For very large collections (millions of documents), prefer paginated exports and streaming writes to avoid high memory usage.
- If you have Firestore export needs for backups or large-scale migrations consider using `gcloud firestore export` for managed exports to GCS, then download and convert as needed.
- The sample script uses the Admin SDK and requires a service account; user-based OAuth credentials are not suitable for server-side exports.

## Next steps for Copilot Assistant

- Implement `scripts/firestore-export.js` using the outline above.
- Add optional TypeScript version `scripts/firestore-export.ts` if preferred.
- Add tests or a dry-run mode that prints counts without writing files.

End
