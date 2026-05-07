import { BRAND_CONTEXT, FACEBOOK_WRITING_PRINCIPLES } from "../context";
import type { ResearchArticle, PostLength, ContentLanguage } from "../types";
import { lengthGuide, buildContextSection, buildMultiPostNote, buildLanguageSection } from "./shared";

export function satirePropmt(
  article: ResearchArticle,
  length: PostLength = "medium",
  allArticles?: ResearchArticle[],
  postIndex?: number,
  totalPosts?: number,
  tone: string = "satire",
  customTone?: string,
  language: ContentLanguage = "vn"
): string {
  const customToneSection = tone === "custom" && customTone
    ? `## Giọng Văn Tùy Chỉnh\n${customTone}`
    : "";

  return `${BRAND_CONTEXT}

${FACEBOOK_WRITING_PRINCIPLES}

## Nhiệm vụ
Viết một bài Facebook theo phong cách MỈA MAI XÃ HỘI (Social Satire).

Đây là format đặc trưng nhất của tài khoản này. Bài viết cần:
- Quan sát một hiện tượng xã hội từ nguồn tin tức thực
- Lật ngược góc nhìn thông thường — chỉ ra cái thật ẩn bên dưới vẻ ngoài
- Dùng mỉa mai thông minh, không phán xét đạo đức
- Làm người đọc vừa cười vừa "ừ đúng thật"

${buildContextSection(article, allArticles)}${buildMultiPostNote(postIndex, totalPosts)}

${customToneSection}

## Cấu Trúc Bài Mỉa Mai Xã Hội

**Dòng 1-3 (HOOK — bắt buộc gây tò mò hoặc gật đầu ngay):**
- Nêu ra một nghịch lý hoặc mâu thuẫn trong xã hội
- Kiểu: "Người ta hay nói [X]. Ít ai nói thêm: [Y thực tế]."
- Hoặc: "Chúng ta gọi đó là [tên đẹp]. Nhưng bản chất là [thực tế]."

**Phần giữa (BODY — dữ liệu + quan sát cụ thể):**
- Lấy 1-2 dữ kiện/số liệu từ bài báo làm bằng chứng
- Dẫn thêm quan sát từ thực tế xã hội (không phải lý thuyết)
- Mỗi đoạn 2-3 câu, xuống dòng nhiều
- Dùng đối lập: "Họ nói... / Thực ra là...", "Trên bề mặt... / Bên dưới..."

**Twist/Insight (CÁI LẬT NGƯỢC):**
- Đây là linh hồn của bài
- Một quan sát bất ngờ mà ai cũng cảm nhận được nhưng chưa ai nói thẳng ra
- Không được cliché, phải cụ thể và thực tế

**Câu kết (LANDING — "đau" hoặc để lại suy nghĩ):**
- 1-2 câu
- Không kết luận hoàn toàn — để người đọc tự điền vào
- Hoặc một câu hỏi gây tranh luận nhẹ

## Ví Dụ Phong Cách
"Startup Việt vừa gọi vốn 10 triệu đô.

Báo chí gọi là kỳ tích. CEO đăng ảnh cầm tấm séc cười tươi.

Nhân viên công ty nhận thông báo: lương tháng này delay 2 tuần do 'dòng tiền chưa về'.

Gọi vốn xong rồi. Nhưng từ ai, bao nhiêu cổ phần, dilution như thế nào — không ai hỏi.

Chúng ta đang sống trong thời đại mà announcement quan trọng hơn accountability."

## Độ Dài
${lengthGuide[length]}

## Quy Tắc Bắt Buộc
- TUYỆT ĐỐI không dùng **, *, #, markdown bất kỳ loại nào
- Không em dash (—), dùng dấu phẩy hoặc dấu chấm
- Không URL trong bài
- Plain text hoàn toàn
- Câu ngắn, mạnh — tránh câu phức tạp dài dòng
- Không bắt đầu bằng "Hôm nay tôi muốn nói về..." hay "Bài viết này..." — vào thẳng vấn đề
- Không kết thúc bằng "Hãy để lại bình luận nhé!" một cách lộ liễu

${buildLanguageSection(language)}`;
}
