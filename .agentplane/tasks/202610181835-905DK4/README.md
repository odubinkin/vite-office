---
id: "202610181835-905DK4"
title: "Project pinned Calc menu and toolbar resources through shared UI"
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
  updated_at: "2026-10-18T18:35:48.279Z"
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
    body: "Start: Generate source-backed Calc UI resource projections with shared Writer tooling and presenters;verify source closure,unsupported states and browser menus without core facades."
events:
  -
    type: "status"
    at: "2026-10-18T18:35:49.460Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Generate source-backed Calc UI resource projections with shared Writer tooling and presenters;verify source closure,unsupported states and browser menus without core facades."
doc_version: 3
doc_updated_at: "2026-10-18T18:35:49.460Z"
doc_updated_by: "CODER"
description: "Approved UI plan task8/10. Replace handwritten Calc menu/shortcut/toolbar resources with deterministic generated projections of pinned LibreOffice XML,XCU and accelerator catalogs. Reuse/extract the existing Writer resource parser/catalog tooling into suite-neutral scripts;preserve Writer generated output byte-for-byte. Render original Calc menu hierarchy/order/labels through shared CommandMenuBar,including disabled unsupported commands rather than fake execution. Preserve Writer browser-save/recovery deviations explicitly. Keep supported standardbar controls through shared CommandToolbarItems in native order;record all source surfaces and exclusions. Source-backed catalog regeneration,closure and browser checks plus allCalc100% and affected Writer/tooling tests. Up to45non-task files including generated resource,tooling and runtime/provenance/capability records. No new core services,network,merges or other checkouts."
sections:
  Summary: |-
    Project pinned Calc menu and toolbar resources through shared UI

    Approved UI plan task8/10. Replace handwritten Calc menu/shortcut/toolbar resources with deterministic generated projections of pinned LibreOffice XML,XCU and accelerator catalogs. Reuse/extract the existing Writer resource parser/catalog tooling into suite-neutral scripts;preserve Writer generated output byte-for-byte. Render original Calc menu hierarchy/order/labels through shared CommandMenuBar,including disabled unsupported commands rather than fake execution. Preserve Writer browser-save/recovery deviations explicitly. Keep supported standardbar controls through shared CommandToolbarItems in native order;record all source surfaces and exclusions. Source-backed catalog regeneration,closure and browser checks plus allCalc100% and affected Writer/tooling tests. Up to45non-task files including generated resource,tooling and runtime/provenance/capability records. No new core services,network,merges or other checkouts.
  Scope: |-
    - In scope: Approved UI plan task8/10. Replace handwritten Calc menu/shortcut/toolbar resources with deterministic generated projections of pinned LibreOffice XML,XCU and accelerator catalogs. Reuse/extract the existing Writer resource parser/catalog tooling into suite-neutral scripts;preserve Writer generated output byte-for-byte. Render original Calc menu hierarchy/order/labels through shared CommandMenuBar,including disabled unsupported commands rather than fake execution. Preserve Writer browser-save/recovery deviations explicitly. Keep supported standardbar controls through shared CommandToolbarItems in native order;record all source surfaces and exclusions. Source-backed catalog regeneration,closure and browser checks plus allCalc100% and affected Writer/tooling tests. Up to45non-task files including generated resource,tooling and runtime/provenance/capability records. No new core services,network,merges or other checkouts.
    - Out of scope: unrelated refactors not required for "Project pinned Calc menu and toolbar resources through shared UI".
  Plan: "Use pinned Calc menubar.xml,standardbar.xml,textobjectbar.xml and English Calc/Generic command plus accelerator catalogs to generate deterministic calc-ui.generated.json with source hashes,complete source command/placement order and explicit browser-policy dispositions. Extract existing pure Writer graph/catalog helpers into suite-neutral tooling,retaining Writer compatibility exports and byte-identical generation. Runtime Calc adapters project full native menu hierarchy with disabled unavailable slots,source labels/dialog suffixes and same canonical shortcut spelling as Writer. Active current-core standardbar commands remain shared CommandToolbarItems;no unsupported native behavior is simulated. Tests compare regenerated artifacts/source inventory,exact source menu paths/labels/defaults,unsupported state and actual browser menus. AllCalc100%,affected shared/Writer/tooling,build/typechecks/style/source/registry gates. Up to45non-task files;current task8/10;full all-app regression follows task10."
  Verify Steps: "1. npm run test:coverage:calc passes100% statements/branches/functions/lines. 2. Deterministic Calc resource regeneration/check compares pinned XML/XCU and source hashes;Writer resource regeneration remains byte-identical. Related pure generator tests including new helpers and Calc source/runtime closure pass;related shared/Writer menu/toolbar tests pass. 3. Application/tools typecheck,build,touched style,module boundaries,docs,file-size,source-tree/provenance and scoped Calc/shared/Writer inventory gates plus doctor/routing. 4. Real production browser opens each Calc top menu without crashes,source order/labels/shortcut captions match generated resources,unsupported commands are disabled,and File operations remain functional. No full all-app suite before cadence task10."
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

