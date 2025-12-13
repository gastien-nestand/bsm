import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 });
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "Image must be less than 5MB" }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `products/${timestamp}-${sanitizedName}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to R2
        await r2Client.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: filename,
                Body: buffer,
                ContentType: file.type,
            })
        );

        // Return public URL
        const imageUrl = `${R2_PUBLIC_URL}/${filename}`;

        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error("Upload error details:", error);
        console.error("R2 Config:", {
            bucket: R2_BUCKET,
            publicUrl: R2_PUBLIC_URL,
            hasAccountId: !!process.env.R2_ACCOUNT_ID,
            hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
            hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
        });
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        );
    }
}
