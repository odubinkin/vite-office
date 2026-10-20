---
id: "202610191240-WP2DC4"
title: "Connect Calc font-size UI to native cell attributes and ODS persistence"
result_summary: "Connected shared Writer font-size selector to actual Calc three-script cell attributes,mixed selection state,real undo/redo and ODS/autosave;326Calc and33shared cases raw100,17browser and91tooling cases pass. Fixed-row large-font clipping is the next UI priority. Task34,nextfull40."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T12:40:55.460Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-19T13:53:23.155Z"
  updated_by: "CODER"
  note: "Connected shared Writer font-size selector to actual Calc three-script cell attributes,mixed selection state,real undo/redo and ODS/autosave;326Calc and33shared cases raw100,17browser and91tooling cases pass. Fixed-row large-font clipping is the next UI priority. Task34,nextfull40."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-19T13:53:05.406Z"
  updated_by: "EVALUATOR"
  note: "Reviewed433c4103e961: bounded shared Calc font-size UI uses genuine attribute,undo and ODS owners;full native row layout and remaining UI remain explicit follow-up work."
  evaluated_sha: "433c4103e96153d9f123c38824bdc82d020866ad"
  blueprint_digest: "76fce8d1cce93d9342d2c95d2f9e60c8a0f58d28846d26b547ad2db1e0f8115e"
  evidence_refs:
    - ".agentplane/tasks/202610191240-WP2DC4/README.md"
    - ".agentplane/tasks/202610191240-WP2DC4/quality/20261019-135305406-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610191240-WP2DC4/quality/20261019-135305406-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610191240-WP2DC4/quality/20261019-135305406-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610191240-WP2DC4/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610191240-WP2DC4/verification.md"
    - ".agentplane/tasks/202610191240-WP2DC4/evidence/changed-owner-coverage-final.json"
    - ".agentplane/tasks/202610191240-WP2DC4/evidence/static-checks-final.json"
    - ".agentplane/tasks/202610191240-WP2DC4/evidence/source-audit.json"
    - ".agentplane/tasks/202610191240-WP2DC4/evidence/browser-calc-final.log"
  findings:
    - "The source-backed100..124pool and canonical row runs avoid a browser formatting map or fake defaults. Three-script font-height deltas,normal ranges/groups,mixed state,history and real primary ODS persistence are tested.326Calc cases raw100 plus33shared cases raw100 cover20complete executable changed app owners;17real browser and91related tooling cases pass. Pure DocPool/VCL dependency admission is exact-owner/exact-target,with browser/reverse negatives retained;no threshold/exclusion relaxation. The79path footprint comprises34code/test/tooling,43canonical records and2docs for this same user-authorized vertical slice. Native broad parity is not claimed. Final screenshots confirm fixed-row clipping,so row-height/overflow is the next UI priority."
commit:
  hash: "433c4103e96153d9f123c38824bdc82d020866ad"
  message: "🧩 WP2DC4 calc: connect shared font-size UI to cell attributes"
comments:
  -
    author: "CODER"
    body: "Start: User authorized all currently feasible Calc UI actions; implement end-to-end shared font-size control with original attribute storage/defaults and no unrelated kernel prerequisites."
  -
    author: "CODER"
    body: "Verified: Connected shared Writer font-size selector to actual Calc three-script cell attributes,mixed selection state,real undo/redo and ODS/autosave;326Calc and33shared cases raw100,17browser and91tooling cases pass. Fixed-row large-font clipping is the next UI priority. Task34,nextfull40.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-19T12:41:00.004Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: User authorized all currently feasible Calc UI actions; implement end-to-end shared font-size control with original attribute storage/defaults and no unrelated kernel prerequisites."
  -
    type: "verify"
    at: "2026-10-19T13:51:52.492Z"
    author: "CODER"
    state: "ok"
    note: "Shared Calc FontHeight UI applies genuine three-script cell attributes with selection/group state,real undo and same-model ODS/autosave.326Calc+33shared cases raw100;20complete executable app owners raw100;91related tooling and17browser cases pass. All final gates pass. Native row layout and remaining UI remain pending;task34,nextfull40."
  -
    type: "verify"
    at: "2026-10-19T13:53:23.155Z"
    author: "CODER"
    state: "ok"
    note: "Connected shared Writer font-size selector to actual Calc three-script cell attributes,mixed selection state,real undo/redo and ODS/autosave;326Calc and33shared cases raw100,17browser and91tooling cases pass. Fixed-row large-font clipping is the next UI priority. Task34,nextfull40."
  -
    type: "status"
    at: "2026-10-19T13:53:23.265Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Connected shared Writer font-size selector to actual Calc three-script cell attributes,mixed selection state,real undo/redo and ODS/autosave;326Calc and33shared cases raw100,17browser and91tooling cases pass. Fixed-row large-font clipping is the next UI priority. Task34,nextfull40.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-19T13:53:23.266Z"
