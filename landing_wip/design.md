# Design System Inspired by Biologica

## 1. Visual Theme & Atmosphere

Biologica's design system embodies a sophisticated, science-driven wellness aesthetic with refined elegance and purposeful minimalism. The visual language balances deep, intimate dark tones with warm cream accents, creating an atmosphere of trust, vitality, and biological harmony. The design evokes a premium supplement brand rooted in clinical rigor and feminine empowerment, with clean typography, generous whitespace, and curated use of deep burgundy and warm gold accents that reference the brand's botanical and mineral-forward products. This is a brand that speaks to informed, health-conscious women who value both efficacy and aesthetic sophistication.

**Key Characteristics**
- Deep charcoal and near-black backgrounds creating intimate, high-contrast environments
- Warm cream and off-white surfaces providing breathing room and premium feel
- Strategic use of burgundy and rose tones for emotional connection and vitality
- Minimal, spacious layouts with intentional hierarchy
- Clean, modern typography with generous line spacing
- Emphasis on clinical credibility paired with warm, approachable messaging
- Refined, understated elegance without excessive ornamentation

## 2. Color Palette & Roles

### Primary
- **Deep Charcoal** (`#1B1A21`): Primary background and text color, establishing the foundational dark aesthetic throughout the interface
- **Cream Off-White** (`#EDEFEA`): Primary surface, button backgrounds, and high-contrast text against dark backgrounds

### Accent Colors
- **Burgundy Rose** (`#C7495E`): Emotional accent and highlight color, used for emphasis and brand personality
- **Warm Coral** (`#EA6854`): Secondary accent for warmth and energy, used sparingly for accent elements
- **Sage Purple** (`#676986`): Subtle accent for secondary UI elements and hover states

### Interactive
- **Primary Button** (`#1B1A21`): Dark background for primary call-to-action buttons with cream text
- **Secondary Button** (`#EDEFEA`): Light background for secondary actions with dark text
- **Ghost Button** (`#1B1A21`): Transparent background with dark border for tertiary actions

### Neutral Scale
- **Pure White** (`#FFFFFF`): Highest contrast surfaces and text overlays
- **Light Beige** (`#F4F5F2`): Subtle neutral surface variant
- **Warm Cream** (`#FFFAF6`): Warm-toned neutral for softer backgrounds
- **Medium Gray** (`#8A8A8A`): Secondary text and disabled states
- **Almost Black** (`#121212`): Deep text and alternative dark surface
- **True Black** (`#000000`): Maximum contrast for critical text
- **Darkest** (`#0A0A0A`): Shadow and deepest dark elements

### Surface & Borders
- **Card Border** (`#1B1A21`): Subtle dark border for card containers and content sections
- **Light Border** (`#EDEFEA`): Minimal border for light-mode surfaces

### Semantic / Status
- **Error Red** (`#FF2B0F`): Primary error and danger state indicator
- **Error Dark Red** (`#B50034`): Emphasis for critical error messages
- **Error Muted** (`#D8403A`): Secondary error state background

## 3. Typography Rules

### Font Family
**Primary:** The Future (custom brand typeface)
**Fallback stack:** `The Future, Poppins, sans-serif`

**Secondary:** Poppins with fallback to Open Sans
**Fallback stack:** `Poppins, Open Sans, sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| Display / H1 | The Future | 35px | 400 | 42px | 0px | Hero headlines and page titles |
| Heading | The Future | 24px | 500 | 30px | 0px | Section headings (inferred) |
| Subheading | The Future | 18px | 400 | 23.4px | 0px | Card titles and subsections |
| Body | The Future | 16px | 400 | 18px | 0px | Body copy and descriptions |
| Body Small | The Future | 12px | 500 | 16px | 0px | Small body text and details |
| Button Label | The Future | 14px | 500 | 16px | 0px | Primary and secondary buttons |
| Link | The Future | 14px | 500 | 16px | 0px | Navigation links and CTAs |
| Label / Caption | The Future | 14px | 400 | 25.2px | 0px | Form labels and captions |
| Input Text | The Future | 18px | 500 | 20.7px | 0px | Form input and textarea content |
| Code / Technical | Poppins | 12px | 400 | 16px | 0px | Code blocks and technical text |

### Principles
- **Generous spacing:** Line heights exceed typical ratios (1.2x to 1.5x font size) to create an airy, premium feel
- **Weight hierarchy:** Font weights (400, 500, 600, 700) establish clear visual hierarchy without multiple typeface families
- **Minimalist approach:** Limited size palette (12px, 14px, 16px, 18px, 24px, 35px) ensures consistency and clarity
- **Clinical precision:** The custom "The Future" typeface conveys scientific credibility and innovation
- **Accessibility:** All body text maintains minimum 12px size; interactive elements scaled to 14px minimum
- **Spatial typography:** Generous letter spacing at display sizes (H1) enhances readability and luxury feel

## 4. Component Stylings

### Buttons

#### Primary Button
- **Background:** `#1B1A21`
- **Text Color:** `#EDEFEA`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Padding:** `15px 35px`
- **Border Radius:** `16px`
- **Border:** `1px solid #1B1A21`
- **Height:** `auto`
- **Line Height:** `16px`
- **Hover State:** Background `#0A0A0A`, Text `#FFFFFF`
- **Active State:** Background `#000000`, Border `1px solid #000000`
- **Disabled State:** Background `#8A8A8A`, Text `#EDEFEA`, opacity `0.6`

