// First-party content expansion approved from the 12 October keyword-gap report.
const link = (path, label) => ({ path, label });
const section = (heading, paragraphs, bullets = [], links = []) => ({ heading, paragraphs, bullets, links });
const guide = (slug, title, description, serviceTitle, servicePath, sections, faqs, related, sources = []) => ({
  slug, title, description, summary: description, serviceTitle, servicePath,
  body: [], updated: '2026-10-12', sections, faqs, related, sources,
});

export const GAP_GUIDES = [
  guide('roof-repair-cost-canberra', 'Roof Repair Cost Canberra: What Shapes Your Quote',
    'Understand roof leak repair costs in Canberra, what changes the scope and how to compare an itemised quote before approving work.',
    'Roof Leak Repairs', '/services/roof-leak-repairs', [
      section('What determines a roof leak repair cost?', [
        'Roof repair cost in Canberra depends on the component that needs attention, the extent of the work, suitable materials and safe access. A stain does not tell us how large the repair will be. Ellis investigates the affected roof area, explains the findings and prepares a written scope before repair work is agreed.',
        'Start with the problem you want resolved, rather than an assumed remedy. A quote to replace a damaged tile is not directly comparable with a quote that also includes ridge work or a chimney junction. Naming the areas and components makes the difference between those prices understandable.',
      ]),
      section('Separate the inspection appointment from the repair', [
        'An inspection and a repair are different stages. Before a visit, we explain any inspection or booking fee that applies and agree the purpose and access. The repair quote then identifies the work recommended from the findings. Ask whether further investigation is needed and how that will be agreed.',
        'If you already have an earlier quote or repair record, include it with your enquiry. It helps identify what was previously considered, but it does not replace checking the current condition. Let us know if the water mark has moved, become larger or returned under different weather conditions.',
      ], [], [link('/news/when-to-arrange-roof-inspection-canberra', 'What a roof inspection and repair quote include')]),
      section('Why two apparently small repairs can have different scopes', [
        'The visible size of a defect is only part of the work. The number of storeys, roof pitch, available access and position of the affected detail influence how the job can be carried out. Materials also matter: the quote should identify suitable tiles, sheets, flashings or fasteners rather than simply promise a general patch.',
        'Connected work needs to be named. If adjoining tiles or a junction also need attention, the quote should explain that relationship. A local repair and a wider maintenance proposal should be distinguishable, so you can understand the purpose of each item instead of choosing on the total alone.',
      ], ['Identify the affected roof area and component.', 'Confirm materials and any matching limitations.', 'Separate repairs from optional cleaning or finish work.', 'Agree access, further investigation and completion checks.']),
      section('Compare like-for-like written quotes', [
        'Put the scopes beside each other. Check whether they cover the same defect, roof areas, materials and preparation. Ask about exclusions, removal of agreed debris and the checks included when work is complete. Clarify any payment or warranty terms with the contractor before approval rather than assume they are identical.',
        'A low total may describe a smaller job; a larger total may include unrelated maintenance. Neither tells you whether the proposed work addresses the reported leak. Ask which finding supports the recommendation and what the repair is intended to address. Any additional work should be discussed and agreed before it proceeds.',
      ]),
      section('When a focused cost guide is more useful', [
        'Ridge repairs have their own scope questions: which ridge and hip lines are affected, whether bedding is sound and whether repointing or rebedding is proposed. Gutter problems need a separate distinction between debris clearing and component repairs. These are useful comparisons, not interchangeable price packages.',
        'If several roof areas have repeated problems, compare local repair with a broader renovation discussion. Cleaning or a new finish should not be treated as a substitute for investigating water entry. The purpose of the quote is to show the work that suits the condition found.',
      ], [], [link('/news/roof-repointing-cost-canberra', 'Roof repointing cost and scope'), link('/services/gutter-repairs', 'Gutter repairs in Canberra'), link('/news/roof-repair-vs-restoration-vs-replacement-canberra', 'Compare repair, restoration and replacement')]),
      section('Prepare for a Canberra roof repair quote', [
        'Send your suburb, the affected room or roof area, when the issue occurs, roof material if known and any previous repair history. Tell us the number of storeys and how property access can be arranged. Safe photographs are helpful but optional; a clear written description is enough to start.',
        'Ellis confirms the visit arrangements, assesses the relevant roof details and explains the recommended repair plan and quote. Keep the scope with your property records so later maintenance can be discussed against the work actually completed, rather than a remembered description of the price.',
      ], [], [link('/contact', 'Arrange a roof assessment and written quote')]),
    ], [
      { q: 'Can you price a roof leak from a ceiling photograph?', a: 'A photo helps locate the concern and prepare the visit. We need to assess the roof and connected details before confirming the repair scope and price.' },
      { q: 'Should I choose the lowest roof repair quote?', a: 'First check that the quotes address the same defect and include comparable materials, access and connected work. Ask about any scope difference before comparing totals.' },
    ], [link('/news/roof-repointing-cost-canberra', 'Repointing costs'), link('/news/roof-leak-vs-condensation-canberra', 'Leak or condensation?')]),

  guide('roof-repointing-cost-canberra', 'Roof Repointing Cost Canberra: Compare the Work Included',
    'See what affects roof repointing costs, how rebedding changes the scope and which ridge repair details to check in a Canberra quote.',
    'Rebedding & Repointing', '/services/rebedding-repointing', [
      section('What affects roof repointing cost?', [
        'Roof repointing cost depends on the ridge or hip lines included, the condition of their supporting bedding, materials, preparation and safe access. Ellis assesses those details together and identifies the work required in the quote. Surface cracking alone does not tell you whether repointing is the complete repair.',
        'When asking for a price, describe whether the concern is along one short section or several roof lines. Include any loose-looking caps, missing material or indoor water signs you can observe safely. Those details help frame the assessment without assuming that every ridge on the roof needs identical work.',
      ]),
      section('Repointing and rebedding are different items', [
        'Bedding supports the ridge or hip caps; pointing is the external finishing material along their edges. Repointing concerns that external finish. Rebedding addresses the supporting material where that work is needed. A quote should say which operation is proposed on which roof line and explain any connected tile work.',
        'If two quotes use different terms, ask for the difference to be made explicit. One may describe a surface renewal while the other includes lifting and resetting affected caps. Comparing them as the same job would hide a meaningful scope difference. The condition found on site should explain the choice.',
      ], [], [link('/news/rebedding-vs-repointing-canberra-roofs', 'The plain-English difference between rebedding and repointing')]),
      section('Check the roof lines, preparation and materials', [
        'A useful ridge repair quote identifies the ridge and hip sections, the affected caps and preparation included. Ask whether adjoining damaged tiles require attention, how suitable materials will be selected and what is outside the agreed work. Avoid descriptions so broad that you cannot tell which roof areas are being priced.',
        'Known previous patching is relevant. Share any earlier repair records and explain whether the concern has returned in the same location. We assess the current condition and discuss the repair needed; a previous invoice does not by itself establish why a ridge detail has changed.',
      ], ['Roof lines and approximate extent of the agreed work.', 'Repointing, rebedding and tile repairs listed separately where relevant.', 'Materials, preparation and safe access arrangements.', 'Any areas needing a separate investigation or later approval.']),
      section('Why access changes a ridge repair quote', [
        'A ridge detail on a straightforward roof and a similar-looking detail high on a complex roof can require different access planning. Roof pitch, height, layout, surrounding structures and weather affect the work arrangements. Confirm what the quote includes rather than assume an apparent per-metre comparison covers the same job.',
        'The inspection appointment also has an agreed scope. Before booking, Ellis explains any applicable fee and the access needed. The repair recommendation follows the assessment, so the scope can distinguish a local ridge repair from wider renovation or other maintenance being considered.',
      ]),
      section('Compare a local ridge repair with wider roof work', [
        'Ask what the ridge work will address and whether other defects have been identified. A weathered roof does not automatically need all its components renewed. Equally, work on one ridge line should not be described as resolving unrelated flashing or drainage concerns unless those items are included and assessed.',
        'If a broader renovation is proposed, separate the repairs from preparation and finish work. That makes it easier to decide which items address a defect and which serve a wider maintenance goal. The scope, rather than the name of a package, should explain what you are approving.',
      ], [], [link('/news/roof-repair-vs-restoration-vs-replacement-canberra', 'Repair versus broader roof renovation'), link('/news/roof-repair-cost-canberra', 'How to compare roof repair quotes')]),
      section('Arrange a ridge repair assessment in Canberra', [
        'Send your suburb, which roof lines concern you, when you noticed the change and any known previous work. Include safe ground-level photographs if available. There is no need to climb onto the roof or test a ridge cap by hand to make an enquiry.',
        'Ellis checks the accessible ridge and adjoining roof details, explains the recommended rebedding or repointing work and provides the written quote. Confirm the affected sections, access and any further work before approval, and keep those details with your repair records.',
      ], [], [link('/contact', 'Discuss ridge capping repairs with Ellis')]),
    ], [
      { q: 'Is repointing always cheaper than rebedding?', a: 'They describe different work. Compare the roof lines, condition, preparation and materials included; the appropriate operation follows the assessment.' },
      { q: 'Does cracked pointing mean the whole roof needs repointing?', a: 'Not automatically. We assess the affected ridge and hip lines, supporting bedding and neighbouring tiles before recommending the extent of work.' },
    ], [link('/news/rebedding-vs-repointing-canberra-roofs', 'Bedding and pointing explained'), link('/news/roof-repair-cost-canberra', 'Roof repair cost factors')]),

  guide('roof-cleaning-methods-canberra', 'Roof Cleaning Canberra: Tile, Metal and Moss Removal Methods',
    'Compare the questions that matter before cleaning tiled or metal roofing: surface condition, moss and lichen, method suitability and drainage.',
    'Roof Cleaning', '/services/roof-cleaning', [
      section('Choose roof cleaning around the material and condition', [
        'Roof cleaning in Canberra starts with the existing material, its surface condition and the build-up to be removed. A method suited to one roof is not automatically suitable for another. Ellis checks the roof, connected drainage and access before confirming the cleaning approach and quote.',
        'Describe the goal: removing visible growth, clearing debris or improving the appearance of a weathered surface. Mention any known leak, loose tile or damaged finish separately. Cleaning and repairing a defect are different jobs, even when they are planned during the same visit.',
      ]),
      section('What matters on a tiled roof', [
        'For terracotta or concrete tiles, the assessment considers the tile condition, surface finish, ridge details and adjoining junctions. Visible moss or lichen is a reason to inspect the surface, not proof that every tile needs replacement. The agreed cleaning area should be clear, including how debris and drainage will be managed.',
        'Monier advises against pressure washers on its roof tiles because they can damage the tiles. Its guidance also distinguishes appearance from waterproofing: repainting concrete tiles changes their appearance, while terracotta tiles do not require respraying. Identify the tile and follow its manufacturer guidance; a fast visual result is not a reason to use an unsuitable method.',
      ], [], [link('/services/tile-roof-repairs', 'Tile repairs before cleaning')]),
      section('Metal and Colorbond surfaces need material-specific care', [
        'On a metal roof, discuss the existing coating, visible corrosion, sheet connections and nearby fittings. Identify the material where possible and check the relevant manufacturer guidance before selecting a cleaning approach. A cleaning quote should not silently include coating repair or promise that washing will remove corrosion damage.',
        'For COLORBOND steel, BlueScope describes gentle washing with a sponge, soft cloth or soft-bristled nylon brush, avoiding abrasive scourers and steel wool that can scuff the finish. This is different from aggressive surface stripping. Those material-care principles inform the assessment; the work still needs suitable access, protection of drainage and attention to the existing coating.',
      ], [], [link('/services/metal-roof-repairs', 'Metal and Colorbond roof repairs')]),
      section('Moss, lichen and shaded roof areas', [
        'Describe whether growth is concentrated around shaded areas, valleys, roof edges or adjoining trees. Include leaf build-up and any changes in the gutter line. These observations help distinguish surface cleaning from drainage clearing and identify the areas to assess together.',
        'Loose leaves and debris call for clearance, while attached moss or lichen requires a surface-cleaning approach suited to the material and finish. Washing, abrasive removal and a proposed treatment are not interchangeable: the assessment must establish compatibility and runoff arrangements before a method is agreed. Cleaning does not turn an aged surface into new roofing; Ellis explains any component repairs separately.',
      ]),
      section('Plan drainage, nearby fittings and safe access', [
        'The cleaning scope should account for where debris and runoff will go. Tell us about water tanks, solar panels, skylights and any restricted property access. This allows the roof and drainage arrangements to be discussed before work, rather than treating every roof surface as an isolated area.',
        'Roof work needs suitable fall-prevention planning. Do not climb onto the roof to test a cleaning method or obtain close-up photographs. WorkSafe ACT publishes roof-work safety guidance; for an enquiry, ground-level observations and a written description are enough. Cleaning around solar equipment is not an electrical maintenance service.',
      ], [], [link('/services/gutter-downpipe-maintenance', 'Gutter and downpipe clearing'), link('/news/gutters-overflowing-heavy-rain-canberra', 'Understanding gutter overflow')]),
      section('Compare roof cleaning costs and inclusions', [
        'Ask for the roof areas, material, proposed method, access arrangements and drainage work to be identified. Roof height, layout, surface condition and the extent of build-up affect the scope. Any component repairs should be distinguishable from cleaning in the quote.',
        'Send your Canberra suburb and the areas you want assessed, with safe photos if available. Ellis checks the surface and drainage, explains the approach suited to the existing roof and confirms the work and price before proceeding. If water entry is the main concern, start with a leak assessment rather than book cleaning as a cure.',
      ], [], [link('/contact', 'Arrange a roof cleaning assessment')]),
    ], [
      { q: 'Is pressure cleaning suitable for every tiled roof?', a: 'No single cleaning approach suits every roof. The material, finish, visible damage, junctions and access need to be assessed before the method is agreed.' },
      { q: 'Does roof cleaning include gutter clearing?', a: 'Confirm the included gutter runs, outlets and downpipes in the quote. Cleaning the roof surface and clearing the drainage system are related but distinct scopes.' },
      { q: 'Can cleaning fix a leaking roof?', a: 'A leak requires investigation of the water-entry path. Ellis discusses the required repairs separately from removal of surface build-up.' },
    ], [link('/news/gutters-overflowing-heavy-rain-canberra', 'Gutter overflow after rain'), link('/news/roof-repair-vs-restoration-vs-replacement-canberra', 'Cleaning, repair or renovation?')], [
      link('https://www.monier.com.au/roof-cleaning-and-maintenance/', 'Monier: roof tile cleaning and maintenance'),
      link('https://colorbond.com/faq/what-best-way-maintain-my-roof-wall-fence-made-colorbond-steel', 'COLORBOND steel: manufacturer maintenance guidance'),
      link('https://www.worksafe.act.gov.au/health-and-safety-portal/safety-topics/safety-advice/stop-construction-falls/roofs', 'WorkSafe ACT: roof-work safety'),
    ]),

  guide('gutters-overflowing-heavy-rain-canberra', 'Gutters Overflowing in Heavy Rain: What Canberra Owners Can Check Safely',
    'Understand the difference between gutter clearing and repairs, the observations that help an assessment and what to include in an overflow enquiry.',
    'Gutter & Downpipe Cleaning and Maintenance', '/services/gutter-downpipe-maintenance', [
      section('Overflow is a starting point, not a complete diagnosis', [
        'Gutters overflowing in heavy rain can involve debris, outlets, downpipes, gutter condition or other drainage details. The location of the overflow helps identify where to investigate, but does not establish the cause on its own. Ellis assesses the run and connected drainage before recommending clearing or repairs.',
        'Record which side of the property is affected and whether water comes over an edge, appears at a joint or runs near a wall. Include any indoor water signs as a separate observation. The aim is to describe the route of the water without trying to access a wet roof or high gutter.',
      ]),
      section('Record when and where the overflow happens', [
        'Note whether it occurs only in a short heavy downpour or also during ordinary rain. If you can observe from a safe, sheltered position, record whether more than one roof edge is affected. A short description of the timing can be more helpful than a close-up photograph taken from an unsafe position.',
        'Tell us about recent changes such as visible leaf build-up, a sagging section or earlier gutter work. Previous cleaning is useful background but does not rule out a current blockage or a component concern. Share the details without assuming that a particular repair is already needed.',
      ]),
      section('When clearing is the relevant first discussion', [
        'If the enquiry is about visible debris, accumulated leaves or a blocked-looking outlet, gutter and downpipe cleaning is the closest service entry. The assessment should identify the runs, outlets and connected downpipes included in the work, rather than treat the entire drainage system as one unspecified item.',
        'Ask whether clearing the nominated area includes checks of its connected drainage route. If a damaged joint or component is identified, that is a separate scope discussion. A cleaning enquiry should not automatically become a full replacement proposal without an explanation of the condition found.',
      ], [], [link('/services/gutter-downpipe-maintenance', 'Gutter and downpipe cleaning in Canberra')]),
      section('When gutter repairs need their own scope', [
        'Water at a joint, visible sagging or a damaged connection is a reason to discuss component condition as well as clearing. These observations do not confirm the remedy remotely. Ellis assesses the affected section and explains the repair work required, including any connected downpipe or roof-edge detail.',
        'A repair quote should identify the area and components included, materials, access and any clearing needed as part of the work. Keep that separate from optional cleaning of unaffected roof surfaces. The distinction makes it easier to understand what the repair is intended to address.',
      ], [], [link('/services/gutter-repairs', 'A separate gutter repair assessment')]),
      section('Connect drainage concerns with roof water entry', [
        'If overflow is accompanied by a ceiling stain or indoor drip, include both observations and their timing. Water entry needs investigation of the connected roof and drainage details; visible gutter overflow alone does not establish the full path into the building.',
        'For surface debris extending beyond the gutter line, roof cleaning may be relevant as a separate task. Discuss the material, drainage and included areas together so the proposed cleaning does not leave the quote unclear about clearing and component repairs.',
      ], [], [link('/services/roof-leak-repairs', 'Roof leak investigation'), link('/news/roof-cleaning-methods-canberra', 'Roof cleaning methods and drainage')]),
      section('Arrange a Canberra drainage assessment', [
        'Send your suburb, the gutter edge or downpipe that concerns you, when overflow happens and any known previous clearing or repairs. Explain property access and number of storeys. Safe photographs are optional; do not climb a ladder in rain to make the enquiry.',
        'Ellis confirms the appointment and applicable inspection or booking fee, checks the connected drainage and explains the cleaning or repair scope and quote. If additional work needs further investigation, agree that next step before proceeding.',
      ], [], [link('/contact', 'Describe your gutter or downpipe concern')]),
    ], [
      { q: 'Does overflow always mean a blocked downpipe?', a: 'No. The gutter run, outlets, debris, joints and connected drainage all need consideration. Describe the location and rain conditions so the assessment starts with the right context.' },
      { q: 'Should I book cleaning or repairs?', a: 'Choose cleaning for a debris or clearing concern, and repairs for a damaged component or joint concern. If you are unsure, describe the overflow and Ellis will assess the relevant areas.' },
    ], [link('/news/after-rain-roof-leak-check-canberra', 'Recording rain-related water signs'), link('/news/roof-cleaning-methods-canberra', 'Roof cleaning and drainage planning')]),

  guide('roof-leak-vs-condensation-canberra', 'Roof Leak or Condensation? Understanding Dampness in Canberra Homes',
    'Compare useful observations for rain-related leaks and dry-weather dampness, and learn what to tell Ellis before a roof assessment.',
    'Roof Leak Repairs', '/services/roof-leak-repairs', [
      section('A ceiling stain does not establish the moisture source', [
        'A roof leak and condensation are different moisture problems, but a visible ceiling mark cannot distinguish them reliably on its own. Rainwater entry, condensation and plumbing concerns can all be relevant to an investigation. Tell Ellis when dampness appears, where it is visible and whether the pattern changes with the weather.',
        'The useful question is not simply whether the mark looks like a leak. It is what observations can guide the next inspection. A clear account helps the assessment connect the indoor sign with the roof condition without treating a suspected component as a confirmed cause.',
      ]),
      section('What condensation means', [
        'Condensation occurs when water vapour in the air meets a sufficiently cold surface and becomes liquid. The Australian Government’s YourHome guide explains that climate, the way a home is built and how it is used affect condensation risk. This is a general explanation, not a diagnosis of your property.',
        'If dampness appears without rain, include that detail in your enquiry. Note whether it occurs at certain times of day or alongside moisture elsewhere indoors. Do not enter a roof space or alter insulation, exhaust systems or roof materials to investigate on your own.',
      ]),
      section('Rain timing helps a roof leak investigation', [
        'Record whether the sign follows steady rain, a heavy downpour or wind-driven weather, and whether it appears during the rain or later. Include the affected room and whether the same location has been repaired before. Water can travel before it appears indoors, so the visible mark is not a precise map of the entry point.',
        'A leak that appears only occasionally still needs its weather pattern recorded. Photographs of changes over time may help, provided they can be taken safely. If water is near electrical fittings, stay clear of the area and seek appropriate urgent assistance rather than wait to collect more information.',
      ], [], [link('/news/after-rain-roof-leak-check-canberra', 'Recording roof water-entry signs after rain')]),
      section('Useful observations when dampness appears without rain', [
        'Tell us that the problem also occurs in dry weather rather than describe it only as a roof leak. Include any known plumbing issue or change in the affected room. A stain near a bathroom or other fitting is context, not proof of the source.',
        'Keep the notes factual: dates, room, visible area, weather and any previous work. Several causes can be considered at the same time. The next investigation should follow the evidence found, which may involve a different professional or a separately agreed inspection scope.',
      ], ['Dates and weather when the sign is present.', 'Whether the mark changes or stays dry between events.', 'Known previous roof or plumbing work in that area.', 'Safe photographs showing the location, not risky roof access.']),
      section('What a roof assessment can clarify', [
        'Ellis checks the relevant accessible roof covering, junctions and drainage within the agreed inspection scope. We connect those findings with the indoor signs and explain the repair options where roof defects are identified. Any concealed or inaccessible area and need for further investigation are discussed separately.',
        'Do not choose a roof coating, sealant patch or ventilation alteration solely from the appearance of a stain. Different sources need different responses. Ask what finding supports the recommended work and what remains outside the inspection or repair scope before approval.',
      ], [], [link('/services/roof-inspections', 'Agree the roof inspection scope'), link('/news/roof-repair-cost-canberra', 'Understand inspection and repair costs')]),
      section('Choose the next step from the evidence', [
        'For rain-related water entry, start with a roof leak enquiry and share the pattern. For uncertain dampness, explain both the rain and dry-weather observations so the assessment can be planned appropriately. You do not need to choose a repair method before contacting us.',
        'Send your Canberra suburb, the room and location of the sign, when it first appeared and any relevant history. Ellis confirms the visit arrangements and explains the findings and recommended scope. The goal is an informed repair discussion, not a guess based on a photograph.',
      ], [], [link('/contact', 'Arrange an assessment of the roof concern')]),
    ], [
      { q: 'Does dampness in dry weather rule out a roof problem?', a: 'Not by itself. It is important context for investigating moisture, alongside the location, roof condition, plumbing history and other observations.' },
      { q: 'Can a roof repair solve every condensation problem?', a: 'No. The moisture source and relevant building details need to be established. A roof repair addresses the roof defects identified, not every possible cause of indoor dampness.' },
    ], [link('/news/after-rain-roof-leak-check-canberra', 'After-rain leak observations'), link('/news/roof-repair-cost-canberra', 'Compare the agreed repair scope')], [
      link('https://www.yourhome.gov.au/passive-design/condensation', 'Australian Government YourHome: condensation'),
    ]),

  guide('roof-repair-vs-restoration-vs-replacement-canberra', 'Roof Repair vs Restoration vs Replacement: A Canberra Scope Guide',
    'Compare local roof repairs, a broader renovation or restoration scope, and replacement questions before deciding what your roof needs.',
    'Roof Renovation', '/services/roof-renovation', [
      section('Start with the condition, not the package name', [
        'Roof repair, restoration and replacement describe different levels of work. The appropriate discussion starts with the defects identified, existing material condition, previous repairs and your plans for the property. Ellis assesses the roof and explains the repairs and maintenance that suit the condition found.',
        'A worn appearance alone does not decide whether the roof needs local repair or broader work. Equally, a small visible stain does not establish a small repair. Ask what has been found, which components need attention and how each proposed item relates to the problem you want addressed.',
      ]),
      section('What a local roof repair is intended to address', [
        'A local repair focuses on a defined component or roof area, such as affected tiles, ridge details, metal fixings or a flashing junction. The quote should identify that area and any adjoining work needed. The condition of surrounding materials and suitable replacements influence whether a targeted scope is appropriate.',
        'Ask what the repair is intended to address and which other concerns remain outside it. A job on a few tiles should not be presented as renewing every roof detail. Understanding the limit of the agreed work helps you plan later maintenance without assuming that the whole roof has been restored.',
      ], [], [link('/services/tile-roof-repairs', 'Local tile roof repairs'), link('/services/metal-roof-repairs', 'Targeted metal roof repairs')]),
      section('What renovation or restoration can include', [
        'Owners may use restoration or renovation to describe a broader roof refresh. The words alone do not specify the work. Our roof renovation assessment considers the existing covering, ridge, flashing and drainage, then identifies the repairs, preparation and finish work suited to the property.',
        'The quote should distinguish defect repairs from cleaning and any agreed finish work. Ask which roof areas are included, how the materials are selected and what condition or access limits affect the proposal. Use the written scope, rather than a package label, to compare alternatives.',
      ], [], [link('/services/roof-renovation', 'Roof renovation and restoration-scope assessment')]),
      section('Where replacement fits into the decision', [
        'If a broader replacement is being considered, ask what local repair or renovation would leave unresolved and why replacement is being discussed. Compare the condition of the existing materials, how widespread the defects are and the extent of work proposed. Replacement is a separate scope and decision from a local repair or a surface refresh.',
        'Materials, connected details, access and the extent of proposed work need to be defined before alternatives can be compared. Ask which findings support each option and which further assessments are required. A price comparison is only meaningful when the scope and assumptions are clear.',
      ]),
      section('Cleaning and coating are not substitutes for leak investigation', [
        'Cleaning removes surface build-up and debris within an agreed scope. A leak enquiry needs investigation of the water-entry path. If a roof also needs cleaning or finish work, keep those items distinguishable from the repairs intended to address water entry or damaged components.',
        'When comparing proposals, ask about the work sequence: what must be repaired first, which preparation follows and what final checks are included. Avoid assuming that a new-looking surface proves every underlying junction or drainage issue has been resolved.',
      ], [], [link('/news/roof-cleaning-methods-canberra', 'Cleaning methods and material condition'), link('/services/roof-leak-repairs', 'Roof leak investigation before choosing a remedy')]),
      section('Compare the scope before comparing the total', [
        'List the findings, roof areas, materials and access included in each proposal. Separate local repairs, wider preparation, cleaning and finish work, and identify exclusions or further investigation. Clarify payment, completion checks and any warranty terms with the contractor before approval.',
        'Send Ellis your Canberra suburb, the condition that concerns you and whether your goal is to resolve a defect or consider a wider refresh. We assess the roof, discuss the suitable work and provide the written quote. You can then compare the agreed scope without treating every roof concern as a replacement decision.',
      ], [], [link('/news/roof-repair-cost-canberra', 'Compare itemised roof repair quotes'), link('/contact', 'Discuss a repair or renovation assessment')]),
    ], [
      { q: 'Does a roof restoration enquiry mean I need a new roof?', a: 'No. Start with an assessment of the condition and your goals. A local repair, maintenance or a broader renovation discussion may be relevant; replacement needs a separate scope.' },
      { q: 'Should I arrange cleaning before the leak is assessed?', a: 'Tell Ellis about the leak first. We assess the water-entry concern and explain any repair work separately from cleaning or finish work.' },
    ], [link('/news/roof-repair-cost-canberra', 'Roof repair costs and inclusions'), link('/news/roof-repointing-cost-canberra', 'Ridge repair scope and cost')]),
];

