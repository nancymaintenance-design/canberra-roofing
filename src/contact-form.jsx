import React, { useRef, useState } from 'react';

import { sendContactEnquiry } from './contact-api.js';
import { AREA_OPTIONS, PHOTO_ACCEPT, SERVICE_TITLES } from './contact-options.js';
import { validateEnquiry } from './enquiry-validation.js';

const privacyCopy = 'I agree that Canberraroofkind may send the details and optional photo I provide to elliservices.group@gmail.com or nancy.maintenance@gmail.com to respond to my enquiry.';
const genericFailure = "We couldn't send your enquiry. Please try again or call 0405878406.";

export function ContactForm({ defaultArea = '', defaultService = '', submitEnquiry = sendContactEnquiry }) {
  const formRef = useRef(null);
  const photoRef = useRef(null);
  const submittingRef = useRef(false);
  const [photo, setPhoto] = useState();
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const error = (field) => errors[field] ? <span id={`${field}-error`} className="fieldError" role="alert">{errors[field]}</span> : null;

  function valuesFrom(form) {
    const data = new FormData(form);
    return {
      name: data.get('name'), email: data.get('email'), phone: data.get('phone'), address: data.get('address'),
      area: data.get('area'), service: data.get('service'), message: data.get('message'),
      privacy: form.elements.privacy.checked, photo,
    };
  }

  async function submit(event) {
    event.preventDefault();
    if (pending || submittingRef.current) return;
    const form = event.currentTarget;
    const nextErrors = validateEnquiry(valuesFrom(form));
    setErrors(nextErrors);
    setStatus('');
    const firstInvalid = ['name', 'email', 'phone', 'area', 'service', 'message', 'privacy', 'photo'].find((field) => nextErrors[field]);
    if (firstInvalid) {
      form.elements.namedItem(firstInvalid)?.focus();
      return;
    }
    submittingRef.current = true;
    setPending(true);
    try {
      await submitEnquiry(form);
      form.reset();
      setPhoto(undefined);
      setErrors({});
      setStatus('Enquiry sent successfully.');
    } catch (failure) {
      const fieldErrors = failure?.fieldErrors && typeof failure.fieldErrors === 'object' ? failure.fieldErrors : {};
      setErrors(fieldErrors);
      setStatus(typeof failure?.message === 'string' ? failure.message : genericFailure);
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  function removePhoto() {
    if (photoRef.current) photoRef.current.value = '';
    setPhoto(undefined);
    setErrors((current) => ({ ...current, photo: undefined }));
  }

  return <form ref={formRef} onSubmit={submit} noValidate>
    <div className="formGrid">
      <label>Name<input name="name" required autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />{error('name')}</label>
      <label>Email<input name="email" type="email" required autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />{error('email')}</label>
      <label>Phone<input name="phone" type="tel" required autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} />{error('phone')}</label>
      <label>Address for assessment <em>(optional)</em><input name="address" autoComplete="street-address" /></label>
      <label>Suburb / area<select name="area" defaultValue={defaultArea} required aria-invalid={Boolean(errors.area)} aria-describedby={errors.area ? 'area-error' : undefined}><option value="">Choose a Canberra suburb or area</option>{AREA_OPTIONS.map((area) => <option key={area} value={area}>{area}</option>)}</select>{error('area')}</label>
      <label>Service interest<select name="service" defaultValue={defaultService} required aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? 'service-error' : undefined}><option value="">Choose a service</option>{SERVICE_TITLES.map((service) => <option key={service} value={service}>{service}</option>)}</select>{error('service')}</label>
    </div>
    <label>Message<textarea className="resize-none" name="message" required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} />{error('message')}</label>
    <div className="photoField">
      <span>Optional photo</span>
      <div className="photoPicker">
        <input ref={photoRef} id="photo-upload" className="nativePhotoInput" name="photo" type="file" aria-label="Optional photo" accept={PHOTO_ACCEPT} aria-invalid={Boolean(errors.photo)} aria-describedby={errors.photo ? 'photo-error' : undefined} onChange={(event) => setPhoto(event.currentTarget.files?.[0])} />
        <button className="photoButton" type="button" onClick={() => photoRef.current?.click()}>Choose photo</button>
        <span className="photoName" aria-live="polite">{photo?.name || 'No photo selected'}</span>
        {photo && <button className="removePhoto" type="button" onClick={removePhoto}>Remove photo</button>}
      </div>
      <small>JPG, PNG or WebP. Maximum 4 MB.</small>
      {error('photo')}
    </div>
    <input className="honeypot" name="website" aria-hidden="true" tabIndex={-1} autoComplete="off" readOnly />
    <label className="check"><input name="privacy" type="checkbox" required aria-invalid={Boolean(errors.privacy)} aria-describedby={errors.privacy ? 'privacy-error' : undefined} /> {privacyCopy}</label>
    {error('privacy')}
    <button className="button" disabled={pending}>{pending ? 'Sending enquiry...' : 'Send enquiry'}</button>
    <p className="contactStatus" role="status" aria-live="polite">{status}</p>
  </form>;
}
