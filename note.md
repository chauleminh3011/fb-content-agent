# FB Content Pipeline — Ghi chú cài đặt & vận hành

## Kiến trúc tổng quan

```
Text generation:  GoClaw (localhost:18790) → monkey-the-writer agent
Image generation: ChatGPT OAuth (~/.codex/auth.json) → gpt-image-2
Research:         Brave Search API
```

## Cấu hình (.env.local)

```env
BRAVE_SEARCH_API_KEY=...
AI_PROVIDER=openai
OPENAI_TEXT_BASE_URL=http://localhost:18790/v1
OPENAI_TEXT_API_KEY=gogoclaw111
OPENAI_TEXT_MODEL=goclaw:monkey-the-writer
OPENAI_TEXT_REQUEST_FORMAT=goclaw
OPENAI_IMAGE_MODEL=gpt-image-2
OPENAI_IMAGE_BASE_URL=https://api.openai.com/v1  # chỉ dùng làm fallback label, không dùng thực
```

**Lưu ý:** `OPENAI_IMAGE_API_KEY` không được set → `hasOpenAIImageConfig() = false` → pipeline bỏ qua OpenAI Platform API, dùng ChatGPT OAuth thay thế.

## Image Provider — ChatGPT OAuth (Priority 1)

- Skill: `~/.claude/skills/media-tools/`
- Script: `~/.claude/skills/media-tools/scripts/create_image.py`
- Python: `~/.claude/skills/.venv/Scripts/python.exe`
- Token: `~/.codex/auth.json` (shared với Codex CLI)
- Code tích hợp: `src/lib/chatgpt-image.ts`

### Provider chain trong image/route.ts
1. **ChatGPT OAuth** (`hasChatGPTOAuthImageConfig()`) → gpt-image-2 thực, không cần API key
2. **OpenAI Platform API** (`hasOpenAIConfig()`) → cần `OPENAI_IMAGE_API_KEY`
3. **Anthropic Satori** (fallback) → trả JSON infographic, render phía client

## Agent auth (inter-agent calls)

- Endpoint: `POST /api/agent/run`
- Hiện tại: `PIPELINE_AGENT_TOKEN` không được set → **public, không cần auth**
- Nếu muốn bảo mật: thêm `PIPELINE_AGENT_TOKEN=secret` vào `.env.local`, gọi kèm `Authorization: Bearer secret`

## API endpoints

```bash
# Health check
GET  http://localhost:3002/api/health

# Tạo ảnh
POST http://localhost:3002/api/image
Body: { postContent, title, format }

# Viết bài (từ article JSON)
POST http://localhost:3002/api/write-json
Body: { article, format, length, language, ... }

# Full pipeline: research → viết → ảnh
POST http://localhost:3002/api/agent/run
Body: { topic, format, language, outputCount, includeImages }
```

## Khi token ChatGPT hết hạn

Token tự refresh. Nếu thấy lỗi 401 từ `/api/image`, login lại:

```bash
~/.claude/skills/.venv/Scripts/python.exe \
  ~/.claude/skills/media-tools/scripts/chatgpt_oauth_login.py
```

Script mở browser → login ChatGPT Plus → tự lưu token mới vào `~/.codex/auth.json`.

## Test nhanh

```bash
# Kiểm tra image provider
curl http://localhost:3002/api/health | jq '{imageProvider, chatgptOAuthImageConfigured, imageModel}'

# Test tạo ảnh
curl -X POST http://localhost:3002/api/image \
  -H "Content-Type: application/json" \
  -d '{"postContent": "Nội dung bài...", "title": "Tiêu đề", "format": "satire"}'

# Full pipeline (gogopet hoặc agent khác gọi)
curl -X POST http://localhost:3002/api/agent/run \
  -H "Content-Type: application/json" \
  -d '{"topic": "chủ đề", "format": "satire", "language": "vn", "includeImages": true}'
```

## Model mặc định

| Loại | Model | Provider |
|------|-------|----------|
| Text | `goclaw:monkey-the-writer` | GoClaw → ChatGPT OAuth |
| Image | `gpt-image-2` | ChatGPT OAuth (~/.codex/auth.json) |
| Fallback image | Anthropic Satori | Claude sonnet-4-5 → JSON infographic |
