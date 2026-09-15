# LibreOffice Parity Matrix

## Purpose

This matrix is the authoritative index connecting the pinned LibreOffice
baseline to Vite Office implementation, tests, and documentation. The coarse
suite table remains a planning inventory; machine-readable JSON records are the
source of truth for atomic capability maturity.

The first authored atomic records live in
[`parity/writer-command-slice.json`](parity/writer-command-slice.json). Its 35
bounded Writer records are machine-validated together with the exhaustive
[`parity/runtime-inventory.json`](parity/runtime-inventory.json) by
`npm run inventory:parity`. Verification is promoted per atomic operation only
after its assertion-level upstream/local evidence and task result are recorded;
every unresolved parity gap remains visible and does not count as parity.
The current slice contains 34 `implemented` records and one `verified` record:
CAP-0130, the bounded ODF fixture round trip. CAP-0135 records Writer text
hyperlinks, their browser commands, and `text:a` interoperability.

## Stable identifier format

Every atomic record has a domain-agnostic `CAP-<NNNN>` identity that remains
stable if suite ownership changes. Existing published `LO-<DOMAIN>-<NNNN>` IDs
are retained as immutable compatibility aliases. A split capability receives
new IDs instead of reusing an existing identity.

## Required traceability fields

Each atomic capability record must contain:

| Field | Required evidence |
| --- | --- |
| Capability ID | Immutable domain-agnostic `CAP-<NNNN>` identifier. |
| Legacy parity ID | Immutable published `LO-<DOMAIN>-<NNNN>` alias. |
| Capability | One user-observable or compatibility behavior. |
| Suite, subsystem, type | Current ownership and one of command, model, filter, platform, lifecycle, or infrastructure. |
| Assertions/manual contract | Exact upstream assertions or a formal manual verification contract. |
| Upstream source | Paths and symbols at the pinned LibreOffice SHA. |
| Upstream tests | Test paths, cases, fixtures, and relevant assertions. |
| Upstream docs | Help IDs, guide/API pages, or an evidenced `none`. |
| Local implementation | TypeScript modules, components, workers, or adapters. |
| Local tests | Executable tests and fixtures covering mapped assertions. |
| Local docs | User, developer, API, accessibility, and format topics. |
| Maturity | One lifecycle value from the table below. |
| Stack divergence | Allowlisted classification and concrete rationale. |
| Verification | Task ID, commit, and executable evidence for a closed record. |
| Gaps | Known behavioral, platform, test, or documentation differences. |
| Scope limitations | Unsupported behavior outside the atomic operation; visible but not a claim that the operation itself is incomplete. |

## Status lifecycle

| Maturity | Meaning |
| --- | --- |
| `planned` | An approved AgentPlane feature task owns the mapped behavior. |
| `mapped` | Upstream source, tests, documentation, and assertions are referenced. |
| `implemented` | Code exists, but complete parity evidence is not yet recorded. |
| `verified` | Functional, test, and documentation evidence all pass. |
| `exception-approved` | A user-approved divergence is documented with rationale. |

Only `verified` counts toward parity. `exception-approved` is visible debt and
does not silently count as equivalent functionality.

A `verified` record must have no gaps, must reference an executable local test,
and must include task, commit, and verification evidence. An
`exception-approved` record requires the same closure evidence plus its explicit
approval. Implemented code without complete semantic evidence stays
`implemented` even when its local test suite is green.

`scopeLimitations` is distinct from `gaps`: it records adjacent LibreOffice
behavior that the deliberately bounded atomic operation does not claim. Moving
text from `gaps` to `scopeLimitations` requires an assertion-level review; it
must never be used to hide incomplete behavior inside the asserted operation.

An exception may apply to a whole capability or to one upstream test reference.
It is an explicit `not-implementable` disposition, not an implementation claim,
and must include a concrete browser rationale, an `approvedBy` decision
reference, and one reason: `browser-runtime-supersedes` when a browser primitive
subsumes native low-level plumbing, or `browser-runtime-inapplicable` when the
desktop behavior has no meaningful browser counterpart. A whole-capability
exception may leave local implementation and test evidence empty, but must retain
all upstream evidence and local documentation of the decision. A test exception
is allowed only on an `upstream.tests` reference. The parity report lists both
forms separately, so neither can count as mapped or verified coverage.

