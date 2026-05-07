<p align="center">
  <span style="font-size: 48px">🎭</span>
</p>

<h1 align="center">Facebook Content Pipeline</h1>

<p align="center">
  Fork của <a href="https://github.com/Affitor/content-pipeline">Affitor/content-pipeline</a>, tích hợp tạo ảnh thực bằng <strong>gpt-image-2</strong> qua ChatGPT OAuth — không cần OpenAI Platform API key.<br/>
  Thiết kế dành cho người dùng <a href="https://goclaw.io">GoClaw</a>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/OpenAI-gpt--image--2-green?style=flat-square" alt="gpt-image-2" />
  <img src="https://img.shields.io/badge/Auth-ChatGPT_OAuth-orange?style=flat-square" alt="ChatGPT OAuth" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square" alt="Next.js" />
  <img src="https://img.shields.io/badge/Target-Facebook-1877F2?style=flat-square" alt="Facebook" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square" alt="License" />
</p>

---

## Nguồn Gốc & Điểm Khác Biệt

Repo này kết hợp 2 nguồn:

| Repo gốc | Đóng góp |
|----------|----------|
| [Affitor/content-pipeline](https://github.com/Affitor/content-pipeline) | Toàn bộ pipeline: research, viết bài, UI, GoClaw agent API |
| [therichardngai-code/gpt-image-2-pro-max](https://github.com/therichardngai-code/gpt-image-2-pro-max) | `media-tools` skill: tạo ảnh gpt-image-2 qua ChatGPT Plus OAuth |

**Điểm khác biệt chính:** repo gốc yêu cầu OpenAI Platform API key riêng để tạo ảnh (gpt-image-2). Repo này dùng ChatGPT Plus subscription thông qua OAuth — cùng cơ chế mà GoClaw dùng cho text generation — nên không cần thêm API key nào.

---

## Điểm Nhấn Đặc Biệt

Tool này được thiết kế chuyên biệt cho **content Facebook phong cách Việt Nam**:

- **Mỉa mai xã hội (Satire)**: Quan sát hiện tượng thực → lật ngược góc nhìn → chỉ ra cái thật ẩn bên dưới. Làm người đọc vừa cười vừa "ừ đúng thật".
- **Chiêm nghiệm (Life Observation)**: Lấy từ sự kiện thực → kéo ra insight phổ quát về cuộc sống. Ai đọc cũng thấy mình trong đó.

Hai format này là trái tim của tool — được nghiên cứu kỹ về tâm lý viral trên Facebook Việt Nam.

## Tính Năng

- **Nghiên cứu** - Tìm kiếm bài viết trending qua Brave Search API. Lọc theo Tất cả, Tin tức, Reddit, Facebook Trends, Blog.
- **Chọn nguồn** - Xem kết quả với auto-tags (Công nghệ, Xã hội, Kinh tế, Giới trẻ, Viral...) và chọn nguồn cảm hứng.
- **Cấu hình** - Chọn format, giọng văn, độ dài, ngôn ngữ (Tiếng Việt/English), số bài cần tạo.
- **Viết** - OpenAI Responses API hoặc Claude fallback viết bài Facebook, stream real-time.
- **Hình ảnh** - Tạo ảnh thực bằng gpt-image-2 qua ChatGPT OAuth (không cần API key); fallback render infographic server-side bằng Satori.

## Workflow

```
Chủ đề
  → Brave Search (Web + News, sắp xếp theo độ mới)
  → Chọn bài làm nguồn cảm hứng + dữ liệu
  → Cấu hình: format, giọng văn, độ dài, ngôn ngữ, số bài
  → OpenAI/Claude viết bài (streaming, mỗi bài góc nhìn khác nhau)
  → gpt-image-2 tạo ảnh qua ChatGPT OAuth / Satori infographic fallback
```

## Các Format Bài Viết

| Format | Mô tả | Phù hợp |
|--------|-------|---------|
| 🎭 **Mỉa Mai** | Quan sát xã hội → lật ngược → insight chua cay | Viral nhất, đặc trưng |
| 🔍 **Chiêm Nghiệm** | Từ sự kiện thực → sự thật phổ quát về cuộc sống | Emotional, shareable |
| 💡 **Góc Nhìn** | Quan điểm táo bạo + backup bằng dữ liệu | Tranh luận, comment nhiều |
| 📋 **Danh Sách** | Top X với số liệu cụ thể | Dễ đọc, save nhiều |
| 🏢 **Case Study** | Deep-dive một câu chuyện/công ty | Authority, trust |
| 🛠️ **Hướng Dẫn** | Step-by-step actionable | Share, save |

## Giọng Văn

| Giọng | Mô tả |
|-------|-------|
| Mỉa mai | Chua cay, hài hước, chạm đúng chỗ đau |
| Suy ngẫm | Chiêm nghiệm, sâu sắc, không phán xét |
| Kích động | Nói thẳng, gây tranh cãi, không ngại đụng chạm |
| Kể chuyện | Narrative, dẫn dắt cảm xúc |
| Phân tích | Dữ liệu, logic, bóc tách vấn đề |
| Tùy chỉnh | Tự viết hướng dẫn giọng văn riêng |

## Chạy Locally

```bash
git clone https://github.com/chauleminh3011/fb-content-pipeline
cd fb-content-pipeline
npm install
cp .env.example .env.local
```

Thêm API keys vào `.env.local`:

```bash
# Brave Search (bắt buộc) — https://brave.com/search/api/
BRAVE_SEARCH_API_KEY=

# Text generation — chọn 1 trong 2:

# Option A: GoClaw ChatGPT OAuth gateway (nếu đang dùng GoClaw)
OPENAI_TEXT_BASE_URL=http://localhost:18790/v1
OPENAI_TEXT_API_KEY=<GOCLAW_GATEWAY_TOKEN>
OPENAI_TEXT_MODEL=goclaw:<tên-agent>
OPENAI_TEXT_REQUEST_FORMAT=goclaw

# Option B: OpenAI Platform API key
OPENAI_API_KEY=

# Image generation — gpt-image-2 qua ChatGPT OAuth (không cần thêm key)
# Cài media-tools skill rồi chạy login một lần (xem phần bên dưới)
# Fallback tự động về Anthropic Satori nếu chưa setup
ANTHROPIC_API_KEY=   # chỉ cần nếu dùng Anthropic fallback cho text
```

```bash
npm run dev
```

Mở [http://localhost:3002](http://localhost:3002).

## Setup Tạo Ảnh gpt-image-2 (Không Cần API Key)

Repo này dùng [`media-tools`](https://github.com/therichardngai-code/gpt-image-2-pro-max) skill để tạo ảnh qua ChatGPT Plus OAuth:

```bash
# 1. Clone và cài skill (cần Python 3.8+)
git clone https://github.com/therichardngai-code/gpt-image-2-pro-max /tmp/gpt-img
cp -r /tmp/gpt-img/.claude/skills/media-tools ~/.claude/skills/

# 2. Cài dependency
pip install requests

# 3. Login ChatGPT một lần (mở browser)
python ~/.claude/skills/media-tools/scripts/chatgpt_oauth_login.py
```

Sau khi login, token lưu vào `~/.codex/auth.json` và tự refresh — không cần login lại.
Nếu đã cài [Codex CLI](https://github.com/openai/codex) và đã login, bước 3 không cần thiết.

## GoClaw Agent Direct

GoClaw Docker có thể gọi skill trực tiếp, không cần `/cc` bridge:

```sh
export FB_PIPELINE_BASE_URL="http://host.docker.internal:3002"
export FB_PIPELINE_TOKEN="<same as PIPELINE_AGENT_TOKEN>"
python3 /app/data/skills-store/facebook-content-pipeline/1/scripts/fb_content_pipeline.py \
  --topic "AI thay thế nhân viên văn phòng ở Việt Nam" \
  --count 2 \
  --format satire
```

Nếu `PIPELINE_AGENT_TOKEN` bỏ trống, script không cần `FB_PIPELINE_TOKEN`.

## Tech Stack

| Công nghệ | Vai trò |
|-----------|---------|
| [Next.js 16](https://nextjs.org) | App Router, API Routes, Edge Runtime |
| [OpenAI Responses API](https://platform.openai.com/docs) | Content generation (streaming) |
| [gpt-image-2 via ChatGPT OAuth](https://github.com/therichardngai-code/gpt-image-2-pro-max) | AI image generation (không cần API key) |
| [Claude Sonnet 4.5](https://anthropic.com) | Fallback content generation |
| [Brave Search API](https://brave.com/search/api/) | Web + News search |
| [Satori](https://github.com/vercel/satori) | Server-side infographic generation (fallback) |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [TypeScript](https://typescriptlang.org) | Type safety |

## License

MIT — Fork từ [Affitor/content-pipeline](https://github.com/Affitor/content-pipeline) (MIT).
