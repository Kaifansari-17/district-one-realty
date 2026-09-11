import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { PrismaClient, UserRole, PropertyTypeCategory } from "@prisma/client";
import { slugify } from "@district-one/shared-utils";
import { logger } from "@/utils/logger";

const prisma = new PrismaClient();

const LOCATIONS = [
  { name: "Nerul", description: "An established, premium residential hub known for its planned sectors and seafront proximity." },
  { name: "Seawoods", description: "A premium residential destination anchored by upscale retail and rail connectivity." },
  { name: "Kharghar", description: "A fast-growing residential locality known for its green, planned layout." },
  { name: "Vashi", description: "An established commercial and residential hub with strong connectivity to Mumbai." },
  { name: "Belapur", description: "The administrative heart of Navi Mumbai, offering established residential neighborhoods." },
  { name: "Panvel", description: "A rapidly expanding locality benefiting from major infrastructure and connectivity projects." },
  { name: "Ulwe", description: "An emerging locality driven by the upcoming Navi Mumbai International Airport." },
];

const AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Club House",
  "Garden",
  "Lift",
  "CCTV",
  "Security",
  "Parking",
  "Kids Play Area",
  "Jogging Track",
];

const FEATURES = ["Modular Kitchen", "Vaastu Compliant", "Corner Unit", "Park Facing", "Sea View"];

const PROPERTY_TYPES: { name: string; category: PropertyTypeCategory }[] = [
  { name: "Apartment", category: PropertyTypeCategory.RESIDENTIAL },
  { name: "Villa", category: PropertyTypeCategory.RESIDENTIAL },
  { name: "Studio", category: PropertyTypeCategory.RESIDENTIAL },
  { name: "Office Space", category: PropertyTypeCategory.COMMERCIAL },
  { name: "Shop", category: PropertyTypeCategory.COMMERCIAL },
];

const PROPERTY_CATEGORIES = ["Residential", "Commercial"];
const PURPOSES = ["Buy", "Rent", "Lease"];

async function main() {
  logger.info("Seeding District One Realty database...");

  const country = await prisma.country.upsert({
    where: { slug: "india" },
    update: {},
    create: { name: "India", slug: "india" },
  });

  const state = await prisma.state.upsert({
    where: { slug: "maharashtra" },
    update: {},
    create: { name: "Maharashtra", slug: "maharashtra", countryId: country.id },
  });

  const city = await prisma.city.upsert({
    where: { slug: "navi-mumbai" },
    update: {},
    create: { name: "Navi Mumbai", slug: "navi-mumbai", stateId: state.id },
  });

  for (const location of LOCATIONS) {
    const slug = slugify(location.name);
    await prisma.location.upsert({
      where: { slug },
      update: {},
      create: {
        name: location.name,
        slug,
        cityId: city.id,
        description: location.description,
        isActive: true,
      },
    });
  }

  for (const name of AMENITIES) {
    const slug = slugify(name);
    await prisma.amenity.upsert({ where: { slug }, update: {}, create: { name, slug, isActive: true } });
  }

  for (const name of FEATURES) {
    const slug = slugify(name);
    await prisma.feature.upsert({ where: { slug }, update: {}, create: { name, slug, isActive: true } });
  }

  for (const type of PROPERTY_TYPES) {
    const slug = slugify(type.name);
    await prisma.propertyType.upsert({
      where: { slug },
      update: {},
      create: { name: type.name, slug, category: type.category, isActive: true },
    });
  }

  for (const name of PROPERTY_CATEGORIES) {
    const slug = slugify(name);
    await prisma.propertyCategory.upsert({ where: { slug }, update: {}, create: { name, slug, isActive: true } });
  }

  for (const name of PURPOSES) {
    const slug = slugify(name);
    await prisma.purpose.upsert({ where: { slug }, update: {}, create: { name, slug, isActive: true } });
  }

  const superAdminEmail = process.env.SEED_SUPER_ADMIN_EMAIL || "districtonerealty@gmail.com";
  const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  if (!existingSuperAdmin) {
    const password = process.env.SEED_SUPER_ADMIN_PASSWORD || crypto.randomBytes(12).toString("base64url");
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: "Affan Shaikh",
        email: superAdminEmail,
        phone: "9324702438",
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        designation: "Real Estate Consultant",
        isActive: true,
      },
    });

    if (!process.env.SEED_SUPER_ADMIN_PASSWORD) {
      logger.warn(
        `Super admin created: ${superAdminEmail} / ${password} — this password was auto-generated, log in and change it immediately.`
      );
    } else {
      logger.info(`Super admin created: ${superAdminEmail}`);
    }
  } else {
    logger.info(`Super admin already exists: ${superAdminEmail}`);
  }

  logger.info("Seeding complete.");
}

main()
  .catch((err) => {
    logger.error({ err }, "Seeding failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
