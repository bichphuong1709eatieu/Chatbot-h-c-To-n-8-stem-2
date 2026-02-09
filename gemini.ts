
import { GoogleGenAI } from "@google/genai";

export async function getTutorResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  // Lấy API Key từ môi trường (được tự động tiêm vào)
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return "Thầy đang bảo trì bộ não, con quay lại sau nhé!";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    Bạn là 'Thầy Pi' - Gia sư Toán 8. 
    NHIỆM VỤ: Giải thích 7 hằng đẳng thức.
    PHONG CÁCH: 
    - Trả lời NGẮN GỌN (tối đa 2-3 câu).
    - Luôn dùng $ bọc công thức Toán.
    - Xưng hô 'thầy' - 'con'.
    - Không giải thích dài dòng, đi thẳng vào công thức và 1 ví dụ nhỏ.
  `;

  try {
    // QUAN TRỌNG: Lọc bỏ tin nhắn đầu tiên nếu là của 'model' (lời chào) 
    // vì Gemini yêu cầu hội thoại phải bắt đầu bằng 'user'.
    const cleanedHistory = history.filter((msg, index) => {
      if (index === 0 && msg.role === 'model') return false;
      return true;
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...cleanedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return response.text || "Thầy chưa nghe rõ, con hỏi lại nhé!";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Trả về thông báo lỗi chi tiết hơn một chút để dễ debug nhưng vẫn thân thiện
    return `Thầy đang bận chấm bài, con đợi vài giây rồi hỏi lại nhé! (Lỗi: ${error.message?.slice(0, 50) || "Kết nối"})`;
  }
}

// Giữ lại các hàm để không làm gãy các component khác
export function hasStoredApiKey(): boolean { return true; }
export function getStoredApiKey(): string { return ""; }
export function setStoredApiKey(key: string) { }
