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
  `vendor/libreoffice-reference/`. The path is ignored by Git. Acquisition,
  baseline selection, upgrades, and any decision to copy reference-derived
  material require separate approved tasks.
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

The upstream baseline is LibreOffice `libreoffice-26.8.0.2` at commit
`9bc445578031fecf56086729d8e4940c77e14d65`. Its provenance, reproducible clone
procedure, and licensing boundary are recorded in the
[baseline specification](libreoffice-baseline.md). Every matrix entry remains
`inventory-pending` until deterministic tooling inventories the pinned source,
tests, fixtures, and documentation. Baseline upgrades are explicit program
changes that must regenerate those inventories and open tasks for every detected
delta.

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
- [LibreOffice baseline](libreoffice-baseline.md): immutable upstream identity,
  acquisition, provenance, and licensing boundary.
- [Inventory contract](inventory-contract.md): deterministic validation of the
  pinned four-corpus research input before atomic inventory generation.
- [Core module inventory](core-module-inventory.md): generated provenance-only
  list of pinned `Module_*.mk` declarations awaiting atomic mapping.
- [Core test inventory](core-test-inventory.md): generated gbuild test
  declarations awaiting assertion, fixture, and parity-ID mapping.
- [Core test source-target inventory](core-test-source-target-inventory.md):
  generated CppunitTest source-target provenance linked to existing constructor
  IDs and awaiting assertion, fixture, and parity-ID mapping.
- [Core JunitTest source-target inventory](core-junit-source-target-inventory.md):
  generated Java source-target provenance with tracked and explicitly missing
  pinned paths, linked to existing constructor IDs.
- [Core PythonTest module inventory](core-python-test-module-inventory.md):
  generated Python module provenance linked to existing constructor IDs and
  classified against the pinned core Git tree.
- [Core UITest Python source-target inventory](core-ui-test-source-target-inventory.md):
  generated physical Python source provenance under declared module roots,
  linked to existing UITest constructor IDs.
- [Core Cppunit registration inventory](core-cppunit-registration-inventory.md):
  generated Cppunit test-case registration provenance linked to existing
  physical source-target and constructor IDs.
- [Help topic inventory](help-topic-inventory.md): generated XHP help-path
  provenance awaiting topic, license, and local-documentation mapping.
- [Translation catalog inventory](translation-catalog-inventory.md): generated
  PO catalog provenance awaiting message, locale, license, and local-UI mapping.
- [Dictionary file inventory](dictionary-file-inventory.md): generated AFF/DIC
  provenance awaiting lexical-data, license, and language-tool mapping.
- [Architecture](architecture.md): browser domain boundaries and constraints.
- [Browser document lifecycle contract](document-lifecycle.md): shared serializable
  document-header states and pure transition boundaries before content editing.
- [Browser Writer paragraph body](writer-paragraph-body.md): bounded plain-text
  paragraph model and pure edit transitions implemented on the lifecycle contract.
- [Browser command registry](command-registry.md): typed, browser-independent
  command definitions, shortcut lookup, and dispatch outcomes.
- [Browser transaction history](transaction-history.md): immutable snapshot
  history, cursor selection, and pure apply/undo/redo transitions.
- [Test strategy](test-strategy.md): upstream-to-local behavioral evidence.
- [Documentation strategy](documentation-strategy.md): topic inventory and
  publication requirements.
- [Roadmap](roadmap.md): ordered task families and current next task.

When these documents disagree, the parity matrix controls completion status,
while an approved feature task controls the scope of its own change.

## Known program gaps

- The upstream source, test, and documentation corpora have not been inventoried.
- No upstream fixture, asset, sample, or documentation file is approved for
  copying; each candidate still requires the baseline's per-file provenance and
  licensing review.
- Native integrations and backend-dependent features need browser feasibility
  studies; they remain parity requirements until explicitly resolved.
- The current application is only a verified foundation preview; no LibreOffice
  feature has been mapped or implemented yet.
