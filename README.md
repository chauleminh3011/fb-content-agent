<p align="center">
  <span style="font-size: 48px">🎭</span>
</p>

<h1 align="center">Facebook Content Pipeline</h1>

<p align="center">
  An AI-powered content generation pipeline for Facebook, purpose-built for Vietnamese social media.<br/>
  Inspired by <a href="https://github.com/Affitor/content-pipeline">Affitor/content-pipeline</a> and <a href="https://github.com/therichardngai-code/gpt-image-2-pro-max">therichardngai-code/gpt-image-2-pro-max</a>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/OpenAI-gpt--image--2-green?style=flat-square" alt="gpt-image-2" />
  <img src="https://img.shields.io/badge/Auth-ChatGPT_OAuth-orange?style=flat-square" alt="ChatGPT OAuth" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square" alt="Next.js" />
  <img src="https://img.shields.io/badge/Target-Facebook-1877F2?style=flat-square" alt="Facebook" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square" alt="License" />
</p>

---

## What It Does

Turns a topic into a ready-to-post Facebook article with an AI-generated image — in one pipeline:

```
Topic
  → Brave Search (trending news + web)
  → Select source articles for data & inspiration
  → Configure: format, tone, length, language, post count
  → AI writes the post (streaming, OpenAI or Claude)
  → gpt-image-2 generates a matching image (ChatGPT OAuth, no API key needed)
```

## Key Differentiators

- **Research-backed content** — every post is grounded in real articles, real data, real sources. Not hallucinated.
- **6 specialized formats** — each with its own prompt template, structure, and examples tuned for Facebook engagement.
- **Vietnamese-native writing** — prompts are written in Vietnamese, not translated. The output reads like a native speaker, not a machine.
- **Image generation via ChatGPT OAuth** — uses your ChatGPT Plus subscription to generate images with gpt-image-2. No separate OpenAI Platform API key required.
- **3-tier image fallback** — ChatGPT OAuth → OpenAI Platform API → Satori server-side infographic.
- **Topic anchoring** — the AI is explicitly instructed to stay on-topic, even when research articles drift.

## Content Formats

| Format | Description | Best For |
|--------|-------------|----------|
| 🎭 **Satire** | Social observation → flip the perspective → sharp insight | Highest viral potential |
| 🔍 **Life Observation** | Real event → universal truth about life | Emotional, shareable |
| 💡 **POV** | Bold opinion backed by data | Debate, high comments |
| 📋 **Top List** | Ranked items with specific numbers | Easy to read, high saves |
| 🏢 **Case Study** | Deep-dive into one company/story | Authority, trust |
| 🛠️ **How-To** | Step-by-step actionable guide | Saves, shares |

## Tone Presets

| Key | Style |
|-----|-------|
| `mia-mai` | Sharp, witty satire — funny but not cruel |
| `chiem-nghiem` | Reflective, thoughtful — speaks from experience |
| `thang-than` | Direct, provocative — doesn't shy from discomfort |
| `ke-chuyen` | Storytelling — small detail leads to big insight |
| `phan-tich` | Analytical — data, logic, pattern recognition |
| `custom` | Write your own tone instructions |

## Getting Started

```bash
git clone https://github.com/chauleminh3011/fb-content-agent
cd fb-content-agent
npm install
cp .env.example .env.local
```

Add API keys to `.env.local`:

```bash
# Brave Search (required) — https://brave.com/search/api/
BRAVE_SEARCH_API_KEY=

# Text generation — pick one:
# Option A: OpenAI
OPENAI_API_KEY=
# Option B: Anthropic Claude
ANTHROPIC_API_KEY=

# Image generation — gpt-image-2 via ChatGPT OAuth (no API key needed)
# See "Image Generation Setup" below
# Falls back to Satori infographic if not configured
```

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

## Image Generation Setup

This repo uses the [`media-tools`](https://github.com/therichardngai-code/gpt-image-2-pro-max) approach to generate images through ChatGPT Plus OAuth — no OpenAI Platform API key required:

```bash
# 1. Clone and install the skill (requires Python 3.8+)
git clone https://github.com/therichardngai-code/gpt-image-2-pro-max /tmp/gpt-img
cp -r /tmp/gpt-img/.claude/skills/media-tools ~/.claude/skills/

# 2. Install dependencies
pip install requests

# 3. Login to ChatGPT once (opens browser)
python ~/.claude/skills/media-tools/scripts/chatgpt_oauth_login.py
```

After login, the token is saved to `~/.codex/auth.json` and auto-refreshes.
If you already have [Codex CLI](https://github.com/openai/codex) installed and logged in, step 3 is not needed.

## Agent API

The pipeline exposes a simple GET API for programmatic access:

```
GET /api/agent/quick?topic=<topic>&format=satire&length=medium&tone=mia-mai
GET /api/agent/quick-image?id=<postId>
```

### Parameters

| Param | Values | Default |
|-------|--------|---------|
| `topic` | any string (required) | — |
| `format` | `satire`, `life-observation`, `pov`, `toplist`, `case-study`, `how-to` | `satire` |
| `length` | `short`, `medium`, `long` | `medium` |
| `tone` | `mia-mai`, `chiem-nghiem`, `thang-than`, `ke-chuyen`, `phan-tich` | `mia-mai` |
| `source` | `news`, `web` | `news` |
| `sources` | `1-6` | `3` |

## Tech Stack

| Technology | Role |
|------------|------|
| [Next.js 16](https://nextjs.org) | App Router, API Routes |
| [OpenAI Responses API](https://platform.openai.com/docs) | Content generation (streaming) |
| [gpt-image-2 via ChatGPT OAuth](https://github.com/therichardngai-code/gpt-image-2-pro-max) | AI image generation |
| [Claude](https://anthropic.com) | Fallback content generation |
| [Brave Search API](https://brave.com/search/api/) | Web + News research |
| [Satori](https://github.com/vercel/satori) | Server-side infographic fallback |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [TypeScript](https://typescriptlang.org) | Type safety |

## Acknowledgements

- [Affitor/content-pipeline](https://github.com/Affitor/content-pipeline) — the original content pipeline architecture
- [therichardngai-code/gpt-image-2-pro-max](https://github.com/therichardngai-code/gpt-image-2-pro-max) — ChatGPT OAuth image generation approach

## License

MIT
