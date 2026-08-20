# Redesign App to Match Reference Image

The goal is to rebuild the application UI and functionality to match the shared reference image (Signature Hound-like interface), focusing on a clean vertical navigation, split-screen editor, and consistent "Kinetic Realestate" branding.

## User-facing changes
- **Vertical Navigation Rail**: Replace the horizontal/sidebar hybrid with a clean vertical icon rail for "Templates", "Personal Info", "Business Info", "Design", "Call to Action", "Disclaimer", and "Analytics".
- **Split-Screen Editor**:
    - **Left Sidebar**: Independent scrolling pane for template selection and form inputs.
    - **Right Preview**: Sticky live-rendered email signature preview showing exactly how the signature looks in a "To: Recipient" context.
- **Improved Template Gallery**: A vertical list of signature layouts with selection toggles.
- **Enhanced Signature Customization**: Detailed sections for uploading logos, setting brand colors, and adding call-to-action buttons.

## Technical details
- **New Layout Component**: Create a `EditorLayout` that manages the vertical rail and the split-screen view.
- **Route Restoration**: Recreate `src/routes/app.index.tsx` (or a redirect to a specific editor step) and ensure proper navigation between sections.
- **Shared State**: Ensure the existing `SignatureData` structure from `src/lib/signature-store.ts` supports all new fields seen in the reference (e.g., specific CTA types).
- **Template Packs**: While only `al-riyady` was kept recently, the reference shows a variety of "Base Templates" (Single Column, Two Column, Vertical). I will ensure these variations are available within the new UI.
- **Admin & Settings**: Maintain the existing Admin and Settings functionality within the new layout framework.

## Verification plan
- **Visual Check**: Open the preview and verify the vertical navigation rail matches the reference image's icons and layout.
- **Interaction Check**: Click through each tab (Personal Info, Design, etc.) and confirm the left sidebar updates while the signature preview remains visible.
- **State Check**: Modify a field (e.g., name) and confirm it reflects instantly in the right-side preview.
- **Responsive Check**: Ensure the layout remains usable on smaller screens (collapsing the sidebar if necessary).
