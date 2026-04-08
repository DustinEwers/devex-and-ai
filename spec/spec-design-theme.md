# Cheersly Design System & Theme Specification

**Version**: 1.0  
**Date**: November 12, 2025  
**Status**: Draft

## Overview

This specification defines the visual design system for Cheersly, a workplace recognition application. The design balances professional corporate aesthetics with warmth and approachability to encourage positive workplace interactions.

## Design Philosophy

### Core Principles
1. **Professional but Approachable**: Corporate-ready with touches of warmth
2. **Clarity First**: High contrast, readable text, accessible color combinations
3. **Recognition-Focused**: Visual elements that celebrate achievements
4. **Modern & Clean**: Contemporary design without excessive ornamentation

### Tone & Personality
- **Professional**: Enterprise-ready, trustworthy
- **Warm**: Encouraging, positive, human
- **Energetic**: Not boring, has personality without being childish
- **Inclusive**: Accessible, welcoming to all users

---

## Color System

### Dark Mode Primary Colors

#### Background Colors
```css
/* Primary backgrounds */
--bg-primary: #0f172a      /* slate-900 - Main background */
--bg-secondary: #1e293b    /* slate-800 - Cards, panels */
--bg-tertiary: #334155     /* slate-700 - Elevated elements */

/* Interactive backgrounds */
--bg-hover: #475569        /* slate-600 - Hover states */
--bg-active: #64748b       /* slate-500 - Active/pressed states */
```

#### Text Colors
```css
/* High contrast for readability */
--text-primary: #f1f5f9    /* slate-100 - Primary text */
--text-secondary: #cbd5e1  /* slate-300 - Secondary text */
--text-tertiary: #94a3b8   /* slate-400 - Muted text, labels */
--text-disabled: #64748b   /* slate-500 - Disabled text */
```

#### Brand Colors

**Primary Brand - Blue** (Professional and trustworthy)
```css
--brand-primary-50: #eff6ff
--brand-primary-100: #dbeafe
--brand-primary-200: #bfdbfe
--brand-primary-300: #93c5fd   /* Accent highlights */
--brand-primary-400: #60a5fa   /* Interactive elements */
--brand-primary-500: #3b82f6   /* Primary brand color */
--brand-primary-600: #2563eb   /* Hover states */
--brand-primary-700: #1d4ed8   /* Active states */
--brand-primary-800: #1e3a8a
--brand-primary-900: #1e293b   /* rgb(30, 41, 59) - Deep brand color */
```

**Secondary - Amber** (Recognition & celebration)
```css
--accent-amber-50: #fffbeb
--accent-amber-100: #fef3c7
--accent-amber-200: #fde68a
--accent-amber-300: #fcd34d   /* Recognition highlights */
--accent-amber-400: #fbbf24   /* Points, achievements */
--accent-amber-500: #f59e0b   /* Celebration accents */
--accent-amber-600: #d97706
--accent-amber-700: #b45309
--accent-amber-800: #92400e
--accent-amber-900: #78350f
```

#### Semantic Colors

**Success - Emerald**
```css
--success-400: #34d399
--success-500: #10b981
--success-600: #059669
```

**Warning - Orange**
```css
--warning-400: #fb923c
--warning-500: #f97316
--warning-600: #ea580c
```

**Error - Rose**
```css
--error-400: #fb7185
--error-500: #f43f5e
--error-600: #e11d48
```

**Info - Blue**
```css
--info-400: #60a5fa
--info-500: #3b82f6
--info-600: #2563eb
```

### Border & Divider Colors
```css
--border-subtle: #334155    /* slate-700 - Subtle dividers */
--border-default: #475569   /* slate-600 - Standard borders */
--border-strong: #64748b    /* slate-500 - Emphasized borders */
--border-brand: #3b82f6     /* Primary brand borders */
```

---

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

**Rationale**: Inter is a highly legible sans-serif designed for screens, excellent for UI work.

### Type Scale

#### Headings
```css
/* h1 - Page titles */
.text-4xl: 36px (2.25rem), font-weight: 700, line-height: 1.2

/* h2 - Section headers */
.text-3xl: 30px (1.875rem), font-weight: 700, line-height: 1.25

/* h3 - Subsection headers */
.text-2xl: 24px (1.5rem), font-weight: 600, line-height: 1.33

/* h4 - Card headers */
.text-xl: 20px (1.25rem), font-weight: 600, line-height: 1.4

/* h5 - Small headers */
.text-lg: 18px (1.125rem), font-weight: 600, line-height: 1.5
```

