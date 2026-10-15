// Business hours and supported booking arrangements confirmed by the owner on 12 October 2026.
export const BOOKING_POLICY = {
  hours: '9:00 am–9:00 pm',
  days: 'seven days a week',
  afterHours: 'Outside these hours, an additional urgent-service fee applies. The fee is determined in the on-site quote.',
};
// Editorial identifiers are explicit: no question normalisation or similarity matching.
export const INTENT_IDS = {
  '5-01': 'leak.heavy-rain-pattern', '5-02': 'leak.wind-driven-pattern',
  '5-03': 'leak.stain-vs-entry', '5-04': 'leak.moisture-source',
  '5-05': 'inspection.agreed-scope', '5-06': 'inspection.first-visit-repair',
  '5-07': 'ridge.bedding-vs-pointing', '5-08': 'chimney.flashing-function',
  '5-09': 'tile.local-replacement', '5-10': 'tile.repair-or-replace',
  '5-11': 'renovation.scope-choice', '5-12': 'leak.coating-limit',
  '5-13': 'leak.recurring-after-repair', '5-14': 'quote.scope-comparison',
  '5-15': 'quote.approval-checklist', '5-16': 'repair.performance-factors',
  '5-17': 'enquiry.safe-observations', '5-18': 'inspection.weather-and-height',
  '5-20': 'rental.access-and-approval', 'metal-fixings': 'metal.component-investigation',
  'cleaning-materials': 'cleaning.material-method', 'gutter-choice': 'gutter.clear-vs-repair',
};
const topic = (id, slug, group, heading, body, question, answer, path, label) => ({ id, intent: INTENT_IDS[id], slug, group, heading, body, question, answer, links: path ? [{ path, label }] : [] });
export const INTENT_TOPICS = [
  topic('5-01', 'roof-leak-repairs', 'Roof leaks', 'A roof that only leaks in heavy rain',
    'An intermittent roof leak needs the rainfall pattern recorded alongside the affected room. Tell us whether light rain leaves the room dry, how long a downpour lasts before a drip appears and whether a gutter also overflows. Ellis checks the connected roof and drainage rather than treating heavy rain as proof of a single failed part.',
    'Why does my roof only leak in heavy rain?', 'Heavy rainfall can expose roof junction or drainage concerns that are not apparent in lighter rain. Record the affected room, whether light rain leaves it dry, how long a downpour lasts before a drip starts, how long it continues and whether a gutter overflows. Include previous work at that location. Ellis checks the connected roof and water path before selecting a repair; heavy rain alone does not identify a failed part.', '/news/gutters-overflowing-heavy-rain-canberra', 'Heavy-rain gutter overflow and the assessment'),
  topic('5-02', 'roof-leak-repairs', 'Roof leaks', 'Wind-driven rain and one-sided leaks',
    'If rain from one direction brings water inside, record the affected side of the house and the weather conditions. Flashing, roof coverings and adjoining details need to be assessed together. A wind-driven rain pattern is useful investigation evidence; it does not identify a specific repair from the description alone.',
    'Why does the roof leak when rain comes from one direction?', 'Wind and rain direction help identify which roof edges and junctions to investigate. Record the room, timing, weather and affected side of the property. We assess flashing, roof coverings and adjoining details together before recommending a repair; a one-sided rain pattern does not identify a failed component by itself.', '/news/after-rain-roof-leak-check-canberra', 'Record the rain pattern before the visit'),
  topic('5-03', 'roof-leak-repairs', 'Roof leaks', 'A ceiling stain can be away from the water entry',
    'A brown ceiling stain after rain is a useful place to begin recording the problem, not an exact map of the roof defect. Water can move along connected roof or ceiling elements before becoming visible. Ellis relates the indoor mark to accessible roof details, weather history and previous repairs when investigating the source.',
    'Can water enter away from the ceiling stain?', 'Yes. Water can move beneath roof coverings, along framing or across a ceiling before it becomes visible indoors, so a brown ceiling stain may be away from the entry point. Record its location, the weather pattern, changes over time and previous repairs. Ellis relates those observations to accessible roof details and the water path; the visible mark is a clue rather than an exact map of the defect.', '/news/after-rain-roof-leak-check-canberra', 'Prepare notes about ceiling water marks'),
  topic('5-04', 'roof-leak-repairs', 'Roof leaks', 'Winter dampness without rain needs a broader assessment',
    'If a ceiling is damp in winter or during dry weather, include that pattern rather than assume the roof is leaking. Condensation involves moisture meeting a cold surface, while roof water entry and plumbing can need different investigations. Record rainfall, room use and when the mark changes so the enquiry follows the evidence.',
    'How can I tell a roof leak from condensation?', 'Rain timing and dry-weather moisture are clues, not a diagnosis. Condensation forms when moisture meets a cold surface; roof water entry and plumbing can need different investigations. Record rainfall, winter or dry-weather dampness, room use and when the mark changes so the appropriate assessment follows the evidence.', '/news/roof-leak-vs-condensation-canberra', 'Roof leaks versus condensation'),
  topic('5-05', 'roof-inspections', 'Inspections', 'Roof inspection scope, photos and written findings',
    'Before booking, agree the inspection purpose, roof areas, safe access, any fee and whether photos or written findings are included. The record connects the reported symptom with the accessible details inspected, explains recommended work and identifies areas that need further access or investigation.',
    'What does a roof inspection include?', 'Agree the inspection purpose, roof areas, safe access and any fee before booking. We agree any roof-space access, photographs or written notes before booking, so you know exactly what the visit includes. We assess the relevant accessible roof details and relate the reported symptom to what was inspected. The findings explain recommended work, inaccessible areas and any further access or investigation needed; a later repair quote is a separate decision.', '/news/when-to-arrange-roof-inspection-canberra', 'Roof inspection preparation and findings'),
  topic('5-06', 'roof-inspections', 'Inspections', 'Inspection and first-visit repairs are different decisions',
    'A first visit establishes the repair scope; it is not automatically approval for every repair. Materials, access, weather, the findings and your authorisation determine what can proceed. Ask about the visit and repair arrangements when booking, especially if an active leak needs an urgent assessment.',
    'Can a small roof leak be repaired during the first visit?', 'Tell us you want to discuss a first-visit repair when booking. A first visit does not automatically authorise repairs. Whether work can proceed depends on the findings, suitable materials, safe access, weather, scheduling and your approval of the scope and price.', '/services/emergency-roof-repairs', 'Discuss an urgent roof leak assessment'),
  topic('5-07', 'rebedding-repointing', 'Ridges', 'Ridge capping, bedding and pointing in plain English',
    'Ridge caps cover the top and hip lines where roof planes meet. Bedding supports the caps beneath them; pointing forms the exposed finish at the joints. Falling mortar, a crack or a loose-looking cap needs those connected layers checked. Repointing cannot compensate for supporting bedding that requires repair.',
    'What is the difference between roof rebedding and repointing?', 'Ridge and hip caps cover the lines where roof planes meet. Bedding is the supporting material beneath the caps; rebedding repairs that support and may involve lifting and resetting affected caps. Pointing is the exposed finish at their edges; repointing renews those joints. We check both layers, cap stability and adjoining tiles, then identify the ridge or hip sections requiring each operation. Repointing cannot remedy failed supporting bedding, and a crack or falling mortar does not mean both operations are needed across the whole roof.', '/news/rebedding-vs-repointing-canberra-roofs', 'Rebedding and repointing explained'),
  topic('5-08', 'chimney-flashing-repairs', 'Chimneys', 'What chimney flashing does at the roof junction',
    'Flashing manages the roof-to-chimney junction where different materials meet. A water mark near the chimney, an old patch or weathered sealant helps identify the area to inspect. Ellis considers the junction and surrounding roofing together. Chimney roof-junction repairs are a different scope from chimney structure or flue work.',
    'What does roof flashing do, and how is a problem checked?', 'Flashing manages water where chimney brickwork meets the roof covering. The appropriate material or scope depends on the site and applicable requirements. We check the flashing, adjoining tiles or roofing, mortar, sealant and old patches together with the reported water path. Include wind-driven rain and whether a nearby water mark has returned after earlier work. A stain near the chimney or cracked sealant alone does not prove flashing is the cause; signs extending beyond the junction need the connected roof checked too. Chimney structure and flue work are separate scopes from the roof junction repair.', '/news/chimney-flashing-water-entry-signs', 'Water signs near a chimney'),
  topic('5-09', 'tile-roof-repairs', 'Tiles', 'One or two damaged tiles can be a small repair enquiry',
    'You do not need to request a whole new roof because only a few tiles look broken. Ellis assesses small tile repair jobs, checking the affected position, neighbouring rows, ridge details and available tile profiles. Tell us whether the change followed a storm and whether there are water signs indoors; the adjoining condition helps define the repair.',
    'Can just one or two broken roof tiles be replaced?', 'Yes, where suitable replacement profiles are available and the surrounding roof supports a local repair. We check neighbouring tile rows, ridge, valley and flashing details, rather than only count broken pieces. Terracotta or concrete material, finish and availability affect the match; colour and weathering can differ from older tiles. Tell us if the damage followed a storm or there are water signs indoors. The quote identifies the tiles, materials, adjoining repairs, safe access and price; confirm any inspection or booking fee before the visit. A few damaged tiles do not automatically require a whole-roof renovation. Do not climb onto the roof or move tiles to investigate.', '/news/cracked-slipped-missing-roof-tiles-canberra', 'A few cracked, slipped or missing tiles'),
  topic('5-10', 'tile-roof-repairs', 'Tiles', 'Cracked tiles: repairability and replacement matching',
    'The choice is based on the tile material, damage and available replacement profile, not a promise that every crack can be patched. Include any known terracotta or concrete tile details and previous work. We check the existing roof and explain suitable replacements; older colour and weathering can differ even when the profile matches.',
    'Should a cracked roof tile be repaired or replaced?', 'Terracotta or concrete material, damage, adjoining condition and replacement profile availability determine the recommendation; every crack cannot be assumed suitable for patching. Include previous work and any known tile details. We assess the existing roof and explain the repair or replacement scope, including available matching materials and possible colour or weathering differences. Do not climb onto the roof to test a tile or apply a patch.', '/services/roof-inspections', 'Arrange an assessment of the existing roof'),
  topic('5-11', 'roof-renovation', 'Renovation', 'Repair, restoration and replacement have different scopes',
    'A repair addresses defined defects. Restoration or renovation can combine agreed repairs, preparation, cleaning and finish work across a wider area. Replacement renews the roof covering and needs a different scope. Start with the existing condition and your goal, then compare the work included instead of choosing by a package name alone.',
    'How do roof repair, restoration and replacement differ?', 'Repair targets defined defects. Restoration or renovation can combine agreed repairs, preparation, cleaning and finishes across a wider area. Replacement renews the roof covering and needs a separate scope. Compare the existing condition, previous repairs and your property goals, then ask which areas, materials and work are included and what concerns would remain. A surface refresh is not the answer to an unresolved leak; the assessment and written quote distinguish the work rather than assume every roof needs replacement.', '/news/roof-repair-vs-restoration-vs-replacement-canberra', 'Compare roof work by scope'),
  topic('5-12', 'roof-leak-repairs', 'Roof leaks', 'A roof still leaking after painting needs its water path checked',
    'Painting or coating changes a surface; it does not establish where water is entering. If a painted roof still leaks, provide the date of the work and describe whether the same room or a different area is affected. Ellis investigates the current roof concern and separates component repairs from any appearance or coating work.',
    'Will painting or coating a roof fix a leak?', 'Painting or coating changes the surface; it does not establish the water-entry path or replace damaged-component and junction checks. If water entry continues, provide the date of the finish work and whether the same room or a different area is affected. Ellis investigates the current concern and recommends component repairs separately from appearance or coating work.', '/news/roof-repair-vs-restoration-vs-replacement-canberra', 'Repair and surface finish are different goals'),
  topic('5-13', 'roof-leak-repairs', 'Roof leaks', 'Recurring leaks after sealant or previous patching',
    'A leak that returns after patching needs the current condition and earlier repair history considered together. Tell us what was done, when it was done and which rain conditions now trigger the symptom. We assess the connected materials and water path rather than add the same remedy without reviewing the problem.',
    'Is adding sealant enough to fix a recurring roof leak?', 'Sealant may form part of a suitable repair, but a returning leak needs the material, junction, connected details and water-entry path reassessed. Record what was done, when, the room where symptoms returned and whether the rain conditions are the same or different. A temporary measure can limit symptoms but is a different scope from a lasting component repair. Ellis reviews the history and current condition before confirming a new repair plan and written quote, rather than assuming another layer of sealant is the answer.', '/news/roof-repair-cost-canberra', 'Compare an investigated repair scope'),
  topic('5-14', 'roof-leak-repairs', 'Costs', 'Compare roof repair costs against the same work',
    'Roof repair quotes can differ because they cover different roof areas, preparation, materials and access. Separate the inspection appointment from the proposed repair and identify any further investigation. For an urgent booking outside normal hours, the additional fee is determined in the on-site quote; it is not a fixed amount inferred from the symptom.',
    'How much does roof repair cost in Canberra?', 'Compare the roof areas, components, preparation, materials, safe access and exclusions included in each quote, alongside the condition, weather and any further investigation. A local repair and wider maintenance are different scopes. Before arranging a visit, we explain any inspection or booking fee that applies; repair pricing follows assessment and is agreed before work begins. Outside normal working hours an additional urgent-service fee applies, determined in the on-site quote.', '/news/roof-repair-cost-canberra', 'Roof repair cost factors'),
  topic('5-15', 'roof-inspections', 'Costs', 'Read the written quote before authorising repairs',
    'A useful quote names the work, roof area, materials, access arrangements and exclusions. Ask about preparation, removal of waste, tax treatment, payment arrangements and completion checks rather than assume each item is included. Keep any proposed additional investigation with the scope you approve.',
    'What should I look for in a written roof repair quote?', 'Check the findings, named roof areas and components, preparation, materials, access, exclusions and total price. Ask about waste removal, tax treatment, payment arrangements, completion checks and any proposed further investigation rather than assume each item is included. Keep those details with the scope you approve before repairs begin.', '/news/roof-repair-cost-canberra', 'Compare itemised repair quotations'),
  topic('5-16', 'home', 'Getting started', 'Choose a defined repair, not a blanket lifespan promise',
    'The performance of a roof repair depends on the existing material, connected roof condition, preparation and ongoing maintenance. Ellis explains what the proposed repair addresses and the work agreed in the written quote. Keep the findings and repair record for future maintenance.',
    'What affects how long a roof repair lasts?', 'The materials, adjoining roof condition, preparation, exposure and ongoing maintenance all matter. Ask what the proposed work addresses in the written quote rather than compare all repairs using one lifespan. Keep the findings and repair record for future maintenance.', '/services', 'Compare roof repair services'),
  topic('5-17', 'contact', 'Getting started', 'Useful photos and enquiry details, without roof access',
    'Include your suburb, affected room, when the issue began and whether it follows heavy rain, wind or dry weather. Ground-level photographs of visible changes and safe indoor images are useful, but optional. Add the number of storeys, access contact and previous repair details; do not climb onto the roof to gather information.',
    'Which photos and details help with a roof repair enquiry?', 'Include the suburb, affected room or roof area, when the issue began, whether it follows heavy rain, wind or dry weather, previous repairs and the closest service topic if known. Add roof material if known, storeys and the access contact. Safe indoor or ground-level images are optional; do not climb onto the roof to gather information. A written description is enough to request the visit, and you should include only details you are comfortable sending.', '/news/when-to-arrange-roof-inspection-canberra', 'Prepare for the inspection and quote'),
  topic('5-18', 'roof-inspections', 'Inspections', 'Rain, roof height and safe inspection access',
    'Ellis supports inspections on two-storey homes. Include the number of storeys, access restrictions and any roof-space arrangements when booking. Weather and safe access determine which areas can be inspected and when roof work can proceed. A wet roof or active storm can change the appointment and the accessible scope.',
    'Can a roof be inspected or repaired while it is raining?', 'Weather and safe access determine what can proceed; a wet roof or active storm can change the appointment and accessible scope. Ellis supports two-storey inspections: include the number of storeys, access restrictions and roof-space arrangements when booking. We discuss which areas can be inspected and any change needed for safe work. Do not access a wet roof to investigate a leak yourself.', '/services/emergency-roof-repairs', 'Urgent enquiries and appointment confirmation'),
  topic('5-20', 'rental-property-roof-repairs', 'Property access', 'Identify the property contact and repair authorisation',
    'For a rental or managed property, identify the owner, property manager or authorised contact who can arrange access and approve work. We can coordinate with remote landlords and managers. Agree any inspection photos and written findings for review before booking. Confirm the authorised scope before booking repairs; reporting a leak and approving work are different steps.',
    'Who should arrange access and approve rental or strata roof repairs?', 'Identify the owner, property manager or authorised contact who can arrange access and approve work, including any owners corporation review requirements. Remote landlords can nominate a local contact. Agree any inspection photos and written findings, and their recipient, before booking; the findings and repair quote are then available for review. Reporting a leak and approving repairs are different steps. The relevant property contacts should establish approval and responsibility before work is instructed.', '/news/roof-leak-information-for-tenants-canberra', 'Information to include in a rental leak report'),
];

