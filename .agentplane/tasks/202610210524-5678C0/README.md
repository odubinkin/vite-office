---
id: "202610210524-5678C0"
title: "Implement mouse sizing of Calc column and row headers"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T05:54:00.515Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-21T06:04:25.469Z"
  updated_by: "CODER"
  note: "604Calc/135owners100;28relatedWriter/common100;native header and pointer100;real browser resize/undo/Escape;13gates0;immutable audit passed."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement native header size/hide owners and actual browser pointer integration,with combined final Calc acceptance for tasks67and68."
events:
  -
    type: "status"
    at: "2026-10-21T05:31:14.786Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native header size/hide owners and actual browser pointer integration,with combined final Calc acceptance for tasks67and68."
  -
    type: "verify"
    at: "2026-10-21T06:04:25.469Z"
    author: "CODER"
    state: "ok"
    note: "604Calc/135owners100;28relatedWriter/common100;native header and pointer100;real browser resize/undo/Escape;13gates0;immutable audit passed."
doc_version: 3
doc_updated_at: "2026-10-21T06:04:25.524Z"
doc_updated_by: "CODER"
description: "User priority: useful existing-core UI after ordinary ODS import. Port the consumed ScColBar/ScRowBar size and hide contracts plus header drag threshold/completion/cancellation from pinned upstream. Wire React header boundaries to actual native dimensions and undo, preserving selection/groups and browser style. No alternate workbook geometry state; native optimal device layout stays an explicit separate unported branch. Limit up to24 implementation/test/registry/doc paths, including new native header boundaries and one browser pointer presenter. Accept related tests and raw changed-owner100, complete Calc100, browser actual drag/undo/cancel and unchanged ODS reload behavior. Full all-app checkpoint70, repair and final closure then pause remain required."
sections:
  Summary: "Add working mouse column and row sizing on the current native geometry slice. Use existing document,selection and undo owners; preserve upstream thresholds,integer conversion,selected spans and hidden ranges."
  Scope: "Original colrowba size/hide methods and original header drag arithmetic at the browser presentation boundary;new inc/source header owner files,one React resize presenter,controller/grid/workbench wiring and related tests/registry/docs. At most24paths. No zoom/device-layout implementation or alternate geometry model. Existing96CSSdpi is explicitly supplied by the browser to the consumed pixel-conversion dependency."
  Plan: "Implement original colrowba size/hide and hdrcont drag arithmetic over genuine geometry/history owners. Reuse Writer tracking by moving its implementation into shared VCL browser ownership and retaining a Writer API reexport. Pointer cursor styling also reuses VCL. Include the common legacy mouse-domain regression required for raw100 coverage. Up to36source/test/registry/doc paths reflect canonical header boundaries and truthful relocation of Writer provenance/runtime links;functional scope remains the authorized ODS/resize/UI priority. Browser96CSSdpi is supplied explicitly;active edit views prohibit sizing;device optimum,double-clickautofit,metricdragtooltip,RTL/zoom/split/protection stay unported. RelatedCalc and Writer/common tests plus rawchanged-owner100 and one final fullCalc/coverage run supply shared acceptance for tasks67and68. No threshold changes/exclusions. Full all-app at70,repairs/scenarios/coverage,complete currenttask closure then pause goal."
  Verify Steps: "Native size tests cover UInt16 narrowing,min10px,exactpixel-to-twipconversion,single/unselected versus full marked/disjoint spans,selected sheet groups,hidden size0,stored dimensions,filtered rows and Undo/Redo. Browser actual pointer tests cover2pxthreshold,commit onrelease,preview without model changes,Esc/pointercancel,no selection loss,negative hide range and visible grid/dimension changes after history and ODS reload. All new/changed runtime owners raw S/B/F/L100;fullCalc tests/coverage100 without exclusions or threshold changes. Relevant sharedUI tests if shared sources change. Types/lint/format/boundaries/JSDoc/size/provenance/registry and browser drag QA pass. Retain explicit optimum/device/layout limitations."
  Verification: |-
    Pass. Final unchanged-source Calc profile:604cases,177files,135measured owners,raw S11128/B6909/F2064/L9994 all100,zero fail/pending. Native header7cases rawS71/B32/F8/L53 all100;pointer9cases rawS39/B30/F7/L32 all100;mounted integration2cases pass. RelatedWriter/common28cases rawS51/B26/F12/L43 all100. All nontrivia TS tokens of the moved Writer tracking implementation match baseline60b8819af68c after the public type/function rename. Real Chromium column85to126px,Undo85;row17to48px,Undo and Escape cancellation17. App types and13individual gates pass,including production build/static and both resource catalogs. Immutable46artifact archive and source/hash audit pass. No runtime/test source file changed after finalCalc start. Scope retains explicit device optimum,autofit,metrictooltip,RTL/zoom/split/protection limitations. Shared final604-case profile also accepts task67 ODS fixes.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-21T06:04:25.469Z — VERIFY — ok

    By: CODER

    Note: 604Calc/135owners100;28relatedWriter/common100;native header and pointer100;real browser resize/undo/Escape;13gates0;immutable audit passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T06:04:24.747Z, excerpt_hash=sha256:a1e5babeba1e19e7b3fe87530a1b37561f1486abf680cce4701e2b20656d4cc5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210524-5678C0/blueprint/resolved-snapshot.json
    - old_digest: 5d4bc1a3bf5e54b67d0787b1d4cb37943982985ab90ddfb66f7b590516c93914
    - current_digest: 5d4bc1a3bf5e54b67d0787b1d4cb37943982985ab90ddfb66f7b590516c93914
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610210524-5678C0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610210524-5678C0 -m 🧩 5678C0 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's geometry and pointer integration;retain accepted ordinary ODS opening and separately preserved task66 work."
  Findings: "Implementation reuses the actual Writer VCL tracking owner after moving it into common VCL browser ownership,with Writer API reexports and truthful relocated evidence links. Native header sizing preserves UInt16,min10px,selected/disjoint spans,sheet groups and existing geometry history. Browser hdrcont arithmetic preserves2pxthreshold,+2release and negative hide walk;active editing disables sizing. Initial related27Writer cases left legacy mouse branches uncovered;one genuine mouse-domain test covers mouse acceptance and touch/pen isolation,bringing common owner to raw100. Initial metadata checks identified missing evidence/long rationale and reexport-local-symbol declaration mismatches;records now follow existing barrel-owner conventions and all validators pass. Browser console has only the existing favicon404,with no application JS error. Exact commands,statuses,raw maps,source pins and UI results are archived in evidence. Full all-app70 checkpoint and eventual goal pause remain required."
