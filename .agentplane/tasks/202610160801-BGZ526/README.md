---
id: "202610160801-BGZ526"
title: "Connect local cell references and native formula tracking"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T08:02:39.982Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T08:56:07.764Z"
  updated_by: "CODER"
  note: "Passed bounded local-reference/tracking delivery:214Calc cases and49owners raw100;242related cases and2shared owners raw100;build+4Chromium/Worker scenarios,13source gates,20pinned-source audit and58path/hash audit. No UI/ODS readiness or all-app full-run claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T08:56:42.887Z"
  updated_by: "EVALUATOR"
  note: "Same-agent quality review passes the bounded local-reference/tracking milestone at source229b0d18a438;58exact non-task source hashes and all declared evidence match. UI/ODS readiness remains unclaimed."
  evaluated_sha: "229b0d18a438e0cbae1562360f57025ec877c96c"
  blueprint_digest: "2c263c86b103a76a3d8fbb5759496aa049270741d0f4b33827b0b324775cefd7"
  evidence_refs:
    - ".agentplane/tasks/202610160801-BGZ526/README.md"
    - ".agentplane/tasks/202610160801-BGZ526/quality/20261016-085642887-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160801-BGZ526/quality/20261016-085642887-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160801-BGZ526/quality/20261016-085642887-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160801-BGZ526/blueprint/resolved-snapshot.json"
    - "output/playwright/task201-checks/quality-source-audit.json"
    - "output/playwright/task201-checks/final-audit.json"
    - "output/playwright/task201-checks/source-audit.json"
    - "output/playwright/task201-checks/source-gates.json"
    - "output/playwright/task201-checks/value-coverage-audit.json"
    - "output/playwright/task201-checks/build-browser-manifest.json"
  findings:
    - "Actual ScDocument/ScTable/ScColumn/formula/token owners reuse shared Svt and mdds;no parallel dependency graph or physical memory manager. Shared runtime bodies are unchanged after erasing types. Native default-address error read is preserved and journaled CALC-186."
    - "Whole Calc214cases/49owners and related242cases/2shared owners have strict every-raw-counter100;production build+4Chromium/DOM-free Worker scenarios and13source gates pass. All5native links were absent for portable runs and restored."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement local cell-reference evaluation and actual single-cell broadcaster/FormulaTrack invalidation on the existing document, reusing shared observers and cell views without UI or a second graph."
events:
  -
    type: "status"
    at: "2026-10-16T08:02:50.917Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement local cell-reference evaluation and actual single-cell broadcaster/FormulaTrack invalidation on the existing document, reusing shared observers and cell views without UI or a second graph."
  -
    type: "verify"
    at: "2026-10-16T08:56:07.764Z"
    author: "CODER"
    state: "ok"
    note: "Passed bounded local-reference/tracking delivery:214Calc cases and49owners raw100;242related cases and2shared owners raw100;build+4Chromium/Worker scenarios,13source gates,20pinned-source audit and58path/hash audit. No UI/ODS readiness or all-app full-run claim."