## Coarse seed inventory

The rows below are intentionally non-atomic planning groups. Their legacy
`inventory-pending` label does not participate in the atomic maturity schema and
cannot be counted as parity.

| Parity ID | Capability group | Upstream source | Upstream tests | Upstream docs | Local implementation | Local tests | Local docs | Status | Evidence | Gaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LO-SHARED-0001 | Desktop-equivalent shell, commands, menus, dialogs, settings, and lifecycle | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Non-capability foundation preview in `apps/office`; parity implementation not started | Bootstrap unit, browser, accessibility, and static-build smoke checks only | Root README and this program set | `inventory-pending` | Task 202608100625-NNM998 seeds the group; Task 202608100659-GY449B supplies infrastructure only | Must split into atomic shell capabilities before any implementation claim |
| LO-WRITER-0001 | Writer document authoring and layout | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Must split by editing, layout, fields, references, review, and output behavior |
| LO-CALC-0001 | Calc worksheets, formulas, analysis, and calculation | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Must split by formula, cell, sheet, chart, data, and calculation behavior |
| LO-IMPRESS-0001 | Impress slide authoring, playback, and export | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Must split by editing, master, animation, transition, playback, and export behavior |
| LO-DRAW-0001 | Draw vector graphics and diagrams | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Must split by shape, connector, text, page, layer, and export behavior |
| LO-BASE-0001 | Base database documents, tables, queries, forms, and reports | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Browser-only data engines and external database access need feasibility tasks |
| LO-MATH-0001 | Math formula authoring, parsing, rendering, and embedding | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Must split parser, symbol, layout, accessibility, import, and export behavior |
| LO-CHART-0001 | Shared chart model, editing, rendering, and format compatibility | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Must map Writer, Calc, Impress, and Draw embedding behavior |
| LO-FORMAT-0001 | OpenDocument, OOXML, legacy, text, image, PDF, and print interchange | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Must split by format, version, round trip, conformance, and fidelity fixture |
| LO-AUTO-0001 | Macros, scripting, UNO-compatible automation, and extensions | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Browser sandbox and native extension model require explicit feasibility analysis |
| LO-A11Y-0001 | Keyboard, assistive technology, semantic UI, and accessible documents | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Must map UI and authored-document accessibility separately |
| LO-L10N-0001 | Localization, locale data, bidirectional text, fonts, and input methods | Pending baseline inventory | Pending baseline inventory | Pending baseline inventory | Not started | Not started | Not started | `inventory-pending` | None | Must inventory locales, resources, writing systems, and locale-sensitive behavior |

## Expansion rules

The reference-inventory task must generate or maintain machine-readable records
from the same fields rather than treating this Markdown table as the only data
store. Generated summaries must remain reviewable in Git.

For every upstream test:

1. identify the behavior and atomic parity ID it proves;
2. record its inputs, fixtures, assertions, and platform assumptions;
3. link one or more local tests that preserve those assertions;
4. record unsupported assumptions as explicit gaps;
5. keep the row below `verified` until all required local checks and docs pass.

For every upstream documentation topic, link its parity IDs. Topics that describe
several behaviors may map to multiple rows. Documentation without a mapped
capability remains an inventory gap.

## Completion queries

The Stage 0 tooling fails when:

- an upstream test or documentation record has no parity ID;
- a capability ID or visible Writer command ID is duplicated or unknown;
- a production runtime module, exported domain operation, UI-only behavior, or
  internal operation is absent from the runtime inventory;
- a `verified` row lacks any required evidence field;
- a `verified` row retains a gap or lacks an exact assertion/manual contract and
  executable local test;
- a local implementation or test references an unknown parity ID;
- evidence targets a different upstream baseline;
- a closed record lacks its AgentPlane task, commit, or verification result;
- an approved exception lacks the approving task and user decision.

See the [test strategy](test-strategy.md),
[documentation strategy](documentation-strategy.md), and
[roadmap](roadmap.md) for the tasks that make these checks executable.
