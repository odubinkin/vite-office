---
id: "202610181753-FJTKAS"
title: "Share browser persistence and connect Calc primary ODS saving"
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
  updated_at: "2026-10-18T17:53:57.165Z"
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
    body: "Start: Extract shared persistence and autosave policy,connect actual Calc ODS primary IO and lifecycle,then verify real-byte persistence and race handling at full Calc coverage."
events:
  -
    type: "status"
    at: "2026-10-18T17:53:57.932Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Extract shared persistence and autosave policy,connect actual Calc ODS primary IO and lifecycle,then verify real-byte persistence and race handling at full Calc coverage."
doc_version: 3
doc_updated_at: "2026-10-18T17:53:57.932Z"
doc_updated_by: "CODER"
description: "Approved UI plan task6/10. Extract format-neutral IndexedDB primary document storage and the exact Writer autosave timing/input-capture policy into framework browser modules. Keep Writer domain adapters and defaults. Extend actual ScDocShell with atomic ODS open/replace,primary save acknowledgement and generation/history ownership using shared SfxObjectShell/SfxMedium. Connect Calc canonical controller/session to browser ODS autosave without replacing committed cells or acknowledging later edits. Add real primary ODS IO and tests. Browser file dialogs/menu composition follows task7. Up to45non-task files including required metadata;no network,merges or other checkouts."
sections:
  Summary: |-
    Share browser persistence and connect Calc primary ODS saving

    Approved UI plan task6/10. Extract format-neutral IndexedDB primary document storage and the exact Writer autosave timing/input-capture policy into framework browser modules. Keep Writer domain adapters and defaults. Extend actual ScDocShell with atomic ODS open/replace,primary save acknowledgement and generation/history ownership using shared SfxObjectShell/SfxMedium. Connect Calc canonical controller/session to browser ODS autosave without replacing committed cells or acknowledging later edits. Add real primary ODS IO and tests. Browser file dialogs/menu composition follows task7. Up to45non-task files including required metadata;no network,merges or other checkouts.
  Scope: |-
    - In scope: Approved UI plan task6/10. Extract format-neutral IndexedDB primary document storage and the exact Writer autosave timing/input-capture policy into framework browser modules. Keep Writer domain adapters and defaults. Extend actual ScDocShell with atomic ODS open/replace,primary save acknowledgement and generation/history ownership using shared SfxObjectShell/SfxMedium. Connect Calc canonical controller/session to browser ODS autosave without replacing committed cells or acknowledging later edits. Add real primary ODS IO and tests. Browser file dialogs/menu composition follows task7. Up to45non-task files including required metadata;no network,merges or other checkouts.
    - Out of scope: unrelated refactors not required for "Share browser persistence and connect Calc primary ODS saving".
  Plan: "Extract format-neutral browser primary document store and Writer autosave scheduler into framework/browser with thin permanent Writer domain adapters preserving database and timing defaults. Implement ScDocShell ODS serialization,atomic open/replace,confirmed primary identity/save acknowledgement and actual shared undo-save positions. Add Calc primary ODS IO using shared store,title uniqueness and unchanged Writer autosave policy;connect source shell invalidations and session-owned autosave. Test actual ODS roundtrips,IndexedDB bytes,timing/input capture,failures,async edits/replacement/closure and history-save races. No file UI facades;shared menu/dialog integration is the following approved leaf. Bound to45non-task files including runtime/provenance/capability records. Current task6/10;full regression at10."
  Verify Steps: "1. npm run test:coverage:calc must pass all Calc tests at100% statements/branches/functions/lines including new persistence owners. 2. Focused Writer writer-odt-store,writer-autosave,writer-module,writer-odt-io and affected Calc mounted/controller tests;targeted100% coverage for extracted shared modules using relevant Writer evidence. 3. App typecheck/build,touched ESLint/Prettier,dependency/docs/file-size/source-tree/provenance and Calc/shared/Writer scoped parity gates. 4. Actual browser IndexedDB ODS persistence roundtrip and stable session closure;tests prove later edits remain dirty after asynchronous saves,failed imports do not replace live document,history-save positions survive concurrent history changes,and captured IME/pointer input delays autosave. Full all-app suite follows user cadence at task10."
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

Share browser persistence and connect Calc primary ODS saving

Approved UI plan task6/10. Extract format-neutral IndexedDB primary document storage and the exact Writer autosave timing/input-capture policy into framework browser modules. Keep Writer domain adapters and defaults. Extend actual ScDocShell with atomic ODS open/replace,primary save acknowledgement and generation/history ownership using shared SfxObjectShell/SfxMedium. Connect Calc canonical controller/session to browser ODS autosave without replacing committed cells or acknowledging later edits. Add real primary ODS IO and tests. Browser file dialogs/menu composition follows task7. Up to45non-task files including required metadata;no network,merges or other checkouts.

## Scope

- In scope: Approved UI plan task6/10. Extract format-neutral IndexedDB primary document storage and the exact Writer autosave timing/input-capture policy into framework browser modules. Keep Writer domain adapters and defaults. Extend actual ScDocShell with atomic ODS open/replace,primary save acknowledgement and generation/history ownership using shared SfxObjectShell/SfxMedium. Connect Calc canonical controller/session to browser ODS autosave without replacing committed cells or acknowledging later edits. Add real primary ODS IO and tests. Browser file dialogs/menu composition follows task7. Up to45non-task files including required metadata;no network,merges or other checkouts.
- Out of scope: unrelated refactors not required for "Share browser persistence and connect Calc primary ODS saving".

## Plan

Extract format-neutral browser primary document store and Writer autosave scheduler into framework/browser with thin permanent Writer domain adapters preserving database and timing defaults. Implement ScDocShell ODS serialization,atomic open/replace,confirmed primary identity/save acknowledgement and actual shared undo-save positions. Add Calc primary ODS IO using shared store,title uniqueness and unchanged Writer autosave policy;connect source shell invalidations and session-owned autosave. Test actual ODS roundtrips,IndexedDB bytes,timing/input capture,failures,async edits/replacement/closure and history-save races. No file UI facades;shared menu/dialog integration is the following approved leaf. Bound to45non-task files including runtime/provenance/capability records. Current task6/10;full regression at10.

## Verify Steps

1. npm run test:coverage:calc must pass all Calc tests at100% statements/branches/functions/lines including new persistence owners. 2. Focused Writer writer-odt-store,writer-autosave,writer-module,writer-odt-io and affected Calc mounted/controller tests;targeted100% coverage for extracted shared modules using relevant Writer evidence. 3. App typecheck/build,touched ESLint/Prettier,dependency/docs/file-size/source-tree/provenance and Calc/shared/Writer scoped parity gates. 4. Actual browser IndexedDB ODS persistence roundtrip and stable session closure;tests prove later edits remain dirty after asynchronous saves,failed imports do not replace live document,history-save positions survive concurrent history changes,and captured IME/pointer input delays autosave. Full all-app suite follows user cadence at task10.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
