---
id: "202610181658-SGE6BG"
title: "Implement Calc grid input-line and sheet-tab browser presenters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
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
  updated_at: "2026-10-18T16:59:20.393Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T17:17:43.432Z"
  updated_by: "CODER"
  note: "PASS Calc92files245tests,100percent statements/branches/functions/lines on final code. Related Writer style-selector and shared toolbar+style tests11pass;new sharedstyle100percent. Actual browser fixture448cells,canonical D2=13.5 and shared32px/6pxcontrols. Typecheck,ESLint,Prettier,docs,dependencies,source-tree/provenance,Calc parity,file-size,doctor,routing pass. UI task4/10;full suite deferred per user. Production integration remains next work."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T17:17:59.807Z"
  updated_by: "EVALUATOR"
  note: "Controlled Calc presenters preserve canonical model/view ownership and use shared Writer visual controls."
  evaluated_sha: "33273ac1cee94c69c104c43d2ffed2adf8895952"
  blueprint_digest: "b5dcd3def46b7c9eca837e02f0f78b1d1674a1432e171496f2d95a6e43a98564"
  evidence_refs:
    - ".agentplane/tasks/202610181658-SGE6BG/README.md"
    - ".agentplane/tasks/202610181658-SGE6BG/quality/20261018-171759807-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610181658-SGE6BG/quality/20261018-171759807-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610181658-SGE6BG/quality/20261018-171759807-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610181658-SGE6BG/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610181658-SGE6BG/evidence/calc-coverage.log"
    - ".agentplane/tasks/202610181658-SGE6BG/evidence/related-ui.log"
    - ".agentplane/tasks/202610181658-SGE6BG/evidence/browser-review.json"
    - ".agentplane/tasks/202610181658-SGE6BG/evidence/parity.log"
    - "33273ac1cee9"
  findings:
    - "Reviewed ScGridWindow,ScInputWindow and ScTabControl against native composition and final Calc100percent evidence. Actual document and marks supply state;input/navigation remain controller-owned. Inline editor retains caret gestures and logical rows are distinct from physical browser scroll extent. Writer toolbar class string is preserved exactly in shared source;11related UI tests pass. Production app registration and command/workflow integration are explicitly not claimed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Build controlled Calc grid,input-line and sheet-tab React presenters against real ScViewData, forwarding commands to their owning controller without a second cell or edit model."
events:
  -
    type: "status"
    at: "2026-10-18T16:59:43.411Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Build controlled Calc grid,input-line and sheet-tab React presenters against real ScViewData, forwarding commands to their owning controller without a second cell or edit model."
  -
    type: "verify"
    at: "2026-10-18T17:17:43.432Z"
    author: "CODER"
    state: "ok"
    note: "PASS Calc92files245tests,100percent statements/branches/functions/lines on final code. Related Writer style-selector and shared toolbar+style tests11pass;new sharedstyle100percent. Actual browser fixture448cells,canonical D2=13.5 and shared32px/6pxcontrols. Typecheck,ESLint,Prettier,docs,dependencies,source-tree/provenance,Calc parity,file-size,doctor,routing pass. UI task4/10;full suite deferred per user. Production integration remains next work."
