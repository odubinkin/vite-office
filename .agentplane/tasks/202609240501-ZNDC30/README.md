---
id: "202609240501-ZNDC30"
title: "Restore SvxTabStopItem in Writer formatting"
result_summary: "Restored pinned Writer SvxTabStopItem semantics across pool, UI, snapshots and ODT"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on:
  - "202609240501-76PKPC"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T05:43:03.226Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T06:18:11.145Z"
  updated_by: "CODER"
  note: "Restored pinned Writer SvxTabStopItem semantics across pool, UI, snapshots and ODT"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T06:17:41.230Z"
  updated_by: "EVALUATOR"
  note: "Upstream tab-stop item identity, pinned defaults, ODT fields and empty sequence are implemented with focused tests and full verify."
  evaluated_sha: "0c239b673ba8b3da1e5e1f2c0732c7994a422c0a"
  blueprint_digest: "cb72f5daebf5081fb696fb58a460fd884dae27eacd0c9e45d2c570cb8cf96f27"
  evidence_refs:
    - ".agentplane/tasks/202609240501-ZNDC30/README.md"
    - ".agentplane/tasks/202609240501-ZNDC30/quality/20260924-061741230-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609240501-ZNDC30/quality/20260924-061741230-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609240501-ZNDC30/quality/20260924-061741230-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609240501-ZNDC30/blueprint/resolved-snapshot.json"
    - "apps/office/src/editeng/source/items/paraitem.test.ts"
    - "apps/office/src/sw/source/filter/xml/odt-property-roundtrip.test.ts"
    - "npm run verify: 448 office tests and 96 inventory tests with 100% coverage; 13 E2E passed"
  findings:
    - "No remaining RES_PARATR_TABSTOP integer surrogate in production."
commit:
  hash: "0c239b673ba8b3da1e5e1f2c0732c7994a422c0a"
  message: "🧩 ZNDC30 code: restore upstream Writer tab-stop item contract"
comments:
  -
    author: "CODER"
    body: "Start: restore pinned SvxTabStopItem identity and defaults across Writer model, shell, supported UI and ODT paths with source-derived tests."
  -
    author: "CODER"
    body: "Verified: npm run verify passed after tab-stop item migration, ODT round trips and inventory updates."
events:
  -
    type: "status"
    at: "2026-09-24T05:43:08.424Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore pinned SvxTabStopItem identity and defaults across Writer model, shell, supported UI and ODT paths with source-derived tests."
  -
    type: "verify"
    at: "2026-09-24T06:17:21.992Z"
    author: "CODER"
    state: "ok"
    note: "Pinned SvxTabStopItem pool/style defaults, sorted stops, alignment/leader/decimal, snapshot and ODT round trips verified; npm run verify passed (448 office tests and 96 inventory tests at 100% coverage, 13 browser E2E, static build, provenance and parity checks)."
  -
    type: "verify"
    at: "2026-09-24T06:18:11.145Z"
    author: "CODER"
    state: "ok"
    note: "Restored pinned Writer SvxTabStopItem semantics across pool, UI, snapshots and ODT"
  -
    type: "status"
    at: "2026-09-24T06:18:11.291Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: npm run verify passed after tab-stop item migration, ODT round trips and inventory updates."
