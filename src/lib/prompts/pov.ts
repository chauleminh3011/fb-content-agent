import { BRAND_CONTEXT } from "../context";
import type { ResearchArticle, PostLength, ContentLanguage } from "../types";
import { lengthGuide, buildContextSection, buildMultiPostNote, buildToneSection, buildLanguageSection, buildTopicSection } from "./shared";

export function povPrompt(
  article: ResearchArticle,
  length: PostLength = "medium",
  allArticles?: ResearchArticle[],
  postIndex?: number,
  totalPosts?: number,
  tone: string = "thang-than",
  customTone?: string,
  language: ContentLanguage = "vn",
  topic?: string
): string {
  return `${BRAND_CONTEXT}

## Nhiệm vụ
Viết một bài Facebook dạng POV (Point of View / Góc Nhìn Cá Nhân). Tranh luận một quan điểm rõ ràng, dũng cảm, được backup bởi dữ liệu.

${buildContextSection(article, allArticles)}${buildMultiPostNote(postIndex, totalPosts)}

${buildTopicSection(topic)}

${buildToneSection(tone, customTone)}

${buildLanguageSection(language)}

## Cấu Trúc POV Facebook
1. HOOK (2-3 dòng): Mở bằng quan điểm phản chiều hoặc táo bạo — thách thức niềm tin thông thường
2. DỮ LIỆU (3-5 dòng): Bằng chứng với số liệu cụ thể, tên công ty, sự kiện thực tế
3. PHÂN TÍCH (3-5 dòng): Cái này thực sự có nghĩa gì. Kết nối các điểm lại.
4. STANCE (2-3 dòng): Khẳng định quan điểm. Không hedge. Không "có thể" hay "có lẽ".
5. CTA: Câu hỏi kích thích tranh luận trong comment

## Độ Dài
${lengthGuide[length]}

## Quy Tắc Bắt Buộc
- Phải tranh luận cho MỘT luận điểm rõ ràng, không phải overview cân bằng
- Dùng dữ liệu cụ thể để support mọi claim
- Đoạn ngắn, 1-2 câu mỗi đoạn, narrative không bullet point
- TUYỆT ĐỐI không dùng * hay ** hay # — không markdown bất kỳ loại nào
- Không em dash (—). Không URL. Plain text hoàn toàn.`;
}
