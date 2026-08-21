# Plan: Overhaul Editor to Match "Signature Hound" UI

Rebuild the editor interface to exactly match the provided screenshot, featuring a light-themed, three-column layout (Rail, Sidebar, Sticky Preview) with granular form controls.

## Design Changes

- **Rail Navigation:**
  - Update `src/routes/app.tsx` and `RailItem` to use light mode styling (white background, soft beige/grey borders).
  - Use circular active indicators and refined icons/labels.
- **Sidebar Form UI:**
  - Standardize all editor sub-routes (`details`, `business`, `design`, etc.) to match the Signature Hound aesthetic.
  - Implement "Drag and drop" image upload areas with dash borders and "Crop into circle" toggles.
  - Use soft inputs with light background and subtle borders.
  - Group fields with clear, uppercase labels and horizontal dividers.
- **Preview Area:**
  - Refine the "Fake Email" header (To, Subject) with soft rounded inputs.
  - Ensure the signature preview is centered, sticky, and scales appropriately.
  - Add top-right utility buttons (Publish, Share, Install).
- **Branding & Colors:**
  - Use the project's primary purple/mint accents sparingly for focus states.
  - Adopt a "soft/minimalist" color palette: `#FDFCFB` (bg), `#EFEBE6` (border), `#9E958F` (text-muted), `#14121F` (text-bold).

## Technical Details

- **Layout Structure:**
  - `src/routes/app.editor.$id.tsx`: Main wrapper containing the sticky preview and the `<Outlet />` for the scrolling sidebar.
  - Modular sub-routes:
    - `...index.tsx`: Templates gallery.
    - `...details.tsx`: Personal info + Profile photo.
    - `...business.tsx`: Business info + Company logo.
    - `...design.tsx`: Palette, Font, Layout controls.
    - `...cta.tsx`: Call to Action button/link.
    - `...social.tsx`: Social icons list and style.
    - `...disclaimer.tsx`: Legal text.
- **Form Controls:**
  - Use `Switch` for toggles.
  - Add `Slider` for "Profile Picture Width".
  - Implement a `PhoneField` component that allows multiple phone numbers with labels (Main, Mobile, etc.) and add/remove actions.
- **Global Styles:**
  - Ensure `src/styles.css` includes `Instrument Serif` and `Rubik`.

## Security & Verification

- **Validation:** Use Playwright to verify that form updates in the sidebar immediately reflect in the sticky preview.
- **Data Persistence:** Verify `saveSignature` correctly syncs changes to Supabase.