#### Secondary Button
- **Background:** `#EDEFEA`
- **Text Color:** `#1B1A21`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Padding:** `15px 35px`
- **Border Radius:** `16px`
- **Border:** `1px solid #1B1A21`
- **Height:** `auto`
- **Line Height:** `16px`
- **Hover State:** Background `#FFFFFF`, Border `1px solid #000000`
- **Active State:** Background `#F4F5F2`, Border `1px solid #1B1A21`
- **Disabled State:** Background `#8A8A8A`, opacity `0.4`

#### Ghost Button
- **Background:** `transparent`
- **Text Color:** `#8A8A8A`
- **Font Size:** `36px`
- **Font Weight:** `400`
- **Padding:** `0px`
- **Border Radius:** `3px`
- **Border:** `0px none`
- **Width:** `49px`
- **Height:** `49px`
- **Line Height:** `36px`
- **Hover State:** Text Color `#1B1A21`, Background `rgba(237, 239, 234, 0.2)`
- **Active State:** Text Color `#000000`, Background `rgba(237, 239, 234, 0.4)`

#### Pill Button
- **Background:** `#EDEFEA`
- **Text Color:** `#1B1A21`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Padding:** `6px 14px`
- **Border Radius:** `30px`
- **Border:** `0px none`
- **Height:** `30px`
- **Line Height:** `16px`
- **Hover State:** Background `#F4F5F2`
- **Active State:** Background `#FFFFFF`

### Cards & Containers

#### Standard Card
- **Background:** `transparent`
- **Border:** `1px solid #1B1A21`
- **Border Radius:** `0px`
- **Padding:** `0px`
- **Text Color:** `#1B1A21`
- **Font Size:** `18px`
- **Font Weight:** `400`
- **Line Height:** `23.4px`
- **Box Shadow:** `none`
- **Hover State:** Border `2px solid #C7495E`

#### Card with Padding
- **Background:** `transparent`
- **Border:** `0px none`
- **Border Radius:** `0px`
- **Padding:** `50px 20px`
- **Text Color:** `#1B1A21`
- **Font Size:** `18px`
- **Font Weight:** `400`
- **Line Height:** `23.4px`
- **Box Shadow:** `none`

#### Card Compact
- **Background:** `transparent`
- **Border:** `0px none`
- **Border Radius:** `0px`
- **Padding:** `20px`
- **Text Color:** `#1B1A21`
- **Font Size:** `18px`
- **Font Weight:** `400`
- **Line Height:** `23.4px`
- **Box Shadow:** `none`

### Inputs & Forms

#### Text Input
- **Background:** `transparent`
- **Text Color:** `#1B1A21`
- **Font Size:** `12px`
- **Font Weight:** `500`
- **Padding:** `0px`
- **Border:** `0px none`
- **Border Radius:** `0px`
- **Height:** `100%`
- **Width:** `100%`
- **Line Height:** `12px`
- **Focus State:** Border Bottom `2px solid #1B1A21`
- **Placeholder Color:** `#8A8A8A`

#### Large Text Input
- **Background:** `transparent`
- **Text Color:** `#EDEFEA`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Padding:** `22px 0px`
- **Border:** `0px none`
- **Border Radius:** `0px`
- **Height:** `60px`
- **Width:** `290px`
- **Line Height:** `normal`
- **Focus State:** Border Bottom `1px solid #EDEFEA`
- **Placeholder Color:** `rgba(237, 239, 234, 0.5)`

#### Form Label
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Line Height:** `25.2px`
- **Text Color:** `#1B1A21`
- **Margin Bottom:** `8px`

### Navigation

#### Navigation Link
- **Background:** `transparent`
- **Text Color:** `#1B1A21`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Padding:** `16px 20px`
- **Border:** `0px none`
- **Border Radius:** `0px`
- **Line Height:** `18px`
- **Hover State:** Text Color `#C7495E`, Background `rgba(237, 239, 234, 0.1)`
- **Active State:** Text Color `#C7495E`, Border Bottom `2px solid #C7495E`

### Badges

