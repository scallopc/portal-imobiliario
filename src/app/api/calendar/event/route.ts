import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const eventData = await request.json();

    const visitData = {
      summary: eventData.summary,
      description: eventData.description,
      startTime: eventData.start.dateTime,
      endTime: eventData.end.dateTime,
      timeZone: eventData.start.timeZone,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('visits').add(visitData);

    return NextResponse.json({
      success: true,
      visitId: docRef.id,
      message: "Visita agendada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar visita:", error);
    return NextResponse.json({ 
      error: "Falha ao criar visita" 
    }, { status: 500 });
  }
}
