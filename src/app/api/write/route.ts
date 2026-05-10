import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ResearchArticle, ContentFormat, PostLength, ContentLanguage } from "@/lib/types";
import { toplistPrompt } from "@/lib/prompts/toplist";
import { povPrompt } from "@/lib/prompts/pov";
import { caseStudyPrompt } from "@/lib/prompts/case-study";
import { howToPrompt } from "@/lib/prompts/how-to";
import { satirePropmt } from "@/lib/prompts/satire";
import { lifeObservationPrompt } from "@/lib/prompts/life-observation";
import { hasOpenAIConfig, streamOpenAIText } from "@/lib/openai";

export const maxDuration = 60;

type PromptFn = (
  a: ResearchArticle,
  l: PostLength,
  allArticles?: ResearchArticle[],
  postIndex?: number,
  totalPosts?: number,
  tone?: string,
  customTone?: string,
  language?: ContentLanguage
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
  try {
    const {
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
      return new Response(JSON.stringify({ error: "article and format required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const promptFn = promptFns[format];
    if (!promptFn) {
      return new Response(JSON.stringify({ error: `Unknown format: ${format}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = promptFn(article, length, allArticles, postIndex, totalPosts, tone, customTone, language);

    const provider =
      process.env.AI_PROVIDER || (hasOpenAIConfig() ? "openai" : "anthropic");

    if (provider !== "openai" && provider !== "anthropic") {
      return new Response(JSON.stringify({ error: `Unknown AI_PROVIDER: ${provider}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (provider === "openai" && !hasOpenAIConfig()) {
      return new Response(
        JSON.stringify({ error: "OpenAI credentials not configured. Set OPENAI_OAUTH_ACCESS_TOKEN or OPENAI_API_KEY." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured. Set ANTHROPIC_API_KEY or switch AI_PROVIDER=openai." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          if (provider === "openai") {
            for await (const text of streamOpenAIText(prompt)) {
              const data = JSON.stringify({ text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          } else {
            const client = new Anthropic();
            const stream = await client.messages.stream({
              model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
              max_tokens: 4096,
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
            });

            for await (const event of stream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                const data = JSON.stringify({ text: event.delta.text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Write failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
