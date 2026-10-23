import { SITE_CLEANING_PHOTOS } from './site-cleaning-photos';

export const ARTICLE_IMAGES: Record<string, { src: string; alt: string; caption?: string }> = {
  "roof-leak-information-for-tenants-canberra": { src: "/assets/services/roof-leak-interior-water-mark.png", alt: "An indoor ceiling stain being photographed and discussed before a roof assessment" },
  "roof-repair-cost-canberra": { src: "/assets/services/roof-inspection-checklist.png", alt: "Roof condition being checked and recorded to help define the work included in a quote" },
  "roof-repointing-cost-canberra": { src: "/assets/services/ridge-capping-condition.png", alt: "Lifted ridge cap and exposed bedding illustrating why the existing base affects repair scope" },
  "roof-cleaning-methods-canberra": SITE_CLEANING_PHOTOS.eavesBefore,
  "gutters-overflowing-heavy-rain-canberra": SITE_CLEANING_PHOTOS.outletBefore,
  "roof-leak-vs-condensation-canberra": { src: "/assets/news/roof-space-inspection.png", alt: "Roof-space framing and moisture marks being observed; the image alone does not identify the moisture source" },
  "roof-repair-vs-restoration-vs-replacement-canberra": { src: "/assets/services/tile-roof-condition-review.png", alt: "A wider view of the existing tiled roof condition when considering local repairs or broader work" },
  "after-rain-roof-leak-check-canberra": {
    src: "/assets/news/roof-leak-after-rain.png",
    alt: "Ceiling water staining being checked from inside a home after rain",
  },
  "cracked-slipped-missing-roof-tiles-canberra": {
    src: "/assets/news/damaged-tile-record.png",
    alt: "Visible damaged roof tiles being documented",
  },
  "chimney-flashing-water-entry-signs": {
    src: "/assets/news/chimney-flashing-review.png",
    alt: "Roofing worker recording visible condition at a chimney-to-roof flashing junction",
  },
  "rebedding-vs-repointing-canberra-roofs": {
    src: "/assets/news/ridge-repointing-work.png",
    alt: "Worker applying pointing material along a tiled roof ridge line",
  },
  "when-to-arrange-roof-inspection-canberra": {
    src: "/assets/services/roof-inspection-roofline-review.png",
    alt: "Roofline and adjoining roof details being reviewed during an inspection",
  },
};
