// Public identity and editorial copy are source-managed, regardless of saved version.
const controlledFields = ['company', 'phone', 'email', 'address', 'tagline', 'newsTitle', 'newsCopy'];

export function migrateStoredData(defaults, canonicalServices, canonicalFaqs, saved) {
  const { leads: _defaultLeads, ...safeDefaults } = defaults || {};
  const { services: _legacyServices, faqs: _legacyFaqs, leads: _legacyLeads, schemaVersion: _legacyVersion, ...safeSaved } = saved || {};
  for (const field of controlledFields) delete safeSaved[field];
  return { ...safeDefaults, ...safeSaved, schemaVersion: 8, services: canonicalServices, faqs: canonicalFaqs };
}
