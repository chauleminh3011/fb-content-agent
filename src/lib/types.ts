export interface ResearchArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  summary: string;
  keyData: string;
  tag?: string;
  selected: boolean;
}

// Facebook-specific content formats
// satire: mỉa mai xã hội — điểm nhấn chính của tool
// life-observation: góc nhìn khác biệt về cuộc sống
export type ContentFormat = "satire" | "life-observation" | "pov" | "toplist" | "case-study" | "how-to";

export type PostLength = "short" | "medium" | "long";

// Chuyên biệt tiếng Việt Facebook
export type ContentLanguage = "vn" | "en";

export type ResearchSource = "all" | "news" | "reddit" | "facebook" | "blogs";

export const POST_LENGTHS: { value: PostLength; label: string; words: string; chars: string }[] = [
  { value: "short", label: "Ngắn", words: "80-150 từ", chars: "~500-900 ký tự" },
  { value: "medium", label: "Vừa", words: "200-350 từ", chars: "~1200-2100 ký tự" },
  { value: "long", label: "Dài", words: "400-600 từ", chars: "~2500-3600 ký tự" },
];

// Tone presets — thiên về mỉa mai & phản biện cho Facebook
export const TONE_PRESETS: { value: string; label: string; desc: string }[] = [
  { value: "mia-mai", label: "Mỉa mai", desc: "Chua cay, hài hước, chạm đúng chỗ đau" },
  { value: "chiem-nghiem", label: "Suy ngẫm", desc: "Chiêm nghiệm, sâu sắc, không phán xét" },
  { value: "thang-than", label: "Kích động", desc: "Nói thẳng, gây tranh cãi, không ngại đụng chạm" },
  { value: "ke-chuyen", label: "Kể chuyện", desc: "Narrative, dẫn dắt cảm xúc, có arc" },
  { value: "phan-tich", label: "Phân tích", desc: "Dữ liệu, logic, bóc tách vấn đề" },
  { value: "custom", label: "Tùy chỉnh", desc: "Tự viết hướng dẫn giọng văn riêng" },
];

export const RESEARCH_SOURCES: { value: ResearchSource; label: string; icon: string; query?: string }[] = [
  { value: "all", label: "Tất cả", icon: "🌐" },
  { value: "news", label: "Tin tức", icon: "📰" },
  { value: "reddit", label: "Reddit", icon: "🔴", query: "site:reddit.com" },
  { value: "facebook", label: "Facebook Trends", icon: "📘", query: "viral OR trending OR facebook" },
  { value: "blogs", label: "Blog & Báo", icon: "📝", query: "blog OR bài viết OR phân tích" },
];

// Auto-tag rules — mở rộng cho nội dung xã hội Việt Nam
export const TAG_RULES: { tag: string; patterns: RegExp }[] = [
  { tag: "Công nghệ", patterns: /\bai\b|artificial intelligence|machine learning|llm|gpt|claude|openai|tech|công nghệ/i },
  { tag: "Xã hội", patterns: /xã hội|social|cộng đồng|community|văn hóa|culture|trend/i },
  { tag: "Kinh tế", patterns: /kinh tế|economy|tài chính|finance|tiền|money|đầu tư|invest|startup/i },
  { tag: "Giới trẻ", patterns: /gen z|gen y|millennial|giới trẻ|young|youth|student|sinh viên/i },
  { tag: "Làm việc", patterns: /work|làm việc|career|nghề nghiệp|job|việc làm|remote|freelance/i },
  { tag: "Viral", patterns: /viral|trending|hot|nổi|lan truyền|chia sẻ|share/i },
  { tag: "Cuộc sống", patterns: /life|cuộc sống|sống|lifestyle|daily|ngày thường|thực tế/i },
];

export interface GeneratedPost {
  id: string;
  articleId: string;
  format: ContentFormat;
  content: string;
  imageHtml?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface PipelineSession {
  id: string;
  topic: string;
  articles: ResearchArticle[];
  selectedArticleIds: string[];
  format: ContentFormat;
  posts: GeneratedPost[];
  createdAt: string;
}
