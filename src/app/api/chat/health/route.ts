import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const checks = {
      gemini: false,
      firebase: false,
      timestamp: new Date().toISOString()
    };

    // Verificar Gemini API
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY não configurada");
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash" 
      });

      // Teste rápido
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: 'Health check - responda apenas "OK"' }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 5
        }
      });

      if (result.response.text()) {
        checks.gemini = true;
      }
    } catch (error) {
      console.error("Gemini health check failed:", error);
    }

    // Verificar Firebase
    try {
      const testQuery = await adminDb.collection('properties').limit(1).get();
      checks.firebase = true;
    } catch (error) {
      console.error("Firebase health check failed:", error);
    }

    const isHealthy = checks.gemini && checks.firebase;

    return NextResponse.json(
      { 
        status: isHealthy ? 'healthy' : 'unhealthy',
        checks,
        message: isHealthy ? 'Chat funcionando normalmente' : 'Alguns serviços estão indisponíveis'
      }, 
      { status: isHealthy ? 200 : 503 }
    );

  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Erro ao verificar status do chat',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }, 
      { status: 500 }
    );
  }
}