doc_updated_by: "CODER"
description: "Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40."
sections:
  Summary: |-
    Connect Calc font-size UI to native cell attributes and ODS persistence

    Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40.
  Scope: |-
    - In scope: Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40.
    - Out of scope: unrelated refactors not required for "Connect Calc font-size UI to native cell attributes and ODS persistence".
  Plan: "Deliver font size end to end through the existing shared Writer selector and real Calc Sfx command. Port the consumed native ScDocumentPool font prefix and ScAttrArray row spans, connect column/table/document pattern APIs, apply all three native font-height items over real selected ranges and sheets with undo ownership, project effective/mixed height state and grid CSS, and round-trip automatic cell styles including styled empty ranges through ODS. Add meaningful core/command/browser/persistence regressions and original-source provenance/capability evidence. Expected scope: up to 35 implementation/test/inventory/doc paths plus task evidence. Validate whole Calc raw S/B/F/L 100%, complete changed-owner coverage 100%, related modules, Calc browser flows, types/build/static/style/inventory/provenance gates. No unrelated codec work; no full suite before task40."
  Verify Steps: "Run npm run test:coverage:calc in apps/office and require raw statements/branches/functions/lines 100% with no added exclusions. Run related shared-owner tests and full changed-owner raw coverage at 100%. Verify original source constants/defaults/split/merge/ownership and font-size three-script selection behavior; multi-sheet, mixed/default, input rejection, undo/redo and ODS styled empty ranges must be covered. Run Calc browser font-size flows at desktop/mobile sizes against a fresh build. Run app types/build, changed-path lint/format/docs/size, architecture/dependencies/provenance/resource/capability validators, doctor and routing. Save evidence and require clean calc checkout after task closure. Full application test suite is deliberately scheduled at iteration40 per user cadence (last full30)."
  Verification: |-
    Passed whole Calc115files326cases with raw S7281/B4632/F1481/L6527 all100%,zero skipped and no new exclusions. Related shared5files33cases raw S278/B61/F11/L271 all100%. Twenty complete executable changed application owners raw S1668/B792/F289/L1525 all100%;the canonical column re-export has no own Istanbul counters. All17Calc browser cases pass on final build,including actual shared font-size widget at1280/390,selection,mixed state and undo/redo. Related tooling3files91cases pass. Types,build,static,changed-path lint/format,JSDoc,size,source-tree,dependencies,source provenance,Calc resources,scoped Calc/shared inventories,doctor,routing and diff checks pass. Source-audit and original untouched raw maps,source/dist/screenshot hashes are under evidence. Final screenshots inspected;large fonts clip in pre-existing fixed22px rows,so automatic row height/overflow remain next UI work. Task34;last full30,next full40. Full broad native parity remains unverified.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-19T13:51:52.492Z — VERIFY — ok

    By: CODER

    Note: Shared Calc FontHeight UI applies genuine three-script cell attributes with selection/group state,real undo and same-model ODS/autosave.326Calc+33shared cases raw100;20complete executable app owners raw100;91related tooling and17browser cases pass. All final gates pass. Native row layout and remaining UI remain pending;task34,nextfull40.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T13:50:28.937Z, excerpt_hash=sha256:f306b7ff6b73beac79a61a6b09870a8f16189bd2a4534a76eae96ac2c662f2ef

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191240-WP2DC4/blueprint/resolved-snapshot.json
    - old_digest: 76fce8d1cce93d9342d2c95d2f9e60c8a0f58d28846d26b547ad2db1e0f8115e
    - current_digest: 76fce8d1cce93d9342d2c95d2f9e60c8a0f58d28846d26b547ad2db1e0f8115e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610191240-WP2DC4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610191240-WP2DC4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-19T13:53:23.155Z — VERIFY — ok

    By: CODER

    Note: Connected shared Writer font-size selector to actual Calc three-script cell attributes,mixed selection state,real undo/redo and ODS/autosave;326Calc and33shared cases raw100,17browser and91tooling cases pass. Fixed-row large-font clipping is the next UI priority. Task34,nextfull40.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T13:51:52.553Z, excerpt_hash=sha256:f306b7ff6b73beac79a61a6b09870a8f16189bd2a4534a76eae96ac2c662f2ef

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191240-WP2DC4/blueprint/resolved-snapshot.json
    - old_digest: 76fce8d1cce93d9342d2c95d2f9e60c8a0f58d28846d26b547ad2db1e0f8115e
    - current_digest: 76fce8d1cce93d9342d2c95d2f9e60c8a0f58d28846d26b547ad2db1e0f8115e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610191240-WP2DC4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610191240-WP2DC4 --result verified-202610191240-WP2DC4 --commit 4801774137d1dc6c86f81ff4e795fdfcf720ea92
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's explicit implementation commit and its corresponding inventory/provenance entries if the action fails acceptance; retain evidence and do not alter other active tasks, the calc branch or user-owned merges."
  Findings: "User explicitly authorized all currently feasible Calc UI actions and concrete required kernel dependencies. This leaf delivers only font-size UI through genuine model/undo/ODS owners. The original35-path estimate was too small for34implementation/test/tooling paths plus43canonical registry records and2docs;all79non-task paths implement or document this same authorized vertical slice. No extra UI feature,network,external write,branch/worktree or merge was added. The old domain/VCL rule conflated pure native values with browser adapters;only DocPool->fntstyle/outdev-font is admitted,with source-backed sc->tools and vcl->i18nlangtag edges and negative/reverse/browser tests. No threshold or broad browser guard was disabled. Pool scope is actual contiguous100..124,with no fake page/cell defaults. Full script-aware foreign painting,named styles,family application,remaining defaults and row layout remain pending. Visual inspection confirms large text clips inside existing22px rows;next UI priority is real row-height/overflow behavior,not guessed CSS. CALC-194 records preserved native single-run out-of-range lookup;compiled native reproduction was not claimed. Native redundant interval guard is reduced only by integer-row invariant,without coverage exclusions. Initial UI expectation/cancellation gaps,source-pin whitespace and lint/docs issues were repaired;an optional TypeScript inspection exhausted Node heap and was replaced by bounded syntax-only inspection. Mandatory typecheck passes. Existing bundle/hook-readiness warnings remain. Root full lint's historical ignored output artifacts were not changed;intentional changed paths pass. No full all-app replay before iteration40."