doc_version: 3
doc_updated_at: "2026-10-16T08:56:07.838Z"
doc_updated_by: "CODER"
description: "Task201: extend the actual Calc formula path with valid local A1 references, real cell views, shared Svt notifications, broadcaster stores and source-shaped FormulaTrack/FormulaTree invalidation. Keep ODS and separate UI readiness as the delivery priority; no alternative dependency graph."
sections:
  Summary: "Task201: connect valid same-sheet A1 reference tokens and real source-shaped single-cell notification/tracking to existing Calc formula cells. This directly advances minimal editable-core readiness and same-model ODS work; UI remains separate."
  Scope: "Calc address Details/Parse local A1 subset, ScCompiler/ScTokenArray reference binding, existing ScRefCellValue document/formula views, interpreter numeric/empty/direct-text reference results, ScHint, actual shared SvtBroadcaster/SvtListener, mdds BroadcasterStoreType and existing column/table/document/formula-cell owners. Implement native logical FormulaTrack/FormulaTree linked membership and dispatch, detach/replacement/clear, cycle error for normal noniterative mode and sheet insertion positions. Shared notifier generic object bound must accept real SfxHint subclasses without changing dispatch algorithms or adding a Calc observer clone/Writer compatibility shim. Runtime/header paths are the existing address/token/cellvalue/compiler/interpreter/formulacell/document/table/column/mtvelements owners, new sc/inc/brdcst.ts and optional source-shaped tracking helper shard if file budget requires; paired inventory/provenance/capabilities and focused tests/docs. Native lifetime notifications may call existing SvtBroadcaster.Dispose when a stored broadcaster is removed; JS GC still owns physical object lifetime. Explicitly unsupported: cross-sheet/external/range/named references, functions/SUM, locale string-to-number formatting, full recursion/iteration/group/area broadcasting and full constructor services. Do not manufacture default numeric conversion or a second dependency graph."
  Plan: "1. Audit pinned valid local reference parser/flags, reference cell views, scalar interpretation, native single-cell broadcaster storage and logical tracking/tree queues. 2. Extend the actual source owners and reuse shared observers and stores, with explicit unsupported boundaries. 3. Verify reference offsets/absolute flags, sparse cells, chains, duplicate subscriptions, replacement/clear, errors/cycles, direct text results, forced tracking and sheet-position changes. 4. Update inventory and current readiness; strict exact-owner whole-Calc/changed-shared raw100 plus related shared and affected Writer tests, actual Chromium/Worker, source gates and same-agent review. Serialization/basic ODS remains the next delivery priority; ranges/functions must not trigger broad kernel parity or language detours. Full all-app run only at minimal UI+ODS-ready milestone, then pause."
  Verify Steps: |-
    - node output/playwright/task201-checks/source-audit.mjs: pinned reached upstream parser/reference/view/listener/queue/tree/error behavior and explicit omitted services; no native compilation/probes.
    - node output/playwright/task201-checks/portable.mjs: whole Calc strict raw S/B/F/L100 with exact owners; changed shared owners every raw counter positive and related notifier/block/reference/token tests plus affected Writer notification consumers; Writer-only coverage gaps exempt; all5 source references absent/restored.
    - node output/playwright/task201-checks/browser-portable.mjs: build and real formula reference edits/propagation in Chromium and DOM-free Worker without native references; affected Writer functional smoke if runtime notifier behavior changes.
    - node output/playwright/task201-checks/source-gates.mjs: all existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates, without threshold/allowlist relaxation.
    - Final source/path/ref/coverage audit, recorded verification/source commit and same-agent quality review before finish. No UI implementation, ODS claim or full all-app run until the requested milestone.
  Verification: |-
    Command: node output/playwright/task201-checks/source-audit.mjs. Result: pass. Evidence:20 pinned LibreOffice files, no native compilation/execution; both shared notifier bodies unchanged after erasing the generic bound. Scope: local references/views/parser/interpreter/queues and explicit unsupported services.
    Command: node output/playwright/task201-checks/portable.mjs. Result: pass. Evidence:214Calc cases/83files; exact49executable owners, raw5047statements/3257branches/1029functions/4525lines all100 with every raw counter positive. Related242cases/47files, exact2shared notifier owners raw129/61/29/116 all100. Includes affected Writer notification cases; no Writer-only gap remediation. Scope: whole Calc and changed shared owners, all5reference links absent/restored.
    Command: node output/playwright/task201-checks/browser-portable.mjs. Result: pass. Evidence:production build and4Chromium scenarios, each executes actual core modules in page and DOM-free Worker. Reference chain edit/cycle/replacement/clear passes. Scope:no product UI implementation; all5source references absent/restored. Writer browser rerun is inapplicable because the only shared runtime changes are erased types, with body identity proven and related Writer tests green.
    Command: node output/playwright/task201-checks/source-gates.mjs (all13gates, targeted remediation/resume; final format/lint/types/docs rerun after source changes). Result: pass. Evidence:format,lint,types,docs,size,dependencies,tree,provenance,inventory,routing,doctor,diff,boundaries. Doctor retains existing managed-hook warning; no hook changes.
    Command: node output/playwright/task201-checks/final-audit.mjs. Result: pass. Evidence:exact58non-task paths and hashes match the final portable source snapshot;49Calc/2shared raw100,13gates,20native source files and restored reference links. Scope:bounded same-sheet reference milestone only. ODS/formula serialization remains next;UI is a separate task;no all-app full run or readiness claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T08:56:07.764Z — VERIFY — ok

    By: CODER

    Note: Passed bounded local-reference/tracking delivery:214Calc cases and49owners raw100;242related cases and2shared owners raw100;build+4Chromium/Worker scenarios,13source gates,20pinned-source audit and58path/hash audit. No UI/ODS readiness or all-app full-run claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T08:56:07.070Z, excerpt_hash=sha256:bfeb58f325e81d1ef905ff88f0c7e202d3f2840ebd01943ac6252ae5b8193bba

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160801-BGZ526/blueprint/resolved-snapshot.json
    - old_digest: 2c263c86b103a76a3d8fbb5759496aa049270741d0f4b33827b0b324775cefd7
    - current_digest: 2c263c86b103a76a3d8fbb5759496aa049270741d0f4b33827b0b324775cefd7
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160801-BGZ526

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160801-BGZ526
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task201 source/metadata commits while preserving unrelated tasks and deferred LanguageTag work. No destructive reset, branch merge, publication or native-reference mutation."
  Findings: "Initial focused checks found a brittle error-message assertion and a missing IsDeleted check; corrected against pinned interpreter source. Additional source inspection retained native default-address reads after deleted references and per-axis invalid-address handling, with actual formula regression and journal CALC-186. Initial raw coverage exposed meaningful noncontiguous queue/invalid-coordinate paths; public initialized-owner tests cover them without private-state mutation or threshold changes. Lint removed test non-null assertions; erased-only bounds allow actual SfxHint. Initial typecheck called an unported document shortcut; the existing sheet-limit validator supplies the same native bounds. New facade provenance needs an exported binding although runtime-declared symbols stay empty; native namespace-contained symbols use their literal spelling. Capability IDs were regenerated by the existing inventory:id CLI after UUID-version validation. All final gates pass unchanged;no native compilation,network,physical memory manager,UI implementation or Writer-only coverage remediation. Source-derived edge findings do not certify broad upstream parity. Same-agent quality review follows the implementation commit."
