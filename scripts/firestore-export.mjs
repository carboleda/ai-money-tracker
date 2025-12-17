#!/usr/bin/env node

import { initializeApp, getApp as _app, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { writeFileSync, readFileSync } from "node:fs";
import path, { join } from "node:path";
import minimist from "minimist";
import { mkdirpSync } from "mkdirp";

/**
 * Convert Firestore types to JSON-safe representations.
 * Handles Timestamps, GeoPoints, DocumentReferences, and nested objects/arrays.
 */
function convertFirestoreValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "object") {
    // Firestore Timestamp has _seconds and _nanoseconds
    if (value._seconds !== undefined && value._nanoseconds !== undefined) {
      return new Date(
        value._seconds * 1000 + Math.round(value._nanoseconds / 1e6)
      ).toISOString();
    }

    // Firestore GeoPoint has latitude and longitude
    if (value.latitude !== undefined && value.longitude !== undefined) {
      return {
        _type: "GeoPoint",
        latitude: value.latitude,
        longitude: value.longitude,
      };
    }

    // Firestore DocumentReference has a path property and ref-like methods
    if (typeof value.path === "string" && typeof value.get === "function") {
      return value.path;
    }

    // Handle native JavaScript Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Recurse for maps/arrays
    const out = Array.isArray(value) ? [] : {};
    for (const k of Object.keys(value)) {
      out[k] = convertFirestoreValue(value[k]);
    }
    return out;
  }

  return value;
}

/**
 * Recursively export subcollections for a given document.
 */
async function exportSubcollections(
  docRef,
  db,
  maxDepth = 1,
  currentDepth = 0
) {
  if (currentDepth >= maxDepth) {
    return {};
  }

  const subcollections = {};
  try {
    const subcolls = await docRef.listCollections();
    for (const subcoll of subcolls) {
      const docs = await subcoll.get();
      const items = [];
      for (const doc of docs.docs) {
        const data = doc.data();
        const nested = await exportSubcollections(
          doc.ref,
          db,
          maxDepth,
          currentDepth + 1
        );
        items.push({
          ...convertFirestoreValue(data),
          _id: doc.id,
          ...nested,
        });
      }
      subcollections[subcoll.id] = items;
    }
  } catch (err) {
    console.warn(
      `Warning: could not list subcollections for ${docRef.path}: ${err.message}`
    );
  }
  return subcollections;
}

/**
 * Export a single collection to an array of documents.
 */
async function exportCollection(db, collectionName, options = {}) {
  const { recursive = false, maxDepth = 2 } = options;
  const docs = [];

  try {
    const collRef = db.collection(collectionName);
    const snapshot = await collRef.get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const converted = convertFirestoreValue(data);
      const item = {
        ...converted,
        _id: doc.id,
      };

      if (recursive) {
        const nested = await exportSubcollections(doc.ref, db, maxDepth);
        Object.assign(item, nested);
      }

      docs.push(item);
    }
  } catch (err) {
    throw new Error(
      `Failed to export collection "${collectionName}": ${err.message}`
    );
  }

  return docs;
}

/**
 * Write collection data to a single JSON file or per-document files.
 */
function writeCollectionData(
  outDir,
  collectionName,
  docs,
  perDocFiles = false
) {
  if (perDocFiles) {
    const collDir = join(outDir, collectionName);
    mkdirpSync(collDir);
    for (const doc of docs) {
      const docId = doc._id || "unknown";
      const docPath = join(collDir, `${docId}.json`);
      writeFileSync(docPath, JSON.stringify(doc, null, 2));
    }
  } else {
    const collPath = join(outDir, `${collectionName}.json`);
    writeFileSync(collPath, JSON.stringify(docs, null, 2));
  }
}

/**
 * Dry-run mode: print what would be exported without writing files.
 */
async function dryRun(db, collectionNames, options = {}) {
  console.log("\n=== DRY RUN MODE ===\n");
  for (const collName of collectionNames) {
    try {
      const docs = await exportCollection(db, collName, options);
      console.log(`Collection "${collName}": ${docs.length} documents`);
      if (docs.length > 0) {
        console.log(`  Sample doc keys: ${Object.keys(docs[0]).join(", ")}`);
      }
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }
  console.log("\n=== END DRY RUN ===\n");
}

/**
 * Main export function.
 */
async function main() {
  const args = minimist(process.argv.slice(2), {
    string: ["out", "collections", "key"],
    boolean: ["perDocFiles", "recursive", "dryRun"],
    default: {
      out: "./.firestore-export",
      collections: "transactions,recurring-expenses,accounts-history,accounts",
      perDocFiles: false,
      recursive: false,
      dryRun: false,
    },
  });

  // Parse collections from CLI
  const collectionNames = args.collections.split(",").map((c) => c.trim());

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
    } else {
      throw new Error(
        "No Firebase credentials provided. Set GOOGLE_APPLICATION_CREDENTIALS or use --key <path>"
      );
    }
  } catch (err) {
    console.error(`Failed to initialize Firebase: ${err.message}`, err);
    process.exit(1);
  }

  const db = getFirestore();

  // Dry-run mode
  if (args.dryRun) {
    await dryRun(db, collectionNames, {
      recursive: args.recursive,
    });
    await _app().delete();
    return;
  }

  // Create output directory
  mkdirpSync(args.out);

  // Export each collection
  console.log(`Exporting collections to ${args.out}...\n`);
  let totalDocs = 0;
  for (const collName of collectionNames) {
    try {
      console.log(`Exporting collection: ${collName}`);
      const docs = await exportCollection(db, collName, {
        recursive: args.recursive,
      });
      writeCollectionData(args.out, collName, docs, args.perDocFiles);
      totalDocs += docs.length;
      console.log(`  ✓ Exported ${docs.length} documents\n`);
    } catch (err) {
      console.error(`  ✗ ${err.message}\n`);
    }
  }

  console.log(`Export complete! Total documents: ${totalDocs}`);
  if (args.perDocFiles) {
    console.log(`Per-document files in ${args.out}/<collection>/`);
  } else {
    console.log(`Collection files in ${args.out}/`);
  }

  // Cleanup
  await _app().delete();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
