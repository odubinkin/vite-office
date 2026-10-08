---
id: "202610081754-J0EAJE"
title: "Use native Writer table and row split items in Text Flow"
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
  updated_at: "2026-10-08T17:55:24.759Z"
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
    body: "Start: implement approved iteration239 native split items and pool defaults with targeted upstream-absent direct UI-to-shell verification."
events:
  -
    type: "status"
    at: "2026-10-08T17:55:25.207Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved iteration239 native split items and pool defaults with targeted upstream-absent direct UI-to-shell verification."
doc_version: 3
doc_updated_at: "2026-10-08T18:03:25.568Z"
doc_updated_by: "CODER"
description: "Iteration239 replaces generic boolean publication and consumption with pinned SwFormatLayoutSplit and SwFormatRowSplit identities, clone ownership and true pool defaults. Cover the direct mounted UI-to-shell path and exact original-owner history without changing registered IO/recovery behavior. Targeted upstream-absent runtime only; full cadence237 to247."
sections:
  Summary: "Replace generic Text Flow split items with native Writer concrete identities and defaults."
  Scope: |-
    apps/office/src/sw/inc/fmtlsplt.ts
    apps/office/src/sw/inc/fmtrowsplt.ts
    apps/office/src/sw/source/core/attr/swatrset.ts
    apps/office/src/sw/source/ui/table/tabledlg.ts
    apps/office/src/sw/source/uibase/shells/tabsh.ts
    apps/office/src/sw/inc/native-table-split-items.test.ts
    apps/office/src/sw/browser/presentation/native-table-split-items.test.tsx
    apps/office/src/sw/source/uibase/shells/native-table-property-item-input.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration239: implement native SwFormatLayoutSplit and SwFormatRowSplit derived boolean items with exact WhichIds120/129, true defaults and type/identity-preserving independent Clone. Register true Writer pool defaults and concrete restoration factories; publish concrete items from Text Flow and consume concrete explicitly SET items in the native table shell. Migrate only three constructed generic split inputs in the existing native shell acceptance file, preserving every assertion. Add literal item/default/state/clone/restore tests and mounted direct UI-to-shell original-owner/cursor/history tests. Preserve all metadata states/default classifications and registered IO/recovery deviations. No complete frame-format migration or module promotion. Execute targeted new/related app and Chromium tests with upstream absent once, failed/new-only closures, cumulative exact-source100% coverage; full suite remains next247. Same agent sequential PLANNER/CODER/EVALUATOR roles, no delegation/network/global reads."
  Verify Steps: |-
    1. Verify pinned fmtlsplt.hxx/fmtrowsplt.hxx constructors, atrfrm.cxx Clone, init.cxx defaults and tabledlg.cxx/tabsh.cxx concrete item publication/consumption against pin9bc445578031fecf56086729d8e4940c77e14d65; record only hashes/identifiers in AgentPlane.
    2. Add literal native default120/129=true, Clone type/identity/value independence (including changed Which), explicit false, pool restoration, default/inherited/disabled/invalid state tests; mount the real UI and inspect actual native items, selected/whole original-row changes, table attrs, cursor, one Undo/Redo group and Reset.
    3. Run npm format:check/lint/typecheck/check:dependencies/check:docs/check:file-size and test:static. Run only new and changed-module-related app/Chromium tests with vendor physically unavailable, restored in finally. No full suite239; last237 next247. Retry only failed/new cases, not passing scenarios.
    4. Prove all-four100% app/inventory coverage with actual current targeted counters and prior238 whole identical-source/maps or complete contiguous declaration/body/ancestor mapped-region proofs. No sanitation or weaker criteria; unchanged inventory/infra runtime not replayed.
    5. After restoration run separate generator --check/source-tree/provenance/invariants/parity source audits. Preserve prior313 metadata records/states/defaults and all643 baseline acceptance files except exact declared native construction migration. Verify task-scoped diff, source<1000 physical lines, doctor/routing, clean final state, pin/stash/protected IO and no upstream/Python/raw source/maps/results under AgentPlane. Record current-agent EVALUATOR actual SHA (not independent) and close only this atomic leaf.
  Verification: "Verified iteration239 in the current checkout:12 fresh native item/pool and mounted direct UI-to-shell scenarios,178 app cases and8 Chromium cases passed once with upstream physically absent and restored in finally. No failed tests, no passing replay, no full suite; last full237 next247. Raw selected-suite threshold exit1 is retained and not misreported as global coverage. Deterministic proof combines actual current counters with prior238 whole identical source/maps or complete mapped declaration/body/ancestor/branch-location transfers: app100%17468lines/19183statements/4395functions/14269branches, inventory100%1464/1523/384/1081. Unchanged inventory/infra runtime not replayed. Six static gates and upstream-absent build/static passed. Source resource generator --check/source-tree/provenance/invariants/parity and final metadata provenance/parity passed315modules. All643 old acceptance files preserved by642byte-identical files and one exact native-construction migration retaining all66assertions. All313 prior metadata records/fields/states/defaults/prefixes preserved; two partial identities added. Eight complete native source files match pin bytes; protectedIO4 and complete writer-view unchanged; stash preserved. Doctor/routing/diff and artifact source audit pass. Current-agent EVALUATOR actual implementation SHA is required before closure; it is explicitly not independent."
  Rollback Plan: "Revert the eventual implementation commit locally; retain task evidence and never rewrite DONE tasks."
  Findings: |-
    Observation: Text Flow used generic SfxBoolItem for two Writer frame attributes, the bounded Writer pool had no120/129 default and native item-set cloning demoted class identity.
    Impact: the direct UI output lacked SwFormatLayoutSplit/SwFormatRowSplit concrete contracts and pool fallback could not represent native true defaults.
    Resolution: add two native subclass modules with defaulttrue/currentWhich/value-preserving Clone, register concrete true defaults and primitive restoration factories, publish concrete deltas and consume only explicitly SET concrete items. Twelve new cases verify literal values, cloning, restoration, states and real mounted selection/original graph/cursor/Reset/one UndoRedo group. Exactly three old native shell constructions migrate; every66oldassertion remains byte-identical. No source/application/Python/raw maps/results/scripts saved in AgentPlane.
    Command: targeted npm test:coverage plus three related Chromium files, upstream absent. Result:178app/8Chromium pass; raw global partial threshold exit1 retained. No passing replay or full run.
    Command: deterministic239proofScript. Result: all-four100% exact-source cumulative certificates for app/inventory; no gaps/sanitation. Previous actual238certificate carries only source/map-proven unchanged work.
    Command: six static gates, upstream-absent test:static, separate native source gates and final metadata gates. Result: pass.
    Residual: row keepTogether inversion and table scalar frame attributes, full shared-frame ownership/refcounts/presentation/localization/SfxBoolItem PutValue/UNO and full SfxTabPage orchestration remain partial. Source audit confirms eager CreatePages, so no lazy owner refactor is justified. IO/recovery/settings and prior metadata statuses/defaults preserved. Full core/browser goal stays ACTIVE, next full suite247. Current agent changes roles sequentially; no independent reviewer/delegation.
