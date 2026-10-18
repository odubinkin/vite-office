---
id: "202610182247-WN0H8T"
title: "Expose native trailing menubar entries through shared overflow popup"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Whole Calc raw100percent S/B/F/L;related shared menubar tests including measured suffix popup and resize lifecycle;built desktop/mobile Writer/Calc overflow reachability and keyboard/axe/pageerrors;types/build/freshness/touchedstyle/dependency/provenance/scopedinventories/doctor/routing. No full run before cadence30."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T22:57:21.803Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T23:05:57.617Z"
  updated_by: "CODER"
  note: "Native hidden menu suffix is reachable through actual shared Writer/Calc popup;whole Calc299 raw100percent,new layout module raw100percent,105shared/menu and23Writer cases pass. Final four desktop/mobile browser scenarios pass whole-page unfilteredaxe/keyboard/resize focus;18other targeted browser cases already passed on final production source. Types/build/static/style/architecture/provenance/scopedinventories/doctor/routing pass. Overall goal active,nextfull30."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T23:06:26.709Z"
  updated_by: "EVALUATOR"
  note: "Shared measured native menubar suffix projection meets approved14path scope with actual Writer/Calc resources and verified mobile reachability/focus/accessibility."
  evaluated_sha: "072afabe1d36955334f709c2323d17ebe25d6083"
  blueprint_digest: "2fbc342590b9a6a650534c7d5b7bf85f5e3cf63a3950c9aedf7c9089bc43c84b"
  evidence_refs:
    - ".agentplane/tasks/202610182247-WN0H8T/README.md"
    - ".agentplane/tasks/202610182247-WN0H8T/quality/20261018-230626709-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610182247-WN0H8T/quality/20261018-230626709-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610182247-WN0H8T/quality/20261018-230626709-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610182247-WN0H8T/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610182247-WN0H8T/verification.md"
    - ".agentplane/tasks/202610182247-WN0H8T/browser-final-verified.log"
    - ".agentplane/tasks/202610182247-WN0H8T/overflow-coverage-summary.json"
    - ".agentplane/tasks/202610182247-WN0H8T/calc-coverage-summary.json"
  findings:
    - "Hidden roots retain original identities and command trees as MenuBarWindow parent-popup construction does. Exact fractional DOM width fixes desktop false overflow;controlled menu geometry/observer teardown is raw100percent covered. No guessed slots or architecture exemptions."
    - "Whole Calc299 cases retain raw100percent S/B/F/L;105shared/menu and23Writer integration cases pass. Final four actual desktop/mobile browser cases pass whole-page unfilteredaxe,mouse/keyboard/resize saved-owner focus.18other final-source browser cases passed before replay;earlier failing test assumptions are retained honestly."
    - "Writer canvas tabindex and status div correct full-page mobile audit findings without changing visual classes. Final build/types/static/style/dependency/provenance/inventory/doctor/routing evidence is present. Intentional source paths remain14."
commit: null
comments:
  -
    author: "CODER"
    body: "Start:implement native hidden-suffix parent popup in shared Writer/Calc menubar,then verify measured boundaries and real browser keyboard reachability."
events:
  -
    type: "status"
    at: "2026-10-18T22:47:34.704Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:implement native hidden-suffix parent popup in shared Writer/Calc menubar,then verify measured boundaries and real browser keyboard reachability."
  -
    type: "verify"
    at: "2026-10-18T23:05:57.617Z"
    author: "CODER"
    state: "ok"
    note: "Native hidden menu suffix is reachable through actual shared Writer/Calc popup;whole Calc299 raw100percent,new layout module raw100percent,105shared/menu and23Writer cases pass. Final four desktop/mobile browser scenarios pass whole-page unfilteredaxe/keyboard/resize focus;18other targeted browser cases already passed on final production source. Types/build/static/style/architecture/provenance/scopedinventories/doctor/routing pass. Overall goal active,nextfull30."
