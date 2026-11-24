# Pulse Markets — Column Design System

This document is the design contract for the Pulse Markets app. It is adapted from Column's visual language. **Light theme only.** It supersedes any dark-theme reference in the project brief.

## 1. Principles

1. **Clarity over density.** White surfaces, generous whitespace, one orange accent per page.
2. **Data is the hero.** Numbers are rendered in Geist Mono tabular-nums, in seafoam-700 (`#2e7f60`) so eyes land on them first.
3. **One orange surface per page.** Signal orange (`#ec652b`) is reserved for the single most important CTA or surface on a view. Anywhere else, use navy or seafoam.
4. **Hairline + whisper shadows.** Depth comes from a 1px silver-lining border and a very low-blur dark shadow — not dramatic drop shadows.

## 2. Color tokens

| Token | Hex | Use |
|---|---|---|
| `--canvas` | `#f6f6f8` | Page background |
| `--surface` | `#ffffff` | Cards |
| `--indigo-navy` | `#111a4a` | Primary buttons, headlines |
| `--indigo-ink` | `#0b1030` | Body text |
| `--signal-orange` | `#ec652b` | ONE accent per page |
| `--seafoam-700` | `#2e7f60` | Data numbers |
| `--seafoam-500` | `#44b48b` | Status dots, badges |
| `--silver-lining` | `#e6e6ea` | 1px borders |
| `--muted-ink` | `#6b7280` | Secondary labels |
| `--danger` | `#d64545` | Triggered / claim CTA |

## 3. Typography

- Display / body: **SuisseIntl → Inter** via `next/font/google`, weight 500–600, tracking `-0.02em` on headlines.
- Numbers / mono: **Geist Mono** with `font-variant-numeric: tabular-nums`.
- Scale: hero 56px, section head 32px, card title 18px, body 14px, caption 12px.

## 4. Components

### Buttons
- **Primary**: `bg-[#111a4a] text-white rounded-[8px] h-10 px-4 text-sm font-medium`.
- **Secondary**: `bg-transparent border border-[#111a4a] text-[#111a4a] rounded-[8px]`.
- **Danger / claim**: `bg-[#ec652b] text-white rounded-[8px]` — only when it is the page's one orange surface.

### Cards
- `bg-white rounded-[8px] border border-[#e6e6ea] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]`
- Transaction / product widget cards may escalate to `shadow-[0_12px_32px_-12px_rgba(16,24,40,0.18)]` for a floating feel (`shadow-xl-2`).

### Pills / badges
- 24px height, 999px radius, 1px silver-lining border, 12px label, seafoam dot `●` 6px for status.

## 5. Layout

- Max content width `1200px`.
- Section vertical gap `72px`.
- Card padding `24px`.
- Element gap inside a card `8px`.
- Two-column workspace split **7 / 5** (shields left, calculator right).

## 6. Motion

- Transitions `150ms ease-out`.
- Countdown numbers update in place without layout shift — fixed width per digit via tabular-nums.

## 7. Icons

- **Allowed**: `@tabler/icons-react` or `iconsax-react`.
- **Forbidden**: `lucide-react` (shadcn default). Any shadcn component replacing a lucide icon must swap for a tabler equivalent.