id_source: "generated"
---
## Summary

Replace generic Text Flow split items with native Writer concrete identities and defaults.

## Scope

apps/office/src/sw/inc/fmtlsplt.ts
apps/office/src/sw/inc/fmtrowsplt.ts
apps/office/src/sw/source/core/attr/swatrset.ts
apps/office/src/sw/source/ui/table/tabledlg.ts
apps/office/src/sw/source/uibase/shells/tabsh.ts
apps/office/src/sw/inc/native-table-split-items.test.ts
apps/office/src/sw/browser/presentation/native-table-split-items.test.tsx
apps/office/src/sw/source/uibase/shells/native-table-property-item-input.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration239: implement native SwFormatLayoutSplit and SwFormatRowSplit derived boolean items with exact WhichIds120/129, true defaults and type/identity-preserving independent Clone. Register true Writer pool defaults and concrete restoration factories; publish concrete items from Text Flow and consume concrete explicitly SET items in the native table shell. Migrate only three constructed generic split inputs in the existing native shell acceptance file, preserving every assertion. Add literal item/default/state/clone/restore tests and mounted direct UI-to-shell original-owner/cursor/history tests. Preserve all metadata states/default classifications and registered IO/recovery deviations. No complete frame-format migration or module promotion. Execute targeted new/related app and Chromium tests with upstream absent once, failed/new-only closures, cumulative exact-source100% coverage; full suite remains next247. Same agent sequential PLANNER/CODER/EVALUATOR roles, no delegation/network/global reads.

## Verify Steps

