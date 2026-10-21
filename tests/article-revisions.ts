// Independent editorial acceptance dates, not derived from production records.
const revised = new Set([
 '/news/after-rain-roof-leak-check-canberra',
 '/news/gutters-overflowing-heavy-rain-canberra',
 '/news/roof-leak-vs-condensation-canberra',
 '/news/when-to-arrange-roof-inspection-canberra',
 '/news/roof-repair-cost-canberra',
 '/news/roof-leak-information-for-tenants-canberra',
]);
export const expectedRevision = (path:string) => revised.has(path) ? '2026-10-21' : '2026-10-14';
