export interface WhatsAppInquiryContext {
  propertyName?: string;
  projectName?: string;
  location?: string;
}

/**
 * Builds a wa.me deep link with a prefilled, contextual message.
 * phone must be in international format without "+" or spaces, e.g. "919324702438".
 */
export function buildWhatsAppLink(phone: string, context?: WhatsAppInquiryContext): string {
  const name = context?.propertyName || context?.projectName;
  const message = name
    ? `Hi District One Realty, I am interested in ${name}${context?.location ? ` in ${context.location}` : ""}.`
    : "Hi District One Realty, I would like to know more about your properties in Navi Mumbai.";

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildTelLink(phone: string): string {
  return `tel:${phone}`;
}
