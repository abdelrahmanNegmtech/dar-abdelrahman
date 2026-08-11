"use client";

import { useSyncExternalStore } from "react";

export const OWNER_PROPERTY_DRAFT_KEY = "dar-owner-property-draft";
const UPDATED_EVENT = "dar-owner-property-draft-updated";
const ASSET_DB = "dar-owner-property-assets";
const ASSET_STORE = "assets";

export type DraftStatus = "draft" | "pending_review" | "rejected";
export type DraftAsset = { id: string; name: string; type: string; size: number; builtInUrl?: string };
export type OwnerPropertyRejectionReason = {
  id: "photos" | "amenities" | "description" | "documents" | "address" | "pricing" | "details";
  icon: "image" | "list-check" | "document-text" | "receipt" | "location" | "wallet" | "home";
  title: string;
  note: string;
  action: string;
  tab: "photos" | "amenities" | "basic" | "pricing" | "policies" | "details";
  focus?: string;
};
export type OwnerPropertyDraft = {
  version: 1; status: DraftStatus; updatedAt: string;
  title: string; description: string; propertyType: string; category: string;
  city: string; neighborhood: string; building: string; address: string;
  mall: string; transport: string; restaurants: string;
  guests: string; bedrooms: string; beds: string; bathrooms: string; size: string; floor: string;
  nightlyPrice: string; weekendPrice: string; cleaningFee: string; minimumNights: string; maximumNights: string; monthlyDiscount: string;
  checkIn: string; checkOut: string; customRules: string; cancellationPolicy: string;
  elevator: boolean; approximateLocation: boolean; aiEnhance: boolean; instantBooking: boolean;
  smoking: boolean; parties: boolean; pets: boolean; idRequired: boolean; addressConfirmed: boolean;
  hasUnsubmittedChanges: boolean;
  amenities: string[]; photos: DraftAsset[]; coverPhotoId: string; documents: Record<string, DraftAsset | null>;
};

const builtInPhotos = ["living", "bedroom", "kitchen", "bathroom", "balcony", "building"].map((name) => ({ id: `builtin-${name}`, name: `${name}.png`, type: "image/png", size: 0, builtInUrl: `/add-property-thumb-${name}.png` }));

export const OWNER_PROPERTY_DRAFT_FALLBACK: OwnerPropertyDraft = {
  version: 1, status: "draft", updatedAt: "",
  title: "Modern Studio in Madinaty", description: "", propertyType: "Studio", category: "Studios & Apartments",
  city: "Madinaty", neighborhood: "B6", building: "Madinaty Heights", address: "Madinaty B6, Building 64, Apartment 32, Cairo, Egypt",
  mall: "Open Air Mall", transport: "B6 Bus Station", restaurants: "Madinaty Food Court",
  guests: "2", bedrooms: "1", beds: "1", bathrooms: "1", size: "45", floor: "3",
  nightlyPrice: "1200", weekendPrice: "1400", cleaningFee: "250", minimumNights: "2", maximumNights: "30", monthlyDiscount: "10",
  checkIn: "After 2:00 PM", checkOut: "Before 11:00 AM", customRules: "Keep noise down after 10 PM, respect neighbors and building rules.", cancellationPolicy: "Flexible",
  elevator: true, approximateLocation: true, aiEnhance: true, instantBooking: true,
  smoking: false, parties: false, pets: false, idRequired: true, addressConfirmed: true,
  hasUnsubmittedChanges: false,
  amenities: ["Wi-Fi", "Air conditioning", "Washing machine", "Smart TV", "Workspace", "Parking", "Pool", "Gym", "Balcony", "Security", "Cleaning service"],
  photos: builtInPhotos, coverPhotoId: builtInPhotos[0].id,
  documents: {
    ownerId: { id: "builtin-owner-id", name: "Ahmed ID.jpg", type: "image/jpeg", size: 0 },
    ownership: { id: "builtin-ownership", name: "Contract.pdf", type: "application/pdf", size: 0 },
    utility: null, hotelLicense: null,
  },
};

const stringKeys: Array<keyof OwnerPropertyDraft> = ["title","description","propertyType","category","city","neighborhood","building","address","mall","transport","restaurants","guests","bedrooms","beds","bathrooms","size","floor","nightlyPrice","weekendPrice","cleaningFee","minimumNights","maximumNights","monthlyDiscount","checkIn","checkOut","customRules","cancellationPolicy"];
const booleanKeys: Array<keyof OwnerPropertyDraft> = ["elevator","approximateLocation","aiEnhance","instantBooking","smoking","parties","pets","idRequired","addressConfirmed","hasUnsubmittedChanges"];

function validAsset(value: unknown): value is DraftAsset {
  if (!value || typeof value !== "object") return false;
  const asset = value as DraftAsset;
  return typeof asset.id === "string" && typeof asset.name === "string" && typeof asset.type === "string" && typeof asset.size === "number" && (asset.builtInUrl === undefined || typeof asset.builtInUrl === "string");
}

