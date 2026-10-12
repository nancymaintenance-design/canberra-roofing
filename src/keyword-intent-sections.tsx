import React from 'react';
import { BOOKING_POLICY, INTENT_TOPICS, EXTRA_INTENT_TOPICS } from './keyword-intent-content.js';
const topics = [...INTENT_TOPICS, ...EXTRA_INTENT_TOPICS];
export function OperatingHours() {
  return <section className="contentGuidance operatingHours"><h2>Working hours and urgent enquiries</h2><p>Normal working hours: <strong>{BOOKING_POLICY.hours}, {BOOKING_POLICY.days}</strong>. {BOOKING_POLICY.afterHours} We confirm appointment timing and safe access separately.</p><p><a href="tel:0405878406">Call Ellis on 0405878406</a> for an urgent enquiry, or read about <a href="/services/emergency-roof-repairs">emergency and urgent roof repairs in Canberra</a>.</p></section>;
}
export function IntentServiceContent({ slug }: { slug: string }) {
  return <>{topics.filter(item => item.slug === slug).map(item => <section className="contentGuidance" key={item.id} data-topic={item.id}><h2>{item.heading}</h2><p>{item.body}</p>{item.links.map(link => <p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</section>)}{slug === 'roof-inspections' && <section className="contentGuidance"><h2>Remote owners, property managers and two-storey properties</h2><p>We support two-storey inspections, remote landlord coordination and property manager access arrangements. Provide the property address, storeys, nominated access contact and who will review the photos, written findings and repair quote.</p><p><a href="/services/rental-property-roof-repairs">Roof inspections and repairs for rental owners and property managers</a>.</p></section>}{slug === 'home' && <section className="contentGuidance"><h2>Roof repairs for your situation</h2><p>For a ceiling stain after rain, an intermittent leak or previous patching that has not resolved water entry, start with <a href="/services/roof-leak-repairs">roof leak investigation</a>. For a few broken tiles, use <a href="/services/tile-roof-repairs">small tile roof repairs</a>. Remote owners can arrange <a href="/services/rental-property-roof-repairs">rental and property manager roof repairs</a>.</p></section>}</>;
}
export function IntentFaqs({ slug }: { slug?: string }) {
  const selected = slug ? topics.filter(item => item.slug === slug) : topics;
  return <>{selected.map(item => <details key={item.id} data-question={item.id}><summary>{item.question}</summary><p>{item.answer}</p>{item.links.map(link => <p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</details>)}</>;
}
export function IntentFaqDirectory() {
  const groups = [...new Set(topics.map(item => item.group))];
  return <section className="contentGuidance intentFaqDirectory"><h2>More answers by repair concern</h2><p>These questions connect the symptom or decision to the relevant roof service and preparation guide.</p>{groups.map(group => <section key={group}><h3>{group}</h3>{topics.filter(item => item.group === group).map(item => <details key={item.id} data-question={item.id}><summary>{item.question}</summary><p>{item.answer}</p>{item.links.map(link => <p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</details>)}</section>)}</section>;
}
