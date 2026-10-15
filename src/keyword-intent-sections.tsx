import React from 'react';
import { BOOKING_POLICY, INTENT_TOPICS, EXTRA_INTENT_TOPICS } from './keyword-intent-content.js';
const topics = [...INTENT_TOPICS, ...EXTRA_INTENT_TOPICS];
export function OperatingHours({ headingLevel = 2 }: { headingLevel?: 2 | 3 } = {}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <section className="contentGuidance operatingHours"><Heading>Working hours and urgent enquiries</Heading><p>Normal working hours: <strong>{BOOKING_POLICY.hours}, {BOOKING_POLICY.days}</strong>. {BOOKING_POLICY.afterHours} We confirm appointment timing and safe access separately.</p><p><a href="tel:0405878406">Call Ellis on 0405878406</a> for an urgent enquiry, or read about <a href="/services/emergency-roof-repairs">emergency and urgent roof repairs</a>.</p></section>;
}
export function IntentServiceContent({ slug, headingLevel = 2, placement = 'all' }: { slug: string; headingLevel?: 2 | 3; placement?: 'all' | 'work' | 'booking' }) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const bookingGroups = new Set(['Costs', 'Property access', 'Timing']);
  const selected = topics.filter(item => item.slug === slug && (placement === 'all' || (placement === 'booking' ? bookingGroups.has(item.group) : !bookingGroups.has(item.group))));
  return <>{selected.map(item => <section className="contentGuidance" key={item.id} data-topic={item.id}><Heading>{item.heading}</Heading><p>{item.body}</p>{item.links.map(link => <p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</section>)}{slug === 'roof-inspections' && placement !== 'work' && <section className="contentGuidance"><Heading>Remote owners, property managers and two-storey properties</Heading><p>We support two-storey inspections, remote landlord coordination and property manager access arrangements. Provide the property address, storeys, nominated access contact and who will review the repair quote. Agree any photos and written findings in the inspection scope before booking.</p><p><a href="/services/rental-property-roof-repairs">Roof inspections and repairs for rental owners and property managers</a>.</p></section>}{slug === 'home' && <section className="contentGuidance"><Heading>Roof repairs for your situation</Heading><p>For a ceiling stain after rain, an intermittent leak or previous patching that has not resolved water entry, start with <a href="/services/roof-leak-repairs">roof leak investigation</a>. For a few broken tiles, use <a href="/services/tile-roof-repairs">small tile roof repairs</a>. Remote owners can arrange <a href="/services/rental-property-roof-repairs">rental and property manager roof repairs</a>.</p></section>}</>;
}
export function IntentFaqs({ slug }: { slug?: string }) {
  const selected = slug ? topics.filter(item => item.slug === slug) : topics;
  return <>{selected.map(item => <details key={item.id} data-question={item.id}><summary>{item.question}</summary><p>{item.answer}</p>{item.links.map(link => <p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</details>)}</>;
}
export function IntentFaqDirectory() {
  const groups = [...new Set(topics.map(item => item.group))];
  return <section className="contentGuidance intentFaqDirectory"><h2>More answers by repair concern</h2><p>These questions connect the symptom or decision to the relevant roof service and preparation guide.</p>{groups.map(group => <section key={group}><h3>{group}</h3>{topics.filter(item => item.group === group).map(item => <details key={item.id} data-question={item.id}><summary>{item.question}</summary><p>{item.answer}</p>{item.links.map(link => <p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</details>)}</section>)}</section>;
}
