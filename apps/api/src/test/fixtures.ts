import { UserRole, PropertyStatus, PublishStatus, PropertyTypeCategory, PriceUnit } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { hashPassword } from "@/utils/hash";

export const TEST_PASSWORD = "TestPass123";

export async function createUser(role: UserRole, overrides: Partial<{ email: string; name: string; isActive: boolean }> = {}) {
  const passwordHash = await hashPassword(TEST_PASSWORD);
  return prisma.user.create({
    data: {
      name: overrides.name ?? `Test ${role}`,
      email: overrides.email ?? `${role.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`,
      role,
      passwordHash,
      isActive: overrides.isActive ?? true,
    },
  });
}

export async function createLocationHierarchy() {
  const country = await prisma.country.create({ data: { name: "India", slug: "india" } });
  const state = await prisma.state.create({ data: { name: "Maharashtra", slug: "maharashtra", countryId: country.id } });
  const city = await prisma.city.create({ data: { name: "Navi Mumbai", slug: "navi-mumbai", stateId: state.id } });
  const location = await prisma.location.create({
    data: { name: "Kharghar", slug: "kharghar", cityId: city.id, isActive: true },
  });
  return { country, state, city, location };
}

export async function createBuilder(overrides: Partial<{ name: string; slug: string }> = {}) {
  return prisma.builder.create({
    data: {
      name: overrides.name ?? "Test Builder",
      slug: overrides.slug ?? `test-builder-${Date.now()}`,
      isActive: true,
    },
  });
}

export async function createPropertyLookups() {
  const propertyType = await prisma.propertyType.create({
    data: { name: "Apartment", slug: `apartment-${Date.now()}`, category: PropertyTypeCategory.RESIDENTIAL, isActive: true },
  });
  const category = await prisma.propertyCategory.create({
    data: { name: "Residential", slug: `residential-${Date.now()}`, isActive: true },
  });
  const purpose = await prisma.purpose.create({ data: { name: "Buy", slug: `buy-${Date.now()}`, isActive: true } });
  return { propertyType, category, purpose };
}

interface CreatePropertyOptions {
  locationId: string;
  propertyTypeId: string;
  categoryId: string;
  purposeId: string;
  builderId?: string;
  publishStatus?: PublishStatus;
  agentIds?: string[];
  title?: string;
}

export async function createProperty(options: CreatePropertyOptions) {
  const property = await prisma.property.create({
    data: {
      title: options.title ?? `Test Property ${Date.now()}`,
      slug: `test-property-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      locationId: options.locationId,
      propertyTypeId: options.propertyTypeId,
      categoryId: options.categoryId,
      purposeId: options.purposeId,
      builderId: options.builderId,
      price: 5_000_000,
      priceUnit: PriceUnit.TOTAL,
      bedrooms: 2,
      carpetArea: 850,
      status: PropertyStatus.READY_TO_MOVE,
      publishStatus: options.publishStatus ?? PublishStatus.PUBLISHED,
    },
  });

  if (options.agentIds && options.agentIds.length > 0) {
    await prisma.propertyAgent.createMany({
      data: options.agentIds.map((agentId) => ({ propertyId: property.id, agentId })),
    });
  }

  return property;
}
