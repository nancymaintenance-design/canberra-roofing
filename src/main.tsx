import React, { useEffect, useRef, useState } from "react";
import { Breadcrumbs, HeadManager, publishedRoutes, resolvePath } from "./route-meta";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import "./styles.css";
import { migrateStoredData } from "./storage.js";
import { AREA_GROUPS } from "./contact-options.js";
import { SERVICE_CATALOG } from "./service-catalog.js";
import { REPLACEMENT_SERVICE } from "./replacement-service.js";
import { getDistrictProfile, getSuburbRoute, getSuburbProfile } from "./suburb-profiles.js";
import { ContactForm } from "./contact-form.jsx";
import { ServicePlanning, ServiceBookingFaq, LocalGuideLinks } from "./content-guidance";
import { GUTTER_REPAIR_SERVICE, SERVICE_TOPIC_HEADINGS } from "./keyword-gap-content.js";
import { ServiceDepth, GapHubLinks } from "./keyword-gap-sections";
import { ADDITIONAL_SERVICES, BOOKING_POLICY, SERVICE_FAQ_MERGES, SEED_FAQ_INTENTS } from "./keyword-intent-content.js";
import { IntentServiceContent, IntentFaqs, OperatingHours } from "./keyword-intent-sections";
import { FaqBrowser } from "./faq-browser";
import { PROJECT_GALLERIES } from "./project-evidence.js";
import { ResponsiveImage } from "./responsive-image";
import { NEWS_ARTICLES, type NewsArticle } from "./news-articles";
import { configureLocale, basePath, currentLanguage, languagePath } from './i18n/runtime';
import { addedArticles, addedArticle, addedImage } from './i18n/editorial';
import { ARTICLE_IMAGES } from "./article-images";
import { ProjectWorkNotes } from "./project-work-notes";
import { ARTICLE_AUTHOR, articleModifiedDate, articleVisibleDate } from "./article-editorial";
import { ServiceSectionNav, ServiceTheme } from "./service-theme-layout";
import { ServiceResources, ServiceNextStep } from './service-journey';

