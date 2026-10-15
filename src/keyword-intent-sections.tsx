import React from 'react';
import { BOOKING_POLICY, INTENT_TOPICS, EXTRA_INTENT_TOPICS } from './keyword-intent-content.js';
const topics = [...INTENT_TOPICS, ...EXTRA_INTENT_TOPICS];
export function OperatingHours({ headingLevel = 2 }: { headingLevel?: 2 | 3 } = {}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <section className="contentGuidance operatingHours"><Heading>Working hours and urgent enquiries</Heading><p>Normal working hours: <strong>{BOOKING_POLICY.hours}, {BOOKING_POLICY.days}</strong>. {BOOKING_POLICY.afterHours} We confirm appointment timing and safe access separately.</p><p><a href="tel:+611300838722">Call Ellis on 0405878406</a> for an urgent enquiry, or read about <a href="/services/emergency-roof-repairs">emergency and urgent roof repairs</a>.</p></section>;
}
export function IntentServiceContent({ slug, headingLevel = 2, placement = 'all' }: { slug: string; headingLevel?: 2 | 3; placement?: 'all' | 'work' | 'booking' }) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  // Service education has one complete answer in IntentFaqs. Home/contact keep
  // their contextual introductions; service details belong to the five chapters.
  const selected = topics.filter(item => item.slug === slug && (slug === 'home' || slug === 'contact'));
  return <>{selected.map(item => <section className="contentGuidance" key={item.id} data-topic={item.id}><Heading>{item.heading}</Heading><p>{item.body}</p>{item.links.map(link => <p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</section>)}{slug === 'home' && <section className="contentGuidance"><Heading>Roof repairs for your situation</Heading><p>For a ceiling stain after rain, an intermittent leak or previous patching that has not resolved water entry, start with <a href="/services/roof-leak-repairs">roof leak investigation</a>. For a few broken tiles, use <a href="/services/tile-roof-repairs">small tile roof repairs</a>. Remote owners can arrange <a href="/services/rental-property-roof-repairs">rental and property manager roof repairs</a>.</p></section>}</>;
}
export function IntentFaqs({ slug }: { slug?: string }) {
  const selected = slug ? topics.filter(item => item.slug === slug) : topics;
  return <>{selected.map(item => <details key={item.id} data-question={item.id} data-intent={item.intent}><summary>{item.question}</summary><p>{item.answer}</p>{item.links.map(link => <p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</details>)}</>;
}
export function IntentFaqDirectory() {
  const groups = [...new Set(topics.map(item => item.group))];
  return <section className="contentGuidance intentFaqDirectory"><h2>More answers by repair concern</h2><p>These questions connect the symptom or decision to the relevant roof service and preparation guide.</p>{groups.map(group => <section key={group}><h3>{group}</h3>{topics.filter(item => item.group === group).map(item => <details key={item.id} data-question={item.id}><summary>{item.question}</summary><p>{item.answer}</p>{item.links.map(link => <p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</details>)}</section>)}</section>;
}
