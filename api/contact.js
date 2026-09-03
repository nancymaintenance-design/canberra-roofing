import multer from 'multer';

import { loadContactConfig } from './_lib/config.js';
import { createContactEmailService } from './_lib/contact-email.js';
import { createContactHandler } from './_lib/contact-handler.js';
import { FIELD_LIMITS, PHOTO_LIMIT_BYTES } from '../src/contact-options.js';

function fieldEntries(body) {
  return Object.entries(body ?? {}).flatMap(([name, value]) => (Array.isArray(value) ? value.map((item) => [name, item]) : [[name, value]]));
}

function createMultipartParser() {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      files: FIELD_LIMITS.files,
      fields: FIELD_LIMITS.fields,
      // Busboy emits the limit event when the count reaches the configured
      // value, so 11 is the Multer threshold that permits the contractual 10.
      parts: FIELD_LIMITS.parts + 1,
      fileSize: PHOTO_LIMIT_BYTES,
      fieldNameSize: FIELD_LIMITS.fieldNameBytes,
      fieldSize: FIELD_LIMITS.textFieldBytes,
    },
  }).single('photo');

  return (req) => new Promise((resolve, reject) => {
    upload(req, {}, (error) => {
      if (error) reject(error);
      else resolve({ fields: req.body ?? {}, fieldEntries: fieldEntries(req.body), files: req.file ? [req.file] : [] });
    });
  });
}

function writeJson(res, result) {
  res.statusCode = result.status;
  if (result.headers) for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(result.body));
}

export function createContactFunction(options = {}) {
  const parser = options.parseMultipart ?? createMultipartParser();
  const logger = options.logger ?? ((entry) => console.log(JSON.stringify(entry)));
  let deliveryPromise;
  const getDelivery = async () => {
    if (options.delivery) return options.delivery;
    if (!deliveryPromise) {
      deliveryPromise = Promise.resolve().then(() => {
        const config = (options.configLoader ?? loadContactConfig)();
        return (options.createEmailService ?? createContactEmailService)({ config });
      });
    }
    return deliveryPromise;
  };
  const handler = createContactHandler({ ...options, logger, getDelivery });
  return async function contactFunction(req, res) {
    const result = await handler({
      method: req.method,
      headers: req.headers ?? {},
      contentType: req.headers?.['content-type'],
      parse: () => parser(req),
    });
    writeJson(res, result);
  };
}

export default createContactFunction();
