function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
  siteUrl: import.meta.env.VITE_SITE_URL ?? "https://www.districtonerealty.com",
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? "919324702438",
  contactPhone: import.meta.env.VITE_CONTACT_PHONE ?? "+91 93247 02438",
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL ?? "districtonerealty@gmail.com",
  mapsApiKey: import.meta.env.VITE_MAPS_API_KEY ?? "",
};
