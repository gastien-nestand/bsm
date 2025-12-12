import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);

        const result = await sql`
      INSERT INTO users ("openId", email, password, name, role, "loginMethod")
      VALUES (
        ${crypto.randomUUID()},
        'admin@test.com',
        ${hashedPassword},
        'Admin User',
        'admin',
        'email'
      )
      ON CONFLICT (email) DO UPDATE
      SET 
        password = EXCLUDED.password,
        role = 'admin'
      RETURNING id, email, role
    `;

        console.log("✅ Admin user created/updated:");
        console.log(result[0]);
        console.log("\nCredentials:");
        console.log("Email: admin@test.com");
        console.log("Password: admin123");
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
    }

    process.exit(0);
}

createAdminUser();