doc_version: 3
doc_updated_at: "2026-09-24T06:18:11.292Z"
doc_updated_by: "CODER"
description: "Stage 2a: replace integer tab-stop surrogate with pinned SvxTabStopItem identity, defaults, alignment and fill through pool, shell, UI, ODT and undo"
sections:
  Summary: |-
    Restore Writer item types and defaults

    Stage 2: implement SvxTabStopItem and SwLineNumberInfo with upstream defaults through pool, shell, UI, ODT and undo
  Scope: "Stage 2a of the approved parity plan. Replace RES_PARATR_TABSTOP integer/list surrogates with upstream-shaped SvxTabStop and SvxTabStopItem, including 1134-twip default spacing, adjustment, decimal and fill characters, sorted item identity, and safe persistence. Migrate current Writer pool/style defaults, shell command paths, React projection/drafts, ruler inputs, supported ODF import/export, undo and tests. Expected areas: editeng/source/items, svl/source/items, sw/source/core/attr and doc codecs/defaults, sw/source/uibase, sw/browser/presentation, sw/source/filter/xml, xmloff property types, and affected parity/provenance data. Keep browser save workflow and inventory machinery unchanged; no network."
  Plan: "1. Port the bounded SvxTabStop and SvxTabStopItem value contract from pinned editeng and register the Writer pool default. 2. Replace item storage, shell, UI projection, and supported ODF paths without changing browser save workflows. 3. Add source-derived item, undo, and ODT tests for alignment, fill, defaults, and multiple stops. 4. Update inventory/provenance data, run full verification, record evidence, and close."
  Verify Steps: "1. Compare model API, default count/distance, stop ordering/replacement, adjustment, fill, decimal, equality and clone against pinned editeng/source/items/paraitem.cxx, include/editeng/tstpitem.hxx, and sw/source/core/bastyp/init.cxx; run focused item and pool tests. 2. Test shell edits, dialog/ruler values, undo/redo, and ODT round trips for one and multiple tab stops with alignment/fill preserved; no RES_PARATR_TABSTOP integer surrogate remains in production. 3. Run npm run verify; all static, type, unit, browser, source, provenance, and inventory checks pass. 4. Inspect diff and git status for only this task scope, and confirm recovery/autosave/save behavior is unchanged."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T06:17:21.992Z — VERIFY — ok

    By: CODER

    Note: Pinned SvxTabStopItem pool/style defaults, sorted stops, alignment/leader/decimal, snapshot and ODT round trips verified; npm run verify passed (448 office tests and 96 inventory tests at 100% coverage, 13 browser E2E, static build, provenance and parity checks).
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T05:43:08.424Z, excerpt_hash=sha256:3d7e6dc0a7779590cb862bec9d1f906220e2c9bded69b9ac51968008cd6ef3c9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-ZNDC30/blueprint/resolved-snapshot.json
    - old_digest: cb72f5daebf5081fb696fb58a460fd884dae27eacd0c9e45d2c570cb8cf96f27
    - current_digest: cb72f5daebf5081fb696fb58a460fd884dae27eacd0c9e45d2c570cb8cf96f27
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240501-ZNDC30

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240501-ZNDC30
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-24T06:18:11.145Z — VERIFY — ok

    By: CODER

    Note: Restored pinned Writer SvxTabStopItem semantics across pool, UI, snapshots and ODT
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T06:17:22.232Z, excerpt_hash=sha256:3d7e6dc0a7779590cb862bec9d1f906220e2c9bded69b9ac51968008cd6ef3c9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-ZNDC30/blueprint/resolved-snapshot.json
    - old_digest: cb72f5daebf5081fb696fb58a460fd884dae27eacd0c9e45d2c570cb8cf96f27
    - current_digest: cb72f5daebf5081fb696fb58a460fd884dae27eacd0c9e45d2c570cb8cf96f27
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240501-ZNDC30

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609240501-ZNDC30 --result verified-202609240501-ZNDC30 --commit 1e3e10039c0fb93c73968b1618c30605e9bb8ae1
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this item-model migration and task close commit, restore original item representation, then rerun focused Writer formatting and ODT tests plus npm run verify."
  Findings: "Pinned source: include/editeng/tstpitem.hxx defines SvxTabStopItem with stop position, adjustment, decimal and fill; editeng/source/items/paraitem.cxx stores sorted stops; sw/source/core/bastyp/init.cxx registers one default stop at SVX_TAB_DEFDIST=1134 twips. Existing local representation is SfxInt16Item or SfxInt16ListItem."
id_source: "generated"
---
## Summary

Restore Writer item types and defaults

Stage 2: implement SvxTabStopItem and SwLineNumberInfo with upstream defaults through pool, shell, UI, ODT and undo

## Scope

