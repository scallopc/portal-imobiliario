"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createLeadSchema, type CreateLeadInput } from "./schema";

export async function createLead(input: CreateLeadInput): Promise<{ id: string; code: string }> {
  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid lead payload");
  const data = parsed.data;
  const now = FieldValue.serverTimestamp();

  async function generateUniqueCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const n = Math.floor(Math.random() * 100000);
      const code = `L-${n.toString().padStart(5, "0")}`;
      const snap = await adminDb.collection("leads").where("code", "==", code).limit(1).get();
      if (snap.empty) return code;
    }
    throw new Error("Failed to generate unique lead code");
  }

  const code = await generateUniqueCode();
  const docRef = await adminDb.collection("leads").add({
    ...data,
    code,
    createdAt: now,
    updatedAt: now,
    lastInteraction: now,
    // Adicionar metadados adicionais
    leadScore: calculateLeadScore(data),
    isActive: true,
    tags: generateTags(data)
  });
  
  return { id: docRef.id, code };
}

// Função para calcular score do lead baseado nos dados
function calculateLeadScore(data: CreateLeadInput): number {
  let score = 0;
  
  // Score por informações completas
  if (data.name) score += 10;
  if (data.email) score += 15;
  if (data.phone) score += 15;
  
  // Score por interesses
  score += data.interests.length * 5;
  score += data.propertyTypes.length * 8;
  
  // Score por localização
  if (data.location.city && data.location.state) score += 10;
  
  // Score por interações
  score += data.interactions.length * 3;
  
  return Math.min(score, 100); // Máximo 100
}

// Função para gerar tags baseadas nos dados
function generateTags(data: CreateLeadInput): string[] {
  const tags: string[] = [];
  
  // Tags por localização
  if (data.location.city) tags.push(`cidade:${data.location.city}`);
  if (data.location.state) tags.push(`estado:${data.location.state}`);
  
  // Tags por interesses
  data.interests.forEach(interest => tags.push(`interesse:${interest}`));
  data.propertyTypes.forEach(type => tags.push(`tipo:${type}`));
  
  // Tags por faixa de preço
  if (data.priceRange?.max) {
    if (data.priceRange.max <= 200000) tags.push('faixa:baixa');
    else if (data.priceRange.max <= 500000) tags.push('faixa:média');
    else tags.push('faixa:alta');
  }
  
  // Tags por fonte
  tags.push(`fonte:${data.source}`);
  
  return tags;
}
