import nodemailer from 'nodemailer';

export class ContactDeliveryError extends Error {
  constructor() {
    super('Delivery unavailable.');
    this.name = 'ContactDeliveryError';
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function headerValue(value) {
  return String(value ?? '').replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function textBody(fields, requestId, timestamp) {
  return [
    'Website enquiry',
    `Service: ${fields.service}`,
    `Area: ${fields.area}`,
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone}`,
    `Address: ${fields.address || 'Not provided'}`,
    'Message:',
    fields.message,
    `Submitted UTC: ${timestamp}`,
    `Request ID: ${requestId}`,
  ].join('\n');
}

function htmlBody(fields, requestId, timestamp) {
  const rows = [
    ['Service', fields.service],
    ['Area', fields.area],
    ['Name', fields.name],
    ['Email', fields.email],
    ['Phone', fields.phone],
    ['Address', fields.address || 'Not provided'],
    ['Message', fields.message],
    ['Submitted UTC', timestamp],
    ['Request ID', requestId],
  ];
  return `<h1>Website enquiry</h1><table>${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</table>`;
}

function acceptedRecipient(info, recipient) {
  return Array.isArray(info?.accepted)
    && info.accepted.some((address) => typeof address === 'string' && address.toLowerCase() === recipient.toLowerCase())
    && Array.isArray(info?.rejected)
    && info.rejected.length === 0;
}

export function createContactEmailService({ config, createTransport = nodemailer.createTransport, now = () => new Date() }) {
  const transport = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return {
    async sendEnquiry({ fields, photo, requestId }) {
      const timestamp = now().toISOString();
      const subject = `Website enquiry: ${headerValue(fields.service)} - ${headerValue(fields.area)}`;
      const mail = {
        to: config.to,
        from: config.from,
        replyTo: headerValue(fields.email),
        subject,
        text: textBody(fields, requestId, timestamp),
        html: htmlBody(fields, requestId, timestamp),
        ...(photo ? { attachments: [{ filename: photo.filename, content: photo.buffer, contentType: photo.mimetype }] } : {}),
      };

      let result;
      try {
        result = await transport.sendMail(mail);
      } catch {
        throw new ContactDeliveryError();
      }
      if (!acceptedRecipient(result, config.to)) throw new ContactDeliveryError();
      return { ok: true };
    },
  };
}