export const EXTRA_INTENT_TOPICS = [
  topic('metal-fixings', 'metal-roof-repairs', 'Metal roofing', 'Leaks around metal roof screws, sheets or a garage roof',
    'Describe whether the concern is over a house, garage or another attached roof area. A rust mark, loose-looking screw or drip is a starting point for checking the sheet, fixing, overlap and adjoining junction. We assess the actual material and access and identify suitable component work, rather than assume every metal roof needs replacing.',
    'Can a leak around metal roof fixings be investigated?', 'Yes. Describe whether the concern is over a house, garage or attached roof area, with rain timing and previous work. A rust mark, loose-looking screw or drip gives us an area to inspect; it does not establish the cause. We assess the existing material, safe access, fixings, surrounding sheets, overlaps and flashing alongside the water signs. The quote identifies suitable component repairs rather than assuming every metal roof needs replacing.', '/services/roof-inspections', 'Inspect metal roof components and water signs'),
  topic('cleaning-materials', 'roof-cleaning', 'Maintenance', 'Choose cleaning by roof material, not only by appearance',
    'Loose debris clearance, surface washing and removal of attached growth are different tasks. The existing tile or metal finish and condition determine the suitable approach. Monier advises against pressure washers on its tiles; COLORBOND guidance describes gentle non-abrasive care. We assess the surface and connected drainage before confirming the cleaning scope.',
    'Does one roof cleaning method suit tiles and Colorbond?', 'No. Loose debris clearance, surface washing and removal of attached growth are different tasks. The material, finish, damage and build-up determine the suitable approach. Monier advises against pressure washers on its tiles; COLORBOND guidance describes gentle, non-abrasive care. We assess the surface and connected drainage before confirming the method. Cleaning and component repairs are separate scopes; the material-care guide links to the manufacturer references.', '/news/roof-cleaning-methods-canberra', 'Tile, metal and moss cleaning methods'),
  topic('gutter-choice', 'gutter-downpipe-maintenance', 'Maintenance', 'Gutter cleaning or gutter repairs after overflow',
    'Visible leaves or debris call for a clearing assessment, while a leaking joint or damaged section needs its component condition checked. Both concerns can occur together. Describe where water appears in heavy rain and whether it reaches the eaves or indoors, so we assess the connected drainage rather than assume a blockage alone explains everything.',
    'Should overflowing gutters be cleaned or repaired?', 'Debris, outlets, downpipes, gutter fall, joints and roof runoff all need consideration; overflow does not automatically mean a blocked downpipe. Clearing removes build-up, while repairs address leaking joints or damaged, sagging sections and connections. Both can be needed. Describe where water appears in heavy rain and whether it reaches the eaves or indoors. We distinguish clearing and component repairs in the assessment and quote, with connected roof checks for indoor water signs.', '/services/gutter-repairs', 'Gutter joint and component repairs'),
];

