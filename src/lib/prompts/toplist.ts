import { BRAND_CONTEXT } from "../context";
import type { ResearchArticle, PostLength, ContentLanguage } from "../types";
import { lengthGuide, buildContextSection, buildMultiPostNote, buildToneSection, buildLanguageSection, buildTopicSection } from "./shared";

export function toplistPrompt(
  article: ResearchArticle,
  length: PostLength = "medium",
  allArticles?: ResearchArticle[],
  postIndex?: number,
  totalPosts?: number,
  tone: string = "default",
  customTone?: string,
  language: ContentLanguage = "vn",
  topic?: string
): string {
  return `${BRAND_CONTEXT}

## Nhiệm vụ
Viết một bài Facebook dạng TOPLIST — danh sách có thứ tự với dữ liệu cụ thể.

${buildContextSection(article, allArticles)}${buildMultiPostNote(postIndex, totalPosts)}

${buildTopicSection(topic)}

${buildToneSection(tone, customTone)}

${buildLanguageSection(language)}

## Cấu Trúc Toplist Facebook
1. HOOK (2-3 dòng): Con số gây sốc HOẶC tuyên bố táo bạo dừng ngón tay scroll
2. CONTEXT (2-3 dòng): Tại sao điều này quan trọng ngay lúc này
3. DANH SÁCH SỐ THỨ TỰ: Mỗi mục gồm tên + mũi tên (→) + chi tiết chính + số liệu khi có
4. TAKEAWAY (2-3 dòng): Pattern nào nổi lên? Ý nghĩa gì?
5. CTA: Câu hỏi gây tranh luận HOẶC kêu gọi tự nhiên

## Độ Dài
${lengthGuide[length]}

## Quy Tắc Bắt Buộc
- Mỗi mục trong list PHẢI có số liệu cụ thể
- Dùng số thứ tự (1, 2, 3...) với → cho chi tiết phụ
- Không filler, không câu chung chung
- TUYỆT ĐỐI không dùng * hay ** hay # — không markdown bất kỳ loại nào
- Không em dash (—). Không URL. Plain text hoàn toàn.
- Câu ngắn, xuống dòng nhiều`;
}