type RelatedService = { label: string; path: string; description: string };
type Service = {
  slug: string;
  title: string;
  direct: string;
  symptoms: string;
  causes: string;
  assessment: string;
  pathways: string;
  scope: string;
  faqQ: string;
  faqA: string;
  faqExtras?: Faq[];
  next: string;
  related?: RelatedService[];
};
type Faq = { q: string; a: string };
type Data = {
  schemaVersion?: number;
  company: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  newsTitle: string;
  newsCopy: string;
  services: Service[];
  faqs: Faq[];
  media: string[];
};
const newsArticles = NEWS_ARTICLES;
const allNewsArticles = () => [...newsArticles, ...addedArticles()];
const newsImages = ARTICLE_IMAGES;
const serviceAnchorLabels: Record<string, string> = {
  "Roof Leak Repairs": "Roof Leak Repairs",
  "Tile Roof Repairs": "Tile Roof Repairs",
  "Chimney Flashing Repairs": "Chimney Flashing Repairs",
  "Rebedding & Repointing": "Ridge Capping Repairs",
  "Roof Inspections": "Roof Inspections",
  "Metal & Colorbond Roof Repairs": "Metal & Colorbond Roof Repairs",
  "Roof Renovation": "Roof Renovation",
  "Roof Cleaning": "Roof Cleaning",
  "Gutter & Downpipe Cleaning and Maintenance": "Gutter & Downpipe Maintenance",
};
type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  servicePath: string;
  guidePath: string;
  images: { src: string; alt: string; caption: string }[];
};
const caseStudies: CaseStudy[] = [
  {
    slug: "tile-roof-repair-canberra",
    title: "A tile roof repair, step by step",
    summary:
      "A tile-roof photo sequence: visible displaced and missing tiles, an area with tiles lifted, then the visible roof covering reinstated.",
    servicePath: "/services/tile-roof-repairs",
    guidePath: "/news/cracked-slipped-missing-roof-tiles-canberra",
    images: [
      {
        src: "/assets/case-studies/tile-roof-repair-before.png",
        alt: "Tiled roof showing visibly displaced and missing tiles",
        caption:
          "Before: visible displaced and missing tiles in the roof covering.",
      },
      {
        src: "/assets/case-studies/tile-roof-repair-during.png",
        alt: "People lifting tiles in the visible roof work area",
        caption:
          "During: tiles are lifted in the local work area, with surrounding tiles set aside.",
      },
      {
        src: "/assets/case-studies/tile-roof-repair-after.png",
        alt: "Tiled roof after the visible work area was retiled",
        caption:
          "After: the final image shows the visible work area retiled, with the surrounding weathered roof retained.",
      },
    ],
  },
];
const serviceSeed: Service[] = [
  {
    slug: "roof-leak-repairs",
    title: "Roof Leak Repairs",
    direct:
      "Ellis Services Group investigates and repairs roof leaks in Canberra. We check tiles or metal sheets, flashing junctions and drainage, trace the reported water-entry path and explain the repair scope and written quote before work is approved.",
    symptoms:
      "Note whether the concern is a fresh drip, a damp patch, a ceiling stain, bubbling paint, a musty smell or water near a light fitting. Record the room, when it first appeared and whether it follows steady rain, wind-driven rain or a storm. From ground level, also note nearby tiles, a roof flashing junction, ridge line, chimney, valley or skylight if they are safely visible.",
    causes:
      "We inspect broken or slipped tiles, flashing junctions, penetrations, ridge details and drainage overflow to identify the entry area and confirm the repair work. Include the indoor location and weather history as investigation clues.",
    assessment:
      "We inspect the roof covering, valleys, flashing, penetrations and drainage on site, and trace the reported water path. Share the rain conditions and timing so we can plan the investigation. Keep clear of wet electrical fittings and seek emergency assistance if there is immediate danger.",
    pathways:
      "After the assessment, we explain the entry point identified, the connected defects and the proposed component repairs. The quote distinguishes that work from optional cleaning, painting or wider maintenance. If a leak has returned after previous work, we review that repair and the surrounding roof details; we do not assume that another layer of sealant addresses the cause. Any concealed area or unresolved water path requiring further investigation is identified before additional work is agreed.",
    scope:
      "Roof height, access, weather, the reported water path and material condition shape the assessment. After reviewing the available evidence, we explain the recommended repair approach, scope and relevant costs before work is arranged.",
    faqQ: "Is the water mark always below the leak entry point?",
    faqA: "Water can travel along roof elements or ceilings before it becomes visible indoors, so the location of a stain is useful context rather than proof of the entry point.",
    faqExtras: [
      {
        q: "Can roof leak detection be confirmed from a photo?",
        a: "Photos are optional preparation, not a complete diagnosis. We inspect the flashing, underlay and accessible roof-space details on site, trace the entry point and confirm the repair plan and written quote.",
      },
      {
        q: "Can dry weather make a roof leak harder to assess?",
        a: "Yes. A concern that appears only during rain may leave limited visible evidence in dry weather, so the weather conditions and timing are useful details to include in an enquiry.",
      },
      {
        q: "Can roof flashing cause a leak?",
        a: "Flashing is one of several roof junction details that may be relevant. The surrounding materials, reported water path and visible condition need to be considered together.",
      },
      {
        q: "What if the roof still leaks after a repair?",
        a: "Record when the leak returned, the room and weather conditions involved, plus any known previous work. Ellis reviews the previous work, inspects the recurring water path and confirms the new repair plan and written quote.",
      },
    ],
    next: "Send the location of the visible trace, when it appears, your suburb and any safe ground-level photos to start an enquiry. Photos are optional; a written description is enough to arrange the assessment.",
  },
  {
    slug: "tile-roof-repairs",
    title: "Tile Roof Repairs",
    direct:
      "Ellis Services Group inspects and repairs cracked, broken, slipped and missing roof tiles locally. We check the surrounding ridge, valley and flashing details, then confirm suitable replacement materials, the repair scope and quote.",
    symptoms:
      "From a safe ground-level viewpoint, note tiles that look broken, cracked, slipped, missing, displaced or different in colour from nearby tiles. Describe the approximate position: near a ridge line, valley, chimney, roof edge or visible penetration. If the change followed a storm or wind, record when it was first noticed rather than walking on the roof to inspect it closely.",
    causes:
      "Visible tile damage can sit alongside weathering, movement, roof interface wear or conditions that are not clear from the ground. We check beneath and around the affected tiles where safely accessible, identify connected damage and explain the repair work.",
    assessment:
      "We inspect the damaged terracotta or concrete tiles, surrounding tile rows, valleys and ridge connections on site. We check tile profile, finish and available replacement materials, then explain the repair options for the existing roof.",
    pathways:
      "We identify the tiles requiring replacement and any adjoining ridge, valley or flashing repairs. The quote explains the affected area and available tile match; older colours and weathering can differ from replacement material.",
    scope:
      "Roof height, safe access, tile availability, material condition and weathering shape the assessment. We review the surrounding roof area, then explain the suitable repair approach, available material options and relevant costs before work is arranged.",
    faqQ: "Will a replacement tile look exactly the same as an older roof tile?",
    faqA: "Existing tile colour and finish can vary with age and weathering, even where a similar option is available.",
    faqExtras: [
      {
        q: "Can one or two damaged tiles be replaced?",
        a: "Yes, where the surrounding roof supports a local repair. We inspect the damaged tiles and adjoining area, confirm suitable replacement profiles and quote for the local work.",
      },
      {
        q: "Are terracotta and concrete tile repairs the same?",
        a: "Terracotta and concrete tiles have different profiles, finishes and weathering. We inspect the existing tiles, confirm available replacement materials and explain the repair scope and quote.",
      },
      {
        q: "Should I inspect a broken tile from the roof?",
        a: "No. Do not climb onto a tiled roof or move tiles to obtain a closer view. A safe ground-level observation and photo are the right starting point for an enquiry.",
      },
    ],
    next: "Send the tile location, any related interior sign, your suburb and what you can see safely from the ground.",
  },
  {
    slug: "chimney-flashing-repairs",
    title: "Chimney Flashing Repairs",
    direct:
      "Contact Ellis Services Group for chimney flashing repairs locally. We inspect the roof-to-chimney junction, adjoining roof materials and the reported water path, then explain the repair plan and quote.",
    symptoms:
      "Useful observations include water marks on a ceiling or wall near the chimney breast, dampness after wind-driven rain, cracked sealant, old temporary patches, loose adjacent tiles, weathered mortar or visible gaps around the junction. Record whether the concern changes after particular weather and whether the stain is new, recurring or growing.",
    causes:
      "The brickwork, chimney, roof covering, flashing, mortar and nearby tiles form a group of connected details. Water can travel before it becomes visible, so an indoor mark may not sit directly beneath the point of entry. We inspect old sealant, patches and adjoining materials to identify the junction repairs required.",
    assessment:
      "We inspect the chimney flashing, adjacent tiles, mortar and roof connections on site. Where signs extend beyond the chimney, we include the connected roof area in the leak investigation and explain any further access needed.",
    pathways:
      "We plan the chimney-to-roof junction repair from the condition found, suitable materials and safe access. We include related water-entry work in the agreed repair scope and quote.",
    scope:
      "Access, roof pitch, chimney-junction condition, surrounding materials, prior work and weather shape the assessment. We review the junction and explain the recommended repair approach, timing and relevant costs before work is arranged.",
    faqQ: "Does cracked sealant identify the whole problem?",
    faqA: "No. It may be relevant, but the surrounding junction, adjacent tiles or mortar and reported water path also need consideration.",
    faqExtras: [
      {
        q: "Can chimney flashing repairs stop water from wind-driven rain?",
        a: "We inspect the flashing and adjoining materials, trace the reported water path and explain the repair work. Include the wind and rain conditions when you arrange an assessment.",
      },
      {
        q: "Should I use roof leak repairs or chimney flashing repairs?",
        a: "Choose chimney flashing repairs when the concern is clearly at the chimney-to-roof junction. Choose roof leak repairs when the entry area is uncertain or the signs extend beyond that junction.",
      },
      {
        q: "When is a roof inspection a better starting point?",
        a: "A roof inspection can help when you cannot safely identify the relevant roof area, when more than one symptom is present or when you need a visual, non-invasive review.",
      },
    ],
    next: "Send the chimney location, the room affected, weather conditions, your suburb and any safe ground-level images.",
  },
  {
    slug: "rebedding-repointing",
    title: "Rebedding & Repointing",
    direct:
      "Ellis Services Group assesses ridge and hip capping locally. We check cap stability and the condition of bedding, pointing and adjoining tiles, then explain the ridge sections requiring repair and the written quote.",
    symptoms:
      "From the ground, you may notice cracking along a ridge line, loose-looking ridge caps, gaps in visible pointing, weathered material or changes around hip lines. Note whether the concern appears isolated or extends across several roof lines, and whether there is also a ceiling stain or water-entry sign inside the home.",
    causes:
      "A surface crack can be limited to visible pointing, or it may sit alongside movement in a cap or bedding that needs closer observation. Age, weathering, roof layout, access and the condition of nearby tiles can all affect the context. We check cap stability, bedding and the adjoining tiles on site before planning the ridge repair.",
    assessment:
      "We inspect ridge and hip caps, bedding, pointing and adjoining tiles on site. We check cap stability and trace any reported water-entry signs, then identify the sections requiring local repair, rebedding or repointing.",
    pathways:
      "We explain the ridge sections requiring attention and whether the work involves bedding, pointing or adjacent tiles. The repair plan follows the condition found and includes materials, access and a clear quote.",
    scope:
      "The extent of cracking, cap stability, safe access, roof layout, weather and surrounding tile condition shape the assessment. We then outline the recommended ridge repair or repointing scope, material options and relevant costs.",
    faqQ: "Does every crack mean all ridge caps need repointing?",
    faqA: "No. We check cap stability, bedding, pointing and nearby tiles on site, then specify the ridge sections requiring local repair, rebedding or repointing.",
    faqExtras: [
      {
        q: "What is the difference between roof rebedding and repointing?",
        a: "Rebedding concerns the material supporting ridge or hip tiles, while repointing is the exposed finishing material along their edge.",
      },
      {
        q: "Can a loose ridge cap be assessed from the ground?",
        a: "Keep observations at ground level. Ellis checks cap stability and bedding on site, then confirms the ridge repair plan and quote. Do not touch or walk on ridge caps.",
      },
      {
        q: "Should I use roof leak repairs as well?",
        a: "Yes, if there is also a ceiling stain or drip. Tell us about both signs so we can trace the water-entry path and check the ridge details during the same assessment.",
      },
    ],
    next: "Send the ridge or hip area, what has changed, any interior signs, your suburb and safe ground-level photos. Photos are optional; a written description is enough to arrange the assessment.",
  },
  {
    slug: "roof-inspections",
    title: "Roof Inspections",
    direct:
      "Ellis Services Group provides roof inspections in Canberra for leaks, visible damage and maintenance decisions. We assess the agreed accessible roof areas, explain the findings and discuss the recommended repair scope. Confirm the inspection fee and any photographs or written findings before booking.",
    symptoms:
      "A new water mark, a drip after rain, cracked or slipped tiles seen from the ground, a loose ridge cap, a chimney junction concern or a change near a gutter line can all be useful starting points. Include the property context if it matters, such as a maintenance decision or an upcoming sale, but describe the observable condition rather than asking for a remote diagnosis.",
    causes:
      "We check the reported roof area, connected materials and water path on site, and explain the findings and repair work. We plan access around the weather and roof layout, and discuss any further investigation needed for concealed areas.",
    assessment:
      "Before the visit, we agree the inspection purpose, accessible roof areas and whether roof-space access, photographs and written findings are included. On site, we assess the reported concern alongside the covering, ridge, flashing junctions and drainage that may be connected to it. We distinguish what was observed from what remains concealed or inaccessible. This is a visual, non-invasive assessment, not a structural or compliance certificate; further access or specialist investigation is discussed separately.",
    pathways:
      "We explain the findings and confirm the repair plan and quote, including the roof areas, components and maintenance work required. We discuss any additional access or investigation before arranging that work.",
    scope:
      "The agreed purpose, access, safety conditions, weather, roof layout and any supporting material shape the assessment. We confirm the inspection scope and any applicable fee before booking.",
    faqQ: "Is a roof inspection a structural or compliance certificate?",
    faqA: "No. This service provides a visual, non-invasive assessment only, not engineering, valuation or certification.",
    faqExtras: [
      {
        q: "Can I arrange a roof inspection before deciding what to repair?",
        a: "Yes. Ellis can inspect the roof before you decide on repairs. We agree the inspection purpose, safe access, visual scope and any fee before booking, then explain the findings and quote for the proposed work.",
      },
      {
        q: "What should I prepare for a roof inspection enquiry?",
        a: "Record the suburb, the visible concern, when it was noticed, relevant weather conditions and any safe ground-level photos. Mention any particular area you want to discuss.",
      },
      {
        q: "Does visual and non-invasive mean every roof issue will be found?",
        a: "No. It means observations are limited to what can be safely and reasonably viewed without invasive investigation, subject to weather and access.",
      },
    ],
    next: "Send the reason for the inspection, the visible signs, your suburb and any particular roof area you would like to describe.",
  },
  {
    slug: "metal-roof-repairs",
    title: "Metal & Colorbond Roof Repairs",
    direct:
      "Contact Ellis Services Group for metal and Colorbond roof repairs locally. We inspect sheets, fixings, flashing and junctions on site, trace the water-entry cause and explain the repair scope and quote.",
    symptoms:
      "From a safe ground-level position, note any lifted or displaced sheet, loose-looking screw, visible rust, sealant change, roof penetration, ridge or wall flashing junction, valley or gutter area. Record whether you have seen a drip, ceiling mark or damp patch inside, and whether it followed steady rain, wind-driven rain or a storm. Do not climb onto a metal roof to take close-up photos.",
    causes:
      "A metal roof system includes sheets, laps, fasteners, flashings, penetrations, ridges, valleys and drainage details. Water can travel along a sheet or beneath adjoining materials before it appears inside. We check weathered surfaces, patches, fasteners and adjoining connections on site to identify the damaged components and plan the repair.",
    assessment:
      "We inspect safely accessible sheets, flashing, penetrations, fixings, overlaps and roof-to-wall connections, then trace the reported water path. We confirm suitable materials and the repair approach for the existing metal or Colorbond roof.",
    pathways:
      "We identify the damaged sheets, fasteners or flashing and explain the targeted repair work. Where the leak source needs further investigation, our team arranges the inspection and confirms the repair scope and quote.",
    scope:
      "Roof height, access, roof pitch, sheet profile, material age, visible condition, weather, penetrations and surrounding interfaces shape the assessment. We explain the recommended metal-roof repair option, scope and relevant costs after assessing the property.",
    faqQ: "Can a metal or Colorbond roof be repaired without replacing the whole roof?",
    faqA: "We inspect the surrounding sheets, fixings and flashing to identify whether a targeted repair suits the roof, then confirm the repair scope and quote.",
    faqExtras: [
      {
        q: "Does visible rust identify the source of a roof leak?",
        a: "Visible rust helps us locate the area to inspect. We check the laps, fasteners, penetrations, flashing and drainage, trace the water-entry path and confirm the repair plan and quote.",
      },
      {
        q: "Should I tighten loose-looking roof screws myself?",
        a: "No. Do not climb onto a metal roof or alter fixings from an unsafe position. Record what is visible from the ground and include it in an enquiry instead.",
      },
      {
        q: "Is Colorbond a separate repair service from metal roof repairs?",
        a: "Colorbond is a commonly used material term within metal roof enquiries. The actual sheet profile, age, surrounding details and visible condition still need to be considered before any material or repair approach is identified.",
      },
      {
        q: "When should I choose Roof Leak Repairs instead?",
        a: "Choose Roof Leak Repairs when the source area is uncertain or the main sign is an indoor water mark or drip. Choose Metal & Colorbond Roof Repairs when the concern is clearly associated with a visible metal-roof area or junction.",
      },
    ],
    next: "Send the visible metal-roof area, any related interior signs, the weather conditions, your suburb and safe ground-level photos. Photos are optional; a written description is enough to arrange the assessment.",
  },
  {
    slug: "roof-renovation",
    title: "Roof Renovation",
    direct: "Ellis Services Group assesses roofs for renovation, repairs and maintenance. We inspect the roof covering, ridge, flashing and drainage, then explain the work that suits the roof condition and your goals.",
    symptoms: "Useful context can include widespread visible weathering, repeated maintenance concerns, an older roof finish, ongoing water-entry signs or a desire to refresh a roof surface. Record the material you can identify from ground level, the roof areas that concern you and any known previous work.",
    causes: "A renovation decision can involve the roof covering, ridge and flashing details, drainage, access, material age and the condition that can be safely seen. We inspect the existing materials and connected roof details on site, identify any further access needed and explain suitable repairs and finishes.",
    assessment: "We inspect the roof materials, layout, ridge, flashing and drainage on site, with safe access arranged for the property. We discuss the renovation goal and recommend the repair, maintenance and finish work supported by the condition found.",
    pathways: "We identify the repairs required before renovation finishes and explain the roof areas, materials and work sequence in your quote. Contact us to arrange an on-site assessment and confirm the plan.",
    scope: "Access, roof height, material profile, visible condition, drainage, weather and the project goal shape the assessment. We explain whether repair, maintenance or renovation is the best next step, along with the recommended scope and relevant costs.",
    faqQ: "Does a roof renovation enquiry automatically mean full roof replacement?",
    faqA: "No. The suitable next step depends on the condition that can be assessed, the property owner's objective and the agreed scope.",
    faqExtras: [{ q: "Can I send photos of the roof I want renovated?", a: "Yes. Safe ground-level photos help us prepare for the assessment; we confirm the recommended scope after reviewing the property." }],
    next: "Send your renovation objective, the visible roof material or concern, your suburb and any safe photos. Photos are optional; a written description is enough to arrange the assessment.",
    related: [
      { label: "Roof Inspections", path: "/services/roof-inspections", description: "Choose an inspection when the visible condition or most suitable service is unclear." },
      { label: "Roof Cleaning", path: "/services/roof-cleaning", description: "Choose cleaning when the main concern is visible surface growth or debris rather than a renovation decision." },
    ],
  },
  {
    slug: "roof-cleaning",
    title: "Roof Cleaning",
    direct: "Ellis Services Group provides roof cleaning in Canberra for moss, lichen, dirt and surface debris. We assess the tile or metal roof condition before selecting a cleaning method, then agree the areas, drainage arrangements, access and quote. Cleaning and repairs are separate scopes.",
    symptoms: "From the ground, note visible moss, lichen, leaf debris, dirt build-up or discolouration and whether it is concentrated near valleys, gutters, solar panels, roof edges or shaded areas. Do not climb onto the roof to inspect or remove material.",
    causes: "Surface build-up can vary with roof material, weather exposure, surrounding trees, drainage and the roof's age. We inspect the material and drainage on site, choose a suitable cleaning method and identify any repair work needed.",
    assessment: "We inspect the material, existing coating, surface condition, pitch and build-up before choosing the method. Tile and coated metal roofs are not treated as interchangeable surfaces, and pressure washing is not assumed to suit every roof. We also consider nearby solar panels, penetrations and drainage, and discuss how loosened debris and runoff will be managed within the agreed work. Damaged materials or water-entry concerns are assessed before cleaning proceeds.",
    pathways: "We plan roof cleaning alongside gutter and downpipe clearing where debris affects the drainage route. If we find water entry or damaged roofing, we explain the required repair work and quote before proceeding.",
    scope: "Roof height, material, surface condition, access, weather, nearby services and debris location shape the assessment. We confirm the recommended cleaning approach, scope and relevant costs after assessing the property.",
    faqQ: "Can roof cleaning fix a roof leak?",
    faqA: "Cleaning removes surface build-up; a roof leak needs investigation of the water-entry path. Tell Ellis about the drip or ceiling stain so we can inspect the affected area and confirm the cleaning and repair work required.",
    faqExtras: [{ q: "Should I pressure-clean a roof myself?", a: "Do not climb onto a roof or use cleaning equipment from an unsafe position. Record what is visible from the ground and describe it in an enquiry." }],
    next: "Send the visible build-up area, roof material if known, your suburb and safe ground-level photos. Photos are optional; a written description is enough to arrange the assessment.",
    related: [
      { label: "Gutter & Downpipe Maintenance", path: "/services/gutter-downpipe-maintenance", description: "Choose this service when visible debris or overflow is concentrated in the drainage system." },
      { label: "Roof Inspections", path: "/services/roof-inspections", description: "Choose an inspection when you are not sure whether cleaning is the most suitable service." },
    ],
  },
  {
    slug: "gutter-downpipe-maintenance",
    title: "Gutter & Downpipe Cleaning and Maintenance",
    direct: "Ellis Services Group provides gutter and downpipe cleaning and maintenance locally. We inspect the run, outlets and downpipes on site, locate blockages or damage and quote the clearing, repair or replacement work needed.",
    symptoms: "Note leaf build-up, overflow during rain, visible sagging, water running near a wall, a blocked-looking outlet or a downpipe concern. Record the weather context and the general roof edge or side of the property without using an unsafe ladder or roof access.",
    causes: "Drainage performance can be affected by debris, roof runoff, gutter fall, joints, outlets, downpipes and conditions that are not visible from the ground. We check the gutter run, outlets and downpipes on site to locate the blockage or damaged component and plan the work.",
    assessment: "We inspect the gutter run, joints, outlets and connected downpipes on site, check the reported overflow route and plan safe access. We identify the blockage or damaged component and explain the cleaning or maintenance work required.",
    pathways: "We clear the agreed drainage areas and identify any joints, outlets or downpipes requiring repair. Where water has entered the building, our team investigates the connected roof area and confirms the repair scope and quote.",
    scope: "Height, access, debris, gutter and downpipe condition, weather and the work area shape the assessment. We confirm the recommended cleaning or maintenance approach, scope and relevant costs after assessing the property.",
    faqQ: "Does gutter overflow always mean a downpipe is blocked?",
    faqA: "Debris, outlet condition, gutter fall, roof runoff and other drainage details can all be relevant.",
    faqExtras: [{ q: "Should I clear a high gutter from a ladder myself?", a: "Do not use a ladder or roof access beyond a safe and appropriate position. Record the visible overflow or debris area and include it in an enquiry." }],
    next: "Send the gutter or downpipe area, when overflow occurs, your suburb and any safe photos. Photos are optional; a written description is enough to arrange the assessment.",
    related: [
      { label: "Roof Cleaning", path: "/services/roof-cleaning", description: "Choose roof cleaning when visible surface debris or growth extends beyond the drainage line." },
      { label: "Roof Leak Repairs", path: "/services/roof-leak-repairs", description: "Choose roof leak repairs when there is an indoor water sign or the source is uncertain." },
    ],
  },
];
serviceSeed.push(GUTTER_REPAIR_SERVICE, ...ADDITIONAL_SERVICES, REPLACEMENT_SERVICE);
const serviceBySlug = Object.fromEntries(
  serviceSeed.map((service) => [service.slug, service]),
);
const seoHeadings: Record<string, string> = {
  "roof-leak-repairs": "Roof Leak Repairs Canberra",
  "tile-roof-repairs": "Tile Roof Repairs",
  "chimney-flashing-repairs": "Chimney Flashing Repairs",
  "rebedding-repointing": "Ridge Capping Repairs",
  "roof-inspections": "Roof Inspections Canberra",
  "reroof-replacement": "Roof Replacement Canberra",
  "metal-roof-repairs": "Metal & Colorbond Roof Repairs",
  "roof-renovation": "Roof Renovation & Restoration",
  "gutter-repairs": "Gutter Repairs",
  "emergency-roof-repairs": "Emergency & Urgent Roof Repairs",
  "rental-property-roof-repairs": "Roof Repairs for Rental Properties",
  "roof-cleaning": "Roof Cleaning Canberra",
  "gutter-downpipe-maintenance": "Gutter & Downpipe Cleaning",
};
const serviceGalleries: Record<
  string,
  { title: string; intro: string; images: { src: string; alt: string }[] }