Stage 2a of the approved parity plan. Replace RES_PARATR_TABSTOP integer/list surrogates with upstream-shaped SvxTabStop and SvxTabStopItem, including 1134-twip default spacing, adjustment, decimal and fill characters, sorted item identity, and safe persistence. Migrate current Writer pool/style defaults, shell command paths, React projection/drafts, ruler inputs, supported ODF import/export, undo and tests. Expected areas: editeng/source/items, svl/source/items, sw/source/core/attr and doc codecs/defaults, sw/source/uibase, sw/browser/presentation, sw/source/filter/xml, xmloff property types, and affected parity/provenance data. Keep browser save workflow and inventory machinery unchanged; no network.

## Plan

1. Port the bounded SvxTabStop and SvxTabStopItem value contract from pinned editeng and register the Writer pool default. 2. Replace item storage, shell, UI projection, and supported ODF paths without changing browser save workflows. 3. Add source-derived item, undo, and ODT tests for alignment, fill, defaults, and multiple stops. 4. Update inventory/provenance data, run full verification, record evidence, and close.

## Verify Steps

1. Compare model API, default count/distance, stop ordering/replacement, adjustment, fill, decimal, equality and clone against pinned editeng/source/items/paraitem.cxx, include/editeng/tstpitem.hxx, and sw/source/core/bastyp/init.cxx; run focused item and pool tests. 2. Test shell edits, dialog/ruler values, undo/redo, and ODT round trips for one and multiple tab stops with alignment/fill preserved; no RES_PARATR_TABSTOP integer surrogate remains in production. 3. Run npm run verify; all static, type, unit, browser, source, provenance, and inventory checks pass. 4. Inspect diff and git status for only this task scope, and confirm recovery/autosave/save behavior is unchanged.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T06:17:21.992Z — VERIFY — ok

By: CODER

Note: Pinned SvxTabStopItem pool/style defaults, sorted stops, alignment/leader/decimal, snapshot and ODT round trips verified; npm run verify passed (448 office tests and 96 inventory tests at 100% coverage, 13 browser E2E, static build, provenance and parity checks).
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T05:43:08.424Z, excerpt_hash=sha256:3d7e6dc0a7779590cb862bec9d1f906220e2c9bded69b9ac51968008cd6ef3c9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-ZNDC30/blueprint/resolved-snapshot.json
- old_digest: cb72f5daebf5081fb696fb58a460fd884dae27eacd0c9e45d2c570cb8cf96f27
- current_digest: cb72f5daebf5081fb696fb58a460fd884dae27eacd0c9e45d2c570cb8cf96f27
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240501-ZNDC30

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240501-ZNDC30
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-24T06:18:11.145Z — VERIFY — ok

By: CODER

Note: Restored pinned Writer SvxTabStopItem semantics across pool, UI, snapshots and ODT
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T06:17:22.232Z, excerpt_hash=sha256:3d7e6dc0a7779590cb862bec9d1f906220e2c9bded69b9ac51968008cd6ef3c9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-ZNDC30/blueprint/resolved-snapshot.json
- old_digest: cb72f5daebf5081fb696fb58a460fd884dae27eacd0c9e45d2c570cb8cf96f27
- current_digest: cb72f5daebf5081fb696fb58a460fd884dae27eacd0c9e45d2c570cb8cf96f27
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240501-ZNDC30

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609240501-ZNDC30 --result verified-202609240501-ZNDC30 --commit 1e3e10039c0fb93c73968b1618c30605e9bb8ae1
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this item-model migration and task close commit, restore original item representation, then rerun focused Writer formatting and ODT tests plus npm run verify.

## Findings

Pinned source: include/editeng/tstpitem.hxx defines SvxTabStopItem with stop position, adjustment, decimal and fill; editeng/source/items/paraitem.cxx stores sorted stops; sw/source/core/bastyp/init.cxx registers one default stop at SVX_TAB_DEFDIST=1134 twips. Existing local representation is SfxInt16Item or SfxInt16ListItem.
