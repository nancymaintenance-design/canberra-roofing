export const REQUIRED_CONTACT_ENV = [
  'RESEND_API_KEY',
  'CONTACT_EMAIL_TO',
];

const permittedRecipients = new Set([
  'elliservices.group@gmail.com',
  'nancy.maintenance@gmail.com',
]);

export class ContactConfigError extends Error {
  constructor(variable) {
    super('Invalid environment variable ' + variable + '.');
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
  if (!permittedRecipients.has(values.CONTACT_EMAIL_TO)) throw new ContactConfigError('CONTACT_EMAIL_TO');

  const customSender = env.CONTACT_EMAIL_FROM;
  if (customSender !== undefined && (typeof customSender !== 'string' || !customSender.trim() || customSender.includes(String.fromCharCode(13)) || customSender.includes(String.fromCharCode(10)))) {
    throw new ContactConfigError('CONTACT_EMAIL_FROM');
  }

  return {
    apiKey: values.RESEND_API_KEY,
    to: values.CONTACT_EMAIL_TO,
    from: customSender?.trim() || 'Canberraroofkind <onboarding@resend.dev>',
  };
}
