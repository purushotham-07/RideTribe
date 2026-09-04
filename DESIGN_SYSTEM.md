# RideTribe Design System (v2.0)

A minimal, restrained, human-crafted design language for motorcycle and car touring convoys. Designed with the precision of an athletic timing system and the quiet confidence of an independent product studio.

---

## 1. Core Principles

1. **One Deliberate Accent, Everything Else Grayscale**  
   Color is reserved strictly for primary actions, active road telemetry, and live status. No rainbow badge walls, no purple-to-blue gradients.
2. **Hierarchy from Type and Space, Not Nested Boxes**  
   Cards and screens communicate priority through typography size, weight contrast, and generous negative space rather than drop shadows, colored borders, and nested containers.
3. **Real Photography as First-Class Content**  
   Ride route covers and vehicle imagery are treated as editorial focal points with clean aspect ratios, subtle contrast scrims, and zero sticker overlays.
4. **Athletic Data Density**  
   Route telemetry follows the "Large Number + Small Label" HUD pattern (`54` / `KM/H`), giving riders instant legibility at a glance.
5. **Considered Micro-Interactions**  
   Short, purposeful transitions (150–200ms ease-out) and tactile press states (`active:scale-[0.99]`). No bouncy decorative animations.

---

## 2. Typography

| Role | Font Family | Size | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / H1** | `Geist`, `sans-serif` | `40px` (2.5rem) | `44px` (1.1) | `-0.035em` | Main hero titles, live cockpit destination |
| **Heading / H2** | `Geist`, `sans-serif` | `28px` (1.75rem) | `34px` (1.2) | `-0.025em` | Section titles, modal headers |
| **Subhead / H3** | `Geist`, `sans-serif` | `20px` (1.25rem) | `26px` (1.3) | `-0.02em` | Card titles, subsection headings |
| **Body Large** | `Geist`, `sans-serif` | `16px` (1.0rem) | `24px` (1.5) | `-0.01em` | Primary descriptions, intro copy |
| **Body Standard** | `Geist`, `sans-serif` | `14px` (0.875rem) | `22px` (1.57)| `-0.005em` | Default UI text, form inputs, button labels |
| **Caption / Meta** | `Geist`, `sans-serif` | `12px` (0.75rem) | `16px` (1.33)| `0.0em` | Metadata timestamps, secondary labels |
| **Telemetry / HUD**| `Geist Mono`, `mono` | `14px–32px` | `1.0` | `-0.02em` | Speed, distance, bearing, timers, coordinates |

---

## 3. Color Tokens

### Charcoal Dark Palette (Default)
- **Canvas / Background**: `#0c0d10` (Deep warm charcoal, not pure black)
- **Surface / Card**: `#131519` (Elevated card container)
- **Surface Elevated / Popover**: `#1a1d23` (Modals, popups, dropdowns)
- **Hairline Border**: `#262930` (1px subtle boundary)
- **Primary Ink**: `#f4f4f6` (High-contrast white text)
- **Muted Ink**: `#8c93a0` (Secondary metadata text)
- **Subtle Ink / Disabled**: `#525866` (Placeholders, inactive elements)

### Architectural Light Palette
- **Canvas / Background**: `#fbfbfb` (Warm paper off-white)
- **Surface / Card**: `#ffffff` (Pure white card container)
- **Hairline Border**: `#e5e7eb` (1px crisp gray border)
- **Primary Ink**: `#111317` (Deep charcoal ink)
- **Muted Ink**: `#6b7280` (Medium gray metadata)

### Deliberate Accent Palette
- **Signal Road Accent (Primary)**: `#f04f23` (Vermilion / Safety Road Orange)
- **Signal Road Accent Hover**: `#d94116`
- **Signal Road Accent Subtle Fill**: `rgba(240, 79, 35, 0.08)`
- **Safety / SOS Crimson**: `#e11d48` (Emergency beacon only)
- **Live GPS / Online Mint**: `#10b981` (Convoy link indicator only)

---

## 4. Spacing Scale

Strict multiple of 4px / 8px:
- `1` = `4px`
- `2` = `8px`
- `3` = `12px`
- `4` = `16px`
- `6` = `24px`
- `8` = `32px`
- `12` = `48px`
- `16` = `64px`

---

## 5. Radius System

- **HUD / Gauges**: `rounded-sm` (`4px`) — sharp, tactical, instrument-like.
- **Buttons / Inputs**: `rounded-md` (`6px`) — restrained, tactile.
- **Cards / Containers**: `rounded-lg` (`8px`) — calm, architectural.
- **Pills / Status Dots**: `rounded-full` (`9999px`) — status indicators only.

---

## 6. Component Rules

- **Trip Cards**:
  - Minimum 16:10 or 3:2 photographic cover.
  - No floating emoji tags or random colorful badges.
  - Visible metadata at rest: Destination, Date & Time, Estimated Distance, Host name.
  - Detailed packing lists and descriptions belong in the detail view.
- **Buttons**:
  - Maximum **one solid primary CTA** per view (using `#f04f23` or `#111317` in light / `#f4f4f6` in dark).
  - Secondary actions use outline or subtle ghost styles (`border border-neutral-800 hover:bg-neutral-850`).
- **Icons**:
  - Lucide icons with uniform `strokeWidth={1.5}` or `1.75` and consistent 14px–16px sizing.
- **Map HUD**:
  - Low-saturation dark basemap (`CartoDB Dark Matter`).
  - Single confident 3.5px `#f04f23` route path.
  - HUD readout uses `font-mono text-2xl` for values and `text-[10px] tracking-wider uppercase` for labels.
