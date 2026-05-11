import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { quote, author, type = 'intro' } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured' }, { status: 500 });
    }

    const prompt = type === 'intro' 
      ? `あなたはアファメーションDJです。今から「${author}」の名言「${quote}」を読み上げます。
         その前に、ユーザーの心に寄り添い、ポジティブな気持ちにさせる20文字程度の「語りかけ」を1つだけ生成してください。
         余計な説明は不要です。メッセージのみを返してください。`
      : `名言「${quote}」の読み上げが終わりました。
         最後にユーザーの今日一日を応援する15文字程度の短い一言を生成してください。
         余計な説明は不要です。メッセージのみを返してください。`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    return NextResponse.json({ text });
  } catch (error) {
    console.error('LLM Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
