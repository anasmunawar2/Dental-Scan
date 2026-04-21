# DentalScan.us — Audit Notes

## What it does

Patients get an SMS link, take 5 photos of their teeth (front, left, right, upper, lower), and the system flags issues and fills out an insurance claim. The idea is solid. The execution has some rough edges.

---

## UX issues

The "Live Demo" button on the homepage takes you to a login modal. There's no way to actually try the scan flow without signing up first which is a problem when the product's whole pitch depends on how smooth that flow feels.

The five scan angles are shown as small thumbnails in the marketing section, but nowhere does it explain _how_ to take them. Upper and lower shots especially you're basically pointing a phone into your own mouth while staring at the ceiling. Without any on-screen framing guide, patients will fumble this.

There's also a small but embarrassing issue in the footer: the email address shown (`support@dentalscan.us`) links to a different address (`hello@dentalscan.us`), and the phone number display doesn't match the actual `tel:` link. For a product that keeps mentioning HIPAA compliance, that kind of sloppiness sticks out.

---

## Camera stability on mobile

This is the hard part. Upper and lower shots are essentially blind the user can't see the screen and the camera at the same time. Poor bathroom lighting, phone wobble, and saliva all work against a clean image.

The bigger technical risk: when a patient opens the SMS link on Android, the camera often launches inside a WebView rather than the native browser. On certain Samsung and Xiaomi devices, rear-camera access via `facingMode: environment` can silently fail in that context. No error, no warning just a broken core feature.

A simple blur-detection check before upload, plus a framing overlay for each angle, would fix most of this.
