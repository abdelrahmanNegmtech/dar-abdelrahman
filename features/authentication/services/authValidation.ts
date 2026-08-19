import type { AccountType } from "../authTypes";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{7,20}$/;
const e164PhonePattern = /^\+[1-9]\d{7,14}$/;

export function validateFullName(fullName: string) {
  return fullName.trim().length >= 2;
}

export function validateEmail(email: string) {
  return emailPattern.test(email.trim());
}

export function validatePassword(password: string) {
  return password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password);
}

export function validateOptionalPhone(phone: string) {
  return !phone.trim() || (phonePattern.test(phone.trim()) && e164PhonePattern.test(phone.trim()));
}

export function validatePhone(phone: string) {
  return e164PhonePattern.test(phone.trim());
}

export function normalizeAccountType(value: string): AccountType {
  return value === "owner" ? "owner" : "guest";
}
