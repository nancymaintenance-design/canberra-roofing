// @vitest-environment jsdom
import React from 'react';
import { renderToString } from 'react-dom/server';
import { render, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ContactForm } from '../src/contact-form.jsx';
import { validateContactSubmission } from '../api/_lib/contact-validation.js';
afterEach(cleanup);

it('the static form cannot submit until the interactive handler is ready', () => {
  const container = document.createElement('div');
  container.innerHTML = renderToString(<ContactForm />);
  expect(container.querySelector('button.button').disabled).toBe(true);
});

it('a native form POST carries the checked consent value accepted by the existing API', async () => {
  const { container } = render(<ContactForm defaultArea="Belconnen — Belconnen" defaultService="Roof Leak Repairs" />);
  const form = container.querySelector('form');
  for (const [name, value] of Object.entries({ name: 'Synthetic QA', email: 'qa@example.test', phone: '0400000000', message: 'Synthetic native form validation only.' })) form.elements.namedItem(name).value = value;
  form.elements.namedItem('privacy').checked = true;
  const entries = [...new FormData(form)].filter(([name]) => name !== 'photo');
  const result = await validateContactSubmission({ fields: Object.fromEntries(entries), fieldEntries: entries, files: [] });
  expect(result.ok, JSON.stringify(result.fieldErrors)).toBe(true);
});
