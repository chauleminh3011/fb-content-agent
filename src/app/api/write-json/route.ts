import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ResearchArticle, ContentFormat, PostLength, ContentLanguage } from "@/lib/types";
import { toplistPrompt } from "@/lib/prompts/toplist";
import { povPrompt } from "@/lib/prompts/pov";
import { caseStudyPrompt } from "@/lib/prompts/case-study";
import { howToPrompt } from "@/lib/prompts/how-to";
import { satirePropmt } from "@/lib/prompts/satire";
import { lifeObservationPrompt } from "@/lib/prompts/life-observation";
import { createOpenAIText, hasOpenAIConfig } from "@/lib/openai";
import { validateAgentRequest } from "@/lib/agent-auth";

export const maxDuration = 60;

type PromptFn = (
  a: ResearchArticle,
  l: PostLength,
  allArticles?: ResearchArticle[],
  postIndex?: number,
  totalPosts?: number,
  tone?: string,
  customTone?: string,
  language?: ContentLanguage,
  topic?: string
) => string;

const promptFns: Record<ContentFormat, PromptFn> = {
  satire: satirePropmt,
  "life-observation": lifeObservationPrompt,
  pov: povPrompt,
  toplist: toplistPrompt,
  "case-study": caseStudyPrompt,
  "how-to": howToPrompt,
};

export async function POST(req: NextRequest) {
  const authError = validateAgentRequest(req);
  if (authError) return authError;

  try {
    const {
      topic,
      article,
      format,
      length = "medium",
      allArticles,
      postIndex,
      totalPosts,
      tone = "mia-mai",
      customTone,
      language = "vn",
    } = (await req.json()) as {
      topic?: string;
      article: ResearchArticle;
      format: ContentFormat;
      length?: PostLength;
      allArticles?: ResearchArticle[];
      postIndex?: number;
      totalPosts?: number;
      tone?: string;
      customTone?: string;
      language?: ContentLanguage;
    };

    if (!article || !format) {
      return NextResponse.json({ error: "article and format required" }, { status: 400 });
    }

    const promptFn = promptFns[format];
    if (!promptFn) {
      return NextResponse.json({ error: `Unknown format: ${format}` }, { status: 400 });
    }

    const prompt = promptFn(article, length, allArticles, postIndex, totalPosts, tone, customTone, language, topic);
    const provider = process.env.AI_PROVIDER || (hasOpenAIConfig() ? "openai" : "anthropic");

    if (provider !== "openai" && provider !== "anthropic") {
      return NextResponse.json({ error: `Unknown AI_PROVIDER: ${provider}` }, { status: 400 });
    }

    if (provider === "openai") {
      if (!hasOpenAIConfig()) {
        return NextResponse.json(
          { error: "OpenAI credentials not configured. Set OPENAI_OAUTH_ACCESS_TOKEN or OPENAI_API_KEY." },
          { status: 500 }
        );
      }

      const content = await createOpenAIText(prompt);
      return NextResponse.json({ content, provider: "openai" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured. Set ANTHROPIC_API_KEY or switch AI_PROVIDER=openai." },
        { status: 500 }
      );
    }

    const client = new Anthropic();
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content[0]?.type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content, provider: "anthropic" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Write failed" },
      { status: 500 }
    );
  }
}
