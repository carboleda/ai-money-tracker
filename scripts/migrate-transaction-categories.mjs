#!/usr/bin/env node

import { initializeApp, getApp as _app, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import path from "node:path";
import minimist from "minimist";
import XXH from "xxhashjs";
import predefinedCategories from "../src/config/predefined-categories.json" with { type: "json" };

/*
Emulator:
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=ai-money-tracker USER_ID_SEED=0xc3f8ba97 \
node scripts/migrate-transaction-categories.mjs --email arbofercho@gmail.com --dryRun

GOOGLE_APPLICATION_CREDENTIALS=/Users/carboleda/Documents/SideProjects/Zolvent/ai-money-tracker-firebase-adminsdk-mfiq0-1ce5415d45.json \
GCLOUD_PROJECT=ai-money-tracker USER_ID_SEED=0xc3f8ba97 node scripts/migrate-transaction-categories.mjs --email arbofercho@gmail.com --dryRun
*/

// Old (Spanish) TransactionCategory enum values mapped to the new predefined-category refs.
// "Zeus" (a pet's name) intentionally maps to PETS.
const OLD_NAME_TO_REF = {
  Salario: "SALARY",
  "Pago TC": "CREDIT_CARD_PAYMENT",
  Alimentos: "FOOD",
  Mercado: "GROCERIES",
  Educación: "EDUCATION",
  Educacion: "EDUCATION",
  Inversión: "INVESTMENT",
  Inversion: "INVESTMENT",
  Salud: "HEALTH",
  Servicios: "UTILITIES",
  Transporte: "TRANSPORTATION",
  Vivienda: "HOUSING",
  Bebé: "CHILDCARE",
  Bebe: "CHILDCARE",
  Zeus: "PETS",
  Ocio: "ENTERTAINMENT",
  Impuesto: "TAXES",
  Retiros: "WITHDRAWALS",
  Vestuario: "CLOTHING",
  Otros: "OTHER",
  Intereses: "OTHER",
  Saldo: "OTHER",
};

const VALID_REFS = new Set(predefinedCategories.map((cat) => cat.ref));

const TARGET_COLLECTIONS = ["transactions", "recurring-expenses"];

/**
 * Generate a user ID from an email using XXHash64.
 * This matches the user ID generation logic in the application.
 */
function generateUserId(email, userIdSeed) {
  if (!userIdSeed) {
    throw new Error(
      "USER_ID_SEED environment variable is not set. Please set it before running this script.",
    );
  }
  return XXH.h64(email, userIdSeed).toString(32);
}

/**
 * Migrate the `category` field of every document in a single user's
 * collection from an old raw string to the correct predefined-category ref.
 */
async function migrateCollectionCategories(db, userId, collectionName, dryRun) {
  const collRef = db.collection("users").doc(userId).collection(collectionName);

  const snapshot = await collRef.get();

  const stats = {
    collection: collectionName,
    scanned: snapshot.size,
    migrated: 0,
    alreadyValid: 0,
    unmapped: [],
  };

  const updates = [];

  for (const doc of snapshot.docs) {
    const category = doc.data().category;

    if (!category || typeof category !== "string") {
      continue;
    }

    if (VALID_REFS.has(category)) {
      stats.alreadyValid += 1;
      continue;
    }

    const newRef = OLD_NAME_TO_REF[category];
    if (!newRef) {
      stats.unmapped.push({ id: doc.id, value: category });
      continue;
    }

    updates.push({ ref: doc.ref, id: doc.id, from: category, to: newRef });
  }

  const batchSize = 500;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = db.batch();
    const chunk = updates.slice(i, i + batchSize);

    for (const update of chunk) {
      console.log(
        `  [${collectionName}] ${update.id}: "${update.from}" -> "${update.to}"${
          dryRun ? " (dry run)" : ""
        }`,
      );
      if (!dryRun) {
        batch.update(update.ref, { category: update.to });
      }
    }

    if (!dryRun) {
      await batch.commit();
    }
    stats.migrated += chunk.length;
  }

  return stats;
}

function printSummary(allStats) {
  console.log("\n=== MIGRATION SUMMARY ===\n");
  for (const stats of allStats) {
    console.log(`Collection: ${stats.collection}`);
    console.log(`  Scanned:       ${stats.scanned}`);
    console.log(`  Migrated:      ${stats.migrated}`);
    console.log(`  Already valid: ${stats.alreadyValid}`);
    console.log(`  Unmapped:      ${stats.unmapped.length}`);
    console.log("");
  }

  const allUnmapped = allStats.flatMap((stats) =>
    stats.unmapped.map((u) => ({ collection: stats.collection, ...u })),
  );
  if (allUnmapped.length > 0) {
    console.log("Unmapped category values (left untouched):");
    for (const u of allUnmapped) {
      console.log(`  [${u.collection}] ${u.id}: "${u.value}"`);
    }
    console.log("");
  }
}

async function main() {
  const args = minimist(process.argv.slice(2), {
    string: ["email", "userId", "key", "suffix"],
    boolean: ["dryRun"],
    default: {
      email: null,
      userId: null,
      key: null,
      suffix: null,
      dryRun: false,
    },
  });

  if (!args.email && !args.userId) {
    console.error(
      "Error: either --email <email> or --userId <userId> is required.",
    );
    process.exit(1);
  }

  let userId;
  if (args.userId) {
    userId = args.userId;
    console.log(`\nMigrating categories for userId: ${userId}`);
  } else {
    const userIdSeed = process.env.USER_ID_SEED
      ? Number.parseInt(process.env.USER_ID_SEED)
      : null;
    if (!userIdSeed) {
      console.error(
        "Error: USER_ID_SEED environment variable is not set or is not a valid number.",
      );
      process.exit(1);
    }

    try {
      userId = generateUserId(args.email, userIdSeed);
    } catch (err) {
      console.error(`Error generating user ID: ${err.message}`);
      process.exit(1);
    }

    console.log(`\nMigrating categories for email: ${args.email}`);
    console.log(`Generated user ID: ${userId}`);
  }
  if (args.dryRun) {
    console.log("Mode: DRY RUN (no writes will be committed)");
  }
  console.log("");

  try {
    if (args.key) {
      const serviceAccount = JSON.parse(
        readFileSync(path.resolve(args.key), "utf8"),
      );
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const serviceAccount = JSON.parse(
        readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"),
      );
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (process.env.FIRESTORE_EMULATOR_HOST) {
      initializeApp();
    } else {
      throw new Error(
        "No Firebase credentials provided. Set GOOGLE_APPLICATION_CREDENTIALS or use --key <path>",
      );
    }
  } catch (err) {
    console.error(`Failed to initialize Firebase: ${err.message}`);
    process.exit(1);
  }

  const db = getFirestore();

  const collectionNames = args.suffix
    ? TARGET_COLLECTIONS.map((name) => `${name}-${args.suffix}`)
    : TARGET_COLLECTIONS;

  const allStats = [];
  for (const collectionName of collectionNames) {
    console.log(`Processing collection: ${collectionName}`);
    try {
      const stats = await migrateCollectionCategories(
        db,
        userId,
        collectionName,
        args.dryRun,
      );
      allStats.push(stats);
    } catch (err) {
      console.error(`  ✗ Error processing ${collectionName}: ${err.message}`);
      allStats.push({
        collection: collectionName,
        scanned: 0,
        migrated: 0,
        alreadyValid: 0,
        unmapped: [],
      });
    }
    console.log("");
  }

  printSummary(allStats);

  await _app().delete();
}

try {
  await main();
} catch (err) {
  console.error("Fatal error:", err);
  process.exit(1);
}
