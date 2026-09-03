export function migrateStoredData(defaults, canonicalServices, canonicalFaqs, saved) {
  const { services: _legacyServices, faqs: _legacyFaqs, schemaVersion: _legacyVersion, ...safeSaved } = saved || {};
  const needsVerifiedFacts = Number(_legacyVersion || 0) < 4;
  const verifiedFacts = needsVerifiedFacts ? { company: 'Canberraroofkind', phone: '0405878406', email: 'elliservices.group@gmail.com' } : {};
  const knownLegacyNewsTitles = new Map([
    ['Ellis Canberra Service local candidate is ready for review.', 'Canberraroofkind local candidate is ready for review.'],
    ['Ellis Canberra Service is now online.', 'Canberraroofkind is now online.']
  ]);
  const migratedNews = knownLegacyNewsTitles.has(safeSaved.newsTitle)
    ? { newsTitle: knownLegacyNewsTitles.get(safeSaved.newsTitle) }
    : {};
  return { ...defaults, ...safeSaved, ...verifiedFacts, ...migratedNews, schemaVersion: 5, services: canonicalServices, faqs: canonicalFaqs, leads: safeSaved.leads || [] };
}
