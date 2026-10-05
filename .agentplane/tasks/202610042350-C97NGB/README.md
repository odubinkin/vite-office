---
id: "202610042350-C97NGB"
title: "Restore native attribute lookup and inner hyperlink resolution"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm exec -- playwright test --config apps/office/playwright.config.ts"
  - "npm exec -- tsx scripts/generate-writer-ui-resources.ts --check"
  - "npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts"
  - "npm run check:dependencies"
  - "npm run check:docs"
  - "npm run check:file-size"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run format:check"
  - "npm run inventory:invariants"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure"
  - "npm run test:inventory:coverage -- --coverage.reportOnFailure"
  - "npm run test:static"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T23:50:32.434Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Restore bounded native point-query contracts and real nested-link projection under standing goal authorization."
events:
  -
    type: "status"
    at: "2026-10-04T23:50:32.865Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore bounded native point-query contracts and real nested-link projection under standing goal authorization."
doc_version: 3
doc_updated_at: "2026-10-05T00:03:27.738Z"
doc_updated_by: "CODER"
description: "Restore the native GetTextAttrMode Default/Expand/Parent contracts and SwTextNode.GetTextAttrAt pointer lookup for existing ranged auto-format53/internet54 only. Split source-owned ndtxt.cxx predicate/query responsibility into a pure type-import module under unchanged1000-line limit. Query actual Which/start map;early break on changed family/future start;last matching attribute wins;undefined hints return before mode selection;return owned object without projection/cloning/allocation. Connect existing internet metadata and partitioned text-run lookup to this query,retaining current auto-format composite projection and browser caret convention. Add one literal source-independent test file covering all modes/boundaries/families/nesting/adjacency/invalid guards/empty maps,actual ownership/all seven internet fields,node projection and real shell plus graph/copy/Worker restoration. Preserve354 prior test files byte-for-byte. Preserve238 existing runtime states/defaults/exceptions;add2 wholly unverified module rows and bounded existing node/hint notes;register query responsibility-split. Six static gates then one sequential five-suite upstream-absent profile with finally restoration and failure-only replays;five restored source audits;native hashes,exact committed scope and artifact audit,same-actor readonly EVALUATOR,doctor/routing,recorded verification and canonical finish. Full vector/dummy/other families/same-start tie order/native caller modes/input inheritance/client/style/UNO/full core/UI parity remain unverified;save/open/recovery deviations preserved. No network/global reads/saved helpers/upstream source in Agentplane."
sections:
  Summary: "Restore native attribute lookup and innermost hyperlink resolution."
  Scope: |-
    - apps/office/src/sw/inc/swtypes.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt-attribute-query.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt.ts
    - apps/office/src/sw/source/core/txtnode/ndhints.ts
    - apps/office/src/sw/source/core/txtnode/text-attribute-lookup.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Restore the native GetTextAttrMode Default/Expand/Parent contracts and SwTextNode.GetTextAttrAt pointer lookup for existing ranged auto-format53/internet54 only. Split source-owned ndtxt.cxx predicate/query responsibility into a pure type-import module under unchanged1000-line limit. Query actual Which/start map;early break on changed family/future start;last matching attribute wins;undefined hints return before mode selection;return owned object without projection/cloning/allocation. Connect existing internet metadata and partitioned text-run lookup to this query,retaining current auto-format composite projection and browser caret convention. Add one literal source-independent test file covering all modes/boundaries/families/nesting/adjacency/invalid guards/empty maps,actual ownership/all seven internet fields,node projection and real shell plus graph/copy/Worker restoration. Preserve354 prior test files byte-for-byte. Preserve238 existing runtime states/defaults/exceptions;add2 wholly unverified module rows and bounded existing node/hint notes;register query responsibility-split. Six static gates then one sequential five-suite upstream-absent profile with finally restoration and failure-only replays;five restored source audits;native hashes,exact committed scope and artifact audit,same-actor readonly EVALUATOR,doctor/routing,recorded verification and canonical finish. Full vector/dummy/other families/same-start tie order/native caller modes/input inheritance/client/style/UNO/full core/UI parity remain unverified;save/open/recovery deviations preserved. No network/global reads/saved helpers/upstream source in Agentplane."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Static gates precede one sequential absent-reference profile;repeat only failed gates/cases. Compare354prior tests and238prior runtime states/defaults/exceptions;native hashes and artifact audit. No upstream runtime dependency or saved helpers/source.
  Verification: "Six static gates passed before the single upstream-absent build/app/inventory/scripts/Chromium profile. First app:2761passed/3failed new invalid nested-link fixtures,272files,2764total,100%lines/statements/functions/branches. Native thints.cxx forbids nested hyperlinks;fixtures corrected without production or old-test edits. Exactly3failed cases replayed absent:3passed/45skipped,no full suite/build replay. Inventory109/36files100%allfour,scripts5/2files,Chromium99 passed. Vendor restored in finally. Five restored source audits passed,semanticViolationCount0.354prior tests byte-identical,48newcases;238existing runtime fields/statuses/defaults/exceptions preserved;2new modules whollyunverified,one query responsibility-split exception. Five native hashes;AP ignored-inclusive3862files/0forbidden before final artifacts. Scoped final fixture prettier/eslint pass. Doctor0errors/two unchanged legacywarnings,routingOK. Same-actor readonly committed-SHA EVALUATOR pending. Full native core/UI/insertion/vector/other families/client and formatted input inheritance remain unverified."
  Rollback Plan: "Revert semantic commit without rewriting history."
  Findings: |-
    Pinned26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native swtypes.hxx supplies three predicates;ndtxt.hxx/GetTextAttrAt and ndtxt.cxx1744-1853 pointer branch overwrite outer matches with later matching attributes. Existing findFamilyHint returns first covering internet range,affecting node metadata/projected runs and actual hyperlink shell lookup. This atomic leaf restores query foundation;formatted input inheritance remains a separate obligation. Existing sorted maps own actual ranges;no DTO becomes authoritative.

    - Observation: Initial absent app run:2761pass/3new fixture failures with100%coverage. Native thints.cxx explicitly forbids nested hyperlinks;local container correctly rejects them. Query overwrite behavior is now checked directly via actual owned SetEnd mutations,restored to valid adjacency before projection/shell/copy/Worker tests.
      Impact: No production change or old-test correction;full passing suites/build must not replay.
      Resolution: Replay only the3failed new cases under absent-reference try/finally;retain original full-run outcome and full normalization boundary.
