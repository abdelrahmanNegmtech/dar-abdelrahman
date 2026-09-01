"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/supabase/auth";
import type {
  OwnerSettingsActionResult,
  OwnerSettingsFormValues,
} from "./settings-types";

const nameRegex = /^(?=.*[a-zA-ZÀ-ÖØ-öø-ÿ])[a-zA-ZÀ-ÖØ-öø-ÿ'\-\s]+$/;
const phoneRegex = /^[+]?[\d\s\-()]{6,20}$/;

function optionalText(max: number) {
  return z.string().trim().max(max).or(z.literal(""));
}

function optionalLocationText(label: string) {
  return z
    .string()
    .trim()
    .max(80, `${label} must be at most 80 characters.`)
    .refine((value) => value.length === 0 || value.length >= 2, `${label} must be at least 2 characters.`);
}

const ownerSettingsSchema = z.object({
  address: optionalText(160),
  city: optionalLocationText("City"),
  country: optionalLocationText("Country"),
  displayName: optionalText(80),
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Full name must be at most 100 characters.")
    .regex(nameRegex, "Name must contain at least one letter and no special characters."),
  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long.")
    .refine((value) => value.length === 0 || phoneRegex.test(value), "Enter a valid phone number with country code."),
  preferredCurrency: optionalText(8),
  preferredLanguage: optionalText(40),
});

function toFieldErrors(error: z.ZodError<OwnerSettingsFormValues>) {
  const flattened = error.flatten().fieldErrors;
  const fieldErrors: Partial<Record<keyof OwnerSettingsFormValues, string>> = {};

  for (const [field, messages] of Object.entries(flattened)) {
    const firstMessage = messages?.[0];

    if (firstMessage) {
      fieldErrors[field as keyof OwnerSettingsFormValues] = firstMessage;
    }
  }

  return fieldErrors;
}

function toNullable(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export async function updateOwnerSettingsProfile(
  input: OwnerSettingsFormValues,
): Promise<OwnerSettingsActionResult> {
  const parsed = ownerSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      fieldErrors: toFieldErrors(parsed.error),
      message: "Please review the highlighted fields and try again.",
      ok: false,
    };
  }

  const { profile } = await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      address: toNullable(parsed.data.address),
      city: toNullable(parsed.data.city),
      country: toNullable(parsed.data.country),
      display_name: toNullable(parsed.data.displayName),
      full_name: parsed.data.fullName.trim(),
      phone: toNullable(parsed.data.phone),
      preferred_currency: toNullable(parsed.data.preferredCurrency),
      preferred_language: toNullable(parsed.data.preferredLanguage),
    })
    .eq("id", profile.id)
    .eq("account_type", "owner");

  if (error) {
    return {
      message: "We could not save your owner settings right now. Please try again.",
      ok: false,
    };
  }

  revalidatePath("/owner", "layout");
  revalidatePath("/owner/settings");
  revalidatePath("/owner/verification");

  return {
    message: "Owner settings saved.",
    ok: true,
  };
}
