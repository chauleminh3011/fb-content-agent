/**
 * ChatGPT OAuth image generation via media-tools skill.
 * Spawns create_image.py as subprocess — uses ~/.codex/auth.json for auth,
 * so no API key needed, only ChatGPT Plus/Pro subscription.
 */
import { execFile } from "child_process";
import { existsSync, readFileSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Paths to media-tools skill and Python venv
const PYTHON_BIN = join(homedir(), ".claude", "skills", ".venv", "Scripts", "python.exe");
const CREATE_IMAGE_SCRIPT = join(homedir(), ".claude", "skills", "media-tools", "scripts", "create_image.py");
const CODEX_AUTH_FILE = join(homedir(), ".codex", "auth.json");
const IMAGE_WORKSPACE = join(tmpdir(), "fb-pipeline-images");

export interface ChatGPTImageResult {
  b64Json: string;
  mimeType: "image/png";
  model: "gpt-image-2";
  requestedModel: "gpt-image-2";
}

/** True if media-tools skill + Codex auth session are present. */
export function hasChatGPTOAuthImageConfig(): boolean {
  return (
    existsSync(PYTHON_BIN) &&
    existsSync(CREATE_IMAGE_SCRIPT) &&
    existsSync(CODEX_AUTH_FILE)
  );
}

/** Generate image via ChatGPT OAuth, return base64-encoded PNG. */
export async function generateChatGPTOAuthImage(prompt: string): Promise<ChatGPTImageResult> {
  const { stdout, stderr } = await execFileAsync(
    PYTHON_BIN,
    [
      CREATE_IMAGE_SCRIPT,
      "--provider", "chatgpt_oauth",
      "--image-model", "gpt-image-2",
      "--aspect-ratio", "1:1",
      "--workspace", IMAGE_WORKSPACE,
      "--prompt", prompt,
    ],
    { timeout: 120_000 }
  );

  // Parse "MEDIA:/path/to/file.png" from stdout
  const mediaMatch = (stdout + stderr).match(/^MEDIA:(.+)$/m);
  if (!mediaMatch) {
    throw new Error(`chatgpt_oauth: no MEDIA: line in output.\nstdout: ${stdout}\nstderr: ${stderr}`);
  }

  const imagePath = mediaMatch[1].trim();
  if (!existsSync(imagePath)) {
    throw new Error(`chatgpt_oauth: image file not found at ${imagePath}`);
  }

  const b64Json = readFileSync(imagePath).toString("base64");
  return { b64Json, mimeType: "image/png", model: "gpt-image-2", requestedModel: "gpt-image-2" };
}
