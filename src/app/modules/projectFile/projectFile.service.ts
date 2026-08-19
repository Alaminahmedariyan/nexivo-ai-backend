import { StatusCodes } from "http-status-codes";

import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";

import { Prisma } from "../../../../generated/prisma/client";
import { FileCategory } from "../../../../generated/prisma";

import { fileUploader } from "../../config/cloudinary";

import { QueryBuilder } from "../../query-builder";

// ======================================================
// FILE SELECT
// ======================================================

const PROJECT_FILE_SELECT = {
  id: true,
  projectId: true,
  uploadedById: true,
  url: true,
  name: true,
  category: true,
  mimeType: true,
  size: true,
  uploadedAt: true,
} satisfies Prisma.ProjectFileSelect;

// ======================================================
// MIME TYPE -> CATEGORY
// ======================================================

const categoryFromMimeType = (mimeType: string): FileCategory => {
  // IMAGE
  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  }

  // VIDEO
  if (mimeType.startsWith("video/")) {
    return "VIDEO";
  }

  // DOCUMENT
  if (
    mimeType === "application/pdf" ||
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "text/plain" ||
    mimeType === "text/csv"
  ) {
    return "DOCUMENT";
  }

  // ARCHIVE
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed" ||
    mimeType === "application/x-rar-compressed" ||
    mimeType === "application/x-7z-compressed"
  ) {
    return "ARCHIVE";
  }

  return "OTHER";
};

// ======================================================
// CREATE / UPLOAD FILE
// ======================================================

const uploadFile = async (
  projectId: string,
  uploadedById: string,
  file: Express.Multer.File,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, "Project not found.");
  }

  const user = await prisma.user.findUnique({
    where: { id: uploadedById },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "Uploader not found.");
  }

  if (!file.buffer || file.size <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Uploaded file is empty.");
  }

  const category = categoryFromMimeType(file.mimetype);

  const result = await fileUploader.uploadFileToCloudinary(
    file.buffer,
    file.originalname,
    `nexivo-ai/projects/${projectId}`,
  );

  const projectFile = await prisma.projectFile.create({
    data: {
      projectId,
      uploadedById,
      url: result.secure_url,
      name: file.originalname,
      category,
      mimeType: file.mimetype,
      size: file.size,
    } satisfies Prisma.ProjectFileUncheckedCreateInput,

    select: PROJECT_FILE_SELECT,
  });

  return projectFile;
};

// ======================================================
// GET FILES BY PROJECT
// ======================================================

const getFilesByProject = async (
  projectId: string,
  queryParams: Record<string, unknown>,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, "Project not found.");
  }

  const fileQuery = new QueryBuilder<
    Prisma.ProjectFileGetPayload<{
      select: typeof PROJECT_FILE_SELECT;
    }>,
    Prisma.ProjectFileWhereInput
  >(prisma.projectFile, {
    searchableFields: ["name"],
    filterableFields: {
      projectId: "string",
      category: {
        type: "enum",
        enum: FileCategory,
      },
      mimeType: "string",
      uploadedById: "string",
    },
    sortableFields: ["uploadedAt", "name", "size"],
    selectableFields: Object.keys(PROJECT_FILE_SELECT),
    defaultSortField: "uploadedAt",
  });

  const finalQueryParams: Record<string, unknown> = {
    ...queryParams,
    projectId,
  };

  const result = await fileQuery.execute(finalQueryParams);

  const fileIds = result.data.map((file) => file.id);

  if (fileIds.length === 0) {
    return { data: [], meta: result.meta };
  }

  const files = await prisma.projectFile.findMany({
    where: { projectId, id: { in: fileIds } },
    select: {
      ...PROJECT_FILE_SELECT,
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { uploadedAt: "desc" },
  });

  const fileMap = new Map(files.map((file) => [file.id, file]));

  const orderedFiles = fileIds
    .map((id) => fileMap.get(id))
    .filter((file): file is (typeof files)[number] => Boolean(file));

  return { data: orderedFiles, meta: result.meta };
};

// ======================================================
// DELETE FILE
// ======================================================

const deleteFile = async (fileId: string) => {
  const existingFile = await prisma.projectFile.findUnique({
    where: { id: fileId },
  });

  if (!existingFile) {
    throw new AppError(StatusCodes.NOT_FOUND, "File not found.");
  }

  await prisma.projectFile.delete({ where: { id: fileId } });

  /*
   * IMPORTANT
   * Current schema only stores `url`, not Cloudinary `publicId`, so the
   * Cloudinary asset itself cannot be safely deleted here. DB record is
   * removed successfully; the orphaned Cloudinary file remains.
   */
};

// ======================================================
// EXPORT
// ======================================================

export const projectFileService = {
  uploadFile,
  getFilesByProject,
  deleteFile,
};