id_source: "generated"
---
## Summary

Add working mouse column and row sizing on the current native geometry slice. Use existing document,selection and undo owners; preserve upstream thresholds,integer conversion,selected spans and hidden ranges.

## Scope

Original colrowba size/hide methods and original header drag arithmetic at the browser presentation boundary;new inc/source header owner files,one React resize presenter,controller/grid/workbench wiring and related tests/registry/docs. At most24paths. No zoom/device-layout implementation or alternate geometry model. Existing96CSSdpi is explicitly supplied by the browser to the consumed pixel-conversion dependency.

## Plan

Implement original colrowba size/hide and hdrcont drag arithmetic over genuine geometry/history owners. Reuse Writer tracking by moving its implementation into shared VCL browser ownership and retaining a Writer API reexport. Pointer cursor styling also reuses VCL. Include the common legacy mouse-domain regression required for raw100 coverage. Up to36source/test/registry/doc paths reflect canonical header boundaries and truthful relocation of Writer provenance/runtime links;functional scope remains the authorized ODS/resize/UI priority. Browser96CSSdpi is supplied explicitly;active edit views prohibit sizing;device optimum,double-clickautofit,metricdragtooltip,RTL/zoom/split/protection stay unported. RelatedCalc and Writer/common tests plus rawchanged-owner100 and one final fullCalc/coverage run supply shared acceptance for tasks67and68. No threshold changes/exclusions. Full all-app at70,repairs/scenarios/coverage,complete currenttask closure then pause goal.

## Verify Steps

Native size tests cover UInt16 narrowing,min10px,exactpixel-to-twipconversion,single/unselected versus full marked/disjoint spans,selected sheet groups,hidden size0,stored dimensions,filtered rows and Undo/Redo. Browser actual pointer tests cover2pxthreshold,commit onrelease,preview without model changes,Esc/pointercancel,no selection loss,negative hide range and visible grid/dimension changes after history and ODS reload. All new/changed runtime owners raw S/B/F/L100;fullCalc tests/coverage100 without exclusions or threshold changes. Relevant sharedUI tests if shared sources change. Types/lint/format/boundaries/JSDoc/size/provenance/registry and browser drag QA pass. Retain explicit optimum/device/layout limitations.

## Verification

Pass. Final unchanged-source Calc profile:604cases,177files,135measured owners,raw S11128/B6909/F2064/L9994 all100,zero fail/pending. Native header7cases rawS71/B32/F8/L53 all100;pointer9cases rawS39/B30/F7/L32 all100;mounted integration2cases pass. RelatedWriter/common28cases rawS51/B26/F12/L43 all100. All nontrivia TS tokens of the moved Writer tracking implementation match baseline60b8819af68c after the public type/function rename. Real Chromium column85to126px,Undo85;row17to48px,Undo and Escape cancellation17. App types and13individual gates pass,including production build/static and both resource catalogs. Immutable46artifact archive and source/hash audit pass. No runtime/test source file changed after finalCalc start. Scope retains explicit device optimum,autofit,metrictooltip,RTL/zoom/split/protection limitations. Shared final604-case profile also accepts task67 ODS fixes.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-21T06:04:25.469Z — VERIFY — ok

By: CODER

Note: 604Calc/135owners100;28relatedWriter/common100;native header and pointer100;real browser resize/undo/Escape;13gates0;immutable audit passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T06:04:24.747Z, excerpt_hash=sha256:a1e5babeba1e19e7b3fe87530a1b37561f1486abf680cce4701e2b20656d4cc5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210524-5678C0/blueprint/resolved-snapshot.json
- old_digest: 5d4bc1a3bf5e54b67d0787b1d4cb37943982985ab90ddfb66f7b590516c93914
- current_digest: 5d4bc1a3bf5e54b67d0787b1d4cb37943982985ab90ddfb66f7b590516c93914
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610210524-5678C0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610210524-5678C0 -m 🧩 5678C0 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's geometry and pointer integration;retain accepted ordinary ODS opening and separately preserved task66 work.

## Findings

Implementation reuses the actual Writer VCL tracking owner after moving it into common VCL browser ownership,with Writer API reexports and truthful relocated evidence links. Native header sizing preserves UInt16,min10px,selected/disjoint spans,sheet groups and existing geometry history. Browser hdrcont arithmetic preserves2pxthreshold,+2release and negative hide walk;active editing disables sizing. Initial related27Writer cases left legacy mouse branches uncovered;one genuine mouse-domain test covers mouse acceptance and touch/pen isolation,bringing common owner to raw100. Initial metadata checks identified missing evidence/long rationale and reexport-local-symbol declaration mismatches;records now follow existing barrel-owner conventions and all validators pass. Browser console has only the existing favicon404,with no application JS error. Exact commands,statuses,raw maps,source pins and UI results are archived in evidence. Full all-app70 checkpoint and eventual goal pause remain required.
