import { prisma } from "@/config/prisma";

/**
 * Wipes every table in FK-safe (children-first) order. Called between test suites so each
 * one starts from a known-empty database rather than accumulating state or racing on unique
 * constraints (slugs, emails) left over from a previous run.
 */
export async function resetDatabase(): Promise<void> {
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.leadNote.deleteMany();
  await prisma.siteVisit.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.propertyAgent.deleteMany();
  await prisma.propertyFeature.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.property.deleteMany();
  await prisma.projectAgent.deleteMany();
  await prisma.projectAmenity.deleteMany();
  await prisma.project.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.propertyType.deleteMany();
  await prisma.propertyCategory.deleteMany();
  await prisma.purpose.deleteMany();
  await prisma.builder.deleteMany();
  await prisma.location.deleteMany();
  await prisma.city.deleteMany();
  await prisma.state.deleteMany();
  await prisma.country.deleteMany();
  await prisma.user.deleteMany();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
