import { BRAND_CONTEXT } from "../context";
import type { ResearchArticle, PostLength, ContentLanguage } from "../types";
import { lengthGuide, buildContextSection, buildMultiPostNote, buildToneSection, buildLanguageSection, buildTopicSection } from "./shared";

export function howToPrompt(
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
Viết một bài Facebook dạng HOW-TO — hướng dẫn cụ thể giúp người đọc đạt được một kết quả nhất định.

${buildContextSection(article, allArticles)}${buildMultiPostNote(postIndex, totalPosts)}

${buildTopicSection(topic)}

${buildToneSection(tone, customTone)}

${buildLanguageSection(language)}

## Cấu Trúc How-to Facebook
1. HOOK (2-3 dòng): Hứa hẹn kết quả cụ thể. "Cách [đạt X] trong [thời gian]" hoặc "Hầu hết người đều làm sai [X]. Đây là cách đúng."
2. TẠI SAO (2-3 dòng): Tại sao quan trọng, cái gì đang bị bỏ lỡ, cái giá của việc không làm
3. CÁC BƯỚC (đánh số, 3-7 bước): Mỗi bước gồm:
   - Động từ hành động rõ ràng (Thiết lập, Cấu hình, Theo dõi, v.v.)
   - Tại sao nó hiệu quả (1 câu)
   - Tool, số liệu, hoặc ví dụ cụ thể khi có thể
4. MẸO (1-2 dòng): Một shortcut hoặc insight không hiển nhiên
5. KẾT QUẢ (1-2 dòng): Họ sẽ đạt được gì nếu làm theo
6. CTA: "Thử bước 1 hôm nay" hoặc câu hỏi engagement

## Độ Dài
${lengthGuide[length]}

## Quy Tắc Bắt Buộc
- Mỗi bước phải cụ thể và actionable — không chung chung
- Dùng tool thật, số liệu thật, ví dụ thật
- Giọng: mentor nói với peer, không phải giảng bài
- TUYỆT ĐỐI không dùng * hay ** hay # — không markdown bất kỳ loại nào
- Không em dash (—). Không URL. Plain text hoàn toàn.`;
}