#### Body Text
```css
/* Large body */
.text-lg: 18px (1.125rem), font-weight: 400, line-height: 1.75

/* Default body */
.text-base: 16px (1rem), font-weight: 400, line-height: 1.75

/* Small body */
.text-sm: 14px (0.875rem), font-weight: 400, line-height: 1.5

/* Extra small / captions */
.text-xs: 12px (0.75rem), font-weight: 400, line-height: 1.5
```

### Font Weights
- Regular: 400 (body text, descriptions)
- Medium: 500 (button text, tabs)
- Semibold: 600 (headings, emphasis)
- Bold: 700 (major headings, hero text)

---

## Spacing System

Use Tailwind's default spacing scale (4px base unit):

### Common Spacing Values
- `space-2`: 8px - Tight spacing (icon + text)
- `space-3`: 12px - Compact spacing
- `space-4`: 16px - Default spacing
- `space-6`: 24px - Comfortable spacing
- `space-8`: 32px - Section spacing
- `space-12`: 48px - Large section spacing
- `space-16`: 64px - Page sections

### Container Widths
- `max-w-7xl`: 80rem (1280px) - Main content container
- `max-w-4xl`: 56rem (896px) - Narrow content (forms, articles)
- `max-w-2xl`: 42rem (672px) - Very narrow content (modals)

---

## Component Design Patterns

### Cards
```tsx
/* Standard card */
<div className="bg-slate-800 rounded-lg border border-slate-700 p-6 
                shadow-lg hover:border-teal-500/50 transition-all">
  {/* content */}
</div>

/* Elevated card */
<div className="bg-slate-800 rounded-lg border border-slate-700 p-6 
                shadow-2xl ring-1 ring-slate-600/50">
  {/* content */}
</div>

/* Recognition card (cheers) */
<div className="bg-slate-800 rounded-lg border-l-4 border-l-amber-400 
                p-6 shadow-lg hover:shadow-amber-400/10">
  {/* content */}
</div>
```

### Buttons

#### Primary Button
```tsx
<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 
                   active:bg-blue-800 text-white font-medium 
                   rounded-lg shadow-lg shadow-blue-600/20
                   hover:shadow-blue-600/40 transition-all
                   focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:ring-offset-2 
                   focus:ring-offset-slate-900">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 
                   active:bg-slate-500 text-slate-100 font-medium 
                   rounded-lg border border-slate-600
                   hover:border-slate-500 transition-all
                   focus:outline-none focus:ring-2 
                   focus:ring-slate-400 focus:ring-offset-2 
                   focus:ring-offset-slate-900">
  Secondary Action
</button>
```

#### Ghost Button
```tsx
<button className="px-4 py-2 text-blue-400 hover:text-blue-300 
                   hover:bg-blue-500/10 rounded-lg font-medium 
                   transition-all focus:outline-none 
                   focus:ring-2 focus:ring-blue-400/50">
  Ghost Action
</button>
```

#### Danger Button
```tsx
<button className="px-6 py-3 bg-rose-600 hover:bg-rose-700 
                   active:bg-rose-800 text-white font-medium 
                   rounded-lg shadow-lg shadow-rose-600/20
                   transition-all focus:outline-none focus:ring-2 
                   focus:ring-rose-400 focus:ring-offset-2 
                   focus:ring-offset-slate-900">
  Destructive Action
</button>
```

### Form Elements

#### Input Fields
```tsx
<input className="w-full px-4 py-3 bg-slate-700 border border-slate-600
                  text-slate-100 placeholder-slate-400 rounded-lg
                  focus:outline-none focus:border-blue-500 
                  focus:ring-2 focus:ring-blue-500/20 transition-all" />
```

#### Textarea
```tsx
<textarea className="w-full px-4 py-3 bg-slate-700 border border-slate-600
                     text-slate-100 placeholder-slate-400 rounded-lg
                     focus:outline-none focus:border-blue-500 
                     focus:ring-2 focus:ring-blue-500/20 transition-all
                     resize-none" />
```

#### Select Dropdown
```tsx
<select className="w-full px-4 py-3 bg-slate-700 border border-slate-600
                   text-slate-100 rounded-lg
                   focus:outline-none focus:border-blue-500 
                   focus:ring-2 focus:ring-blue-500/20 transition-all">
  <option>Option 1</option>
</select>
```

#### Label
```tsx
<label className="block text-sm font-medium text-slate-300 mb-2">
  Field Label
</label>
```

### Navigation

