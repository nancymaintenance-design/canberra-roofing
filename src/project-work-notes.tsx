import React from 'react';

// Owner-confirmed context: reports/project-photos-local-2026-10-12/真实案例照片更新.md.
// Describe the reported work only; photos do not establish long-term results.
const notes: Record<string, { context: string; work: string; service: string }> = {
  'emergency-roof-repairs': { context: 'An urgent roof leak.', work: 'Attended the property and addressed the roof water-entry problem. The collage records site condition and work stages.', service: 'Emergency & Urgent Roof Repairs' },
  'rental-property-roof-repairs': { context: 'Property roof maintenance around rooftop equipment and cracking in the roof area.', work: 'Inspected the supporting layer beneath rooftop equipment and repaired cracking in the roof area.', service: 'Rental & Property Manager Roof Repairs' },
  'gutter-downpipe-maintenance': { context: 'Accumulated debris in a property roof drainage channel.', work: 'Cleared debris from the drainage channel. The photographs show the build-up and cleared channel.', service: 'Gutter & Downpipe Cleaning and Maintenance' },
};
export function ProjectWorkNotes({ slug }: { slug: string }) {
  const note = notes[slug === 'gutter-repairs' ? 'gutter-downpipe-maintenance' : slug];
  if (!note) return null;
  return <div><dl className="projectWorkNotes"><dt>Roof concern</dt><dd>{note.context}</dd><dt>Work carried out</dt><dd>{note.work}</dd></dl><p><a href={`/contact?service=${encodeURIComponent(note.service)}`}>Discuss a similar concern at your property</a>. Include your suburb and what you can observe safely; the assessment determines your own repair scope.</p></div>;
}
