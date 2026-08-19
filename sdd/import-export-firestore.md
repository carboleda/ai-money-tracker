# Firestore Data Export & Import

## Firestore Data Export

Command

```bash
node ./scripts/firestore-export.mjs --recursive --key ../[GCP_ACCOUNT_KEY].json
```

**Purpose:**
Export your Firestore database data to a local file or directory.

**Script:**
`firestore-export.mjs` (Node.js script using ECMAScript modules, `.mjs` extension)

**Key Options:**

- `--recursive`: Exports nested collections (subcollections) as well.
- `--key`: Path to your Firebase Admin SDK service account key JSON file (required for authentication).

**Typical Use Cases:**

- **Backup:** Create a backup of your Firestore data.
- **Migration:** Move data between projects or environments.

---

## Firestore Data Import

Command

⚠️ **IMPORTANT**: For local testing the --key argument must be removed to prevent affecting the production db

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \ # Use for local testing
USER_ID_SEED=[SEED_VALUE] \
GCLOUD_PROJECT=[PROJECT_ID] \
node scripts/firestore-import-multiuser.mjs --key ../[GCP_ACCOUNT_KEY].json --email "[USER_EMAIL]"
```

**Purpose:**
Import data into your Firestore database, typically into a local emulator for testing.

**Environment Variables:**

- `USER_ID_SEED`: Used to seed user IDs for deterministic or repeatable imports.
- `FIRESTORE_EMULATOR_HOST`: Points to a local Firestore emulator (not production).
- `GCLOUD_PROJECT`: Sets the Google Cloud project ID.

**Script:**
`firestore-import-multiuser.mjs` (Node.js script, supports importing data for multiple users)

**Key Option:**

- `--email`: Specifies the user email for whom the data is being imported.

**Typical Use Cases:**

- **Testing:** Populate the Firestore emulator with test data.
- **Development:** Quickly set up a local environment mirroring production data.

---

## Key Points & Gotchas

- **Service Account Key:** Required for secure Firestore access during export.
- **Emulator:** Always import into the emulator, not production, to avoid accidental data overwrites.
- **Environment Variables:** Configure the import process for different users or projects.
- **Never use production credentials or keys in public repositories.**
- **Be careful with the `--recursive` flag:** Without it, subcollections may not be exported.
- **Double-check your environment:** Ensure you’re targeting the emulator, not production, when importing test data.

---

_Need a breakdown of the scripts or help setting up the emulator or service account? Let me know!_
