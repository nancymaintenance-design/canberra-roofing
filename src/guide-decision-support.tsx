import React from 'react';

const comparisons: Record<string, { caption: string; headers: string[]; rows: string[][] }> = {
  'roof-repair-vs-restoration-vs-replacement-canberra': {
    caption: 'Roof repair, restoration and replacement: compare the purpose and scope',
    headers: ['Option', 'Purpose and scope', 'When to discuss it', 'Confirm before approval'],
    rows: [
      ['Repair', 'Address an identified defect in a particular roof area or component.', 'A damaged tile, flashing junction or other local concern.', 'The cause, affected components and any connected work.'],
      ['Restoration / renovation', 'A broader agreed programme of repairs, preparation and suitable finish work.', 'Several areas need attention or you want to discuss overall roof condition.', 'Which repairs are needed before cleaning or finish work; material suitability and exclusions.'],
      ['Replacement', 'Remove and replace the roof covering within a separately defined scope.', 'Ask about this option when an assessment raises concerns about the suitability of repair.', 'We provide roof replacement in Canberra. The assessment and written quote identify the roof areas, materials, connected work and exclusions for your property.'],
    ],
  },
  'rebedding-vs-repointing-canberra-roofs': {
    caption: 'Bedding and pointing: which part of a ridge repair is involved?',
    headers: ['Concern to assess', 'Work to discuss', 'What still needs checking'],
    rows: [
      ['Supporting bedding', 'Rebedding: address the material supporting affected ridge or hip caps.', 'The stability of the caps and bedding; affected roof lines and adjoining tiles.'],
      ['External pointing', 'Repointing: renew the external finish along affected cap edges.', 'Whether the supporting bedding is sound and which preparation is included.'],
      ['Both layers', 'A combined scope where both bedding and pointing need attention.', 'Which sections require each operation. Surface cracking alone cannot establish this.'],
    ],
  },
  'roof-repair-cost-canberra': {
    caption: 'Compare roof repair quotes by the work included',
    headers: ['Quote item', 'What to compare', 'Question to ask'],
    rows: [
      ['Assessment', 'The purpose of the visit and any separate inspection fee.', 'What findings and written information are included?'],
      ['Roof work', 'Named roof areas, components, materials and preparation.', 'Do both quotes address the same finding and connected work?'],
      ['Access and timing', 'Storeys, access arrangements and any urgent-service fee.', 'What access is required and which additional charges apply?'],
      ['Completion and exclusions', 'Agreed debris clearing, completion checks and excluded work.', 'What remains outside the quoted repair?'],
    ],
  },
};

export function GuideDecisionSupport({ slug }: { slug: string }) {
  const comparison = comparisons[slug];
  if (!comparison) return null;
  return <>
    <section className="guideComparison"><h2>Compare the work before deciding</h2>
      <div className="contentTableScroll" tabIndex={0} role="region" aria-label={comparison.caption}>
        <table><caption>{comparison.caption}</caption><thead><tr>{comparison.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead>
          <tbody>{comparison.rows.map(([label, ...cells]) => <tr key={label}><th scope="row">{label}</th>{cells.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p>An on-site assessment determines the suitable scope. Cleaning or a new finish does not replace investigating water entry.</p>
    </section>
    <section className="quoteChecklist"><h2>Request a quote: details to include and confirm</h2><ul>
      <li>Your suburb, roof material if known, visible concern, timing and previous repair records.</li>
      <li>Property storeys, safe access, and the owner or manager coordinating the visit. Photos taken safely from the ground are optional.</li>
      <li>Inspection scope and any fee; the specific roof areas, components, materials and preparation in the repair quote.</li>
      <li>Agreed debris clearing and completion checks.</li>
      <li>Exclusions, further investigation and how any additional work will be agreed.</li>
      <li>Appointment timing: normal hours are 9:00 am–9:00 pm, seven days. Outside normal hours, an additional urgent-service fee is quoted on site.</li>
    </ul><p><a href="/contact">Send the property details and request an assessment and written quote</a>.</p></section>
  </>;
}
