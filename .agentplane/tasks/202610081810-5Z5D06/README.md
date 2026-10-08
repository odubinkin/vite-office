---
id: "202610081810-5Z5D06"
title: "Own row splitting as native items through core and document transport"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T18:11:50.791Z"
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
    body: "Start: implement approved240 canonical row item and native core contracts with exact acceptance migration and targeted upstream-absent verification."
events:
  -
    type: "status"
    at: "2026-10-08T18:11:51.231Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved240 canonical row item and native core contracts with exact acceptance migration and targeted upstream-absent verification."
doc_version: 3
doc_updated_at: "2026-10-08T18:18:46.023Z"
doc_updated_by: "CODER"
description: "Iteration240 removes canonical row keepTogether inversion, carries SwFormatRowSplit through SwDoc/SwFEShell and native item-set input, retains native item clone ownership in row/history/insertion, and converts only at ODF and browser primitive boundaries. Preserve old snapshot ingress and registered IO/recovery/settings. Exact native acceptance migration and targeted upstream-absent coverage; no full suite until247."
sections:
  Summary: "Remove canonical inverse row-split scalars and pass native items from document ownership through shell, UI and transport."
  Scope: |-
    Production paths:
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/docnode/ndtbl1.ts
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/frmedt/fetab.ts
    apps/office/src/sw/source/uibase/shells/tabsh.ts
    apps/office/src/sw/source/ui/table/tabledlg.ts
    apps/office/src/sw/source/filter/xml/xmltbli.ts
    apps/office/src/sw/source/filter/xml/xmlexp.ts
    apps/office/src/sw/browser/filter/xml/writer-table-item-codec.ts
    Acceptance migration candidates (only source-bound row changes; paragraph-only contracts remain untouched):
    apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
    apps/office/src/sw/browser/presentation/native-table-split-items.test.tsx
    apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
    apps/office/src/sw/browser/presentation/native-table-text-flow-split.test.tsx
    apps/office/src/sw/source/filter/xml/native-row-frame-size-roundtrip.test.ts
    apps/office/src/sw/source/filter/xml/odt-table-roundtrip.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts
    apps/office/src/sw/source/core/undo/native-numeric-row-insertion-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-height-delta.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-layout-split-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts
    apps/office/src/sw/source/ui/table/native-table-text-flow-split.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-height-command-separation.test.ts
    apps/office/src/sw/source/core/docnode/native-row-height-owner.test.ts
    apps/office/src/sw/source/core/table/native-numeric-row-insertion.test.ts
    apps/office/src/sw/source/core/docnode/native-row-split-owner.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts
    apps/office/src/sw/source/core/docnode/native-row-frame-size.test.ts
    apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx
    New checks/helpers/metadata:
    apps/office/src/sw/source/core/docnode/native-row-split-items.test.ts
    apps/office/src/sw/browser/filter/xml/native-row-split-item-transport.test.ts
    apps/office/src/sw/browser/presentation/native-row-split-core-items.test.tsx
    apps/office/src/test/table-row-test-helpers.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Additional related Chromium acceptance migration:
    apps/office/e2e/writer-native-table-text-flow-split.spec.ts
  Plan: "Iteration240 replaces canonical SwTableLineFormat.keepTogether with optional native SwFormatRowSplit ownership, cloned on input/read/history and effective true default. Core document and frame shell GetRowSplit return independent common concrete items or absent for mixed/no owner; SetRowSplit accept concrete items and preserve cursor/selection/history. Text Flow reads native value at widget boundary and shell native input forwards the original item; explicit DTO compatibility converts only at its boundary. ODF converts keep-together only at XML import/export; primitive browser codec writes rowSplit and reads native boolean plus legacy keepTogether only at storage ingress. No persistent inverse scalar or bool core fallback. Update only exact old row fixture/observation/API representations; preserve every old acceptance expectation via test-only native construction/observation helpers, without weakening geometry/owners/text/cursor/history. Add independent row item/core/history, primitive/legacy/ODF and mounted direct native-path tests. Metadata remains partial; full shared row frame-format pooling/claims/nested/merged semantics unverified. Registered IO/recovery/settings unchanged. Targeted upstream-absent checks plus exact-source all-four100% cumulative certificate from239; no full240 (last237,next247). Same agent roles sequential, no delegation/network/global reads."
  Verify Steps: |-
    1. Check pin9bc445578031fecf56086729d8e4940c77e14d65 native fmtrowsplt.hxx/atrfrm.cxx/ndtbl1.cxx/fetab.cxx/swtable.hxx/xmltbli.cxx/xmltble.cxx sources for cloned common-item getter, item setter, original row ownership, defaulttrue and XML/property inversion. Record only identifiers/hashes in AgentPlane.
    2. Prove native row input/read clone independence and no keepTogether canonical field; independent common-item default/direct/mixed/non-table/detached/foreign cursor, selected/whole/history/same-value/notification, frame-size coexistence and inserted row preservation. Test primitive true/false/omitted, legacy keepTogether ingestion, native-over-legacy precedence, invalid scalar rejection, ODF exact attrs/reopen and actual mounted native input/original owners/cursor/UndoRedo.
    3. Exact whole-file old native representation migration only: helpers may construct native row fixtures and observe the original inverse boolean expectation in tests; all existing assertion calls/expected literals and non-row paragraph contracts preserved. No skipped/only/removal/reduced history; snapshot every prior acceptance file and enforce scope.
    4. Run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size and upstream-absent build/static. Run new and related row/split/height/history/XML/transport/UI and related Chromium tests once with vendor unavailable/restored finally; failed/new-only closures, no passing replay. Full suite240 intentionally not run under updated user policy; last237,next247.
    5. Deterministically prove actual targeted counters plus prior239 whole identical source/maps or complete mapped declarations/body/enclosing branch/all locations yield all-four100% app/inventory; never sanitize counts or weaken threshold. Unchanged inventory/infra runtime certificate only after exact source/map binding.
    6. Separate source generator --check/source-tree/provenance/invariants/parity after restoration, all315prior metadata states/defaults/classifications/prefixes preserved. Source<1000physical lines, protectedIO4/writer-view/pin/stash preserved, no upstream/application/Python/raw maps/results/scripts under AgentPlane, doctor/routing/diff/task-scoped final state. Actual SHA current-agent EVALUATOR review explicitly not independent; close only240 and exact-prefix append parent; full goal active.
  Verification: "Pending native row-item implementation and targeted verification."
  Rollback Plan: "Revert the eventual implementation commit locally; retain traceability and never rewrite DONE tasks."
  Findings: |-
    Previous239 is DONE and exact-source coverage is verified. Current GetRowSplit/SetRowSplit core/shell contracts are boolean, rows store keepTogether inversion and transport copies that scalar. Pinned native methods clone common SwFormatRowSplit values and accept concrete items. This leaf removes the canonical scalar; browser old-snapshot ingress remains explicit. No full shared-frame-format promotion.

    Typecheck exposed one additional existing Chromium row fixture in writer-native-table-text-flow-split.spec.ts: TS2353 keepTogether is no longer canonical. Extend the same representation-only acceptance migration to this file, preserving all browser assertions and literals. No production behavior or verification contract expansion; standing iterative goal authorizes this necessary related-test repair. The failed typecheck remains recorded; no runtime cases have executed for240.
