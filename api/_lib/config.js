export const REQUIRED_CONTACT_ENV = [
  'RESEND_API_KEY',
  'CONTACT_TO',
  'CONTACT_FROM',
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
  if (!values.RESEND_API_KEY.startsWith('re_')) throw new ContactConfigError('RESEND_API_KEY');
  if (!permittedRecipients.has(values.CONTACT_TO)) throw new ContactConfigError('CONTACT_TO');

  return {
    resendApiKey: values.RESEND_API_KEY,
    to: values.CONTACT_TO,
    from: values.CONTACT_FROM,
  };
}
