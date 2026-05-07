import { NextRequest, NextResponse } from "next/server";
import type { ResearchArticle, ContentFormat, ContentLanguage, PostLength, ResearchSource } from "@/lib/types";
import { validateAgentRequest } from "@/lib/agent-auth";

export const maxDuration = 300;

interface AgentRunRequest {
  topic: string;
  source?: ResearchSource;
  format?: ContentFormat;
  length?: PostLength;
  tone?: string;
  customTone?: string;
  language?: ContentLanguage;
  outputCount?: number;
  sourceCount?: number;
  includeImages?: boolean;
}

export async function POST(req: NextRequest) {
  const authError = validateAgentRequest(req);
  if (authError) return authError;

  try {
    const body = (await req.json()) as AgentRunRequest;
    const topic = body.topic?.trim();
    if (!topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const token = process.env.PIPELINE_AGENT_TOKEN;
    const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (token) authHeaders.Authorization = `Bearer ${token}`;

    const researchRes = await fetch(`${origin}/api/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, source: body.source || "news" }),
    });
    const researchJson = await researchRes.json();
    if (!researchRes.ok) {
      return NextResponse.json(researchJson, { status: researchRes.status });
    }

    const articles = (researchJson.articles || []) as ResearchArticle[];
    const sourceCount = Math.max(1, Math.min(body.sourceCount || 6, articles.length));
    const selected = articles.slice(0, sourceCount).map((article) => ({ ...article, selected: true }));
    const outputCount = Math.max(1, Math.min(body.outputCount || 1, selected.length));
    const posts = [];

    for (let i = 0; i < outputCount; i++) {
      const article = selected[i];
      const writeRes = await fetch(`${origin}/api/write-json`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          article,
          format: body.format || "satire",
          length: body.length || "medium",
          allArticles: selected,
          postIndex: i,
          totalPosts: outputCount,
          tone: body.tone || "satire",
          customTone: body.customTone,
          language: body.language || "vn",
        }),
      });
      const writeJson = await writeRes.json();
      if (!writeRes.ok) {
        return NextResponse.json(writeJson, { status: writeRes.status });
      }

      let image = null;
      if (body.includeImages !== false) {
        const imageRes = await fetch(`${origin}/api/image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postContent: writeJson.content,
            title: article.title,
            format: body.format || "satire",
          }),
        });
        const imageJson = await imageRes.json();
        image = imageRes.ok ? imageJson.image || imageJson.infographic || null : { error: imageJson.error || "Image failed" };
      }

      posts.push({
        id: `agent-post-${Date.now()}-${i}`,
        article,
        format: body.format || "satire",
        content: writeJson.content,
        provider: writeJson.provider,
        image,
      });
    }

    return NextResponse.json({
      topic,
      source: body.source || "news",
      selectedArticles: selected,
      posts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Agent run failed" },
      { status: 500 }
    );
  }
}