// Old data-question values are internal selectors, not historical URL fragments.
// Match the complete editorial label so an unrelated/custom FAQ is never discarded.
export const GLOBAL_FAQ_MERGES = {
  'Roof leaks / Why is a stain not below the entry point?': 'leak.stain-vs-entry',
  'Tiles / Can only a few tiles be replaced?': 'tile.local-replacement',
  'Ridges / What is rebedding versus repointing?': 'ridge.bedding-vs-pointing',
  'Chimneys / What does flashing do?': 'chimney.flashing-function',
  'Chimneys / Do old sealant or patches prove the cause?': 'chimney.flashing-function',
  'Inspections / Are roof-space access, photos or written notes included?': 'inspection.agreed-scope',
  'Getting started / What should I include in an enquiry?': 'enquiry.safe-observations',
  'Costs / What affects fees or repair scope?': 'quote.scope-comparison',
  'Costs / How much does roof repair cost in Canberra?': 'quote.scope-comparison',
};

export function getFaqEntries(faqs) {
  const aliases = {};
  const base = faqs.flatMap((item, index) => {
    const id = `base-${index}`;
    const intent = GLOBAL_FAQ_MERGES[item.q];
    if (intent) {
      (aliases[intent] ??= []).push(id);
      return [];
    }
    const [group, ...label] = item.q.split(' / ');
    return [{ id, intent: id, aliases: [], group, question: label.join(' / ') || item.q, answer: item.a, links: [] }];
  });
  return [...base, ...[...INTENT_TOPICS, ...EXTRA_INTENT_TOPICS].map(item => ({ ...item, aliases: aliases[item.intent] ?? [] }))];
}

