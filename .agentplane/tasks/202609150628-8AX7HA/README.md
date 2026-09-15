---
id: "202609150628-8AX7HA"
title: "Align Writer ODT Title parent styles with LibreOffice"
status: "DOING"
priority: "high"
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
  updated_at: "2026-09-15T06:30:28.065Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-15T06:30:59.734Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-15T06:30:59.734Z"
doc_updated_by: "CODER"
description: "Compare the bounded Writer ODT style import and export paths with pinned LibreOffice 26.8.0.2, accept upstream-valid Title parent-style relationships, emit canonical ODF parent style names, and add import/export round-trip regressions."
sections:
  Summary: "Restore LibreOffice-compatible ODT handling for the built-in Title paragraph style so LibreOffice-saved documents open without an invalid-parent error and exported packages use the same canonical ODF style relationships as the pinned upstream baseline."
  Scope: "Compare the current xmloff/sw import and export behavior with the pinned LibreOffice 26.8.0.2 source at vendor/libreoffice-reference. Modify only the bounded Writer ODT style paths and their focused tests, expected in apps/office/src/sw/source/filter/xml/xmlimp.ts, apps/office/src/xmloff/source/text/txtparae.ts, apps/office/src/xmloff/source/text/txtpara.test.ts, and apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts (plus an existing directly related ODT style test only if needed). Preserve the current module boundaries, parser resource limits, unsupported-feature failures, and unrelated style semantics. Do not use network access or alter the pre-existing change in .agentplane/tasks/202609150610-6YSBSR/README.md."
  Plan: "1. Inspect the pinned LibreOffice xmloff/sw style import and export implementations and record the precise Title parent-style behavior relevant to the failing LibreOffice document. 2. Align named paragraph-style import validation with upstream: import valid declared ODF relationships without enforcing a project-invented built-in Title hierarchy, while preserving family validation, style application, and bounded failure behavior. 3. Align automatic paragraph-style export with upstream ODF naming by resolving internal Writer style IDs to canonical ODF style names before writing style:parent-style-name. 4. Add focused regressions for LibreOffice Title variants, canonical exported parent names, and package-level export-to-import round-trip. 5. Run the declared targeted and full verification commands and record exact evidence."
  Verify Steps: |-
    1. Run: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts. Expected: focused ODF text-style export and Writer package import/export tests pass, including LibreOffice-valid Title parent variants, canonical Title parent-style-name output, and ODT export-to-import round-trip without the invalid-parent error.
    2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, unit and inventory coverage, browser E2E/static checks, documentation, file-size, source-tree/provenance, and parity checks all pass.
    3. Run: ap doctor. Expected: Agentplane repository health checks pass, allowing only clearly identified pre-existing warnings unrelated to this task.
    4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.
    5. Run: git status --short --untracked-files=all. Expected: only intentional task/code/test changes and the preserved pre-existing .agentplane/tasks/202609150610-6YSBSR/README.md modification are present; no unrelated artifacts exist.
  Verification: "Pending execution by CODER/verification owner. Record each declared command with Result, Evidence, and Scope; record any approved skip with Reason, Risk, and Approval."
  Rollback Plan: "Revert only the importer validation, exporter ODF-name resolution, focused regression tests, and this task record introduced by the task. No migration, package-format version change, external write, or persistent user-data transformation is planned."
  Findings: "Planning finding: the current importer compares every present built-in style against the local pool parent, and the automatic-style exporter writes an internal style ID directly as style:parent-style-name. Execution must confirm the corresponding pinned LibreOffice xmloff/sw behavior before editing and keep any additional observations task-local."
id_source: "generated"
---
## Summary

Restore LibreOffice-compatible ODT handling for the built-in Title paragraph style so LibreOffice-saved documents open without an invalid-parent error and exported packages use the same canonical ODF style relationships as the pinned upstream baseline.

## Scope

Compare the current xmloff/sw import and export behavior with the pinned LibreOffice 26.8.0.2 source at vendor/libreoffice-reference. Modify only the bounded Writer ODT style paths and their focused tests, expected in apps/office/src/sw/source/filter/xml/xmlimp.ts, apps/office/src/xmloff/source/text/txtparae.ts, apps/office/src/xmloff/source/text/txtpara.test.ts, and apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts (plus an existing directly related ODT style test only if needed). Preserve the current module boundaries, parser resource limits, unsupported-feature failures, and unrelated style semantics. Do not use network access or alter the pre-existing change in .agentplane/tasks/202609150610-6YSBSR/README.md.

## Plan

1. Inspect the pinned LibreOffice xmloff/sw style import and export implementations and record the precise Title parent-style behavior relevant to the failing LibreOffice document. 2. Align named paragraph-style import validation with upstream: import valid declared ODF relationships without enforcing a project-invented built-in Title hierarchy, while preserving family validation, style application, and bounded failure behavior. 3. Align automatic paragraph-style export with upstream ODF naming by resolving internal Writer style IDs to canonical ODF style names before writing style:parent-style-name. 4. Add focused regressions for LibreOffice Title variants, canonical exported parent names, and package-level export-to-import round-trip. 5. Run the declared targeted and full verification commands and record exact evidence.

## Verify Steps

1. Run: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts. Expected: focused ODF text-style export and Writer package import/export tests pass, including LibreOffice-valid Title parent variants, canonical Title parent-style-name output, and ODT export-to-import round-trip without the invalid-parent error.
2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, unit and inventory coverage, browser E2E/static checks, documentation, file-size, source-tree/provenance, and parity checks all pass.
3. Run: ap doctor. Expected: Agentplane repository health checks pass, allowing only clearly identified pre-existing warnings unrelated to this task.
4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.
5. Run: git status --short --untracked-files=all. Expected: only intentional task/code/test changes and the preserved pre-existing .agentplane/tasks/202609150610-6YSBSR/README.md modification are present; no unrelated artifacts exist.

## Verification

Pending execution by CODER/verification owner. Record each declared command with Result, Evidence, and Scope; record any approved skip with Reason, Risk, and Approval.

## Rollback Plan

Revert only the importer validation, exporter ODF-name resolution, focused regression tests, and this task record introduced by the task. No migration, package-format version change, external write, or persistent user-data transformation is planned.

## Findings

Planning finding: the current importer compares every present built-in style against the local pool parent, and the automatic-style exporter writes an internal style ID directly as style:parent-style-name. Execution must confirm the corresponding pinned LibreOffice xmloff/sw behavior before editing and keep any additional observations task-local.
