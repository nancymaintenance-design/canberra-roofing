export function migrateStoredData(defaults, canonicalServices, canonicalFaqs, saved) {
  const { leads: _defaultLeads, ...safeDefaults } = defaults || {};
  const { services: _legacyServices, faqs: _legacyFaqs, leads: _legacyLeads, schemaVersion: _legacyVersion, ...safeSaved } = saved || {};
  const needsVerifiedFacts = Number(_legacyVersion || 0) < 4;
  const verifiedFacts = needsVerifiedFacts ? { company: 'Canberraroofkind', phone: '0405878406', email: 'elliservices.group@gmail.com' } : {};
  return { ...safeDefaults, ...safeSaved, ...verifiedFacts, schemaVersion: 7, services: canonicalServices, faqs: canonicalFaqs };
}