// Each omitted seed/booking answer has an explicitly named primary answer.
export const SERVICE_FAQ_MERGES = {
  'roof-leak-repairs': {
    'Is the water mark always below the leak entry point?': 'leak.stain-vs-entry',
    'What if the roof still leaks after a repair?': 'leak.recurring-after-repair',
  },
  'tile-roof-repairs': { 'Can one or two damaged tiles be replaced?': 'tile.local-replacement' },
  'rebedding-repointing': { 'What is the difference between roof rebedding and repointing?': 'ridge.bedding-vs-pointing' },
  'chimney-flashing-repairs': {
    'Does cracked sealant identify the whole problem?': 'chimney.flashing-function',
    'Can chimney flashing repairs stop water from wind-driven rain?': 'chimney.flashing-function',
  },
  'metal-roof-repairs': { 'Does visible rust identify the source of a roof leak?': 'metal.component-investigation' },
  'roof-renovation': { 'Does a roof renovation enquiry automatically mean full roof replacement?': 'renovation.scope-choice' },
};

export const BOOKING_FAQ_MERGES = {
  'roof-leak-repairs': 'leak.heavy-rain-pattern',
  'tile-roof-repairs': 'tile.local-replacement',
  'chimney-flashing-repairs': 'chimney.flashing-function',
  'rebedding-repointing': 'ridge.local-scope',
  'roof-inspections': 'inspection.before-repair-decision',
  'rental-property-roof-repairs': 'rental.access-and-approval',
};

