import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { quote, author, type = 'intro' } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured' }, { status: 500 });
    }

    const prompt = type === 'intro' 
      ? `あなたは控えめで思慮深いナビゲーターです。今から「${author}」の言葉を共有します。
         押し付けがましくなく、ユーザーの日常にそっと寄り添うような、15文字程度の短い導入の一言を生成してください。
         「どや」という感じを避け、自然なトーンで。余計な説明は不要です。`
      : `名言の共有が終わりました。
         最後におまじないのように、ユーザーの心が少し軽くなるような10文字程度の短い一言を生成してください。
         余計な説明は不要です。`;

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
