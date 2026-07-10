---
name: figma-review
description: Translate Figma designs into code and review implementations against Figma. Use when a Figma link/export is provided as the source of truth for UI work.
---

# Figma Review

Requires the Figma MCP server (see `mcp/figma.md`) or exported frames/screenshots as input.

## Design → code procedure

1. Pull the frame (MCP `get_file` / provided export). Inventory: layout grid, spacing values, type sizes, colors, components used.
2. **Map to system, don't transcribe**: Figma `#2A9D8F` → nearest token (`primary`); 18px gap → `gap-4` or `gap-5` (nearest 4-px step); text style → nearest scale step. Flag any Figma value with no token equivalent — propose a token addition (design-system skill) rather than hardcoding.
3. Map Figma components to `component-library.md` entries; reuse existing PropertyCard etc. even if the mock redraws it slightly (raise the discrepancy, don't fork the component).
4. Build breakpoint behavior even if Figma only shows desktop — infer mobile from ui-guidelines.md patterns and say so.

## Implementation review procedure (code vs Figma)

Compare side by side (screenshot MCP for rendered output) and report:

```
## Figma parity: <frame name>
| Element | Figma | Implementation | Verdict |
- spacing/size deltas > 4px = flag; color/token mismatches = flag
- intentional deviations (system tokens, responsive) = note as approved deltas
```

## Rules

- The design system wins conflicts with the mock; the mock wins layout/content decisions. Record every deviation.
- Never eyeball colors from screenshots when MCP values are available.
- Pixel-perfection target: within 4px spacing, exact tokens, exact type scale.
