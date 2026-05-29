@AGENTS.md

## Monument Grotesk Font Metrics

Monument Grotesk has an **8.84px vertical offset** at 16px font-size. The font's ascent/descent ratio is **219:59** (78.8% ascent), which pushes the baseline extremely low in the line box. The visible ink (cap-height to descenders) centers at 20.84px in a 24px line box instead of 12px.

### Button text centering — CURRENT approach: `text-box-trim`
The offset is now handled globally in `app/globals.css`:
```css
button, [role="button"], a {
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;
}
```
This trims the font's box to cap-height/baseline so flex `align-items: center` centers the *visible ink*, not the line box.

**Therefore: do NOT add vertical padding to center text.** On a fixed-height flex button (e.g. HeroUI v3 `<Button>`, which is `inline-flex; align-items:center` with a fixed `h-10`/`h-11` and zero vertical padding), the global rule already centers correctly. Adding `pt-1 pb-5` on top of it **double-compensates** and pushes the text up (top-heavy). Use only horizontal padding (`px-8`) + `rounded-full`.

### Legacy padding hack (DEPRECATED — pre-`text-box-trim`)
Before `text-box-trim` was added (commit `091ea37`), centering was done with asymmetric padding: `pt-1` (4px) + `pb-5` (20px) on a padding-sized 48px button. This only applies to hand-rolled buttons that size themselves via padding AND don't inherit the global `text-box-trim` rule. Don't reach for it when `text-box-trim` is in effect.

### Font metrics reference
Monument Grotesk has an **8.84px vertical offset** at 16px / ascent:descent **219:59** (78.8% ascent), which is why `items-center` alone looks bottom-heavy without `text-box-trim`.
