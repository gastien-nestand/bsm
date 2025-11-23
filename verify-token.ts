import { sdk } from "./server/_core/sdk";
import "dotenv/config";
import * as fs from "fs";

async function verifyToken() {
    try {
        const token = fs.readFileSync("token-final.txt", "utf8");
        console.log("Verifying token...");
        const session = await sdk.verifySession(token);
        if (session) {
            console.log("✅ Token is VALID:", session);
        } else {
            console.error("❌ Token is INVALID");
        }
    } catch (error) {
        console.error("Error verifying token:", error);
    }
}

verifyToken();
