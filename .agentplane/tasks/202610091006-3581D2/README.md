---
id: "202610091006-3581D2"
title: "Keep workbench presentation bound to the current native view owner"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T10:07:25.026Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T10:15:52.537Z"
  updated_by: "CODER"
  note: "216 unique related cases including6 fresh pass in one upstream-absent profile;0fail0skip0passing replay. Current original view/store ownership and borrowed/local cleanup verified; source-bound changed/app all-four100, static/inventory gates pass.512 prior tests byte-identical,2 canonical history prefixes preserved. Next full257 then verified repairs and goal pause."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T10:16:33.044Z"
  updated_by: "EVALUATOR"
  note: "Explicitly non-independent same-agent evaluation: workbench presentation follows original current view/store identity and exact borrowed versus local lifetime.216 unique related cases including6 fresh pass in one upstream-absent profile; source-bound changed/app all-four100 and static/inventory gates pass."
  evaluated_sha: "98276be56d86e8ed2905c5054a6a44fef0340e3d"
  blueprint_digest: "2e7bd6cfb09ea9f65b1212e8588b953f18d827f923368cef3c6d8bb9cdfe3784"
  evidence_refs:
    - ".agentplane/tasks/202610091006-3581D2/README.md"
    - ".agentplane/tasks/202610091006-3581D2/quality/20261009-101633044-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610091006-3581D2/quality/20261009-101633044-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610091006-3581D2/quality/20261009-101633044-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610091006-3581D2/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610091006-3581D2/evidence/coverage.json"
    - ".agentplane/tasks/202610091006-3581D2/evidence/checks.json"
  findings:
    - "Actual mounted supplied/local view changes retain current native renderer root, text and original cell notifier updates. Owned stores close on replacement/unmount; borrowed stores remain live. Two canonical full historical field/status/default/classification/evidence prefixes retained;512 prior test files byte-identical. Native projection/observer/core and protected I/O/recovery/settings behavior unchanged."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Rebind workbench presentation to its current original native view/store owner, keeping exact borrowed/owned lifetime and registered deviations."
events:
  -
    type: "status"
    at: "2026-10-09T10:07:25.914Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Rebind workbench presentation to its current original native view/store owner, keeping exact borrowed/owned lifetime and registered deviations."
  -
    type: "verify"
    at: "2026-10-09T10:15:52.537Z"
    author: "CODER"
    state: "ok"
    note: "216 unique related cases including6 fresh pass in one upstream-absent profile;0fail0skip0passing replay. Current original view/store ownership and borrowed/local cleanup verified; source-bound changed/app all-four100, static/inventory gates pass.512 prior tests byte-identical,2 canonical history prefixes preserved. Next full257 then verified repairs and goal pause."
