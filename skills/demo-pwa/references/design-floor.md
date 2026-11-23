# Design floor (only when impeccable and frontend-design are not installed)

This is a minimum, not a design method. With impeccable installed, ignore this file.

## Direction
- Before coding, write 6 lines in `docs/DESIGN.md`: concept from the trade (one sentence), palette (4 to 6 named hex values), typeface and roles, the one memorable element, layout for phone and desktop, what you will not do.
- The concept comes from the client's world: an object, document or tool of the trade (a service ticket, a parts diagram, a recipe card, an appointment card). Use it in one place, strongly. Keep the rest quiet.
- One accent color plus status colors. Neutrals tinted toward the brand, not pure grey. No pure black (#000) or white (#fff) backgrounds.

## Avoid (these read as "generated")
- Warm cream background with a serif display and a terracotta accent.
- Purple or blue gradients, glowing buttons, glassmorphism on app screens.
- Every section in identical rounded cards with the same soft shadow.
- ALL-CAPS tracked labels above every heading, `·` joining every piece of metadata, `→` on every link, numbered "01 / 02 / 03" markers on things that are not a sequence.
- Icons drawn by hand. Use one icon library (lucide-react) and one stroke width.

## Type
- One family, maybe two if clearly distinct. Self-hosted woff2, latin subset, `font-display: swap`.
- Body 16 px on phones. Numbers that compare (money, quantities) use `tabular-nums`.

## Layout
- Customer: bottom tab bar on phones (4 or 5 items, icon plus label), top bar with business name and account.
- Admin: sidebar on desktop, collapses to a menu on phones. Tables become stacked rows on phones.
- The first screen answers the user's main question in one glance (for a workshop customer: "how is my motorcycle?").
