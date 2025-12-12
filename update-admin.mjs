import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function updateUserToAdmin() {
    try {
        const result = await sql`
      UPDATE users 
      SET role = 'admin'
      WHERE email = 'admin@test.com'
      RETURNING id, email, name, role
    `;

        if (result.length > 0) {
            console.log("✅ User updated to admin successfully:");
            console.log(JSON.stringify(result[0], null, 2));
        } else {
            console.log("❌ User with email admin@test.com not found");
        }
    } catch (error) {
        console.error("❌ Error updating user:", error);
    }
}

updateUserToAdmin();
