import { z } from "zod";
import type {
  DbEnum,
} from "@/lib/supabase/database";

type SupportTicketPriority = DbEnum<"support_ticket_priority">;

const supportTicketPriorities = [
  "low",
  "medium",
  "high",
  "urgent",
] as const satisfies readonly SupportTicketPriority[];

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().min(10, "Please share a little more detail."),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().trim().min(1, "Write a message before sending.").max(1200),
});

export const notificationSchema = z.object({
  notificationId: z.string().min(1),
});

export const reviewSchema = z.object({
  accuracyRating: z.coerce.number().min(1).max(5),
  bookingId: z.string().min(1),
  cleanlinessRating: z.coerce.number().min(1).max(5),
  comment: z.string().trim().min(20, "Please write at least 20 characters.").max(1000),
  communicationRating: z.coerce.number().min(1).max(5),
  locationRating: z.coerce.number().min(1).max(5),
  rating: z.coerce.number().min(1).max(5),
  valueRating: z.coerce.number().min(1).max(5),
});

const nameRegex = /^(?=.*[a-zA-ZÀ-ÖØ-öø-ÿ])[a-zA-ZÀ-ÖØ-öø-ÿ'\-\s]+$/;
const phoneRegex = /^[+]?[\d\s\-()]{6,20}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const profileSchema = z.object({
  address: z.string().max(160, "Address must be at most 160 characters.").optional().or(z.literal("")),
  city: z.string().trim().min(2, "City must be at least 2 characters.").max(80, "City must be at most 80 characters."),
  country: z.string().trim().min(2, "Country must be at least 2 characters.").max(80, "Country must be at most 80 characters."),
  dateOfBirth: z
    .string()
    .regex(dateRegex, "Use YYYY-MM-DD format.")
    .refine(
      (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) return false;
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (date > today) return false;
        const age = today.getFullYear() - date.getFullYear();
        return age >= 5;
      },
      { message: "Date of birth must be a valid past date." },
    ),
  displayName: z.string().trim().max(80, "Display name must be at most 80 characters.").optional().or(z.literal("")),
  email: z.string().email(),
  emergencyContactName: z.string().trim().max(100, "Emergency contact name must be at most 100 characters.").optional().or(z.literal("")),
  emergencyContactPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number with country code.")
    .max(40)
    .optional()
    .or(z.literal("")),
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Full name must be at most 100 characters.")
    .regex(nameRegex, "Name must contain at least one letter and no special characters."),
  nationality: z.string().trim().min(2, "Nationality must be at least 2 characters.").max(80, "Nationality must be at most 80 characters."),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number with country code.")
    .min(6, "Enter a valid phone number.")
    .max(40, "Phone number is too long."),
  preferredCurrency: z.string().min(1, "Select a preferred currency.").max(8),
  preferredLanguage: z.string().min(1, "Select a preferred language.").max(40),
});

export const paymentMethodSchema = z.object({
  brand: z.string().min(2).max(40),
  lastFour: z.string().regex(/^[0-9A-Za-z]{4,8}$/, "Use the last four digits or a safe wallet alias."),
  provider: z.enum(["visa", "mastercard", "instapay", "vodafone_cash"]),
});

export const supportTicketSchema = z.object({
  bookingId: z.string().optional(),
  category: z.string().min(2, "Select a category."),
  message: z.string().trim().min(20, "Please describe the issue in at least 20 characters.").max(2000, "Message must not exceed 2000 characters."),
  priority: z.enum(supportTicketPriorities),
  subject: z.string().trim().min(6, "Subject must be at least 6 characters.").max(120, "Subject must not exceed 120 characters."),
});

export const supportReplySchema = z.object({
  message: z.string().trim().min(2, "Write a reply before sending.").max(1200),
  ticketId: z.string().min(1),
});

export const editReviewSchema = z.object({
  reviewId: z.string().min(1),
  accuracyRating: z.coerce.number().min(1).max(5),
  bookingId: z.string().min(1),
  cleanlinessRating: z.coerce.number().min(1).max(5),
  comment: z.string().trim().min(20, "Please write at least 20 characters.").max(1000),
  communicationRating: z.coerce.number().min(1).max(5),
  locationRating: z.coerce.number().min(1).max(5),
  rating: z.coerce.number().min(1).max(5),
  valueRating: z.coerce.number().min(1).max(5),
});

export const deleteReviewSchema = z.object({
  reviewId: z.string().min(1),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
export type EditReviewFormValues = z.infer<typeof editReviewSchema>;
export type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;
