// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

import { trackSuccessfulEnquiry } from '../src/analytics.js';
import { ContactForm } from '../src/contact-form.jsx';

afterEach(cleanup);

function completeValidForm() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Synthetic tester' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'synthetic@example.test' } });
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '0400 000 000' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Synthetic test message.' } });
  fireEvent.click(screen.getByLabelText(/I agree that Ellis Services Group/));
}

describe('successful enquiry analytics', () => {
  it('records only the declared form name on the live canonical hostname', () => {
    const gtag = vi.fn();
    const result = trackSuccessfulEnquiry('suburb_roof_enquiry', {
      location: { hostname: 'www.canberraroofkind.com.au' },
      gtag,
    });

    expect(result).toBe(true);
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'generate_lead', {
      form_name: 'suburb_roof_enquiry',
    });
  });

  it('does not send analytics from localhost or preview hosts', () => {
    for (const hostname of ['localhost', '127.0.0.1', 'canberra-roofing-git-test.vercel.app']) {
      const gtag = vi.fn();
      expect(trackSuccessfulEnquiry('roof_enquiry', { location: { hostname }, gtag })).toBe(false);
      expect(gtag).not.toHaveBeenCalled();
    }
  });

  it('emits one non-PII lead event after the form adapter succeeds', async () => {
    const onSuccessfulEnquiry = vi.fn();
    render(<ContactForm submitEnquiry={vi.fn().mockResolvedValue({ ok: true })} onSuccessfulEnquiry={onSuccessfulEnquiry} analyticsFormName="news_roof_enquiry" defaultArea="Belconnen — Belconnen" defaultService="Roof Leak Repairs" />);
    completeValidForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Request a roof assessment' }));
    });

    expect(onSuccessfulEnquiry).toHaveBeenCalledExactlyOnceWith('news_roof_enquiry');
    expect(JSON.stringify(onSuccessfulEnquiry.mock.calls)).not.toContain('synthetic@example.test');
    expect(JSON.stringify(onSuccessfulEnquiry.mock.calls)).not.toContain('Synthetic test message.');
  });

  it('does not emit a lead after an unsuccessful form adapter result', async () => {
    const onSuccessfulEnquiry = vi.fn();
    render(<ContactForm submitEnquiry={vi.fn().mockRejectedValue(new Error('Not delivered'))} onSuccessfulEnquiry={onSuccessfulEnquiry} defaultArea="Belconnen — Belconnen" defaultService="Roof Leak Repairs" />);
    completeValidForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Request a roof assessment' }));
    });

    expect(onSuccessfulEnquiry).not.toHaveBeenCalled();
  });

  it('keeps a delivered enquiry successful if analytics is unavailable', async () => {
    const onSuccessfulEnquiry = vi.fn(() => { throw new Error('analytics unavailable'); });
    render(<ContactForm submitEnquiry={vi.fn().mockResolvedValue({ ok: true })} onSuccessfulEnquiry={onSuccessfulEnquiry} defaultArea="Belconnen — Belconnen" defaultService="Roof Leak Repairs" />);
    completeValidForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Request a roof assessment' }));
    });

    expect(await screen.findByText('Enquiry sent successfully.')).toBeTruthy();
  });
});
