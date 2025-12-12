import { sdk } from "./server/_core/sdk";
import "dotenv/config";
import * as fs from "fs";

async function generateToken() {
    try {
        const token = await sdk.createSessionToken("admin-user-id", { name: "Admin User" });
        fs.writeFileSync("token-final.txt", token);
        console.log("Token written to token-final.txt");
    } catch (error) {
        console.error("Error generating token:", error);
    }
}

generateToken();
