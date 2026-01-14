import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

// Función para extraer gastos con soporte multiidioma
export const analyzeExpense = async (text, lang = 'es') => {
  const targetLanguage = languageNames[lang] || "Spanish";
  
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a financial data extractor. You must respond ONLY in ${targetLanguage}.

RULES:
- Extract all expenses and income from the user's text
- Return a JSON array: [{"category": "food", "amount": -10, "label": "pizza"}]
- Expenses are negative numbers, income is positive
- "category" and "label" must be in ${targetLanguage}
- Be concise in labels (2-4 words max)

Example in ${targetLanguage}:
${lang === 'es' ? '[{"category": "comida", "amount": -15, "label": "almuerzo"}, {"category": "transporte", "amount": -5, "label": "taxi"}]' : 
  lang === 'en' ? '[{"category": "food", "amount": -15, "label": "lunch"}, {"category": "transport", "amount": -5, "label": "taxi"}]' :
  lang === 'de' ? '[{"category": "essen", "amount": -15, "label": "mittagessen"}, {"category": "transport", "amount": -5, "label": "taxi"}]' :
  '[{"category": "食物", "amount": -15, "label": "午餐"}, {"category": "交通", "amount": -5, "label": "出租车"}]'}`
        },
        { role: "user", content: text }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    const parsed = JSON.parse(chatCompletion.choices[0].message.content);
    if (Array.isArray(parsed)) return parsed;
    const key = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
    return key ? parsed[key] : (parsed.amount ? [parsed] : []);
  } catch (error) { return []; }
};

// Mapeo de idiomas a nombres en inglés (mejor reconocimiento por la IA)
const languageNames = {
  es: "Spanish",
  en: "English",
  de: "German",
  zh: "Chinese"
};

// Función getFinancialAdvice con soporte multiidioma
export const getFinancialAdvice = async (expenses, balance, topic, lang = 'es') => {
  const targetLanguage = languageNames[lang] || "Spanish";

  const systemPrompt = `You are a premium personal finance coach.

CRITICAL RULE: You must respond ONLY in ${targetLanguage}.
Even if the user asks in another language, your entire response must be in ${targetLanguage}.

CONTEXT:
- User's Current Balance: ${balance}
- Recent Activity: ${JSON.stringify(expenses.slice(-10))} (last 10 transactions)
- Topic to discuss: "${topic}"

INSTRUCTIONS:
- Be concise and professional (max 150 words).
- Use bullet points if necessary.
- If balance is negative, show concern and suggest urgent saving strategies.
- If asked about data privacy, confirm everything is stored locally.
- Be encouraging and supportive.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: topic
        }
      ],
      model: "llama-3.1-8b-instant"
    });
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    const errorMessages = {
      es: "No pude conectar con el asesor. Intenta de nuevo.",
      en: "Could not connect with the advisor. Please try again.",
      de: "Konnte keine Verbindung zum Berater herstellen. Versuchen Sie es erneut.",
      zh: "无法连接顾问。请重试。"
    };
    return errorMessages[lang] || errorMessages.es;
  }
};