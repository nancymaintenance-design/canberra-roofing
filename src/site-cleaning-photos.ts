// User-supplied roof-edge/gutter clearing photographs, 22 October 2026.
// Provenance and exact crop mapping: reports/real-cleaning-photos-2026-10-22.
// No property location, repair outcome or pressure-washing method is inferred.
const photo = (name: string, alt: string, caption: string) => ({ src: `/assets/projects/site-${name}.webp`, alt, caption });

export const SITE_CLEANING_PHOTOS = {
  outletBefore: photo('gutter-outlet-before', 'Leaves and compacted debris in a metal roof gutter outlet', 'Before clearing: leaves and debris in the gutter outlet.'),
  outletCleared: photo('gutter-outlet-cleared', 'The same gutter outlet after accumulated debris was removed', 'After clearing: the outlet opening and surrounding metal are visible.'),
  eavesBefore: photo('eaves-gutter-before', 'Moss and debris along the gutter beside a dark metal roof', 'Before clearing: moss and debris along the roof-edge gutter.'),
  eavesCleared: photo('eaves-gutter-cleared', 'The roof-edge gutter after visible vegetation and debris were cleared', 'After clearing: the same roof-edge gutter with the build-up removed.'),
  sideBefore: photo('side-gutter-before', 'Leaves in a narrow gutter below rooftop air-conditioning equipment', 'Before clearing: leaves in the narrow gutter below rooftop equipment.'),
  sideCleared: photo('side-gutter-cleared', 'The narrow gutter beside a rendered wall after debris clearing', 'After clearing: the gutter beside the wall and rooftop equipment.'),
  sediment: photo('box-gutter-sediment', 'Sediment and organic build-up on the base of a metal box gutter', 'Sediment and organic build-up on the gutter base before clearing.'),
  channelCleared: photo('box-gutter-cleared', 'A cleared metal gutter channel beside roof sheets and solar panels', 'A cleared gutter channel beside the metal roof and solar panels.'),
  overview: photo('roof-edge-cleared-overview', 'Cleared drainage channel along a metal roof beside solar panels', 'Our site photo shows the cleared roof-edge drainage channel.'),
  junction: photo('gutter-junction-detail', 'Metal gutter junction, fixings and an exposed outlet opening', 'Our site photo records the gutter junction, fixings and outlet opening.'),
  mossDetail: photo('eaves-moss-detail', 'Moss and plant growth filling sections of a narrow eaves gutter', 'Before clearing: moss and plant growth between the gutter supports.'),
  gardenCleared: photo('garden-gutter-cleared', 'Cleared metal gutter run beside the garden-facing roof edge', 'After clearing: the exposed gutter base along the garden-facing roof edge.'),
  sedimentDetail: photo('gutter-sediment-closeup', 'Compacted sediment and small plant fragments on a gutter base', 'A closer view of compacted sediment and plant fragments before clearing.'),
  outletMoss: photo('outlet-moss-detail', 'Moss and leaf debris around an opening in a gutter sump', 'Before clearing: moss and leaf debris remain around the sump outlet.'),
  collectorBefore: photo('collector-before', 'Leaves and twigs inside a collection box below the roof gutter', 'Before clearing: leaves and twigs in the collection box and adjoining gutter.'),
  collectorCleared: photo('collector-cleared', 'The same collection box and adjoining gutter after visible debris removal', 'After clearing: the collection box and adjoining gutter base are exposed.'),
  longCleared: photo('long-gutter-cleared', 'Long cleared gutter beside metal roofing above a courtyard', 'After clearing: the long gutter run beside the metal roof.'),
  wallChannel: photo('wall-channel-cleared', 'Exposed box gutter between a metal roof and a metal-clad wall', 'After clearing: the channel between the metal roof and wall is visible.'),
  junctionSediment: photo('roof-junction-sediment', 'Sediment in a narrow gutter beside a roof junction', 'Before clearing: settled debris along the gutter beside a roof junction.'),
};

export const CLEANING_CASE_PATH = '/case-studies/roof-gutter-clearing';
export const CLEANING_CASE_LABEL = 'Roof-edge and gutter clearing photos';
export const CLEANING_CASE_GROUPS = [
  {
    id: 'gutter-build-up',
    title: 'Leaves, moss and plant growth',
    intro: 'The first views show accumulated material along the eaves and between the gutter supports.',
    images: [SITE_CLEANING_PHOTOS.eavesBefore, SITE_CLEANING_PHOTOS.mossDetail],
  },
  {
    id: 'outlet-and-collector',
    title: 'Outlets and collection boxes, before and after',
    intro: 'Each pair records the same outlet or collection box before and after visible debris was removed.',
    images: [SITE_CLEANING_PHOTOS.outletBefore, SITE_CLEANING_PHOTOS.outletCleared, SITE_CLEANING_PHOTOS.collectorBefore, SITE_CLEANING_PHOTOS.collectorCleared],
  },
  {
    id: 'cleared-gutter-runs',
    title: 'The cleared gutter runs',
    intro: 'These wider views show the roof-edge gutter and a separate long run after clearing.',
    images: [SITE_CLEANING_PHOTOS.eavesCleared, SITE_CLEANING_PHOTOS.longCleared],
  },
];

export const CLEANING_GUIDE_PHOTOS: Record<string, { section: string; images: { src: string; alt: string; caption: string }[] }> = {
  'roof-cleaning-methods-canberra': { section: 'water-route', images: [SITE_CLEANING_PHOTOS.junctionSediment, SITE_CLEANING_PHOTOS.wallChannel] },
  'gutters-overflowing-heavy-rain-canberra': { section: 'drainage', images: [SITE_CLEANING_PHOTOS.sedimentDetail, SITE_CLEANING_PHOTOS.outletMoss] },
};

export const SITE_CLEANING_GALLERIES = {
  'roof-cleaning': {
    documentary: true,
    title: 'Roof-edge clearing, before and after',
    intro: 'We cleared visible vegetation and debris from these roof-edge drainage areas. The site photos show the build-up and cleared gutters. We assess roof-surface cleaning and any repairs separately.',
    images: [SITE_CLEANING_PHOTOS.eavesBefore, SITE_CLEANING_PHOTOS.eavesCleared, SITE_CLEANING_PHOTOS.sediment, SITE_CLEANING_PHOTOS.channelCleared, SITE_CLEANING_PHOTOS.junctionSediment, SITE_CLEANING_PHOTOS.gardenCleared],
    relatedPath: CLEANING_CASE_PATH,
    relatedLabel: 'View the roof-edge and gutter clearing photos',
  },
  'gutter-downpipe-maintenance': {
    documentary: true,
    title: 'Gutter and outlet clearing, before and after',
    intro: 'We removed accumulated leaves and debris from the gutter runs and outlet shown here. These site photos record the clearing; we assess connected downpipes and any component repairs separately.',
    images: [SITE_CLEANING_PHOTOS.outletBefore, SITE_CLEANING_PHOTOS.outletCleared, SITE_CLEANING_PHOTOS.sideBefore, SITE_CLEANING_PHOTOS.sideCleared, SITE_CLEANING_PHOTOS.mossDetail, SITE_CLEANING_PHOTOS.sedimentDetail],
  },
  'gutter-repairs': {
    documentary: true,
    title: 'Gutter condition to assess before repairs',
    intro: 'We assess build-up, gutter condition and the connected drainage before quoting repairs. These site photos show sediment and an exposed roof-edge channel. Clearing and component repairs are different tasks.',
    images: [SITE_CLEANING_PHOTOS.sediment, SITE_CLEANING_PHOTOS.overview],
  },
};
