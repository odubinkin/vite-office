---
id: "202610070221-A9NQZ4"
title: "Preserve untouched cell borders in table properties through native changed-item admission"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T02:40:57.089Z"
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
    body: "Start: implement approved8path changed-border/padding properties correction under standing goal, retain insertion and original graph/history, one absent profile and strict actual coverage evidence."
events:
  -
    type: "status"
    at: "2026-10-07T02:22:11.057Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved8path changed-border/padding properties correction under standing goal, retain insertion and original graph/history, one absent profile and strict actual coverage evidence."
doc_version: 3
doc_updated_at: "2026-10-07T02:40:56.659Z"
doc_updated_by: "CODER"
description: "Iteration204 under C9TN6M: existing properties dialog always sends first-cell border/padding and rewrites heterogeneous selected/table cell formatting on unrelated acceptance. Match SvxBorderTabPage::FillItemSet changed-item omission and ItemSetToTableParam conditional border/row-split selection lifetime. One bounded correction; full native box items/border geometry remain unverified."
sections:
  Summary: "Iteration204 under active C9TN6M. Correct unconditional border/padding emission and application on properties acceptance; preserve heterogeneous original cell formatting for untouched controls. Follow pinned SvxBorderTabPage::FillItemSet and conditional ItemSetToTableParam border/row-split selection lifetime."
  Scope: |-
    apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    apps/office/src/sw/source/uibase/shells/tabsh.ts
    apps/office/src/sw/source/core/frmedt/fetab.ts
    apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
    apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx
    apps/office/e2e/writer-table-border-changed-items.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Exact8semantic paths3production1explicit Reset omission migration2new acceptance2metadata. Existing546files545byte-identical+1precise native no-op expectation migration548total. All281 metadata records preserved. Source BoxItem couples border and distances, so any represented edit emits complete pair; only untouched pair omitted. Full native mixed common border/distance validity and per-edge geometry remain unverified, prior scalar first-cell changed-pair behavior retained pending native item port. Add original pre-temporary cursor snapshot into existing border attribute history (fetab) to repair original three failed cursor assertions; no old test weakening.
  Plan: "Source-fidelity refinement after initial profile: native RES_BOX couples distances/borders; omit only untouched pair and retain existing represented complete pair when edited, full mixed/per-edge native items remain unverified. Add fetab existing cursor-state history parameter to retain original pre-temporary cursor; original3failed tests preserved. Correct only original2failed browser guide expectations. Exact8paths3production1old migration2new acceptance2metadata, unchanged gates; focused original failures and genuinely new complete-carrier/offset cases only."
  Verify Steps: |-
    1. Initial six static gates ONCE: format:check,lint,typecheck,check:dependencies,check:docs,check:file-size; unchanged scoped JSDoc/actual physical<1000. Only failed or genuinely changed checks afterward.
    2. ONE full upstream-absent test:static/app coverage/inventory coverage/scripts/Chromium profile; restore vendor finally. Await all source/scope/AP audits before profile; no audits/mutations while live. Only original failures or genuinely new cases afterward, rebuild after production edits. Actual100 app/inventory; transfer genuine counters only entire byte-identical source/maps or full contiguous identical mapped declaration/body/enclosing branch/all locations; skips remain skipped.
    3. Untouched/Reset/change-back border and padding pair omitted; changed border or distance emits complete represented BoxItem pair, no explicit undefined-key clearing. Full native mixed common box/info validity remains unverified. Ordinary acceptance temporarily selects whole table, selected acceptance retains selected boxes. One grouped UndoRedo, original nodes/selection/list/pending attributes/continued input and ODT preserved. Insertion defaults unchanged. Browser1280/390 proves unrelated acceptance preserves both distinct cell formats and changed border acceptance/history.
    4. After restoration resource generation --check/source tree/provenance/invariants/parity audits; pinned source hashes, exact8path scope,546old acceptance545byte-identical+1exact migration548total and281 complete metadata/default/status/classification/registered I/O prefixes preserved. Doctor/routing/diff/current leaf generated quality0forbidden. Same current agent EVALUATOR explicitly not independent; final prose before canonical verify, finish actual implementation SHA, immutable whole541073-character parent Findings prefix SHA5dc3324e978f9bf090791b6ad39ccf7b294878b92473d82aefddff7ea6748efb and clean state.
  Verification: "Pending; no full native border or overall project parity claim."
  Rollback Plan: "Revert only the scoped implementation commit if behavior fails, preserve AP traceability and immutable DONE records. Do not change registered I/O deviations or retained deferred stash."
  Findings: "Preflight main/clean, direct workflow, parent active and leaf203DONE. Pinned border page emits box/info only when changed, table dialog applies borders conditionally within temporary whole-table selection when unselected. Existing browser scalar representation remains incomplete; this leaf fixes destructive untouched-control behavior and source-shaped caller admission only. Missing optional user-instructions path lookup returned2; route refreshed before mutation. Standing iterative user authorization applies; no new approval pause/network/global/subagents."