id_source: "generated"
---
## Summary

Connect Calc font-size UI to native cell attributes and ODS persistence

Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40.

## Scope

- In scope: Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40.
- Out of scope: unrelated refactors not required for "Connect Calc font-size UI to native cell attributes and ODS persistence".

## Plan

Deliver font size end to end through the existing shared Writer selector and real Calc Sfx command. Port the consumed native ScDocumentPool font prefix and ScAttrArray row spans, connect column/table/document pattern APIs, apply all three native font-height items over real selected ranges and sheets with undo ownership, project effective/mixed height state and grid CSS, and round-trip automatic cell styles including styled empty ranges through ODS. Add meaningful core/command/browser/persistence regressions and original-source provenance/capability evidence. Expected scope: up to 35 implementation/test/inventory/doc paths plus task evidence. Validate whole Calc raw S/B/F/L 100%, complete changed-owner coverage 100%, related modules, Calc browser flows, types/build/static/style/inventory/provenance gates. No unrelated codec work; no full suite before task40.

## Verify Steps

Run npm run test:coverage:calc in apps/office and require raw statements/branches/functions/lines 100% with no added exclusions. Run related shared-owner tests and full changed-owner raw coverage at 100%. Verify original source constants/defaults/split/merge/ownership and font-size three-script selection behavior; multi-sheet, mixed/default, input rejection, undo/redo and ODS styled empty ranges must be covered. Run Calc browser font-size flows at desktop/mobile sizes against a fresh build. Run app types/build, changed-path lint/format/docs/size, architecture/dependencies/provenance/resource/capability validators, doctor and routing. Save evidence and require clean calc checkout after task closure. Full application test suite is deliberately scheduled at iteration40 per user cadence (last full30).

## Verification

