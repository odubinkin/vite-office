---
id: "202610181650-4XSBZ5"
title: "Implement Calc per-sheet cursor and selection view owner"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:coverage:calc"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T16:50:39.264Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T16:55:37.713Z"
  updated_by: "CODER"
  note: "PASS: Calc91files/242tests;5573statements,3603branches,1116functions,4989lines all100percent. Final source typecheck,ESLint,Prettier,docs,dependency boundaries,source-tree,source-provenance,Calc parity,file-size,doctor and routing pass. Related ScMarkData and document/formula tests included in Calc gate. Evidence under task/evidence. Full all-app run deferred per user cadence (UI task3/10)."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement document-bound per-sheet cursor and selection view ownership from pinned viewdata source, preserving native defaults and separation from cell storage."
events:
  -
    type: "status"
    at: "2026-10-18T16:50:52.554Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement document-bound per-sheet cursor and selection view ownership from pinned viewdata source, preserving native defaults and separation from cell storage."
  -
    type: "verify"
    at: "2026-10-18T16:55:37.713Z"
    author: "CODER"
    state: "ok"
    note: "PASS: Calc91files/242tests;5573statements,3603branches,1116functions,4989lines all100percent. Final source typecheck,ESLint,Prettier,docs,dependency boundaries,source-tree,source-provenance,Calc parity,file-size,doctor and routing pass. Related ScMarkData and document/formula tests included in Calc gate. Evidence under task/evidence. Full all-app run deferred per user cadence (UI task3/10)."
doc_version: 3
doc_updated_at: "2026-10-18T16:55:37.767Z"
doc_updated_by: "CODER"
description: "Approved Calc UI plan: add source-shaped ScViewData and ScViewDataTable cursor ownership using actual ScDocument and existing ScMarkData. Preserve native initial tab/cursor/old-cursor/active-pane defaults, lazy per-tab state, table selection independence and sentinel behavior. This directly feeds the following editable grid task; no geometry, sheet-view service, formatter facade or alternate cell model. Source and original header locations under sc/source/ui. UI cycle task3/10; verify Calc100 percent plus focused model tests."
sections:
  Summary: |-
    Implement Calc per-sheet cursor and selection view owner

    Approved Calc UI plan: add source-shaped ScViewData and ScViewDataTable cursor ownership using actual ScDocument and existing ScMarkData. Preserve native initial tab/cursor/old-cursor/active-pane defaults, lazy per-tab state, table selection independence and sentinel behavior. This directly feeds the following editable grid task; no geometry, sheet-view service, formatter facade or alternate cell model. Source and original header locations under sc/source/ui. UI cycle task3/10; verify Calc100 percent plus focused model tests.
  Scope: |-
    - In scope: Approved Calc UI plan: add source-shaped ScViewData and ScViewDataTable cursor ownership using actual ScDocument and existing ScMarkData. Preserve native initial tab/cursor/old-cursor/active-pane defaults, lazy per-tab state, table selection independence and sentinel behavior. This directly feeds the following editable grid task; no geometry, sheet-view service, formatter facade or alternate cell model. Source and original header locations under sc/source/ui. UI cycle task3/10; verify Calc100 percent plus focused model tests.
    - Out of scope: unrelated refactors not required for "Implement Calc per-sheet cursor and selection view owner".
  Plan: "Implement document-bound ScViewData cursor subset with native per-sheet ScViewDataTable fields, lazy valid-tab data creation, direct cursor setters, old-cursor fallback/reset, active-pane enum/default, native absent-tab sentinels and unchanged ScMarkData identity. Header reexports from source implementation as existing Calc conventions. Do not emulate geometry or hidden/sheet-view services. Add direct tests proving data isolation and selection independence over real document/sheets. Scope source/header/test and their5registry records. Approved full Calc plan; task3/10."
  Verify Steps: "1. npm run test:coverage:calc with all Calc tests and100percent statements/branches/functions/lines. Assert actual document and ScMarkData identity, initial sheet0/cursor0, per-sheet state retained across switching, selection unchanged by SetTabNo, old-cursor fallback/reset, missing-table sentinels and valid-domain guard. 2. npm run typecheck --workspace @vite-office/office; touched ESLint/Prettier. 3. Dependency,docs,source-tree/provenance,Calc parity,file-size gates. 4. Compare cursor/selection methods with pinned viewdata.hxx/viewdata.cxx. Full all-app regression deferred until task10 as approved."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T16:55:37.713Z — VERIFY — ok

    By: CODER

    Note: PASS: Calc91files/242tests;5573statements,3603branches,1116functions,4989lines all100percent. Final source typecheck,ESLint,Prettier,docs,dependency boundaries,source-tree,source-provenance,Calc parity,file-size,doctor and routing pass. Related ScMarkData and document/formula tests included in Calc gate. Evidence under task/evidence. Full all-app run deferred per user cadence (UI task3/10).
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T16:55:37.196Z, excerpt_hash=sha256:296ea10a7d5f1840e1298b5f6899fef1495f789717af2e44e77b674b64771926

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181650-4XSBZ5/blueprint/resolved-snapshot.json
    - old_digest: 2dc15f43619e61a152ccafec953a3e435a5f7d14f514640e040f894866c1159f
    - current_digest: 2dc15f43619e61a152ccafec953a3e435a5f7d14f514640e040f894866c1159f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181650-4XSBZ5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610181650-4XSBZ5 -m 🧩 4XSBZ5 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Source cursor/selection subset only: real ScDocument and ScMarkData identities; initial tab0,cursor0,old validityfalse and bottom-left pane; sparse lazy per-tab data; direct cursor setter preconditions; old-cursor fallback/reset; absent-tab-1sentinels; SetTabNo does not select marks. Native geometric/window/sheet-view services are not fabricated or claimed. ScSplitPos uses typed const-object values to preserve the source duplicate MAX_ENUM alias while satisfying both enum lint rules without suppression. Registry native test anchor is jumbosheets GetCurX assertion; this is a caller reference,not an executed native suite. Local direct tests execute the ownership/transition contracts. Initial enum lint and registry marker/nonempty-evidence errors repaired from actual declarations. No implementation file exceeds500lines. All Calc91files/242tests and100percent coverage pass on final const-object source; static gates pass. UI regression cycle task3/10. Next is document-shell/typed edit command ownership and browser grid integration; do not expand unrelated kernel families. No network,no merges,no other checkout changes."