export const SEED_FAQ_INTENTS = {
  'Does every crack mean all ridge caps need repointing?': 'ridge.local-scope',
  'Can I arrange a roof inspection before deciding what to repair?': 'inspection.before-repair-decision',
};

export const ADDITIONAL_SERVICES = [
  {
    slug: 'emergency-roof-repairs', title: 'Emergency & Urgent Roof Repairs',
    direct: 'For emergency or urgent roof repair enquiries in Canberra, call Ellis Services Group on 0405878406. Normal working hours are 9:00 am–9:00 pm, seven days a week. Outside these hours, an additional urgent-service fee applies, determined in the on-site quote.',
    symptoms: 'Describe an active drip, ceiling water mark, visible tile displacement after a storm or a gutter overflow. Include the affected room, suburb and when the issue began. If water is near electrical fittings or the area appears unsafe, keep clear and seek the appropriate emergency assistance rather than wait for an online reply.',
    causes: 'An active leak does not establish which component has failed. We consider the reported rain pattern, affected roof area, previous repairs and connected drainage. The enquiry helps arrange the appropriate assessment; the repair is selected from the condition that can be checked on site.',
    assessment: 'Call with the property address, current water signs and access details. Ellis confirms the appointment and checks the safely accessible roof area and connected components. Weather, access and the findings determine what can proceed and whether further investigation is needed.',
    pathways: 'We explain the findings and proposed work before approval. A temporary measure and a lasting component repair are different scopes; any further work needs to be clear. Confirm the appointment and quoted charges with us, including the additional urgent-service fee outside normal hours.',
    scope: 'The roof material, height, access, weather and extent of damage affect the work. An urgent enquiry is not a guarantee of immediate attendance or a repair during unsafe conditions. We confirm the timing separately and identify the work and price in the quote.',
    faqQ: 'What are your normal hours and after-hours charges?',
    faqA: 'Our normal working hours are 9:00 am–9:00 pm, seven days a week. Outside those hours, an additional urgent-service fee applies. The amount is determined in the on-site quote.',
    faqExtras: [{ q: 'Should I wait for an enquiry reply if there is immediate danger?', a: 'No. For a life-threatening emergency call 000. ACTSES handles storm and flood emergency assistance on 132 500. These are emergency-service contacts, not Ellis booking numbers.' }],
    next: 'Call 0405878406 for an urgent enquiry and provide your suburb, current water signs and access contact. Confirm the appointment and applicable charges; do not climb onto a wet or storm-damaged roof.',
    related: [
      { label: 'Roof Leak Repairs', path: '/services/roof-leak-repairs', description: 'Investigate intermittent, recurring or active water-entry signs.' },
      { label: 'Roof Inspections', path: '/services/roof-inspections', description: 'Agree accessible inspection areas, photos and written findings.' },
    ],
  },
  {
    slug: 'rental-property-roof-repairs', title: 'Rental & Property Manager Roof Repairs',
    direct: 'Ellis Services Group arranges roof repairs and inspections for Canberra rental owners and property managers, including interstate landlords. We coordinate access with your nominated contact and agree any inspection photos and written findings before booking. The proposed repair scope is submitted for review before approval.',
    symptoms: 'A tenant report may describe a bedroom ceiling stain, a drip after heavy rain, displaced tiles or dampness without rain. Keep the room, timing, weather and any safe photographs with the property details. Previous work and the access contact help us prepare without assuming the reported symptom proves a particular cause.',
    causes: 'We relate the observations to the accessible roof covering, junctions and drainage. A remote owner does not need to diagnose the problem before booking. The findings explain the areas inspected and any further access or investigation needed, rather than turn the tenant’s initial description into a predetermined repair.',
    assessment: 'Nominate the owner or manager contact, property address, occupant access arrangements and the inspection purpose. Ellis supports coordination with remote landlords and property managers, including two-storey properties. We agree the appointment, access and any photos or written findings before booking, then inspect the relevant accessible details.',
    pathways: 'The findings and written repair quote give the authorised contact a clear scope to review. Confirm who can approve the work, which components and materials are included, exclusions and any further investigation. We arrange the agreed repair after approval; the inspection record is not a substitute for that authorisation.',
    scope: 'Property height, access, occupancy, weather, material condition and the required work affect the appointment and quote. Include any owners corporation or property manager review requirements before booking. Special-purpose engineering or compliance certification is outside this roof inspection and repair service.',
    faqQ: 'Can you arrange the visit if I live interstate?',
    faqA: 'Yes. Nominate your property manager or other authorised access contact. We coordinate the visit and agree any inspection photos and written findings before booking so you can review the agreed records and repair quote remotely.',
    faqExtras: [{ q: 'Can the findings be sent for an owner or owners corporation to review?', a: 'Yes. Tell us the recipient, property details and review requirements when booking. Agree any photos and written findings before booking. We submit the repair scope for review; confirm the appropriate approval before instructing the work.' }],
    next: 'Send the property address, owner or manager contact, tenant’s observations, access arrangements and who will approve the work. Ask for the inspection photos, written findings and itemised repair scope needed for your review.',
    related: [
      { label: 'Roof Inspections', path: '/services/roof-inspections', description: 'Check relevant accessible details and document findings for the repair decision.' },
      { label: 'Roof Leak Repairs', path: '/services/roof-leak-repairs', description: 'Investigate the reported water signs and confirm component repairs.' },
    ],
  },
];

