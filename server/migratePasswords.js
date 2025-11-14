/**
 * Password Migration Script
 * -------------------------
 * This script migrates all plaintext passwords in the `users` table
 * to bcrypt-hashed passwords.
 *
 * RUN ONE TIME:
 *   node scripts/migratePasswords.js
 *
 * Make sure your DB backup is taken before running!
 */

const pool = require("./config/db");
const bcrypt = require("bcryptjs");

async function migratePasswords() {
  console.log("🔄 Starting password migration...");

  try {
    // Fetch all users with existing passwords
    const [users] = await pool.query(
      "SELECT user_id, password FROM users"
    );

    if (!users.length) {
      console.log("No users found in database.");
      process.exit(0);
    }

    let updated = 0;
    let alreadyHashed = 0;

    for (const user of users) {
      const { user_id, password } = user;

      // Skip if already hashed (bcrypt hashes begin with $2)
      if (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$")) {
        alreadyHashed++;
        continue;
      }

      // Hash plaintext password
      const hashed = await bcrypt.hash(password, 10);

      // Update DB
      await pool.query(
        "UPDATE users SET password = ? WHERE user_id = ?",
        [hashed, user_id]
      );

      updated++;
      console.log(`✔ Password hashed for user: ${user_id}`);
    }

    console.log("\n🎉 Migration Completed!");
    console.log(`🔐 Passwords updated: ${updated}`);
    console.log(`⏭ Already hashed (skipped): ${alreadyHashed}`);
    console.log(`👥 Total users: ${users.length}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migratePasswords();
