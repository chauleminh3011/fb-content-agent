import { BRAND_CONTEXT, FACEBOOK_WRITING_PRINCIPLES } from "../context";
import type { ResearchArticle, PostLength, ContentLanguage } from "../types";
import { lengthGuide, buildContextSection, buildMultiPostNote, buildLanguageSection, buildTopicSection } from "./shared";

export function lifeObservationPrompt(
  article: ResearchArticle,
  length: PostLength = "medium",
  allArticles?: ResearchArticle[],
  postIndex?: number,
  totalPosts?: number,
  tone: string = "reflective",
  customTone?: string,
  language: ContentLanguage = "vn",
  topic?: string
): string {
  const toneMap: Record<string, string> = {
    reflective: "Chiêm nghiệm, sâu sắc. Nói như người đã từng trải qua, không dạy đời. Giọng nhẹ nhàng nhưng để lại dư âm.",
    provocative: "Nói thẳng, không ngại gây khó chịu. Sự thật không phải lúc nào cũng dễ nghe. Mạnh, rõ, quyết.",
    satire: "Hài hước mỉa mai nhưng không độc ác. Cười về bản thân xã hội và cả chính người viết.",
    storytelling: "Bắt đầu bằng một chi tiết nhỏ cụ thể, dẫn vào insight lớn hơn. Narrative arc rõ ràng.",
    analytical: "Quan sát như một nhà xã hội học: không phán xét, chỉ mô tả và phân tích pattern.",
  };

  const activeTone = tone === "custom" && customTone
    ? customTone
    : (toneMap[tone] || toneMap.reflective);

  return `${BRAND_CONTEXT}

${FACEBOOK_WRITING_PRINCIPLES}

## Nhiệm vụ
Viết một bài Facebook theo format GÓC NHÌN KHÁC BIỆT VỀ CUỘC SỐNG (Life Observation).

Format này lấy cảm hứng từ một sự kiện/tin tức thực tế, nhưng mục đích không phải là report tin — mà là dùng nó như một "cửa sổ" để nhìn vào một sự thật phổ quát về cuộc sống, con người, xã hội.

Bài viết cần:
- Lấy từ sự kiện thực → kéo ra insight về cuộc sống nói chung
- Góc nhìn người đọc chưa nghĩ đến, hoặc nghĩ đến nhưng chưa ai nói ra
- Không phán xét, không dạy đời — chỉ quan sát và chiêm nghiệm
- Chạm đến cảm xúc phổ quát: ai đọc cũng thấy mình trong đó

${buildContextSection(article, allArticles)}${buildMultiPostNote(postIndex, totalPosts)}

${buildTopicSection(topic)}

## Giọng Văn
${activeTone}

## Cấu Trúc Bài Quan Sát Cuộc Sống

**Mở đầu (Hook bằng chi tiết cụ thể):**
- Đừng bắt đầu bằng "Cuộc sống dạy tôi rằng..." — quá sáo
- Bắt đầu bằng một chi tiết nhỏ, cụ thể, thực tế từ câu chuyện tin tức
- Kiểu: "Người đàn ông 40 tuổi đó vừa thôi việc sau 15 năm. Không phải vì sa thải. Vì ông ấy chọn vậy."
- Hoặc một nghịch lý đơn giản nhưng gây tò mò

**Phần giữa (Mở rộng quan sát):**
- Từ chi tiết cụ thể → pattern rộng hơn
- "Không phải chuyện của riêng [X]. Đây là chuyện của..."
- Dùng contrast: trước đây vs bây giờ, chúng ta nói vs chúng ta làm
- Có thể dùng ngôi "chúng ta" — tạo sự đồng cảm, không phán xét một chiều
- Dữ kiện/số liệu nếu có từ bài báo: thêm vào để bài thực hơn

**Insight/Twist:**
- Điểm lật — "Nhưng thực ra..."
- Một sự thật mà ai cũng biết nhưng ít khi nói thẳng ra
- Phải CỤ THỂ — không được chung chung kiểu "cuộc sống vốn phức tạp"

**Câu kết:**
- Có thể là một câu hỏi mở, một quan sát cuối, hoặc một chi tiết nhỏ quay lại câu mở
- Tránh kết luận đạo đức kiểu "vì vậy chúng ta nên..."
- Để người đọc tự rút ra

## Ví Dụ Phong Cách
"Người ta mất việc, câu đầu tiên bạn bè hỏi là: 'Tìm được chỗ mới chưa?'

Không ai hỏi: 'Cậu ổn không?'

Chúng ta đã quen đo người bằng output đến mức quên mất rằng họ là người.

Bản thân job title đã trở thành identity. Mất việc không còn là mất nguồn thu nhập — nó là mất danh tính.

Đó là lý do không ai chỉ đơn giản là 'nghỉ ngơi'. Luôn phải nghỉ ngơi ĐỂ chuẩn bị cho cái gì đó tiếp theo.

Chúng ta không biết tồn tại mà không productive."

## Độ Dài
${lengthGuide[length]}

## Quy Tắc Bắt Buộc
- TUYỆT ĐỐI không dùng **, *, #, markdown bất kỳ loại nào
- Không em dash (—)
- Không URL
- Plain text hoàn toàn
- Câu ngắn — xuống dòng nhiều — white space là bạn
- Không kết thúc bằng lời kêu gọi hành động lộ liễu
- Không bắt đầu bằng "Tôi muốn chia sẻ..." hay "Hôm nay tôi thấy..."

${buildLanguageSection(language)}`;
}
