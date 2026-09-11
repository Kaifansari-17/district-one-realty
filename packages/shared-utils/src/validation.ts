const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidIndianPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, "").slice(-10);
  return INDIAN_PHONE_REGEX.test(digitsOnly);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}
