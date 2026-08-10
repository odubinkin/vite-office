# Browser Office Program Charter

## Mission

Build a from-scratch office suite in TypeScript that runs directly in modern
browsers from static files produced by Vite and styled with Tailwind CSS. The
target is functional, test, and documentation parity with a pinned LibreOffice
baseline while preserving recognizable domain boundaries where they remain
useful in a browser architecture.

This charter defines the non-negotiable rules for all later tasks. It does not
claim that any LibreOffice feature is already implemented.

## Product constraints

- The deployable product is static frontend content. It must not require an
  application server, server-side rendering, or a proprietary cloud service.
- Local browser APIs, Web Workers, Service Workers, WebAssembly, IndexedDB,
  Origin Private File System, and user-mediated file APIs may be used.
- Existing maintained TypeScript or JavaScript libraries should be preferred
  when they reduce risk and do not prevent parity, offline use, static hosting,
  accessibility, or acceptable licensing.
- A local LibreOffice checkout may be used for research only at
  `vendor/libreoffice-reference/`. The path must be ignored by Git before any
  clone begins. Adding that implementation-classified ignore entry, acquisition,
  baseline selection, and licensing review require their own tasks.
- Repository artifacts are written in English unless a task explicitly
  requires localized output.

## Meaning of parity

Parity is evidence-based and has three independent dimensions:

1. **Functional parity** means a mapped upstream capability produces an
   equivalent user-observable result within documented platform constraints.
2. **Test parity** means every behavior covered by the pinned upstream test
   corpus is inventoried and mapped to an executable local test or an explicit,
   approved platform-feasibility decision. A line-coverage percentage alone is
   insufficient.
3. **Documentation parity** means every mapped upstream user, help, developer,
   API, accessibility, localization, and format-compatibility topic has a local
   counterpart that matches the implemented browser behavior.

A capability is `verified` only when all three dimensions have current evidence
in the [parity matrix](parity-matrix.md). Missing evidence is a gap, not implied
completion.

## Baseline policy

The upstream baseline must be one immutable LibreOffice release tag plus commit
SHA. Until a dedicated reference-inventory task records both, every matrix entry
remains `inventory-pending`. Baseline upgrades are explicit program changes that
must regenerate the feature, test, and documentation inventories and open tasks
for every detected delta.

## Delivery policy

- Every newly implemented feature is delivered through its own executable
  AgentPlane task. Closely coupled behavior may share a task only when the task
  has one bounded user outcome and one verification contract.
- A feature task is vertical: implementation, mapped tests, user/developer
  documentation, accessibility and localization impact, and matrix evidence are
  completed together.
- Cross-cutting foundations such as the application shell, document model,
  rendering, import/export, and test tooling receive separate prerequisite
  tasks.
- Material scope, security, network, or verification drift requires renewed
  approval under repository policy.
- A feature must never be marked complete merely because a UI control exists or
  a coverage threshold passes.

## Source documentation standard

Every authored source file must begin with a detailed JSDoc file overview using
`@fileoverview`. Every exported or internal function, method, class, interface,
type, enum, component, hook, worker message, and non-obvious constant must have
JSDoc describing responsibility and relevant constraints.

Function and method documentation must include:

- every input with `@param`, including units, allowed ranges, and mutation rules;
- `@returns` with the value meaning and ownership, including `void` when useful;
- `@throws` for every intentional error class or rejected condition;
- side effects, async behavior, browser/API constraints, and invariants;
- mapped parity IDs where the implementation represents upstream behavior.

Generated or vendored files must be visibly identified and excluded only by an
explicit tooling rule. File-level exemptions require a documented rationale.

## Module-size standard

- Files above 500 physical lines are decomposition candidates and must produce a
  recorded review decision.
- Files at or above 1,000 physical lines must be decomposed before a feature task
  can pass.
- Generated and vendored files may be reported separately but must not hide
  oversized authored modules.
- Tooling added during bootstrap must enforce the mandatory threshold and report
  the review threshold.

## Program records

The following documents form the program control plane:

- [Parity matrix](parity-matrix.md): status and traceability source of truth.
- [Architecture](architecture.md): browser domain boundaries and constraints.
- [Test strategy](test-strategy.md): upstream-to-local behavioral evidence.
- [Documentation strategy](documentation-strategy.md): topic inventory and
  publication requirements.
- [Roadmap](roadmap.md): ordered task families and current next task.

When these documents disagree, the parity matrix controls completion status,
while an approved feature task controls the scope of its own change.

## Known program gaps

- No immutable LibreOffice baseline has been selected.
- The upstream source, test, and documentation corpora have not been inventoried.
- Licensing and attribution rules for reference-derived fixtures or assets have
  not been recorded.
- Native integrations and backend-dependent features need browser feasibility
  studies; they remain parity requirements until explicitly resolved.
- Application source, build tooling, and automated quality gates do not yet
  exist. They are the next bounded task in the [roadmap](roadmap.md).
- The reference checkout path is not yet present in `.gitignore`; the bootstrap
  code task must add it before the separately approved clone task runs.