doc_version: 3
doc_updated_at: "2026-10-18T23:05:57.670Z"
doc_updated_by: "CODER"
description: "Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30."
sections:
  Summary: |-
    Expose native trailing menubar entries through shared overflow popup

    Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30.
  Scope: |-
    - In scope: Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30.
    - Out of scope: unrelated refactors not required for "Expose native trailing menubar entries through shared overflow popup".
  Plan: "Approved goal task21:measure native menubar hidden suffix and expose its original roots through shared parent popup;constrain shared Header;keep existing commands,style,focus contracts. Verify wholeCalc raw100percent,affectedshared/Writer tests,newgeometry raw100percent,realbothsuite desktop/mobile mouse/keyboard/resize and whole-page unfilteredaxe/pageerrors plusdeclaredgates. Browser audit identified existing WriterWorkspaceChrome footer role and nonfocusable canvas scroll area;repair semantic element/tabindex with unchanged appearance and actual owner registry records. All changes fit14non-task paths originallybudgeted. No audit exclusions,thresholdchanges,network/merges or coreformat slots. Existing broadusergoalapprovalapplies;nextfull30."
  Verify Steps: "npm run test:coverage:calc must remain raw100percent statements/branches/functions/lines. Run affected shared menubar and header tests and meaningful layout boundary cases (fits,hidden suffix,unmeasured/empty,resize cleanup);new changed module raw100percent using scoped coverage and existing related tests. Built browser at1280x800 and390x600 for bothWriter/Calc:all source top menus reachable,hidden suffix order,mouse/keyboard submenu open/escape/focus and resize;original shared font/toolbar style retained;unfilteredaxe/pageerrors pass. npm run typecheck/build/check:dependencies/check:docs/check:file-size/check:source-tree/check:source-provenance/check:writer-resources/check:calc-resources,touchedPrettier/eslint,shared/Calc scopedinventory,ap doctor and routing. Full task20already passed;next full30."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T23:05:57.617Z — VERIFY — ok

    By: CODER

    Note: Native hidden menu suffix is reachable through actual shared Writer/Calc popup;whole Calc299 raw100percent,new layout module raw100percent,105shared/menu and23Writer cases pass. Final four desktop/mobile browser scenarios pass whole-page unfilteredaxe/keyboard/resize focus;18other targeted browser cases already passed on final production source. Types/build/static/style/architecture/provenance/scopedinventories/doctor/routing pass. Overall goal active,nextfull30.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T23:05:57.116Z, excerpt_hash=sha256:aebc7842a145d995956a006e1dbda33c300bf3e3f9a2a34f1eae01418bcdd2de

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182247-WN0H8T/blueprint/resolved-snapshot.json
    - old_digest: 2fbc342590b9a6a650534c7d5b7bf85f5e3cf63a3950c9aedf7c9089bc43c84b
    - current_digest: 2fbc342590b9a6a650534c7d5b7bf85f5e3cf63a3950c9aedf7c9089bc43c84b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610182247-WN0H8T

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610182247-WN0H8T -m 🧩 WN0H8T task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task21 measured menubar suffix projection and header constraint with associated tests/registry. Preserve task20 formatting controls and all earlier core owners. No branch resets or merges."
  Findings: |-
    # Task21 verification

    Approved scope:14 intentional non-task paths in calc checkout/branch. Native source reference: vcl/source/window/menu.cxx hides the trailing menubar roots and draws its More indicator;vcl/source/window/menubarwindow.cxx MenuBarWindow::ImplCreatePopup borrows the original hidden suffix as child menus. Browser adaptation measures actual DOM label/gap/indicator geometry,keeps original submenu identities and resource arrays,and uses the actual existing shared menu state machine and Sfx command ports. Unknown core formatting remains unavailable;no fake state or new command registrations.
id_source: "generated"
---
## Summary

Expose native trailing menubar entries through shared overflow popup

Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30.

## Scope

- In scope: Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30.
- Out of scope: unrelated refactors not required for "Expose native trailing menubar entries through shared overflow popup".

## Plan

Approved goal task21:measure native menubar hidden suffix and expose its original roots through shared parent popup;constrain shared Header;keep existing commands,style,focus contracts. Verify wholeCalc raw100percent,affectedshared/Writer tests,newgeometry raw100percent,realbothsuite desktop/mobile mouse/keyboard/resize and whole-page unfilteredaxe/pageerrors plusdeclaredgates. Browser audit identified existing WriterWorkspaceChrome footer role and nonfocusable canvas scroll area;repair semantic element/tabindex with unchanged appearance and actual owner registry records. All changes fit14non-task paths originallybudgeted. No audit exclusions,thresholdchanges,network/merges or coreformat slots. Existing broadusergoalapprovalapplies;nextfull30.

## Verify Steps

npm run test:coverage:calc must remain raw100percent statements/branches/functions/lines. Run affected shared menubar and header tests and meaningful layout boundary cases (fits,hidden suffix,unmeasured/empty,resize cleanup);new changed module raw100percent using scoped coverage and existing related tests. Built browser at1280x800 and390x600 for bothWriter/Calc:all source top menus reachable,hidden suffix order,mouse/keyboard submenu open/escape/focus and resize;original shared font/toolbar style retained;unfilteredaxe/pageerrors pass. npm run typecheck/build/check:dependencies/check:docs/check:file-size/check:source-tree/check:source-provenance/check:writer-resources/check:calc-resources,touchedPrettier/eslint,shared/Calc scopedinventory,ap doctor and routing. Full task20already passed;next full30.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T23:05:57.617Z — VERIFY — ok

By: CODER

Note: Native hidden menu suffix is reachable through actual shared Writer/Calc popup;whole Calc299 raw100percent,new layout module raw100percent,105shared/menu and23Writer cases pass. Final four desktop/mobile browser scenarios pass whole-page unfilteredaxe/keyboard/resize focus;18other targeted browser cases already passed on final production source. Types/build/static/style/architecture/provenance/scopedinventories/doctor/routing pass. Overall goal active,nextfull30.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T23:05:57.116Z, excerpt_hash=sha256:aebc7842a145d995956a006e1dbda33c300bf3e3f9a2a34f1eae01418bcdd2de

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182247-WN0H8T/blueprint/resolved-snapshot.json
- old_digest: 2fbc342590b9a6a650534c7d5b7bf85f5e3cf63a3950c9aedf7c9089bc43c84b
- current_digest: 2fbc342590b9a6a650534c7d5b7bf85f5e3cf63a3950c9aedf7c9089bc43c84b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610182247-WN0H8T

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610182247-WN0H8T -m 🧩 WN0H8T task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task21 measured menubar suffix projection and header constraint with associated tests/registry. Preserve task20 formatting controls and all earlier core owners. No branch resets or merges.

## Findings

# Task21 verification

Approved scope:14 intentional non-task paths in calc checkout/branch. Native source reference: vcl/source/window/menu.cxx hides the trailing menubar roots and draws its More indicator;vcl/source/window/menubarwindow.cxx MenuBarWindow::ImplCreatePopup borrows the original hidden suffix as child menus. Browser adaptation measures actual DOM label/gap/indicator geometry,keeps original submenu identities and resource arrays,and uses the actual existing shared menu state machine and Sfx command ports. Unknown core formatting remains unavailable;no fake state or new command registrations.