export const GUTTER_REPAIR_SERVICE = {
  slug: 'gutter-repairs', title: 'Gutter Repairs',
  direct: 'Ellis Services Group provides local gutter repairs. We assess leaking joints, damaged sections and downpipe connections, then explain the component repairs, access and written quote.',
  symptoms: 'Water appearing at a joint, visible sagging, a separated connection or damage along a gutter run are reasons to arrange an assessment. Note the roof edge, side of the property and rain conditions. If there is also a ceiling stain or indoor drip, include that separately so the connected roof area can be considered.',
  causes: 'We check the affected gutter run, joints, outlets and connected downpipes rather than assume every overflow needs a replacement. Debris and component condition are assessed together. Previous clearing or patching is useful background, but the current condition determines the proposed repair.',
  assessment: 'Ellis checks the relevant accessible sections and connections, identifies damaged components and discusses suitable materials and access. We explain any clearing needed alongside the repair, and identify other roof or drainage concerns that require a separate scope.',
  pathways: 'The repair quote names the affected section, joints or connected components and the work required. Ask which areas are included, how access will be arranged and what completion checks belong to the job. Any additional work is discussed and agreed before proceeding.',
  scope: 'Roof height, the affected length, connection details, material condition, safe access and any clearing required shape the scope. A component repair is different from cleaning a debris-filled gutter or discussing a wider drainage replacement. We explain the recommended work and price after assessment.',
  faqQ: 'Do overflowing gutters always need repairs?',
  faqA: 'No. Debris, outlets, downpipes and the gutter condition all need consideration. Ellis distinguishes the clearing required from any damaged component that needs repair.',
  faqExtras: [{ q: 'Can a leaking gutter joint be assessed without replacing the whole run?', a: 'We assess the joint and surrounding condition, then explain whether a local component repair suits the affected area. The quote identifies the work recommended rather than assuming every gutter needs replacement.' }],
  next: 'Send your suburb, the affected gutter edge or downpipe, rain timing and any known previous work. Include safe ground-level photographs if available; a written description is enough to arrange the assessment.',
  related: [
    { label: 'Gutter & Downpipe Cleaning', path: '/services/gutter-downpipe-maintenance', description: 'For leaf debris, clearing and drainage maintenance rather than a damaged component.' },
    { label: 'Roof Leak Repairs', path: '/services/roof-leak-repairs', description: 'For indoor water signs or a water-entry path that needs investigation.' },
  ],
};