> = {
  "reroof-replacement": {
    title: "Roof materials and connections to assess before replacement",
    intro: "These existing site images illustrate roof materials and connected details. They are not a documented whole-roof replacement project or evidence of a replacement outcome.",
    images: [
      {src:"/assets/services/tile-roof-site-overview.png",alt:"Tiled roof and adjoining chimney"},
      {src:"/assets/services/metal-roof-completed-roof.png",alt:"Metal roof panels and roof junctions"},
    ],
  },
  "roof-leak-repairs": {
    title: "Roof-leak investigation and repair details.",
    intro:
      "Context images show visible signs, work stages and completed roof details. Individual roof conditions vary, so we confirm the recommended scope after assessing the property.",
    images: [
      {
        src: "/assets/services/roof-leak-interior-water-mark.png",
        alt: "Interior ceiling water mark being documented",
      },
      {
        src: "/assets/services/roof-leak-flashing-before-after.png",
        alt: "Tile roof vent flashing shown before and after visible repair work",
      },
      {
        src: "/assets/services/roof-leak-on-roof-assessment.png",
        alt: "Roofing worker assessing tiles and flashing near a roof vent",
      },
      {
        src: "/assets/services/roof-leak-flashing-repair.png",
        alt: "Roofing workers handling tiles and applying sealant around vent flashing, with harnesses and ropes visible",
      },
      {
        src: "/assets/services/roof-leak-completed-roof.png",
        alt: "Completed tile roof and vent flashing viewed from a residential property",
      },
    ],
  },
  "tile-roof-repairs": {
    title: "What tile roof repair concerns can look like.",
    intro:
      "Context images show tile condition, access and repair activity. Individual roof conditions vary, so we confirm the recommended scope after assessing the property.",
    images: [
      {
        src: "/assets/services/tile-roof-site-overview.png",
        alt: "Tile roofing workers at a residential property with a visible roof repair area",
      },
      {
        src: "/assets/services/tile-roof-damaged-tiles.png",
        alt: "Damaged roof tiles being observed",
      },
      {
        src: "/assets/services/tile-roof-repair-work.png",
        alt: "Roofing workers handling tiles during roof repair work",
      },
      {
        src: "/assets/services/tile-roof-condition-review.png",
        alt: "Tile roof surface viewed while workers review the visible roof condition",
      },
      {
        src: "/assets/services/tile-roof-before-after.png",
        alt: "Tile roof detail showing a visible damaged area and completed local repair",
      },
    ],
  },
  "rebedding-repointing": {
    title: "What ridge capping work can involve.",
    intro:
      "Context images show ridge-cap condition and repair stages. Individual roof conditions vary, so we confirm the recommended scope after assessing the property.",
    images: [
      {
        src: "/assets/services/ridge-capping-condition.png",
        alt: "Visible ridge cap condition being reviewed on a tiled residential roof",
      },
      {
        src: "/assets/services/ridge-capping-rebedding.png",
        alt: "Roofing workers placing a ridge cap onto fresh bedding material",
      },
      {
        src: "/assets/services/ridge-capping-pointing.png",
        alt: "Worker applying pointing material along a tiled roof ridge line",
      },
      {
        src: "/assets/services/ridge-capping-completed-line.png",
        alt: "Completed ridge capping line visible beside older roof tiles",
      },
      {
        src: "/assets/services/ridge-capping-repair-process.png",
        alt: "Roofing workers preparing a ridge line for repair",
      },
    ],
  },
  "chimney-flashing-repairs": {
    title: "What chimney flashing work can involve.",
    intro:
      "Context images show chimney-to-roof junction details and repair stages. Individual roof conditions vary, so we confirm the recommended scope after assessing the property.",
    images: [
      {
        src: "/assets/services/chimney-flashing-condition.png",
        alt: "Existing chimney flashing condition being reviewed beside tiled roofing",
      },
      {
        src: "/assets/services/chimney-flashing-assessment.png",
        alt: "Roofing workers reviewing chimney flashing and recording visible junction details",
      },
      {
        src: "/assets/services/chimney-flashing-installation.png",
        alt: "Worker forming flashing details around a brick chimney on a tiled roof",
      },
      {
        src: "/assets/services/chimney-flashing-completed-detail.png",
        alt: "Completed chimney flashing detail visible around a brick chimney base",
      },
      {
        src: "/assets/services/chimney-flashing-completed-roof-detail.png",
        alt: "Completed lead flashing detail around a brick chimney on a tiled roof",
      },
    ],
  },
  "roof-inspections": {
    title: "What a visual roof inspection can involve.",
    intro:
      "Context images show inspection activity, visible observations and recording roof details. We agree the inspection purpose and scope before booking.",
    images: [
      {
        src: "/assets/services/roof-inspection-roofline-review.png",
        alt: "Roofing worker reviewing visible ridge-line condition while holding an inspection clipboard",
      },
      {
        src: "/assets/services/roof-inspection-team-review.png",
        alt: "Roof inspection team reviewing roof tiles and a chimney junction",
      },
      {
        src: "/assets/services/roof-inspection-photo-record.png",
        alt: "Roofing worker recording visible chimney and flashing details with a phone and notes",
      },
      {
        src: "/assets/services/roof-inspection-checklist.png",
        alt: "Roof inspection checklist being completed while a worker reviews visible roof tiles",
      },
      {
        src: "/assets/services/roof-inspection-solar-roof-review.png",
        alt: "Roofing worker recording visible tile and solar-panel roof details",
      },
    ],
  },
  "metal-roof-repairs": {
    title: "What metal roof repair work can involve.",
    intro:
      "Context images show metal-roof conditions, repair activity and completed roof details. Individual roof conditions vary, so we confirm the recommended scope after assessing the property.",
    images: [
      {
        src: "/assets/services/metal-roof-repair-team-work.png",
        alt: "Two roofing workers carrying out repair work on a metal roof",
      },
      {
        src: "/assets/services/metal-roof-wall-flashing-condition.png",
        alt: "Visible metal roof wall-flashing condition and aged fasteners",
      },
      {
        src: "/assets/services/metal-roof-secure-fixing.png",
        alt: "Roofing worker using a drill on metal roof sheet fixings, with a harness and rope visible",
      },
      {
        src: "/assets/services/metal-roof-gutter-edge-repair.png",
        alt: "Roofing worker repairing a metal roof edge and gutter junction",
      },
      {
        src: "/assets/services/metal-roof-completed-roof.png",
        alt: "Completed dark metal roof with ridge and roof ventilation details",
      },
    ],
  },
  "roof-cleaning": {
    title: "What professional roof cleaning work can show.",
    intro:
      "Context images show visible surface build-up, gutter debris, cleaning activity and a completed roof surface. Individual roof conditions vary, so we confirm the recommended scope after assessing the property.",
    images: [
      {
        src: "/assets/services/roof-cleaning-surface-condition.png",
        alt: "Tile roof surface with visible moss, lichen and leaf build-up near the gutter line",
      },
      {
        src: "/assets/services/roof-cleaning-gutter-debris.png",
        alt: "Worker removing leaf debris from a residential roof gutter beside weathered tiles",
      },
      {
        src: "/assets/services/roof-cleaning-controlled-wash.png",
        alt: "Roofing worker spraying water onto a tiled residential roof, with a hose and ladder visible",
      },
      {
        src: "/assets/services/roof-cleaning-site-overview.png",
        alt: "Roof cleaning activity on a tiled home viewed from ground level",
      },
      {
        src: "/assets/services/roof-cleaning-completed-roof.png",
        alt: "Clean tiled roof on a residential home",
      },
    ],
  },
  "gutter-downpipe-maintenance": {
    title: "What gutter and downpipe maintenance can show.",
    intro:
      "Context images show roof-edge channels, gutter debris and drainage areas around metal roofing and solar panels. Individual roof conditions vary, so we confirm the recommended scope after assessing the property.",
    images: [
      {
        src: "/assets/services/gutter-downpipe-valley-condition.jpg",
        alt: "Visible debris in a metal roof valley channel above a residential street",
      },
      {
        src: "/assets/services/gutter-downpipe-roof-edge-condition.jpg",
        alt: "Residential roof edge and gutter line with visible debris build-up",
      },
      {
        src: "/assets/services/gutter-downpipe-vegetation-build-up.jpg",
        alt: "Overgrown vegetation beside a metal roof drainage channel requiring maintenance context",
      },
      {
        src: "/assets/services/gutter-downpipe-solar-channel-debris.jpg",
        alt: "Debris visible in a metal roof drainage channel beside solar panels",
      },
      {
        src: "/assets/services/gutter-downpipe-edge-debris.jpg",
        alt: "Leaf and plant debris visible along a metal roof edge and gutter channel",
      },
    ],
  },
};
serviceBySlug["roof-leak-repairs"].related = [
  {
    label: "Roof Inspections",
    path: "/services/roof-inspections",
    description:
      "If the entry point is unclear, a roof inspection enquiry can help frame the visible concern safely.",
  },
  {
    label: "Rebedding & Repointing",
    path: "/services/rebedding-repointing",
    description:
      "Use this pathway for visible changes along ridge or hip lines, especially where those details may relate to the wider roof context.",
  },
  {
    label: "Chimney Flashing Repairs",
    path: "/services/chimney-flashing-repairs",
    description:
      "Use this pathway when water-entry signs are near a chimney-to-roof junction.",
  },
];
serviceBySlug["tile-roof-repairs"].related = [
  {
    label: "Roof Inspections",
    path: "/services/roof-inspections",
    description: "Choose an inspection when several tile areas concern you or you want to compare local repair with broader roof work.",
  },
  {
    label: "Roof Repairs",
    path: "/services",
    description:
      "Use the broad roof repairs overview when tile concerns sit within a wider roof condition.",
  },
  {
    label: "Rebedding & Repointing",
    path: "/services/rebedding-repointing",
    description:
      "Use this pathway for visible changes at ridge or hip lines near tiled roof areas.",
  },
];
serviceBySlug["chimney-flashing-repairs"].related = [
  {
    label: "Roof Leak Repairs",
    path: "/services/roof-leak-repairs",
    description:
      "Use this pathway when water-entry signs may extend beyond the chimney-to-roof junction.",
  },
  {
    label: "Roof Inspections",
    path: "/services/roof-inspections",
    description:
      "Use an inspection enquiry when the visible concern is unclear or more than one roof area may be involved.",
  },
];
serviceBySlug["rebedding-repointing"].related = [
  {
    label: "Roof Leak Repairs",
    path: "/services/roof-leak-repairs",
    description:
      "If ridge-line changes occur with interior water signs, record both observations and review the roof leak pathway.",
  },
  {
    label: "Roof Inspections",
    path: "/services/roof-inspections",
    description:
      "Use an inspection enquiry when the condition is unclear and there is no single repair pathway to start with.",
  },
];
serviceBySlug["roof-inspections"].related = [
  {
    label: "Roof Leak Repairs",
    path: "/services/roof-leak-repairs",
    description:
      "Use the roof leak pathway for water entry signs such as a fresh stain, drip or damp patch after rain.",
  },
  {
    label: "Rebedding & Repointing",
    path: "/services/rebedding-repointing",
    description:
      "Use this pathway when the visible concern is around ridge caps or hip lines rather than an unknown roof area.",
  },
  {
    label: "Chimney Flashing Repairs",
    path: "/services/chimney-flashing-repairs",
    description:
      "Use this pathway when the concern is at a chimney-to-roof junction.",
  },
];
serviceBySlug["metal-roof-repairs"].related = [
  {
    label: "Roof Leak Repairs",
    path: "/services/roof-leak-repairs",
    description:
      "Use the roof leak pathway when the visible metal-roof area is uncertain and the main sign is water entry inside the property.",
  },
  {
    label: "Roof Inspections",
    path: "/services/roof-inspections",
    description:
      "Use an inspection enquiry when more than one roof area may be involved or the visible condition does not point to one clear repair pathway.",
  },
];
const defaults: Data = {
  company: "Ellis Services Group",
  tagline:
    "Roof repairs and inspections for Canberra homes. Ellis arranges an on-site assessment, identifies the cause and explains the repair plan and written quote.",
  phone: "0405878406",
  email: "elliservices.group@gmail.com",
  address: "121 Marcus Clarke St, Canberra, ACT 2600",
  newsTitle: "Roof leaks, inspections and maintenance",
  newsCopy:
    "Ellis provides roof repairs, cleaning and maintenance across Canberra, with an on-site assessment and written quote. Send your suburb and concern to arrange a visit; a photo is optional.",
  media: [
    "/assets/home/canberra-roof-hero.png",
    "/assets/home/australian-residential-roof-context.png",
    "/assets/home/tile-roof-detail.png",
  ],
  services: serviceSeed,
  faqs: [],
};
const canonicalFaqs: Faq[] = [
  {
    q: "Getting started / Do you cover Canberra?",
    a: "Yes. Ellis Services Group provides roof repairs and inspections across Canberra. Send your suburb and roof concern to arrange an on-site assessment; we confirm the appointment and provide the repair plan and written quote.",
  },
  {
    q: "Getting started / Which suburbs can I select?",
    a: "The enquiry selector groups Canberra suburbs by district so you can choose the location that best matches your property.",
  },
  {
    q: "Getting started / What should I include in an enquiry?",
    a: "Start with your suburb, the visible concern, when you noticed it and the closest service topic. Include only details you are comfortable sending with your enquiry.",
  },
  {
    q: "Getting started / Can I add photos?",
    a: "Yes. You can attach one optional JPG, PNG or WebP image up to 4 MB. You can also request an assessment without a photo.",
  },
  {
    q: "Getting started / Can photos diagnose a roof remotely?",
    a: "Photos help us understand the visible concern and prepare for assessment. We confirm the recommended scope after reviewing the property.",
  },
  {
    q: "Roof leaks / What should I note after rain?",
    a: "Note drips, ceiling stains, damp patches or musty odours from a safe ground-level position. Do not access the roof yourself.",
  },
  {
    q: "Roof leaks / Why is a stain not below the entry point?",
    a: "Water can travel along roof or ceiling elements before becoming visible, so the interior mark may not be directly below an entry point.",
  },
  {
    q: "Roof leaks / What is the safe first step?",
    a: "Keep clear of wet electrical areas and observe from the ground. For immediate life or electrical danger, contact emergency services or an appropriately qualified professional.",
  },
  {
    q: "Roof leaks / Is a temporary patch a complete repair?",
    a: "A temporary measure can limit symptoms. Ellis investigates the underlying cause on site and confirms the lasting repair work and quote.",
  },
  {
    q: "Roof leaks / Can a small leak be ignored?",
    a: "No. Even a small leak can spread moisture beyond the visible mark. Arrange an on-site assessment so Ellis can trace the cause and quote the repair work.",
  },
  {
    q: "Roof leaks / Can dry weather limit an inspection?",
    a: "Yes. A condition that appears only in rain may not be observable during dry weather.",
  },
  {
    q: "Tiles / What if tiles are cracked, slipped or missing?",
    a: "Describe the location from a safe viewpoint and select Tile Roof Repairs. Do not climb onto the roof to inspect or move tiles.",
  },
  {
    q: "Tiles / Can only a few tiles be replaced?",
    a: "Yes. A few damaged tiles can be replaced when matching profiles are available and the surrounding roof supports a local repair. Ellis checks the adjoining tiles, ridge and flashing, then confirms materials, scope and the written quote.",
  },
  {
    q: "Tiles / Will replacement tiles match exactly?",
    a: "Older tile colour and finish can vary with weathering even where a similar option is available.",
  },
  {
    q: "Ridges / What is rebedding versus repointing?",
    a: "Bedding supports a ridge cap beneath it; pointing is the exposed finishing material. Their condition and relationship need consideration together.",
  },
  {
    q: "Ridges / Does every crack need full repointing?",
    a: "No. Ellis checks cap stability, bedding, pointing and adjoining tiles on site. We identify the sections requiring local or broader ridge work and explain the repair scope and written quote.",
  },
  {
    q: "Chimneys / What does flashing do?",
    a: "Flashing helps manage the junction between chimney, brickwork and roof materials. The appropriate material or scope depends on the site and applicable requirements.",
  },
  {
    q: "Chimneys / Do old sealant or patches prove the cause?",
    a: "No. They may be relevant, but the surrounding junction, adjacent tiles or mortar and reported water path also need consideration.",
  },
  {
    q: "Inspections / What does visual and non-invasive mean?",
    a: "Observations are limited to what can be safely and reasonably viewed without invasive investigation, unless another scope is specifically agreed.",
  },
  {
    q: "Inspections / Are roof-space access, photos or written notes included?",
    a: "We agree any roof-space access, photographs or written notes before booking, so you know exactly what the visit includes.",
  },
  {
    q: "Inspections / What limits an inspection?",
    a: "Safety, weather, access and the agreed purpose can limit what is observable.",
  },
  {
    q: "Inspections / Is this engineering, valuation or certification?",
    a: "No. This pathway is not a structural engineering report, valuation or compliance certification.",
  },
  {
    q: "Costs / What affects fees or repair scope?",
    a: "The concern, visible condition, access, weather, materials and agreed scope can all affect what needs consideration. Scope and any fees are confirmed before work is arranged.",
  },
  {
    q: "Costs / How much does roof repair cost in Canberra?",
    a: "The cost depends on the roof concern, access, materials, weather and the work required. Before arranging a visit, we explain any inspection or booking fee that applies. Repair pricing is confirmed after assessment and before work begins.",
  },
  {
    q: "Costs / Is an inspection or quote free?",
    a: "Before booking, we explain any inspection or booking fee that applies to your property and the proposed visit. Any repair cost is confirmed after assessment and before work is arranged.",
  },
  {
    q: "Timing / How quickly will someone respond?",
    a: "Contact Ellis to arrange an assessment; we confirm the appointment separately, with attendance planned around weather, safe access and the work required.",
  },
  {
    q: "Storm or hail / What should I do after storm or hail roof damage?",
    a: "Keep clear of damaged areas and wet electrical fittings. Contact emergency services for immediate danger. For roof damage, contact Ellis to arrange a safe on-site assessment and repair quote; contact your insurer separately about any claim.",
  },
  {
    q: "Maintenance / Can roof cleaning help prevent blocked gutters?",
    a: "Roof cleaning and gutter maintenance can remove visible debris from roof and drainage areas. The appropriate cleaning or maintenance approach is confirmed after assessing the property.",
  },
  {
    q: "Inspections / When should I arrange a roof inspection?",
    a: "A roof inspection is a useful starting point when you have noticed a concern but are unsure whether it relates to tiles, metal roofing, flashing, ridge capping or drainage.",
  },
  {
    q: "Metal roofing / Can metal and Colorbond roof sheets be repaired?",
    a: "Metal and Colorbond roof repairs can address suitable sheet, fixing, flashing and junction concerns. We assess the visible condition and explain the recommended repair option for the property.",
  },
  {
    q: "Next steps / Which service should I choose?",
    a: "Choose Roof Leak Repairs for water-entry signs, Tile Roof Repairs for visible tile concerns, Chimney Flashing Repairs for a chimney junction, Rebedding & Repointing for ridge lines, or Roof Inspections if unsure. You can also use /contact.",
  },
];
const store = "canberraroofkind-content-v7";
const load = () => {
  try {
    return migrateStoredData(
      defaults,
      serviceSeed,
      canonicalFaqs,
      JSON.parse(localStorage.getItem(store) || "{}"),
    ) as Data;
  } catch {
    return { ...defaults, faqs: canonicalFaqs };
  }
};
const nav = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Areas", "/areas"],
  ["News", "/news"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
];
function Home({ data }: { data: Data }) {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setSlide((s) => (s + 1) % data.media.length),
      5000,
    );
    return () => clearInterval(id);
  }, [data.media.length]);
  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">CANBERRA ROOFING ENQUIRIES</p>
          <h1>Roof Repairs Canberra</h1>
          <p>{data.tagline}</p>
          <a className="button" href="/contact">
            Start an enquiry <ArrowRight size={17} />
          </a>
        </div>
        <div className="carousel">
          <ResponsiveImage src={data.media[slide]} alt="Australian residential roof" priority />
          <div className="carouselControls">
            <button
              onClick={() =>
                setSlide((slide + data.media.length - 1) % data.media.length)
              }
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>
            <span>
              0{slide + 1} / 0{data.media.length}
            </span>
            <button
              onClick={() => setSlide((slide + 1) % data.media.length)}
              aria-label="Next image"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
      <section className="intro">
        <p className="eyebrow">PRACTICAL, LOCAL COMMUNICATION</p>
        <h2>A clearer first step for a roof concern.</h2>
        <p>
          Share what you have noticed, contact Ellis with the visible issue. We arrange an on-site assessment, identify the cause and confirm the repair plan and written quote.
        </p>
      </section>
    </>
  );
}
function HomeV2({ data }: { data: Data }) {
  return (
    <>
      <link rel="preload" as="image" type="image/webp" href="/assets/responsive/au-hero-act-tile-roof-800.webp" media="(max-width: 760px)" fetchPriority="high" />
      <link rel="preload" as="image" type="image/webp" href="/assets/responsive/au-hero-act-tile-roof-1200.webp" media="(min-width: 761px)" fetchPriority="high" />
      <section className="tradeHero">
        <div className="heroContent">
          <p className="eyebrow">CANBERRA ROOF REPAIRS</p>
          <h1>Roof Repairs Canberra</h1>
          <p>
            {data.tagline} Tell us your suburb and what you have noticed; you do not need to identify the cause.
          </p>
          <div className="heroActions">
            <a className="button" href="/contact">
              Request a roof assessment <ArrowRight size={18} />
            </a>
            <a className="textAction" href="/services">
              Find the right service
            </a>
          </div>
          <ul className="heroAdvantages" aria-label="Roof assessment and booking arrangements">
            <li>On-site roof assessment</li>
            <li>Appointment timing confirmed separately</li>
            <li>Repair scope and written quote before work</li>
          </ul>

        </div>
        <div className="heroProof">
          <span>Canberra, ACT</span>
          <a href={`tel:${data.phone}`}>{data.phone}</a>
        </div>
      </section>
      <section
        className="safeObservation"
        aria-labelledby="safe-observation-title"
      >
        <div>
          <p className="eyebrow">ROOF LEAK / SAFETY-FIRST</p>
          <h2 id="safe-observation-title">
            Roof leak: safe observations before an inspection
          </h2>
          <p>
            Tell us where water appears and when it started, using only safe indoor or ground-level observations. Ellis traces the roof-entry path on site and quotes the repairs needed.
          </p>
        </div>
        <ul>
          <li>
            Note the room, visible stain, drip or damp patch and when it first
            appeared.
          </li>
          <li>
            Record whether it followed steady rain, wind-driven rain or a storm.
          </li>
          <li>
            From the ground, note the general roof area or nearby chimney,
            valley or skylight if visible.
          </li>
        </ul>
        <div className="safetyNotes" aria-label="Safety reminders">
          <p className="safetyNote">
            Do not climb onto the roof or touch wet electrical areas.
          </p>
          <p className="safetyNote">
            Do not use a ladder alone or in wet or windy conditions.
          </p>
          <p className="safetyNote">
            Keep children and pets clear of any damaged or dripping area.
          </p>
        </div>
        <div className="safeObservationActions">
          <a className="button" href="/services/roof-leak-repairs">
            Explore Roof Leak Repairs <ArrowRight size={17} />
          </a>
          <a
            className="textAction"
            href="/contact?service=Roof%20Leak%20Repairs"
          >
            Send recorded details
          </a>
        </div>
      </section>
      <section className="homeServices">
        <div className="sectionIntro homeServicesIntro">
          <p className="eyebrow">CANBERRA ROOF REPAIR SERVICES</p>
          <h2>Canberra Roof Repair Services</h2>
          <p>
            Specific roof repair, roof maintenance and cleaning services for
            Canberra homes.
          </p>
        </div>
        <nav className="homeServiceDirectory" aria-label="Choose a roof repair service">
          {data.services.map((service) => <a key={service.slug} href={`/services/${service.slug}`}>
            <span><strong>{service.title}</strong><span>{homeServiceSymptoms[service.slug] ?? serviceCardDetails[service.slug]?.intro}</span></span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>)}
        </nav>
        <a className="button" href="/services">
          View all services <ArrowRight size={18} />
        </a>
      </section>
      <section className="homeCta">
        <p className="eyebrow">LOCAL ROOF REPAIR SERVICES</p>
        <h2>Looking for a roofer in Canberra for a small roof repair?</h2>
        <p>
          Tell us your suburb and what you have noticed. We arrange an on-site assessment, identify the affected components and confirm the repair plan and written quote before work begins.
        </p>
        <p>For a few damaged tiles, start with <a href="/services/tile-roof-repairs">tile roof repairs</a>. For a stain after rain, explore <a href="/services/roof-leak-repairs">roof leak investigation</a>. Read our <a href="/news/when-to-arrange-roof-inspection-canberra">inspection and quote guide</a> to prepare for the visit.</p>
        <a className="button" href="/contact">
          Request a roof assessment <ArrowRight size={18} />
        </a>
      </section>
      <div className="homeGuidance">
        <IntentServiceContent slug="home" />
        <OperatingHours />
      </div>
      <section className="homeContextGrid trustImageGrid">
        <figure>
          <ResponsiveImage
            src="/assets/home/ellis-team-trust.png"
            alt="People beside a branded vehicle in a residential roof-service context image"
            width={1672}
            height={941}
          />
        </figure>
        <figure>
          <ResponsiveImage
            src="/assets/home/ellis-site-consultation.png"
            alt="People discussing roof work beside a branded vehicle"
            width={1672}
            height={941}
          />
        </figure>
      </section>
      <section className="homeMap" aria-labelledby="home-map-title">
        <div className="homeMapIntro">
          <p className="eyebrow">CANBERRA OFFICE</p>
          <h2 id="home-map-title">Canberra roof assessment enquiries</h2>
          <p>121 Marcus Clarke Street, Canberra ACT 2600</p>
          <a
            className="textAction"
            href="https://www.google.com/maps/search/?api=1&amp;query=121%20Marcus%20Clarke%20St%2C%20Canberra%20ACT%202600"
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <ArrowRight size={16} />
          </a>
        </div>
        <iframe
          className="homeMapFrame"
          title="Google Map: 121 Marcus Clarke Street, Canberra"
          src="https://www.google.com/maps?q=121%20Marcus%20Clarke%20Street%2C%20Canberra%20ACT%202600&amp;output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
      <section className="homeCta">
        <p className="eyebrow">NOT SURE WHERE TO BEGIN?</p>
        <h2>Describe what you have noticed.</h2>
        <p>
          Select your suburb and service to request an on-site assessment and written quote. A photo is optional; a short description is enough to arrange the visit.
        </p>
        <a className="button" href="/contact">
          Request a roof assessment <ArrowRight size={18} />
        </a>
      </section>
    </>
  );
}
function About({ data }: { data: Data }) {
  const gallery = [
    {
      src: "/assets/about/ellis-brand-team-briefing.png",
      alt: "People reviewing work information in a roof-service context image",
    },
    {
      src: "/assets/about/ellis-brand-vehicle-tools.png",
      alt: "Person preparing tools beside a branded vehicle",
    },
    {
      src: "/assets/about/ellis-brand-service-van.png",
      alt: "Branded van beside a residential property",
    },
    {
      src: "/assets/about/ellis-brand-site-preparation.png",
      alt: "People with equipment beside a residential property",
    },
    {
      src: "/assets/about/ellis-brand-roof-planning.png",
      alt: "Roof planning documents and branded materials on a table",
    },
  ];
  return (
    <section className="page prose aboutPage">
      <div className="pageMediaIntro">
        <div className="pageMediaCopy">
          <p className="eyebrow">ABOUT {data.company.toUpperCase()}</p>
          <h1>About Ellis Services Group</h1>
          <p>
            For most of us, home is where we raise our families, spend time
            together and plan for the years ahead. It is often one of life’s
            most significant investments, yet daily life can make maintenance
            difficult to keep on top of.
          </p>
          <p>
            Ellis Services Group provides roof repairs and inspections for Canberra homeowners. We listen to the concern, inspect the roof on site and explain the findings, recommended repairs and written quote in plain language.
          </p>

        </div>
        <figure className="pageFeatureMedia">
          <ResponsiveImage priority
            src="/assets/home/canberra-roof-hero.png"
            alt="Tiled residential roof beneath a clear sky"
          />
        </figure>
      </div>
      <h2>Our approach to roof repairs</h2>
      <div className="three">
        <article>
          <h3>Roof repairs for homeowners and property managers</h3>
          <p>
            Ellis Services Group provides roof repairs and inspections for homeowners,
            rental owners and property managers. Nominate the access contact and
            the person authorised to approve the proposed work.
          </p>
        </article>
        <article>
          <h3>Roof material and access assessment</h3>
          <p>
            We assess the roof covering, connected details and available access.
            Weather, roof height and material condition determine which areas
            can be inspected safely.
          </p>
        </article>
        <article>
          <h3>Repair scope and approval</h3>
          <p>
            The quote identifies the proposed repair area, materials and access
            requirements. Confirm the work and price before authorising repairs.
          </p>
        </article>
      </div>
      <section
        className="aboutNarrative"
        aria-labelledby="about-approach-title"
      >
        <div>
          <p className="eyebrow">ON-SITE ROOF ASSESSMENT</p>
          <h2 id="about-approach-title">
            Assessing stains, tiles and roof junctions
          </h2>
        </div>
        <div>
          <p>
            A ceiling mark, broken tile, loose ridge cap or chimney junction concern tells us where to start. Ellis checks beneath and around the affected area where safe access permits, traces the water path and explains the repairs needed.
          </p>
          <p>
            When you contact Ellis, your suburb, the affected room or roof area and the timing help us prepare for a site visit. We inspect the connected roof details and trace the cause. A ground-level photo is optional; we confirm the repair scope after the on-site assessment.
          </p>
          <p>Compare our <a href="/services">roof repair and maintenance services</a>, or use the <a href="/news/when-to-arrange-roof-inspection-canberra">inspection preparation guide</a> to organise your enquiry.</p>
        </div>
      </section>
      <section className="aboutProcess" aria-labelledby="about-process-title">
        <div className="aboutSectionIntro">
          <p className="eyebrow">WHAT TO EXPECT</p>
          <h2 id="about-process-title">
            How your roof assessment and repair are arranged.
          </h2>
          <p>
            We confirm the appointment and safe access, inspect the roof and explain the recommended work and written quote before you approve repairs.
          </p>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Describe the visible concern</h3>
              <p>
                Tell us your suburb, what you have noticed and whether it followed rain, wind or a storm. A short description is enough to request an assessment.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Confirm roof access and inspection scope</h3>
              <p>
                We confirm the appointment, inspection purpose and safe access around roof height, weather and material condition. On site, we check the affected area and connected roof details and explain any further investigation.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Agree the roof repair scope and quote</h3>
              <p>
                After assessment, we provide the recommended repairs and written quote, including materials, access and any further investigation. We agree the work with you before repairs begin.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <section
        className="aboutBrandGallery"
        aria-labelledby="about-brand-gallery-title"
      >
        <div className="aboutBrandGalleryIntro">
          <p className="eyebrow">ON-SITE PREPARATION</p>
          <h2 id="about-brand-gallery-title">
            Roof visit preparation and equipment
          </h2>
          <p>
            Context images show equipment and preparation for a roof visit.
            They do not identify current Ellis employees or document a customer job.
            We confirm the scope, timing and relevant costs after discussing the property.
          </p>
        </div>
        <div className="aboutBrandGalleryGrid">
          {gallery.map((image, index) => (
            <figure
              key={image.src}
              className={index === 0 ? "galleryFeature" : ""}
            >
              <ResponsiveImage src={image.src} alt={image.alt} />
            </figure>
          ))}
        </div>
      </section>
      <section
        className="aboutCredentials"
        aria-labelledby="about-credentials-title"
      >
        <div>
          <p className="eyebrow">BUSINESS DETAILS</p>
          <h2 id="about-credentials-title">
            Business record &amp; work requirements
          </h2>
          <p>
            Our office contact details are listed here so homeowners, property
            managers and agents can confirm the business contact before
            discussing a roof concern.
          </p>
        </div>
        <dl>
          <div>
            <dt>Office</dt>
            <dd>121 Marcus Clarke St, Canberra, ACT 2600</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              <a href="tel:0405878406">0405 878 406</a>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href="mailto:elliservices.group@gmail.com">
                elliservices.group@gmail.com
              </a>
            </dd>
          </div>
          <div>
            <dt>Australian Business Register</dt>
            <dd>
              <a
                href="https://abr.business.gov.au/ABN/View?id=645821745"
                target="_blank"
                rel="noreferrer"
              >
                View the public business record <ArrowRight size={15} />
              </a>
            </dd>
          </div>
        </dl>
        <p className="aboutCredentialNote">
          The Australian Business Register link allows you to check our public
          business record. Where specialist work, licensing, insurance or
          approvals are relevant, we confirm the applicable requirements before
          work is arranged.
        </p>
      </section>
      <section className="aboutFaq" aria-labelledby="about-faq-title">
        <div>
          <p className="eyebrow">COMMON QUESTIONS</p>
          <h2 id="about-faq-title">Roof assessment and booking questions</h2>
        </div>
        <div className="aboutFaqList rooflineFaq">
          <details>
            <summary>
              Do I need to know the exact roof problem before I contact you?
            </summary>
            <p>
              No. Describe the visible sign and select the closest pathway. The
              purpose of the initial enquiry is to provide context, not to require
              you to diagnose a roof from the ground.
            </p>
          </details>
          <details>
            <summary>Can I send a photo?</summary>
            <p>
              Yes. One optional JPG, PNG or WebP photo can be added to the enquiry
              form. A safe ground-level image helps us prepare for the assessment;
              we confirm the recommended scope after reviewing the property.
            </p>
          </details>
          <details>
            <summary>
              What should I do if water is near an electrical fitting?
            </summary>
            <p>
              Do not touch wet electrical areas. Treat an immediate life or
              electrical danger as urgent and contact emergency services or an
              appropriately qualified professional.
            </p>
          </details>
          <details>
            <summary>Do you confirm costs before arranging work?</summary>
            <p>
              Yes. Before booking, we explain the recommended scope, access
              requirements and the applicable inspection or booking fee.
            </p>
          </details>
          <details>
            <summary>
              What details are most useful in a roof repair enquiry?
            </summary>
            <p>
              Your suburb, the room or roof area affected, when the concern first
              appeared and whether it followed rain or wind are useful starting
              details. Include only observations you can make safely.
            </p>
          </details>
          <details>
            <summary>
              Can you help if I am unsure whether the roof is tile or metal?
            </summary>
            <p>
              Yes. Tell us the location and visible issue even if you do not know the roof material. We identify the covering and inspect its condition on site, then explain the repair plan and written quote.
            </p>
          </details>
          <details>
            <summary>What happens if weather makes an assessment unsafe?</summary>
            <p>
              Roof access is not attempted when conditions are unsafe. Any visit
              or next step is discussed with you based on safe access and the
              information available at the time.
            </p>
          </details>
          <details>
            <summary>Do I need to be at the property for an assessment?</summary>
            <p>
              Access arrangements and attendance requirements are discussed before
              an assessment is arranged. Let us know about gates, pets, tenants or
              other access considerations in your enquiry.
            </p>
          </details>
        </div>
      </section>
      <section
        className="caseStudyRail"
        aria-labelledby="about-case-study-title"
      >
        <p className="caseStudyRailLabel">CASE 01</p>
        <div>
          <p className="eyebrow">TILE ROOF PHOTO SEQUENCE</p>
          <h2 id="about-case-study-title">Tile roof repair photographs</h2>
          <p>Tile condition and visible work stages.</p>
        </div>
        <a href="/case-studies/tile-roof-repair-canberra">
          View case study <ArrowRight size={17} />
        </a>
      </section>
      <section
        className="aboutContactBand"
        aria-labelledby="about-contact-title"
      >
        <div>
          <p className="eyebrow">CANBERRA OFFICE</p>
          <h2 id="about-contact-title">
            Ready to describe a visible roof concern?
          </h2>
          <p>
            Call <a href="tel:0405878406">0405 878 406</a>, email{" "}
            <a href="mailto:elliservices.group@gmail.com">
              elliservices.group@gmail.com
            </a>{" "}
            or use the enquiry form with your suburb and the details you can
            safely observe.
          </p>
        </div>
        <a className="button" href="/contact">
          Send an enquiry <ArrowRight size={17} />
        </a>
      </section>
    </section>
  );
}
const serviceCardDetails: Record<string, { intro: string; focus: string; next: string }> = {
  "roof-leak-repairs": {
    intro: "Water marks, drips and rain-related damp patches.",
    focus: "Visible water signs, weather pattern and nearby roof junctions.",
    next: "Send the room, timing and safe ground-level photos. Photos are optional; a written description is enough to arrange the assessment.",
  },
  "tile-roof-repairs": {
    intro: "Cracked, slipped, missing or visibly displaced roof tiles.",
    focus: "Tile condition near ridges, valleys, chimneys and roof edges.",
    next: "Describe the visible tile area and when it changed.",
  },
  "chimney-flashing-repairs": {
    intro: "Water-entry signs or visible wear around a chimney junction.",
    focus: "Flashing, adjacent tiles, mortar and weather-related changes.",
    next: "Include the chimney-side room and any safe exterior view.",
  },
  "rebedding-repointing": {
    intro: "Worn, cracked or loose-looking ridge and hip line material.",
    focus: "Visible ridge caps, pointing condition and related water signs.",
    next: "Record the roof line and whether the concern is isolated.",
  },
  "roof-inspections": {
    intro: "Arrange an Ellis assessment to identify the roof concern and confirm the repair plan and quote.",
    focus: "Safe visible observations, access limits and enquiry purpose.",
    next: "Share the signs you have seen and your suburb.",
  },
  "metal-roof-repairs": {
    intro: "Metal or Colorbond sheets, fasteners, flashings and roof edges.",
    focus: "Visible sheet condition, penetrations, junctions and water signs.",
    next: "Do not access the roof; send safe photos from ground level. Photos are optional; a written description is enough to arrange the assessment.",
  },
  "roof-renovation": {
    intro: "An older roof requiring a considered renovation pathway.",
    focus: "Roof material, widespread weathering and known prior work.",
    next: "Tell us the roof areas you would like to discuss.",
  },
  "roof-cleaning": {
    intro: "Moss, lichen, leaf debris and visible roof-surface build-up.",
    focus: "Surface condition around valleys, solar panels and roof edges.",
    next: "Identify the visible build-up without climbing onto the roof.",
  },
  "gutter-downpipe-maintenance": {
    intro: "Overflow, debris, blocked outlets and drainage concerns.",
    focus: "Gutters, downpipes, roof runoff and visible drainage paths.",
    next: "Note the weather, roof edge and side of the property.",
  },
};

