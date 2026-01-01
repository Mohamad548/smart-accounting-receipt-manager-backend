import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, Creditor } from "../types.js";

/**
 * Extracts specific recipient bank details (Name, Account, Sheba) for adding a new creditor.
 */
export const extractCreditorInfo = async (base64Image: string): Promise<{ name: string, account: string, sheba: string }> => {
  console.log('🔍 [extractCreditorInfo] Starting creditor info extraction...');
  
  // Check API key
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error('❌ [extractCreditorInfo] API_KEY is not set in environment variables');
    throw new Error("API Key تنظیم نشده است. لطفاً API_KEY را در environment variables تنظیم کنید.");
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

  try {
    // Validate image data
    const imageData = base64Image.split(",")[1] || base64Image;
    if (!imageData || imageData.length < 100) {
      console.error('❌ [extractCreditorInfo] Invalid image data - too short or empty');
      throw new Error("داده‌های تصویر نامعتبر است. لطفاً یک تصویر معتبر ارسال کنید.");
    }
    
    console.log('📸 [extractCreditorInfo] Image data length:', imageData.length);
    console.log('🔄 [extractCreditorInfo] Sending request to Gemini API...');
    const startTime = Date.now();
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: "استخراج اطلاعات حساب بانکی از تصویر:" },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData,
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
    console.log(`✅ [extractCreditorInfo] Gemini API responded successfully in ${duration}ms`);
    
    const responseText = response.text || "{}";
    console.log('📄 [extractCreditorInfo] Response text length:', responseText.length);
    
    try {
      const parsed = JSON.parse(responseText);
      console.log('✅ [extractCreditorInfo] Successfully parsed response:', {
        hasName: !!parsed.name,
        hasAccount: !!parsed.account,
        hasSheba: !!parsed.sheba
      });
      return parsed;
    } catch (parseError: any) {
      console.error('❌ [extractCreditorInfo] Failed to parse JSON response:', parseError);
      console.error('📄 [extractCreditorInfo] Raw response:', responseText.substring(0, 500));
      throw new Error("خطا در پردازش پاسخ مدل هوش مصنوعی. لطفاً دوباره تلاش کنید.");
    }
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      status: error.status || error.code,
      name: error.name,
      stack: error.stack
    };
    
    console.error('❌ [extractCreditorInfo] Creditor extraction failed');
    console.error('📋 [extractCreditorInfo] Error details:', JSON.stringify(errorDetails, null, 2));
    
    // Handle specific error types
    if (error.status === 429 || error.code === 429) {
      console.error('⚠️ [extractCreditorInfo] Quota limit exceeded');
      throw new Error("محدودیت Quota: تعداد درخواست‌های شما تمام شده است. لطفاً چند دقیقه صبر کنید.");
    } else if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      console.error('⚠️ [extractCreditorInfo] API key issue');
      throw new Error("API Key معتبر نیست. لطفاً API_KEY را بررسی کنید.");
    } else if (error.message?.includes('quota')) {
      console.error('⚠️ [extractCreditorInfo] Quota issue');
      throw new Error("Quota تمام شده است. لطفاً چند دقیقه صبر کنید.");
    } else if (error.message) {
      // Preserve original error message if it's meaningful
      throw new Error(error.message);
    } else {
      throw new Error("خطا در بازخوانی تصویر حساب. لطفاً دوباره تلاش کنید.");
    }
  }
};

export const extractReceiptData = async (base64Image: string, creditors: Creditor[] = []): Promise<ExtractedData> => {
  console.log('🔍 [extractReceiptData] Starting receipt data extraction...');
  console.log('📋 [extractReceiptData] Creditors count:', creditors.length);
  
  // Check API key
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error('❌ [extractReceiptData] API_KEY is not set in environment variables');
    throw new Error("API Key تنظیم نشده است. لطفاً API_KEY را در environment variables تنظیم کنید.");
  }
  
  console.log('✅ [extractReceiptData] API Key found, length:', apiKey.length);
  
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

  try {
    // Validate image data
    const imageData = base64Image.split(",")[1] || base64Image;
    if (!imageData || imageData.length < 100) {
      console.error('❌ [extractReceiptData] Invalid image data - too short or empty');
      throw new Error("داده‌های تصویر نامعتبر است. لطفاً یک تصویر معتبر ارسال کنید.");
    }
    
    console.log('📸 [extractReceiptData] Image data length:', imageData.length);
    console.log('🔄 [extractReceiptData] Sending request to Gemini API...');
    const startTime = Date.now();
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: "تحلیل و تطبیق هوشمند فیش با لیست صراف:" },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData,
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

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ [extractReceiptData] Gemini API responded successfully in ${duration}ms`);
    
    const responseText = response.text || "{}";
    console.log('📄 [extractReceiptData] Response text length:', responseText.length);
    
    try {
      const data = JSON.parse(responseText);
      console.log('✅ [extractReceiptData] Successfully parsed response:', {
        isReceipt: data.isReceipt,
        hasAmount: !!data.amount,
        hasDate: !!data.date,
        hasRefNumber: !!data.refNumber,
        matchedCreditorId: data.matchedCreditorId
      });
      
      if (data.isReceipt === false) {
        console.warn('⚠️ [extractReceiptData] Image not recognized as valid receipt');
        throw new Error(data.description || "تصویر ارسالی به عنوان فیش معتبر شناسایی نشد.");
      }

      const dynamicFieldsRecord: Record<string, string> = {};
      if (data.dynamicFields) {
        data.dynamicFields.forEach((f: any) => dynamicFieldsRecord[f.key] = f.value);
      }

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
    } catch (parseError: any) {
      console.error('❌ [extractReceiptData] Failed to parse JSON response:', parseError);
      console.error('📄 [extractReceiptData] Raw response:', responseText.substring(0, 500));
      throw new Error("خطا در پردازش پاسخ مدل هوش مصنوعی. لطفاً دوباره تلاش کنید.");
    }
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      status: error.status || error.code,
      name: error.name,
      stack: error.stack
    };
    
    console.error('❌ [extractReceiptData] Receipt extraction failed');
    console.error('📋 [extractReceiptData] Error details:', JSON.stringify(errorDetails, null, 2));
    
    // Handle specific error types
    if (error.status === 429 || error.code === 429) {
      console.error('⚠️ [extractReceiptData] Quota limit exceeded');
      throw new Error("محدودیت Quota: تعداد درخواست‌های شما تمام شده است. لطفاً چند دقیقه صبر کنید.");
    } else if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      console.error('⚠️ [extractReceiptData] API key issue');
      throw new Error("API Key معتبر نیست. لطفاً API_KEY را بررسی کنید.");
    } else if (error.message?.includes('quota')) {
      console.error('⚠️ [extractReceiptData] Quota issue');
      throw new Error("Quota تمام شده است. لطفاً چند دقیقه صبر کنید.");
    } else if (error.message) {
      // Preserve original error message if it's meaningful
      throw new Error(error.message);
    } else {
      throw new Error("خطا در پردازش تصویر. لطفاً دوباره تلاش کنید.");
    }
  }
};
