import { BRAND_CONTEXT } from "../context";
import type { ResearchArticle, PostLength, ContentLanguage } from "../types";
import { lengthGuide, buildContextSection, buildMultiPostNote, buildToneSection, buildLanguageSection, buildTopicSection } from "./shared";

export function caseStudyPrompt(
  article: ResearchArticle,
  length: PostLength = "medium",
  allArticles?: ResearchArticle[],
  postIndex?: number,
  totalPosts?: number,
  tone: string = "phan-tich",
  customTone?: string,
  language: ContentLanguage = "vn",
  topic?: string
): string {
  return `${BRAND_CONTEXT}

## Nhiệm vụ
Viết một bài Facebook dạng CASE STUDY — deep-dive vào MỘT công ty/sự kiện với narrative arc rõ ràng.

${buildContextSection(article, allArticles)}${buildMultiPostNote(postIndex, totalPosts)}

${buildTopicSection(topic)}

${buildToneSection(tone, customTone)}

${buildLanguageSection(language)}

## Cấu Trúc Case Study Facebook
1. HOOK (2-3 dòng): Mở bằng kết quả/con số ấn tượng nhất — bắt người đọc tự hỏi "sao lại được vậy?"
2. CONTEXT (2-3 dòng): Vấn đề ban đầu là gì. Thị trường trông như thế nào trước đó.
3. HỌ ĐÃ LÀM GÌ (3-5 dòng): Chiến lược cụ thể — tên, số liệu, đối tác, timeline
4. KẾT QUẢ (2-3 dòng): Con số kết quả cụ thể
5. BÀI HỌC (2-3 dòng): Takeaway không hiển nhiên — không phải "kiên trì sẽ thành công"
6. CTA: Câu hỏi hoặc quan sát mở

## Độ Dài
${lengthGuide[length]}

## Quy Tắc Bắt Buộc
- Focus vào MỘT công ty/thực thể duy nhất, chiều sâu hơn chiều rộng
- Arc: Vấn đề → Hành động → Kết quả → Bài học
- Số liệu cụ thể xuyên suốt
- Narrative style, đoạn ngắn
- TUYỆT ĐỐI không dùng * hay ** hay # — không markdown bất kỳ loại nào
- Không em dash (—). Không URL. Plain text hoàn toàn.`;
}