doc_version: 3
doc_updated_at: "2026-10-09T10:15:52.595Z"
doc_updated_by: "CODER"
description: "Iteration254 under C9TN6M: fix stale useState-captured presentation store when native SwView or injected viewStore changes. Recompute the current store and retain exact borrowed/owned cleanup without model, layout or I/O/recovery/settings changes."
sections:
  Summary: "Keep actual workbench presentation and native edit/layout commands bound to the same current view owner."
  Scope: "Writer only: apps/office/src/sw/browser/presentation/writer-view.tsx; new native-workbench-view-owner.test.tsx in the same directory; two canonical runtime/provenance writer-view.tsx records, bounded leaf evidence and exact parent C9TN6M Findings append. No projection/core ownership port, prior acceptance migration, network/dependency/setup or registered I/O/recovery/settings changes."
  Plan: "Derive the current presentation store with useMemo over original view and optional injected store identity instead of capturing it once in useState. Preserve component-owned cleanup and never close a borrowed session store. Use current store for actual native notifier/bindings snapshots and renderer; no extra intermediate projection or generation adapter. Add real workbench view-change tests with supplied and local stores, subsequent original native model and format updates, owned/borrowed transitions and unmount cleanup. No prior acceptance changes. Update two canonical writer-view.tsx runtime/provenance records retaining every historical prefix/status/default/classification. Run new/related tests physically upstream-absent once with reportOnFailure; all-four100 current-source coverage via actual counters plus253 whole unchanged modules or complete unchanged declaration/body/enclosing branch/location proofs. Subsequent closures failed/new/unexecuted only. Scoped static build/type/format/lint/dependencies/docs/size upstream-absent finally restore clean pin; registry/provenance/tree/routing/doctor, bounded English counts/hashes, non-independent same-agent evaluator, scoped semantic commit/finish and append-only parent Findings. Last full247,next257; after full257 repair and verify all discovered failures then pause goal."
  Verify Steps: "1. Pinned native view.cxx view-shell ownership and original SwView/SwEditWin/WriterViewStore contracts: actual mounted workbench shows second original view text after owner/store changes; subsequent edits and native format notifications track only current owner. Original renderer root and current view identity preserved. Owned stores close exactly once on replacement/unmount; borrowed stores remain live and usable; transitions both directions preserve native model/state/history. 2. New and related actual workbench/editor/projection/native-format/session/layout/menu/dialog tests physically upstream-absent with reportOnFailure. Require changed/app all-four100, prior253 only whole byte-identical source/maps or complete unchanged declarations/signatures/bodies/enclosing branches/all exact locations; no counter sanitization/threshold weakening and only failed/new/unexecuted closures. No full254. 3. Scoped Prettier/ESLint/type/dependency/docs/size/static build upstream-absent finally restore clean exact pin; canonical full history-prefix proof, registry4views/Writer/global/provenance/tree/routing/doctor; all512 prior test files byte-identical. 4. Bounded English counts/hashes, non-independent same-agent evaluator, scoped semantic commit/finish/clean Writer checkout and exact parent append. Last full247,next257; after next full repair/verify all failures then pause goal. Broad native root/page/body/follows/layout lifetime and overall parity remain unverified."
  Verification: |-
    Command: one upstream-absent reportOnFailure targeted Vitest profile over26files; strict source-bound certificate; scoped Prettier/ESLint; npm run typecheck/check:dependencies/check:docs/check:file-size/test:static; inventory:registry:build/inventory:parity:writer/inventory:registry:check/check:source-provenance/check:source-tree; routing; doctor. Result:216 unique cases including6 fresh actual native workbench owner/lifetime cases PASS,0 fail0 skip0 passing replay. Original supplied/local stores follow current SwView, native subsequent content/cell format notifications and shared layout; owned/borrowed transitions preserve document/history and close exactly component-owned stores. Source-bound changed1/app318 all-four100 binds actual changed owner-selection counters,317 whole byte-identical modules and81 complete unchanged declaration/body/enclosing condition/all exact location proofs from253. No changed outer body transfer/counter sanitization; raw partial V8 threshold exit retained. Evidence: bounded evidence/coverage.json and checks.json; raw/helpers ignored outside AgentPlane. Scope: writer-view.tsx store owner selection only; all512 prior tests byte-identical, two canonical history/status/default/classification/evidence prefixes preserved without promotion. Static/tests physically upstream-absent; restored exact clean pin. Registry4views,provenance321(230mapped74browser17infra),tree114+33retired,routing pass,doctor0errors2historicalwarnings. Same-agent evaluator non-independent. Render-time local store construction/native root/page/body/follows/lifetime/overall parity remain unverified. No full254; next full257 then repair/verify failures and pause goal.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T10:15:52.537Z — VERIFY — ok

    By: CODER

    Note: 216 unique related cases including6 fresh pass in one upstream-absent profile;0fail0skip0passing replay. Current original view/store ownership and borrowed/local cleanup verified; source-bound changed/app all-four100, static/inventory gates pass.512 prior tests byte-identical,2 canonical history prefixes preserved. Next full257 then verified repairs and goal pause.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T10:15:06.351Z, excerpt_hash=sha256:1cc0b39750f87c68e48aec0bc774d7756bbe3822e5af0a8816dd66a9515a5c18

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610091006-3581D2/blueprint/resolved-snapshot.json
    - old_digest: 2e7bd6cfb09ea9f65b1212e8588b953f18d827f923368cef3c6d8bb9cdfe3784
    - current_digest: 2e7bd6cfb09ea9f65b1212e8588b953f18d827f923368cef3c6d8bb9cdfe3784
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091006-3581D2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610091006-3581D2
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Normal scoped revert only if requested; no reset, merge, upstream mutation or dependency setup."
  Findings: "Iteration253 actual workbench owner-change case produced first-owner text with second-owner view props. Source confirms useState captures viewStore or locally constructed WriterViewStore once, while current native commands/edit-window/layout read new view props; cleanup conditions can then target the wrong ownership. Fix this owner selection, keeping all native projection/notifier implementation unchanged. Render-time local store construction and complete root/page/body/follows lifetime are separate remaining architecture work; no whole-parity promotion."
id_source: "generated"
---
## Summary

Keep actual workbench presentation and native edit/layout commands bound to the same current view owner.

## Scope

Writer only: apps/office/src/sw/browser/presentation/writer-view.tsx; new native-workbench-view-owner.test.tsx in the same directory; two canonical runtime/provenance writer-view.tsx records, bounded leaf evidence and exact parent C9TN6M Findings append. No projection/core ownership port, prior acceptance migration, network/dependency/setup or registered I/O/recovery/settings changes.

## Plan