const homeServiceSymptoms: Record<string, string> = {
  "roof-inspections": "Safe visible observations, access limits and enquiry purpose.",
  "gutter-repairs": "Leaking, sagging or damaged gutter components.",
  "emergency-roof-repairs": "Active drips, storm damage or sudden overflow.",
  "rental-property-roof-repairs": "Tenant concerns, property access and owner approval.",
};

function ServiceCards({ data }: { data: Data }) {
  return (
    <div className="cards serviceCards">
      {data.services.map((s, i) => {
        const detail = serviceCardDetails[s.slug] ?? {
          intro: s.direct,
          focus: s.assessment,
          next: s.next,
        };
        return <article className="card serviceCard" key={s.slug}>
          <div className="serviceCardSummary">
          <div className="serviceCardTopline"><span>{String(i + 1).padStart(2, "0")}</span><span>Roof care service</span></div>
          <h3>{s.title}</h3>
          <p className="serviceCardLead">{detail.intro}</p>
          <a className="serviceCardAction" href={`/services/${s.slug}`}>
            Explore {serviceAnchorLabels[s.title] ?? s.title}
            <ArrowRight size={15} />
          </a>
          </div>
          <dl className="serviceCardFacts">
            <div><dt>Assessment focus</dt><dd>{detail.focus}</dd></div>
            <div><dt>Useful next step</dt><dd>{detail.next}</dd></div>
          </dl>
        </article>;
      })}
    </div>
  );
}
function Services({ data }: { data: Data }) {
  return (
    <section className="page servicesOverview">
      <p className="eyebrow">SERVICES OVERVIEW</p>
      <h1>Roof repair & maintenance services</h1>
      <p>
        Ellis provides roof repairs, inspections, cleaning and maintenance for Canberra homes. We inspect the property on site and confirm the required work and written quote. Choose a service below, or describe the issue if you are unsure.
      </p>
      <h2>Compare roof repair and maintenance services</h2>
      <ServiceCards data={data} />
      <GapHubLinks />
      <section className="guidance">
        <div>
          <p className="eyebrow">ROOF TYPE / CONCERN GUIDANCE</p>
          <h2>Not sure which service is closest?</h2>
          <p>
            Tell us where the problem appears, whether near tiles, ridges, a chimney or an interior ceiling. You do not need to diagnose the cause. Ellis checks the connected roof details on site and provides the repair plan and written quote.
          </p>
          <a className="button" href="/contact">
            Describe your concern <ArrowRight size={17} />
          </a>
        </div>
        <aside>
          <h3>Roof concerns to include in an enquiry</h3>
          <ul>
            <li>Water marks or drips → Roof Leak Repairs</li>
            <li>Loose or damaged tiles → Tile Roof Repairs</li>
            <li>Concern near chimney junction → Chimney Flashing Repairs</li>
            <li>Worn ridge lines → Rebedding & Repointing</li>
            <li>
              Visible metal sheets or Colorbond concerns → Metal &amp; Colorbond
              Roof Repairs
            </li>
            <li>Unsure where to begin → Roof Inspections</li>
            <li>Wider roof refresh → Roof Renovation</li>
            <li>Visible roof surface build-up → Roof Cleaning</li>
            <li>Overflow or drainage debris → Gutter &amp; Downpipe Maintenance</li>
          </ul>
        </aside>
      </section>
      <section className="serviceFaq">
        <p className="eyebrow">SERVICE FAQ</p>
        <h2>Before you enquire</h2>
        <details>
          <summary>What information is useful to include?</summary>
          <p>
            A short description of what you have noticed, your suburb and the
            closest service topic are a useful start. The form also accepts an optional photo; a written description is enough to request an on-site assessment.
          </p>
        </details>
        <details>
          <summary>Can I enquire if I am not sure of the issue?</summary>
          <p>
            Yes. Choose Roof Inspections or the closest visible concern, then
            explain what you have noticed in your own words.
          </p>
        </details>
        <details>
          <summary>How is the recommended scope confirmed?</summary>
          <p>
            We review the visible concern, access, materials and property context,
            then explain the recommended scope and next step before work is arranged.
          </p>
        </details>
        <a className="button" href="/contact">
          Go to contact <ArrowRight size={17} />
        </a>
      </section>
    </section>
  );
}
const serviceHeroImages: Record<string, { src: string; alt: string; caption: string }> = {
  "reroof-replacement": {src:"/assets/services/tile-roof-condition-review.png",alt:"Existing tiled roof surface and ridge condition",caption:"Existing covering condition informs the repair or replacement assessment."},
  "roof-leak-repairs": { src: "/assets/services/roof-leak-on-roof-assessment.png", alt: "Roof covering being assessed for visible condition", caption: "Assessment starts with the covering, junctions and drainage." },
  "tile-roof-repairs": { src: "/assets/services/tile-roof-repair-work.png", alt: "Local tile roof repair work", caption: "Tile condition and adjoining details guide the repair scope." },
  "chimney-flashing-repairs": { src: "/assets/services/chimney-flashing-installation.png", alt: "Flashing at a roof-to-chimney junction", caption: "The chimney junction and adjoining roof materials matter together." },
  "rebedding-repointing": { src: "/assets/services/ridge-capping-pointing.png", alt: "Pointing along a tiled roof ridge", caption: "Ridge bedding and exposed pointing have different roles." },
  "roof-inspections": { src: "/assets/services/roof-inspection-roofline-review.png", alt: "Roofline review during an inspection", caption: "A roof review connects visible signs with the condition on site." },
  "metal-roof-repairs": { src: "/assets/services/metal-roof-wall-flashing-condition.png", alt: "Metal roof and wall flashing detail", caption: "Sheets, fixings and flashing form one weathering system." },
  "roof-renovation": { src: "/assets/services/tile-roof-site-overview.png", alt: "Overview of an existing tiled roof", caption: "Roof-condition context; not a documented renovation result." },
  "roof-cleaning": { src: "/assets/services/roof-cleaning-controlled-wash.png", alt: "Worker spraying water onto a tiled roof", caption: "Cleaning methods depend on the roof material and its condition." },
  "gutter-downpipe-maintenance": { src: "/assets/services/gutter-downpipe-roof-edge-condition.jpg", alt: "Gutter condition along a roof edge", caption: "Gutters, outlets and downpipes share the drainage path." },
  "gutter-repairs": { src: "/assets/services/metal-roof-gutter-edge-repair.png", alt: "Gutter edge and adjoining metal roof detail", caption: "Check component condition as well as the flow of water." },
  "emergency-roof-repairs": { src: "/assets/projects/urgent-before-junction.webp", alt: "Roof junction before the documented urgent repair work", caption: "Before work: a junction from the urgent roof leak project." },
  "rental-property-roof-repairs": { src: "/assets/projects/confirmed-property-roof-work-1000.webp", alt: "Documented property roof maintenance work", caption: "Property roof work, recorded to support clear communication." },
};