#### Tab Navigation
```tsx
<nav className="flex border-b border-slate-700">
  {/* Active tab */}
  <button className="px-6 py-4 text-blue-400 border-b-2 border-blue-500 
                     font-medium text-sm transition-all">
    Active Tab
  </button>
  
  {/* Inactive tab */}
  <button className="px-6 py-4 text-slate-400 hover:text-slate-300 
                     hover:border-b-2 hover:border-slate-600 font-medium 
                     text-sm transition-all">
    Inactive Tab
  </button>
</nav>
```

#### Header/Navigation Bar
```tsx
<header className="bg-slate-800 border-b border-slate-700 shadow-lg">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    {/* Logo and nav content */}
  </div>
</header>
```

### Badges & Tags

#### Status Badge
```tsx
/* Success */
<span className="inline-flex items-center px-3 py-1 rounded-full 
                 text-xs font-medium bg-emerald-500/10 text-emerald-400 
                 border border-emerald-500/20">
  Active
</span>

/* Info */
<span className="inline-flex items-center px-3 py-1 rounded-full 
                 text-xs font-medium bg-blue-500/10 text-blue-400 
                 border border-blue-500/20">
  Info
</span>
```

#### Point Badge
```tsx
<span className="inline-flex items-center px-3 py-1.5 rounded-lg 
                 text-sm font-semibold bg-amber-500/10 text-amber-400 
                 border border-amber-500/30 shadow-lg shadow-amber-500/10">
  +10 points
</span>
```

### Alerts & Notifications

#### Success Alert
```tsx
<div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 
                text-emerald-400">
  <p className="font-medium">Success message</p>
</div>
```

#### Error Alert
```tsx
<div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 
                text-rose-400">
  <p className="font-medium">Error message</p>
</div>
```

#### Info Alert
```tsx
<div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 
                text-blue-400">
  <p className="font-medium">Info message</p>
</div>
```

### Loading States

#### Spinner
```tsx
<div className="animate-spin h-8 w-8 border-4 border-blue-500 
                border-t-transparent rounded-full"></div>
```

#### Skeleton Loader
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
</div>
```

---

## Layout Patterns

### Page Layout
```tsx
<div className="min-h-screen bg-slate-900 text-slate-100">
  {/* Header */}
  <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
    {/* Header content */}
  </header>
  
  {/* Main content */}
  <main className="max-w-7xl mx-auto px-6 py-8">
    <div className="space-y-6">
      {/* Page content */}
    </div>
  </main>
</div>
```

### Two-Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main content - 2 columns */}
  <div className="lg:col-span-2 space-y-6">
    {/* Primary content */}
  </div>
  
  {/* Sidebar - 1 column */}
  <div className="space-y-6">
    {/* Sidebar content */}
  </div>
</div>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

---

## Color Usage Guidelines

### When to Use Blue (Brand Primary)
- Primary action buttons
- Navigation active states
- Links and interactive text
- Focus states and rings
- Points to give display
- Brand elements (logo, headers)

### When to Use Amber (Recognition)
- Recognition/cheer cards (left border accent)
- Points received display
- Achievement badges
- Point amounts in cheers
- Celebration moments

### Color Hierarchy
1. **Blue**: Primary brand, actions, navigation
2. **Amber**: Recognition, rewards, positive moments
3. **Emerald**: Success states
4. **Rose**: Errors, destructive actions
5. **Slate**: Base UI, backgrounds, text

---

## Special Features for Recognition

### Cheer/Recognition Moments

#### Recognition Card
```tsx
<div className="bg-gradient-to-br from-slate-800 to-slate-800/50 
                rounded-lg border-l-4 border-l-amber-400 p-6 
                shadow-xl shadow-amber-500/5 hover:shadow-amber-500/10 
                transition-all">
  {/* Cheer content */}
  <div className="flex items-start justify-between mb-4">
    <div>
      <p className="text-sm text-slate-400">From John Doe</p>
      <p className="text-lg font-semibold text-slate-100">To Jane Smith</p>
    </div>
    <span className="inline-flex items-center px-3 py-1.5 rounded-lg 
                     text-sm font-bold bg-amber-500/20 text-amber-400 
                     border border-amber-500/40">
      +25 pts
    </span>
  </div>
  <p className="text-slate-200 leading-relaxed">{message}</p>
</div>
```

#### Points Display (Profile)
```tsx
{/* Points to Give */}
<div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 
                rounded-lg p-6 border border-blue-500/20 shadow-lg">
  <p className="text-sm font-medium text-blue-300 mb-2">Points to Give</p>
  <p className="text-5xl font-bold text-blue-400">50</p>
  <p className="text-xs text-blue-400/70 mt-2">Resets monthly</p>
</div>

