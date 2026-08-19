import multer from "multer";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/appError";

const storage = multer.memoryStorage();

const IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
];

const ARCHIVE_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
];

// Single source of truth for file-upload security. Both uploaders are
// STRICT ALLOW-LISTS — a file is only accepted if its mimetype is
// explicitly on the list. This replaces the old approach where
// projectFile.routes.ts used a much weaker BLOCK-list (only rejecting a
// few known-dangerous types, silently allowing everything else, including
// things like .svg/.html which can carry stored-XSS payloads).
const makeUploader = (allowedMimeTypes: string[], maxSizeBytes: number, label: string) =>
  multer({
    storage,
    limits: { fileSize: maxSizeBytes },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new AppError(StatusCodes.BAD_REQUEST, `This file type is not allowed for ${label}.`),
        );
      }
      cb(null, true);
    },
  });

// User avatars, portfolio images, etc. — images only, 5MB cap.
export const imageUpload = makeUploader(IMAGE_MIME_TYPES, 5 * 1024 * 1024, "images");

// Project files — images + documents + archives, 20MB cap (docs run larger
// than images, hence the higher limit vs imageUpload).
export const projectFileUpload = makeUploader(
  [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES, ...ARCHIVE_MIME_TYPES],
  20 * 1024 * 1024,
  "project files",
);