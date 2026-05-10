import type { ResearchArticle, PostLength, ContentLanguage } from "../types";

// Facebook-optimized length guides — đo bằng từ tiếng Việt
export const lengthGuide: Record<PostLength, string> = {
  short: "Tổng độ dài: 80-150 từ. Súc tích, mạnh mẽ. Mỗi câu phải kiếm được chỗ đứng. Tối đa 1-2 emoji.",
  medium: "Tổng độ dài: 200-350 từ. Facebook post chuẩn — đủ chất, không lan man. Tối đa 2-3 emoji.",
  long: "Tổng độ dài: 400-600 từ. Bài viết chiều sâu — nhiều đoạn, phân tích thấu đáo. Emoji dùng để phân chia section, không phải trang trí.",
};

// Facebook-optimized tone guides
export const toneGuide: Record<string, string> = {
  satire: "Giọng mỉa mai thông minh. Chua cay nhưng không độc ác. Quan sát hiện tượng rồi lật ngược — làm người đọc vừa cười vừa 'ừ đúng thật'. Không phán xét đạo đức, chỉ mô tả thực tế.",
  reflective: "Giọng chiêm nghiệm. Nói như người đã từng trải, không dạy đời. Nhẹ nhàng nhưng để lại dư âm. Dùng 'chúng ta' để tạo đồng cảm.",
  provocative: "Nói thẳng, không ngại gây khó chịu. Sự thật không phải lúc nào cũng dễ nghe. Câu ngắn, mạnh, quyết. Gây tranh luận nhẹ để tăng comment.",
  storytelling: "Bắt đầu bằng chi tiết cụ thể nhỏ, dẫn vào insight lớn hơn. Narrative arc rõ: cụ thể → pattern → sự thật phổ quát.",
  analytical: "Dữ liệu, logic, pattern recognition. Như nhà xã hội học viết cho người thông minh: không phán xét, chỉ mô tả và phân tích.",
  default: "Data-driven, tự tin, dễ tiếp cận. Không học thuật, không hype. Thực tế và cụ thể.",
};

export function formatArticle(a: ResearchArticle): string {
  return `Tiêu đề: ${a.title}\nNguồn: ${a.source}\nNgày: ${a.date}\nTóm tắt: ${a.summary}${a.keyData && a.keyData !== "News" ? `\nDữ liệu: ${a.keyData}` : ""}`;
}

export function buildContextSection(
  article: ResearchArticle,
  allArticles?: ResearchArticle[]
): string {
  if (allArticles && allArticles.length > 1) {
    return `## Tất Cả Bài Báo Nguồn (dùng làm context/dữ liệu nền)\n${allArticles.map((a, i) => `${i + 1}. ${formatArticle(a)}`).join("\n\n")}\n\n## Bài Báo Chính (focus chính)\n${formatArticle(article)}`;
  }
  return `## Bài Báo Nguồn\n${formatArticle(article)}`;
}

export function buildMultiPostNote(postIndex?: number, totalPosts?: number): string {
  if (totalPosts && totalPosts > 1 && postIndex !== undefined) {
    return `\n\n## Lưu Ý Multi-post\nĐây là bài ${postIndex + 1} trong tổng số ${totalPosts} bài. Mỗi bài PHẢI có góc nhìn/angle hoàn toàn khác nhau. Không được lặp nội dung giữa các bài.`;
  }
  return "";
}

export function buildToneSection(tone: string, customTone?: string): string {
  if (tone === "custom" && customTone) {
    return `## Giọng Văn\n${customTone}`;
  }
  return `## Giọng Văn\n${toneGuide[tone] || toneGuide.default}`;
}

export function buildTopicSection(topic?: string): string {
  if (!topic) return "";
  return `## Chủ Đề Gốc Từ User
Chủ đề user yêu cầu: "${topic}"
- Bài viết PHẢI liên quan trực tiếp đến chủ đề "${topic}"
- Dùng bài báo nguồn làm dữ liệu/góc nhìn, nhưng LUÔN quay về chủ đề "${topic}"
- Nếu bài báo không liên quan đến "${topic}", hãy bỏ qua bài báo và viết trực tiếp về "${topic}" dựa trên kiến thức của bạn`;
}

export function buildLanguageSection(language: ContentLanguage = "vn"): string {
  if (language === "vn") {
    return `## Ngôn Ngữ
Viết TOÀN BỘ bài bằng tiếng Việt.
- Tiếng Việt tự nhiên, văn nói — không phải văn dịch máy hay văn báo cáo
- Giữ nguyên các thuật ngữ kỹ thuật/nước ngoài phổ biến khi cần (AI, startup, viral, v.v.)
- Target audience: người Việt 25-40 tuổi, dân văn phòng/freelancer/startup
- Optimize cho Facebook feed: đoạn ngắn, câu mạnh, xuống dòng nhiều
- Câu mỉa mai phải tự nhiên theo kiểu Việt Nam, không phải dịch từ English`;
  }
  return `## Language
Write in English only. Short paragraphs, direct sentences. Facebook-optimized: white space is your friend.`;
}