export function validateOwnerPropertyDraft(value: unknown): OwnerPropertyDraft | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const draft: OwnerPropertyDraft = structuredClone(OWNER_PROPERTY_DRAFT_FALLBACK);
  for (const key of stringKeys) if (typeof source[key] === "string") (draft as unknown as Record<string, unknown>)[key] = source[key];
  for (const key of booleanKeys) if (typeof source[key] === "boolean") (draft as unknown as Record<string, unknown>)[key] = source[key];
  if (source.status === "draft" || source.status === "pending_review" || source.status === "rejected") draft.status = source.status;
  if (typeof source.updatedAt === "string") draft.updatedAt = source.updatedAt;
  if (Array.isArray(source.amenities) && source.amenities.every((item) => typeof item === "string")) draft.amenities = source.amenities;
  if (Array.isArray(source.photos) && source.photos.every(validAsset)) draft.photos = source.photos;
  if (typeof source.coverPhotoId === "string") draft.coverPhotoId = source.coverPhotoId;
  if (source.documents && typeof source.documents === "object") {
    for (const key of ["ownerId", "ownership", "utility", "hotelLicense"]) {
      const asset = (source.documents as Record<string, unknown>)[key];
      if (asset === null || validAsset(asset)) draft.documents[key] = asset;
    }
  }
  return draft;
}

let cachedRaw: string | null | undefined;
let cachedDraft = OWNER_PROPERTY_DRAFT_FALLBACK;

export function readOwnerPropertyDraft(): OwnerPropertyDraft {
  if (typeof window === "undefined") return OWNER_PROPERTY_DRAFT_FALLBACK;
  try {
    const raw = localStorage.getItem(OWNER_PROPERTY_DRAFT_KEY);
    if (raw === cachedRaw) return cachedDraft;
    cachedRaw = raw;
    cachedDraft = raw ? validateOwnerPropertyDraft(JSON.parse(raw)) ?? OWNER_PROPERTY_DRAFT_FALLBACK : OWNER_PROPERTY_DRAFT_FALLBACK;
  } catch { cachedDraft = OWNER_PROPERTY_DRAFT_FALLBACK; }
  return cachedDraft;
}

export function writeOwnerPropertyDraft(next: OwnerPropertyDraft): boolean {
  if (typeof window === "undefined") return false;
  const valid = validateOwnerPropertyDraft(next);
  if (!valid) return false;
  try {
    valid.updatedAt = new Date().toISOString();
    const raw = JSON.stringify(valid);
    localStorage.setItem(OWNER_PROPERTY_DRAFT_KEY, raw);
    cachedRaw = raw; cachedDraft = valid;
    window.dispatchEvent(new Event(UPDATED_EVENT));
    return true;
  } catch { return false; }
}

function subscribe(onChange: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === OWNER_PROPERTY_DRAFT_KEY) onChange(); };
  window.addEventListener("storage", storage); window.addEventListener(UPDATED_EVENT, onChange);
  queueMicrotask(onChange);
  return () => { window.removeEventListener("storage", storage); window.removeEventListener(UPDATED_EVENT, onChange); };
}

export function useOwnerPropertyDraft() { return useSyncExternalStore(subscribe, readOwnerPropertyDraft, () => OWNER_PROPERTY_DRAFT_FALLBACK); }

export function patchOwnerPropertyDraft(patch: Partial<OwnerPropertyDraft>) {
  const current = readOwnerPropertyDraft();
  const changesContent = Object.keys(patch).some((key) => !["status","updatedAt","hasUnsubmittedChanges"].includes(key));
  return writeOwnerPropertyDraft({ ...current, ...(changesContent && patch.hasUnsubmittedChanges === undefined ? { hasUnsubmittedChanges: true } : null), ...patch });
}

const requiredFields: Array<keyof OwnerPropertyDraft> = ["title","description","propertyType","category","city","neighborhood","address","guests","bedrooms","beds","bathrooms","size","nightlyPrice","minimumNights","maximumNights","checkIn","checkOut"];
export function getDraftErrors(draft: OwnerPropertyDraft) {
  const errors: Partial<Record<keyof OwnerPropertyDraft, string>> = {};
  for (const key of requiredFields) if (!String(draft[key] ?? "").trim()) errors[key] = "This field is required.";
  for (const key of ["guests","bedrooms","beds","bathrooms","size","floor","nightlyPrice","weekendPrice","cleaningFee","minimumNights","maximumNights","monthlyDiscount"] as Array<keyof OwnerPropertyDraft>) {
    const value = String(draft[key] ?? "");
    if (value && (!Number.isFinite(Number(value)) || Number(value) < 0)) errors[key] = "Enter a valid non-negative number.";
  }
  if (Number(draft.maximumNights) < Number(draft.minimumNights)) errors.maximumNights = "Maximum nights must be at least the minimum.";
  if (Number(draft.monthlyDiscount) > 100) errors.monthlyDiscount = "Discount cannot exceed 100%.";
  if (!draft.photos.length) errors.photos = "Add at least one property photo.";
  if (!draft.amenities.length) errors.amenities = "Add at least one amenity.";
  if (draft.description.trim().length > 0 && draft.description.trim().length < 80) errors.description = "Add a description of at least 80 characters.";
  if (!draft.documents.ownerId) errors.documents = "Owner ID is required.";
  if (!draft.documents.ownership) errors.documents = "Ownership document is required.";
  if (!draft.addressConfirmed) errors.address = "Confirm the address pin.";
  if (!draft.cancellationPolicy) errors.cancellationPolicy = "Choose a cancellation policy.";
  return errors;
}

