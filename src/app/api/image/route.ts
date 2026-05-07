import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateOpenAIImage, hasOpenAIConfig } from "@/lib/openai";
import { generateChatGPTOAuthImage, hasChatGPTOAuthImageConfig } from "@/lib/chatgpt-image";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { postContent, title, format } = await req.json();

    if (!postContent) {
      return NextResponse.json(
        { error: "postContent is required" },
        { status: 400 }
      );
    }

    const imagePrompt = `Create a polished square Facebook image for this post.

Canvas:
- Square composition for Facebook feed.
- Bold editorial visual style, high contrast, modern Vietnamese social commentary mood.
- Use the post insight as the core concept.
- If adding text, keep it short, large, readable, and in Vietnamese when the post is Vietnamese.
- Avoid tiny paragraphs, clutter, fake UI, fake logos, or misleading screenshots.
- Do not include Facebook branding.

Title/context:
${title || ""}

Format:
${format || "satire"}

Post:
${postContent}`;

    // Priority 1: ChatGPT OAuth (gpt-image-2 via ChatGPT Plus subscription, no API key needed)
    if (hasChatGPTOAuthImageConfig()) {
      try {
        const image = await generateChatGPTOAuthImage(imagePrompt);
        return NextResponse.json({ image });
      } catch (error) {
        console.error("chatgpt_oauth image failed, falling back:", error instanceof Error ? error.message : error);
      }
    }

    let openAIImageError: string | null = null;

    // Priority 2: OpenAI Platform API key (if configured)
    if (hasOpenAIConfig()) {
      try {
        const image = await generateOpenAIImage(imagePrompt);
        return NextResponse.json({ image });
      } catch (error) {
        openAIImageError = error instanceof Error ? error.message : "OpenAI image generation failed";
        if (!process.env.ANTHROPIC_API_KEY) {
          return NextResponse.json(
            { error: openAIImageError },
            { status: 500 }
          );
        }
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI image credentials not configured. Set OPENAI_OAUTH_ACCESS_TOKEN or OPENAI_API_KEY. For Satori fallback, set ANTHROPIC_API_KEY." },
        { status: 500 }
      );
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Bạn là designer infographic cho Facebook. Tạo structured data để render một ảnh infographic ấn tượng.

## Design System
- Background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)
- Primary color: #e94560 (đỏ-hồng nổi bật)
- Accent: #0f3460 (xanh navy đậm)
- Card background: rgba(15, 52, 96, 0.4) với border rgba(233, 69, 96, 0.25)
- Text heading: #ffffff
- Text body: #a8b2d8
- Text highlight: #e94560
- Border radius: 16px
- Size: 1080x1080px (Facebook Square)
- Style: Tối giản, tương phản cao, chữ lớn, impactful

## Nội dung bài viết
${postContent}

## Tiêu đề (cho header)
${title || ""}

## Format
${format || "satire"}

## Hướng dẫn
Trích xuất các điểm dữ liệu/insight chính từ bài viết và trả về JSON để render.

Chú ý:
- Với "satire" hoặc "life-observation": dùng style "quote" — highlight 1-2 câu mỉa mai/sâu sắc nhất, và 2-3 điểm quan sát
- Với "toplist": dùng style "grid" hoặc "list", 4-8 items
- Với "pov": dùng style "statement" — câu tuyên bố lớn + 2-3 backing points
- Với "case-study": dùng style "list", 3-5 items narrative arc
- Với "how-to": dùng style "steps", 3-6 bước

Trả về ONLY valid JSON, không markdown:
{
  "headline": "Câu tiêu đề ngắn gọn, impactful (tối đa 60 ký tự)",
  "subheadline": "Một dòng context (tối đa 80 ký tự)",
  "quote": "Câu mỉa mai/sâu sắc nhất từ bài (nếu format là satire/life-observation, tối đa 120 ký tự)",
  "items": [
    {
      "label": "Tên mục",
      "value": "Số liệu/chi tiết chính",
      "detail": "Context thêm (optional)"
    }
  ],
  "footer": "Câu kết hoặc tagline (tối đa 80 ký tự)",
  "style": "quote" | "grid" | "list" | "statement" | "steps"
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Try extracting JSON
    let infographicData;
    const greedyMatch = text.match(/\{[\s\S]*\}/);
    if (!greedyMatch) {
      return NextResponse.json(
        { error: "Failed to generate infographic data" },
        { status: 500 }
      );
    }
    try {
      infographicData = JSON.parse(greedyMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse infographic JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json({ infographic: infographicData });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
