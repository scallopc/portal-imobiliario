import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: process.env.OPENROUTER_BASE_URL!,
  defaultHeaders: {
    "HTTP-Referer": "",
    "X-Title": "",
  },
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages,
    });
    return NextResponse.json({
      reply: completion.choices?.[0]?.message?.content ?? "",
    });
  } catch (error: any) {
    console.error("Erro na rota", error);
    return NextResponse.json({ error: error?.message || "Erro interno" }, { status: 500 });
  }
}
