---
id: "202610181650-4XSBZ5"
title: "Implement Calc per-sheet cursor and selection view owner"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
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
doc_version: 3
doc_updated_at: "2026-10-18T16:50:52.554Z"
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
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
