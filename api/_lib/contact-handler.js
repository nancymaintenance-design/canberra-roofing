import { randomUUID } from 'node:crypto';

import { validateContactSubmission } from './contact-validation.js';

const COPY = {
  invalid: "We couldn't read this enquiry. Check the form and try again.",
  validation: 'Check the highlighted fields and try again.',
  origin: 'This form must be submitted from the Canberraroofkind website.',
  tooLarge: 'Photo must be 4 MB or smaller.',
  type: 'Choose a JPG, PNG or WebP photo.',
  delivery: "We couldn't send your enquiry. Please try again or call 0405878406.",
};

function response(status, code, message, requestId, fieldErrors) {
  return { status, body: { ok: status === 200, code, message, requestId, ...(fieldErrors ? { fieldErrors } : {}) } };
}

function multipartContentType(value) {
  return typeof value === 'string' && /^multipart\/form-data\s*;\s*boundary=(?:"[^"]+"|[^;\s]+)(?:;|$)/i.test(value);
}

function expectedOrigin(headers) {
  const protocol = headers['x-forwarded-proto'];
  const host = headers['x-forwarded-host'];
  if (typeof protocol !== 'string' || typeof host !== 'string' || protocol !== protocol.trim() || host !== host.trim() || !protocol || !host || protocol.includes(',') || host.includes(',')) return undefined;
  if (!/^(https?|HTTPS?)$/.test(protocol) || !/^[A-Za-z0-9.-]+(?::\d{1,5})?$/.test(host)) return undefined;
  return `${protocol.toLowerCase()}://${host}`;
}

function outcomeFor(code) {
  return code.toLowerCase();
}

function clearPhotoReferences(parsed, validation) {
  if (parsed?.files?.[0]) parsed.files[0].buffer = undefined;
  if (validation?.photo) validation.photo.buffer = undefined;
}

export function createContactHandler({ validate = validateContactSubmission, getDelivery, logger = () => {}, now = () => Date.now(), requestIdFactory = randomUUID } = {}) {
  if (typeof getDelivery !== 'function') throw new TypeError('getDelivery is required.');

  return async function handleContactRequest({ method, headers = {}, contentType, parse }) {
    const requestId = requestIdFactory();
    const started = now();
    let result;
    let parsed;
    let validation;
    let smtpAttempted = false;
    let smtpAccepted = false;

    try {
      if (method !== 'POST') {
        result = { ...response(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.', requestId), headers: { Allow: 'POST' } };
      } else if (!multipartContentType(contentType)) {
        result = response(400, 'INVALID_REQUEST', COPY.invalid, requestId);
      } else if (headers.origin !== expectedOrigin(headers)) {
        result = response(403, 'ORIGIN_REJECTED', COPY.origin, requestId);
      } else {
        try {
          parsed = await parse();
        } catch (error) {
          result = error?.code === 'LIMIT_FILE_SIZE'
            ? response(413, 'PHOTO_TOO_LARGE', COPY.tooLarge, requestId)
            : response(400, 'INVALID_REQUEST', COPY.invalid, requestId);
        }
        if (!result) {
          validation = await validate(parsed);
          if (!validation.ok) {
            if (validation.code === 'BOT_REJECTED') result = response(400, 'BOT_REJECTED', COPY.invalid, requestId);
            else if (validation.code === 'VALIDATION_ERROR') result = response(400, 'VALIDATION_ERROR', COPY.validation, requestId, validation.fieldErrors);
            else if (validation.code === 'PHOTO_TOO_LARGE') result = response(413, 'PHOTO_TOO_LARGE', COPY.tooLarge, requestId);
            else if (validation.code === 'UNSUPPORTED_PHOTO_TYPE') result = response(415, 'UNSUPPORTED_PHOTO_TYPE', COPY.type, requestId);
            else result = response(400, 'INVALID_REQUEST', COPY.invalid, requestId);
          } else {
            smtpAttempted = true;
            try {
              const delivery = await getDelivery();
              const delivered = await delivery.sendEnquiry({ fields: validation.fields, photo: validation.photo, requestId });
              if (delivered?.ok === true) {
                smtpAccepted = true;
                result = response(200, 'ENQUIRY_SENT', 'Enquiry sent successfully.', requestId);
              } else result = response(503, 'DELIVERY_UNAVAILABLE', COPY.delivery, requestId);
            } catch {
              result = response(503, 'DELIVERY_UNAVAILABLE', COPY.delivery, requestId);
            }
          }
        }
      }
    } catch {
      result = response(500, 'INTERNAL_ERROR', COPY.delivery, requestId);
    } finally {
      clearPhotoReferences(parsed, validation);
      const entry = {
        time: new Date(started).toISOString(),
        requestId,
        route: '/api/contact',
        status: result?.status ?? 500,
        outcome: outcomeFor(result?.body?.code ?? 'INTERNAL_ERROR'),
        durationMs: Math.max(0, now() - started),
        photoPresent: Boolean(validation?.photo),
        photoBytes: Number(validation?.photo?.size ?? 0),
        ...(smtpAttempted ? { smtpAccepted } : {}),
      };
      try { logger(entry); } catch { /* logging must not change the public response */ }
    }
    return result;
  };
}
