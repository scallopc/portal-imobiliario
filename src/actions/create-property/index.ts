"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createPropertySchema, type CreatePropertyInput } from "./schema";

export async function createProperty(input: CreatePropertyInput): Promise<{ id: string }> {
  const parsed = createPropertySchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid property payload");
  const data = parsed.data;
  const now = FieldValue.serverTimestamp();

  async function generateUniqueCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const n = Math.floor(Math.random() * 100000);
      const code = `P-${n.toString().padStart(5, "0")}`;
      const snap = await adminDb.collection("properties").where("code", "==", code).limit(1).get();
      if (snap.empty) return code;
    }
    throw new Error("Failed to generate unique property code");
  }

  const code = await generateUniqueCode();
  const docRef = await adminDb.collection("properties").add({
    ...data,
    code,
    createdAt: now,
    updatedAt: now,
  });
  return { id: code };
}
