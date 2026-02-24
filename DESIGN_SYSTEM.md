# 🎨 Design System - Provincia Real Dashboard

**Version:** 1.0 (Foundation)
**Created by:** Uma (UX-Design Expert)
**Date:** 2026-02-24
**Status:** 🟢 Active - Ready for Implementation
**Audience:** Designers, Developers, Product Team

---

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design Tokens](#design-tokens)
3. [Atomic Design Structure](#atomic-design-structure)
4. [Components Library](#components-library)
5. [Layout System](#layout-system)
6. [Responsive Design](#responsive-design)
7. [Animation & Micro-interactions](#animation--micro-interactions)
8. [Accessibility](#accessibility)
9. [Dark Mode](#dark-mode)
10. [Implementation Guide](#implementation-guide)

---

## Design Philosophy

### Visual Aesthetic: "Futuristic Business"

We're creating a design language that feels:
- **Modern:** Glassmorphism, gradients, subtle depth
- **Trustworthy:** Clear hierarchy, professional colors
- **Intuitive:** Minimal cognitive load, obvious affordances
- **Delightful:** Smooth animations, satisfying feedback

### Core Principles

1. **Decision-Support First** 🎯
   - Every element serves decision-making
   - Highlight actionable metrics
   - Remove friction from analysis

2. **Data-Driven Design** 📊
   - Visual encoding supports quick scanning
   - Color psychology applied intentionally
   - Space usage reflects information importance

3. **Accessibility Always** ♿
   - WCAG AA minimum (target AAA)
   - Color + other indicators (not color alone)
   - Keyboard navigation first

4. **System Thinking** 🔧
   - Atomic Design approach
   - Design tokens (no hardcoded values)
   - Reusable components

5. **Performance Conscious** ⚡
   - Animations that delight, not distract
   - CSS-based (not JavaScript) for transitions
   - Optimized rendering

---

## Design Tokens

### 1. Color Palette

#### Primary Colors (Decision-Making)
```
BLUE (Primary Action & Information)
  50:   #EFF6FF   - Lightest background
  100:  #DBE9FF   - Light backgrounds
  500:  #3B82F6   - Primary button, links
  600:  #2563EB   - Hover state
  700:  #1D4ED8   - Active state
  900:  #0C2340   - Text on light bg
  Dark: #93C5FD   - Text on dark bg

GREEN / EMERALD (Positive, Growth, Success)
  50:   #F0FDF4   - Light positive bg
  500:  #10B981   - ROAS ≥ 3x, ROI > 30%, +trend
  600:  #059669   - Hover
  700:  #047857   - Active
  Dark: #6EE7B7   - Dark mode text

AMBER (Caution, Watch This)
  50:   #FFFBEB   - Light warning bg
  500:  #F59E0B   - ROAS 1-3x, ROI 0-30%, ~trend
  600:  #D97706   - Hover
  700:  #B45309   - Active
  Dark: #FCD34D   - Dark mode text

RED (Attention Needed, Negative)
  50:   #FEF2F2   - Light danger bg
  500:  #EF4444   - ROAS < 1x, ROI negative, -trend
  600:  #DC2626   - Hover
  700:  #B91C1C   - Active
  Dark: #FCA5A5   - Dark mode text

NEUTRAL (Backgrounds, Text, Borders)
  50:   #FAFAFA   - Light bg
  100:  #F3F4F6   - Light section bg
  200:  #E5E7EB   - Light border
  400:  #9CA3AF   - Secondary text
  500:  #6B7280   - Tertiary text
  700:  #374151   - Primary text light
  900:  #111827   - Strongest text light

  Dark:
  50:   #1F2937   - Darkest (like current 900)
  100:  #1E293B   - Very dark
  200:  #0F172A   - Pure dark
  700:  #E5E7EB   - Light text on dark
  900:  #F9FAFB   - Lightest text on dark
```

#### Semantic Colors (Purpose-Based)
```
SUCCESS:    Emerald-500  (#10B981)
WARNING:    Amber-500    (#F59E0B)
ERROR:      Red-500      (#EF4444)
INFO:       Blue-500     (#3B82F6)
DISABLED:   Zinc-300     (#D4D4D8)
```

#### Color Usage Rules
```
ROI/ROAS Gauges:
  ✅ Green Zone (Good):        Emerald-500
  ⚠️  Amber Zone (Watch):      Amber-500
  ❌ Red Zone (Critical):      Red-500

Trend Indicators:
  ↑ Positive:  Emerald-500 + TrendingUp icon
  ↓ Negative:  Red-500 + TrendingDown icon
  → Neutral:   Gray-400 + Minus icon

Interactive Elements:
  Default:  Blue-500
  Hover:    Blue-600
  Active:   Blue-700
  Disabled: Gray-300
```

---

### 2. Typography System

#### Font Stack
```css
--font-sans: 'Inter', 'Segoe UI', system-ui, sans-serif;
--font-mono: 'Fira Code', 'Courier New', monospace;
```

#### Type Scale (Responsive)

| Scale | Desktop | Mobile | Weight | Use Case |
|-------|---------|--------|--------|----------|
| **Display** | 48px | 32px | Bold | Page titles, hero metrics |
| **Heading 1** | 32px | 28px | Bold | Section headers |
| **Heading 2** | 24px | 20px | Semibold | Card titles, subsections |
| **Heading 3** | 18px | 16px | Semibold | Component titles |
| **Body Large** | 16px | 14px | Regular | Main content |
| **Body** | 14px | 14px | Regular | Default text |
| **Body Small** | 12px | 12px | Regular | Secondary text |
| **Caption** | 11px | 11px | Regular | Captions, meta |
| **Label** | 12px | 12px | Semibold | Form labels, badges |

#### Line Heights
```
Display:    1.2   (tight, high impact)
Heading:    1.3   (tight, visual hierarchy)
Body:       1.5   (comfortable reading)
Small:      1.4   (compact but readable)
```

#### Letter Spacing
```
Display:    -0.02em  (tightened)
Body:       0        (normal)
Label:      0.05em   (slight tracking)
```

---

### 3. Spacing System (Design Tokens)

#### Scale (4px Base Unit)
```
xs:    4px
sm:    8px
md:    12px
lg:    16px
xl:    20px
2xl:   24px
3xl:   32px
4xl:   40px
5xl:   48px
6xl:   64px
7xl:   80px
8xl:   96px
```

#### Usage Guidelines
```
Padding:
  Button:      xs md (4px 12px)
  Card:        lg (16px)
  Container:   xl (20px)

Gap:
  Form fields: md (12px)
  List items:  lg (16px)
  Sections:    3xl (32px)

Margin:
  Headings:    md (12px bottom)
  Paragraphs:  lg (16px bottom)
```

---

### 4. Shadow & Depth

#### Shadow Elevation Levels
```
ELEVATION 0 (Baseline):
  box-shadow: none

ELEVATION 1 (Subtle):
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
  Use: Borders, light cards

ELEVATION 2 (Medium):
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06)
  Use: Cards, buttons on hover

ELEVATION 3 (High):
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04)
  Use: Modal dialogs, dropdowns, popovers
```

---

### 5. Border Radius

#### Scale
```
none:    0px
sm:      4px
md:      8px
lg:      12px
xl:      16px
full:    9999px (circles, pills)
```

#### Usage
```
Card:         lg (12px)
Button:       md (8px)
Input:        md (8px)
Badge:        full (pill-shaped)
Avatar:       full (circle)
Modal:        xl (16px)
```

---

### 6. Opacity Scale

#### Transparency System
```
0:     0%     (invisible)
5:     5%     (barely visible)
10:    10%    (very subtle)
20:    20%    (subtle overlay)
50:    50%    (medium transparency)
75:    75%    (mostly visible)
90:    90%    (almost opaque)
100:   100%   (fully opaque)
```

#### Usage
```
Disabled state:     opacity-50
Hover overlay:      opacity-5 to opacity-10
Loading state:      opacity-70
Inactive text:      opacity-60
Backdrop:           opacity-75
```

---

## Atomic Design Structure

### Atoms (Base Units)

#### A1. Button
```
Variants:
  - primary (blue, filled)
  - secondary (outline)
  - ghost (no border, no bg)
  - danger (red, for delete actions)

Sizes:
  - sm (8px 12px)
  - md (10px 16px)  ← default
  - lg (12px 20px)

States:
  - default
  - hover (shadow elevation +1)
  - active (darker color)
  - disabled (opacity-50)
  - loading (spinner inside)

Specs:
  - Corner radius: md (8px)
  - Font weight: semibold
  - Transition: all 150ms ease
```

#### A2. Input Field
```
Variants:
  - text (default)
  - number
  - email
  - date
  - select

States:
  - empty
  - focused (blue border, shadow)
  - filled (shown as is)
  - error (red border, error message)
  - disabled (gray bg, opacity-50)

Specs:
  - Height: 40px
  - Padding: 10px 12px
  - Border: 1px solid, emerald-200 (light), zinc-800 (dark)
  - Border radius: md (8px)
  - Font: body (14px)
```

#### A3. Badge
```
Variants:
  - success (green)
  - warning (amber)
  - error (red)
  - info (blue)
  - neutral (gray)

Specs:
  - Padding: 4px 8px
  - Border radius: full (pill)
  - Font: label (12px, semibold)
  - Background: lighter variant (50 level)
  - Text: darker variant (700 level)
```

#### A4. Icon
```
Sizes:
  - xs: 16px  (labels, small contexts)
  - sm: 20px  (inputs, buttons)
  - md: 24px  (default, most uses)
  - lg: 32px  (headers, hero)
  - xl: 48px  (page title)

Library: Lucide React
Source: https://lucide.dev

Usage:
  - Always pair with text (except well-known icons)
  - Color: inherit from parent (semantic coloring)
  - Alignment: baseline or center
```

#### A5. Label
```
Specs:
  - Font size: 12px
  - Font weight: semibold
  - Color: gray-700 (light) / gray-300 (dark)
  - Case: uppercase or sentence case (consistent)
  - Required indicator: red asterisk (*)
  - Margin: 4px 0 (above input)
```

#### A6. Tooltip
```
Specs:
  - Font: small (12px)
  - Padding: 6px 10px
  - Background: gray-900 (light), white (dark)
  - Color: white (light), gray-900 (dark)
  - Shadow: elevation 3
  - Border radius: sm (4px)
  - Animation: fade in 100ms
  - Position: top (default), can be right/bottom/left
  - Arrow: optional (toward trigger)
```

### Molecules (Combinations)

#### M1. Form Field = Label + Input
```
Structure:
  <label> (A5)
  <input> (A2)
  <error message> (optional)

Spacing:
  Label to input: 4px
  Input to error: 4px

States:
  - empty (placeholder visible)
  - filled (value shown)
  - error (red border, error text visible)
  - success (green border, optional)
```

#### M2. Metric Card
```
Structure:
  ┌─────────────────────────┐
  │ Title + Icon + Tooltip  │
  │ ─────────────────────── │
  │ Large Value (number)    │
  │ Sub-value (optional)    │
  │ Badge + Trend           │
  └─────────────────────────┘

Variants:
  - default (blue border left, white bg)
  - hero (thick blue left border, elevated)
  - muted (gray text, reduced importance)

Sizes:
  - sm (min height 120px)
  - md (min height 140px) ← default
  - lg (min height 160px)

Specs:
  - Padding: lg (16px)
  - Border radius: lg (12px)
  - Border left: 4px thick (hero only)
  - Shadow: elevation 1 (default), elevation 2 (hover)
  - Transition: shadow 200ms, border-color 200ms
```

#### M3. Filter Chip
```
Structure:
  [🏷️ Filter Label] [✕ Remove]

Specs:
  - Background: blue-50 (light), blue-900/20 (dark)
  - Border: 1px blue-200
  - Padding: 6px 12px
  - Border radius: full
  - Font: small (12px)
  - Action: click to remove
```

#### M4. Status Indicator
```
Structure:
  [● Dot] [Text]

Variants:
  - success (green)
  - warning (amber)
  - error (red)
  - neutral (gray)

Usage:
  - Sync status
  - Campaign status
  - Data freshness
```

### Organisms (Complex Sections)

#### O1. Dashboard Header
```
Structure:
  ┌─────────────────────────────────────────────┐
  │ [Logo] [Title]  [Period] [Timezone] [⚙️]     │
  │ [Alerts Bar] (if alerts exist)               │
  └─────────────────────────────────────────────┘

Specs:
  - Height: 56px (nav) + alert height
  - Sticky: position fixed
  - Shadow: elevation 2 (when scrolled)
  - Responsive: compress on mobile
```

#### O2. Metrics Grid
```
Layout (Desktop):
  4-column grid
  Cards: 1x responsive sizing
  Gap: lg (16px)

Layout (Tablet):
  2-column grid
  Same spacing

Layout (Mobile):
  1-column
  Full width cards
```

#### O3. Campaign Performance Table
```
Structure:
  Header Row (sticky when scrolled)
  Data Rows (sortable)
  Empty State (if no data)

Columns:
  1. Campaign Name (sortable)
  2. Spend (currency, sortable)
  3. Impressions (number, sortable)
  4. Clicks (number, sortable)
  5. CTR (%, sortable)
  6. ROAS (colored, sortable)
  7. Actions (quick edit, pause)

Specs:
  - Header: bold, gray-100 bg (light), gray-950 bg (dark)
  - Row height: 48px
  - Hover: gray-50 bg (light), gray-900 bg (dark)
  - Striped: alternate row colors (optional)
  - Pagination: if > 20 rows
```

---

## Layout System

### Grid Architecture

#### Desktop Grid (1440px+)
```
12-column layout
Column width: 104px
Gutter: 20px (10px each side)
Margin: 20px left/right

Container max-width: 1440px
```

#### Tablet Grid (768px - 1024px)
```
8-column layout
Column width: 82px
Gutter: 16px
Margin: 16px left/right
```

#### Mobile Grid (320px - 767px)
```
4-column layout
Column width: 58px
Gutter: 12px
Margin: 12px left/right
```

### Breakpoints
```
Mobile:    320px - 640px    (xs, sm)
Tablet:    640px - 1024px   (md, lg)
Desktop:   1024px - 1440px  (xl)
Wide:      1440px+          (2xl)

Naming Convention (Tailwind):
  sm:  640px
  md:  768px
  lg:  1024px
  xl:  1280px
  2xl: 1536px
```

---

## Responsive Design

### Mobile-First Approach

```
1. Design for mobile first
2. Add features/complexity as screen grows
3. Hide non-essential on mobile (controls, secondary info)
4. Show everything on desktop

Examples:

Card Layout:
  Mobile:  1 column, full width
  Tablet:  2 columns
  Desktop: 3-4 columns

Table:
  Mobile:  Vertical stacking or horizontal scroll
  Desktop: Standard table

Navigation:
  Mobile:  Hamburger menu
  Desktop: Horizontal nav
```

### Touch Targets
```
Minimum touch target: 44px × 44px
Spacing between targets: 8px minimum

Button sizes (mobile):
  sm: 36px height (too small, avoid)
  md: 44px height (minimum)
  lg: 48px height (preferred)
```

---

## Animation & Micro-interactions

### Animation Philosophy
```
Every animation should:
  1. Have a purpose (feedback, guidance, delight)
  2. Be fast (150-300ms for feedback)
  3. Use easing (ease-in-out preferred)
  4. Be smooth (60fps target)
  5. Respect prefers-reduced-motion
```

### Transition Library

#### T1. Fade In
```
Duration: 150ms
Easing: ease-out
Property: opacity

Use: New elements appearing, alerts showing
```

#### T2. Slide Up
```
Duration: 200ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties: transform (translateY), opacity

Use: Modals, expandable sections
```

#### T3. Bounce (Subtle)
```
Duration: 300ms
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
Property: transform (scale)

Use: Button press, success feedback
```

#### T4. Color Change
```
Duration: 200ms
Easing: ease-in-out
Property: color, background-color

Use: Hover states, status changes
```

#### T5. Spin (Loading)
```
Duration: 1s
Easing: linear
Animation: rotate 360deg infinite

Use: Loading spinners
```

### Micro-interaction Specifications

#### Button Interactions
```
Default → Hover:
  - Shadow: elevation +1 (200ms ease-in-out)
  - Color: darken slightly (100ms)
  - Cursor: pointer

Click (active):
  - Scale: 0.98 (100ms ease-out)
  - Shadow: elevation -1

Focus (keyboard):
  - Outline: 2px blue-500
  - Outline-offset: 2px
```

#### Card Interactions
```
Default → Hover:
  - Shadow: elevation +1 (150ms ease-in-out)
  - Border-color: blue-200 (optional)
  - Cursor: grab (if draggable)

Click:
  - Scale: 0.995 (75ms ease-out)
```

#### Input Focus
```
Default:
  - Border: 1px gray-300 (light), gray-700 (dark)
  - Shadow: none

Focus:
  - Border: 2px blue-500
  - Shadow: 0 0 0 3px blue-500/10
  - Duration: 150ms ease-out
```

#### Success Feedback
```
When action completes:
  1. Button shows "✓ Success" (text + icon)
  2. Color changes to green-500 (fade-in 200ms)
  3. Button is disabled for 1s
  4. Resets to original state (fade-in 150ms)

Or: Toast notification appears (slide-up 200ms)
```

#### Loading State
```
Button with text "Loading...":
  1. Text changes (fade-out 100ms)
  2. Spinner appears (fade-in 100ms)
  3. Button becomes disabled (opacity-50)
  4. Spinner animates (1s rotation, infinite)

Or: Skeleton screen if loading significant content
```

---

## Accessibility

### WCAG AA Compliance (Target: AAA)

#### Color Contrast
```
Large text (18px+):      3:1 minimum
Normal text:             4.5:1 minimum
UI components:           3:1 minimum
Graphical elements:      3:1 minimum

Current targets:
  Text on background:    5:1 (exceeds requirement)
  Labels on controls:    4.5:1 minimum
  Status indicators:     should use icon + color
```

#### Focus Management
```
Focus indicator:
  - Always visible
  - Minimum 2px outline
  - Color: blue-500 or similar
  - Outline-offset: 2px

Focus order:
  - Left-to-right, top-to-bottom
  - Tab through controls in logical order
  - Skip navigation link at top

Focus visible:
  - :focus-visible for keyboard only
  - :focus for all (fallback)
```

#### Keyboard Navigation
```
Tab:          Move to next element
Shift+Tab:    Move to previous element
Enter:        Activate button, submit form
Space:        Toggle checkbox, activate button
Escape:       Close modal, cancel action
Arrow keys:   Navigate within groups (menu, tabs)

Requirements:
  - All interactive elements keyboard accessible
  - No keyboard traps
  - Focus order logical
```

#### Screen Reader Support
```
<button> instead of <div onClick>
<label for="input"> linked to <input id>
role="region" with aria-label
aria-live="polite" for updates
aria-describedby for additional info
<alt text> for images (meaningful, concise)

Metric card example:
  <div role="region" aria-label="Revenue Metric">
    <h2>Revenue</h2>
    <p aria-live="polite">R$ 12,345.00</p>
    <p aria-describedby="revenue-trend">+15% vs last week</p>
  </div>
```

#### Motion & Animations
```
Respect prefers-reduced-motion:
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

Avoid:
  - Sudden movements
  - Flashing content (> 3x/second)
  - Large moving backgrounds
```

---

## Dark Mode

### Implementation Strategy

#### Token-Based Approach
```
Define tokens for both themes:

Light:
  --bg-primary: #FFFFFF
  --bg-secondary: #F3F4F6
  --text-primary: #111827
  --text-secondary: #6B7280

Dark:
  --bg-primary: #0F172A
  --bg-secondary: #1E293B
  --text-primary: #F9FAFB
  --text-secondary: #D1D5DB

Apply to CSS:
  body {
    background: var(--bg-primary);
    color: var(--text-primary);
  }

Switch with:
  <html class="dark"> or
  <html data-theme="dark">
```

#### Color Adjustments Dark Mode

| Light Component | Dark Equivalent | Reasoning |
|-----------------|-----------------|-----------|
| bg-white | bg-gray-950 | Deep background |
| bg-gray-100 | bg-gray-900 | Section background |
| text-gray-900 | text-gray-50 | Text contrast |
| border-gray-200 | border-gray-800 | Border visibility |
| blue-500 | blue-400 | Button brightness |
| shadow (dark) | shadow (lighter) | Depth perception |

#### Dark Mode Specific Rules
```
Avoid pure black (#000000):
  - Use gray-950 or gray-900
  - Prevents eye strain
  - Better for OLED displays

Bright colors in dark mode:
  - Adjust primary colors lighter
  - Blue-500 → Blue-400
  - Red-500 → Red-400

Contrast checks:
  - Re-verify all contrast ratios in dark
  - Some colors may need adjustment
  - Test with actual dark backgrounds
```

---

## Implementation Guide

### For Designers (Figma)

#### File Structure
```
Provincia-Real-Design-System/
├── 📄 0. Cover & Guide
├── 📄 1. Design Tokens (Colors, Typography, Spacing)
├── 📄 2. Atoms (Buttons, Inputs, Labels, Icons)
├── 📄 3. Molecules (FormField, MetricCard, FilterChip)
├── 📄 4. Organisms (Header, Grid, Table)
├── 📄 5. Templates (Dashboard Template, Comparison)
├── 📄 6. Pages (Dashboard Instance - Light)
├── 📄 7. Pages (Dashboard Instance - Dark)
├── 📄 8. Animations & Interactions (Specs)
├── 📄 9. Responsive Variants (Mobile, Tablet)
└── 📄 10. Accessibility Specs (Contrast, Focus)
```

#### Component Organization
```
All components as "Variants":
  - Component: Button
    - Variant: primary, sm
    - Variant: primary, md (default)
    - Variant: primary, lg
    - Variant: secondary, md
    - Variant: danger, md
    etc.

Use Figma Variants for:
  - Size
  - State (default, hover, active, disabled)
  - Color variant
  - Content (icon + text, icon only)
```

#### Colors & Typography
```
Figma Styles:
  - Color: Color/Blue-500, Color/Green-500, etc.
  - Typography: Type/Heading-1, Type/Body, etc.
  - Effects: Shadow/Elevation-1, etc.

This allows:
  - One-click color updates
  - Consistent typography
  - Easy design system updates
```

### For Developers (Implementation)

#### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom color scale
        'brand-blue': { 500: '#3B82F6', ... },
      },
      spacing: {
        // Design token spacing
        'xs': '4px',
        'sm': '8px',
        // ...
      },
      animation: {
        // Custom animations
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
      },
    },
  },
}
```

#### CSS Variables (Alternative)
```css
:root {
  /* Colors */
  --color-primary-500: #3B82F6;
  --color-success-500: #10B981;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;

  /* Typography */
  --font-heading: 'Inter', sans-serif;
  --font-size-body: 14px;

  /* Shadows */
  --shadow-elevation-1: 0 1px 2px rgba(0,0,0,0.05);
}

[data-theme="dark"] {
  --color-text: #F9FAFB;
  --color-bg: #0F172A;
  /* ... */
}
```

#### Component Structure (React)
```typescript
// Example: MetricCard Component
interface MetricCardProps {
  title: string
  value: number | string
  variant?: 'default' | 'hero' | 'muted'
  trend?: { direction: 'up' | 'down' | 'neutral', percentage: number }
  icon?: React.ReactNode
  badge?: { label: string, color: 'green' | 'amber' | 'red' }
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  variant = 'default',
  trend,
  icon,
  badge,
}) => {
  // Implementation following design system
}
```

---

## Design System Evolution

### Version Roadmap

#### v1.0 (Foundation - Current)
✅ Color tokens
✅ Typography scale
✅ Spacing system
✅ 15 atomic components
✅ Light/dark theme
✅ Accessibility baseline (WCAG AA)

#### v1.1 (Enhancement - Next)
🟡 Animation tokens
🟡 Advanced micro-interactions
🟡 Extended component variants
🟡 Accessibility upgrade to AAA

#### v2.0 (Expansion - Future)
🟠 Expanded color system
🟠 Component compositions
🟠 Advanced pattern library
🟠 Multi-language support

---

## Design System Governance

### Update Process
1. Document rationale
2. Test in component library
3. Update Figma file
4. Update Tailwind config
5. Update documentation
6. Notify dev team

### Component Addition
1. Define specifications
2. Design in Figma
3. Create React component
4. Add tests
5. Document in system
6. Add to shared library

### Design System Reviews
- Quarterly: Check alignment with product
- Bi-annually: Assess token effectiveness
- Annually: Plan major updates

---

## Quick Reference Checklist

### When Designing Components

- [ ] Follows Atomic Design principles
- [ ] Uses design tokens (no hardcoded values)
- [ ] Supports light & dark modes
- [ ] Accessible (WCAG AA, keyboard nav)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Has clear micro-interactions
- [ ] Properly documented
- [ ] Works with existing components
- [ ] Tested for performance
- [ ] Handles edge cases (empty, loading, error)

### When Implementing

- [ ] Matches Figma design
- [ ] Uses Tailwind/CSS variables
- [ ] Passes accessibility tests
- [ ] Responsive design working
- [ ] Dark mode working
- [ ] Unit tests written
- [ ] Storybook documentation
- [ ] Performance optimized
- [ ] No console errors
- [ ] Mobile tested

---

## Resources

### Design Tools
- **Figma:** Component design & prototyping
- **Storybook:** Component documentation & testing
- **Lighthouse:** Performance & accessibility audit

### Documentation
- **Design System:** This document
- **Accessibility:** WCAG 2.1 Guidelines
- **Atomic Design:** Brad Frost's methodology
- **Tailwind CSS:** Utility-first framework

### Team
- **Design Lead:** Uma (UX-Design Expert)
- **Frontend Lead:** @dev (Dex)
- **QA Lead:** @qa (Quinn)
- **Architect:** @architect (Aria)

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-24 | Uma | Initial design system |

---

**Design System Status:** ✅ **COMPLETE & READY**
**Next Step:** Implement in Figma (in parallel)

— Uma, desenhando com empatia 💝
