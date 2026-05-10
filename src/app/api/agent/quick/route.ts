import { NextRequest } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export const maxDuration = 300;

const USAGE = [
  "FB Content Pipeline — Quick API (GET)",
  "",
  "Usage: /api/agent/quick?topic=YOUR_TOPIC",
  "",
  "Params:",
  "  topic   (required) Research topic",
  "  format  satire|life-observation|pov|toplist|case-study|how-to (default: satire)",
  "  length  short|medium|long (default: medium)",
  "  tone    mia-mai|chiem-nghiem|thang-than|ke-chuyen|phan-tich (default: mia-mai)",
  "  source  news|web (default: news)",
  "  sources Number of research sources 1-6 (default: 3)",
].join("\n");

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const topic = searchParams.get("topic")?.trim();

  if (!topic) {
    return new Response(USAGE, {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const format = searchParams.get("format") || "satire";
  const length = searchParams.get("length") || "medium";
  const tone = searchParams.get("tone") || "mia-mai";
  const source = searchParams.get("source") || "news";
  const sourceCount = parseInt(searchParams.get("sources") || "3", 10);

  const origin = new URL(req.url).origin;

  try {
    const res = await fetch(`${origin}/api/agent/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        format,
        length,
        tone,
        source,
        sourceCount,
        outputCount: 1,
        includeImages: false,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(`ERROR: ${data.error || "Pipeline failed"}`, {
        status: res.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const post = data.posts?.[0];
    if (!post) {
      return new Response("ERROR: No post generated", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Save post data for later image generation
    const postId = `fb-${Date.now()}`;
    const postsDir = join(process.cwd(), "public", "generated", "posts");
    mkdirSync(postsDir, { recursive: true });
    writeFileSync(
      join(postsDir, `${postId}.json`),
      JSON.stringify({
        content: post.content,
        title: post.article?.title || "",
        format,
      })
    );

    const lines: string[] = [];
    lines.push("=== FB CONTENT ===");
    lines.push(`Topic: ${topic}`);
    lines.push(`Format: ${format} | Length: ${length} | Tone: ${tone}`);
    lines.push(`Source: ${post.article?.title || "N/A"}`);
    lines.push(`URL: ${post.article?.url || "N/A"}`);
    lines.push(`PostID: ${postId}`);
    lines.push("");
    lines.push("--- POST ---");
    lines.push(post.content);
    lines.push("--- END POST ---");
    lines.push("");
    lines.push("=== END ===");

    return new Response(lines.join("\n"), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    return new Response(
      `ERROR: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
