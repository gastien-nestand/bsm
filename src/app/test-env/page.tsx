// Test script to verify R2 environment variables
console.log("=== R2 Environment Variables Test ===");
console.log("R2_ACCOUNT_ID:", process.env.R2_ACCOUNT_ID || "❌ NOT SET");
console.log("R2_ACCESS_KEY_ID:", process.env.R2_ACCESS_KEY_ID ? "✅ SET" : "❌ NOT SET");
console.log("R2_SECRET_ACCESS_KEY:", process.env.R2_SECRET_ACCESS_KEY ? "✅ SET" : "❌ NOT SET");
console.log("R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME || "❌ NOT SET");
console.log("R2_PUBLIC_URL:", process.env.R2_PUBLIC_URL || "❌ NOT SET");
console.log("=====================================");

export default function TestEnv() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
            <div className="space-y-2">
                <p>R2_ACCOUNT_ID: {process.env.R2_ACCOUNT_ID || "❌ NOT SET"}</p>
                <p>R2_BUCKET_NAME: {process.env.R2_BUCKET_NAME || "❌ NOT SET"}</p>
                <p>R2_PUBLIC_URL: {process.env.R2_PUBLIC_URL || "❌ NOT SET"}</p>
                <p>R2_ACCESS_KEY_ID: {process.env.R2_ACCESS_KEY_ID ? "✅ SET" : "❌ NOT SET"}</p>
                <p>R2_SECRET_ACCESS_KEY: {process.env.R2_SECRET_ACCESS_KEY ? "✅ SET" : "❌ NOT SET"}</p>
            </div>
        </div>
    );
}
