import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const POST = auth(async (req: any) => {
  try {
    const session = req.auth;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Must be an image." }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const s3Key = `seo-compass/users/${userId}/logo-${Date.now()}.${fileExtension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Save S3 key to user DB
    await db.update(users).set({ whiteLabelLogo: s3Key }).where(eq(users.id, userId));

    return NextResponse.json({ success: true, s3Key });
  } catch (error: any) {
    console.error("Logo upload error:", error);
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
  }
});

export const GET = auth(async (req: any) => {
  try {
    const session = req.auth;
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    
    // Get S3 key from user DB
    const userDb = await db.select({ whiteLabelLogo: users.whiteLabelLogo }).from(users).where(eq(users.id, userId)).limit(1);
    
    if (userDb.length === 0 || !userDb[0].whiteLabelLogo) {
      return new Response("No logo found", { status: 404 });
    }

    const s3Key = userDb[0].whiteLabelLogo;

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: s3Key,
    });

    const s3Response = await s3.send(command);
    
    return new Response(s3Response.Body as any, {
      headers: {
        "Content-Type": s3Response.ContentType || "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    });

  } catch (error: any) {
    console.error("Logo fetch error:", error);
    return new Response("Failed to fetch logo", { status: 500 });
  }
});
