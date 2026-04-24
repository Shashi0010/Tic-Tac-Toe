# Engineering Standards & Rules

This repository follows a strict, enterprise-grade architecture as defined in `RFC_SYSTEM_DESIGN.md`.

## Core Principles

- **RFC Adherence:** All implementation must strictly follow the architectural decisions, communication protocols, and data structures defined in `RFC_SYSTEM_DESIGN.md`.
- **Type Safety:** Use TypeScript exclusively. The use of `any` is strictly prohibited. All types must be explicitly defined and exported from `packages/shared`.
- **UI/UX Rigor:** All frontend code must use Tailwind CSS. Follow a neutral, high-contrast corporate design system (Slate/Zinc palettes). Avoid "playful" or "vibrant" aesthetics (no "purple vibe" code). Use Radix/Shadcn primitives.
- **Safety First:** Never execute destructive commands (e.g., `rm -rf`, `git reset --hard`, `git push --force`) without explicit user authorization.

## Development Workflow

1. **Implementation Order:** Always follow the execution sequence defined in the RFC.
2. **Monorepo Discipline:** Respect the boundaries between `apps/web`, `apps/server`, and `packages/shared`.
3. **Contract-Driven Development:** Define changes in `packages/shared` before implementing consumers in `apps/`.
