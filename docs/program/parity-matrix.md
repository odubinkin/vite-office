# LibreOffice Parity Matrix

## Purpose

This matrix is the authoritative index connecting the pinned LibreOffice
baseline to Vite Office implementation, tests, and documentation. It begins as
a coarse suite inventory and must be expanded to atomic, testable capabilities
after the upstream reference checkout is approved and pinned.

No row below claims a LibreOffice capability implementation. All seeded rows use
`inventory-pending` because authoritative upstream source, test, and help
references are not yet available in this repository. The browser workbench
foundation is infrastructure evidence only and does not change that status.

## Stable identifier format

Identifiers use `LO-<DOMAIN>-<NNNN>` and never change after publication. Domain
codes are `SHARED`, `WRITER`, `CALC`, `IMPRESS`, `DRAW`, `BASE`, `MATH`, `CHART`,
`FORMAT`, `AUTO`, `A11Y`, and `L10N`. A split row receives new identifiers and
keeps a `superseded-by` note on the original row.

## Required traceability fields

Each atomic capability record must contain:

| Field | Required evidence |
| --- | --- |
| Parity ID | Immutable identifier in the format above. |
| Capability | One user-observable or compatibility behavior. |
| Upstream source | Paths and symbols at the pinned LibreOffice SHA. |
| Upstream tests | Test paths, cases, fixtures, and relevant assertions. |
| Upstream docs | Help IDs, guide/API pages, or an evidenced `none`. |
| Local implementation | TypeScript modules, components, workers, or adapters. |
| Local tests | Executable tests and fixtures covering mapped assertions. |
| Local docs | User, developer, API, accessibility, and format topics. |
| Status | One lifecycle value from the table below. |
| Evidence | Task ID, commit, verification result, and review notes. |
| Gaps | Known behavioral, platform, test, or documentation differences. |

## Status lifecycle

| Status | Meaning |
| --- | --- |
| `inventory-pending` | The pinned upstream corpus has not yet defined the row. |
| `mapped` | Upstream source, tests, and documentation are fully referenced. |
| `planned` | An approved AgentPlane feature task owns the mapped behavior. |
| `implemented` | Code exists, but complete parity evidence is not yet recorded. |
| `verified` | Functional, test, and documentation evidence all pass. |
| `blocked` | A concrete external or platform constraint prevents progress. |
| `exception-approved` | A user-approved divergence is documented with rationale. |
| `superseded` | Atomic successor rows replace this record without losing history. |

Only `verified` counts toward parity. `exception-approved` is visible debt and
does not silently count as equivalent functionality.

## Seed inventory

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

Future tooling must be able to fail CI when:

- an upstream test or documentation record has no parity ID;
- a `verified` row lacks any required evidence field;
- a local implementation or test references an unknown parity ID;
- evidence targets a different upstream baseline;
- a task changes mapped behavior without updating tests and documentation;
- an approved exception lacks the approving task and user decision.

See the [test strategy](test-strategy.md),
[documentation strategy](documentation-strategy.md), and
[roadmap](roadmap.md) for the tasks that make these checks executable.