Derive the current presentation store with useMemo over original view and optional injected store identity instead of capturing it once in useState. Preserve component-owned cleanup and never close a borrowed session store. Use current store for actual native notifier/bindings snapshots and renderer; no extra intermediate projection or generation adapter. Add real workbench view-change tests with supplied and local stores, subsequent original native model and format updates, owned/borrowed transitions and unmount cleanup. No prior acceptance changes. Update two canonical writer-view.tsx runtime/provenance records retaining every historical prefix/status/default/classification. Run new/related tests physically upstream-absent once with reportOnFailure; all-four100 current-source coverage via actual counters plus253 whole unchanged modules or complete unchanged declaration/body/enclosing branch/location proofs. Subsequent closures failed/new/unexecuted only. Scoped static build/type/format/lint/dependencies/docs/size upstream-absent finally restore clean pin; registry/provenance/tree/routing/doctor, bounded English counts/hashes, non-independent same-agent evaluator, scoped semantic commit/finish and append-only parent Findings. Last full247,next257; after full257 repair and verify all discovered failures then pause goal.

## Verify Steps

1. Pinned native view.cxx view-shell ownership and original SwView/SwEditWin/WriterViewStore contracts: actual mounted workbench shows second original view text after owner/store changes; subsequent edits and native format notifications track only current owner. Original renderer root and current view identity preserved. Owned stores close exactly once on replacement/unmount; borrowed stores remain live and usable; transitions both directions preserve native model/state/history. 2. New and related actual workbench/editor/projection/native-format/session/layout/menu/dialog tests physically upstream-absent with reportOnFailure. Require changed/app all-four100, prior253 only whole byte-identical source/maps or complete unchanged declarations/signatures/bodies/enclosing branches/all exact locations; no counter sanitization/threshold weakening and only failed/new/unexecuted closures. No full254. 3. Scoped Prettier/ESLint/type/dependency/docs/size/static build upstream-absent finally restore clean exact pin; canonical full history-prefix proof, registry4views/Writer/global/provenance/tree/routing/doctor; all512 prior test files byte-identical. 4. Bounded English counts/hashes, non-independent same-agent evaluator, scoped semantic commit/finish/clean Writer checkout and exact parent append. Last full247,next257; after next full repair/verify all failures then pause goal. Broad native root/page/body/follows/layout lifetime and overall parity remain unverified.

## Verification

Command: one upstream-absent reportOnFailure targeted Vitest profile over26files; strict source-bound certificate; scoped Prettier/ESLint; npm run typecheck/check:dependencies/check:docs/check:file-size/test:static; inventory:registry:build/inventory:parity:writer/inventory:registry:check/check:source-provenance/check:source-tree; routing; doctor. Result:216 unique cases including6 fresh actual native workbench owner/lifetime cases PASS,0 fail0 skip0 passing replay. Original supplied/local stores follow current SwView, native subsequent content/cell format notifications and shared layout; owned/borrowed transitions preserve document/history and close exactly component-owned stores. Source-bound changed1/app318 all-four100 binds actual changed owner-selection counters,317 whole byte-identical modules and81 complete unchanged declaration/body/enclosing condition/all exact location proofs from253. No changed outer body transfer/counter sanitization; raw partial V8 threshold exit retained. Evidence: bounded evidence/coverage.json and checks.json; raw/helpers ignored outside AgentPlane. Scope: writer-view.tsx store owner selection only; all512 prior tests byte-identical, two canonical history/status/default/classification/evidence prefixes preserved without promotion. Static/tests physically upstream-absent; restored exact clean pin. Registry4views,provenance321(230mapped74browser17infra),tree114+33retired,routing pass,doctor0errors2historicalwarnings. Same-agent evaluator non-independent. Render-time local store construction/native root/page/body/follows/lifetime/overall parity remain unverified. No full254; next full257 then repair/verify failures and pause goal.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T10:15:52.537Z — VERIFY — ok

By: CODER

Note: 216 unique related cases including6 fresh pass in one upstream-absent profile;0fail0skip0passing replay. Current original view/store ownership and borrowed/local cleanup verified; source-bound changed/app all-four100, static/inventory gates pass.512 prior tests byte-identical,2 canonical history prefixes preserved. Next full257 then verified repairs and goal pause.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T10:15:06.351Z, excerpt_hash=sha256:1cc0b39750f87c68e48aec0bc774d7756bbe3822e5af0a8816dd66a9515a5c18

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610091006-3581D2/blueprint/resolved-snapshot.json
- old_digest: 2e7bd6cfb09ea9f65b1212e8588b953f18d827f923368cef3c6d8bb9cdfe3784
- current_digest: 2e7bd6cfb09ea9f65b1212e8588b953f18d827f923368cef3c6d8bb9cdfe3784
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091006-3581D2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610091006-3581D2
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Normal scoped revert only if requested; no reset, merge, upstream mutation or dependency setup.

## Findings

Iteration253 actual workbench owner-change case produced first-owner text with second-owner view props. Source confirms useState captures viewStore or locally constructed WriterViewStore once, while current native commands/edit-window/layout read new view props; cleanup conditions can then target the wrong ownership. Fix this owner selection, keeping all native projection/notifier implementation unchanged. Render-time local store construction and complete root/page/body/follows lifetime are separate remaining architecture work; no whole-parity promotion.
