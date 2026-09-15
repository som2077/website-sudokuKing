import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Load schema.sql
const schemaPath = path.join(projectRoot, "supabase", "schema.sql");
const schemaSql = fs.readFileSync(schemaPath, "utf-8");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jerfutffhhvgzrwrxdmf.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmZ1dGZmaGh2Z3pyd3J4ZG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNDYzOTEsImV4cCI6MjEwNDcyMjM5MX0.xApJ3NiCtGZVQPizQTJtfWbf0DjsxQ6beFUCNqtkv0s";

console.log("\n=======================================================");
console.log("   SUDOKU KING - SUPABASE SETUP & VERIFICATION");
console.log("=======================================================\n");

async function checkStatus() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log("Checking table existence via Supabase REST API...");

  const [leaderboardRes, dailyRes, matchesRes] = await Promise.all([
    supabase.from("versus_leaderboard").select("id").limit(1),
    supabase.from("daily_leaderboard").select("id").limit(1),
    supabase.from("versus_matches").select("id").limit(1),
  ]);

  const hasLeaderboard = !leaderboardRes.error;
  const hasDaily = !dailyRes.error;
  const hasMatches = !matchesRes.error;

  console.log(`- versus_leaderboard: ${hasLeaderboard ? "✅ READY" : "❌ " + leaderboardRes.error?.message}`);
  console.log(`- versus_matches:     ${hasMatches ? "✅ READY" : "❌ " + matchesRes.error?.message}`);
  console.log(`- daily_leaderboard:  ${hasDaily ? "✅ READY" : "❌ " + dailyRes.error?.message}`);

  if (hasLeaderboard && hasMatches && hasDaily) {
    console.log("\n🎉 All required tables are created and accessible via Supabase Client!\n");
    return true;
  }
  return false;
}

async function runPgMigration(connString) {
  console.log("\nAttempting direct PostgreSQL migration...");
  const client = new pg.Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully. Executing schema.sql...");
    await client.query(schemaSql);
    console.log("✅ Database schema and seed data executed successfully!");
    await client.end();
    return true;
  } catch (err) {
    console.error("❌ Direct PostgreSQL execution failed:", err.message);
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  const isReady = await checkStatus();
  if (isReady) return;

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const dbPassword = process.env.POSTGRES_PASSWORD;

  let connString = dbUrl;
  if (!connString && dbPassword && dbPassword !== "[SENSITIVE]") {
    connString = `postgres://postgres.jerfutffhhvgzrwrxdmf:${encodeURIComponent(dbPassword)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;
  }

  if (connString && !connString.includes("[SENSITIVE]")) {
    const success = await runPgMigration(connString);
    if (success) {
      await checkStatus();
      return;
    }
  }

  console.log("\n-------------------------------------------------------");
  console.log("📋 SUPABASE DASHBOARD SETUP INSTRUCTIONS:");
  console.log("-------------------------------------------------------");
  console.log("Follow these 2 simple steps to execute the SQL in Supabase:");
  console.log("");
  console.log("1. Open the Supabase SQL Editor:");
  console.log("   👉 https://supabase.com/dashboard/project/jerfutffhhvgzrwrxdmf/sql/new");
  console.log("");
  console.log("2. Copy all content from 'supabase/schema.sql' and click 'RUN'.");
  console.log("   (Or provide your DB password / connection string to this script):");
  console.log("   $ DATABASE_URL='postgres://postgres:[YOUR_PASSWORD]@...' npm run db:setup");
  console.log("-------------------------------------------------------\n");
}

main().catch(console.error);
