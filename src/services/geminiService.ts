
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, Creditor } from "../types.js";

/**
 * Extracts specific recipient bank details (Name, Account, Sheba) for adding a new creditor.
 */
// Helper function to wait/sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const extractCreditorInfo = async (base64Image: string, retries = 2): Promise<{ name: string, account: string, sheba: string }> => {
  console.log('🔍 [extractCreditorInfo] Starting extraction...');
  const apiKey = process.env.API_KEY
  
  if (!apiKey) {
    console.error('❌ [extractCreditorInfo] API_KEY not found');
    throw new Error('API_KEY environment variable is not set');
  }
  
  console.log('✅ [extractCreditorInfo] API Key found, length:', apiKey.length);
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    شما یک متخصص تحلیل مستندات بانکی هستید.
    تصویر ارسالی یک فیش بانکی یا اسکرین‌شات از مشخصات حساب است.
    وظیفه شما استخراج دقیق نام صاحب حساب، شماره حساب و شماره شبا است.
    شماره شبا را بدون IR استخراج کنید (فقط ۲۴ رقم).
    اگر اطلاعاتی یافت نشد، فیلد مربوطه را خالی بگذارید.
    فقط و فقط خروجی JSON بازگردانید.
  `;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const startTime = Date.now();
    try {
      console.log(`🔄 [extractCreditorInfo] Attempt ${attempt + 1}/${retries + 1}`);
      console.log('📤 [extractCreditorInfo] Sending request to Gemini API...');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: "استخراج اطلاعات حساب بانکی از تصویر:" },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1] || base64Image,
              },
            },
          ],
        },
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              account: { type: Type.STRING },
              sheba: { type: Type.STRING, description: "24 digit number without IR" }
            }
          },
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`✅ [extractCreditorInfo] Response received in ${duration}ms`);
      
      const result = JSON.parse(response.text || "{}");
      console.log('✅ [extractCreditorInfo] Extraction successful');
      return result;
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.error(`❌ [extractCreditorInfo] Failed (attempt ${attempt + 1}/${retries + 1}) after ${duration}ms`);
      console.error('Error status:', error.status || error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Check if it's a quota/rate limit error (429)
      if (error.status === 429 || error.code === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        if (attempt < retries) {
          // Extract retry delay from error message if available, otherwise use 20 seconds
          const retryDelay = error.retryDelay || 20000;
          console.log(`Quota exceeded. Retrying in ${retryDelay / 1000} seconds...`);
          await sleep(retryDelay);
          continue; // Retry
        } else {
          throw new Error("محدودیت استفاده از API تمام شده. لطفاً چند دقیقه صبر کرده و دوباره تلاش کنید.");
        }
      }
      
      // For other errors, throw immediately
      throw new Error("خطا در بازخوانی تصویر حساب.");
    }
  }
  
  throw new Error("خطا در بازخوانی تصویر حساب.");
};

export const extractReceiptData = async (base64Image: string, creditors: Creditor[] = [], retries = 2): Promise<ExtractedData> => {
  console.log('🔍 [extractReceiptData] Starting extraction...');
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ [extractReceiptData] API_KEY not found');
    throw new Error('API_KEY environment variable is not set');
  }
  
  console.log('✅ [extractReceiptData] API Key found, length:', apiKey.length);
  console.log('📊 [extractReceiptData] Creditors count:', creditors.length);
  const ai = new GoogleGenAI({ apiKey });
  
  const creditorsContext = creditors.map(c => 
    `ID: ${c.id}, Name: ${c.name}, Account: ${c.accountNumber}, Sheba: ${c.shebaNumber}`
  ).join('\n');

  const systemInstruction = `
    شما یک متخصص حرفه‌ای در تحلیل فیش‌های بانکی هستید.
    وظیفه شما بررسی تصویر و استخراج اطلاعات دقیق و تطبیق آن با لیست طلبکاران ما است.
    
    لیست طلبکاران ثبت شده ما (صراف):
    ${creditorsContext || "هنوز طلبکاری ثبت نشده است."}

    پروتکل تحلیل:
    ۱. تشخیص اصالت: آیا تصویر یک فیش واریز معتبر است؟
    ۲. استخراج فیلدها: مبلغ (amount)، تاریخ (date)، کد پیگیری (refNumber)، واریز کننده (sender)، دریافت کننده (receiver).
    ۳. تطبیق هوشمند: نام دریافت‌کننده، شماره حساب یا شماره شبای موجود در فیش را با لیست طلبکاران بالا مقایسه کنید.
    ۴. اگر فیش متعلق به یکی از افراد لیست است، "matchedCreditorId" را برابر با ID آن شخص قرار دهید.
    ۵. اعداد فارسی را به انگلیسی تبدیل کنید.
    
    خروجی فقط به فرمت JSON باشد.
  `;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const startTime = Date.now();
    try {
      console.log(`🔄 [extractReceiptData] Attempt ${attempt + 1}/${retries + 1}`);
      console.log('📤 [extractReceiptData] Sending request to Gemini API...');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: "تحلیل و تطبیق هوشمند فیش با لیست صراف:" },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1] || base64Image,
              },
            },
          ],
        },
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isReceipt: { type: Type.BOOLEAN },
              amount: { type: Type.NUMBER },
              date: { type: Type.STRING },
              refNumber: { type: Type.STRING },
              sender: { type: Type.STRING },
              receiver: { type: Type.STRING },
              description: { type: Type.STRING },
              matchedCreditorId: { type: Type.STRING, description: "ID طلبکار تطبیق داده شده از لیست" },
              dynamicFields: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    value: { type: Type.STRING }
                  },
                  required: ["key", "value"]
                }
              }
            },
            required: ["isReceipt"]
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      
      if (data.isReceipt === false) {
        throw new Error(data.description || "تصویر ارسالی به عنوان فیش معتبر شناسایی نشد.");
      }

      const dynamicFieldsRecord: Record<string, string> = {};
      if (data.dynamicFields) {
        data.dynamicFields.forEach((f: any) => dynamicFieldsRecord[f.key] = f.value);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`✅ [extractReceiptData] Response received in ${duration}ms`);
      console.log('✅ [extractReceiptData] Extraction successful');
      
      return {
        amount: data.amount || 0,
        date: data.date || "",
        refNumber: data.refNumber || "",
        sender: data.sender || "",
        receiver: data.receiver || "",
        description: data.description || "",
        matchedCreditorId: data.matchedCreditorId || undefined,
        dynamicFields: dynamicFieldsRecord
      };
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.error(`❌ [extractReceiptData] Failed (attempt ${attempt + 1}/${retries + 1}) after ${duration}ms`);
      console.error('Error status:', error.status || error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Check if it's a quota/rate limit error (429)
      if (error.status === 429 || error.code === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        if (attempt < retries) {
          const retryDelay = error.retryDelay || 20000;
          console.log(`Quota exceeded. Retrying in ${retryDelay / 1000} seconds...`);
          await sleep(retryDelay);
          continue; // Retry
        } else {
          throw new Error("محدودیت استفاده از API تمام شده. لطفاً چند دقیقه صبر کرده و دوباره تلاش کنید.");
        }
      }
      
      // For other errors, throw immediately
      throw new Error(error.message || "خطا در پردازش تصویر.");
    }
  }
  
  throw new Error("خطا در پردازش تصویر.");
};
