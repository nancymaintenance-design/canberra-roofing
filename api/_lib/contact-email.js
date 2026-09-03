export class ContactDeliveryError extends Error {
  constructor() { super('Delivery unavailable.'); this.name = 'ContactDeliveryError'; }
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
function headerValue(value) { return String(value ?? '').replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function textBody(fields, requestId, timestamp) { return ['Website enquiry', `Service: ${fields.service}`, `Area: ${fields.area}`, `Name: ${fields.name}`, `Email: ${fields.email}`, `Phone: ${fields.phone}`, `Address: ${fields.address || 'Not provided'}`, 'Message:', fields.message, `Submitted UTC: ${timestamp}`, `Request ID: ${requestId}`].join('\n'); }
function htmlBody(fields, requestId, timestamp) { const rows = [['Service', fields.service], ['Area', fields.area], ['Name', fields.name], ['Email', fields.email], ['Phone', fields.phone], ['Address', fields.address || 'Not provided'], ['Message', fields.message], ['Submitted UTC', timestamp], ['Request ID', requestId]]; return `<h1>Website enquiry</h1><table>${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</table>`; }

export function createContactEmailService({ config, fetchImpl = fetch, now = () => new Date() }) {
  return { async sendEnquiry({ fields, photo, requestId }) {
    const timestamp = now().toISOString();
    const mail = { to: config.to, from: config.from, reply_to: headerValue(fields.email), subject: `Website enquiry: ${headerValue(fields.service)} - ${headerValue(fields.area)}`, text: textBody(fields, requestId, timestamp), html: htmlBody(fields, requestId, timestamp), ...(photo ? { attachments: [{ filename: photo.filename, content: photo.buffer.toString('base64'), content_type: photo.mimetype }] } : {}) };
    let response;
    try { response = await fetchImpl('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(mail) }); } catch { throw new ContactDeliveryError(); }
    if (!response.ok) throw new ContactDeliveryError();
    let result;
    try { result = await response.json(); } catch { throw new ContactDeliveryError(); }
    if (!result?.id) throw new ContactDeliveryError();
    return { ok: true };
  }};
}
