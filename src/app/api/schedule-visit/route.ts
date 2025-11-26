import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { name, email, date, time, phone, propertyTitle, propertyId } = await req.json();
    
    console.log('📅 Dados recebidos:', { name, email, date, time, phone, propertyTitle, propertyId });
    
    if (!name || !email || !date || !time || !propertyTitle || !propertyId) {
      console.error('❌ Campos obrigatórios faltando');
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' }, 
        { status: 400 }
      );
    }

    const startTime = new Date(`${date}T${time}:00-03:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const visitData = {
      name,
      email,
      phone: phone || null,
      propertyTitle,
      propertyId,
      date,
      time,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('visits').add(visitData);
    console.log('✅ Visita salva no Firestore:', docRef.id);

    return NextResponse.json({
      success: true,
      message: "Agendamento realizado com sucesso!",
      visitId: docRef.id,
    });
  } catch (error: any) {
    console.error("❌ Erro ao processar agendamento:", error.message);
    return NextResponse.json({ 
      success: false, 
      error: "Erro ao processar agendamento. Tente novamente." 
    }, { status: 500 });
  }
}
