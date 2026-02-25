# 🚀 New Features Design - Provincia Real Dashboard

**Task #8: Design 8 New Visualization Components**

**Created by:** Uma (UX-Design Expert)
**Date:** 2026-02-24
**Status:** 🎨 In Progress
**Dependencies:** Task #7 (DESIGN_SYSTEM.md) ✅ Complete
**Timeline:** 6-8 hours
**Audience:** Designers (Figma), Developers (@dev), Product Team

---

## 📋 Table of Contents

1. [Component Overview](#component-overview)
2. [Component 1: Sales by Hour Heatmap](#1-sales-by-hour-heatmap)
3. [Component 2: Performance Gauge Charts](#2-performance-gauge-charts)
4. [Component 3: Campaign Performance Table](#3-campaign-performance-table)
5. [Component 4: Customer Insights Panel](#4-customer-insights-panel)
6. [Component 5: Alerts & Recommendations](#5-alerts--recommendations)
7. [Component 6: Advanced Filtering System](#6-advanced-filtering-system)
8. [Component 7: Comparison Mode](#7-comparison-mode)
9. [Component 8: Export & Sharing](#8-export--sharing)
10. [Design System Integration](#design-system-integration)
11. [Accessibility Compliance](#accessibility-compliance)
12. [Implementation Specifications](#implementation-specifications)

---

## Component Overview

### The 8 Components at a Glance

| # | Component | Type | Atomic Level | Use Case | Users |
|---|-----------|------|--------------|----------|-------|
| 1 | Sales by Hour Heatmap | Data Visualization | Organism | Identify peak sales hours | E-Commerce Managers |
| 2 | Performance Gauges | Data Visualization | Molecule | Quick ROI/ROAS snapshot | Executives |
| 3 | Campaign Table | Data Display | Organism | Detailed campaign metrics | Marketing Teams |
| 4 | Customer Insights | Data Panel | Organism | Customer behavior analysis | Growth Teams |
| 5 | Alerts & Recommendations | Notifications | Molecule | Actionable alerts | All Users |
| 6 | Advanced Filters | Controls | Organism | Complex data filtering | Power Users |
| 7 | Comparison Mode | Data Comparison | Organism | Period-over-period analysis | Analysts |
| 8 | Export & Sharing | Actions | Molecule | Data distribution | All Users |

---

## 1. Sales by Hour Heatmap

### User Need
"I need to see WHEN my peak sales hours are so I can optimize ads spend and inventory."

### Overview
- **Dimensions:** 100% width of container (responsive)
- **Height:** 280px (compact yet readable)
- **Grid:** 24 hours (X-axis) × 7 days (Y-axis)
- **Color Encoding:** Sales volume via color intensity (Emerald gradient)
- **Timezone Support:** Converts times based on selected timezone (LA/BR)

### Visual Design

```
┌─ Sales by Hour Heatmap ─────────────────────────────────────┐
│                                                               │
│  Legend: Sales Volume    [Low] ━━━━━━━━━━━━ [High]  📊       │
│                                                               │
│     00  01  02  03  04  05  06  07  08  09  10  11           │
│  ┌──────────────────────────────────────────────────┐         │
│  │  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ▒▒  ▓▓  ██  ██ │ Mon    │
│  │  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ▒▒  ▒▒  ▓▓  ▓▓ │ Tue    │
│  │  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ▒▒  ▓▓  ██  ██  ██ │ Wed    │
│  │  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ▒▒  ▒▒  ▓▓  ▓▓  ▓▓ │ Thu    │
│  │  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ▒▒  ▓▓  ██  ██ │ Fri    │
│  │  ░░  ░░  ░░  ░░  ░░  ░░  ▒▒  ██  ██  ██  ██  ██ │ Sat    │
│  │  ░░  ░░  ░░  ░░  ░░  ░░  ▒▒  ██  ██  ██  ██  ██ │ Sun    │
│  └──────────────────────────────────────────────────┘         │
│     12  13  14  15  16  17  18  19  20  21  22  23           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Atomic Design Structure

**Atoms used:**
- Tooltip (shows sales #, time, day on hover)
- Badge (timezone indicator)

**Component breakdown:**
- HeatmapCell (atom-level, reusable)
- HeatmapLegend (molecule)
- HeatmapGrid (organism)
- HeatmapContainer (full component)

### Interactions

| Interaction | Behavior | Animation |
|------------|----------|-----------|
| **Hover cell** | Show tooltip with: hour, day, sales count, revenue | Fade-in (150ms) |
| **Click cell** | Open detail view for that hour's transactions | Slide-up (200ms) |
| **Timezone change** | Recalculate times, transition colors | Color shift (200ms) |
| **Period change** | Animate heatmap update with staggered cells | Stagger (50ms per cell) |

### Data Requirements

```typescript
interface HeatmapData {
  day: string; // 'Mon', 'Tue', etc.
  hour: number; // 0-23
  salesCount: number;
  revenue: number;
  timezone: 'LA' | 'BR';
  timestamp: Date;
}
```

### Accessibility

- ✅ WCAG AA compliant
- ✅ Color + numeric labels (not color alone)
- ✅ Keyboard navigation (arrow keys to select cell)
- ✅ Screen reader: "Hour 14, Monday: 234 sales, $4,521 revenue"
- ✅ Tooltip visible with Tab key

### Design Tokens Applied

```
Colors:
  - Background: neutral-50 (light) / neutral-900 (dark)
  - Emerald gradient: emerald-100 → emerald-900
  - Border: neutral-200 (light) / neutral-800 (dark)

Typography:
  - Labels: text-xs (11px), font-medium
  - Tooltip: text-sm (13px), font-regular

Spacing:
  - Cell padding: 4px
  - Grid gap: 2px
  - Container margin: 16px

Shadows:
  - Tooltip: elevation-medium
  - Hover cell: elevation-high
```

### Responsive Behavior

| Breakpoint | Layout Change |
|-----------|---------------|
| **Mobile (320px-640px)** | Show last 7 days only, 12 hours (peak hours), scrollable |
| **Tablet (640px-1024px)** | Show full 24 hours, 7 days, scrollable horizontally |
| **Desktop (1024px+)** | Full grid visible, no scrolling needed |

---

## 2. Performance Gauge Charts

### User Need
"I need to see ROI and ROAS at a glance with visual zones showing if we're in 'good', 'warning', or 'critical' range."

### Overview
- **Dimensions:** 3 gauges in a row, each 200px wide
- **Metrics:** ROI, ROAS, Conversion Rate
- **Visual Format:** Circular gauge with needle + zones
- **Color Zones:** Green (good), Amber (warning), Red (critical)
- **Animation:** Needle animates on load and when data updates

### Visual Design

```
┌─ Performance Gauges ──────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │     ROI      │    │    ROAS      │    │ Conv. Rate   │     │
│  │              │    │              │    │              │     │
│  │    34.6%     │    │     4.2x     │    │    3.45%     │     │
│  │      ↑       │    │      ↑       │    │      ↑       │     │
│  │   /    \     │    │   /    \     │    │   /    \     │     │
│  │  /  ░░  \    │    │  /  ▒▒  \    │    │  /  ██  \    │     │
│  │ │  ░ ░ ░ │   │    │ │  ▒ ▒ ▒ │   │    │ │  █ █ █ │   │     │
│  │ │ ░     ░ │   │    │ │ ▒     ▒ │   │    │ │ █     █ │   │     │
│  │  \  ░ ░  /   │    │  \  ▒ ▒  /   │    │  \  █ █  /   │     │
│  │   \  ░░  /    │    │   \  ▒▒  /    │    │   \  ██  /    │     │
│  │    ‾‾‾‾‾‾     │    │    ‾‾‾‾‾‾     │    │    ‾‾‾‾‾‾     │     │
│  │                │    │                │    │                │     │
│  │ Good ✓         │    │ Good ✓         │    │ Low ⚠️          │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Atomic Design Structure

**Atoms used:**
- Text (metric label, value)
- Icon (status indicator)

**Component breakdown:**
- GaugeNeedle (atom)
- GaugeZone (atom)
- GaugeChart (molecule)
- GaugeContainer (organism)

### Interactions

| Interaction | Behavior | Animation |
|------------|----------|-----------|
| **Load/update** | Needle rotates to target value | Ease-out (800ms) |
| **Hover** | Show detailed breakdown (breakdown of ROI components) | Fade-in (150ms) |
| **Click** | Open detail report for that metric | Slide-up (200ms) |
| **Value change** | Needle smoothly transitions to new value | Ease-out (600ms) |

### Data Requirements

```typescript
interface GaugeData {
  metric: 'ROI' | 'ROAS' | 'ConversionRate';
  value: number;
  target: number;
  min: number;
  max: number;
  status: 'good' | 'warning' | 'critical';
  breakdown?: {
    revenue: number;
    cost: number;
    orders: number;
  };
}

// Status logic:
// ROI > 25% → 'good', 15-25% → 'warning', < 15% → 'critical'
// ROAS > 3.0x → 'good', 2.0-3.0x → 'warning', < 2.0x → 'critical'
// Conv > 3% → 'good', 1-3% → 'warning', < 1% → 'critical'
```

### Accessibility

- ✅ Color + icon (not color alone)
- ✅ ARIA labels: "ROI gauge: 34.6 percent, status good"
- ✅ Keyboard accessible: Tab to focus, Enter to see detail
- ✅ Screen reader describes zones and current position

### Design Tokens Applied

```
Colors (zones):
  - Good: emerald-500
  - Warning: amber-500
  - Critical: red-500
  - Background: neutral-50 (light) / neutral-900 (dark)

Typography:
  - Metric label: text-sm (13px), font-semibold
  - Value: text-2xl (24px), font-bold
  - Status: text-xs (11px), font-medium

Spacing:
  - Gauge diameter: 160px
  - Container gap: 20px
  - Padding: 16px

Shadows:
  - Card: elevation-subtle
  - Hover: elevation-medium
```

### Responsive Behavior

| Breakpoint | Layout Change |
|-----------|---------------|
| **Mobile (320px-640px)** | Stack vertically, full width each |
| **Tablet (640px-1024px)** | 2 per row (ROI + ROAS top, Conv below) |
| **Desktop (1024px+)** | 3 per row in single line |

---

## 3. Campaign Performance Table

### User Need
"I need to see all my campaigns with metrics, compare them, and identify winners vs underperformers."

### Overview
- **Dimensions:** 100% width, dynamic height
- **Columns:** Campaign name, Impressions, Clicks, CTR, Spend, Revenue, ROAS, Status
- **Features:** Sortable columns, searchable, sparklines (revenue trend)
- **Rows:** Typically 5-20 campaigns
- **Highlight:** Best performing campaign (green accent), underperforming (red)

### Visual Design

```
┌─ Campaign Performance ────────────────────────────────────────────┐
│  📊 Campaign  │ Impressions │ Clicks │ CTR │ Spend │ Revenue │   │
│  ┌─ Sort ▼    │             │   ▲    │     │       │         │   │
│  ├─────────────┼─────────────┼────────┼─────┼───────┼─────────┤   │
│  │✓ Summer Sale│   124,500   │ 4,521  │ 3.6%│$8,400│$34,200 │ ✓  │
│  │  ├─ Sparkline: ▁▂▃▄▅▆▇▆▅▄ (trend up)                           │
│  │  └─ ROAS: 4.1x (Good)                                        │   │
│  ├─────────────┼─────────────┼────────┼─────┼───────┼─────────┤   │
│  │ Q1 Clearance│    87,300   │ 2,145  │ 2.5%│$5,200│$12,100 │ ⚠  │
│  │  ├─ Sparkline: ▆▆▅▄▃▂▂▂▂▂ (trend down)                        │   │
│  │  └─ ROAS: 2.3x (Warning)                                     │   │
│  ├─────────────┼─────────────┼────────┼─────┼───────┼─────────┤   │
│  │ Valentine's │    56,800   │ 1,234  │ 2.2%│$4,100│ $7,850  │ ✗  │
│  │  ├─ Sparkline: ▅▄▄▃▂▂▁▁▁▁ (trend down)                       │   │
│  │  └─ ROAS: 1.9x (Critical)                                    │   │
│  └─────────────┴─────────────┴────────┴─────┴───────┴─────────┘   │
│                                                                     │
│  [🔍 Search campaigns...] [Filter ▼] [Export] [Compare]          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Atomic Design Structure

**Atoms used:**
- Text (cell content)
- Icon (status indicator, sort arrow)
- Badge (ROAS indicator)

**Component breakdown:**
- TableCell (atom)
- TableRow (molecule)
- TableHeader (molecule)
- Sparkline (molecule - small chart in cell)
- CampaignTable (organism)

### Interactions

| Interaction | Behavior | Animation |
|------------|----------|-----------|
| **Click column header** | Sort by that column (asc/desc toggle) | Fade-in sort arrow |
| **Click row** | Expand to show detailed breakdown | Slide-down (200ms) |
| **Search** | Filter campaigns by name/ID | Fade-out rows (150ms) |
| **Hover row** | Highlight row, show action buttons (edit, pause, archive) | Background highlight |
| **Hover sparkline** | Show tooltip with data points | Tooltip fade-in |

### Data Requirements

```typescript
interface CampaignRow {
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number; // percentage
  spend: number;
  revenue: number;
  roas: number;
  status: 'active' | 'paused' | 'underperforming';
  sparklineData: number[]; // Last 30 days revenue
  conversionRate: number;
}

interface TableState {
  sortBy: keyof CampaignRow;
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  expandedRows: string[];
}
```

### Accessibility

- ✅ WCAG AA compliant
- ✅ Semantic table structure (`<table>`, `<thead>`, `<tbody>`)
- ✅ Column headers have scope="col"
- ✅ Sortable indicators clearly marked
- ✅ Screen reader announces sort order
- ✅ Keyboard navigation: Tab, Shift+Tab, Enter

### Design Tokens Applied

```
Colors:
  - Good status: emerald-500
  - Warning status: amber-500
  - Critical status: red-500
  - Row hover: neutral-50 (light) / neutral-800 (dark)
  - Header: neutral-100 (light) / neutral-800 (dark)

Typography:
  - Header: text-sm (13px), font-semibold
  - Data: text-sm (13px), font-regular
  - Metric: text-xs (11px), font-mono (for numbers)

Spacing:
  - Cell padding: 12px
  - Row height: 52px
  - Header height: 48px

Borders:
  - Rows: 1px neutral-200 (light) / neutral-700 (dark)
  - Header: 2px neutral-300 (light) / neutral-600 (dark)
```

### Responsive Behavior

| Breakpoint | Layout Change |
|-----------|---------------|
| **Mobile (320px-640px)** | Card layout, 1 campaign per card, vertical metrics |
| **Tablet (640px-1024px)** | Table with essential columns only (Name, Spend, Revenue, ROAS) |
| **Desktop (1024px+)** | Full table with all columns |

---

## 4. Customer Insights Panel

### User Need
"I need to understand my customers: how valuable they are, how likely to repeat, and what segments I have."

### Overview
- **Dimensions:** 100% width, 3-4 sections stacked
- **Sections:**
  1. LTV Distribution (histogram)
  2. Repeat Purchase Rate (gauge + stat)
  3. Customer Segments (pie chart with legend)
  4. Cohort Analysis (mini table)
- **Data freshness:** 24-hour aggregated data
- **Timezone:** Uses selected timezone for cohort grouping

### Visual Design

```
┌─ Customer Insights ────────────────────────────────────────────┐
│                                                                  │
│  ┌─ Lifetime Value Distribution ──────────────────────────────┐ │
│  │                                                            │ │
│  │   Frequency │                                             │ │
│  │         500 │     ╭─╮                                     │ │
│  │         400 │     │ │                                     │ │
│  │         300 │ ╭─╮ │ │ ╭─╮                                 │ │
│  │         200 │ │ │ │ │ │ │ ╭─╮                             │ │
│  │         100 │ │ │ │ │ │ │ │ │ ╭─╮                        │ │
│  │           0 │ │ │ │ │ │ │ │ │ │ │ ╭─╮  ╭─╮              │ │
│  │             └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴──┴─┘               │ │
│  │             $0  $100 $300 $500 $1000 $2000+ (LTV Brackets)  │ │
│  │                                                            │ │
│  │  📊 Key Stats: Median LTV: $342 | Mean LTV: $487          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Repeat Purchase Rate ──────────────────────────────────┐   │
│  │                                                          │   │
│  │  Customers who bought 2+ times:  ╭──────────╮          │   │
│  │                                   │ 42.3% ✓  │          │   │
│  │  Average repeat rate (industry):  │ Good!    │          │   │
│  │                                   ╰──────────╯          │   │
│  │                                                          │   │
│  │  Repeat frequency: 2.4x (avg repeat purchases/customer) │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Customer Segments ──────────────────────────────────────┐  │
│  │                                                           │  │
│  │        ╭─────────╮                                       │  │
│  │      ╱             ╲      Segment Breakdown:            │  │
│  │    ╱   High Value    ╲    • High Value (>$500):  156    │  │
│  │   │      23% (156)     │   • Regular ($100-$500): 1,234 │  │
│  │   │                    │   • New (<$100): 2,401         │  │
│  │    ╲  Regular  ▓▓▓▓▓  ╱    • Inactive (>90d): 892      │  │
│  │      ╲   58%    ░░░  ╱     • Churned: 451               │  │
│  │        ╲       ╱                                         │  │
│  │          ╰────╯                                          │  │
│  │          New 15%                                         │  │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Atomic Design Structure

**Atoms used:**
- Text (labels, values)
- Icon (status, trend)

**Component breakdown:**
- LTVHistogram (molecule)
- RepeatGauge (molecule)
- SegmentPie (molecule)
- CohortMini (molecule)
- CustomerInsights (organism)

### Interactions

| Interaction | Behavior | Animation |
|------------|----------|-----------|
| **Click segment** | Filter main dashboard to show only that segment | Fade-out/in (200ms) |
| **Hover segment** | Show tooltip with count and percentage | Tooltip fade-in |
| **Hover LTV bar** | Show detailed breakdown (# customers, avg revenue) | Tooltip fade-in |
| **Click cohort row** | Show detailed breakdown for that cohort | Slide-down (200ms) |

### Data Requirements

```typescript
interface CustomerInsights {
  ltvDistribution: {
    bracket: string; // "$0-100", "$100-300", etc.
    count: number;
    percentage: number;
  }[];

  repeatPurchaseRate: {
    percentage: number;
    totalCustomers: number;
    repeatCustomers: number;
    avgRepeatFrequency: number;
  };

  segments: {
    name: 'HighValue' | 'Regular' | 'New' | 'Inactive' | 'Churned';
    count: number;
    percentage: number;
    avgLTV: number;
    color: string;
  }[];

  cohorts: {
    month: string;
    acquired: number;
    retained: number;
    retentionRate: number;
  }[];
}
```

### Accessibility

- ✅ WCAG AA compliant (target AAA)
- ✅ All charts have accessible labels
- ✅ Pie chart: numeric labels visible, not color alone
- ✅ Histogram: axis labels, bar values visible
- ✅ Screen reader describes all metrics and trends

### Design Tokens Applied

```
Colors:
  - High Value: emerald-600
  - Regular: blue-500
  - New: amber-500
  - Inactive: neutral-400
  - Churned: red-500

Typography:
  - Section title: text-lg (18px), font-semibold
  - Metric label: text-sm (13px), font-medium
  - Metric value: text-md (16px), font-bold
  - Helper text: text-xs (11px), font-regular

Spacing:
  - Section padding: 20px
  - Section gap: 16px
  - Chart height: 240px

Shadows:
  - Card: elevation-subtle
```

### Responsive Behavior

| Breakpoint | Layout Change |
|-----------|---------------|
| **Mobile (320px-640px)** | Stack all sections, 100% width, smaller charts |
| **Tablet (640px-1024px)** | 2 sections per row (LTV + Repeat top, Segments + Cohort bottom) |
| **Desktop (1024px+)** | Full layout, all sections visible, full-size charts |

---

## 5. Alerts & Recommendations

### User Need
"I need to know when something is wrong or when there's an opportunity, without having to monitor everything manually."

### Overview
- **Type:** Smart notifications + action items
- **Trigger:** Automatic based on rules, real-time
- **Categories:**
  - ⚠️ Warnings (ROAS dropped >20%, CTR below threshold)
  - 💡 Recommendations (pause underperforming campaign, duplicate top winner)
  - ✅ Celebrations (new revenue milestone, record day)
- **Display:** Toast notifications + persistent panel
- **Persistence:** Dismissible or actionable

### Visual Design

```
┌─ Alerts & Recommendations ─────────────────────────────────────┐
│                                                                  │
│  Recent Activity (Today)                    [Clear all] [Setting]│
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ⚠️ WARNING - 1 hour ago                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ROAS on "Summer Sale" dropped to 2.1x (was 3.4x)         │  │
│  │ Recommendation: Review ad creative and bidding strategy  │  │
│  │                                                          │  │
│  │ [Pause Campaign]  [View Campaign]  [Dismiss]            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  💡 RECOMMENDATION - 2 hours ago                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ "Q1 Clearance" is your best performer (ROAS 4.1x)        │  │
│  │ Increase budget by 20% to scale this campaign            │  │
│  │                                                          │  │
│  │ [Increase Budget]  [View Campaign]  [Dismiss]           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ✅ MILESTONE - 4 hours ago                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🎉 Today's sales exceeded $5,000! (New record)           │  │
│  │ Previous record: $4,821 on Feb 10                         │  │
│  │                                                          │  │
│  │ [View Report]  [Share]  [Dismiss]                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ℹ️ INFO - 6 hours ago                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Meta Ads API sync completed successfully (892 orders)   │  │
│  │                                                          │  │
│  │ [Dismiss]                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Alert Types & Severity

```typescript
type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

interface Alert {
  id: string;
  type: 'warning' | 'recommendation' | 'milestone' | 'info';
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: Date;
  actions: AlertAction[];
  dismissed: boolean;
  read: boolean;

  // Trigger context
  context?: {
    campaignId?: string;
    metric?: string;
    threshold?: number;
    value?: number;
  };
}

interface AlertAction {
  label: string;
  action: string; // 'pause-campaign', 'view-campaign', 'increase-budget', etc.
  destination?: string;
}
```

### Atomic Design Structure

**Atoms used:**
- Icon (alert type)
- Badge (severity)
- Button (actions)
- Text (description)

**Component breakdown:**
- AlertCard (molecule)
- AlertContainer (organism)

### Interactions

| Interaction | Behavior | Animation |
|------------|----------|-----------|
| **New alert arrives** | Toast notification slides in from top-right | Slide-down (300ms) |
| **Click action button** | Execute action (navigate, API call), mark as read | None (immediate) |
| **Dismiss alert** | Remove from view (keep in history), fade-out | Fade-out (150ms) |
| **Click "Clear all"** | Mark all as dismissed, fade-out all cards | Stagger fade-out |
| **Click alert body** | Expand to show full details if truncated | Slide-down (200ms) |

### Alert Rules (Examples)

```
Rule 1: ROAS Drop
- Trigger: ROAS < (yesterday's avg * 0.8) on any active campaign
- Type: Warning
- Action: "Review Campaign" button

Rule 2: Winner Campaign
- Trigger: ROAS > 3.5x on active campaign for 3 consecutive days
- Type: Recommendation
- Action: "Increase Budget" button

Rule 3: Revenue Milestone
- Trigger: Daily revenue > previous month's daily avg
- Type: Milestone
- Action: "View Report" button

Rule 4: Underperformer
- Trigger: ROAS < 1.5x for 7 consecutive days
- Type: Recommendation
- Action: "Pause Campaign" button
```

### Accessibility

- ✅ WCAG AA compliant
- ✅ Toast notifications announced via ARIA live region
- ✅ Icons + text labels (not icon alone)
- ✅ Dismiss button always available
- ✅ Focus managed when modals open

### Design Tokens Applied

```
Colors:
  - Critical: red-600
  - Warning: amber-600
  - Info: blue-600
  - Success: emerald-600
  - Background: neutral-50 (light) / neutral-900 (dark)

Typography:
  - Title: text-base (16px), font-semibold
  - Description: text-sm (13px), font-regular
  - Action text: text-xs (11px), font-semibold

Spacing:
  - Card padding: 16px
  - Alert gap: 12px
  - Container padding: 16px

Shadows:
  - Card: elevation-medium
  - Toast: elevation-high
```

---

## 6. Advanced Filtering System

### User Need
"I need to filter data by multiple criteria (campaign, date range, country, device) and save those filters for reuse."

### Overview
- **Interaction Model:** Multi-select dropdown with predefined options + custom input
- **Filter types:** Campaign (multi-select), Date range (custom picker), Country (multi-select), Device (multi-select), Status (multi-select)
- **State management:** Filters persist in URL (shareable) + localStorage (saved presets)
- **UX:** Chips showing active filters, quick reset button

### Visual Design

```
┌─ Advanced Filtering ────────────────────────────────────────────┐
│                                                                  │
│  [🔍 Filter] [📌 Saved Presets ▼] [❌ Reset All]               │
│                                                                  │
│  Active Filters:                                                │
│  ┌────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ Summer Sale ✕  │  │ Feb 1-10, 2026 ✕ │  │ US, CA, MX ✕   │  │
│  └────────────────┘  └──────────────────┘  └────────────────┘  │
│  ┌────────────────┐                                             │
│  │ Mobile, Desktop ✕ │                                           │
│  └────────────────┘                                             │
│                                                                  │
│  Filter Options:                                                │
│  ┌─ Campaign [Select...] ──────────────────────────────────┐  │
│  │ ☑ Summer Sale            ☑ Q1 Clearance                │  │
│  │ ☐ Valentine's             ☐ Spring Launch              │  │
│  │ ☐ Black Friday            ☐ Holiday Special            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Date Range [Feb 1 - Feb 10, 2026] ────────────────────┐   │
│  │                                                          │   │
│  │  From:  [Feb 1, 2026]     To: [Feb 10, 2026]           │   │
│  │         📅                        📅                    │   │
│  │                                                          │   │
│  │  Presets: [Today] [7 Days] [30 Days] [This Month]      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Country (Multi-select) ────────────────────────────────┐   │
│  │ 🔍 [Search countries...]                                │   │
│  │ ☑ United States (2,341 orders)                          │   │
│  │ ☑ Canada (156 orders)                                   │   │
│  │ ☑ Mexico (89 orders)                                    │   │
│  │ ☐ United Kingdom                                         │   │
│  │ ☐ France                                                │   │
│  │ ☐ Germany                                               │   │
│  │ [✓ Select All]  [Clear All]                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Device (Multi-select) ────────────────────────────────┐    │
│  │ ☑ Mobile (1,234 orders)                                │    │
│  │ ☑ Desktop (2,103 orders)                               │    │
│  │ ☐ Tablet (156 orders)                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Apply Filters]  [Save as Preset...]  [Cancel]                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Atomic Design Structure

**Atoms used:**
- Checkbox
- Text input
- Button
- Icon (search)
- Badge (chip)

**Component breakdown:**
- FilterChip (molecule)
- FilterDropdown (molecule)
- FilterSection (molecule)
- FilterPanel (organism)

### Interactions

| Interaction | Behavior | Animation |
|------------|----------|-----------|
| **Click filter chip ✕** | Remove that filter, re-fetch data | Fade-out (150ms) |
| **Select option** | Add to active filters, update URL, re-fetch data | Stagger filter update |
| **Search in dropdown** | Filter options by text (real-time) | Filter items fade-in |
| **Save as preset** | Modal to name preset, save to localStorage | Slide-up modal (200ms) |
| **Click saved preset** | Apply all filters from preset, update URL | Animate chip appearance |
| **Reset All** | Clear all filters, confirm action | Fade-out all chips |

### Data Requirements

```typescript
interface FilterState {
  campaigns: string[]; // IDs
  dateRange: {
    from: Date;
    to: Date;
  };
  countries: string[]; // ISO country codes
  devices: ('mobile' | 'desktop' | 'tablet')[];
  statuses?: ('active' | 'paused' | 'completed')[];
}

interface FilterPreset {
  id: string;
  name: string; // "February Winners", "Mobile Traffic", etc.
  filters: FilterState;
  createdAt: Date;
  usageCount: number;
}
```

### Accessibility

- ✅ WCAG AA compliant
- ✅ All checkboxes properly labeled
- ✅ Dropdown opens with keyboard (Spacebar, Enter)
- ✅ Arrow keys navigate options
- ✅ Search field focused when dropdown opens
- ✅ Screen reader announces filter count and active filters

### Design Tokens Applied

```
Colors:
  - Active chip: blue-100 (light) / blue-900 (dark)
  - Active checkbox: blue-600
  - Hover option: neutral-100 (light) / neutral-800 (dark)
  - Disabled: neutral-300 (light) / neutral-600 (dark)

Typography:
  - Label: text-sm (13px), font-medium
  - Option: text-sm (13px), font-regular
  - Chip text: text-xs (11px), font-medium

Spacing:
  - Chip margin: 4px
  - Option padding: 8px 12px
  - Section padding: 16px

Borders:
  - Dropdown: 1px neutral-200 (light) / neutral-700 (dark)
  - Checkbox: 1px blue-600 (when checked)
```

---

## 7. Comparison Mode

### User Need
"I need to compare metrics from different periods to see if I'm improving or declining."

### Overview
- **Comparison Types:** Period-over-period (this month vs last month), year-over-year
- **Metrics:** All dashboard KPIs with trend indicators
- **Display:** Side-by-side columns with % change and arrow indicators
- **Update Frequency:** Re-calculated when period selector changes

### Visual Design

```
┌─ Comparison Mode: February vs January ─────────────────────────┐
│                                                                  │
│  [📊 February 2026]        vs        [📊 January 2026]         │
│                                                                  │
│  ┌──────────────────────┐          ┌──────────────────────┐    │
│  │ REVENUE              │          │ REVENUE              │    │
│  │ $124,500             │          │ $89,300              │    │
│  │ ↑ +39.3%             │          │ (baseline)           │    │
│  │ from $89,300         │          │                      │    │
│  └──────────────────────┘          └──────────────────────┘    │
│                                                                  │
│  ┌──────────────────────┐          ┌──────────────────────┐    │
│  │ ROAS                 │          │ ROAS                 │    │
│  │ 3.8x                 │          │ 3.2x                 │    │
│  │ ↑ +18.8%             │          │ (baseline)           │    │
│  │ from 3.2x            │          │                      │    │
│  └──────────────────────┘          └──────────────────────┘    │
│                                                                  │
│  ┌──────────────────────┐          ┌──────────────────────┐    │
│  │ ORDERS               │          │ ORDERS               │    │
│  │ 2,145                │          │ 1,856                │    │
│  │ ↑ +15.6%             │          │ (baseline)           │    │
│  │ from 1,856           │          │                      │    │
│  └──────────────────────┘          └──────────────────────┘    │
│                                                                  │
│  ┌──────────────────────┐          ┌──────────────────────┐    │
│  │ AD SPEND             │          │ AD SPEND             │    │
│  │ $32,800              │          │ $27,900              │    │
│  │ ↑ +17.6%             │          │ (baseline)           │    │
│  │ from $27,900         │          │                      │    │
│  └──────────────────────┘          └──────────────────────┘    │
│                                                                  │
│  ┌──────────────────────┐          ┌──────────────────────┐    │
│  │ CONVERSION RATE      │          │ CONVERSION RATE      │    │
│  │ 3.2%                 │          │ 3.6%                 │    │
│  │ ↓ -11.1%             │          │ (baseline)           │    │
│  │ from 3.6%            │          │                      │    │
│  └──────────────────────┘          └──────────────────────┘    │
│                                                                  │
│  [← Compare with] [December 2025] [November 2025] [Custom ▼]   │
│                                                                  │
│  [📊 Show as Chart] [Export Comparison] [Share]                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Chart Visualization

```
Comparison Chart: Revenue by Day

$8,000 │
       │ Feb ╱──╲      ╱─╲    ╱─╲     ╱─╲
$6,000 │    ╱    ╲    ╱   ╲  ╱   ╲   ╱   ╲    ╱──╲
       │   ╱      ╲  ╱     ╲╱     ╲ ╱     ╲  ╱    ╲
$4,000 │  ╱        ╲╱               ╲       ╲╱      ╲
       │                                             ╲
$2,000 │ Jan ───────────────────────────────────────
       │
   $0  └─────────────────────────────────────────────
        1   3   5   7   9  11  13  15  17  19  21  23

Legend: Feb (solid line) vs Jan (dashed line)
```

### Atomic Design Structure

**Atoms used:**
- Text (metric values)
- Icon (trend arrow)
- Badge (percentage change)

**Component breakdown:**
- MetricComparison (molecule - single metric)
- ComparisonGrid (organism - all metrics)
- ComparisonChart (organism - trend visualization)

### Interactions

| Interaction | Behavior | Animation |
|------------|----------|-----------|
| **Change period** | Fetch new data, animate cards updating | Stagger card update (100ms) |
| **Hover metric card** | Show detailed breakdown (best day, worst day, daily avg) | Tooltip fade-in |
| **Click "Show as Chart"** | Toggle between card view and chart view | Fade-out cards, fade-in chart |
| **Click metric card** | Show detailed breakdown modal with daily breakdown | Slide-up modal (200ms) |
| **Export** | Generate PDF/CSV with comparison data | Toast notification |

### Data Requirements

```typescript
interface ComparisonMetric {
  name: string; // 'Revenue', 'ROAS', etc.
  current: number; // This period
  previous: number; // Last period
  change: number; // Percentage change
  trend: 'up' | 'down' | 'neutral';
  breakdown?: {
    dailyValues: number[]; // Day-by-day breakdown
    bestDay: number;
    worstDay: number;
    avgDaily: number;
  };
}

interface ComparisonState {
  currentPeriod: {
    start: Date;
    end: Date;
  };
  previousPeriod: {
    start: Date;
    end: Date;
  };
  metrics: ComparisonMetric[];
  comparisonType: 'month' | 'yoy' | 'custom';
}
```

### Accessibility

- ✅ WCAG AA compliant
- ✅ Trend arrows + numbers (not arrow alone)
- ✅ Color + other indicators (green/red arrows + ↑/↓)
- ✅ Screen reader announces all metrics and changes
- ✅ Chart has accessible labels and data table alternative

### Design Tokens Applied

```
Colors:
  - Positive trend: emerald-600 (↑)
  - Negative trend: red-600 (↓)
  - Neutral trend: neutral-400 (→)
  - Card background: neutral-50 (light) / neutral-900 (dark)

Typography:
  - Metric name: text-sm (13px), font-semibold
  - Value: text-2xl (24px), font-bold
  - Change percentage: text-base (16px), font-semibold
  - Period label: text-xs (11px), font-medium

Spacing:
  - Card padding: 16px
  - Card gap: 20px
  - Container padding: 20px

Shadows:
  - Card: elevation-subtle
  - Hover: elevation-medium
```

---

## 8. Export & Sharing

### User Need
"I need to export data as PDF/CSV for reports, or share a dashboard snapshot with my team."

### Overview
- **Export formats:** PDF (with branding), CSV (data table), Excel (multiple sheets)
- **Sharing:** Generate shareable link with auto-expiry (7 days), email report
- **Customization:** Choose which sections to include, custom title/branding
- **Delivery:** Download immediate or email with scheduled reports

### Visual Design

```
┌─ Export & Sharing ──────────────────────────────────────────────┐
│                                                                  │
│  [📥 Export] [📤 Share] [📧 Email Report] [⚙️ Settings]          │
│                                                                  │
│  ┌─ Export Options ────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Format:                                                │   │
│  │  ◉ PDF Report (with branding, charts, insights)        │   │
│  │  ○ CSV Data (raw metrics, campaigns, daily data)        │   │
│  │  ○ Excel Workbook (multiple sheets: summary, campaigns) │   │
│  │                                                          │   │
│  │  Include:                                               │   │
│  │  ☑ Performance Summary      ☑ Campaign Performance     │   │
│  │  ☑ Customer Insights        ☑ Alerts & Recommendations│   │
│  │  ☑ Comparison Analysis      ☑ Charts & Visualizations │   │
│  │                                                          │   │
│  │  File name: [Provincia Real - Feb 2026 Report]         │   │
│  │                                                          │   │
│  │  [📥 Download]  [Cancel]                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Sharing Options ────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  Shareable Link:                                         │   │
│  │  [https://provincia.app/s/abc123def456] [📋 Copy]       │   │
│  │                                                          │   │
│  │  Expiry: [7 days ▼] (auto-revoke after expiry)          │   │
│  │                                                          │   │
│  │  Access: [View Only] (cannot edit or export)            │   │
│  │                                                          │   │
│  │  Share via:                                             │   │
│  │  [📧 Email]  [💬 Slack]  [📱 WhatsApp]  [📎 Copy Link]  │   │
│  │                                                          │   │
│  │  [Generate Link]  [Cancel]                              │   │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Email Report ──────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Recipients: [team@company.com, manager@...]           │   │
│  │                                                          │   │
│  │  Subject: [February 2026 Performance Report]           │   │
│  │                                                          │   │
│  │  Schedule: ◉ Send Now  ○ Schedule                       │   │
│  │           [Every Monday at 9:00 AM ▼]                  │   │
│  │                                                          │   │
│  │  Message:                                               │   │
│  │  [Your monthly performance report is attached...]       │   │
│  │                                                          │   │
│  │  [📧 Send]  [Cancel]                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Toast notification after export:
┌────────────────────────────────────────┐
│ ✅ Report generated successfully!      │
│ "Provincia Real - Feb 2026.pdf"        │
│ [📥 Download] [📂 View in Folder]      │
└────────────────────────────────────────┘
```

### Atomic Design Structure

**Atoms used:**
- Button (actions)
- Text input (file name, email)
- Checkbox (include options)
- Radio button (format selection)

**Component breakdown:**
- ExportModal (organism)
- ShareModal (organism)
- EmailModal (organism)

### Interactions

| Interaction | Behavior | Animation |
|------------|----------|-----------|
| **Select format** | Show relevant options (PDF: include sections, CSV: all data) | Fade options in/out |
| **Click Download** | Generate file, start download, show success toast | Progress bar animation |
| **Generate shareable link** | Copy to clipboard, show toast, display link | Copy feedback |
| **Schedule email** | Show frequency selector, confirm schedule | Slide-down options |
| **Change expiry** | Update link expiry time immediately | Instant update |

### Data Requirements

```typescript
interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  fileName: string;
  includeCharts: boolean;
  includeSections: {
    summary: boolean;
    campaigns: boolean;
    insights: boolean;
    alerts: boolean;
    comparison: boolean;
  };
  dateRange?: {
    from: Date;
    to: Date;
  };
}

interface ShareOptions {
  expiryDays: number; // 1, 7, 30, or 0 for no expiry
  accessLevel: 'view' | 'comment' | 'edit';
  allowExport: boolean;
  allowShare: boolean;
}

interface EmailSchedule {
  recipients: string[];
  subject: string;
  message: string;
  schedule: 'once' | 'daily' | 'weekly' | 'monthly';
  frequency?: 'Monday' | 'Tuesday' | ... | 'day_of_month: number';
  time: string; // "09:00"
  enabled: boolean;
}
```

### Accessibility

- ✅ WCAG AA compliant
- ✅ Modal dialogs properly labeled
- ✅ Form inputs have labels
- ✅ Buttons clearly describe action
- ✅ Success/error messages announced via ARIA

### Design Tokens Applied

```
Colors:
  - Button primary: blue-600
  - Button secondary: neutral-600
  - Success toast: emerald-600
  - Error toast: red-600
  - Modal overlay: black/opacity-50

Typography:
  - Modal title: text-lg (18px), font-semibold
  - Label: text-sm (13px), font-medium
  - Helper text: text-xs (11px), font-regular

Spacing:
  - Modal padding: 24px
  - Form gap: 16px
  - Button group gap: 8px

Shadows:
  - Modal: elevation-high
  - Toast: elevation-high
```

---

## Design System Integration

### Component Hierarchy

All 8 components follow **Atomic Design** structure from DESIGN_SYSTEM.md:

```
ATOMS (6 base components)
├─ Button (with 4 variants)
├─ Input (5 types)
├─ Badge
├─ Icon
├─ Label
└─ Tooltip

MOLECULES (4 combinations)
├─ FormField (Label + Input)
├─ MetricCard (Badge + Text + Icon)
├─ FilterChip (Icon + Text + Button)
└─ StatusIndicator (Icon + Badge)

ORGANISMS (Using above atoms/molecules)
├─ HeatmapContainer (new)
├─ GaugeContainer (new)
├─ CampaignTable (new)
├─ CustomerInsights (new)
├─ AlertContainer (new)
├─ FilterPanel (new)
├─ ComparisonGrid (new)
└─ ExportModal (new)
```

### Design Tokens Used

All components use the design tokens from DESIGN_SYSTEM.md:

- **Colors:** Blue (primary), Emerald (success), Amber (warning), Red (critical), Neutral (backgrounds)
- **Typography:** Responsive scale (11px-48px), 5 font weights
- **Spacing:** 8-step scale (4px-96px)
- **Shadows:** 3 elevation levels
- **Border Radius:** 4 sizes (sm, md, lg, xl) + full
- **Opacity:** 0-100% scale

### Responsive Breakpoints

All components follow responsive strategy from DESIGN_SYSTEM.md:

| Breakpoint | Grid | Columns | Font Scale |
|-----------|------|---------|-----------|
| Mobile (320px) | 4-col | 1 | 90% |
| Tablet (768px) | 8-col | 2 | 100% |
| Desktop (1024px) | 12-col | 3-4 | 110% |

---

## Accessibility Compliance

### WCAG AA Target (AAA Aspirational)

All 8 components meet or exceed WCAG AA standards:

#### Color Contrast
- ✅ Text on background: 5:1 minimum
- ✅ UI components: 3:1 minimum
- ✅ Dark mode: Same ratios maintained

#### Keyboard Navigation
- ✅ All interactive elements focusable
- ✅ Tab order logical and predictable
- ✅ Escape key closes modals
- ✅ Arrow keys navigate lists/charts

#### Screen Reader Support
- ✅ Semantic HTML structure
- ✅ ARIA labels on all interactive elements
- ✅ Charts have text alternative descriptions
- ✅ Live regions for dynamic updates

#### Motion & Animation
- ✅ Animations < 300ms (no dizziness)
- ✅ Respect prefers-reduced-motion
- ✅ Animations have purpose (not decorative)

#### Focus Indicators
- ✅ 2px outline, visible on all themes
- ✅ High contrast focus style
- ✅ Never hidden or removed

---

## Implementation Specifications

### Figma File Structure

```
Figma Design File: "Provincia Real - New Features Design"

├─ 1. Sales by Hour Heatmap
│  ├─ Components
│  │  ├─ HeatmapCell (atom)
│  │  ├─ HeatmapLegend (molecule)
│  │  └─ HeatmapGrid (organism)
│  ├─ Variants (light/dark, desktop/mobile)
│  └─ Interactions spec
│
├─ 2. Performance Gauges
│  ├─ Components
│  │  ├─ GaugeNeedle (atom)
│  │  ├─ GaugeChart (molecule)
│  │  └─ GaugeContainer (organism)
│  ├─ Variants (ROI/ROAS/ConvRate, good/warning/critical)
│  └─ Animations spec
│
├─ 3. Campaign Table
│  ├─ Components
│  │  ├─ TableCell (atom)
│  │  ├─ TableRow (molecule)
│  │  └─ CampaignTable (organism)
│  ├─ Variants (desktop/tablet/mobile, sorted, expanded)
│  └─ Interaction states
│
├─ 4. Customer Insights
│  ├─ Components
│  │  ├─ LTVHistogram (molecule)
│  │  ├─ RepeatGauge (molecule)
│  │  ├─ SegmentPie (molecule)
│  │  └─ CustomerInsights (organism)
│  ├─ Variants (light/dark, expanded sections)
│  └─ Interaction states
│
├─ 5. Alerts & Recommendations
│  ├─ Components
│  │  ├─ AlertCard (molecule)
│  │  ├─ AlertIcon (atom)
│  │  └─ AlertContainer (organism)
│  ├─ Variants (warning/recommendation/milestone/info)
│  └─ Toast notification states
│
├─ 6. Advanced Filtering
│  ├─ Components
│  │  ├─ FilterChip (molecule)
│  │  ├─ FilterDropdown (molecule)
│  │  └─ FilterPanel (organism)
│  ├─ Variants (expanded/collapsed, active/inactive)
│  └─ Interaction states
│
├─ 7. Comparison Mode
│  ├─ Components
│  │  ├─ MetricComparison (molecule)
│  │  ├─ ComparisonGrid (organism)
│  │  └─ ComparisonChart (organism)
│  ├─ Variants (month/yoy/custom)
│  └─ Chart visualization
│
└─ 8. Export & Sharing
   ├─ Components
   │  ├─ ExportModal (organism)
   │  ├─ ShareModal (organism)
   │  └─ EmailModal (organism)
   ├─ Variants (format selection, schedule states)
   └─ Success/error states
```

### React Implementation Pattern

All components follow this pattern:

```typescript
// Component file structure (per component)
src/components/
├─ NewFeature1/
│  ├─ HeatmapContainer.tsx (organism)
│  ├─ HeatmapGrid.tsx (molecule)
│  ├─ HeatmapCell.tsx (atom)
│  ├─ useHeatmapData.ts (hook)
│  ├─ heatmap.types.ts (types)
│  ├─ heatmap.css (or Tailwind classes)
│  └─ HeatmapContainer.test.tsx
├─ NewFeature2/
│  └─ (similar structure)
└─ ...
```

### Testing Strategy

Each component requires:
- ✅ Unit tests (component rendering, props)
- ✅ Integration tests (with design tokens, responsive)
- ✅ A11y tests (accessibility checks)
- ✅ Visual regression tests (Figma design vs rendered output)

---

## Summary

**Task #8 Complete:** 8 comprehensive new feature designs created with:

✅ Complete user context and need statements
✅ Visual designs with ASCII mockups
✅ Atomic Design structure and component breakdown
✅ Interaction specifications
✅ Data requirements and type definitions
✅ Accessibility compliance (WCAG AA/AAA)
✅ Design tokens integration from DESIGN_SYSTEM.md
✅ Responsive behavior specs
✅ Figma file structure
✅ React implementation patterns

---

**Status:** 🎨 Ready for Developer Handoff
**Next Step:** Task #9 - Implementation (@dev will build all 8 components)
**Timeline:** 12-16 hours for full implementation

---

**Created:** 2026-02-24
**Last Updated:** 2026-02-24
**Design System Reference:** DESIGN_SYSTEM.md ✅
**Project:** Provincia Real Dashboard Redesign (Tasks #6-#12)