doc_version: 3
doc_updated_at: "2026-10-18T17:17:43.482Z"
doc_updated_by: "CODER"
description: "Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle."
sections:
  Summary: |-
    Implement Calc grid input-line and sheet-tab browser presenters

    Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle.
  Scope: |-
    - In scope: Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle.
    - Out of scope: unrelated refactors not required for "Implement Calc grid input-line and sheet-tab browser presenters".
  Plan: "Implement three controlled production React presenters under sc/browser/presentation: ScGridWindow,ScInputWindow,ScTabControl, with colocated integration tests. Grid uses supplied display projection and actual ScViewData cursor/ScMarkData, bounded virtual viewport, logical ARIA indices,headers,pointer/keyboard intents and inline controlled edit. Input line preserves native position/function/sum/equals versus accept/cancel composition. Tabs preserve sheet names/current/selected state and forward add/select intents. No local cell/selection/draft model. Controllers own navigation,entry,formatting and file operations; next task connects those existing core operations and production composition. Register6runtime/provenance records and1capability; no new kernel dependencies. Scope11non-task files. Approved UI plan/task4of10."
  Verify Steps: "1. npm run test:coverage:calc with100percent on all Calc sources. Test actual ScDocument/ScViewData selections and bounded viewport projection,all input events,keyboard intents,editing,IME pass-through,header intents,sheet control selection,disabled controls and native input mode switching. 2. npm run typecheck --workspace @vite-office/office, touched ESLint/Prettier. 3. check:dependencies,check:docs,check:file-size,check:source-tree,check:source-provenance,inventory:parity:calc. 4. Review against pinned gridwin.cxx,inputwin.cxx,tabcont.cxx composition. Full regression deferred per approved10task cadence; task4/10. Production registration/file workflows remain explicit following work,not claimed by presenter completion."
  Verification: |-
    Command: npm run test:coverage:calc. Result: pass. Evidence: evidence/calc-coverage.log;92files/245tests;5634statements,3635branches,1145functions,5045lines all100percent. Scope: all Calc including final presenters and existing core. Command: focused Calc/Writer style selector/shared CommandToolbar with coverage.include=office-control-styles.ts. Result: pass. Evidence: evidence/related-ui.log;11tests;shared style2statements/2lines100percent. Scope: unchanged Writer button style extraction and shared control source. Command: typecheck,touched ESLint/Prettier,check:docs,check:dependencies,check:source-tree,check:source-provenance,inventory:parity:calc,check:file-size,ap doctor,policy routing. Result: pass;existing doctor shim warning remains. Scope: touched source/registry and repository architecture gates. Browser fixture:448actual projected cells,D2=13.5,actual sheet names,32pxcontrols/6pxradius,shared indigo focus palette,physical scroll extent1000000. Evidence: evidence/browser-review.json. Scope: actual browser rendering/layout checks only;no screenshot or visual-fidelity attestation. Full all-app regression deferred per explicit user once-per10task cadence;UI task4/10.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T17:17:43.432Z — VERIFY — ok

    By: CODER

    Note: PASS Calc92files245tests,100percent statements/branches/functions/lines on final code. Related Writer style-selector and shared toolbar+style tests11pass;new sharedstyle100percent. Actual browser fixture448cells,canonical D2=13.5 and shared32px/6pxcontrols. Typecheck,ESLint,Prettier,docs,dependencies,source-tree/provenance,Calc parity,file-size,doctor,routing pass. UI task4/10;full suite deferred per user. Production integration remains next work.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T17:17:42.937Z, excerpt_hash=sha256:51e8914b7a4725be0a471f9a838c7832d6d2dc5fa986c9f0f44e06ad41e37ca3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181658-SGE6BG/blueprint/resolved-snapshot.json
    - old_digest: b5dcd3def46b7c9eca837e02f0f78b1d1674a1432e171496f2d95a6e43a98564
    - current_digest: b5dcd3def46b7c9eca837e02f0f78b1d1674a1432e171496f2d95a6e43a98564
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181658-SGE6BG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610181658-SGE6BG -m 🧩 SGE6BG task: persist canonical task artifacts --allow-tasks
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
  Findings: |-
    User steering: retain the same Writer stack and visual style. Extract exact existing Writer formatting button classes into framework/browser/presentation/office-control-styles.ts and consume from Writer plus Calc. Calc uses existing global font/Tailwind source,slate/indigo palette,rounded controls,shared sizing/focus/disabled states. No separate UI theme. Additional scope4files: shared style owner,its2records and existing Writer toolbar consumer;within original+5file scope allowance. Browser review fixture is task-local and journals intents only;it is not production registration or fake document-command implementation. Presenter scope remains3controlled components;editing/navigation/formatter semantics stay controller-owned for next integration task. Local browser preview shows448actual projected cells,canonical selectedD2 result13.5 and real sheet names. Screenshot connector cannot save into calc checkout because its allowed root is vite-office;no screenshot was written outside calc. DOM layout checks are retained separately and visual parity is not claimed.

    - Observation: During UI verification,raw full-sheet CSS height was clamped by Chromium to16777214pixels;inline input pointer events also bubbled into grid focus. Initial metadata used an unsupported aspect and insufficient provenance rationale.
      Impact: Naive full-domain pixel extent would make final rows inaccessible,while clicking the inline editor could steal caret focus. Registry validation rejected metadata before closure.
      Resolution: Viewport contract now separates native logical row indices from controller-supplied physical scroll offset/extent. Final-row rendering is tested without huge CSS offsets. Inline editor pointer/double-click gestures remain with editor. Metadata uses browser-input and explicit browser-only source rationale. Final Calc coverage100percent;shared Writer styling verified. Task scope is controlled presenters,not production Calc registration or completed UI.
id_source: "generated"
---
## Summary

Implement Calc grid input-line and sheet-tab browser presenters

Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle.

## Scope

- In scope: Approved UI-first continuation on calc only. Implement real controlled React presenters corresponding to ScGridWindow,ScInputWindow and ScTabControl: sparse canonical cell rendering and headers,active/marked cell accessibility,keyboard/pointer intents,formula/name inputs,accept/cancel/function controls,and sheet-tab selection/add controls. Inputs are projections from existing ScDocument/ScViewData; transient edit state and commands remain controller-owned. No second cell model,no placeholder editing semantics,no new formatter/kernel service. Deliver tested presenters first,then connect production shell/commands and shared menus/file adapters in following tasks. Bound to3presenters,shared presentation types,their tests,and runtime/provenance/capability records. Task4/10 of UI regression cycle.
- Out of scope: unrelated refactors not required for "Implement Calc grid input-line and sheet-tab browser presenters".

## Plan

