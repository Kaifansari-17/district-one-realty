function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL ?? "https://www.districtonerealty.com",
};
