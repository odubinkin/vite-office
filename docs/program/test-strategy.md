# Test and Parity Evidence Strategy

## Objective

The test program must preserve every behavior covered by the pinned LibreOffice
test baseline. This is a traceability requirement, not merely a request for an
equal or higher percentage of covered lines.

No claim about upstream test count or current local coverage is made until the
reference-inventory and tooling tasks produce reproducible reports.

## Upstream inventory

The approved [LibreOffice baseline](libreoffice-baseline.md) pins release tag
`libreoffice-26.8.0.2` and commit
`9bc445578031fecf56086729d8e4940c77e14d65` in a Git-ignored reference checkout.
The next inventory tool must validate that identity and then collect at least:

- test file, suite, case, parameterization, and disabled/quarantined state;
- fixture paths and provenance;
- assertions and user-observable behavior;
- relevant source symbols, format, locale, and platform assumptions;
- upstream test type and execution prerequisites;
- one or more stable parity IDs from the [parity matrix](parity-matrix.md).

Generated inventory data must be deterministic, diffable, reviewable, and tied
to the exact upstream SHA. Manually summarized counts are not sufficient proof.

## Local test layers

| Layer | Primary evidence |
| --- | --- |
| Type and static checks | Public contracts, impossible states, dependency boundaries, JSDoc and size policies |
| Unit tests | Commands, model transitions, formulas, parsers, serializers, layout primitives, utilities |
| Property and fuzz tests | Parser safety, round trips, formula invariants, undo/redo, randomized document operations |
| Contract tests | Worker messages, storage schemas, format adapters, browser platform adapters |
| Integration tests | Command-to-model-to-render behavior and suite workflows |
| Format fixture tests | Import fidelity, export conformance, round-trip semantics, corruption handling |
| Visual regression tests | Layout, pagination, zoom, themes, charts, shapes, printing, and exports |
| Accessibility tests | Semantics, focus, keyboard-only use, announcements, contrast, zoom, reduced motion |
| Localization tests | Message coverage, locale formats, RTL, complex text, fonts, and IME-sensitive flows |
| End-to-end browser tests | User-visible workflows across supported browsers and static hosting |
| Performance tests | Startup, large documents, recalculation, layout, memory, worker responsiveness |

Feature tasks select all applicable layers; they may not substitute a shallow
component snapshot for mapped upstream behavioral assertions.

## Mapping rule

Every inventoried upstream test receives one of these outcomes:

1. **Mapped** to local executable tests that retain all relevant assertions.
2. **Expanded** into several local tests when browser architecture separates the
   behavior differently.
3. **Covered by stronger evidence** only when the replacement test clearly
   documents why it subsumes every original assertion.
4. **Blocked** by a concrete platform constraint with an approved follow-up.
5. **Exception-approved** as `not-implementable`, with a user decision,
   browser-runtime reason (`browser-runtime-supersedes` or
   `browser-runtime-inapplicable`), rationale, and retained visible debt. It may
   apply to a whole feature or one `upstream.tests` reference only; the parity
   report lists it separately from implementation coverage.

The first executable surface is
[`parity/writer-command-slice.json`](parity/writer-command-slice.json). Run
`npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json
--mappings docs/program/parity/writer-command-slice.json --local-root .
--upstream-root vendor/libreoffice-reference` to verify its exact paths and
markers. Its non-zero `gapCount` is intentional until each bounded browser
slice is behaviorally equivalent.

Deletion, disablement, quarantine, or weakened assertions require matrix updates
and review. An upstream test is not covered by an unrelated local test that only
executes the same code path.

## Coverage gates

The bootstrap task must configure line, branch, function, and statement coverage
for authored TypeScript. Initial thresholds may rise as executable code appears,
but no feature task may reduce them without approval. Changed source must be
fully exercised at the meaningful branch/behavior level, subject to explicit
generated or unreachable-code exclusions.

The program-level parity gate is stricter:

- 100% of inventoried upstream tests have a recorded mapping outcome;
- 100% of `verified` capabilities have passing local test and documentation
  evidence at the pinned baseline;
- no unexplained skipped, focused, quarantined, or flaky tests remain;
- all supported-browser, accessibility, localization, and static-build suites
  required by a capability pass;
- aggregate numeric coverage meets the ratcheted repository thresholds.

Numeric coverage cannot compensate for missing upstream mappings.

## Bootstrap quality baseline

The initial workspace runs Vitest with 100% line, branch, function, and statement
thresholds over authored application behavior. The static entry module is
validated by the production build and browser smoke test; its mount adapter and
negative missing-root branch are directly unit tested. Thresholds are a ratchet,
not evidence of LibreOffice test parity.

Playwright currently exercises the built preview in Chromium, including visible
landmarks, keyboard focus and activation, suite status updates, and configured
axe checks. Firefox and WebKit remain roadmap work and cannot be represented as
supported until an approved browser-support task adds and verifies them.

`scripts/check-static-build.mjs` proves that the generated index references
existing relative assets and that generated JavaScript contains no local
application-backend endpoint. `scripts/check-jsdoc.mjs` and ESLint validate
authored file overviews, functions, parameters, returns, and type declarations.
`scripts/check-file-size.mjs` reports files above 500 lines and rejects authored
files at or above 1,000 lines, excluding explicit generated, lifecycle, vendor,
and dependency paths.

## Fixtures and reproducibility

- Fixtures carry source, license, expected behavior, and parity IDs.
- Sensitive, personal, proprietary, or unexplained binary documents are banned.
- Generated fixtures use deterministic scripts and fixed seeds.
- Expected screenshots, PDFs, and serialized documents record tool and font
  versions where those affect output.
- Tests isolate locale, timezone, randomness, network, browser storage, and
  system fonts.
- Network access is disabled in normal tests unless a separately approved test
  explicitly owns it.

## Supported execution environments

The browser matrix must be chosen and versioned during bootstrap. At minimum,
tests should cover the browser engines necessary to support modern Chromium,
Firefox, and WebKit behavior unless the approved product support policy says
otherwise. Feature detection and fallbacks receive direct tests.

Static deployment is tested from built assets under a base path, with deep-link,
asset, offline-cache, and CSP-compatible behavior verified without a backend.

## Feature-task verification contract

Each feature task must name:

- parity IDs and upstream tests/docs in scope;
- expected behaviors and unsupported assumptions;
- exact local test commands and layers;
- fixtures and provenance;
- coverage and performance expectations;
- browsers, locales, accessibility checks, and format round trips;
- matrix and documentation paths to update;
- rollback and residual gaps.

The task reports observed commands, results, key evidence, and scope. AgentPlane
persists formal verification and decides closure.

## Quality tooling backlog

The bootstrap establishes strict TypeScript, unit coverage, Chromium E2E,
accessibility smoke tests, documentation/JSDoc checks, size checks, and a
static-build smoke test. Later tasks add generated upstream inventory, format
fixtures, visual baselines, fuzzing, performance budgets, and cross-browser CI.

See the [roadmap](roadmap.md) and
[documentation strategy](documentation-strategy.md).