id_source: "generated"
---
## Summary

Remove canonical inverse row-split scalars and pass native items from document ownership through shell, UI and transport.

## Scope

Production paths:
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/docnode/ndtbl1.ts
apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/frmedt/fetab.ts
apps/office/src/sw/source/uibase/shells/tabsh.ts
apps/office/src/sw/source/ui/table/tabledlg.ts
apps/office/src/sw/source/filter/xml/xmltbli.ts
apps/office/src/sw/source/filter/xml/xmlexp.ts
apps/office/src/sw/browser/filter/xml/writer-table-item-codec.ts
Acceptance migration candidates (only source-bound row changes; paragraph-only contracts remain untouched):
apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
apps/office/src/sw/browser/presentation/native-table-split-items.test.tsx
apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
apps/office/src/sw/browser/presentation/native-table-text-flow-split.test.tsx
apps/office/src/sw/source/filter/xml/native-row-frame-size-roundtrip.test.ts
apps/office/src/sw/source/filter/xml/odt-table-roundtrip.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts
apps/office/src/sw/source/core/undo/native-numeric-row-insertion-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-height-delta.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-layout-split-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts
apps/office/src/sw/source/ui/table/native-table-text-flow-split.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-height-command-separation.test.ts
apps/office/src/sw/source/core/docnode/native-row-height-owner.test.ts
apps/office/src/sw/source/core/table/native-numeric-row-insertion.test.ts
apps/office/src/sw/source/core/docnode/native-row-split-owner.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts
apps/office/src/sw/source/core/docnode/native-row-frame-size.test.ts
apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx
New checks/helpers/metadata:
apps/office/src/sw/source/core/docnode/native-row-split-items.test.ts
apps/office/src/sw/browser/filter/xml/native-row-split-item-transport.test.ts
apps/office/src/sw/browser/presentation/native-row-split-core-items.test.tsx
apps/office/src/test/table-row-test-helpers.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Additional related Chromium acceptance migration:
apps/office/e2e/writer-native-table-text-flow-split.spec.ts

