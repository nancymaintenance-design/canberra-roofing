import imageManifest from './image-manifest.json';
import { ARTICLE_IMAGES } from './article-images';
import { addedImage } from './i18n/editorial';
import { getEditorialContent } from './i18n/runtime';

// Existing contextual imagery: these labels describe visible subjects, not
// verified customers, staff, locations, completed projects or repair outcomes.
const serviceImages: Record<string, { src: string; alt: string }> = {
  'roof-leak-repairs': { src: '/assets/services/roof-leak-on-roof-assessment.png', alt: 'Roof covering and adjoining roof junctions being examined' },
  'tile-roof-repairs': { src: '/assets/services/tile-roof-site-overview.png', alt: 'Tiled roof and adjoining chimney' },
  'chimney-flashing-repairs': { src: '/assets/services/chimney-flashing-assessment.png', alt: 'Chimney junction and surrounding roof tiles' },
  'rebedding-repointing': { src: '/assets/services/ridge-capping-condition.png', alt: 'Lifted ridge cap and exposed bedding on a tiled roof' },
  'roof-inspections': { src: '/assets/services/roof-inspection-roofline-review.png', alt: 'Roofline and adjoining roof details being examined' },
  'metal-roof-repairs': { src: '/assets/services/metal-roof-completed-roof.png', alt: 'Metal roof panels and roof junctions' },
  'roof-renovation': { src: '/assets/services/tile-roof-condition-review.png', alt: 'Existing tiled roof surface and ridge condition' },
  'roof-cleaning': { src: '/assets/services/roof-cleaning-site-overview.png', alt: 'Build-up visible on a tiled roof surface' },
  'gutter-downpipe-maintenance': { src: '/assets/services/gutter-downpipe-roof-edge-condition.jpg', alt: 'Gutter and adjoining roof edge' },
  'gutter-repairs': { src: '/assets/services/metal-roof-gutter-edge-repair.png', alt: 'Metal roof edge and adjoining gutter' },
  'emergency-roof-repairs': { src: '/assets/news/roof-leak-after-rain.png', alt: 'Water staining visible on an indoor ceiling' },
  'rental-property-roof-repairs': { src: '/assets/services/roof-leak-interior-water-mark.png', alt: 'An indoor ceiling stain being photographed' },
};
const genericImage = { src: '/assets/home/au-hero-act-tile-roof.png', alt: 'Tiled roof with trees and a residential backdrop' };

export function getSocialImage(pathname: string) {
  const image = (pathname.startsWith('/news/') ? ARTICLE_IMAGES[pathname.slice(6)] : null)
    ?? (pathname.startsWith('/services/') ? serviceImages[pathname.slice(10)] : null)
    ?? (pathname.startsWith('/news/') ? addedImage(pathname.slice(6)) : null)
    ?? genericImage;
  const source = getEditorialContent().images?.[image.src] || image.src;
  const entry = (imageManifest as Record<string, { variants: { src: string; width: number; height: number }[] }>)[source];
  const rendition = entry?.variants.slice().sort((a, b) => b.width - a.width)[0];
  if (!rendition) throw new Error(`Missing sharing image rendition: ${image.src}`);
  return { url: new URL(rendition.src, 'https://www.canberraroofkind.com.au').href, width: rendition.width, height: rendition.height, type: 'image/webp', alt: image.alt };
}