export const SERVICE_DEPTH = {
  'roof-leak-repairs': [
    section('Heavy-rain and recurring leaks: connect the pattern to the investigation', ['Keep your rain observations and earlier repair records together for the visit. The questions below explain heavy-rain patterns, wind direction, ceiling-stain location and recurring leaks separately, so you can describe the evidence relevant to your property.'], [], [link('/news/roof-leak-vs-condensation-canberra', 'Roof leak or condensation?'), link('/news/gutters-overflowing-heavy-rain-canberra', 'Gutter overflow and connected water signs')]),
    section('What affects the cost of a roof leak repair?', ['We identify the components, adjoining defects and materials included in the quote so you can compare the same work. Ask which further checks are included when the water path is not yet established.'], [], [link('/news/roof-repair-cost-canberra', 'Roof repair cost factors and quote comparisons'), link('/services/gutter-repairs', 'Gutter joint and component repairs')]),
  ],
  'tile-roof-repairs': [
    section('Individual tiles, neighbouring details and material matching', ['Use the local-replacement answer below to compare a few damaged tiles with wider work. Keep the affected area and any adjoining repair items in the same quote so the available material match can be reviewed with the scope.'], [], [link('/news/roof-repair-vs-restoration-vs-replacement-canberra', 'Local repair versus wider roof work')]),
    section('Cleaning a tiled roof and repairing damaged tiles are different jobs', ['If the roof also has moss, lichen or surface build-up, identify that as a separate goal. Cleaning does not replace an assessment of cracked tiles or loose ridge details. We discuss any repairs needed alongside the suitable cleaning approach, with the roof areas and materials shown in the quote.'], [], [link('/news/roof-cleaning-methods-canberra', 'Cleaning methods for tiled and metal roofs')]),
  ],
  'chimney-flashing-repairs': [
    section('Flashing repair or repeated patching: clarify the affected junction', ['Keep the earlier repair history with the junction and components named in the quote. The flashing answer below explains what is checked, how nearby water signs are interpreted and where roof-junction work ends.'], [], [link('/news/roof-repair-cost-canberra', 'Compare the components included in a repair quote')]),
  ],
  'rebedding-repointing': [
    section('Roof repointing cost: which ridge lines and which work?', ['A quote should identify the ridge or hip sections, the operations required and adjoining tile repairs. Preparation, materials, roof layout, height, pitch and safe access shape the scope, so an apparent per-metre comparison can miss important differences. Use the rebedding-versus-repointing answer below to understand the operations being priced.'], [], [link('/news/roof-repointing-cost-canberra', 'Roof repointing costs and quote inclusions')]),
  ],
  'roof-inspections': [
    section('Use the inspection findings to compare repair options', ['Use the named roof areas and defects in the findings to compare local repairs with wider renovation. Ask what each option would address and which concerns would remain.'], [], [link('/news/roof-repair-cost-canberra', 'Inspection and repair cost differences'), link('/news/roof-repair-vs-restoration-vs-replacement-canberra', 'Compare roof work by scope')]),
  ],
  'metal-roof-repairs': [
    section('Roof screws, sheet laps and visible corrosion', ['A loose-looking fixing or rust mark helps locate the area to inspect; it does not establish the repair by itself. We consider the surrounding sheet, connection, flashing and water-entry history together. The quote identifies the components requiring attention and suitable materials. A surface mark, fixing issue and damaged sheet should not be treated as interchangeable reasons for the same patch.'], [], [link('/news/roof-repair-cost-canberra', 'Understand component-based repair pricing')]),
    section('Separate metal roof maintenance from surface cleaning', ['If appearance or surface build-up is the main concern, we discuss the material and finish before choosing the cleaning approach. Cleaning is not a corrosion repair or a substitute for investigating a leak. Describe the two goals separately so the quote identifies any sheet, fixing or flashing repairs alongside the cleaning scope.'], [], [link('/news/roof-cleaning-methods-canberra', 'Metal and Colorbond cleaning considerations')]),
  ],
  'roof-renovation': [
    section('Roof restoration: what does the scope actually include?', ['If you are looking for roof restoration in Canberra, start by describing the roof condition and the result you want. Owners often use restoration and renovation for a broader refresh, but the package name does not identify the work. Our assessment distinguishes repairs to the covering, ridge or flashing from preparation, cleaning and agreed finishes. The written quote shows the areas and materials involved.'], [], [link('/news/roof-repair-vs-restoration-vs-replacement-canberra', 'Repair, restoration and replacement explained')]),
    section('Resolve defects before deciding on the wider finish', ['A new appearance and a sound repair scope are different goals. If there are leaks or repeated defects, we assess those concerns and explain the work required before a broader finish is agreed. Ask what a local repair would address and what the wider renovation adds; replacement questions need their own scope rather than an assumption that every older roof must be renewed.'], [], [link('/news/roof-repair-cost-canberra', 'Compare roof repair costs and inclusions')]),
  ],
  'roof-cleaning': [
    section('Tile, metal and Colorbond roof cleaning: choose a suitable approach', ['Tell us whether the roof has terracotta or concrete tiles, or coated metal, if known. Include any existing finish or previous cleaning treatment so we can check the surface before choosing the method.'], [], [link('/news/roof-cleaning-methods-canberra', 'Roof cleaning methods and material care')]),
    section('Moss, lichen, drainage and roof cleaning costs', ['Mention rainwater tanks and solar equipment when arranging cleaning. Record whether growth is attached to the surface or loose debris is collecting in valleys and at roof edges; this helps distinguish surface treatment from drainage clearing.'], [], [link('/news/gutters-overflowing-heavy-rain-canberra', 'Gutter overflow and drainage clearing'), link('/services/gutter-downpipe-maintenance', 'Gutter and downpipe cleaning')]),
  ],
  'gutter-downpipe-maintenance': [
    section('Gutter cleaning: define the drainage areas included', ['For debris clearing, identify the gutter runs, outlets and connected downpipes included in the visit. Tell us where overflow occurs and when the system was last cleared, if known. We assess the drainage route and explain the clearing needed. Visible debris and a damaged connection can occur together, so component repairs are identified separately rather than hidden inside a general cleaning description.'], [], [link('/news/gutters-overflowing-heavy-rain-canberra', 'What gutter overflow in heavy rain can involve')]),
    section('Cleaning or gutter repairs: choose the right scope', ['Clearing removes debris within the agreed drainage areas. Repair concerns the condition of joints, sections and connected components. If water appears at a joint or a section looks damaged or sagging, describe that separately from leaf build-up. We explain the work recommended after assessment; neither a cleaning enquiry nor a repair enquiry automatically means full replacement.'], [], [link('/services/gutter-repairs', 'Gutter repairs for joints and damaged sections'), link('/news/roof-cleaning-methods-canberra', 'Roof cleaning and connected drainage')]),
  ],
  'gutter-repairs': [
    section('Define the gutter repair before comparing the quote', ['A clear quote distinguishes the section requiring repair from any debris clearing needed to assess or complete the work. Ask which joints, outlets and downpipe connections are included, which materials are proposed and what access is required. A local repair, a cleaning visit and a wider replacement discussion are different scopes; compare the work rather than a general promise to fix the gutters.'], [], [link('/news/gutters-overflowing-heavy-rain-canberra', 'Gutter overflow: observations that help the assessment'), link('/news/roof-repair-cost-canberra', 'Compare repair quote inclusions')]),
    section('Indoor water signs need the connected roof checked too', ['If there is a ceiling mark or drip alongside the gutter concern, include the room and timing in your enquiry. We consider the connected roof area rather than assume that repairing a visible joint establishes the whole water-entry path. Tell us about previous clearing or repairs so the assessment starts with the relevant history.'], [], [link('/services/roof-leak-repairs', 'Investigate roof water entry')]),
  ],
};