#### Info Badge
- **Background:** `#EDEFEA`
- **Text Color:** `#1B1A21`
- **Font Size:** `12px`
- **Font Weight:** `500`
- **Padding:** `6px 12px`
- **Border Radius:** `12px`
- **Border:** `0px none`

#### Error Badge
- **Background:** `#FF2B0F`
- **Text Color:** `#FFFFFF`
- **Font Size:** `12px`
- **Font Weight:** `500`
- **Padding:** `6px 12px`
- **Border Radius:** `12px`
- **Border:** `0px none`

## 5. Layout Principles

### Spacing System
**Base Unit:** `4px`

**Scale:**
- `4px`: Micro spacing between icon and text
- `8px`: Minimal padding for compact components
- `12px`: Small padding for inputs and tight spacing
- `16px`: Standard padding for most components
- `20px`: Medium margin for section separation
- `24px`: Comfortable padding for cards
- `28px`: Spacing for grouped elements
- `32px`: Large padding for significant sections
- `40px`: Extra-large spacing between major sections
- `44px`: Margin between hero and content
- `48px`: Generous spacing for section separation
- `52px`: Maximum spacing for major layout blocks

**Usage Context:**
- Micro (`4px`): Icon spacing
- Compact (`8px–12px`): Form fields, small components
- Standard (`16px–24px`): Button padding, card padding, general spacing
- Generous (`28px–40px`): Section margins, breathing room
- Luxe (`44px–52px`): Major layout blocks, hero sections

### Grid & Container
- **Max Width:** `1200px` (inferred from card widths ~480px × 2-3 columns)
- **Column Strategy:** 2–3 column grid for desktop, single column for mobile
- **Gutter:** `20px` between columns
- **Horizontal Padding:** `20px` on desktop, `16px` on tablet, `12px` on mobile
- **Section Pattern:** Full-width hero, contained content blocks, alternating layouts

### Whitespace Philosophy
Biologica prioritizes spacious, breathing layouts that evoke luxury and reduce cognitive load. Negative space is strategic—generous margins around content sections, vertical rhythm through consistent line heights, and minimal visual clutter. The design avoids cramped arrangements, instead using whitespace as a design element that communicates premium positioning and scientific clarity.

### Border Radius Scale
- `0px`: Cards, large containers, and structural elements (default minimal radius)
- `3px`: Icon buttons and compact ghost buttons
- `10px`: Modal windows and overlays
- `12px`: Badge components and small accent elements
- `16px`: Primary and secondary buttons, CTA elements
- `30px`: Pill-shaped buttons and highly rounded accents

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | `box-shadow: none` | Default cards, buttons, form elements |
| Subtle | `box-shadow: 0px 2px 8px rgba(27, 26, 33, 0.08)` | Hover states on cards, slight elevation |
| Raised | `box-shadow: 0px 4px 16px rgba(27, 26, 33, 0.12)` | Modals, dropdowns, overlays |
| Floating | `box-shadow: 0px 8px 32px rgba(27, 26, 33, 0.16)` | Tooltips, popovers, floating elements |

**Shadow Philosophy:**
Biologica employs minimal, restrained shadows that enhance readability without overwhelming the minimal aesthetic. Shadows are used sparingly to create subtle depth—primarily on interactive hover states and elevated modals. The dark background naturally creates contrast, so shadows remain understated and cool-toned, maintaining the sophisticated, science-forward atmosphere. The brand avoids overly dramatic elevation effects, preferring clean borders and transparency over heavy shadow work.

## 7. Do's and Don'ts

### Do
- **Use generous whitespace** around text and components to maintain premium, breathing aesthetics
- **Prioritize dark backgrounds** (`#1B1A21`, `#121212`) as foundational surfaces, with cream (`#EDEFEA`) for contrast
- **Apply burgundy accents** (`#C7495E`) strategically to highlights, hover states, and emotional CTAs
- **Maintain minimal borders** (`0px` to `1px solid`) on cards and containers for a clean, modern look
- **Leverage line height and spacing** in typography to create visual hierarchy and readability (35px/42px for H1, 16px/18px for body)
- **Use The Future typeface** for brand consistency; employ Poppins as secondary for technical or data-heavy content
- **Stack buttons** with dark primary and light secondary variants for clear hierarchy
- **Maintain 49px minimum touch targets** for interactive elements on mobile
- **Use pill buttons** (`border-radius: 30px`) for soft, approachable actions
- **Apply subtle hover states** with background tints or border color shifts rather than heavy changes

