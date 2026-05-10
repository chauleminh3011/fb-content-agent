import { NextRequest } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim();

  if (!id) {
    return new Response(
      "Usage: /api/agent/quick-image?id=POST_ID\nGet PostID from /api/agent/quick response.",
      { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  // Check if image already exists
  const genDir = join(process.cwd(), "public", "generated");
  const imagePath = join(genDir, `${id}.png`);
  if (existsSync(imagePath)) {
    return new Response(
      `=== IMAGE READY ===\nPath: /generated/${id}.png\nStatus: already exists\n=== END ===`,
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  // Read saved post data
  const postFile = join(genDir, "posts", `${id}.json`);
  if (!existsSync(postFile)) {
    return new Response(`ERROR: PostID "${id}" not found. Generate text first via /api/agent/quick.`, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const postData = JSON.parse(readFileSync(postFile, "utf-8"));
  const origin = new URL(req.url).origin;

  try {
    const imageRes = await fetch(`${origin}/api/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postContent: postData.content,
        title: postData.title,
        format: postData.format,
      }),
    });

    const imageJson = await imageRes.json();

    if (imageJson.image?.b64Json) {
      mkdirSync(genDir, { recursive: true });
      writeFileSync(imagePath, Buffer.from(imageJson.image.b64Json, "base64"));
      return new Response(
        [
          "=== IMAGE READY ===",
          `Path: /generated/${id}.png`,
          `Model: ${imageJson.image.model || "unknown"}`,
          "=== END ===",
        ].join("\n"),
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }

    return new Response(
      `ERROR: ${imageJson.error || "Image generation failed"}`,
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  } catch (error) {
    return new Response(
      `ERROR: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
