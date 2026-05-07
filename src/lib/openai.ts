const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_TEXT_MODEL = "gpt-5";
const DEFAULT_IMAGE_MODEL = "gpt-image-2";
const DEFAULT_IMAGE_SIZE = "1024x1024";

const IMAGE_MODEL_ALIASES: Record<string, string> = {
  "chatgtp-image-2": DEFAULT_IMAGE_MODEL,
  "chatgpt-image-2": DEFAULT_IMAGE_MODEL,
};

interface OpenAIErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

export interface OpenAIImageResult {
  b64Json?: string;
  url?: string;
  mimeType: string;
  model: string;
  requestedModel: string;
}

export function hasOpenAIConfig() {
  return hasOpenAITextConfig() || hasOpenAIImageConfig();
}

export function getOpenAIToken() {
  return process.env.OPENAI_OAUTH_ACCESS_TOKEN || process.env.OPENAI_API_KEY || "";
}

export function hasOpenAITextConfig() {
  return !!getOpenAITextToken();
}

export function hasOpenAIImageConfig() {
  return !!getOpenAIImageToken();
}

function getOpenAITextToken() {
  return process.env.OPENAI_TEXT_OAUTH_ACCESS_TOKEN || process.env.OPENAI_TEXT_API_KEY || getOpenAIToken();
}

function getOpenAIImageToken() {
  const explicitImageToken = process.env.OPENAI_IMAGE_OAUTH_ACCESS_TOKEN || process.env.OPENAI_IMAGE_API_KEY;
  if (explicitImageToken) return explicitImageToken;

  const textUsesDedicatedProvider = !!(
    process.env.OPENAI_TEXT_BASE_URL ||
    process.env.OPENAI_TEXT_API_KEY ||
    process.env.OPENAI_TEXT_OAUTH_ACCESS_TOKEN ||
    process.env.OPENAI_TEXT_REQUEST_FORMAT
  );

  return textUsesDedicatedProvider ? "" : getOpenAIToken();
}

export function getOpenAITextModel() {
  return process.env.OPENAI_TEXT_MODEL || DEFAULT_TEXT_MODEL;
}

export function getOpenAIImageModel() {
  const requested = process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
  return {
    requested,
    resolved: IMAGE_MODEL_ALIASES[requested] || requested,
  };
}

export function getOpenAITextBaseUrl() {
  return (process.env.OPENAI_TEXT_BASE_URL || process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/+$/, "");
}

export function getOpenAIImageBaseUrl() {
  return (process.env.OPENAI_IMAGE_BASE_URL || process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/+$/, "");
}

function getOpenAITextRequestFormat() {
  const configured = process.env.OPENAI_TEXT_REQUEST_FORMAT;
  if (configured) return configured;

  return /localhost:18790|127\.0\.0\.1:18790|host\.docker\.internal:18790/.test(getOpenAITextBaseUrl())
    ? "goclaw"
    : "openai";
}

async function parseOpenAIError(res: Response) {
  const text = await res.text();
  if (!text) return `OpenAI request failed: ${res.status}`;

  try {
    const body = JSON.parse(text) as OpenAIErrorBody;
    return body.error?.message || `OpenAI request failed: ${res.status}`;
  } catch {
    return `OpenAI request failed: ${res.status} - ${text.slice(0, 300)}`;
  }
}

function openAIHeaders(token: string, label: string) {
  if (!token) {
    throw new Error(`${label} credentials not configured.`);
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function openAITextHeaders() {
  return openAIHeaders(getOpenAITextToken(), "OpenAI text");
}

function openAIImageHeaders() {
  return openAIHeaders(getOpenAIImageToken(), "OpenAI image");
}

function textRequestBody(prompt: string, stream: boolean) {
  if (getOpenAITextRequestFormat() === "goclaw") {
    return {
      model: getOpenAITextModel(),
      messages: [{ role: "user", content: prompt }],
      stream,
      max_tokens: 4096,
    };
  }

  return {
    model: getOpenAITextModel(),
    input: prompt,
    stream,
    max_output_tokens: 4096,
  };
}

export async function* streamOpenAIText(prompt: string): AsyncGenerator<string> {
  const res = await fetch(`${getOpenAITextBaseUrl()}/responses`, {
    method: "POST",
    headers: openAITextHeaders(),
    body: JSON.stringify(textRequestBody(prompt, true)),
  });

  if (!res.ok) {
    throw new Error(await parseOpenAIError(res));
  }

  if (!res.body) {
    throw new Error("OpenAI stream response has no body.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";

    for (const chunk of chunks) {
      const dataLines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice(6).trim());

      for (const data of dataLines) {
        if (!data || data === "[DONE]") continue;

        const event = JSON.parse(data) as {
          type?: string;
          delta?: string | { content?: string };
          error?: { message?: string };
        };

        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          yield event.delta;
        }

        if (event.type === "response.delta") {
          if (typeof event.delta === "string") {
            yield event.delta;
          } else if (typeof event.delta?.content === "string") {
            yield event.delta.content;
          }
        }

        if (event.type === "error") {
          throw new Error(event.error?.message || "OpenAI stream failed.");
        }
      }
    }
  }
}

export async function createOpenAIText(prompt: string): Promise<string> {
  const res = await fetch(`${getOpenAITextBaseUrl()}/responses`, {
    method: "POST",
    headers: openAITextHeaders(),
    body: JSON.stringify(textRequestBody(prompt, false)),
  });

  if (!res.ok) {
    throw new Error(await parseOpenAIError(res));
  }

  const body = (await res.json()) as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (body.output_text) return body.output_text;

  const text = body.output
    ?.flatMap((item) => item.content || [])
    .filter((content) => (content.type === "output_text" || content.type === "text") && content.text)
    .map((content) => content.text)
    .join("");

  if (!text) {
    throw new Error("OpenAI response did not include output text.");
  }

  return text;
}

export async function generateOpenAIImage(prompt: string): Promise<OpenAIImageResult> {
  const { requested, resolved } = getOpenAIImageModel();
  const res = await fetch(`${getOpenAIImageBaseUrl()}/images/generations`, {
    method: "POST",
    headers: openAIImageHeaders(),
    body: JSON.stringify({
      model: resolved,
      prompt,
      size: process.env.OPENAI_IMAGE_SIZE || DEFAULT_IMAGE_SIZE,
      quality: process.env.OPENAI_IMAGE_QUALITY || "auto",
      n: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(await parseOpenAIError(res));
  }

  const body = (await res.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const image = body.data?.[0];
  if (!image?.b64_json && !image?.url) {
    throw new Error("OpenAI image response did not include image data.");
  }

  return {
    b64Json: image.b64_json,
    url: image.url,
    mimeType: "image/png",
    model: resolved,
    requestedModel: requested,
  };
}