id_source: "generated"
---
## Summary

Restore native attribute lookup and innermost hyperlink resolution.

## Scope

- apps/office/src/sw/inc/swtypes.ts
- apps/office/src/sw/source/core/txtnode/ndtxt-attribute-query.ts
- apps/office/src/sw/source/core/txtnode/ndtxt.ts
- apps/office/src/sw/source/core/txtnode/ndhints.ts
- apps/office/src/sw/source/core/txtnode/text-attribute-lookup.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Restore the native GetTextAttrMode Default/Expand/Parent contracts and SwTextNode.GetTextAttrAt pointer lookup for existing ranged auto-format53/internet54 only. Split source-owned ndtxt.cxx predicate/query responsibility into a pure type-import module under unchanged1000-line limit. Query actual Which/start map;early break on changed family/future start;last matching attribute wins;undefined hints return before mode selection;return owned object without projection/cloning/allocation. Connect existing internet metadata and partitioned text-run lookup to this query,retaining current auto-format composite projection and browser caret convention. Add one literal source-independent test file covering all modes/boundaries/families/nesting/adjacency/invalid guards/empty maps,actual ownership/all seven internet fields,node projection and real shell plus graph/copy/Worker restoration. Preserve354 prior test files byte-for-byte. Preserve238 existing runtime states/defaults/exceptions;add2 wholly unverified module rows and bounded existing node/hint notes;register query responsibility-split. Six static gates then one sequential five-suite upstream-absent profile with finally restoration and failure-only replays;five restored source audits;native hashes,exact committed scope and artifact audit,same-actor readonly EVALUATOR,doctor/routing,recorded verification and canonical finish. Full vector/dummy/other families/same-start tie order/native caller modes/input inheritance/client/style/UNO/full core/UI parity remain unverified;save/open/recovery deviations preserved. No network/global reads/saved helpers/upstream source in Agentplane.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Static gates precede one sequential absent-reference profile;repeat only failed gates/cases. Compare354prior tests and238prior runtime states/defaults/exceptions;native hashes and artifact audit. No upstream runtime dependency or saved helpers/source.

## Verification

Six static gates passed before the single upstream-absent build/app/inventory/scripts/Chromium profile. First app:2761passed/3failed new invalid nested-link fixtures,272files,2764total,100%lines/statements/functions/branches. Native thints.cxx forbids nested hyperlinks;fixtures corrected without production or old-test edits. Exactly3failed cases replayed absent:3passed/45skipped,no full suite/build replay. Inventory109/36files100%allfour,scripts5/2files,Chromium99 passed. Vendor restored in finally. Five restored source audits passed,semanticViolationCount0.354prior tests byte-identical,48newcases;238existing runtime fields/statuses/defaults/exceptions preserved;2new modules whollyunverified,one query responsibility-split exception. Five native hashes;AP ignored-inclusive3862files/0forbidden before final artifacts. Scoped final fixture prettier/eslint pass. Doctor0errors/two unchanged legacywarnings,routingOK. Same-actor readonly committed-SHA EVALUATOR pending. Full native core/UI/insertion/vector/other families/client and formatted input inheritance remain unverified.

## Rollback Plan

Revert semantic commit without rewriting history.

## Findings

Pinned26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native swtypes.hxx supplies three predicates;ndtxt.hxx/GetTextAttrAt and ndtxt.cxx1744-1853 pointer branch overwrite outer matches with later matching attributes. Existing findFamilyHint returns first covering internet range,affecting node metadata/projected runs and actual hyperlink shell lookup. This atomic leaf restores query foundation;formatted input inheritance remains a separate obligation. Existing sorted maps own actual ranges;no DTO becomes authoritative.

- Observation: Initial absent app run:2761pass/3new fixture failures with100%coverage. Native thints.cxx explicitly forbids nested hyperlinks;local container correctly rejects them. Query overwrite behavior is now checked directly via actual owned SetEnd mutations,restored to valid adjacency before projection/shell/copy/Worker tests.
  Impact: No production change or old-test correction;full passing suites/build must not replay.
  Resolution: Replay only the3failed new cases under absent-reference try/finally;retain original full-run outcome and full normalization boundary.
