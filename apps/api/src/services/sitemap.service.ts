import { PublishStatus } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { env } from "@/config/env";

interface SitemapUrl {
  loc: string;
  lastmod?: Date;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
}

const STATIC_PAGES: Omit<SitemapUrl, "lastmod">[] = [
  { loc: "/", changefreq: "daily", priority: 1 },
  { loc: "/properties", changefreq: "daily", priority: 0.9 },
  { loc: "/projects", changefreq: "daily", priority: 0.8 },
  { loc: "/builders", changefreq: "weekly", priority: 0.6 },
  { loc: "/locations", changefreq: "weekly", priority: 0.6 },
  { loc: "/about", changefreq: "monthly", priority: 0.4 },
  { loc: "/contact", changefreq: "monthly", priority: 0.4 },
  { loc: "/blog", changefreq: "weekly", priority: 0.5 },
];

function toXmlUrl({ loc, lastmod, changefreq, priority }: SitemapUrl): string {
  const parts = [`<loc>${env.PUBLIC_WEB_URL}${loc}</loc>`];
  if (lastmod) parts.push(`<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>`);
  if (changefreq) parts.push(`<changefreq>${changefreq}</changefreq>`);
  if (priority !== undefined) parts.push(`<priority>${priority}</priority>`);
  return `<url>${parts.join("")}</url>`;
}

export async function generateSitemapXml(): Promise<string> {
  const [properties, projects, builders, locations, blogs] = await Promise.all([
    prisma.property.findMany({
      where: { publishStatus: PublishStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
    }),
    prisma.project.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.builder.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.location.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.blog.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const urls: SitemapUrl[] = [
    ...STATIC_PAGES,
    ...properties.map((p) => ({ loc: `/properties/${p.slug}`, lastmod: p.updatedAt, changefreq: "weekly" as const, priority: 0.7 })),
    ...projects.map((p) => ({ loc: `/projects/${p.slug}`, lastmod: p.updatedAt, changefreq: "weekly" as const, priority: 0.7 })),
    ...builders.map((b) => ({ loc: `/builders/${b.slug}`, lastmod: b.updatedAt, changefreq: "monthly" as const, priority: 0.5 })),
    ...locations.map((l) => ({ loc: `/locations/${l.slug}`, lastmod: l.updatedAt, changefreq: "weekly" as const, priority: 0.6 })),
    ...blogs.map((b) => ({ loc: `/blog/${b.slug}`, lastmod: b.updatedAt, changefreq: "monthly" as const, priority: 0.4 })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(toXmlUrl)
    .join("\n")}\n</urlset>`;
}
