# Rollback procedure

Use this order after a confirmed release issue. Do not expose secrets or customer details in notes.

1. block POST.
2. show tested no-form fallback or promote the last safe deployment.
3. remove retired Preview/Production SMTP variables without displaying values.
4. verify form/SMTP inactive.
5. preserve redacted logs only.
6. restore captured DNS if cut over.
7. rotate Gmail App Password if exposure is suspected.

Never restore the old local-storage enquiry form.
