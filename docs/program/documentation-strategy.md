# Documentation Parity Strategy

## Objective

Vite Office documentation must cover every topic in the pinned LibreOffice
documentation baseline and accurately describe the browser implementation. A
topic is not complete merely because a similarly titled page exists.

Documentation parity is tracked through stable topic records mapped to the
[parity matrix](parity-matrix.md). No complete upstream topic inventory exists
yet; the reference-inventory task owns that evidence.

## Documentation inventory

The pinned inventory must include, where present upstream:

- built-in help pages and help IDs;
- Writer, Calc, Impress, Draw, Base, Math, and Chart user guides;
- getting-started, installation, migration, and release material;
- format compatibility and interoperability guidance;
- accessibility, keyboard, localization, and language guidance;
- developer, extension, macro, UNO, SDK, and API documentation;
- examples, tutorials, screenshots, diagrams, and sample files;
- context-sensitive links exposed by commands and dialogs.

Each record contains upstream path/URL or source identifier, title, locale,
version/SHA, content kind, related parity IDs, local destination, implementation
status, review status, and known gaps.

## Local documentation sets

| Set | Required content |
| --- | --- |
| User guide | Tasks, concepts, keyboard workflows, browser constraints, recovery, and examples |
| Context help | Command, dialog, panel, error, and empty-state guidance linked from the UI |
| Format guide | Supported features, round-trip behavior, conformance, loss warnings, and provenance |
| Accessibility guide | Keyboard model, assistive technology, zoom, contrast, motion, and accessible output |
| Localization guide | Available locales, writing systems, locale-sensitive behavior, and contribution flow |
| Developer architecture | Package boundaries, commands, models, workers, rendering, storage, and decisions |
| API reference | Generated TypeScript/JSDoc APIs plus hand-written contracts and examples |
| Contributor guide | Task workflow, parity IDs, tests, docs, fixtures, review, and release evidence |
| Security guide | Untrusted documents, sandboxing, active content, dependencies, and reporting |

Browser-specific constraints must be stated alongside the relevant task, not
hidden in a general limitations page.

## Source-level JSDoc contract

Every authored source file starts with `@fileoverview` describing purpose,
domain boundary, key collaborators, side effects, and relevant parity IDs.

Every function and method documents:

- purpose and observable behavior;
- each `@param`, including units, valid values, ownership, and mutation;
- `@returns`, including meaning, ownership, and async resolution;
- `@throws` or rejection conditions;
- side effects, invariants, browser support, and cancellation behavior;
- parity IDs and format/spec references where relevant.

Classes, interfaces, types, enums, components, hooks, workers, message schemas,
and non-obvious constants receive equivalent documentation. Public declarations
must generate usable API reference pages. Internal declarations are checked too,
because the user explicitly requires documentation of all code.

Generated and vendored content is marked at file level and excluded only through
reviewed configuration. An exemption cannot cover hand-authored code.

## File-size documentation gate

Documentation tooling must report physical lines for authored source:

- above 500 lines: record a decomposition review in the owning task;
- at or above 1,000 lines: fail validation until decomposed;
- generated/vendor paths: report separately with explicit classification.

The report should link oversized modules to their architectural responsibility
so decomposition preserves domain boundaries rather than producing arbitrary
fragments.

## Topic mapping and review

For each upstream topic:

1. map it to stable parity IDs and a local topic ID;
2. preserve its user outcomes, prerequisites, edge cases, and examples;
3. adapt native-desktop instructions to verified browser behavior;
4. document any divergence at the exact point of use;
5. test commands, links, sample files, keyboard shortcuts, and screenshots;
6. obtain technical and editorial review;
7. keep the capability below `verified` until the topic evidence is current.

Machine translation may assist but never constitutes localization review.
Localized topic parity must track source freshness and fallback behavior.

## Documentation tests

The bootstrap and documentation-tooling tasks should add checks for:

- broken internal and external links;
- missing pages and orphaned topics;
- invalid code snippets and commands;
- missing or malformed JSDoc on authored declarations;
- undocumented public API symbols;
- unknown or missing parity IDs;
- heading, terminology, spelling, and style consistency;
- stale screenshots and sample files;
- accessibility of generated documentation;
- topic counts and mappings against the pinned upstream inventory.

Checks must run on the static production output, not only source Markdown.

The bootstrap implements the source-documentation subset through ESLint and
`scripts/check-jsdoc.mjs`: every authored JavaScript or TypeScript file starts
with `@fileoverview`; executable functions document every parameter and their
return; classes, enums, interfaces, and type aliases have attached JSDoc. The
file-size checker applies the documented 500/1,000-line thresholds. Link,
topic-count, generated API-reference, screenshot, sample-file, and upstream
mapping checks remain separate tasks and are not claimed by this baseline.

## Completion gate

Documentation parity is achieved only when every upstream topic has a reviewed
local mapping or a user-approved visible exception, every implemented feature
links to current local guidance, all authored code satisfies the JSDoc contract,
and documentation tests pass at the pinned baseline.

See the [program charter](README.md), [test strategy](test-strategy.md), and
[roadmap](roadmap.md).
