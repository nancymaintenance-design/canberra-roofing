// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

import { ContactForm } from '../src/contact-form.jsx';
import { ContactApiError } from '../src/contact-api.js';

afterEach(cleanup);

const area = 'Belconnen — Belconnen';
const service = 'Roof Leak Repairs';

function renderForm(submitEnquiry = vi.fn().mockResolvedValue({ ok: true })) {
  return { submitEnquiry, ...render(<ContactForm submitEnquiry={submitEnquiry} defaultArea={area} defaultService={service} />) };
}

function completeValidForm() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ellis Example' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ellis@example.com' } });
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '0400 000 000' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Please arrange an inspection.' } });
  fireEvent.click(screen.getByLabelText(/I agree that Canberraroofkind/));
}

describe('ContactForm', () => {
  it('renders the approved English custom photo control and hidden honeypot', () => {
    renderForm();
    expect(screen.getByText('Optional photo')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Choose photo' })).toBeTruthy();
    expect(screen.getByText('No photo selected')).toBeTruthy();
    expect(screen.getByText('JPG, PNG or WebP. Maximum 4 MB.')).toBeTruthy();
    expect(screen.getByText('I agree that Canberraroofkind may send the details and optional photo I provide to elliservices.group@gmail.com to respond to my enquiry.')).toBeTruthy();
    const photo = screen.getByLabelText('Optional photo');
    expect(photo.getAttribute('accept')).toContain('.jpg,.jpeg,.png,.webp');
    expect(screen.queryByLabelText('Website')).toBeNull();
    const honeypot = document.querySelector('input[name="website"]');
    expect(honeypot.tabIndex).toBe(-1);
    expect(honeypot.autocomplete).toBe('off');
    expect(honeypot.getAttribute('aria-hidden')).toBe('true');
  });

  it('focuses the first client validation error without submitting', async () => {
    const { submitEnquiry } = renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: /^Name/ }));
    expect(screen.getByText('Enter your name.')).toBeTruthy();
    expect(submitEnquiry).not.toHaveBeenCalled();
  });

  it('uses the live privacy-consent error in the rendered form', () => {
    const { submitEnquiry } = renderForm();
    completeValidForm();
    fireEvent.click(screen.getByLabelText(/I agree that Canberraroofkind/));
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(screen.getByText('Agree to the privacy notice to continue.')).toBeTruthy();
    expect(screen.queryByText('Acknowledge the local demonstration notice to continue.')).toBeNull();
    expect(submitEnquiry).not.toHaveBeenCalled();
  });

  it('latches same-tick deferred duplicate submits before React pending state commits', async () => {
    let resolveSubmission;
    const submitEnquiry = vi.fn(() => new Promise((resolve) => { resolveSubmission = resolve; }));
    renderForm(submitEnquiry);
    completeValidForm();
    const form = screen.getByRole('button', { name: 'Send enquiry' }).form;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(submitEnquiry).toHaveBeenCalledTimes(1);
    resolveSubmission({ ok: true });
    await screen.findByText('Enquiry sent successfully.');
  });

  it('prevents duplicate submission and retains fields and photo after a safe server error', async () => {
    let rejectSubmission;
    const submitEnquiry = vi.fn(() => new Promise((_, reject) => { rejectSubmission = reject; }));
    renderForm(submitEnquiry);
    completeValidForm();
    const photo = new File(['roof'], 'roof.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Optional photo'), { target: { files: [photo] } });
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sending enquiry...' }));
    expect(submitEnquiry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Sending enquiry...' }).disabled).toBe(true);
    rejectSubmission(new ContactApiError({ status: 400, code: 'VALIDATION_ERROR', fieldErrors: { message: 'Server message error.' }, message: 'Check the highlighted fields and try again.' }));
    await screen.findByText('Check the highlighted fields and try again.');
    expect(screen.getByText('Server message error.')).toBeTruthy();
    expect(screen.getByLabelText('Name').value).toBe('Ellis Example');
    expect(screen.getByText('roof.jpg')).toBeTruthy();
  });

  it('resets only after adapter success', async () => {
    const { submitEnquiry } = renderForm();
    completeValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    await screen.findByText('Enquiry sent successfully.');
    expect(submitEnquiry).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Name').value).toBe('');
    expect(screen.getByLabelText('Email').value).toBe('');
  });
});