id_source: "generated"
---
## Summary

Task201: connect valid same-sheet A1 reference tokens and real source-shaped single-cell notification/tracking to existing Calc formula cells. This directly advances minimal editable-core readiness and same-model ODS work; UI remains separate.

## Scope

Calc address Details/Parse local A1 subset, ScCompiler/ScTokenArray reference binding, existing ScRefCellValue document/formula views, interpreter numeric/empty/direct-text reference results, ScHint, actual shared SvtBroadcaster/SvtListener, mdds BroadcasterStoreType and existing column/table/document/formula-cell owners. Implement native logical FormulaTrack/FormulaTree linked membership and dispatch, detach/replacement/clear, cycle error for normal noniterative mode and sheet insertion positions. Shared notifier generic object bound must accept real SfxHint subclasses without changing dispatch algorithms or adding a Calc observer clone/Writer compatibility shim. Runtime/header paths are the existing address/token/cellvalue/compiler/interpreter/formulacell/document/table/column/mtvelements owners, new sc/inc/brdcst.ts and optional source-shaped tracking helper shard if file budget requires; paired inventory/provenance/capabilities and focused tests/docs. Native lifetime notifications may call existing SvtBroadcaster.Dispose when a stored broadcaster is removed; JS GC still owns physical object lifetime. Explicitly unsupported: cross-sheet/external/range/named references, functions/SUM, locale string-to-number formatting, full recursion/iteration/group/area broadcasting and full constructor services. Do not manufacture default numeric conversion or a second dependency graph.

## Plan

1. Audit pinned valid local reference parser/flags, reference cell views, scalar interpretation, native single-cell broadcaster storage and logical tracking/tree queues. 2. Extend the actual source owners and reuse shared observers and stores, with explicit unsupported boundaries. 3. Verify reference offsets/absolute flags, sparse cells, chains, duplicate subscriptions, replacement/clear, errors/cycles, direct text results, forced tracking and sheet-position changes. 4. Update inventory and current readiness; strict exact-owner whole-Calc/changed-shared raw100 plus related shared and affected Writer tests, actual Chromium/Worker, source gates and same-agent review. Serialization/basic ODS remains the next delivery priority; ranges/functions must not trigger broad kernel parity or language detours. Full all-app run only at minimal UI+ODS-ready milestone, then pause.

## Verify Steps

