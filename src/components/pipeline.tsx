"use client";

import { useState, useCallback, useRef } from "react";
import type {
  ResearchArticle,
  ContentFormat,
  GeneratedPost,
  PostLength,
  ContentLanguage,
  ResearchSource,
} from "@/lib/types";
import { POST_LENGTHS, TONE_PRESETS, RESEARCH_SOURCES } from "@/lib/types";

const STEPS = ["Nghiên Cứu", "Chọn Bài", "Cấu Hình", "Viết Bài"] as const;

const FORMATS: {
  value: ContentFormat;
  label: string;
  icon: string;
  desc: string;
  badge?: string;
}[] = [
  {
    value: "satire",
    label: "Mỉa Mai",
    icon: "🎭",
    desc: "Quan sát xã hội, lật ngược góc nhìn",
    badge: "Nổi Bật",
  },
  {
    value: "life-observation",
    label: "Chiêm Nghiệm",
    icon: "🔍",
    desc: "Góc nhìn khác biệt về cuộc sống",
    badge: "Viral",
  },
  { value: "pov", label: "Góc Nhìn", icon: "💡", desc: "Quan điểm táo bạo + dữ liệu" },
  { value: "toplist", label: "Danh Sách", icon: "📋", desc: "Top X với số liệu cụ thể" },
  { value: "case-study", label: "Case Study", icon: "🏢", desc: "Deep-dive một câu chuyện" },
  { value: "how-to", label: "Hướng Dẫn", icon: "🛠️", desc: "Step-by-step actionable" },
];

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "hot" | "viral" }) {
  const styles = {
    default: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    hot: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    viral: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <span className={`px-1.5 py-px rounded text-[10px] font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function base64ToObjectUrl(b64: string, mimeType = "image/png") {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

export default function Pipeline() {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [researchSource, setResearchSource] = useState<ResearchSource>("all");
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [format, setFormat] = useState<ContentFormat>("satire");
  const [postLength, setPostLength] = useState<PostLength>("medium");
  const [outputCount, setOutputCount] = useState(1);
  const [tone, setTone] = useState("mia-mai");
  const [customTone, setCustomTone] = useState("");
  const [language, setLanguage] = useState<ContentLanguage>("vn");
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [writingIndex, setWritingIndex] = useState(-1);
  const [imageLoadingIds, setImageLoadingIds] = useState<Set<string>>(new Set());

  // Facebook publish state
  const [fbPageId, setFbPageId] = useState("");
  const [fbPageToken, setFbPageToken] = useState("");
  const [fbPublishingIds, setFbPublishingIds] = useState<Set<string>>(new Set());
  const [fbPublishResults, setFbPublishResults] = useState<
    Record<string, { success: boolean; url?: string; error?: string; scheduled?: boolean }>
  >({});
  const [showFbConfig, setShowFbConfig] = useState(false);
  const fbConfigRef = useRef<HTMLDivElement>(null);

  const selectedArticles = articles.filter((a) => a.selected);

  // Xóa markdown thừa từ output AI
  const cleanContent = (text: string) =>
    text
      .replace(/\*\*/g, "")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/—/g, "-")
      .replace(/^#+\s*/gm, "");

  const handleResearch = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, source: researchSource }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Research failed");
      setArticles(data.articles);
      setOutputCount(1);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setLoading(false);
    }
  }, [topic, researchSource]);

  const toggleArticle = (id: string) =>
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)));
  const selectAll = () => setArticles((prev) => prev.map((a) => ({ ...a, selected: true })));
  const clearAll = () => setArticles((prev) => prev.map((a) => ({ ...a, selected: false })));

  const handleWrite = useCallback(async () => {
    const selected = articles.filter((a) => a.selected);
    if (selected.length === 0) return;
    setStep(3);
    setLoading(true);
    setError(null);
    setPosts([]);
    const count = Math.min(outputCount, selected.length);
    for (let i = 0; i < count; i++) {
      setWritingIndex(i);
      const primaryArticle = selected[i];
      const postId = `post-${Date.now()}-${i}`;
      setPosts((prev) => [
        ...prev,
        {
          id: postId,
          articleId: primaryArticle.id,
          format,
          content: "",
          createdAt: new Date().toISOString(),
        },
      ]);
      try {
        const res = await fetch("/api/write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            article: primaryArticle,
            format,
            length: postLength,
            allArticles: selected,
            postIndex: i,
            totalPosts: count,
            tone,
            customTone: tone === "custom" ? customTone : undefined,
            language,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Write failed");
        }
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        if (reader) {
          let done = false;
          while (!done) {
            const { value, done: d } = await reader.read();
            done = d;
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              for (const line of lines) {
                if (line.startsWith("data: ") && line !== "data: [DONE]") {
                  try {
                    const p = JSON.parse(line.slice(6));
                    if (p.text)
                      setPosts((prev) =>
                        prev.map((po) =>
                          po.id === postId ? { ...po, content: po.content + p.text } : po
                        )
                      );
                  } catch {}
                }
              }
            }
          }
          if (buffer.startsWith("data: ") && buffer !== "data: [DONE]") {
            try {
              const p = JSON.parse(buffer.slice(6));
              if (p.text)
                setPosts((prev) =>
                  prev.map((po) =>
                    po.id === postId ? { ...po, content: po.content + p.text } : po
                  )
                );
            } catch {}
          }
        }
      } catch (err) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId && !p.content ? { ...p, content: "[Lỗi: không thể tạo bài viết]" } : p
          )
        );
        setError(err instanceof Error ? err.message : "Write failed");
        break;
      }
    }
    setWritingIndex(-1);
    setLoading(false);
  }, [articles, format, postLength, outputCount, tone, customTone, language]);

  const handleGenerateImage = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post || !post.content) return;
      setImageLoadingIds((prev) => new Set(prev).add(postId));
      try {
        const dataRes = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postContent: post.content,
            title: articles.find((a) => a.id === post.articleId)?.title || "",
            format: post.format,
          }),
        });
        const dataJson = await dataRes.json();
        if (!dataRes.ok) throw new Error(dataJson.error);
        if (dataJson.image) {
          const imageUrl = dataJson.image.b64Json
            ? base64ToObjectUrl(dataJson.image.b64Json, dataJson.image.mimeType)
            : dataJson.image.url;
          if (!imageUrl) throw new Error("OpenAI image response missing image data");

          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, imageUrl, imageHtml: JSON.stringify(dataJson.image) }
                : p
            )
          );
          return;
        }

        const ogRes = await fetch("/api/og", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ infographic: dataJson.infographic }),
        });
        if (!ogRes.ok) throw new Error("Image render failed");
        const blob = await ogRes.blob();
        const imageUrl = URL.createObjectURL(blob);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, imageUrl, imageHtml: JSON.stringify(dataJson.infographic) }
              : p
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Image generation failed");
      } finally {
        setImageLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [posts, articles]
  );

  const copyPost = (content: string) => {
    navigator.clipboard.writeText(cleanContent(content));
  };
  const downloadImage = (imageUrl: string, postId: string) => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `fb-post-${postId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  // Đăng bài lên Facebook Page
  const handleFbPublish = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post?.content) return;

      // Kiểm tra token/pageId — nếu chưa có thì mở config
      if (!fbPageId.trim() || !fbPageToken.trim()) {
        setShowFbConfig(true);
        setTimeout(() => fbConfigRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }

      setFbPublishingIds((prev) => new Set(prev).add(postId));
      setFbPublishResults((prev) => ({ ...prev, [postId]: { success: false } }));

      try {
        const body: Record<string, string> = {
          message: cleanContent(post.content),
          pageId: fbPageId.trim(),
          pageToken: fbPageToken.trim(),
        };
        // Nếu có ảnh đã render → gửi kèm photoUrl
        if (post.imageUrl && post.imageUrl.startsWith("blob:")) {
          // blob URL không thể gửi cho Facebook API (cần URL công khai)
          // → chỉ đăng text, ảnh tải xuống riêng
        }

        const res = await fetch("/api/fb-publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setFbPublishResults((prev) => ({
            ...prev,
            [postId]: { success: false, error: data.error || "Publish failed" },
          }));
        } else {
          setFbPublishResults((prev) => ({
            ...prev,
            [postId]: { success: true, url: data.url, scheduled: data.scheduled },
          }));
        }
      } catch (err) {
        setFbPublishResults((prev) => ({
          ...prev,
          [postId]: { success: false, error: err instanceof Error ? err.message : "Network error" },
        }));
      } finally {
        setFbPublishingIds((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [posts, fbPageId, fbPageToken, cleanContent]
  );

  const chipClass = (selected: boolean) =>
    selected
      ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
      : "bg-bg-primary border-border-primary text-text-secondary hover:border-border-tertiary";

  const formatLabel = (f: ContentFormat) => FORMATS.find((x) => x.value === f)?.label || f;

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <header className="h-14 bg-bg-primary border-b border-border-primary sticky top-0 z-10">
        <div className="max-w-[960px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🎭</span>
            <span className="text-sm font-bold text-text-primary">Facebook</span>
            <span className="text-sm font-bold text-rose-400">Content Pipeline</span>
          </div>
          <span className="text-xs text-text-tertiary">Mỉa mai xã hội · Góc nhìn khác biệt · OpenAI/Claude</span>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto px-6 py-5">
        {/* Step nav */}
        <nav className="flex items-center gap-1.5 mb-5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <button
                onClick={() => i < step && !loading && setStep(i)}
                className={`h-8 px-3 rounded-lg text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                  i === step
                    ? "bg-rose-500 text-white"
                    : i < step && !loading
                    ? "bg-rose-500/10 text-rose-400 cursor-pointer hover:bg-rose-500/20"
                    : "bg-bg-tertiary text-text-tertiary cursor-default"
                }`}
              >
                {i + 1} {s}
              </button>
              {i < STEPS.length - 1 && <span className="text-text-tertiary text-xs">→</span>}
            </div>
          ))}
        </nav>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-lg text-[13px] flex items-center justify-between bg-red-500/10 text-red-400 border border-red-500/20">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-medium text-xs hover:underline ml-4">
              Đóng
            </button>
          </div>
        )}

        {/* Step 0: Research */}
        {step === 0 && (
          <div className="bg-bg-primary rounded-xl border border-border-primary p-5">
            <div className="text-[13px] font-semibold text-text-primary mb-1">Chủ đề nghiên cứu</div>
            <div className="text-xs text-text-tertiary mb-3">
              Nhập chủ đề xã hội, tin tức, trend — AI sẽ tìm bài để lấy cảm hứng và dữ liệu
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResearch()}
              placeholder='VD: "Gen Z và work-life balance", "startup Việt Nam 2026", "AI thay thế việc làm"'
              className="w-full h-10 rounded-lg border border-border-secondary px-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
            <div className="mt-4">
              <span className="text-xs font-medium text-text-secondary">Nguồn tìm kiếm</span>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {RESEARCH_SOURCES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setResearchSource(s.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${chipClass(researchSource === s.value)}`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleResearch}
              disabled={loading || !topic.trim()}
              className="mt-5 h-9 px-4 rounded-lg text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40 transition-all inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner /> Đang tìm kiếm...
                </>
              ) : (
                "🔍 Nghiên Cứu"
              )}
            </button>
          </div>
        )}

        {/* Step 1: Select articles */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-bg-primary rounded-xl border border-border-primary p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-semibold text-text-primary">
                  Bài báo tìm được
                  <span className="ml-2 text-xs font-normal text-text-tertiary">
                    ({selectedArticles.length}/{articles.length} đã chọn)
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={selectAll} className="text-xs font-medium text-rose-400 hover:underline">
                    Chọn tất cả
                  </button>
                  <button onClick={clearAll} className="text-xs font-medium text-text-secondary hover:underline">
                    Bỏ chọn
                  </button>
                </div>
              </div>
              <div className="text-xs text-text-tertiary mb-3">
                Chọn những bài cung cấp dữ liệu hoặc câu chuyện hay nhất để AI lấy cảm hứng
              </div>
              <div className="space-y-1.5">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => toggleArticle(article.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      article.selected
                        ? "border-rose-500/40 bg-rose-500/5"
                        : "border-border-primary bg-bg-primary hover:border-border-secondary"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 flex items-center justify-center text-[10px] transition-all ${
                          article.selected
                            ? "bg-rose-500 text-white"
                            : "border border-border-secondary bg-bg-primary"
                        }`}
                      >
                        {article.selected ? "✓" : ""}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-text-primary leading-snug">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[11px] font-medium text-rose-400">{article.source}</span>
                          <span className="text-[11px] text-text-tertiary">{article.date}</span>
                          {article.keyData === "News" && (
                            <Badge variant="hot">NÓNG</Badge>
                          )}
                          {article.tag && <Badge variant="default">{article.tag}</Badge>}
                        </div>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{article.summary}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedArticles.length > 0 && (
              <button
                onClick={() => {
                  setOutputCount((prev) => Math.min(prev, selectedArticles.length));
                  setStep(2);
                }}
                className="h-9 px-4 rounded-lg text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-all inline-flex items-center gap-2"
              >
                Tiếp tục với {selectedArticles.length} bài →
              </button>
            )}
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-bg-primary rounded-xl border border-border-primary p-5 space-y-6">
              {/* Language toggle */}
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-text-primary">Cấu hình bài viết</div>
                <div className="flex rounded-lg overflow-hidden border border-border-secondary">
                  {(["vn", "en"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${
                        language === l
                          ? "bg-rose-500 text-white"
                          : "bg-bg-primary text-text-secondary hover:bg-bg-hover"
                      }`}
                    >
                      {l === "vn" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format selection */}
              <div>
                <div className="text-[13px] font-semibold text-text-primary mb-3">
                  Format bài viết
                  <span className="ml-2 text-xs font-normal text-text-tertiary">
                    — Mỉa Mai & Chiêm Nghiệm là format đặc trưng
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFormat(f.value)}
                      className={`p-3 rounded-lg border text-left transition-all relative ${chipClass(format === f.value)}`}
                    >
                      {f.badge && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold px-1 py-px rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {f.badge}
                        </span>
                      )}
                      <div className="text-lg">{f.icon}</div>
                      <div className="text-[13px] font-medium text-text-primary mt-1">{f.label}</div>
                      <div className="text-[11px] text-text-tertiary mt-0.5">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone selection */}
              <div>
                <div className="text-[13px] font-semibold text-text-primary mb-3">Giọng văn</div>
                <div className="grid grid-cols-3 gap-2">
                  {TONE_PRESETS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${chipClass(tone === t.value)}`}
                    >
                      <div className="text-xs font-medium text-text-primary">{t.label}</div>
                      <div className="text-[11px] text-text-tertiary mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
                {tone === "custom" && (
                  <textarea
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    placeholder="Mô tả giọng văn bạn muốn... VD: Như một người bạn nói chuyện thật lòng, không ngại đụng chạm nhưng không ác ý"
                    className="mt-2 w-full rounded-lg border border-border-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-rose-500/50 min-h-[72px]"
                  />
                )}
              </div>

              {/* Length + Output count */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="text-[13px] font-semibold text-text-primary mb-3">Độ dài</div>
                  <div className="space-y-1.5">
                    {POST_LENGTHS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setPostLength(l.value)}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all flex justify-between items-center ${chipClass(postLength === l.value)}`}
                      >
                        <span className="text-[13px] font-medium text-text-primary">{l.label}</span>
                        <span className="text-xs text-rose-400">{l.words}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-text-primary mb-3">Số bài cần tạo</div>
                  <p className="text-xs text-text-secondary mb-2">
                    {selectedArticles.length} nguồn đã chọn — mỗi bài dùng tất cả làm context
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 5]
                      .filter((n) => n <= selectedArticles.length)
                      .map((n) => (
                        <button
                          key={n}
                          onClick={() => setOutputCount(n)}
                          className={`flex-1 py-2.5 rounded-lg border text-center transition-all ${chipClass(outputCount === n)}`}
                        >
                          <div className="text-base font-bold text-text-primary">{n}</div>
                          <div className="text-[11px] text-text-tertiary">bài</div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary + CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleWrite}
                disabled={loading}
                className="h-9 px-5 rounded-lg text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40 transition-all inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner /> Đang viết...
                  </>
                ) : (
                  `✍️ Viết với AI`
                )}
              </button>
              <span className="text-xs text-text-tertiary">
                {outputCount} bài · {formatLabel(format)} · {TONE_PRESETS.find(t => t.value === tone)?.label || tone} ·{" "}
                {language === "vn" ? "Tiếng Việt" : "English"}
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="space-y-4">
            {loading && writingIndex >= 0 && (
              <div className="flex items-center gap-2 text-[13px] text-rose-400">
                <Spinner />
                Đang viết bài {writingIndex + 1} / {Math.min(outputCount, selectedArticles.length)}...
              </div>
            )}
            {posts.map((post, i) => {
              const article = articles.find((a) => a.id === post.articleId);
              const isImageLoading = imageLoadingIds.has(post.id);
              const hasContent = post.content && !post.content.startsWith("[Lỗi:");
              const formatInfo = FORMATS.find((f) => f.value === post.format);
              return (
                <div key={post.id} className="bg-bg-primary rounded-xl border border-border-primary p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 flex-shrink-0">
                        {formatInfo?.icon} Bài {i + 1}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-bg-tertiary text-text-tertiary flex-shrink-0">
                        {formatInfo?.label}
                      </span>
                      {article && (
                        <span className="text-xs text-text-tertiary truncate">{article.title}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => copyPost(post.content)}
                        disabled={!hasContent}
                        className="h-7 px-2.5 rounded-md text-xs font-medium border border-border-secondary text-text-secondary hover:bg-bg-hover disabled:opacity-30 transition-all"
                      >
                        Copy
                      </button>
                      {!post.imageUrl && !isImageLoading && (
                        <button
                          onClick={() => handleGenerateImage(post.id)}
                          disabled={loading || !hasContent}
                          className="h-7 px-2.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 disabled:opacity-30 transition-all"
                        >
                          Tạo Ảnh AI
                        </button>
                      )}
                      {/* Nút Đăng Facebook */}
                      {hasContent && !fbPublishResults[post.id]?.success && (
                        <button
                          onClick={() => handleFbPublish(post.id)}
                          disabled={fbPublishingIds.has(post.id)}
                          className="h-7 px-2.5 rounded-md text-xs font-medium bg-blue-600/10 text-blue-400 border border-blue-500/30 hover:bg-blue-600/20 disabled:opacity-30 transition-all inline-flex items-center gap-1"
                        >
                          {fbPublishingIds.has(post.id) ? (
                            <><Spinner size={11} /> Đang đăng...</>
                          ) : (
                            "📘 Đăng Facebook"
                          )}
                        </button>
                      )}
                      {/* Đã đăng thành công */}
                      {fbPublishResults[post.id]?.success && (
                        <a
                          href={fbPublishResults[post.id].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 px-2.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all inline-flex items-center gap-1"
                        >
                          ✅ Đã đăng
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Post content */}
                  <div className="whitespace-pre-wrap text-[13px] leading-relaxed rounded-lg p-4 bg-bg-secondary text-text-primary max-h-[520px] overflow-y-auto">
                    {post.content ? (
                      cleanContent(post.content)
                    ) : (
                      <span className="flex items-center gap-2 text-text-tertiary">
                        <Spinner /> Đang tạo nội dung...
                      </span>
                    )}
                  </div>

                  {/* Character count */}
                  {hasContent && (
                    <div className="mt-1.5 text-xs text-text-tertiary text-right">
                      {cleanContent(post.content).length} ký tự
                    </div>
                  )}

                  {/* Image loading */}
                  {isImageLoading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-rose-400">
                      <Spinner /> Đang tạo ảnh Facebook...
                    </div>
                  )}

                  {/* Generated image */}
                  {post.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={post.imageUrl}
                        alt="Infographic Facebook"
                        className="rounded-lg max-w-[320px] border border-border-primary"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => downloadImage(post.imageUrl!, post.id)}
                          className="h-7 px-2.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 transition-all hover:bg-green-500/20"
                        >
                          Tải PNG
                        </button>
                        <span className="text-[10px] text-text-tertiary self-center">
                          Lưu ý: ảnh blob URL không upload trực tiếp lên Facebook được — tải PNG rồi đăng thủ công hoặc host ảnh lên CDN trước
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Facebook publish error */}
                  {fbPublishResults[post.id] && !fbPublishResults[post.id].success && fbPublishResults[post.id].error && (
                    <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                      Lỗi đăng Facebook: {fbPublishResults[post.id].error}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Facebook Config Panel */}
            <div ref={fbConfigRef} className="bg-bg-primary rounded-xl border border-border-primary overflow-hidden">
              <button
                onClick={() => setShowFbConfig((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📘</span>
                  <span className="text-[13px] font-semibold text-text-primary">Cấu hình Đăng Facebook</span>
                  {fbPageId && fbPageToken ? (
                    <span className="text-[10px] font-semibold px-1.5 py-px rounded bg-green-500/15 text-green-400 border border-green-500/20">
                      Đã kết nối
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-1.5 py-px rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                      Chưa cấu hình
                    </span>
                  )}
                </div>
                <span className="text-text-tertiary text-xs">{showFbConfig ? "▲ Thu gọn" : "▼ Mở rộng"}</span>
              </button>

              {showFbConfig && (
                <div className="px-5 pb-5 border-t border-border-primary space-y-4 pt-4">
                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15 text-xs text-blue-300 space-y-1">
                    <p className="font-semibold">Chỉ đăng được lên Facebook Page (không đăng được Profile cá nhân)</p>
                    <p>Cần Page Access Token không hết hạn. Xem hướng dẫn trong file <code className="bg-bg-secondary px-1 py-px rounded">.env.example</code></p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1">
                        Facebook Page ID
                      </label>
                      <input
                        type="text"
                        value={fbPageId}
                        onChange={(e) => setFbPageId(e.target.value)}
                        placeholder="VD: 123456789012345"
                        className="w-full h-9 rounded-lg border border-border-secondary px-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all"
                      />
                      <p className="text-[10px] text-text-tertiary mt-1">
                        Tìm trong About → Page ID hoặc URL page
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1">
                        Page Access Token
                      </label>
                      <input
                        type="password"
                        value={fbPageToken}
                        onChange={(e) => setFbPageToken(e.target.value)}
                        placeholder="EAAxxxxxxxxxxxxxxx..."
                        className="w-full h-9 rounded-lg border border-border-secondary px-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all"
                      />
                      <p className="text-[10px] text-text-tertiary mt-1">
                        Never-expiring token — xem hướng dẫn .env.example
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-secondary space-y-1.5">
                    <p className="font-semibold text-text-primary">Cách lấy Page Access Token nhanh nhất:</p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Vào <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Graph API Explorer</a> → chọn app của bạn</li>
                      <li>Thêm permissions: <code className="bg-bg-primary px-1 rounded">pages_manage_posts</code>, <code className="bg-bg-primary px-1 rounded">pages_read_engagement</code>, <code className="bg-bg-primary px-1 rounded">pages_show_list</code></li>
                      <li>Generate Access Token → Exchange thành long-lived (60 ngày)</li>
                      <li>GET <code className="bg-bg-primary px-1 rounded">me/accounts?access_token=...</code> → lấy token của Page (never expires)</li>
                      <li>Verify tại <a href="https://developers.facebook.com/tools/debug/accesstoken/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Access Token Debugger</a> — Expires = Never</li>
                    </ol>
                  </div>

                  {fbPageId && fbPageToken && (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <span>✅</span>
                      <span>Cấu hình sẵn sàng - nhấn &quot;📘 Đăng Facebook&quot; trên từng bài để đăng</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!loading && posts.length > 0 && (
              <button
                onClick={() => {
                  setStep(0);
                  setPosts([]);
                  setArticles([]);
                  setTopic("");
                  setOutputCount(1);
                  setFbPublishResults({});
                }}
                className="h-9 px-4 rounded-lg text-sm font-medium border border-border-secondary text-text-secondary hover:bg-bg-hover transition-all"
              >
                Tạo Pipeline Mới
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
