# Plan - Redesign App to Match Reference Image

Rebuilding the application UI to match the "Signature Hound" style reference image, featuring a vertical icon rail and a split-screen editor layout.

## User Review Required

> [!IMPORTANT]
> The app navigation has been updated to a vertical icon rail. I am now rebuilding the editor workspace to support the split-screen layout with a sticky preview.

## Proposed Changes

### App Shell & Navigation
- [x] Implement a vertical navigation rail (88px wide) with icons for Templates, Personal Info, Business Info, Design, CTA, Disclaimer, and Analytics.
- [x] Add active state indicators (orange left border and colored icons).
- [x] Ensure navigation persists the current signature ID context.

### Dashboard
- [x] Restore a clean, grid-based dashboard for managing existing signatures.
- [x] Add a "Create New Signature" workflow that redirects to the editor.

### Editor Workspace
- [ ] Implement a split-screen layout:
    - **Left Sidebar (420px):** Independent scrolling panel for form inputs and settings.
    - **Right Preview:** Sticky white area showing the signature inside a "fake" email client shell.
- [ ] Group editor settings into the tabs defined in the rail (Personal, Business, Design, etc.).
- [ ] Restore all signature templates for wider variety.

## Technical Details

- **Navigation:** Using TanStack Router `Link` with `activeOptions` and a custom `RailItem` component.
- **State Management:** Preserving signature ID via route parameters to allow seamless switching between "Personal Info", "Design", etc., while editing the same signature.
- **Styling:** Using Tailwind CSS for the 88px/420px/flexible layout with sticky positioning for the preview.
- **Typography:** Standardizing on `Inter Tight` for the interface to match the modern, architectural aesthetic.
