---
name: LaborTrack
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#434655'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#747686'
  outline-variant: '#c3c5d7'
  surface-tint: '#1451de'
  primary: '#0036a4'
  on-primary: '#ffffff'
  primary-container: '#024ad8'
  on-primary-container: '#c2ceff'
  inverse-primary: '#b6c4ff'
  secondary: '#914d00'
  on-secondary: '#ffffff'
  secondary-container: '#fd942e'
  on-secondary-container: '#663400'
  tertiary: '#004c28'
  on-tertiary: '#ffffff'
  tertiary-container: '#006638'
  on-tertiary-container: '#82e3a3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164f'
  on-primary-fixed-variant: '#003bb0'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77e'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#95f7b5'
  tertiary-fixed-dim: '#79da9b'
  on-tertiary-fixed: '#00210e'
  on-tertiary-fixed-variant: '#00522c'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  primary-bright: '#296ef9'
  primary-deep: '#0e3191'
  primary-soft: '#c9e0fc'
  accent-deep: '#e0672a'
  accent-bright: '#ff9d2e'
  accent-soft: '#fff1e4'
  sunset-yellow: '#ffc247'
  canvas: '#ffffff'
  cloud: '#f7f7f7'
  fog: '#e8e8e8'
  steel: '#c2c2c2'
  ink-soft: '#292929'
  charcoal: '#3d3d3d'
  graphite: '#636363'
  danger: '#b3262b'
  orange-wash: '#fff6ec'
typography:
  display-xl:
    fontFamily: Manrope
    fontSize: 56px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Manrope
    fontSize: 44px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.01em
  display-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 32px
  display-sm:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 28px
  display-xs:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 20px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 22px
  body-emphasis:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
  caption-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 21px
  caption-bold:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
  button-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.7px
  label-xs:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  section-desktop: 80px
  section-mobile: 48px
  gutter: 24px
---

## Brand & Style

The design system is an enterprise-grade framework tailored for high-density administrative and construction management workflows. It draws heavily from the **Corporate / Modern** aesthetic, prioritizing structural integrity, clarity, and industrial precision. The brand personality is professional and robust, evoking the reliability of a high-end enterprise catalog.

The visual language balances a sterile "white canvas" workspace with high-energy operational accents. By utilizing a rigorous grid and geometric proportions, the system achieves a sense of technological sophistication (inspired by HP Enterprise) while maintaining a "construction site" urgency through its specific use of color and sharp geometry.

## Colors

The palette is strictly categorized into functional roles to facilitate rapid information processing in complex ERP environments.

- **Primary (Blue):** Represents "System & Action." Used for primary CTAs, active states, and navigational markers.
- **Secondary (Orange):** Represents "Operational Attention." Reserved for alerts, pending tasks, and high-visibility status markers.
- **Tertiary (Green):** Dedicated to "Success & Validation." Used for approved states and positive attendance records.
- **Neutral:** A range of grays from `ink` to `cloud` provides the structural "white canvas" and differentiates content hierarchy.

A signature **Sunset Stripe** gradient (`accent-deep` to `sunset-yellow`) is used sparingly for featured cards and authentication screens to provide a unique brand signature without distracting from data-heavy views.

## Typography

This design system uses **Manrope** as its typographic foundation to achieve a geometric, modern, and highly legible look. The type hierarchy is engineered for high-density layouts:

- **Titles:** Use a medium weight (500) rather than bold to maintain a clean, professional aesthetic even at large sizes.
- **Functional Text:** Buttons and labels utilize uppercase styling and increased letter spacing (0.7px) to differentiate interactive elements from static data.
- **Hierarchy:** High-density tables should default to `caption-md` or `body-md` to maximize information density without sacrificing readability.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop with a maximum content width of 1366px, ensuring data tables and ERP modules remain readable on wide monitors.

- **Grid:** A 12-column grid with 24px gutters is standard.
- **Rhythm:** An 8px base unit drives all spacing. For tight administrative controls, 4px half-steps are permitted.
- **Density:** Table cell padding is optimized at 12px vertical and 16px horizontal to balance scanability with high data volume.
- **Responsive Behavior:** On mobile, margins reduce to 16px and section spacing scales down to 48px. Large display typography should downscale to the next available level (e.g., `display-md` becomes `display-sm`).

## Elevation & Depth

Visual hierarchy is primarily achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows, preserving the flat, professional canvas.

- **Level 0 (Flat):** Used for the main `canvas` background.
- **Level 1 (Hairline):** 1px solid borders in `fog` or `steel` define most interactive inputs, table rows, and secondary containers.
- **Level 2 (Soft Lift):** A subtle, diffused shadow is used only for KPI cards and dashboard modules to provide a gentle lift from the canvas.
- **Level 3 (Floating):** Reserved for overlays such as modals and drawers, using a more pronounced but low-opacity shadow to indicate depth.

## Shapes

The shape language is functional and disciplined, utilizing different radii to signal element purpose:

- **Sharp/Low Radius (4px):** Applied to primary interactive elements like **buttons, input fields, and select menus**. This maintains the "professional/industrial" look.
- **Medium Radius (8px):** Used for tabs and secondary badges.
- **Container Radius (16px):** Used for large structural panels, cards, and modals to soften the overall interface and make the software feel more approachable.
- **Pill-Shape:** Reserved exclusively for status chips and filter tags. **Never** use pill shapes for action buttons.

## Components

### Buttons & Inputs
- **Primary Buttons:** Rectangular with a 4px radius. Use `primary` blue with `on-primary` white text. 
- **Action Hierarchy:** Primary actions use uppercase text with 0.7px tracking. Secondary buttons use 1px `steel` borders.
- **Inputs:** 1px `steel` border, 4px radius. Use `cloud` background for disabled states.

### Status Indicators
- **Accent Rail:** A 4px vertical orange line on the far-left edge of a card or alert to denote "pending" or "attention required."
- **Badges:** Use `*-soft` backgrounds with high-contrast text for status labels (e.g., `success-soft` background with `success` text).

### Cards & Tables
- **Standard Cards:** 16px radius, Level 2 shadow or Level 1 hairline border.
- **Tables:** No outer border; use 1px `fog` horizontal dividers only. Header text uses `display-xs` or `caption-bold` in `graphite`.

### Specialized UI
- **Chevron Slashing:** Use `primary` blue parallelogram motifs in header banners to reinforce the "Precision" brand identity.
- **QR Panels:** Mobile-first scanners feature a 4px `primary` border with custom `accent` corner brackets to draw focus.