1. Verify pinned fmtlsplt.hxx/fmtrowsplt.hxx constructors, atrfrm.cxx Clone, init.cxx defaults and tabledlg.cxx/tabsh.cxx concrete item publication/consumption against pin9bc445578031fecf56086729d8e4940c77e14d65; record only hashes/identifiers in AgentPlane.
2. Add literal native default120/129=true, Clone type/identity/value independence (including changed Which), explicit false, pool restoration, default/inherited/disabled/invalid state tests; mount the real UI and inspect actual native items, selected/whole original-row changes, table attrs, cursor, one Undo/Redo group and Reset.
3. Run npm format:check/lint/typecheck/check:dependencies/check:docs/check:file-size and test:static. Run only new and changed-module-related app/Chromium tests with vendor physically unavailable, restored in finally. No full suite239; last237 next247. Retry only failed/new cases, not passing scenarios.
4. Prove all-four100% app/inventory coverage with actual current targeted counters and prior238 whole identical-source/maps or complete contiguous declaration/body/ancestor mapped-region proofs. No sanitation or weaker criteria; unchanged inventory/infra runtime not replayed.
5. After restoration run separate generator --check/source-tree/provenance/invariants/parity source audits. Preserve prior313 metadata records/states/defaults and all643 baseline acceptance files except exact declared native construction migration. Verify task-scoped diff, source<1000 physical lines, doctor/routing, clean final state, pin/stash/protected IO and no upstream/Python/raw source/maps/results under AgentPlane. Record current-agent EVALUATOR actual SHA (not independent) and close only this atomic leaf.

## Verification

Verified iteration239 in the current checkout:12 fresh native item/pool and mounted direct UI-to-shell scenarios,178 app cases and8 Chromium cases passed once with upstream physically absent and restored in finally. No failed tests, no passing replay, no full suite; last full237 next247. Raw selected-suite threshold exit1 is retained and not misreported as global coverage. Deterministic proof combines actual current counters with prior238 whole identical source/maps or complete mapped declaration/body/ancestor/branch-location transfers: app100%17468lines/19183statements/4395functions/14269branches, inventory100%1464/1523/384/1081. Unchanged inventory/infra runtime not replayed. Six static gates and upstream-absent build/static passed. Source resource generator --check/source-tree/provenance/invariants/parity and final metadata provenance/parity passed315modules. All643 old acceptance files preserved by642byte-identical files and one exact native-construction migration retaining all66assertions. All313 prior metadata records/fields/states/defaults/prefixes preserved; two partial identities added. Eight complete native source files match pin bytes; protectedIO4 and complete writer-view unchanged; stash preserved. Doctor/routing/diff and artifact source audit pass. Current-agent EVALUATOR actual implementation SHA is required before closure; it is explicitly not independent.

## Rollback Plan

Revert the eventual implementation commit locally; retain task evidence and never rewrite DONE tasks.

## Findings

Observation: Text Flow used generic SfxBoolItem for two Writer frame attributes, the bounded Writer pool had no120/129 default and native item-set cloning demoted class identity.
Impact: the direct UI output lacked SwFormatLayoutSplit/SwFormatRowSplit concrete contracts and pool fallback could not represent native true defaults.
Resolution: add two native subclass modules with defaulttrue/currentWhich/value-preserving Clone, register concrete true defaults and primitive restoration factories, publish concrete deltas and consume only explicitly SET concrete items. Twelve new cases verify literal values, cloning, restoration, states and real mounted selection/original graph/cursor/Reset/one UndoRedo group. Exactly three old native shell constructions migrate; every66oldassertion remains byte-identical. No source/application/Python/raw maps/results/scripts saved in AgentPlane.
Command: targeted npm test:coverage plus three related Chromium files, upstream absent. Result:178app/8Chromium pass; raw global partial threshold exit1 retained. No passing replay or full run.
Command: deterministic239proofScript. Result: all-four100% exact-source cumulative certificates for app/inventory; no gaps/sanitation. Previous actual238certificate carries only source/map-proven unchanged work.
Command: six static gates, upstream-absent test:static, separate native source gates and final metadata gates. Result: pass.
Residual: row keepTogether inversion and table scalar frame attributes, full shared-frame ownership/refcounts/presentation/localization/SfxBoolItem PutValue/UNO and full SfxTabPage orchestration remain partial. Source audit confirms eager CreatePages, so no lazy owner refactor is justified. IO/recovery/settings and prior metadata statuses/defaults preserved. Full core/browser goal stays ACTIVE, next full suite247. Current agent changes roles sequentially; no independent reviewer/delegation.
