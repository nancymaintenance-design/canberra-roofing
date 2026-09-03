export const REQUIRED_CONTACT_ENV = [
  'CONTACT_SMTP_HOST',
  'CONTACT_SMTP_PORT',
  'CONTACT_SMTP_SECURE',
  'CONTACT_SMTP_USER',
  'CONTACT_SMTP_PASS',
  'CONTACT_SMTP_TO',
  'CONTACT_SMTP_FROM',
];

const permittedRecipients = new Set([
  'elliservices.group@gmail.com',
  'nancy.maintenance@gmail.com',
]);

export class ContactConfigError extends Error {
  constructor(variable) {
    super(`Invalid environment variable ${variable}.`);
    this.name = 'ContactConfigError';
    this.variable = variable;
  }
}

function required(env, variable) {
  const value = env[variable];
  if (typeof value !== 'string' || !value.trim()) throw new ContactConfigError(variable);
  return value;
}

export function loadContactConfig(env = process.env) {
  const values = Object.fromEntries(REQUIRED_CONTACT_ENV.map((variable) => [variable, required(env, variable)]));
  if (values.CONTACT_SMTP_HOST !== 'smtp.gmail.com') throw new ContactConfigError('CONTACT_SMTP_HOST');
  if (!['465', '587'].includes(values.CONTACT_SMTP_PORT)) throw new ContactConfigError('CONTACT_SMTP_PORT');
  if (!['true', 'false'].includes(values.CONTACT_SMTP_SECURE)) throw new ContactConfigError('CONTACT_SMTP_SECURE');

  const port = Number(values.CONTACT_SMTP_PORT);
  const secure = values.CONTACT_SMTP_SECURE === 'true';
  if ((port === 465 && !secure) || (port === 587 && secure)) throw new ContactConfigError('CONTACT_SMTP_SECURE');
  if (!permittedRecipients.has(values.CONTACT_SMTP_TO)) throw new ContactConfigError('CONTACT_SMTP_TO');
  if (values.CONTACT_SMTP_FROM !== values.CONTACT_SMTP_USER) throw new ContactConfigError('CONTACT_SMTP_FROM');

  return {
    host: values.CONTACT_SMTP_HOST,
    port,
    secure,
    user: values.CONTACT_SMTP_USER,
    pass: values.CONTACT_SMTP_PASS,
    to: values.CONTACT_SMTP_TO,
    from: values.CONTACT_SMTP_FROM,
  };
}