Implement three controlled production React presenters under sc/browser/presentation: ScGridWindow,ScInputWindow,ScTabControl, with colocated integration tests. Grid uses supplied display projection and actual ScViewData cursor/ScMarkData, bounded virtual viewport, logical ARIA indices,headers,pointer/keyboard intents and inline controlled edit. Input line preserves native position/function/sum/equals versus accept/cancel composition. Tabs preserve sheet names/current/selected state and forward add/select intents. No local cell/selection/draft model. Controllers own navigation,entry,formatting and file operations; next task connects those existing core operations and production composition. Register6runtime/provenance records and1capability; no new kernel dependencies. Scope11non-task files. Approved UI plan/task4of10.

## Verify Steps

1. npm run test:coverage:calc with100percent on all Calc sources. Test actual ScDocument/ScViewData selections and bounded viewport projection,all input events,keyboard intents,editing,IME pass-through,header intents,sheet control selection,disabled controls and native input mode switching. 2. npm run typecheck --workspace @vite-office/office, touched ESLint/Prettier. 3. check:dependencies,check:docs,check:file-size,check:source-tree,check:source-provenance,inventory:parity:calc. 4. Review against pinned gridwin.cxx,inputwin.cxx,tabcont.cxx composition. Full regression deferred per approved10task cadence; task4/10. Production registration/file workflows remain explicit following work,not claimed by presenter completion.

## Verification

Command: npm run test:coverage:calc. Result: pass. Evidence: evidence/calc-coverage.log;92files/245tests;5634statements,3635branches,1145functions,5045lines all100percent. Scope: all Calc including final presenters and existing core. Command: focused Calc/Writer style selector/shared CommandToolbar with coverage.include=office-control-styles.ts. Result: pass. Evidence: evidence/related-ui.log;11tests;shared style2statements/2lines100percent. Scope: unchanged Writer button style extraction and shared control source. Command: typecheck,touched ESLint/Prettier,check:docs,check:dependencies,check:source-tree,check:source-provenance,inventory:parity:calc,check:file-size,ap doctor,policy routing. Result: pass;existing doctor shim warning remains. Scope: touched source/registry and repository architecture gates. Browser fixture:448actual projected cells,D2=13.5,actual sheet names,32pxcontrols/6pxradius,shared indigo focus palette,physical scroll extent1000000. Evidence: evidence/browser-review.json. Scope: actual browser rendering/layout checks only;no screenshot or visual-fidelity attestation. Full all-app regression deferred per explicit user once-per10task cadence;UI task4/10.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T17:17:43.432Z — VERIFY — ok

By: CODER

Note: PASS Calc92files245tests,100percent statements/branches/functions/lines on final code. Related Writer style-selector and shared toolbar+style tests11pass;new sharedstyle100percent. Actual browser fixture448cells,canonical D2=13.5 and shared32px/6pxcontrols. Typecheck,ESLint,Prettier,docs,dependencies,source-tree/provenance,Calc parity,file-size,doctor,routing pass. UI task4/10;full suite deferred per user. Production integration remains next work.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T17:17:42.937Z, excerpt_hash=sha256:51e8914b7a4725be0a471f9a838c7832d6d2dc5fa986c9f0f44e06ad41e37ca3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181658-SGE6BG/blueprint/resolved-snapshot.json
- old_digest: b5dcd3def46b7c9eca837e02f0f78b1d1674a1432e171496f2d95a6e43a98564
- current_digest: b5dcd3def46b7c9eca837e02f0f78b1d1674a1432e171496f2d95a6e43a98564
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181658-SGE6BG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610181658-SGE6BG -m 🧩 SGE6BG task: persist canonical task artifacts --allow-tasks
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

User steering: retain the same Writer stack and visual style. Extract exact existing Writer formatting button classes into framework/browser/presentation/office-control-styles.ts and consume from Writer plus Calc. Calc uses existing global font/Tailwind source,slate/indigo palette,rounded controls,shared sizing/focus/disabled states. No separate UI theme. Additional scope4files: shared style owner,its2records and existing Writer toolbar consumer;within original+5file scope allowance. Browser review fixture is task-local and journals intents only;it is not production registration or fake document-command implementation. Presenter scope remains3controlled components;editing/navigation/formatter semantics stay controller-owned for next integration task. Local browser preview shows448actual projected cells,canonical selectedD2 result13.5 and real sheet names. Screenshot connector cannot save into calc checkout because its allowed root is vite-office;no screenshot was written outside calc. DOM layout checks are retained separately and visual parity is not claimed.

- Observation: During UI verification,raw full-sheet CSS height was clamped by Chromium to16777214pixels;inline input pointer events also bubbled into grid focus. Initial metadata used an unsupported aspect and insufficient provenance rationale.
  Impact: Naive full-domain pixel extent would make final rows inaccessible,while clicking the inline editor could steal caret focus. Registry validation rejected metadata before closure.
  Resolution: Viewport contract now separates native logical row indices from controller-supplied physical scroll offset/extent. Final-row rendering is tested without huge CSS offsets. Inline editor pointer/double-click gestures remain with editor. Metadata uses browser-input and explicit browser-only source rationale. Final Calc coverage100percent;shared Writer styling verified. Task scope is controlled presenters,not production Calc registration or completed UI.