Project pinned Calc menu and toolbar resources through shared UI

Approved UI plan task8/10. Replace handwritten Calc menu/shortcut/toolbar resources with deterministic generated projections of pinned LibreOffice XML,XCU and accelerator catalogs. Reuse/extract the existing Writer resource parser/catalog tooling into suite-neutral scripts;preserve Writer generated output byte-for-byte. Render original Calc menu hierarchy/order/labels through shared CommandMenuBar,including disabled unsupported commands rather than fake execution. Preserve Writer browser-save/recovery deviations explicitly. Keep supported standardbar controls through shared CommandToolbarItems in native order;record all source surfaces and exclusions. Source-backed catalog regeneration,closure and browser checks plus allCalc100% and affected Writer/tooling tests. Up to45non-task files including generated resource,tooling and runtime/provenance/capability records. No new core services,network,merges or other checkouts.

## Scope

- In scope: Approved UI plan task8/10. Replace handwritten Calc menu/shortcut/toolbar resources with deterministic generated projections of pinned LibreOffice XML,XCU and accelerator catalogs. Reuse/extract the existing Writer resource parser/catalog tooling into suite-neutral scripts;preserve Writer generated output byte-for-byte. Render original Calc menu hierarchy/order/labels through shared CommandMenuBar,including disabled unsupported commands rather than fake execution. Preserve Writer browser-save/recovery deviations explicitly. Keep supported standardbar controls through shared CommandToolbarItems in native order;record all source surfaces and exclusions. Source-backed catalog regeneration,closure and browser checks plus allCalc100% and affected Writer/tooling tests. Up to45non-task files including generated resource,tooling and runtime/provenance/capability records. No new core services,network,merges or other checkouts.
- Out of scope: unrelated refactors not required for "Project pinned Calc menu and toolbar resources through shared UI".

## Plan

Use pinned Calc menubar.xml,standardbar.xml,textobjectbar.xml and English Calc/Generic command plus accelerator catalogs to generate deterministic calc-ui.generated.json with source hashes,complete source command/placement order and explicit browser-policy dispositions. Extract existing pure Writer graph/catalog helpers into suite-neutral tooling,retaining Writer compatibility exports and byte-identical generation. Runtime Calc adapters project full native menu hierarchy with disabled unavailable slots,source labels/dialog suffixes and same canonical shortcut spelling as Writer. Active current-core standardbar commands remain shared CommandToolbarItems;no unsupported native behavior is simulated. Tests compare regenerated artifacts/source inventory,exact source menu paths/labels/defaults,unsupported state and actual browser menus. AllCalc100%,affected shared/Writer/tooling,build/typechecks/style/source/registry gates. Up to45non-task files;current task8/10;full all-app regression follows task10.

## Verify Steps

1. npm run test:coverage:calc passes100% statements/branches/functions/lines. 2. Deterministic Calc resource regeneration/check compares pinned XML/XCU and source hashes;Writer resource regeneration remains byte-identical. Related pure generator tests including new helpers and Calc source/runtime closure pass;related shared/Writer menu/toolbar tests pass. 3. Application/tools typecheck,build,touched style,module boundaries,docs,file-size,source-tree/provenance and scoped Calc/shared/Writer inventory gates plus doctor/routing. 4. Real production browser opens each Calc top menu without crashes,source order/labels/shortcut captions match generated resources,unsupported commands are disabled,and File operations remain functional. No full all-app suite before cadence task10.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
