---
id: "202610182005-QXFX41"
title: "Implement native Calc cell input mode transitions and F2 command"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T20:05:52.308Z"
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
    body: "Start: Implement source-backed Calc input mode owner and original F2 command under existing approved UI scope."
events:
  -
    type: "status"
    at: "2026-10-18T20:05:56.884Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement source-backed Calc input mode owner and original F2 command under existing approved UI scope."
doc_version: 3
doc_updated_at: "2026-10-18T20:05:56.884Z"
doc_updated_by: "CODER"
description: "Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20."
sections:
  Summary: |-
    Implement native Calc cell input mode transitions and F2 command

    Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20.
  Scope: |-
    - In scope: Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20.
    - Out of scope: unrelated refactors not required for "Implement native Calc cell input mode transitions and F2 command".
  Plan: "Use pinned global.hxx,inputhdl.hxx/inputhdl.cxx,cellsh4.cxx and tabvwsh4.cxx as contracts. Port four native input mode values and bounded mode owner/predicates/toggle,with explicit omitted EditEngine services. Browser retains one transient draft bound to actual document;direct typing uses TYPE,F2 toggles TABLE/TYPE without commit,TOP commits before F2. Original SetInputMode slot26552 consumes same owner through shared menu and F2 dispatch. Scalar TYPE cursor movement commits and moves;TABLE/TOP keep caret navigation. Preserve invalid draft,IME and modal guards. AllCalc raw100percent and affected shared/Writer/source tests,types/build/style/source/provenance/inventory,doctor/routing and production browser F2 review. Up to35non-task paths,task12,next full suite task20."
  Verify Steps: "1. npm run test:coverage:calc passes raw100percent statements/branches/functions/lines. Native mode predicates,toggle and original slot identity have source-backed checks;production input tests cover TYPE vs TABLE arrows,F2 draft retention,TOP commit,error retention,IME and menu dispatch. 2. Related shared menu/Writer tests and tooling source tests pass;resource freshness remains unchanged. 3. App/tools typecheck,build,touched prettier/eslint,module/docs/size/source/provenance and scoped Calc/shared inventory gates,ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Real browser uses menu and F2 on actual document and verifies draft/cursor/history transitions. Full regression cadence next task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Implement native Calc cell input mode transitions and F2 command

Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20.

## Scope

- In scope: Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20.
- Out of scope: unrelated refactors not required for "Implement native Calc cell input mode transitions and F2 command".

## Plan

Use pinned global.hxx,inputhdl.hxx/inputhdl.cxx,cellsh4.cxx and tabvwsh4.cxx as contracts. Port four native input mode values and bounded mode owner/predicates/toggle,with explicit omitted EditEngine services. Browser retains one transient draft bound to actual document;direct typing uses TYPE,F2 toggles TABLE/TYPE without commit,TOP commits before F2. Original SetInputMode slot26552 consumes same owner through shared menu and F2 dispatch. Scalar TYPE cursor movement commits and moves;TABLE/TOP keep caret navigation. Preserve invalid draft,IME and modal guards. AllCalc raw100percent and affected shared/Writer/source tests,types/build/style/source/provenance/inventory,doctor/routing and production browser F2 review. Up to35non-task paths,task12,next full suite task20.

## Verify Steps

1. npm run test:coverage:calc passes raw100percent statements/branches/functions/lines. Native mode predicates,toggle and original slot identity have source-backed checks;production input tests cover TYPE vs TABLE arrows,F2 draft retention,TOP commit,error retention,IME and menu dispatch. 2. Related shared menu/Writer tests and tooling source tests pass;resource freshness remains unchanged. 3. App/tools typecheck,build,touched prettier/eslint,module/docs/size/source/provenance and scoped Calc/shared inventory gates,ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Real browser uses menu and F2 on actual document and verifies draft/cursor/history transitions. Full regression cadence next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