{/* Points Received */}
<div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 
                rounded-lg p-6 border border-amber-500/20 shadow-lg">
  <p className="text-sm font-medium text-amber-300 mb-2">Points Received</p>
  <p className="text-5xl font-bold text-amber-400">142</p>
  <p className="text-xs text-amber-400/70 mt-2">Total accumulated</p>
</div>
```

---

## Animations & Transitions

### Transition Timing
```css
/* Fast - UI feedback */
transition: all 150ms ease-in-out;

/* Standard - Most interactions */
transition: all 250ms ease-in-out;

/* Slow - Larger movements */
transition: all 400ms ease-in-out;
```

### Hover Effects
- **Cards**: Subtle border color change, slight shadow increase
- **Buttons**: Background color shift, shadow increase
- **Links**: Color change, subtle underline

### Animation Examples
```tsx
{/* Fade in */}
<div className="animate-fade-in opacity-0 animation-delay-100">

{/* Slide up */}
<div className="animate-slide-up translate-y-4">

{/* Scale in */}
<div className="animate-scale-in scale-95">
```

---

## Accessibility Requirements

### Color Contrast
- **Text on background**: Minimum 7:1 for normal text (WCAG AAA)
- **Large text on background**: Minimum 4.5:1 (WCAG AA)
- **Interactive elements**: Clear focus states with 3:1 contrast

### Focus States
All interactive elements must have visible focus indicators:
```css
focus:outline-none focus:ring-2 focus:ring-[color] focus:ring-offset-2 
focus:ring-offset-slate-900
```

### Interactive Elements
- Minimum touch target: 44x44px
- Clear hover states
- Disabled states clearly indicated

---

## Implementation Notes

### Tailwind Configuration
Update `tailwind.config.mjs` with custom theme:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx,html}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom brand colors (using Tailwind's blue scale)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e3a8a',
          900: '#1e293b', // rgb(30, 41, 59)
        },
        // Recognition accent (using Tailwind's amber scale)
        recognition: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system'],
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.3)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.5)',
      }
    }
  },
  plugins: []
}
```

### CSS Variables Setup
Add to `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: 15 23 42;      /* slate-900 */
    --bg-secondary: 30 41 59;    /* slate-800 */
    --text-primary: 241 245 249; /* slate-100 */
  }
  
  body {
    @apply bg-slate-900 text-slate-100;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer components {
  /* Add custom component classes if needed */
}
```

### Component Library Structure
Create reusable component library in `src/components/ui/`:
- `Button.tsx`
- `Card.tsx`
- `Badge.tsx`
- `Input.tsx`
- `Alert.tsx`
- etc.

---

## Design Tokens Summary

| Token | Value | Usage |
|-------|-------|-------|
| Primary BG | `slate-900` (#0f172a) | Main background |
| Secondary BG | `slate-800` (#1e293b) | Cards, panels |
| Primary Text | `slate-100` (#f1f5f9) | Main text |
| Secondary Text | `slate-300` (#cbd5e1) | Supporting text |
| Brand Primary | `blue-500` (#3b82f6) | Primary actions, links |
| Brand Deep | `slate-800` (rgb(30,41,59)) | Deep brand color |
| Recognition | `amber-400` (#fbbf24) | Points, achievements |
| Border | `slate-700` (#334155) | Default borders |
| Radius | `rounded-lg` (8px) | Standard border radius |
| Shadow | `shadow-lg` | Standard elevation |

---

## Examples & Mockups

### Main Feed Page
```tsx
<div className="min-h-screen bg-slate-900 text-slate-100">
  <header className="bg-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-blue-400">Cheersly</h1>
      <button className="px-4 py-2 text-slate-300 hover:text-slate-100">
        Sign Out
      </button>
    </div>
  </header>
  
  <main className="max-w-4xl mx-auto px-6 py-8">
    <div className="space-y-6">
      {/* Recognition cards */}
    </div>
  </main>
</div>
```

---

## Migration Plan

### Phase 1: Foundation
1. Update Tailwind config with custom colors
2. Update global styles in index.css
3. Add Inter font (via Google Fonts or local)

### Phase 2: Component Updates
1. Update App.tsx layout and background
2. Update header/navigation components
3. Update authentication components

### Phase 3: Feature Components
1. Update CheerFeed components
2. Update CreateCheerForm
3. Update UserProfile

### Phase 4: UI Components
1. Create reusable Button component
2. Create Card component
3. Create Badge/Tag components
4. Create Form components

### Phase 5: Polish
1. Add transitions and animations
2. Test accessibility
3. Fine-tune spacing and typography

---

## References & Resources

- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Inter Font**: https://rsms.me/inter/
- **WCAG Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Color Palette Tool**: https://uicolors.app/

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-12 | 1.0 | Initial specification created |

