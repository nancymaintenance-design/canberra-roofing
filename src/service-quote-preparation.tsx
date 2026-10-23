import React from 'react';

// Questions prepare the existing on-site assessment; they do not diagnose the roof.
export const SERVICE_QUOTE_DETAILS: Record<string, readonly string[]> = {
  'roof-leak-repairs': [
    'Your Canberra suburb, affected room or roof area, and when water first appeared.',
    'Whether the leak follows steady rain, wind-driven rain or a particular weather pattern.',
    'Previous repairs in that area, the number of storeys and a contact for property access.',
  ],
  'tile-roof-repairs': [
    'Your suburb and whether the visible tile damage is in one area or several.',
    'The tile material or profile if known, and whether spare tiles or earlier repair records are available.',
    'Any indoor water signs, the number of storeys and property access arrangements.',
  ],
  'chimney-flashing-repairs': [
    'Your suburb, the chimney concerned and any affected room beside it.',
    'When dampness appears, the weather at the time and any earlier patching or flashing work.',
    'The number of storeys and any restrictions on access to the property.',
  ],
  'rebedding-repointing': [
    'Your suburb and the ridge or hip line that appears affected.',
    'Whether the concern is localised or extends across several roof lines, and any previous ridge work.',
    'The roof material if known, any indoor water signs and the number of storeys.',
  ],
  'roof-inspections': [
    'Your suburb and the purpose of the visit: a leak, visible damage or planning roof work.',
    'The areas you want checked, when the concern appeared and any earlier inspection or repair records.',
    'The number of storeys, known access restrictions and the person arranging entry.',
  ],
  'metal-roof-repairs': [
    'Your suburb, the affected metal roof sheets or junction, and any related indoor water signs.',
    'The weather pattern and any previous work around fixings, flashing or roof penetrations.',
    'The roof material if known, the number of storeys and the access contact.',
  ],
  'roof-renovation': [
    'Your suburb and your main objective: address defects, refresh the surface or compare wider roof work.',
    'The existing roof material, areas of concern and known previous repairs or finish work.',
    'The number of storeys, access arrangements and any inspection findings already available.',
  ],
  'reroof-replacement': [
    'Your suburb and why replacement is being considered, including any inspection findings.',
    'The current covering, proposed material if known, affected roof areas and previous repairs.',
    'The number of storeys, access contact and restrictions that may affect removal or installation.',
  ],
  'roof-cleaning': [
    'Your suburb, the visible build-up and which roof areas are affected.',
    'The roof material or coating if known, nearby solar panels and any existing leak or damage.',
    'The number of storeys, access arrangements and any previous cleaning or treatment.',
  ],
  'gutter-downpipe-maintenance': [
    'Your suburb and the gutter, outlet or downpipe where debris or overflow is visible.',
    'When it overflows, when it was last cleared if known, and any related indoor water signs.',
    'The affected side of the property, the number of storeys and access arrangements.',
  ],
  'gutter-repairs': [
    'Your suburb and the leaking joint, damaged gutter run or downpipe connection.',
    'Whether debris has already been cleared, when the problem occurs and any previous repairs.',
    'The affected side of the property, the number of storeys and a contact for access.',
  ],
  'rental-property-roof-repairs': [
    'The property suburb and address, the tenant’s observations and when the problem occurs.',
    'The access contact, the owner or manager who can approve work, and who should receive the findings.',
    'The number of storeys, known roof material and any earlier inspection or repair records.',
  ],
};

export function ServiceQuotePreparation({ slug, fallback }: { slug: string; fallback: string }) {
  const details = SERVICE_QUOTE_DETAILS[slug];
  // Urgent enquiries retain their established call-first instructions.
  if (!details) return <p className="serviceBookingPrompt">{fallback}</p>;
  return <div className="serviceQuotePreparation">
    <h3>Details for an assessment and quote</h3>
    <ul>{details.map(detail => <li key={detail}>{detail}</li>)}</ul>
    <p className="serviceBookingPrompt">Photos are optional. A written description or an indoor or ground-level photo is enough to start the enquiry.</p>
  </div>;
}