### Don't
- **Don't mix excessive accent colors** — limit burgundy (`#C7495E`), coral (`#EA6854`), and sage (`#676986`) to specific roles
- **Don't add heavy shadows** or dramatic elevation; Biologica's aesthetic is flat with minimal depth
- **Don't use bright, high-contrast color combinations** that undermine the premium, calm atmosphere
- **Don't compress padding** below `12px` on standard components; maintain breathing room
- **Don't apply rounded corners** (`border-radius > 16px`) to large structural containers; reserve to buttons and badges
- **Don't exceed font sizes** beyond the established scale (35px/24px/18px/16px/14px/12px)
- **Don't use different typefaces** interchangeably; maintain The Future for UI/branding, Poppins for secondary content
- **Don't create multiple button styles** beyond primary, secondary, ghost, and pill variants
- **Don't forget accessible contrast** — maintain WCAG AA compliance on text over backgrounds
- **Don't animate excessively** — use subtle transitions (0.2s–0.3s) for interactive states

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Key Changes |
|-----------------|-------|-------------|
| Mobile | 320px–479px | Single column, full-width cards, stacked buttons, 12px padding |
| Tablet | 480px–768px | 2-column grid, reduced padding (16px), touch-optimized spacing |
| Desktop | 769px–1200px | 2–3 column grid, full spacing scale, optimized typography sizes |
| Large Desktop | 1200px+ | Maximum width container (`1200px`), 3-column layouts, generous whitespace |

### Touch Targets
- **Minimum Interactive Size:** `49px × 49px` (buttons, icon buttons)
- **Recommended Touch Padding:** `15px` horizontal, `12px` vertical (internal button padding)
- **Spacing Between Targets:** Minimum `8px` to avoid accidental interaction
- **Form Input Height:** `60px` (large text input), `100%` height on standard inputs

### Collapsing Strategy
- **Navigation:** Hamburger menu at `< 768px`; full horizontal nav at `≥ 768px`
- **Grid Layouts:** 3 columns at `≥ 1200px`, 2 columns at `480px–1199px`, 1 column at `< 480px`
- **Card Widths:** Full width at mobile (`width: 100%`), 50% at tablet, auto at desktop
- **Typography:** H1 reduces from `35px` to `28px` at tablet, `24px` at mobile
- **Padding:** Sections reduce from `52px` to `32px` at tablet, `20px` at mobile
- **Button Width:** Full width at mobile, `auto` at tablet and above
- **Whitespace:** Reduce margins by 25% on tablet, 50% on mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA:** Dark Button (`#1B1A21` background, `#EDEFEA` text)
- **Secondary CTA:** Light Button (`#EDEFEA` background, `#1B1A21` text)
- **Background (Dark):** Deep Charcoal (`#1B1A21`)
- **Background (Light):** Cream (`#EDEFEA`)
- **Accent Highlight:** Burgundy Rose (`#C7495E`)
- **Text Primary:** Deep Charcoal (`#1B1A21`) on light, Cream (`#EDEFEA`) on dark
- **Text Secondary:** Medium Gray (`#8A8A8A`)
- **Borders:** Dark Border (`#1B1A21`), Light Border (`#EDEFEA`)
- **Error State:** Error Red (`#FF2B0F`)
- **Surface Soft:** Light Beige (`#F4F5F2`)

### Iteration Guide

1. **Color Foundation:** Always establish surfaces as either `#1B1A21` (dark) or `#EDEFEA` (light/cream); alternate for contrast.

2. **Typography Baseline:** Default to The Future font; sizes limited to `12px`, `14px`, `16px`, `18px`, `24px`, `35px`; line heights `1.2x–1.5x` the font size.

3. **Spacing Rhythm:** Use `16px` as standard padding for components; scale up to `24px–32px` for card/section padding; use `20px–52px` for margin between sections.

4. **Button Hierarchy:** Primary buttons dark (`#1B1A21` bg, `#EDEFEA` text), secondary light (`#EDEFEA` bg, `#1B1A21` text), ghosts transparent with icon only.

5. **Border Radius Consistency:** Cards and large containers use `0px` (flat), buttons use `16px` (rounded), pills use `30px` (max roundness), badges use `12px`.

6. **Interactive States:** On hover, apply subtle background tint (opacity 0.1–0.2), border color shift, or text color change to burgundy (`#C7495E`); avoid heavy shadows.

7. **Accent Accent Application:** Reserve burgundy (`#C7495E`) for hover states, links, highlights, and emotional CTAs; use sparingly to maintain hierarchy.

8. **Whitespace Strategy:** Generous line heights (`1.2x–1.5x`), padding scales (`16px–52px`), and margin between sections create premium, breathing layout.

9. **Accessibility:** Maintain minimum `12px` font size; ensure WCAG AA contrast (dark on light, light on dark); touch targets minimum `49px × 49px`.

10. **Responsive Collapse:** Single column at mobile, 2 columns at tablet, 2–3 columns at desktop; reduce padding by 50% on mobile, 25% on tablet; scale typography down by 1–2 steps.