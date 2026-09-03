const genericFailure = "We couldn't send your enquiry. Please try again or call 0405878406.";
const successMessage = 'Enquiry sent successfully.';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeErrors = new Map([
  ['400:VALIDATION_ERROR', 'Check the highlighted fields and try again.'],
  ['403:ORIGIN_REJECTED', 'This form must be submitted from the Canberraroofkind website.'],
  ['413:PHOTO_TOO_LARGE', 'Photo must be 4 MB or smaller.'],
  ['415:UNSUPPORTED_PHOTO_TYPE', 'Choose a JPG, PNG or WebP photo.'],
  ['429:RATE_LIMITED', 'Too many attempts. Please wait 10 minutes and try again.'],
]);
const fields = ['name', 'email', 'phone', 'address', 'area', 'service', 'message', 'privacy', 'website'];

export class ContactApiError extends Error {
  constructor({ status, code, fieldErrors, requestId, message }) {
    super(message);
    this.name = 'ContactApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.requestId = requestId;
  }
}

function genericError() {
  return new ContactApiError({ message: genericFailure });
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function formControl(form, name) {
  return form.elements.namedItem(name);
}

export function buildContactFormData(form) {
  const FormDataConstructor = form.ownerDocument?.defaultView?.FormData ?? FormData;
  const formData = new FormDataConstructor();

  for (const field of fields) {
    const control = formControl(form, field);
    const value = field === 'privacy' ? Boolean(control?.checked) : String(control?.value ?? '');
    formData.append(field, field === 'privacy' && value ? 'true' : String(value));
  }

  const photo = formControl(form, 'photo')?.files?.[0];
  if (photo && typeof photo.name === 'string' && photo.name) formData.append('photo', photo);
  return formData;
}

function validSuccess(status, body) {
  return status === 200
    && isObject(body)
    && Object.keys(body).length === 4
    && body.ok === true
    && body.code === 'ENQUIRY_SENT'
    && body.message === successMessage
    && typeof body.requestId === 'string'
    && uuidPattern.test(body.requestId);
}

function structuredError(status, body) {
  if (!isObject(body) || body.ok !== false || typeof body.code !== 'string') return undefined;
  const message = safeErrors.get(`${status}:${body.code}`);
  if (!message || body.message !== message) return undefined;
  return new ContactApiError({
    status,
    code: body.code,
    fieldErrors: isObject(body.fieldErrors) ? body.fieldErrors : undefined,
    requestId: typeof body.requestId === 'string' ? body.requestId : undefined,
    message,
  });
}

export async function sendContactEnquiry(form, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl('/api/contact', {
      method: 'POST',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
      body: buildContactFormData(form),
    });
  } catch {
    throw genericError();
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw genericError();
  }

  if (validSuccess(response.status, body)) return body;
  throw structuredError(response.status, body) ?? genericError();
}
