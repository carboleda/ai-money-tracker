#!/usr/bin/env node

import { initializeApp, getApp as _app, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import path, { join } from "node:path";
import minimist from "minimist";
import XXH from "xxhashjs";

/**
 * Generate a user ID from an email using XXHash64.
 * This matches the user ID generation logic in the application.
 */
function generateUserId(email, userIdSeed) {
  if (!userIdSeed) {
    throw new Error(
      "USER_ID_SEED environment variable is not set. Please set it before running this script."
    );
  }
  return XXH.h64(email, userIdSeed).toString(32);
}

/**
 * Read and parse a JSON export file.
 */
function readExportFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to read export file "${filePath}": ${err.message}`);
  }
}

/**
 * Convert timestamp field strings to Firestore Timestamp objects.
 * Identifies timestamp fields by name and converts ISO strings to Timestamp.
 */
function convertTimestampFields(doc, timestampFieldNames) {
  const converted = { ...doc };

  for (const fieldName of timestampFieldNames) {
    if (fieldName in converted && converted[fieldName]) {
      const value = converted[fieldName];

      // Check if it's an ISO string that looks like a date
      if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        try {
          const date = new Date(value);
          if (!Number.isNaN(date.getTime())) {
            converted[fieldName] = Timestamp.fromDate(date);
          }
        } catch (err) {
          // If conversion fails, leave the value as-is and log the error
          console.warn(
            `Warning: Could not convert ${fieldName} value "${value}" to Timestamp. Error: ${err.message}`
          );
        }
      }
    }
  }

  return converted;
}

/**
 * Transform a collection's documents to the new nested structure.
 * Preserves original document IDs and data, converting timestamp fields.
 */
function transformCollectionData(collectionName, documents) {
  // Define timestamp fields per collection
  const timestampFieldsByCollection = {
    transactions: ["createdAt"],
    "recurring-expenses": ["dueDate"],
    "accounts-history": ["createdAt"],
    accounts: [],
  };

  const timestampFields = timestampFieldsByCollection[collectionName] || [];

  return documents.map((doc) => {
    // Remove the _id field from the document data (will be used as Firestore doc ID)
    const { _id, ...docData } = doc;

    // Convert timestamp fields
    const convertedData = convertTimestampFields(docData, timestampFields);

    return {
      documentId: _id || "unknown",
      data: convertedData,
    };
  });
}

/**
 * Write documents to Firestore under users/{userId}/{collection}/ structure.
 * Uses batch operations to respect the 500-document batch limit.
 */
async function writeToFirestore(
  db,
  userId,
  transformedData,
  collectionName,
  dryRun = false
) {
  const documents = transformedData;
  const batchSize = 500;
  let totalWritten = 0;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = db.batch();
    const batchDocs = documents.slice(i, i + batchSize);

    for (const doc of batchDocs) {
      const docRef = db
        .collection("users")
        .doc(userId)
        .collection(collectionName)
        .doc(doc.documentId);

      batch.set(docRef, doc.data, { merge: false });
    }

    if (!dryRun) {
      await batch.commit();
    }
    totalWritten += batchDocs.length;
  }

  return totalWritten;
}

/**
 * Main import function.
 */
async function main() {
  const args = minimist(process.argv.slice(2), {
    string: ["email", "key", "input"],
    boolean: ["dryRun"],
    default: {
      email: null,
      key: null,
      input: "./.firestore-export",
      dryRun: false,
    },
  });

  // Validate required arguments
  if (!args.email) {
    console.error(
      "Error: --email <email> is required. Provide a user email address."
    );
    process.exit(1);
  }

  // Get USER_ID_SEED from environment
  const userIdSeed = process.env.USER_ID_SEED
    ? Number.parseInt(process.env.USER_ID_SEED)
    : null;
  if (!userIdSeed) {
    console.error(
      "Error: USER_ID_SEED environment variable is not set or is not a valid number."
    );
    process.exit(1);
  }

  // Generate user ID
  let userId;
  try {
    userId = generateUserId(args.email, userIdSeed);
  } catch (err) {
    console.error(`Error generating user ID: ${err.message}`);
    process.exit(1);
  }

  console.log(`\nImporting data for email: ${args.email}`);
  console.log(`Generated user ID: ${userId}\n`);

  // Initialize Firebase Admin SDK
  try {
    if (args.key) {
      const serviceAccount = JSON.parse(
        readFileSync(path.resolve(args.key), "utf8")
      );
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const serviceAccount = JSON.parse(
        readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8")
      );
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (process.env.FIRESTORE_EMULATOR_HOST) {
      initializeApp();
    } else {
      throw new Error(
        "No Firebase credentials provided. Set GOOGLE_APPLICATION_CREDENTIALS or use --key <path>"
      );
    }
  } catch (err) {
    console.error(`Failed to initialize Firebase: ${err.message}`);
    process.exit(1);
  }

  const db = getFirestore();

  // Define collections to import
  const collections = [
    "transactions",
    "recurring-expenses",
    "accounts-history",
    "accounts",
  ];

  if (args.dryRun) {
    console.log("=== DRY RUN MODE ===\n");
    console.log("Preview of data that would be imported to Firestore:\n");
  }

  // Import each collection
  let totalDocuments = 0;
  const importResults = [];

  for (const collectionName of collections) {
    const exportFile = join(args.input, `${collectionName}.json`);

    try {
      console.log(`Importing collection: ${collectionName}`);

      // Read the export file
      const documents = readExportFile(exportFile);

      if (!Array.isArray(documents)) {
        throw new TypeError(
          `Expected array of documents, got ${typeof documents}`
        );
      }

      // Transform the data
      const transformedData = transformCollectionData(
        collectionName,
        documents
      );

      // Write to Firestore
      const count = await writeToFirestore(
        db,
        userId,
        transformedData,
        collectionName,
        args.dryRun
      );

      totalDocuments += count;
      importResults.push({ collection: collectionName, count });
      console.log(`  ✓ Imported ${count} documents\n`);
    } catch (err) {
      console.error(`  ✗ Error importing ${collectionName}: ${err.message}\n`);
      importResults.push({
        collection: collectionName,
        count: 0,
        error: err.message,
      });
    }
  }

  // Print summary
  console.log("=== IMPORT SUMMARY ===\n");
  for (const result of importResults) {
    if (result.error) {
      console.log(`${result.collection}: ERROR - ${result.error}`);
    } else {
      console.log(`${result.collection}: ${result.count} documents`);
    }
  }

  console.log(`\nTotal documents imported: ${totalDocuments}`);
  console.log(`User ID: ${userId}`);
  console.log(`Firestore path: users/${userId}/<collection>/<documentId>\n`);

  if (args.dryRun) {
    console.log("=== END DRY RUN ===\n");
  }

  // Cleanup
  await _app().delete();
}

try {
  await main();
} catch (err) {
  console.error("Fatal error:", err);
  process.exit(1);
}