- node output/playwright/task201-checks/source-audit.mjs: pinned reached upstream parser/reference/view/listener/queue/tree/error behavior and explicit omitted services; no native compilation/probes.
- node output/playwright/task201-checks/portable.mjs: whole Calc strict raw S/B/F/L100 with exact owners; changed shared owners every raw counter positive and related notifier/block/reference/token tests plus affected Writer notification consumers; Writer-only coverage gaps exempt; all5 source references absent/restored.
- node output/playwright/task201-checks/browser-portable.mjs: build and real formula reference edits/propagation in Chromium and DOM-free Worker without native references; affected Writer functional smoke if runtime notifier behavior changes.
- node output/playwright/task201-checks/source-gates.mjs: all existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates, without threshold/allowlist relaxation.
- Final source/path/ref/coverage audit, recorded verification/source commit and same-agent quality review before finish. No UI implementation, ODS claim or full all-app run until the requested milestone.

## Verification

Command: node output/playwright/task201-checks/source-audit.mjs. Result: pass. Evidence:20 pinned LibreOffice files, no native compilation/execution; both shared notifier bodies unchanged after erasing the generic bound. Scope: local references/views/parser/interpreter/queues and explicit unsupported services.
Command: node output/playwright/task201-checks/portable.mjs. Result: pass. Evidence:214Calc cases/83files; exact49executable owners, raw5047statements/3257branches/1029functions/4525lines all100 with every raw counter positive. Related242cases/47files, exact2shared notifier owners raw129/61/29/116 all100. Includes affected Writer notification cases; no Writer-only gap remediation. Scope: whole Calc and changed shared owners, all5reference links absent/restored.
Command: node output/playwright/task201-checks/browser-portable.mjs. Result: pass. Evidence:production build and4Chromium scenarios, each executes actual core modules in page and DOM-free Worker. Reference chain edit/cycle/replacement/clear passes. Scope:no product UI implementation; all5source references absent/restored. Writer browser rerun is inapplicable because the only shared runtime changes are erased types, with body identity proven and related Writer tests green.
Command: node output/playwright/task201-checks/source-gates.mjs (all13gates, targeted remediation/resume; final format/lint/types/docs rerun after source changes). Result: pass. Evidence:format,lint,types,docs,size,dependencies,tree,provenance,inventory,routing,doctor,diff,boundaries. Doctor retains existing managed-hook warning; no hook changes.
Command: node output/playwright/task201-checks/final-audit.mjs. Result: pass. Evidence:exact58non-task paths and hashes match the final portable source snapshot;49Calc/2shared raw100,13gates,20native source files and restored reference links. Scope:bounded same-sheet reference milestone only. ODS/formula serialization remains next;UI is a separate task;no all-app full run or readiness claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T08:56:07.764Z — VERIFY — ok

By: CODER

Note: Passed bounded local-reference/tracking delivery:214Calc cases and49owners raw100;242related cases and2shared owners raw100;build+4Chromium/Worker scenarios,13source gates,20pinned-source audit and58path/hash audit. No UI/ODS readiness or all-app full-run claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T08:56:07.070Z, excerpt_hash=sha256:bfeb58f325e81d1ef905ff88f0c7e202d3f2840ebd01943ac6252ae5b8193bba

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160801-BGZ526/blueprint/resolved-snapshot.json
- old_digest: 2c263c86b103a76a3d8fbb5759496aa049270741d0f4b33827b0b324775cefd7
- current_digest: 2c263c86b103a76a3d8fbb5759496aa049270741d0f4b33827b0b324775cefd7
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160801-BGZ526

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160801-BGZ526
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task201 source/metadata commits while preserving unrelated tasks and deferred LanguageTag work. No destructive reset, branch merge, publication or native-reference mutation.

## Findings

Initial focused checks found a brittle error-message assertion and a missing IsDeleted check; corrected against pinned interpreter source. Additional source inspection retained native default-address reads after deleted references and per-axis invalid-address handling, with actual formula regression and journal CALC-186. Initial raw coverage exposed meaningful noncontiguous queue/invalid-coordinate paths; public initialized-owner tests cover them without private-state mutation or threshold changes. Lint removed test non-null assertions; erased-only bounds allow actual SfxHint. Initial typecheck called an unported document shortcut; the existing sheet-limit validator supplies the same native bounds. New facade provenance needs an exported binding although runtime-declared symbols stay empty; native namespace-contained symbols use their literal spelling. Capability IDs were regenerated by the existing inventory:id CLI after UUID-version validation. All final gates pass unchanged;no native compilation,network,physical memory manager,UI implementation or Writer-only coverage remediation. Source-derived edge findings do not certify broad upstream parity. Same-agent quality review follows the implementation commit.