## Plan

Iteration240 replaces canonical SwTableLineFormat.keepTogether with optional native SwFormatRowSplit ownership, cloned on input/read/history and effective true default. Core document and frame shell GetRowSplit return independent common concrete items or absent for mixed/no owner; SetRowSplit accept concrete items and preserve cursor/selection/history. Text Flow reads native value at widget boundary and shell native input forwards the original item; explicit DTO compatibility converts only at its boundary. ODF converts keep-together only at XML import/export; primitive browser codec writes rowSplit and reads native boolean plus legacy keepTogether only at storage ingress. No persistent inverse scalar or bool core fallback. Update only exact old row fixture/observation/API representations; preserve every old acceptance expectation via test-only native construction/observation helpers, without weakening geometry/owners/text/cursor/history. Add independent row item/core/history, primitive/legacy/ODF and mounted direct native-path tests. Metadata remains partial; full shared row frame-format pooling/claims/nested/merged semantics unverified. Registered IO/recovery/settings unchanged. Targeted upstream-absent checks plus exact-source all-four100% cumulative certificate from239; no full240 (last237,next247). Same agent roles sequential, no delegation/network/global reads.

## Verify Steps

1. Check pin9bc445578031fecf56086729d8e4940c77e14d65 native fmtrowsplt.hxx/atrfrm.cxx/ndtbl1.cxx/fetab.cxx/swtable.hxx/xmltbli.cxx/xmltble.cxx sources for cloned common-item getter, item setter, original row ownership, defaulttrue and XML/property inversion. Record only identifiers/hashes in AgentPlane.
2. Prove native row input/read clone independence and no keepTogether canonical field; independent common-item default/direct/mixed/non-table/detached/foreign cursor, selected/whole/history/same-value/notification, frame-size coexistence and inserted row preservation. Test primitive true/false/omitted, legacy keepTogether ingestion, native-over-legacy precedence, invalid scalar rejection, ODF exact attrs/reopen and actual mounted native input/original owners/cursor/UndoRedo.
3. Exact whole-file old native representation migration only: helpers may construct native row fixtures and observe the original inverse boolean expectation in tests; all existing assertion calls/expected literals and non-row paragraph contracts preserved. No skipped/only/removal/reduced history; snapshot every prior acceptance file and enforce scope.
4. Run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size and upstream-absent build/static. Run new and related row/split/height/history/XML/transport/UI and related Chromium tests once with vendor unavailable/restored finally; failed/new-only closures, no passing replay. Full suite240 intentionally not run under updated user policy; last237,next247.
5. Deterministically prove actual targeted counters plus prior239 whole identical source/maps or complete mapped declarations/body/enclosing branch/all locations yield all-four100% app/inventory; never sanitize counts or weaken threshold. Unchanged inventory/infra runtime certificate only after exact source/map binding.
6. Separate source generator --check/source-tree/provenance/invariants/parity after restoration, all315prior metadata states/defaults/classifications/prefixes preserved. Source<1000physical lines, protectedIO4/writer-view/pin/stash preserved, no upstream/application/Python/raw maps/results/scripts under AgentPlane, doctor/routing/diff/task-scoped final state. Actual SHA current-agent EVALUATOR review explicitly not independent; close only240 and exact-prefix append parent; full goal active.

## Verification

Pending native row-item implementation and targeted verification.

## Rollback Plan

Revert the eventual implementation commit locally; retain traceability and never rewrite DONE tasks.

## Findings

Previous239 is DONE and exact-source coverage is verified. Current GetRowSplit/SetRowSplit core/shell contracts are boolean, rows store keepTogether inversion and transport copies that scalar. Pinned native methods clone common SwFormatRowSplit values and accept concrete items. This leaf removes the canonical scalar; browser old-snapshot ingress remains explicit. No full shared-frame-format promotion.

Typecheck exposed one additional existing Chromium row fixture in writer-native-table-text-flow-split.spec.ts: TS2353 keepTogether is no longer canonical. Extend the same representation-only acceptance migration to this file, preserving all browser assertions and literals. No production behavior or verification contract expansion; standing iterative goal authorizes this necessary related-test repair. The failed typecheck remains recorded; no runtime cases have executed for240.
