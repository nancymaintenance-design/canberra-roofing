import path from 'node:path';
import { fileTypeFromBuffer } from 'file-type';
import {
  AREA_OPTIONS,
  FIELD_LIMITS,
  PHOTO_ALLOWED_TYPES,
  PHOTO_EXTENSIONS,
  PHOTO_LIMIT_BYTES,
  SERVICE_TITLES,
} from '../../src/contact-options.js';

const fieldNames = ['name', 'email', 'phone', 'address', 'area', 'service', 'message', 'privacy', 'website'];
const requiredMessages = {
  name: 'Enter your name.',
  email: 'Enter your email address.',
  phone: 'Enter your phone number.',
  area: 'Choose a Canberra suburb or area.',
  service: 'Choose a service interest.',
  message: 'Describe what you would like to discuss.',
};
const lengthFields = ['name', 'email', 'phone', 'address', 'message'];

function failure(status, code, fieldErrors) {
  return { ok: false, status, code, ...(fieldErrors ? { fieldErrors } : {}) };
}

function invalidRequest() {
  return failure(400, 'INVALID_REQUEST');
}

function entriesFrom(input) {
  if (Array.isArray(input.fieldEntries)) return input.fieldEntries;
  return Object.entries(input.fields ?? {});
}

function hasInvalidFieldMetadata(entries) {
  if (!Array.isArray(entries) || entries.length > FIELD_LIMITS.fields) return true;
  const seen = new Set();
  for (const entry of entries) {
    if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string') return true;
    const [name, value] = entry;
    if (Buffer.byteLength(name) > FIELD_LIMITS.fieldNameBytes || !fieldNames.includes(name) || seen.has(name) || Buffer.byteLength(String(value ?? '')) > FIELD_LIMITS.textFieldBytes) return true;
    seen.add(name);
  }
  return Object.keys(inputFieldObject(entries)).some((name) => !fieldNames.includes(name));
}

function inputFieldObject(entries) {
  return Object.fromEntries(entries.map(([name, value]) => [name, String(value ?? '')]));
}

function normalizedFields(entries) {
  const raw = inputFieldObject(entries);
  return Object.fromEntries(fieldNames.map((name) => [name, String(raw[name] ?? '').trim()]));
}

function extensionOf(name) {
  const extension = path.posix.extname(String(name ?? '').replace(/\\/g, '/'));
  return extension === extension.toLowerCase() ? extension : '';
}

function expectedMime(extension) {
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  return undefined;
}

export function sanitizeAttachmentFilename(originalname, extension) {
  const basename = path.posix.basename(String(originalname ?? '').replace(/\\/g, '/'))
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/^\.+/, '');
  const stem = basename.slice(0, Math.max(0, basename.length - extension.length)).replace(/\.+$/g, '') || 'photo';
  return `${stem.slice(0, 100 - extension.length)}${extension}`;
}

async function validatePhoto(files) {
  if (!Array.isArray(files) || files.length > FIELD_LIMITS.files) return invalidRequest();
  if (!files.length) return { ok: true, photo: undefined };

  const photo = files[0];
  if (!photo || photo.fieldname !== 'photo' || !Buffer.isBuffer(photo.buffer) || !photo.buffer.length) return failure(415, 'UNSUPPORTED_PHOTO_TYPE');
  if (photo.buffer.length > PHOTO_LIMIT_BYTES) return failure(413, 'PHOTO_TOO_LARGE');

  const extension = extensionOf(photo.originalname);
  if (!PHOTO_EXTENSIONS.includes(extension) || !PHOTO_ALLOWED_TYPES.includes(photo.mimetype) || expectedMime(extension) !== photo.mimetype) return failure(415, 'UNSUPPORTED_PHOTO_TYPE');

  const detected = await fileTypeFromBuffer(photo.buffer);
  if (!detected || detected.mime !== photo.mimetype || expectedMime(extension) !== detected.mime) return failure(415, 'UNSUPPORTED_PHOTO_TYPE');
  return { ok: true, photo: { buffer: photo.buffer, mimetype: detected.mime, filename: sanitizeAttachmentFilename(photo.originalname, extension), size: photo.buffer.length } };
}

export async function validateContactSubmission(input = {}) {
  const entries = entriesFrom(input);
  if (hasInvalidFieldMetadata(entries)) return invalidRequest();
  const fields = normalizedFields(entries);
  const fieldErrors = {};

  for (const [field, message] of Object.entries(requiredMessages)) if (!fields[field]) fieldErrors[field] = message;
  for (const field of lengthFields) {
    if (fields[field].length > FIELD_LIMITS[field]) fieldErrors[field] = `${field[0].toUpperCase()}${field.slice(1)} must be ${FIELD_LIMITS[field]} characters or fewer.`;
  }
  if (fields.email && (fields.email.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))) fieldErrors.email = 'Enter a valid email address.';
  if (fields.phone && fields.phone.length < 3) fieldErrors.phone = 'Enter your phone number.';
  if (fields.area && !AREA_OPTIONS.includes(fields.area)) fieldErrors.area = requiredMessages.area;
  if (fields.service && !SERVICE_TITLES.includes(fields.service)) fieldErrors.service = requiredMessages.service;
  if (fields.privacy !== 'true') fieldErrors.privacy = 'Agree to the privacy notice to continue.';
  if (fields.website !== '') return failure(400, 'BOT_REJECTED');
  if (Object.keys(fieldErrors).length) return failure(400, 'VALIDATION_ERROR', fieldErrors);

  const photoResult = await validatePhoto(input.files ?? []);
  if (!photoResult.ok) return photoResult;
  return { ok: true, fields, photo: photoResult.photo };
}
