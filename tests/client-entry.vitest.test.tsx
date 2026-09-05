// @vitest-environment jsdom
import { act } from 'react';
import { expect, it, vi } from 'vitest';

it('the development placeholder mounts the page without trying to hydrate a comment', async () => {
  document.body.innerHTML = '<div id="root"><!--app-html--></div>';
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  await act(async () => { await import('../src/entry-client'); });
  expect(document.querySelectorAll('main h1')).toHaveLength(1);
  expect(errors.mock.calls.filter((call) => /hydrat|#418/i.test(call.map(String).join(' ')))).toHaveLength(0);
}, 30000);
