# Plan: Split-Screen Editor Overhaul

Rebuild the editor to match the "Signature Hound" reference, featuring a vertical navigation rail and a split-screen workspace with a scrollable form sidebar and a sticky live preview.

## Proposed Changes

### Editor Infrastructure
- Update `src/routes/app.tsx` to include the vertical navigation rail with icons for:
    - Templates
    - Personal Info
    - Business Info
    - Design
    - CTA
    - Disclaimer
    - Analytics
- Refactor `src/routes/app.editor.$id.tsx` to act as the main layout container for the split-screen view.

### Workspace & Forms
- Create a unified `EditorSidebar` component that dynamically renders form sections based on the active rail selection.
- Integrate `SignatureForm.tsx` logic into the sidebar, splitting it into modular sections (Personal, Business, etc.).
- Implement a sticky `SignaturePreview` component in the main area that maintains position while the sidebar scrolls.

### User Experience
- Add a progress indicator for signature completion.
- Ensure all styling tokens (colors, fonts, sizes) update the preview in real-time.
- Standardize UI elements (toggles, inputs) to match the Sign Vel brand aesthetic.

## Technical Details
- Use TanStack Router's nested routes and `params` to manage active editor sections.
- Leverage the existing `signature-store.ts` for real-time persistence and undo/redo state.
- Use `data-sig-*` attribute injection in `templates.tsx` for granular CSS control.