id_source: "generated"
---
## Summary

Iteration204 under active C9TN6M. Correct unconditional border/padding emission and application on properties acceptance; preserve heterogeneous original cell formatting for untouched controls. Follow pinned SvxBorderTabPage::FillItemSet and conditional ItemSetToTableParam border/row-split selection lifetime.

## Scope

apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
apps/office/src/sw/source/uibase/shells/tabsh.ts
apps/office/src/sw/source/core/frmedt/fetab.ts
apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx
apps/office/e2e/writer-table-border-changed-items.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Exact8semantic paths3production1explicit Reset omission migration2new acceptance2metadata. Existing546files545byte-identical+1precise native no-op expectation migration548total. All281 metadata records preserved. Source BoxItem couples border and distances, so any represented edit emits complete pair; only untouched pair omitted. Full native mixed common border/distance validity and per-edge geometry remain unverified, prior scalar first-cell changed-pair behavior retained pending native item port. Add original pre-temporary cursor snapshot into existing border attribute history (fetab) to repair original three failed cursor assertions; no old test weakening.

## Plan

Source-fidelity refinement after initial profile: native RES_BOX couples distances/borders; omit only untouched pair and retain existing represented complete pair when edited, full mixed/per-edge native items remain unverified. Add fetab existing cursor-state history parameter to retain original pre-temporary cursor; original3failed tests preserved. Correct only original2failed browser guide expectations. Exact8paths3production1old migration2new acceptance2metadata, unchanged gates; focused original failures and genuinely new complete-carrier/offset cases only.

## Verify Steps

1. Initial six static gates ONCE: format:check,lint,typecheck,check:dependencies,check:docs,check:file-size; unchanged scoped JSDoc/actual physical<1000. Only failed or genuinely changed checks afterward.
2. ONE full upstream-absent test:static/app coverage/inventory coverage/scripts/Chromium profile; restore vendor finally. Await all source/scope/AP audits before profile; no audits/mutations while live. Only original failures or genuinely new cases afterward, rebuild after production edits. Actual100 app/inventory; transfer genuine counters only entire byte-identical source/maps or full contiguous identical mapped declaration/body/enclosing branch/all locations; skips remain skipped.
3. Untouched/Reset/change-back border and padding pair omitted; changed border or distance emits complete represented BoxItem pair, no explicit undefined-key clearing. Full native mixed common box/info validity remains unverified. Ordinary acceptance temporarily selects whole table, selected acceptance retains selected boxes. One grouped UndoRedo, original nodes/selection/list/pending attributes/continued input and ODT preserved. Insertion defaults unchanged. Browser1280/390 proves unrelated acceptance preserves both distinct cell formats and changed border acceptance/history.
4. After restoration resource generation --check/source tree/provenance/invariants/parity audits; pinned source hashes, exact8path scope,546old acceptance545byte-identical+1exact migration548total and281 complete metadata/default/status/classification/registered I/O prefixes preserved. Doctor/routing/diff/current leaf generated quality0forbidden. Same current agent EVALUATOR explicitly not independent; final prose before canonical verify, finish actual implementation SHA, immutable whole541073-character parent Findings prefix SHA5dc3324e978f9bf090791b6ad39ccf7b294878b92473d82aefddff7ea6748efb and clean state.

## Verification

Pending; no full native border or overall project parity claim.

## Rollback Plan

Revert only the scoped implementation commit if behavior fails, preserve AP traceability and immutable DONE records. Do not change registered I/O deviations or retained deferred stash.

## Findings

Preflight main/clean, direct workflow, parent active and leaf203DONE. Pinned border page emits box/info only when changed, table dialog applies borders conditionally within temporary whole-table selection when unselected. Existing browser scalar representation remains incomplete; this leaf fixes destructive untouched-control behavior and source-shaped caller admission only. Missing optional user-instructions path lookup returned2; route refreshed before mutation. Standing iterative user authorization applies; no new approval pause/network/global/subagents.