Passed whole Calc115files326cases with raw S7281/B4632/F1481/L6527 all100%,zero skipped and no new exclusions. Related shared5files33cases raw S278/B61/F11/L271 all100%. Twenty complete executable changed application owners raw S1668/B792/F289/L1525 all100%;the canonical column re-export has no own Istanbul counters. All17Calc browser cases pass on final build,including actual shared font-size widget at1280/390,selection,mixed state and undo/redo. Related tooling3files91cases pass. Types,build,static,changed-path lint/format,JSDoc,size,source-tree,dependencies,source provenance,Calc resources,scoped Calc/shared inventories,doctor,routing and diff checks pass. Source-audit and original untouched raw maps,source/dist/screenshot hashes are under evidence. Final screenshots inspected;large fonts clip in pre-existing fixed22px rows,so automatic row height/overflow remain next UI work. Task34;last full30,next full40. Full broad native parity remains unverified.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-19T13:51:52.492Z — VERIFY — ok

By: CODER

Note: Shared Calc FontHeight UI applies genuine three-script cell attributes with selection/group state,real undo and same-model ODS/autosave.326Calc+33shared cases raw100;20complete executable app owners raw100;91related tooling and17browser cases pass. All final gates pass. Native row layout and remaining UI remain pending;task34,nextfull40.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T13:50:28.937Z, excerpt_hash=sha256:f306b7ff6b73beac79a61a6b09870a8f16189bd2a4534a76eae96ac2c662f2ef

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191240-WP2DC4/blueprint/resolved-snapshot.json
- old_digest: 76fce8d1cce93d9342d2c95d2f9e60c8a0f58d28846d26b547ad2db1e0f8115e
- current_digest: 76fce8d1cce93d9342d2c95d2f9e60c8a0f58d28846d26b547ad2db1e0f8115e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610191240-WP2DC4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610191240-WP2DC4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-19T13:53:23.155Z — VERIFY — ok

By: CODER

Note: Connected shared Writer font-size selector to actual Calc three-script cell attributes,mixed selection state,real undo/redo and ODS/autosave;326Calc and33shared cases raw100,17browser and91tooling cases pass. Fixed-row large-font clipping is the next UI priority. Task34,nextfull40.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-19T13:51:52.553Z, excerpt_hash=sha256:f306b7ff6b73beac79a61a6b09870a8f16189bd2a4534a76eae96ac2c662f2ef

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610191240-WP2DC4/blueprint/resolved-snapshot.json
- old_digest: 76fce8d1cce93d9342d2c95d2f9e60c8a0f58d28846d26b547ad2db1e0f8115e
- current_digest: 76fce8d1cce93d9342d2c95d2f9e60c8a0f58d28846d26b547ad2db1e0f8115e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610191240-WP2DC4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610191240-WP2DC4 --result verified-202610191240-WP2DC4 --commit 4801774137d1dc6c86f81ff4e795fdfcf720ea92
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's explicit implementation commit and its corresponding inventory/provenance entries if the action fails acceptance; retain evidence and do not alter other active tasks, the calc branch or user-owned merges.

## Findings

User explicitly authorized all currently feasible Calc UI actions and concrete required kernel dependencies. This leaf delivers only font-size UI through genuine model/undo/ODS owners. The original35-path estimate was too small for34implementation/test/tooling paths plus43canonical registry records and2docs;all79non-task paths implement or document this same authorized vertical slice. No extra UI feature,network,external write,branch/worktree or merge was added. The old domain/VCL rule conflated pure native values with browser adapters;only DocPool->fntstyle/outdev-font is admitted,with source-backed sc->tools and vcl->i18nlangtag edges and negative/reverse/browser tests. No threshold or broad browser guard was disabled. Pool scope is actual contiguous100..124,with no fake page/cell defaults. Full script-aware foreign painting,named styles,family application,remaining defaults and row layout remain pending. Visual inspection confirms large text clips inside existing22px rows;next UI priority is real row-height/overflow behavior,not guessed CSS. CALC-194 records preserved native single-run out-of-range lookup;compiled native reproduction was not claimed. Native redundant interval guard is reduced only by integer-row invariant,without coverage exclusions. Initial UI expectation/cancellation gaps,source-pin whitespace and lint/docs issues were repaired;an optional TypeScript inspection exhausted Node heap and was replaced by bounded syntax-only inspection. Mandatory typecheck passes. Existing bundle/hook-readiness warnings remain. Root full lint's historical ignored output artifacts were not changed;intentional changed paths pass. No full all-app replay before iteration40.