function TileCasePhotos({ context, headingLevel = 2 }: { context: string; headingLevel?: 2 | 3 }) {
  const study = caseStudies[0];
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return <section className="relatedCase" aria-labelledby={`${context}-case-title`}>
    <p className="eyebrow">TILE REPAIR PHOTOS</p>
    <Heading id={`${context}-case-title`}>{context === "roof-renovation" ? "A local repair comparison, not a renovation result" : "A visible tile repair, before and after"}</Heading>
    <p>{study.summary}</p>
    <p>{context === "roof-renovation" ? "This related sequence shows a local tile repair with the surrounding weathered roof retained. It does not document a whole-roof renovation." : "This photo sequence shows visible tile work. It does not establish a particular leak cause, location or outcome for another property."}</p>
    <div className="relatedCasePhotos">{study.images.map(image => <figure key={image.src}><ResponsiveImage src={image.src} alt={image.alt} sizes="(max-width: 760px) calc(100vw - 5rem), 440px" /><figcaption>{image.caption}</figcaption></figure>)}</div>
    <a href={`/case-studies/${study.slug}`}>View the tile roof repair case study <ArrowRight size={17} /></a>
  </section>;
}

function ServiceView({ service }: { service: Service }) {
  const mergedQuestions = SERVICE_FAQ_MERGES[service.slug] ?? {};
  const serviceFaqs = [{ q: service.faqQ, a: service.faqA }, ...(service.faqExtras ?? [])].filter(item => !mergedQuestions[item.q]);
  const headings = SERVICE_TOPIC_HEADINGS[service.slug] ?? ['', '', '', '', '', 'Replacement materials, access and quoted scope'];
  const galleries: { title: string; intro: string; project?: boolean; relatedPath?: string; relatedLabel?: string; images: { src: string; alt: string; srcSet?: string; width?: number; height?: number; caption?: string }[] }[] = [serviceGalleries[service.slug], PROJECT_GALLERIES[service.slug as keyof typeof PROJECT_GALLERIES]].filter(Boolean);
  const caseStudy = ["tile-roof-repairs", "roof-inspections", "roof-leak-repairs", "roof-renovation"].includes(service.slug) ? caseStudies[0] : undefined;
  const galleryTitleId = `${service.slug}-gallery-title`;
  return (
    <section className="page serviceView">
      <header className="serviceHero pairedHero">
      <div className="pairedHeroCopy">
      <p className="eyebrow">ROOF REPAIR & CARE</p>
      <h1>{seoHeadings[service.slug] ?? service.title}</h1>
      <p className="directAnswer">{service.direct}</p>
      {service.slug === "roof-leak-repairs" ? <p>A ceiling stain is a symptom, not a diagnosis. Tell us if dampness appears without rain as well as after it; the assessment needs to distinguish roof water entry from other possible sources, including plumbing or condensation.</p> : null}
      <ul className="serviceAdvantages" aria-label="Roof assessment and booking arrangements">
        <li>On-site roof assessment</li>
        <li>Appointment timing confirmed separately</li>
        <li>Repair scope and written quote before work</li>
      </ul>
      <div className="serviceHeroActions"><a className="button" href={`/contact?service=${encodeURIComponent(service.title)}`}>Request a roof assessment <ArrowRight size={17}/></a><a className="textAction" href="tel:0405878406">0405878406</a></div>
      </div>
      <figure className="pairedHeroMedia"><ResponsiveImage src={serviceHeroImages[service.slug].src} alt={serviceHeroImages[service.slug].alt} priority sizes="(max-width: 1024px) calc(100vw - 3rem), 600px" /><figcaption>{serviceHeroImages[service.slug].caption}</figcaption></figure>
      </header>
      <ServiceSectionNav />
      <div className="servicePageSections">
      <ServiceTheme index={0} serviceSlug={service.slug}>
      <p>{service.symptoms}</p>
      <p>{service.causes}</p>
      {service.related?.length ? (
        <section className="relatedServices serviceRelatedLinks">
          <ul>
            {service.related.map(item => <li key={item.path}><h3><a href={item.path}>{item.label}</a></h3><p>{item.description}</p></li>)}
          </ul>
        </section>
      ) : null}
      </ServiceTheme>
      <ServiceTheme index={1} serviceSlug={service.slug}>
      <p>{service.assessment}</p>
      <p>{service.pathways}</p>
      <ServiceDepth slug={service.slug} headingLevel={3} />
      {service.slug === "emergency-roof-repairs" && <p><a href="https://esa.act.gov.au/be-emergency-ready/storms" target="_blank" rel="noopener noreferrer">ACT Emergency Services Agency: storm emergency assistance</a>. For an immediate threat to life call 000; for storm or flood emergency assistance call ACTSES on 132 500.</p>}
      <ServiceResources servicePath={`/services/${service.slug}`} />
      </ServiceTheme>
      <ServiceTheme index={2} serviceSlug={service.slug}>
      {galleries.map((gallery) => (
        <section key={gallery.title} className={`serviceGallery${gallery.project ? " serviceProjectGallery" : ""}`} data-project={gallery.project || undefined} data-image-count={gallery.images.length} aria-labelledby={`${galleryTitleId}${gallery.project ? "-project" : ""}`}>
          <div className="serviceGalleryIntro">
            <p className="eyebrow">{gallery.project ? "PROJECT PHOTOS" : "SERVICE IMAGE GUIDE"}</p>
            <h3 id={`${galleryTitleId}${gallery.project ? "-project" : ""}`}>{gallery.title}</h3>
            {!gallery.project && <p>{gallery.intro}</p>}
            {gallery.project && <ProjectWorkNotes slug={service.slug} />}
            {gallery.relatedPath && <a href={gallery.relatedPath}>{gallery.relatedLabel}</a>}
            {gallery.project && service.slug === "emergency-roof-repairs" && <p>Site conditions and work stages from the urgent roof leak project.</p>}
          </div>
          <div className="serviceGalleryGrid">
            {gallery.images.map((image, index) => (
              <figure
                key={image.src}
                className={index === 0 ? "galleryInterior" : ""}
              >
                <ResponsiveImage src={image.src} srcSet={image.srcSet} sizes={`(max-width: 760px) calc(100vw - 3rem), ${gallery.images.length === 1 ? "(max-width: 1440px) 90vw, 1400px" : gallery.images.length === 2 || gallery.images.length === 4 || (gallery.images.length === 5 && index < 2) ? "(max-width: 1440px) 45vw, 680px" : "(max-width: 1440px) 30vw, 440px"}`} alt={image.alt} width={image.width} height={image.height} />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      ))}
      {caseStudy ? <TileCasePhotos context={service.slug} headingLevel={3} /> : null}
      </ServiceTheme>
      <ServiceTheme index={3} serviceSlug={service.slug}>
        <div className="serviceBookingGrid">
        <div className="serviceBookingScope">
        <h3>{headings[5]}</h3>
        <p>{service.scope}</p>
        <p className="serviceCostNote">Before arranging a visit, we explain any inspection or booking fee that applies. Repair pricing is confirmed after assessment and before work begins.</p>
        <ServicePlanning slug={service.slug} headingLevel={3} />
        {service.slug === "roof-inspections" && <p>For a remote owner or managed property, provide the nominated access contact and who will review the repair quote. <a href="/services/rental-property-roof-repairs">Coordinate roof inspections and repairs for rental owners and property managers</a>.</p>}
        </div>
        <div className="serviceBookingAppointment">
        <OperatingHours headingLevel={3} />
        {service.slug === "rental-property-roof-repairs" && <p><a href="/news/roof-leak-information-for-tenants-canberra">What tenants can include in a roof leak report</a>.</p>}
        {service.slug === "roof-leak-repairs" && <p><a href="/services/emergency-roof-repairs">Urgent leak enquiries and after-hours fees</a>, or <a href="/services/rental-property-roof-repairs">coordinate a rental property roof assessment</a>.</p>}
        <p className="serviceBookingPrompt">{service.next}</p>
        <a className="button" href={`/contact?service=${encodeURIComponent(service.title)}`}>Request a roof assessment <ArrowRight size={17} /></a>
        </div>
        </div>
      </ServiceTheme>
      <ServiceTheme index={4} serviceSlug={service.slug}>
      <div className="pageFaq serviceThemeFaq">
        {serviceFaqs.map((item, index) => (
          <details key={item.q} open={index === 0} data-intent={SEED_FAQ_INTENTS[item.q]}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
        <ServiceBookingFaq slug={service.slug} />
        <IntentFaqs slug={service.slug} />
      </div>
      </ServiceTheme>
      </div>
    </section>
  );
}
function Areas() {
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const visible = AREA_GROUPS.map(
    ({ district, suburbs }) =>
      [
        district,
        suburbs.filter((s) => s.toLowerCase().includes(query.trim().toLowerCase())),
      ] as const,
  ).filter(([, suburbs]) => suburbs.length > 0 || !query);
  return (
    <section className="page areasPage">
      <div className="pageMediaIntro">
        <div>
          <p className="eyebrow">CANBERRA COVERAGE DIRECTORY</p>
          <h1>Roof repair service areas</h1>
          <p>
            Use this directory to find the area that best matches your address.
            Start with your district to explore roof repair, renovation, cleaning
            and drainage maintenance pathways, then select your suburb when you
            are ready to make an enquiry.
          </p>
        </div>
        <figure className="pageFeatureMedia">
          <ResponsiveImage priority
            src="/assets/areas/canberra-coverage-roofscape.png"
            alt="Canberra residential roofs and suburbs beneath Black Mountain on a cloudy day"
          />
        </figure>
      </div>
      <div className="areaSearch">
      <label className="searchLabel">
        Search suburbs
        <input
          ref={searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a suburb name"
        />
      </label>
      {query && <button type="button" className="areaSearchClear" onClick={() => { setQuery(""); searchInput.current?.focus(); }}>Clear suburb search <X size={16} aria-hidden="true" /></button>}
      </div>
      <LocalGuideLinks />
      <h2>Find your district and suburb</h2>
      {visible.length === 0 && <p role="status">No suburbs match “{query}”. Clear the search or <a href="/contact">send your address to confirm coverage</a>.</p>}
      <div className="areaGrid">
        {visible.map(([district, suburbs]) => (
          <article key={district}>
            <h3><a href={`/areas/${district.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}>{district} roof repair services</a></h3>
            <div>
              {suburbs.map((s) => (
                <div className="areaLocation" key={s}><a
                  href={getSuburbRoute(s, district) ?? "/areas"}
                >
                  {s}
                </a><a className="areaEnquiry" href={`/contact?area=${encodeURIComponent(`${s} — ${district}`)}`}>Enquire for {s} <ArrowRight size={14} aria-hidden="true" /></a></div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function DistrictServiceAreaPage({ profile }: { profile: any; data: Data }) {
  return <section className="page suburbPage districtPage">
    <p className="eyebrow">CANBERRA DISTRICT ROOF SERVICES</p>
    <h1>{profile.h1}</h1>
    <p className="directAnswer">Ellis provides roof repairs, renovation, cleaning and gutter or downpipe maintenance across {profile.district}. Send your suburb and concern to arrange an on-site assessment, the work plan and a written quote.</p>
    <nav className="suburbPageActions districtEntryLinks" aria-label="Roof services and booking"><a className="textAction" href="/services/roof-leak-repairs">Roof Leak Repairs</a><a className="textAction" href="/services/roof-inspections">Roof Inspections</a><a className="textAction" href="/services/roof-cleaning">Roof Cleaning</a><a className="button" href="#local-enquiry">Request a roof assessment <ArrowRight size={17}/></a></nav>
    <section className="districtDirectory"><h2>Choose your {profile.district} enquiry location</h2><p>This directory lists {profile.suburbs.length} location options for {profile.district}. The enquiry link selects that suburb in the contact form; add your full property address and concern so we can arrange access and confirm the visit. We cover the major ACT districts, including Belconnen, Gungahlin and Tuggeranong. For fringe locations, send the full address to confirm arrangements.</p>
      <div className="contentTableScroll" tabIndex={0} role="region" aria-label={`${profile.district} suburb directory`}><table><caption>{profile.district}: suburb information and booking links</caption><thead><tr><th scope="col">Location</th><th scope="col">Suburb information</th><th scope="col">Start an enquiry</th></tr></thead><tbody>{profile.bookingLocations.map((location: { suburb: string; enquiryPath: string }) => <tr key={location.suburb}><th scope="row">{location.suburb}</th><td><a href={getSuburbRoute(location.suburb, profile.district) ?? "/areas"}>{location.suburb} roof services</a></td><td><a href={location.enquiryPath}>Enquire for {location.suburb}</a></td></tr>)}</tbody></table></div>
      <p>Looking for a different location? <a href="/areas">Search the district and suburb directory</a>.</p>
    </section>
    <section className="districtServiceChoices"><h2>Match the concern to a service</h2><ul><li>A stain or drip: <a href="/services/roof-leak-repairs">roof leak investigation and repairs</a>. Include when it appears and the affected room.</li><li>A visible damaged tile or metal detail: compare <a href="/services/tile-roof-repairs">tile roof repairs</a> and <a href="/services/metal-roof-repairs">metal roof repairs</a>; describe the material if known.</li><li>Debris or overflowing drainage: compare <a href="/services/gutter-downpipe-maintenance">gutter clearing and downpipe maintenance</a> with <a href="/services/gutter-repairs">gutter component repairs</a>.</li><li>Unsure of the cause or planning wider work: start with <a href="/services/roof-inspections">a roof inspection</a>, or <a href="/services">view all roof services</a>.</li></ul><p>For two-storey properties or a remote owner, include storeys and the access contact. Confirm any photos and written findings in the inspection scope, and nominate who should receive the agreed records and quote. For urgent enquiries, call <a href="tel:0405878406">0405878406</a>; we confirm appointment timing separately.</p></section>
    <section className="suburbContact" id="local-enquiry" aria-labelledby="local-enquiry-title"><div className="suburbContactIntro"><h2 id="local-enquiry-title">Arrange a roof assessment in {profile.district}</h2><p>Choose your suburb and service below. Include the property address, what you have noticed and the access contact; a photo is optional.</p></div><ContactForm /></section>
  </section>;
}
function SuburbServiceAreaPage({ profile }: { profile: any }) {
  const featured = profile.featuredServiceSlugs.map((slug: string) => SERVICE_CATALOG.find(service => service.slug === slug)!);
  const otherServices = SERVICE_CATALOG.filter(({ slug }) => !profile.featuredServiceSlugs.includes(slug));
  const serviceSummaries: Record<string, string> = {
    "roof-leak-repairs": "For ceiling stains, drips after rain or a recurring leak. We inspect the roof-entry path before planning the repair.",
    "roof-inspections": "For an uncertain roof concern or several affected areas. Confirm the inspection scope, including any photos and written findings, before booking.",
    "roof-cleaning": "For moss, lichen and surface debris. We assess the roof material, condition and suitable cleaning approach.",
  };
  return <section className="page suburbPage">
    <p className="eyebrow">LOCAL ROOF SERVICES</p><h1>{profile.h1}</h1>
    <p className="directAnswer">Ellis Services Group provides roof repairs and maintenance in {profile.suburb}, {profile.district}. Contact us to arrange an on-site assessment; we confirm the appointment, inspect the roof and provide the repair plan and written quote.</p>
    <nav className="suburbPageActions" aria-label="Roof services and booking"><a className="button" href="#local-enquiry">Request a {profile.suburb} roof assessment <ArrowRight size={17}/></a><a className="textAction" href="#local-roof-services">Choose a roof service <ArrowRight size={17}/></a></nav>
    <section className="suburbFeatured" id="local-roof-services"><h2>Choose a roof service in {profile.suburb}</h2><p>Start with the concern you have noticed. You do not need to identify the cause before contacting us.</p><div className="cards">{featured.map((service) => <article className="card" key={service.slug}><h3>{service.title}</h3><p>{serviceSummaries[service.slug]}</p><a href={service.path}>Explore {service.shortLabel} <ArrowRight size={15}/></a></article>)}</div></section>
    <section className="suburbAllServices"><h2>More roof repair and maintenance services in {profile.suburb}</h2><p>For a specific roof material, damaged component, urgent leak or rental property, choose the relevant service below.</p><div>{otherServices.map((service) => <a key={service.path} href={service.path}>{service.title}</a>)}</div></section>
    <section className="suburbEvidence"><h2>Roof assessment and booking arrangements</h2>{profile.historyGuidance && <p>{profile.historyGuidance}</p>}<ul><li>On-site roof assessment of the reported concern and connected details.</li><li>Appointment timing confirmed separately, subject to weather and safe access.</li><li>Repair scope and written quote before work.</li></ul>{profile.historyGuidance && <p><a href={`/areas/${profile.slug.split('/')[0]}`}>{profile.district} roof services</a></p>}</section>
    <section className="suburbFaq"><h2>Before arranging roof work in {profile.suburb}</h2><details open><summary>What should I include in an enquiry?</summary><p>Describe what you can see safely, the weather context, your property access and the relevant roof area. Do not climb onto the roof or touch wet electrical areas.</p></details><details><summary>Can I send a photo?</summary><p>Yes. Safe ground-level photos help us prepare for the assessment; we confirm the recommended scope after reviewing the property.</p></details></section>
    <LocalGuideLinks />
    <section className="suburbContact" id="local-enquiry" aria-labelledby="local-enquiry-title"><div className="suburbContactIntro"><h2 id="local-enquiry-title">Arrange a roof assessment in {profile.suburb}</h2><p>Your suburb is already selected. Choose the service and describe the concern below; include the address and access contact if available. A photo is optional.</p></div><ContactForm defaultArea={profile.areaOption}/></section>
  </section>;
}
function News() {
  return (
    <section className="page newsIndex">
      <header className="newsIndexHeader pairedHero">
        <div className="pairedHeroCopy">
        <p className="eyebrow">ROOF CARE JOURNAL</p>
        <h1>Roof leaks, inspections and maintenance</h1>
        <p>Understand leaks, roof materials and maintenance with practical reading for homeowners, tenants and property managers.</p>
        </div>
        <figure className="pairedHeroMedia"><ResponsiveImage src="/assets/services/roof-inspection-team-review.png" alt="Roof details being reviewed and recorded as context for roof-care questions" priority sizes="(max-width: 1024px) calc(100vw - 3rem), 600px" /><figcaption>Roof condition, materials and the questions behind a repair.</figcaption></figure>
      </header>
      <div className="newsGrid">
        {allNewsArticles().map((article) => (
          <article className="newsCard" key={article.slug}>
            <div className="newsCardImage"><ResponsiveImage src={(newsImages[article.slug] || addedImage(article.slug))!.src} alt={(newsImages[article.slug] || addedImage(article.slug))!.alt} /></div>
            <p className="eyebrow">ROOF CARE GUIDE</p>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <div className="newsCardActions"><a href={`/news/${article.slug}`}>Read article <ArrowRight size={16} /></a></div>
          </article>
        ))}
      </div>
    </section>
  );
}
function NewsArticleView({ article }: { article: NewsArticle }) {
  const modifiedDate = articleModifiedDate(article.slug, article.updated);
  const image = newsImages[article.slug] || addedImage(article.slug);
  const related = article.related.map(slug => newsArticles.find(item => item.slug === slug)!);
  return (
    <article className="page newsArticle">
      <header className="articleHeader pairedHero">
        <div className="pairedHeroCopy">
        <p className="eyebrow">ROOF CARE JOURNAL</p>
        <h1>{article.title}</h1>
        <p className="articleLead">{article.lead}</p>
        <p className="articleByline">By <a href={ARTICLE_AUTHOR.url}>{ARTICLE_AUTHOR.name}</a> · Updated <time dateTime={modifiedDate}>{articleVisibleDate(modifiedDate)}</time></p>
        </div>
        {image ? <figure className="articleLeadImage pairedHeroMedia"><ResponsiveImage src={image.src} alt={image.alt} priority sizes="(max-width: 1024px) calc(100vw - 3rem), 600px" /><figcaption>Illustrative image for this roof-care topic; not a diagnosis of your property.</figcaption></figure> : null}
      </header>
      <div className="articleLayout">
        <nav className="articleContents" aria-label="On this page"><p>In this article</p><ol>{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}</ol></nav>
        <div className="articleBody">
          <ServiceNextStep pagePath={`/news/${article.slug}`} />
          {article.sections.map(section => <section className="articleSection" id={section.id} key={section.id}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
          {["cracked-slipped-missing-roof-tiles-canberra", "after-rain-roof-leak-check-canberra"].includes(article.slug) ? <TileCasePhotos context={article.slug} /> : null}
          {article.sources.length > 0 && <section className="articleSources" aria-label="Sources and scope"><h2>Sources and further detail</h2><p>Manufacturer guidance applies to the relevant product and system. These references support the technical background; the practical questions in this article are general editorial guidance.</p><ul>{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><span> — {source.note}</span></li>)}</ul></section>}
          {related.length > 0 && <section className="articleRelated"><h2>Continue reading</h2><ul>{related.map(item => <li key={item.slug}><a href={`/news/${item.slug}`}>{item.title}</a><p>{item.summary}</p></li>)}</ul></section>}
          <a className="articleBack" href="/news">← All roof care articles</a>
        </div>
      </div>
    </article>
  );
}
function FAQ({ data }: { data: Data }) {
  return (
    <section className="page faqPage">
      <div className="faqIntro">
      <p className="eyebrow">CANBERRA ROOFING FAQ</p>
      <h1>Roof repair questions</h1>
      <p>
        Clear answers to common roof repair, maintenance, cleaning and
        inspection questions, designed to help you prepare the right details for
        an enquiry.
      </p>
      </div>
      <FaqBrowser faqs={data.faqs} />
      <div className="faqSupport">
      <LocalGuideLinks />
      <OperatingHours />
      </div>
      <section className="safetySources">
        <p className="eyebrow">SAFETY GUIDANCE</p>
        <p>
          Roof work carries fall and weather risks. Observe from the ground and
          use qualified help for work at height. For an immediate threat to life
          call <strong>000</strong>. For ACT storm or flood emergency
          assistance, contact <strong>ACTSES on 132 500</strong>; this is not a
          company contact number.
        </p>
      </section>
    </section>
  );
}
function Contact({
  data,
  save: _save,
}: {
  data: Data;
  save?: (x: Partial<Data>) => void;
}) {
  const [prefill, setPrefill] = useState({ area: "", service: "" });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPrefill({
      area: params.get("area") || "",
      service: params.get("service") || "",
    });
  }, []);
  return (
    <section className="contact page">
      <div className="contactIntro">
        <p className="eyebrow">CONTACT</p>
        <h1>Arrange a roof assessment</h1>
        <p>Call, email or use the form to arrange an on-site roof assessment. We confirm the appointment, inspect the affected roof and drainage, then provide the repair plan and written quote. You can request an assessment without a photo.</p>
      </div>
      <div className="contactWorkspace">
          <figure className="pageFeatureMedia contactFeatureMedia">
            <ResponsiveImage priority
              src="/assets/contact/service-arrival-consultation.png"
              alt="People discussing a roof enquiry beside a branded van"
              sizes="(max-width: 900px) calc(100vw - 3rem), 560px"
            />
          </figure>
        <ContactForm
          defaultArea={prefill.area}
          defaultService={prefill.service}
        />
          <aside className="contactSideDetails">
            <p className="contactMethods"><a href={`tel:${data.phone}`}>{data.phone}</a><a href={`mailto:${data.email}`}>{data.email}</a></p>
            <address className="businessAddress">{data.address}</address>
            <OperatingHours />
            <section className="contactEnquiryNotes">
              <h2>Enquiry preparation</h2>
              <ul>
                <li>Include your suburb, affected room or roof area, when the issue began and the weather. Add known roof materials, previous repairs, storeys and the access contact.</li>
                <li>Photos are optional. Take them only from safe indoor or ground-level positions; do not climb onto the roof.</li>
                <li>Before booking, confirm inspection fees, access and the findings to be provided. Agree the written repair scope, materials, exclusions and price before work starts.</li>
              </ul>
              <nav className="contactGuideLinks" aria-label="Enquiry guides">
                <a href="/news/when-to-arrange-roof-inspection-canberra">Inspection and quote guide</a>
                <a href="/services/rental-property-roof-repairs">Owner and manager access</a>
                <a href="/news/roof-leak-information-for-tenants-canberra">Tenant reporting guide</a>
              </nav>
            </section>
          </aside>
      </div>
    </section>
  );
}
function Privacy() {
  return (
    <section className="page privacyPage">
      <header className="privacyHeader">
        <p className="eyebrow">PRIVACY POLICY</p>
        <h1>How Ellis Services Group handles enquiry information</h1>
        <p>
          Ellis Services uses the information you provide to respond to roof
          repair enquiries in Canberra and to help you take the next step with
          confidence.
        </p>
      </header>
      <div className="privacyLayout">
        <div className="privacyBody">
          <section>
            <h2>Information you share with us</h2>
            <p>
              When you use our contact form, you choose what information to
              provide. This may include your contact details, suburb or area,
              service interest, message and an optional photo.
            </p>
            <p>
              We use these details only to understand your roof concern, respond
              to your enquiry and discuss relevant services. Your form details
              are sent to the Ellis Services enquiry inboxes identified in the
              form consent statement.
            </p>
          </section>
          <section>
            <h2>How we protect your information</h2>
            <p>
              We treat enquiry information as private and use it only for the
              purposes described above. We do not send your form answers, name,
              email address, telephone number, street address or photo to Google
              Analytics.
            </p>
          </section>
          <section>
            <h2>Website cookies</h2>
            <p>
              Like many websites, Ellis Services Group uses anonymous website
              statistics to help us improve pages and make it easier for
              visitors to find the right information. You can manage or delete
              cookies through your browser settings. This will not prevent you
              from contacting us by phone or email.
            </p>
          </section>
          <section>
            <h2>Contact us about privacy</h2>
            <p>
              If you have a question about how we use enquiry information, email{" "}
              <a href="mailto:elliservices.group@gmail.com">
                elliservices.group@gmail.com
              </a>{" "}
              or call <a href="tel:0405878406">0405878406</a>.
            </p>
          </section>
        </div>
        <aside className="privacySidebar">
          <p className="eyebrow">CANBERRA ENQUIRIES</p>
          <h2>Need help with a roof concern?</h2>
          <p>
            Use the enquiry form to tell us what you have noticed and select the
            service pathway that best fits.
          </p>
          <a className="button" href="/contact">
            Contact us <ArrowRight size={17} />
          </a>
        </aside>
      </div>
    </section>
  );
}
function Admin({
  data,
  save,
  close,
}: {
  data: Data;
  save: (x: Partial<Data>) => void;
  close: () => void;
}) {
  return (
    <div
      className="drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Local admin"
    >
      <div className="drawerHead">
        <div>
          <p className="eyebrow">LOCAL ADMIN</p>
          <h2>Content settings</h2>
        </div>
        <button onClick={close} aria-label="Close admin">
          <X />
        </button>
      </div>
      <div className="adminForm">
        <p>Local preview only. Public identity and business copy are source-managed and cannot be edited here.</p>
        <label>
          Company name
          <input
            value={data.company}
            readOnly
          />
        </label>
        <label>
          Hero message
          <textarea
            className="resize-none"
            value={data.tagline}
            readOnly
          />
        </label>
        <label>
          Phone
          <input
            value={data.phone}
            readOnly
          />
        </label>
        <label>
          Email
          <input
            value={data.email}
            readOnly
          />
        </label>
      </div>
    </div>
  );
}
function LayoutV2({
  data,
  openAdmin,
  children,
  pathname,
}: {
  data: Data;
  openAdmin: () => void;
  children: React.ReactNode;
  pathname: string;
}) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const servicesTrigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const mobileClose = useRef<HTMLButtonElement>(null);
  const mobileNavigation = useRef<HTMLElement>(null);
  const menuBox = useRef<HTMLDivElement>(null);
  const closeServices = (restore = false) => {
    setServicesOpen(false);
    if (restore) requestAnimationFrame(() => servicesTrigger.current?.focus());
  };
  const closeMobile = (restore = false) => {
    setMobileOpen(false);
    setServicesOpen(false);
    if (restore) requestAnimationFrame(() => mobileTrigger.current?.focus());
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Tab" && mobileOpen) {
        const controls = Array.from(mobileNavigation.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
          .filter((control) => control.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
        return;
      }
      if (event.key !== "Escape") return;
      if (servicesOpen) {
        event.preventDefault();
        closeServices(true);
      } else if (mobileOpen) {
        event.preventDefault();
        closeMobile(true);
      }
    };
    const outside = (event: MouseEvent) => {
      if (
        servicesOpen &&
        menuBox.current &&
        !menuBox.current.contains(event.target as Node)
      )
        closeServices();
    };
    window.addEventListener("keydown", key);
    window.addEventListener("mousedown", outside);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("mousedown", outside);
    };
  }, [servicesOpen, mobileOpen]);
  useEffect(() => {
    if (!mobileOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => mobileClose.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen]);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const breakpoint = window.matchMedia("(max-width: 1180px)");
    const reset = () => {
      const restore = mobileNavigation.current?.contains(document.activeElement) || document.activeElement === mobileTrigger.current;
      setMobileOpen(false);
      setServicesOpen(false);
      if (restore) requestAnimationFrame(() => (breakpoint.matches ? mobileTrigger.current : servicesTrigger.current)?.focus());
    };
    breakpoint.addEventListener("change", reset);
    return () => breakpoint.removeEventListener("change", reset);
  }, []);
  return (
    <>
      <header className="siteHeader">
        <div className="headerInner">
          <a className="brand" href="/" inert={mobileOpen}>
            <ResponsiveImage sizes="100px" loading="eager"
              className="brandLogo"
              src="/assets/brand/canberraroofkind-logo.png"
              alt="Ellis Services Group logo"
              width={1254}
              height={1254}
            />
            <span className="brandCopy">
              <strong>{data.company}</strong>
              <span>Canberra roof repairs</span>
            </span>
          </a>
          <button
            ref={mobileTrigger}
            className="mobileToggle"
            aria-label="Open main menu"
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
            inert={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            Menu
          </button>
          <nav
            ref={mobileNavigation}
            id="primary-navigation"
            className={mobileOpen ? "primaryNav isOpen" : "primaryNav"}
            aria-label="Primary navigation"
          >
            <button
              ref={mobileClose}
              className="mobileClose"
              aria-label="Close main menu"
              onClick={() => closeMobile(true)}
            >
              Close
            </button>
            {nav.map(([name, path]) =>
              name === "Services" ? (
                <div className="servicesMenu" ref={menuBox} key={path}>
                  <button
                    ref={servicesTrigger}
                    className={`servicesToggle ${pathname.startsWith("/services") ? "current" : ""}`}
                    aria-expanded={servicesOpen}
                    aria-controls="services-menu"
                    onClick={() => setServicesOpen((v) => !v)}
                  >
                    Services <span aria-hidden="true">⌄</span>
                  </button>
                  {servicesOpen && (
                    <div id="services-menu" className="servicesPopup">
                      <a href="/services">
                        <strong>Services overview</strong>
                        <small>Compare roof repair and maintenance services</small>
                      </a>
                      {data.services.map((service) => (
                        <a
                          href={`/services/${service.slug}`}
                          key={service.slug}
                        >
                          <strong>{service.title}</strong>
                          <small>{service.symptoms}</small>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={path}
                  href={path}
                  className={pathname === path ? "current" : ""}
                >
                  {name}
                </a>
              ),
            )}
          </nav>
          <div className="headerActions" inert={mobileOpen}>
            <a className="languageSwitch" data-no-translate="true" href={languagePath(pathname, currentLanguage() === 'zh' ? 'en' : 'zh')} aria-label={currentLanguage() === 'zh' ? 'Switch to English' : '切换到中文'}>{currentLanguage() === 'zh' ? 'EN' : '中文'}</a>
            <a className="phoneAction" href={`tel:${data.phone}`}>
              {data.phone}
            </a>
            <a className="contactTop" href="/contact">
              Contact us
            </a>
          </div>
        </div>
      </header>
      {mobileOpen && (
        <button
          className="navBackdrop"
          tabIndex={-1}
          aria-label="Close main menu"
          onClick={() => closeMobile(true)}
        />
      )}
      <main inert={mobileOpen}>{children}</main>
      <footer inert={mobileOpen}>
        <div>
          <strong>{data.company}</strong>
          <span>{data.address}</span>
          <span>Roof repairs and inspections across Canberra</span>
        </div>
        <div className="footerContact">
          <strong>Contact details</strong>
          <span>{BOOKING_POLICY.hours}, {BOOKING_POLICY.days}</span>
          <span>After-hours urgent-service fees are determined in the on-site quote.</span>
          <a href={`tel:${data.phone}`}>{data.phone}</a>
          <a href={`mailto:${data.email}`}>{data.email}</a>
          <a href="/contact">Contact page →</a>
          <a href="/privacy">PRIVACY POLICY</a>
        </div>
        <div className="footerSocial">
          <strong>Follow Ellis Services Group</strong>
          <nav className="footerSocialLinks" aria-label="Social media and Google reviews">
            {[
              { label: "Google Reviews", href: "https://share.google/y50AZRJwjOdVOlj5o", icon: "/assets/brand/google.svg" },
              { label: "Instagram", href: "https://www.instagram.com/elliservices_group/", icon: "/assets/brand/instagram-gradient.png" },
              { label: "LinkedIn", href: "https://share.google/Z4tImXHToPi9H4LmH", icon: "/assets/brand/linkedin.svg" },
              { label: "Facebook", href: "https://www.facebook.com/p/Ellis-Services-Group-100082926022259/", icon: "/assets/brand/facebook.svg" },
            ].map(({ label, href, icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} — Ellis Services Group (opens in a new tab)`}>
                <ResponsiveImage src={icon} alt="" width={24} height={24} sizes="24px" />
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}

function AdminDrawer({
  data,
  save,
  close,
}: {
  data: Data;
  save: (x: Partial<Data>) => void;
  close: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [faqDraft, setFaqDraft] = useState(JSON.stringify(data.faqs, null, 2));
  const [status, setStatus] = useState("");
  useEffect(() => {
    closeButton.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "Tab" && panel.current) {
        const focusables = Array.from(
          panel.current.querySelectorAll<HTMLElement>(
            "button,input,textarea,a[href]",
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (!focusables.length) return;
        const first = focusables[0],
          last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [close]);
  const applyFaqs = () => {
    try {
      const parsed = JSON.parse(faqDraft);
      if (
        !Array.isArray(parsed) ||
        !parsed.every((x) => typeof x.q === "string" && typeof x.a === "string")
      )
        throw new Error();
      save({ faqs: parsed });
      setStatus("FAQ saved locally.");
    } catch {
      setStatus("Use a JSON array with q and a text fields.");
    }
  };
  return (
    <div className="adminLayer">
      <button
        className="adminBackdrop"
        aria-label="Close admin"
        onClick={close}
      />
      <div
        ref={panel}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-title"
      >
        <div className="drawerHead">
          <div>
            <p className="eyebrow">LOCAL ADMIN</p>
            <h2 id="admin-title">Content settings</h2>
          </div>
          <button ref={closeButton} onClick={close} aria-label="Close admin">
            <X />
          </button>
        </div>
        <div className="adminForm">
          <label>
            Company name
            <input
              value={data.company}
              readOnly
            />
          </label>
          <label>
            Phone
            <input
              value={data.phone}
              readOnly
            />
          </label>
          <label>
            Email
            <input
              value={data.email}
              readOnly
            />
          </label>
          <label>
            News headline
            <input
              value={data.newsTitle}
              readOnly
            />
          </label>
          <label>
            News copy
            <textarea
              className="resize-none"
              value={data.newsCopy}
              readOnly
            />
          </label>
          <h3>FAQ editor</h3>
          <label>
            FAQ JSON
            <textarea
              className="faqEditor resize-none"
              value={faqDraft}
              onChange={(e) => setFaqDraft(e.target.value)}
            />
          </label>
          <button type="button" className="adminSave" onClick={applyFaqs}>
            Save FAQ locally
          </button>
          <div className="statusLine" aria-live="polite">
            {status}
          </div>
          <p className="warning">
            Public business details, news copy and service content are managed in source; these fields are read-only in this local preview.
          </p>
        </div>
      </div>
    </div>
  );
}

function CaseStudyView({ study }: { study: CaseStudy }) {
  return (
    <article className="page caseStudy">
      <header className="caseStudyHeader pairedHero">
        <div className="pairedHeroCopy">
        <p className="eyebrow">TILE ROOF REPAIR PHOTOS</p>

        <h1>{study.title}</h1>
        <p className="articleLead">
          Follow the visible tile roof repair from start to finish: displaced
          tiles before repair, preparation of the affected area and the roof
          covering reinstated after the work.
        </p>
        </div>
        <figure className="pairedHeroMedia"><ResponsiveImage src={study.images[2].src} alt={study.images[2].alt} priority sizes="(max-width: 1024px) calc(100vw - 3rem), 600px" /><figcaption>{study.images[2].caption}</figcaption></figure>
      </header>
      <ServiceNextStep pagePath={`/case-studies/${study.slug}`} />
      <section className="caseEvidence" aria-labelledby="case-evidence-title">
        <div className="caseEvidenceIntro">
          <p className="eyebrow">TILE WORK SEQUENCE</p>
          <h2 id="case-evidence-title">Tile condition and the repair sequence</h2>
          <p>
            The photos show visible displaced and missing tiles,
            tiles lifted in the local work area, and the visible roof covering
            reinstated once work was complete.
          </p>
        </div>
        <div className="caseEvidenceGrid">
          {study.images.map((image, index) => (
            <figure key={image.src}>
              <span>{["Before", "During", "After"][index]}</span>
              <ResponsiveImage
                src={image.src}
                alt={image.alt}
              />
              <figcaption>{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="caseStudyDetail">
        <div>
          <p className="eyebrow">WHAT THE PHOTOS SHOW</p>
          <h2>What the tile repair photos show</h2>
          <p>
            Before repair, tiles were displaced or missing in the affected roof
            area. During the work, tiles were lifted to provide access to that
            area. The final photo shows the roof covering reinstated. These
            photos follow the repair through its three stages.
          </p>
          <p>For your own roof, the extent of tile damage, condition of adjoining materials and availability of suitable replacement tiles determine the proposed scope. Use the <a href="/news/when-to-arrange-roof-inspection-canberra">inspection and quote checklist</a> to prepare your questions about materials, access and the roof areas included.</p>
        </div>
        <aside>
          <p className="eyebrow">CASE CONTEXT</p>
          <dl>
            <div>
              <dt>Service pathway</dt>
              <dd>Tile Roof Repairs</dd>
            </div>
            <div>
              <dt>Property details</dt>
              <dd>Location and customer details are not published with this photo sequence.</dd>
            </div>
            <div>
              <dt>Project photos</dt>
              <dd>Before, during and after repair</dd>
            </div>
            <div>
              <dt>Evidence scope</dt>
              <dd>Visible tile condition and work stages; no measured customer outcome is established by these photos.</dd>
            </div>
          </dl>
        </aside>
      </section>
      <section className="caseStudyNext">
        <div>
          <p className="eyebrow">RELATED PATHWAYS</p>
          <h2>Arrange an assessment of damaged roof tiles</h2>
          <p>
            If you have spotted cracked, slipped or missing tiles, record the
            general roof area from a safe position. Use a roof inspection
            pathway when the closest repair category is unclear.
          </p>
        </div>
        <div className="caseStudyActions">
          <a className="button" href={study.servicePath}>
            Explore Tile Roof Repairs <ArrowRight size={17} />
          </a>
          <a className="textAction" href="/services/roof-inspections">
            Explore Roof Inspections
          </a>
          <a className="textAction" href={study.guidePath}>
            Read the tile roof guide
          </a>
          <a
            className="textAction"
            href="/contact?service=Tile%20Roof%20Repairs"
          >
            Describe a tile concern
          </a>
        </div>
      </section>
    </article>
  );
}
function NotFound() {
  return (
    <section className="page prose">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you requested could not be found.</p>
      <a className="button" href="/">
        Return home
      </a>{" "}
      <a className="textAction" href="/services">
        Browse services
      </a>{" "}
      <a className="textAction" href="/contact">
        Contact us
      </a>
    </section>
  );
}

export function AppV3({ pathname = "/" }: { pathname?: string }) {
  configureLocale(pathname, typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('edit'));
  const [data, setData] = useState<Data>(() => ({
    ...defaults,
    faqs: canonicalFaqs,
  }));
  const [admin, setAdmin] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (import.meta.env.DEV) setData(load());
  }, []);
  useEffect(() => {
    if (import.meta.env.DEV) {
      try {
        localStorage.setItem(store, JSON.stringify(data));
      } catch {
        /* Storage can be disabled in private browsing. */
      }
    }
  }, [data]);
  const save = (patch: Partial<Data>) =>
    setData((current) => ({
      ...current,
      ...patch,
      schemaVersion: 7,
      services: serviceSeed,
    }));
  const openAdmin = () => {
    if (!import.meta.env.DEV) return;
    returnFocus.current = document.activeElement as HTMLElement;
    setAdmin(true);
  };
  const closeAdmin = () => {
    setAdmin(false);
    requestAnimationFrame(() => returnFocus.current?.focus());
  };
  const path = resolvePath(basePath(pathname));
  let content: React.ReactNode;
  if (!Object.hasOwn(publishedRoutes, path) && !addedArticle(path)) content = <NotFound />;
  else if (path === "/") content = <HomeV2 data={data} />;
  else if (path === "/about") content = <About data={data} />;
  else if (path === "/services") content = <Services data={data} />;
  else if (path === "/areas") content = <Areas />;
  else if (path.startsWith("/areas/")) {
    const districtProfile = getDistrictProfile(path);
    const suburbProfile = getSuburbProfile(path);
    content = districtProfile ? <DistrictServiceAreaPage profile={districtProfile} data={data} /> : suburbProfile ? <SuburbServiceAreaPage profile={suburbProfile} /> : <NotFound />;
  }
  else if (path === "/news") content = <News />;
  else if (path === "/faq") content = <FAQ data={data} />;
  else if (path === "/contact") content = <Contact data={data} />;
  else if (path === "/privacy") content = <Privacy />;
  else if (path.startsWith("/case-studies/")) {
    const study = caseStudies.find(
      (item) => path === "/case-studies/" + item.slug,
    );
    content = study ? <CaseStudyView study={study} /> : <NotFound />;
  } else if (path.startsWith("/news/")) {
    const article = allNewsArticles().find((item) => path === "/news/" + item.slug);
    content = article ? <NewsArticleView article={article} /> : <NotFound />;
  } else if (path.startsWith("/services/")) {
    const service = data.services.find(
      (item) => path === "/services/" + item.slug,
    );
    content = service ? <ServiceView service={service} /> : <NotFound />;
  } else content = <NotFound />;
  return (
    <>
      <HeadManager pathname={pathname.startsWith('/zh') ? '/zh' + (path === '/' ? '/' : path) : path} />
      <LayoutV2 data={data} openAdmin={openAdmin} pathname={path}>
        <Breadcrumbs pathname={languagePath(path,currentLanguage())} />
        {content}
      </LayoutV2>
      {import.meta.env.DEV && admin && (
        <AdminDrawer data={data} save={save} close={closeAdmin} />
      )}
    </>
  );
}
