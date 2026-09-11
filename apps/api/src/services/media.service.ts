import type { Media, MediaFileType, MediaOwnerType } from "@prisma/client";
import type { MediaAsset } from "@district-one/shared-types";
import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { mediaStorage } from "@/services/storage";

export function toMediaAsset(media: Media): MediaAsset {
  return {
    id: media.id,
    url: media.url,
    publicId: media.publicId,
    type: media.type,
    alt: media.alt ?? undefined,
    caption: media.caption ?? undefined,
    isPrimary: media.isPrimary,
    order: media.order,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    bytes: media.bytes ?? undefined,
  };
}

/** Batches the primary (or first) image per owner — avoids N+1 queries on listing pages. */
export async function getPrimaryImagesForOwners(
  ownerType: MediaOwnerType,
  ownerIds: string[]
): Promise<Map<string, MediaAsset | null>> {
  if (ownerIds.length === 0) return new Map();

  const rows = await prisma.media.findMany({
    where: { ownerType, ownerId: { in: ownerIds } },
    orderBy: [{ isPrimary: "desc" }, { order: "asc" }, { createdAt: "asc" }],
  });

  const map = new Map<string, MediaAsset | null>(ownerIds.map((id) => [id, null]));
  for (const row of rows) {
    if (!map.get(row.ownerId)) {
      map.set(row.ownerId, toMediaAsset(row));
    }
  }
  return map;
}

/** Adds a `primaryImage` field to each row, batched via getPrimaryImagesForOwners. */
export async function attachPrimaryImages<T extends { id: string }>(
  items: T[],
  ownerType: MediaOwnerType
): Promise<(T & { primaryImage: MediaAsset | null })[]> {
  const imageMap = await getPrimaryImagesForOwners(ownerType, items.map((i) => i.id));
  return items.map((item) => ({ ...item, primaryImage: imageMap.get(item.id) ?? null }));
}

/** Adds a `logo` field to each builder row. */
export async function attachBuilderLogos<T extends { id: string }>(
  builders: T[]
): Promise<(T & { logo: MediaAsset | null })[]> {
  const logoMap = await getPrimaryImagesForOwners("BUILDER_LOGO", builders.map((b) => b.id));
  return builders.map((b) => ({ ...b, logo: logoMap.get(b.id) ?? null }));
}

export async function listMedia(ownerType: MediaOwnerType, ownerId: string): Promise<MediaAsset[]> {
  const rows = await prisma.media.findMany({
    where: { ownerType, ownerId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toMediaAsset);
}

interface UploadMediaInput {
  ownerType: MediaOwnerType;
  ownerId: string;
  buffer: Buffer;
  mimetype: string;
  folder: string;
  fileType: MediaFileType;
  resourceType: "image" | "raw";
  alt?: string;
  caption?: string;
  makePrimary?: boolean;
}

export async function uploadMedia(input: UploadMediaInput): Promise<MediaAsset> {
  const uploaded = await mediaStorage.upload(input.buffer, input.folder, input.mimetype, input.resourceType);

  const currentCount = await prisma.media.count({ where: { ownerType: input.ownerType, ownerId: input.ownerId } });

  if (input.makePrimary) {
    await prisma.media.updateMany({
      where: { ownerType: input.ownerType, ownerId: input.ownerId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const media = await prisma.media.create({
    data: {
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      type: input.fileType,
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      bytes: uploaded.bytes,
      alt: input.alt,
      caption: input.caption,
      isPrimary: input.makePrimary ?? currentCount === 0,
      order: currentCount,
    },
  });

  return toMediaAsset(media);
}

async function getOwnedMedia(mediaId: string, ownerType: MediaOwnerType, ownerId: string) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media || media.ownerType !== ownerType || media.ownerId !== ownerId) {
    throw ApiError.notFound("Media not found");
  }
  return media;
}

export async function deleteMedia(mediaId: string, ownerType: MediaOwnerType, ownerId: string): Promise<void> {
  const media = await getOwnedMedia(mediaId, ownerType, ownerId);
  await mediaStorage.delete(media.publicId, media.type === "DOCUMENT" ? "raw" : "image");
  await prisma.media.delete({ where: { id: media.id } });
}

export async function updateMediaMeta(
  mediaId: string,
  ownerType: MediaOwnerType,
  ownerId: string,
  data: { alt?: string; caption?: string }
): Promise<MediaAsset> {
  await getOwnedMedia(mediaId, ownerType, ownerId);
  const media = await prisma.media.update({ where: { id: mediaId }, data });
  return toMediaAsset(media);
}

export async function setPrimaryMedia(mediaId: string, ownerType: MediaOwnerType, ownerId: string): Promise<void> {
  await getOwnedMedia(mediaId, ownerType, ownerId);
  await prisma.$transaction([
    prisma.media.updateMany({ where: { ownerType, ownerId }, data: { isPrimary: false } }),
    prisma.media.update({ where: { id: mediaId }, data: { isPrimary: true } }),
  ]);
}

export async function reorderMedia(ownerType: MediaOwnerType, ownerId: string, orderedIds: string[]): Promise<void> {
  const owned = await prisma.media.findMany({ where: { ownerType, ownerId }, select: { id: true } });
  const ownedIds = new Set(owned.map((m) => m.id));

  if (orderedIds.length !== ownedIds.size || !orderedIds.every((id) => ownedIds.has(id))) {
    throw ApiError.badRequest("orderedIds must match exactly the media items belonging to this owner");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.media.update({ where: { id }, data: { order: index } }))
  );
}

export async function deleteAllMediaForOwner(ownerType: MediaOwnerType, ownerId: string): Promise<void> {
  const rows = await prisma.media.findMany({ where: { ownerType, ownerId } });
  await Promise.all(rows.map((row) => mediaStorage.delete(row.publicId, row.type === "DOCUMENT" ? "raw" : "image").catch(() => undefined)));
  await prisma.media.deleteMany({ where: { ownerType, ownerId } });
}