id_source: "generated"
---
## Summary

Implement Calc per-sheet cursor and selection view owner

Approved Calc UI plan: add source-shaped ScViewData and ScViewDataTable cursor ownership using actual ScDocument and existing ScMarkData. Preserve native initial tab/cursor/old-cursor/active-pane defaults, lazy per-tab state, table selection independence and sentinel behavior. This directly feeds the following editable grid task; no geometry, sheet-view service, formatter facade or alternate cell model. Source and original header locations under sc/source/ui. UI cycle task3/10; verify Calc100 percent plus focused model tests.

## Scope

- In scope: Approved Calc UI plan: add source-shaped ScViewData and ScViewDataTable cursor ownership using actual ScDocument and existing ScMarkData. Preserve native initial tab/cursor/old-cursor/active-pane defaults, lazy per-tab state, table selection independence and sentinel behavior. This directly feeds the following editable grid task; no geometry, sheet-view service, formatter facade or alternate cell model. Source and original header locations under sc/source/ui. UI cycle task3/10; verify Calc100 percent plus focused model tests.
- Out of scope: unrelated refactors not required for "Implement Calc per-sheet cursor and selection view owner".

## Plan

Implement document-bound ScViewData cursor subset with native per-sheet ScViewDataTable fields, lazy valid-tab data creation, direct cursor setters, old-cursor fallback/reset, active-pane enum/default, native absent-tab sentinels and unchanged ScMarkData identity. Header reexports from source implementation as existing Calc conventions. Do not emulate geometry or hidden/sheet-view services. Add direct tests proving data isolation and selection independence over real document/sheets. Scope source/header/test and their5registry records. Approved full Calc plan; task3/10.

## Verify Steps

1. npm run test:coverage:calc with all Calc tests and100percent statements/branches/functions/lines. Assert actual document and ScMarkData identity, initial sheet0/cursor0, per-sheet state retained across switching, selection unchanged by SetTabNo, old-cursor fallback/reset, missing-table sentinels and valid-domain guard. 2. npm run typecheck --workspace @vite-office/office; touched ESLint/Prettier. 3. Dependency,docs,source-tree/provenance,Calc parity,file-size gates. 4. Compare cursor/selection methods with pinned viewdata.hxx/viewdata.cxx. Full all-app regression deferred until task10 as approved.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T16:55:37.713Z — VERIFY — ok

By: CODER

Note: PASS: Calc91files/242tests;5573statements,3603branches,1116functions,4989lines all100percent. Final source typecheck,ESLint,Prettier,docs,dependency boundaries,source-tree,source-provenance,Calc parity,file-size,doctor and routing pass. Related ScMarkData and document/formula tests included in Calc gate. Evidence under task/evidence. Full all-app run deferred per user cadence (UI task3/10).
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T16:55:37.196Z, excerpt_hash=sha256:296ea10a7d5f1840e1298b5f6899fef1495f789717af2e44e77b674b64771926

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181650-4XSBZ5/blueprint/resolved-snapshot.json
- old_digest: 2dc15f43619e61a152ccafec953a3e435a5f7d14f514640e040f894866c1159f
- current_digest: 2dc15f43619e61a152ccafec953a3e435a5f7d14f514640e040f894866c1159f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181650-4XSBZ5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610181650-4XSBZ5 -m 🧩 4XSBZ5 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Source cursor/selection subset only: real ScDocument and ScMarkData identities; initial tab0,cursor0,old validityfalse and bottom-left pane; sparse lazy per-tab data; direct cursor setter preconditions; old-cursor fallback/reset; absent-tab-1sentinels; SetTabNo does not select marks. Native geometric/window/sheet-view services are not fabricated or claimed. ScSplitPos uses typed const-object values to preserve the source duplicate MAX_ENUM alias while satisfying both enum lint rules without suppression. Registry native test anchor is jumbosheets GetCurX assertion; this is a caller reference,not an executed native suite. Local direct tests execute the ownership/transition contracts. Initial enum lint and registry marker/nonempty-evidence errors repaired from actual declarations. No implementation file exceeds500lines. All Calc91files/242tests and100percent coverage pass on final const-object source; static gates pass. UI regression cycle task3/10. Next is document-shell/typed edit command ownership and browser grid integration; do not expand unrelated kernel families. No network,no merges,no other checkout changes.
