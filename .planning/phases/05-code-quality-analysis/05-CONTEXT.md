# Phase 5: Code-Quality-Analysis - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Comprehensive code analysis using ESLint, TypeScript strict mode, Svelte checks, and documentation verification (Ref/Context7) to establish production-level correctness. This is a quality gate — fix existing code, document patterns, and prepare GSD workflows for Serena/Ref integration. No new features.

</domain>

<decisions>
## Implementation Decisions

### Fix Approach
- Fix everything: zero errors AND zero warnings — no exceptions
- Document mistakes: record patterns that caused errors and how to avoid them (for Claude's future reference, stored where optimal in workflow)
- Prefer simplicity: if a simpler method exists (less logic, less code), use it over patching the error
- Fix all occurrences: when a bad pattern is found, search and fix every instance in codebase
- Refactoring: write todos for non-error refactors that would improve code but aren't strictly broken

### Scope Depth
- All code equally: every file gets same scrutiny (no priority tiers)
- Include packages/db: schema, migrations, queries — full analysis
- Config optimization: review eslint, tsconfig, vite configs for strictest useful settings
- Document patterns: create reference patterns for Phases 6-8, stored in Serena memories

### Documentation Verification
- Verify ALL patterns: check every API usage against current official docs
- Libraries to verify: SvelteKit, Svelte 5, Drizzle, Tailwind v4, Square SDK, Storyblok, shadcn-svelte
- Update if safe: apply recommended patterns if change doesn't cascade; document as todo if comprehensive/interrelated
- Strict Svelte 5: ensure all patterns are native Svelte 5 runes — no legacy Svelte 4 patterns

### Handling Big Changes
- Multi-file changes: document as todo rather than execute immediately
- Interrelated code: if changed code is used elsewhere in app, flag for user approval before changing
- Architectural concerns: flag for discussion — don't silently work around
- Verification: run dev server and test flows after fixes; build checks at logical intervals

### Foundational Analysis Principle
- **Serena as primary traversal**: use Serena MCP for all repo navigation (search, edit, scan)
- **Ref as primary research**: use Ref MCP for documentation, planning references, error resolution
- **GSD workflow modification**: Phase 5 must produce a plan to modify executor + planner (minimum) workflows to mandate Serena/Ref usage; a separate todo for applying changes to all remaining GSD workflows
- **Svelte-first principle**: Svelte's published documentation on style/syntax/patterns is the foundation. Libraries working with Svelte adapt to Svelte idioms
- **Conflict resolution**: if library conflicts with Svelte — use more recent docs; use library's exact use cases if available; adapt only as last resort. Svelte first unless it's reinventing the wheel

### Claude's Discretion
- Risk assessment for runtime behavior changes (if types pass but behavior might change)
- Where to store documentation for own reference (workflow-optimal placement)
- Compression algorithm for pattern documentation (avoid redundancy)

</decisions>

<specifics>
## Specific Ideas

- "Svelte is lesser known than React so problems occur" — verification against Svelte 5 docs is critical
- GSD workflow modification is part of this phase's deliverable, not just code analysis
- Serena memories should store both quick-reference patterns AND detailed in CONTEXT files
- Build checks should happen at logical intervals, not after every single fix

</specifics>

<deferred>
## Deferred Ideas

- Applying Serena/Ref to ALL GSD workflows — captured as todo after minimum (executor/planner) changes
- Any new features discovered during analysis — out of scope for quality gate

</deferred>

---

*Phase: 05-code-quality-analysis*
*Context gathered: 2026-01-21*