const sections = [
  ['Report the leak to your property contact', 'If you rent a Canberra home, report the concern through your landlord or property manager’s repair contact. Include the property address, room and when the water sign appeared. Reporting the problem does not require you to identify the roof defect or decide which repair is needed.', 'Ellis can coordinate a roof assessment with the owner or manager. Agree any photos and written findings before booking. The nominated contact should confirm access and who can approve the repair. This guide helps prepare a useful report; it does not decide legal responsibility or allocate costs.'],
  ['Describe the room, timing and weather', 'Record whether there is an active drip, a brown ceiling stain, bubbling paint or dampness. Note whether it follows heavy rain, wind-driven rain or also happens when it is dry. Tell the property contact whether the mark has grown or returned after earlier work.', 'A stain near a chimney or skylight gives the assessment a location, not a confirmed cause. Dampness can require roof water entry, condensation or other sources to be distinguished. Avoid describing a particular part as failed unless that is already established in the inspection findings.'],
  ['Use safe photos and keep the previous records', 'Indoor and ground-level photographs can help show the affected room or visible change. They are optional for an enquiry. Do not climb onto the roof, use a ladder to investigate a wet gutter or move damaged tiles to obtain a better image.', 'Include the date of any earlier repair, available findings and when symptoms returned. Keep the initial report and later correspondence together so the owner, manager and assessor can compare what changed. Do not publish tenants’ personal details or access instructions in a public review or case study.'],
  ['Confirm the access and approval contact', 'Identify who will arrange the appointment and provide access, including any occupant coordination needed. Let Ellis know the number of storeys, roof-space access arrangements and other restrictions. Remote landlords can nominate a property manager to coordinate the visit.', 'Agree any inspection photos and written findings, and their recipient, before booking. The repair quote identifies the proposed work for review. Ask the relevant property contacts to confirm the approval process before instructing repairs, particularly where an owners corporation is involved.'],
  ['Active leaks and urgent contact', 'Call Ellis on 0405878406 to discuss an urgent assessment. Normal working hours are 9:00 am–9:00 pm, seven days a week. Outside those hours an additional urgent-service fee applies, with the amount determined in the on-site quote. Appointment timing and safe access are confirmed separately.', 'If there is an immediate threat to life, call 000. For ACT storm or flood emergency assistance, contact ACTSES on 132 500. Keep clear of unsafe areas and wet electrical fittings; do not wait for a website form reply when emergency assistance is needed.'],
  ['Keep the findings, quote and repair scope together', 'Where included in the agreed scope, photos and written findings should make the inspected areas and any further investigation clear. The authorised contact can then review the components, materials, access, exclusions and price in the repair quote, rather than approve an unspecified promise to stop a leak.', 'Keep the appointment details, access contact, findings and approved quote together. This gives the owner, manager and occupant a clear reference for the agreed repair and any follow-up arrangements.'],
].map(([heading, ...paragraphs]) => ({ heading, paragraphs }));
export const TENANT_GUIDE = {
  slug: 'roof-leak-information-for-tenants-canberra',
  title: 'Roof Leaks in a Canberra Rental: What to Report and Who to Contact',
  description: 'Prepare a useful rental roof leak report: safe photos, rain timing, access, owner or property manager contact and the inspection findings to request.',
  summary: 'What tenants, remote landlords and property managers can prepare for a roof leak assessment and repair decision.',
  serviceTitle: 'Rental & Property Manager Roof Repairs', servicePath: '/services/rental-property-roof-repairs',
  updated: '2026-10-12', body: [], sections,
  faqs: [
    { q: 'Do I need to identify the roof defect before reporting a leak?', a: 'No. Give the address, room, timing, weather pattern and safe photos if available. The assessment establishes the relevant roof findings and proposed repair.' },
    { q: 'Can an interstate owner receive the findings remotely?', a: 'Yes. Ellis coordinates with the nominated access contact. Agree any inspection photos and written findings for the owner or property manager to review before booking.' },
  ],
  related: [{ path: '/news/after-rain-roof-leak-check-canberra', label: 'Record indoor signs after rain' }, { path: '/news/roof-repair-cost-canberra', label: 'Compare the scope in a repair quote' }],
  sources: [{ path: 'https://esa.act.gov.au/be-emergency-ready/storms', label: 'ACT Emergency Services Agency: storm emergency contacts' }],
};
