---
id: "202610181519-S0E7YY"
title: "Repair stale regression expectations exposed by milestone full run"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T15:20:10.386Z"
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
    body: "Start:repair the seven concrete regression assertions using native insertion/manifest/dependency and current registry evidence;no production behavior or UI change."
events:
  -
    type: "status"
    at: "2026-10-18T15:20:11.669Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:repair the seven concrete regression assertions using native insertion/manifest/dependency and current registry evidence;no production behavior or UI change."
doc_version: 3
doc_updated_at: "2026-10-18T15:20:11.669Z"
doc_updated_by: "CODER"
description: "Task206:resolve7failures in full checkpoint task205 through pinned-source and current-registry evidence. Scope6paths:Writer native-content-frame-query.test.ts;apps/office/test-projects.ts;check-legacy-font-boundary.test.ts;native-tools-ownership.test.ts;inventory odt-import-diagnostics.test.ts and parity-mapping-cli.test.ts. Preserve native runtime semantics,strict guards and Writer-only coverage exemption. No UI or feature expansion."
sections:
  Summary: "Repair the seven concrete assertion/ownership failures found in task205 full regression without changing native runtime behavior or expanding the Calc milestone."
  Scope: "Exactly6non-task paths:apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts,apps/office/test-projects.ts,scripts/check-legacy-font-boundary.test.ts,scripts/native-tools-ownership.test.ts,scripts/libreoffice-inventory/odt-import-diagnostics.test.ts,scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Align Writer first-client expectation to pinned intrusive insertion order;keep privacy failure test on an actually rejected package;update exact registry counts honestly including false readiness;make existing boundary tests reflect already-approved source edges while retaining forbidden reverse/browser edges;partition every shared-colocated Writer integration test exactly once. No runtime behavior change,no coverage guard weakening,no UI."
  Plan: "1.Wait until task205 full wrapper restores5references;read actual pinned behavior and current registry/ownership. 2.Correct6scoped test/config expectations without production changes or guard weakening. 3.Run focused failing suites and required inventory coverage,source gates/hash audit,verify and same-agent review. 4.Close repair and checkpoint205,then pause goal."
  Verify Steps: |-
    Pinned local source audit of Writer client insertion/traversal,manifest SAX-failure/normal-mode MIME handling,and source dependencies behind existing tools/o3tl and Writer/unotools edges. No native compilation.
    python3 output/playwright/task206-checks/focused.py:rerun failed Writer12cases and three tooling files,plus full inventory coverage since its first failing run emitted no coverage. Execute without all5native references and restore finally. Preserve actual raw maps;Writer-only raw gaps exempt.
    Run existing format/lint/type/docs/boundary/source-tree/provenance/inventory gates for6paths,doctor/routing/diff. Exact source/hash/path audit,record verification and same-agent quality review;no second full replay of16952already-passing cases. Return evidence to checkpoint205,which then pauses goal.
  Verification: "Pending focused repair checks."
  Rollback Plan: "Revert only6test/config paths and task206 records. Preserve production Calc/shared/Writer code and all prior tasks;restore reference links finally."
  Findings: "Task205 full office16952pass/2assertionfail;only5Writer paths have raw gaps,explicitly exempt. Inventory121pass/2fail;tooling99pass/3fail. Browser/static checks still executing against frozen production sources;wait for wrapper completion before editing test ownership config. Existing source gates pass,so guard tests may contain obsolete edge assumptions. Native evidence must determine corrected expectations;do not make runtime match stale tests."
id_source: "generated"
---
## Summary

Repair the seven concrete assertion/ownership failures found in task205 full regression without changing native runtime behavior or expanding the Calc milestone.

## Scope

Exactly6non-task paths:apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts,apps/office/test-projects.ts,scripts/check-legacy-font-boundary.test.ts,scripts/native-tools-ownership.test.ts,scripts/libreoffice-inventory/odt-import-diagnostics.test.ts,scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Align Writer first-client expectation to pinned intrusive insertion order;keep privacy failure test on an actually rejected package;update exact registry counts honestly including false readiness;make existing boundary tests reflect already-approved source edges while retaining forbidden reverse/browser edges;partition every shared-colocated Writer integration test exactly once. No runtime behavior change,no coverage guard weakening,no UI.

## Plan

1.Wait until task205 full wrapper restores5references;read actual pinned behavior and current registry/ownership. 2.Correct6scoped test/config expectations without production changes or guard weakening. 3.Run focused failing suites and required inventory coverage,source gates/hash audit,verify and same-agent review. 4.Close repair and checkpoint205,then pause goal.

## Verify Steps

Pinned local source audit of Writer client insertion/traversal,manifest SAX-failure/normal-mode MIME handling,and source dependencies behind existing tools/o3tl and Writer/unotools edges. No native compilation.
python3 output/playwright/task206-checks/focused.py:rerun failed Writer12cases and three tooling files,plus full inventory coverage since its first failing run emitted no coverage. Execute without all5native references and restore finally. Preserve actual raw maps;Writer-only raw gaps exempt.
Run existing format/lint/type/docs/boundary/source-tree/provenance/inventory gates for6paths,doctor/routing/diff. Exact source/hash/path audit,record verification and same-agent quality review;no second full replay of16952already-passing cases. Return evidence to checkpoint205,which then pauses goal.

## Verification

Pending focused repair checks.

## Rollback Plan

Revert only6test/config paths and task206 records. Preserve production Calc/shared/Writer code and all prior tasks;restore reference links finally.

## Findings

Task205 full office16952pass/2assertionfail;only5Writer paths have raw gaps,explicitly exempt. Inventory121pass/2fail;tooling99pass/3fail. Browser/static checks still executing against frozen production sources;wait for wrapper completion before editing test ownership config. Existing source gates pass,so guard tests may contain obsolete edge assumptions. Native evidence must determine corrected expectations;do not make runtime match stale tests.