export const SERVICE_TOPIC_HEADINGS = {
  'roof-leak-repairs': ['Investigate the roof water-entry path', 'Ceiling stains and rain timing to describe', 'Roof covering, flashing and drainage causes', 'Trace the leak across connected roof details', 'Agree the leak repair and further investigation', 'Weather, access and concealed water paths'],
  'tile-roof-repairs': ['Assess damaged tiles and connected roof details', 'Cracked, slipped or missing tiles to describe', 'Tile condition, movement and water entry', 'Check tile profiles and adjoining materials', 'Agree local tile replacement and connected repairs', 'Replacement tile availability and safe access'],
  'chimney-flashing-repairs': ['Inspect the chimney-to-roof junction', 'Chimney-area water marks to describe', 'Flashing, masonry and adjoining roof details', 'Assess flashing junctions and the water path', 'Agree flashing and connected roof repairs', 'Chimney access and concealed junction limits'],
  'rebedding-repointing': ['Assess ridge bedding and exposed pointing', 'Loose ridge caps and cracked mortar to describe', 'Ridge movement, bedding and pointing condition', 'Check cap stability and adjoining tiles', 'Agree rebedding, repointing and tile work', 'Ridge access, materials and weather limits'],
  'roof-inspections': ['Agree the roof inspection purpose and scope', 'Roof concerns and inspection purpose to describe', 'Accessible roof areas and connected details', 'Inspect the roof within the agreed access scope', 'Discuss findings and proposed roof repairs', 'Visual inspection limits and further access'],
  'metal-roof-repairs': ['Assess metal sheets, fixings and junctions', 'Sheet, screw and flashing changes to describe', 'Metal roof laps, corrosion and water paths', 'Check sheets, fasteners and connected drainage', 'Agree metal roof component repairs', 'Material compatibility, height and safe access'],
  'emergency-roof-repairs': ['Confirm the urgent roof assessment', 'Active drips and storm damage to describe', 'Rain patterns and connected roof components', 'Assess accessible roof areas and current water signs', 'Agree temporary measures or component repairs', 'Urgent appointment, weather and access limits'],
  'rental-property-roof-repairs': ['Coordinate the rental roof assessment and approval', 'Tenant observations and previous work to describe', 'Reported symptoms and connected roof details', 'Agree access and inspection records before booking', 'Submit the roof repair scope for approval', 'Property access, authorised scope and inspection limits'],
  'roof-cleaning': ['Plan cleaning around the material, build-up and drainage', 'Moss, lichen and roof debris to describe', 'Roof material and surface condition', 'Choose a suitable cleaning method', 'Cleaning, clearing and repairs: separate scopes', 'What affects roof cleaning costs'],
  'gutter-downpipe-maintenance': ['Plan gutter and downpipe clearing', 'Debris and overflow to describe', 'Check the connected drainage route', 'Assess runs, outlets and downpipes', 'Agree the cleaning and maintenance areas', 'What affects gutter cleaning costs'],
  'gutter-repairs': ['Plan the gutter component repairs', 'Leaking joints and damaged sections', 'Check joints, outlets and connections', 'Assess the repair area and materials', 'Agree the component repair scope', 'What affects gutter repair costs'],
  'roof-renovation': ['Compare roof renovation and restoration scope', 'Weathering, defects and your project goal', 'Roof condition and connected details', 'Assess repairs, preparation and finishes', 'Separate defect repair from a wider refresh', 'What affects the renovation quote'],
};
