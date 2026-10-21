type Faq = { q: string; a: string };
export type ServiceCopyRefinement = Partial<Record<'direct' | 'assessment' | 'pathways' | 'scope' | 'next' | 'faqA', string>> & { faqExtras?: Faq[] };

// Each section has a distinct job: service, investigation, repair decision, booking.
// Apply after all service records have been assembled; preserve titles and routes.
export const SERVICE_COPY_REFINEMENTS: Record<string, ServiceCopyRefinement> = {
  'roof-inspections': {
    direct: 'We inspect Canberra roofs for leaks, visible damage and maintenance decisions, then explain the findings and suitable repair options.',
    assessment: 'We assess the reported concern alongside the accessible roof covering, ridge, flashing junctions and drainage. This visual, non-invasive assessment distinguishes observed defects from concealed or inaccessible areas. It does not provide a structural or compliance certificate; further access or specialist investigation is discussed separately.',
    pathways: 'We explain which findings call for repairs or maintenance and which need further investigation. You can review those options before deciding whether to proceed with a repair quote.',
    scope: 'The inspection purpose, roof layout, weather and safe access determine which areas can be assessed. Tell us about roof-space access and any restrictions at the property.',
    faqExtras: [
      { q: 'Can I arrange a roof inspection before deciding what to repair?', a: 'Yes. You can use the findings to decide whether to request repairs or plan maintenance.' },
      { q: 'What should I prepare for a roof inspection enquiry?', a: 'Describe the visible concern, when it appeared and any particular roof area you want checked. The booking section covers the visit arrangements.' },
      { q: 'Does visual and non-invasive mean every roof issue will be found?', a: 'No. Concealed defects may need further access or investigation beyond what can safely be viewed.' },
    ],
  },
  'roof-cleaning': {
    direct: 'We clean moss, lichen, dirt and surface debris from Canberra roofs using a method suited to the existing roof material and condition.',
    assessment: 'We check the material, existing coating, surface condition, pitch and build-up to choose a suitable method. Nearby solar panels, penetrations and drainage affect how we manage loosened debris and runoff. We assess damaged roofing or water-entry concerns before cleaning proceeds.',
    pathways: 'Where debris affects the drainage route, we plan gutter and downpipe clearing alongside the roof cleaning. Any component repairs are identified separately.',
    scope: 'Roof height, access, weather, nearby services and the location of build-up affect the cleaning work. We identify the included roof areas and method in the quote.',
    faqA: 'No. Cleaning removes surface build-up; a leak needs the water-entry path investigated and any defective components assessed for repair.',
  },
  'rental-property-roof-repairs': {
    direct: 'We arrange roof inspections and repairs for Canberra rental owners and property managers, including interstate landlords, through a nominated property contact.',
    assessment: 'We inspect the accessible roof covering, junctions and drainage connected to the tenant’s report. We support two-storey properties and identify any areas that need further access or investigation.',
    pathways: 'We explain the findings and proposed component repairs so the owner or manager can review the work before it is instructed.',
    scope: 'Property height, occupancy, access restrictions, weather and roof condition affect the visit and repair scope. Special-purpose engineering or compliance certification is outside this service.',
    faqA: 'Yes. We coordinate access with your nominated contact so you can review the findings and repair quote remotely.',
    faqExtras: [{ q: 'Can the findings be sent for an owner or owners corporation to review?', a: 'Yes. Identify the recipient and review requirements in the booking arrangements. The authorised contact reviews the repair scope before instructing work.' }],
    next: 'Send the property address, tenant’s observations, number of storeys and owner or manager contact to start the enquiry.',
  },
  'emergency-roof-repairs': {
    direct: 'For an active leak or storm-damaged roof in Canberra, call us on 0405878406 to discuss an urgent assessment.',
    assessment: 'We check the safely accessible roof area and connected components to assess the current damage and water path. Weather, access and the findings determine what work can safely proceed.',
    pathways: 'We distinguish any temporary measure from a lasting component repair and explain what each would address. Further repairs require an agreed scope and approval.',
    scope: 'Roof material, height, weather, access and the extent of damage affect the work. We confirm attendance separately; unsafe conditions may prevent roof access or repairs.',
    faqA: 'See the working hours and urgent enquiries section for our normal hours and the additional after-hours fee. The fee amount is determined in the on-site quote.',
    next: 'Call 0405878406 with your suburb, current water signs and access contact. Do not climb onto a wet or storm-damaged roof.',
  },
  'roof-leak-repairs': {
    direct: 'We investigate and repair Canberra roof leaks, checking tiles or metal sheets, flashing junctions and drainage to trace the reported water-entry path.',
    pathways: 'We explain the entry point identified, connected defects and proposed component repairs. If the water path remains unresolved or concealed areas need investigation, we explain the next checks before additional work is agreed. Cleaning, painting and wider maintenance are separate decisions.',
    scope: 'Roof height, access, weather, material condition and the water path affect the investigation and repair scope. Include previous repair records so we can review what has changed.',
  },
};
