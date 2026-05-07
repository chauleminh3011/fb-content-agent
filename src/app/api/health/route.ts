import { NextResponse } from "next/server";
import {
  getOpenAIImageBaseUrl,
  getOpenAIImageModel,
  getOpenAITextBaseUrl,
  getOpenAITextModel,
  hasOpenAIConfig,
  hasOpenAIImageConfig,
  hasOpenAITextConfig,
} from "@/lib/openai";
import { hasChatGPTOAuthImageConfig } from "@/lib/chatgpt-image";

export function GET() {
  const imageModel = getOpenAIImageModel();
  const chatgptOAuth = hasChatGPTOAuthImageConfig();

  return NextResponse.json({
    ok: true,
    service: "fb-content-pipeline",
    provider: process.env.AI_PROVIDER || (hasOpenAIConfig() ? "openai" : "anthropic"),
    openaiConfigured: hasOpenAIConfig(),
    openaiTextConfigured: hasOpenAITextConfig(),
    openaiImageConfigured: hasOpenAIImageConfig(),
    chatgptOAuthImageConfigured: chatgptOAuth,
    imageProvider: chatgptOAuth ? "chatgpt_oauth" : hasOpenAIImageConfig() ? "openai" : "anthropic_satori",
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    braveConfigured: !!process.env.BRAVE_SEARCH_API_KEY,
    agentAuthEnabled: !!process.env.PIPELINE_AGENT_TOKEN,
    textModel: getOpenAITextModel(),
    textBaseUrl: getOpenAITextBaseUrl(),
    imageModel: chatgptOAuth ? "gpt-image-2" : imageModel.resolved,
    requestedImageModel: imageModel.requested,
    imageBaseUrl: getOpenAIImageBaseUrl(),
  });
}
