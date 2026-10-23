import path from 'node:path';

// Original assets owned by this site; confirmed project derivatives remain untouched.
const groups = {
  about: ['ellis-brand-roof-planning.png', 'ellis-brand-service-van.png', 'ellis-brand-site-preparation.png', 'ellis-brand-team-briefing.png', 'ellis-brand-vehicle-tools.png'],
  areas: ['canberra-coverage-roofscape.png'],
  brand: ['canberraroofkind-logo.png', 'instagram-gradient.png'],
  'case-studies': ['tile-roof-repair-after.png', 'tile-roof-repair-before.png', 'tile-roof-repair-during.png'],
  contact: ['service-arrival-consultation.png'],
  home: ['au-hero-act-tile-roof.png', 'australian-residential-roof-context.png', 'canberra-roof-hero.png', 'ellis-site-consultation.png', 'ellis-team-trust.png'],
  news: ['chimney-flashing-review.png', 'damaged-tile-record.png', 'ridge-repointing-work.png', 'roof-leak-after-rain.png', 'roof-space-inspection.png'],
  projects: ['site-gutter-outlet-before.webp', 'site-gutter-outlet-cleared.webp', 'site-eaves-gutter-before.webp', 'site-eaves-gutter-cleared.webp', 'site-side-gutter-before.webp', 'site-side-gutter-cleared.webp', 'site-box-gutter-sediment.webp', 'site-box-gutter-cleared.webp', 'site-roof-edge-cleared-overview.webp', 'site-gutter-junction-detail.webp', 'site-eaves-moss-detail.webp', 'site-garden-gutter-cleared.webp', 'site-gutter-sediment-closeup.webp', 'site-outlet-moss-detail.webp', 'site-collector-before.webp', 'site-collector-cleared.webp', 'site-long-gutter-cleared.webp', 'site-wall-channel-cleared.webp', 'site-roof-junction-sediment.webp', 'site-metal-roof-overview.webp', 'site-metal-roof-fixing-points.webp', 'site-metal-roof-junction.webp', 'site-metal-roof-sheet-detail.webp'],
  services: [
    'chimney-flashing-assessment.png', 'chimney-flashing-completed-detail.png', 'chimney-flashing-completed-roof-detail.png', 'chimney-flashing-condition.png', 'chimney-flashing-installation.png',
    'gutter-downpipe-edge-debris.jpg', 'gutter-downpipe-roof-edge-condition.jpg', 'gutter-downpipe-solar-channel-debris.jpg', 'gutter-downpipe-valley-condition.jpg', 'gutter-downpipe-vegetation-build-up.jpg',
    'metal-roof-completed-roof.png', 'metal-roof-gutter-edge-repair.png', 'metal-roof-repair-team-work.png', 'metal-roof-secure-fixing.png', 'metal-roof-wall-flashing-condition.png',
    'ridge-capping-completed-line.png', 'ridge-capping-condition.png', 'ridge-capping-pointing.png', 'ridge-capping-rebedding.png', 'ridge-capping-repair-process.png',
    'roof-cleaning-completed-roof.png', 'roof-cleaning-controlled-wash.png', 'roof-cleaning-gutter-debris.png', 'roof-cleaning-site-overview.png', 'roof-cleaning-surface-condition.png',
    'roof-inspection-checklist.png', 'roof-inspection-photo-record.png', 'roof-inspection-roofline-review.png', 'roof-inspection-solar-roof-review.png', 'roof-inspection-team-review.png',
    'roof-leak-completed-roof.png', 'roof-leak-flashing-before-after.png', 'roof-leak-flashing-repair.png', 'roof-leak-interior-water-mark.png', 'roof-leak-on-roof-assessment.png',
    'tile-roof-before-after.png', 'tile-roof-condition-review.png', 'tile-roof-damaged-tiles.png', 'tile-roof-repair-work.png', 'tile-roof-site-overview.png',
  ],
};
export const IMAGE_INVENTORY = Object.entries(groups).flatMap(([group, names]) => names.map(name => `/assets/${group}/${name}`));

export function validateImageInventory(urls) {
  const stems = new Set();
  for (const url of urls) {
    const stem = path.basename(url, path.extname(url)).toLowerCase();
    if (stems.has(stem)) throw new Error(`Responsive output filename collision: ${stem}`);
    stems.add(stem);
  }
}
