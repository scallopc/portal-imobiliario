"use server";

import { adminDb } from "@/lib/firebase-admin";
import { getLinkParamsSchema, linkSchema, type LinkDTO } from "./schema";

export async function getLink(params: { id: string }): Promise<LinkDTO> {
  const parsed = getLinkParamsSchema.safeParse(params)
  if (!parsed.success) throw new Error("Invalid link ID")

  const doc = await adminDb.collection("links").doc(parsed.data.id).get()
  if (!doc.exists) throw new Error("Link não encontrado")

  const d = doc.data() as any
  const link: LinkDTO = {
    id: doc.id,
    type: d.type,
    title: d.title ?? "",
    url: d.url ?? "",
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
    updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt,
  }
  const validated = linkSchema.safeParse(link)
  if (!validated.success) throw new Error("Invalid link data")
  return validated.data
}


