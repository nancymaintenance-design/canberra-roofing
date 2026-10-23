import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ResponsiveImage } from './responsive-image';
import { ServiceNextStep } from './service-journey';
import { CLEANING_CASE_GROUPS, CLEANING_CASE_PATH, CLEANING_GUIDE_PHOTOS, SITE_CLEANING_PHOTOS } from './site-cleaning-photos';

type SitePhoto = { src: string; alt: string; caption: string };
function ClearingPhotoGrid({ images, priority = false }: { images: SitePhoto[]; priority?: boolean }) {
  return <div className="clearingPhotoGrid">{images.map((image, index) => <figure key={image.src}>
    <ResponsiveImage src={image.src} alt={image.alt} priority={priority && index === 0} sizes="(max-width: 760px) calc(100vw - 3rem), (max-width: 1440px) 45vw, 680px" />
    <figcaption>{image.caption}</figcaption>
  </figure>)}</div>;
}

export function CleaningCaseView() {
  return <article className="page caseStudy cleaningCase">
    <header className="caseStudyHeader caseStudyPhotoIntro">
      <div className="pairedHeroCopy">
        <p className="eyebrow">GUTTER CLEARING PHOTOS</p>
        <h1>Roof-edge and gutter clearing, in photos</h1>
        <p className="articleLead">See the build-up along the roof edges, the outlet and collection box clearing, and the gutters after visible debris was removed.</p>
      </div>
    </header>
    <ServiceNextStep pagePath={CLEANING_CASE_PATH} />
    {CLEANING_CASE_GROUPS.map((group, index) => <section key={group.id} className="caseEvidence cleaningCaseSection" aria-labelledby={group.id}>
      <div className="caseEvidenceIntro">
        <h2 id={group.id}>{group.title}</h2>
        <p>{group.intro}</p>
      </div>
      <ClearingPhotoGrid images={group.images} priority={index === 0} />
    </section>)}
    <section className="caseStudyDetail">
      <div>
        <h2>What the clearing work involved</h2>
        <p>We removed visible leaves, plant growth and accumulated debris from the gutter areas shown. The photos record the build-up and the exposed channels and collection areas after clearing.</p>
        <p>Gutter component repairs and checks further along the downpipe route are assessed separately. Roof-surface cleaning also needs a method suited to the material and its condition.</p>
      </div>
      <aside aria-label="Clearing case details"><dl>
        <div><dt>Service pathway</dt><dd><a href="/services/gutter-downpipe-maintenance">Gutter &amp; Downpipe Maintenance</a></dd></div>
        <div><dt>Work shown</dt><dd>Debris removal from gutters, outlets and a collection box.</dd></div>
        <div><dt>Roof details</dt><dd>Metal roof edges and gutter channels.</dd></div>
      </dl></aside>
    </section>
    <section className="caseStudyNext">
      <div><h2>Need help with gutter build-up?</h2><p>Describe the affected area and any overflow you have noticed. We assess the gutter and connected drainage, then explain the proposed work and written quote.</p></div>
      <div className="caseStudyActions">
        <a className="button" href="/services/gutter-downpipe-maintenance">Explore gutter and downpipe cleaning <ArrowRight size={17} /></a>
        <a className="textAction" href="/services/roof-cleaning">Explore Roof Cleaning</a>
        <a className="textAction" href="/news/gutters-overflowing-heavy-rain-canberra">Read the gutter overflow guide</a>
      </div>
    </section>
  </article>;
}

export function HomeCleaningCase() {
  const image = SITE_CLEANING_PHOTOS.longCleared;
  return <section className="homeCleaningCase" aria-labelledby="home-cleaning-case-title">
    <div>
      <p className="eyebrow">FROM OUR SITE PHOTOS</p>
      <h2 id="home-cleaning-case-title">Roof-edge and gutter clearing</h2>
      <p>Leaves, moss and settled debris can build up along roof edges and around outlets. See our photos of the clearing work and the gutter areas afterwards.</p>
      <a className="textAction" href={CLEANING_CASE_PATH}>View the clearing case <ArrowRight size={17} /></a>
    </div>
    <figure><ResponsiveImage src={image.src} alt={image.alt} sizes="(max-width: 760px) calc(100vw - 3rem), (max-width: 1440px) 50vw, 720px" /><figcaption>{image.caption}</figcaption></figure>
  </section>;
}

export function ArticleSitePhotos({ slug, section }: { slug: string; section: string }) {
  const group = CLEANING_GUIDE_PHOTOS[slug];
  if (!group || group.section !== section) return null;
  return <div className="articleSitePhotos">
    <h3>Site photos: gutter build-up and drainage</h3>
    <ClearingPhotoGrid images={group.images} />
    <a className="textAction" href={CLEANING_CASE_PATH}>View the roof-edge and gutter clearing photos <ArrowRight size={16} /></a>
  </div>;
}
