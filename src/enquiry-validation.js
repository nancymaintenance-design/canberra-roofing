import {
  AREA_OPTIONS,
  FIELD_LIMITS,
  PHOTO_ALLOWED_TYPES,
  PHOTO_EXTENSIONS,
  PHOTO_LIMIT_BYTES,
  SERVICE_TITLES,
} from './contact-options.js';

const requiredMessages = {
  name: 'Enter your name.',
  email: 'Enter your email address.',
  phone: 'Enter your phone number.',
  area: 'Choose a Canberra suburb or area.',
  service: 'Choose a service interest.',
  message: 'Describe what you would like to discuss.',
};

const limitedFields = ['name', 'email', 'phone', 'address', 'message'];

function valueOf(values, field) {
  return String(values[field] ?? '').trim();
}

function photoError(photo) {
  if (!photo || !String(photo.name ?? '')) return undefined;

  const name = String(photo.name);
  const extension = name.slice(name.lastIndexOf('.'));
  if (!PHOTO_ALLOWED_TYPES.includes(String(photo.type ?? '')) || extension !== extension.toLowerCase() || !PHOTO_EXTENSIONS.includes(extension)) {
    return 'Choose a JPG, PNG or WebP photo.';
  }
  if (Number(photo.size) > PHOTO_LIMIT_BYTES) return 'Photo must be 4 MB or smaller.';
  return undefined;
}

export function validateEnquiry(values) {
  const errors = {};
  const trimmed = Object.fromEntries(['name', 'email', 'phone', 'address', 'area', 'service', 'message'].map((field) => [field, valueOf(values, field)]));

  for (const [field, message] of Object.entries(requiredMessages)) {
    if (!trimmed[field]) errors[field] = message;
  }

  for (const field of limitedFields) {
    if (trimmed[field].length > FIELD_LIMITS[field]) {
      errors[field] = `${field[0].toUpperCase()}${field.slice(1)} must be ${FIELD_LIMITS[field]} characters or fewer.`;
    }
  }

  if (trimmed.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) errors.email = 'Enter a valid email address.';
  if (trimmed.area && !AREA_OPTIONS.includes(trimmed.area)) errors.area = requiredMessages.area;
  if (trimmed.service && !SERVICE_TITLES.includes(trimmed.service)) errors.service = requiredMessages.service;
  if (values.privacy !== true) errors.privacy = 'Agree to the privacy notice to continue.';

  const photo = photoError(values.photo);
  if (photo) errors.photo = photo;
  return errors;
}
