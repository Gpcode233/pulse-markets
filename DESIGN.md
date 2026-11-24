# Pulse design system

Friendly fintech with a cover-first voice. Light theme. Previous version: `.ui-v1-backup/`.

## Idea
**Thermal colour means heat, and heat means risk.** Gradients and gauges replace probabilities and formulas.

## Colour
60% cool paper (`canvas`, white), 30% night ink (`indigo-navy`), 10% ember (`signal-orange`). Ember marks the thing being sold: main actions and the selected cover. Green is only for money received. Thermal ramp: night, violet, magenta, ember, amber, white. Always interpolate CSS gradients `in oklch`. Borders use alpha.

## Type
Familjen Grotesk for display, Hanken Grotesk for text. Fluid headline sizes (`display-1`, `display-2`). Tabular numerals for money. No monospace. Curly quotes.

## Shape and motion
Inner radius = outer radius minus padding. Press scales to 0.97 over 150ms. Entrances start at scale 0.97. Animate transforms. Respect reduced motion.

## 3D
`<Thermal shape="umbrella|coin|servers|flame|lifebuoy" />` renders an object; `<Thermal />` renders a heat field. Objects wear their real materials (navy cloth, black metal, gold, black server cases, fire, orange life ring); thermal colour stays on backgrounds and gauges. Objects hold still; only fire, server lights and rain move. Both share one WebGL context (`src/lib/thermalGl.ts`), pause off-screen and fall back to CSS gradients.

## Words
Say: cover, payout, you pay, you get, chance it happens. Keep out of customer screens: AMM, YES/NO, implied probability, tau, LVR, oracle.
Never call covers insurance. Keep the event-contract note in checkout and footers. Label example numbers. Show possible losses beside possible gains.