export function getPropertyRejectionReasons(draft: OwnerPropertyDraft): OwnerPropertyRejectionReason[] {
  const errors = getDraftErrors(draft);
  const reasons: OwnerPropertyRejectionReason[] = [];
  if (errors.photos) reasons.push({ id:"photos", icon:"image", title:"Missing property photos", note:"Please upload clear, well-lit photos that show the property.", action:"Update photos", tab:"photos" });
  if (errors.amenities) reasons.push({ id:"amenities", icon:"list-check", title:"Missing amenities information", note:"Please add details about the available amenities (e.g., Wi-Fi, AC, Kitchen, etc.).", action:"Update amenities", tab:"amenities" });
  if (errors.description) reasons.push({ id:"description", icon:"document-text", title:"Incomplete description", note:errors.description, action:"Edit description", tab:"basic", focus:"description" });
  if (!draft.documents.ownerId || !draft.documents.ownership) reasons.push({ id:"documents", icon:"receipt", title:"Missing required documents", note:"Upload the required owner ID and ownership or authorization documents.", action:"Update documents", tab:"details", focus:"documents" });
  if (errors.address) reasons.push({ id:"address", icon:"location", title:"Incomplete property address", note:errors.address, action:"Update address", tab:"basic", focus:"location" });
  if (errors.nightlyPrice || errors.weekendPrice || errors.cleaningFee || errors.minimumNights || errors.maximumNights || errors.monthlyDiscount) reasons.push({ id:"pricing", icon:"wallet", title:"Invalid pricing information", note:"Review the nightly price, fees, discounts, and minimum or maximum stay values.", action:"Update pricing", tab:"pricing" });
  const covered = new Set(["photos","amenities","description","documents","address","nightlyPrice","weekendPrice","cleaningFee","minimumNights","maximumNights","monthlyDiscount"]);
  if (Object.keys(errors).some(key=>!covered.has(key))) reasons.push({ id:"details", icon:"home", title:"Incomplete property information", note:"Complete the remaining required property details before resubmitting.", action:"Update details", tab:"basic" });
  return reasons;
}

export function getMissingItems(draft: OwnerPropertyDraft) {
  const items: string[] = [];
  const errors = getDraftErrors(draft);
  if (!draft.documents.ownership) items.push("Add ownership document");
  if (!draft.cancellationPolicy) items.push("Add cancellation policy");
  if (!draft.addressConfirmed) items.push("Confirm address pin");
  if (!draft.photos.length) items.push("Add required photos");
  if (Object.keys(errors).some((key) => !["photos","documents","address","cancellationPolicy"].includes(key))) items.push("Complete required fields");
  return items;
}

export function getCompletionScore(draft: OwnerPropertyDraft) {
  const total = requiredFields.length + 5;
  let complete = requiredFields.filter((key) => String(draft[key] ?? "").trim()).length;
  complete += Number(Boolean(draft.photos.length)) + Number(Boolean(draft.documents.ownerId)) + Number(Boolean(draft.documents.ownership)) + Number(draft.addressConfirmed) + Number(Boolean(draft.cancellationPolicy));
  return Math.round((complete / total) * 100);
}

function openAssetsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ASSET_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(ASSET_STORE);
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}

export async function storeDraftAsset(file: File): Promise<DraftAsset> {
  const id = `asset-${crypto.randomUUID()}`;
  const db = await openAssetsDb();
  await new Promise<void>((resolve, reject) => { const request = db.transaction(ASSET_STORE, "readwrite").objectStore(ASSET_STORE).put(file, id); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); });
  db.close(); return { id, name: file.name, type: file.type, size: file.size };
}

export async function deleteDraftAsset(id: string) {
  if (id.startsWith("builtin-")) return;
  const db = await openAssetsDb();
  await new Promise<void>((resolve) => { const request = db.transaction(ASSET_STORE, "readwrite").objectStore(ASSET_STORE).delete(id); request.onsuccess = request.onerror = () => resolve(); }); db.close();
}

export async function resolveDraftAsset(asset: DraftAsset): Promise<string> {
  if (asset.builtInUrl) return asset.builtInUrl;
  const db = await openAssetsDb();
  const blob = await new Promise<Blob | undefined>((resolve) => { const request = db.transaction(ASSET_STORE).objectStore(ASSET_STORE).get(asset.id); request.onsuccess = () => resolve(request.result); request.onerror = () => resolve(undefined); }); db.close();
  return blob ? URL.createObjectURL(blob) : "/property-studio-reference.png";
}
