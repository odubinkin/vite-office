---
id: "202608111308-A38HWR"
title: "Remove non-Writer text download toolbar command"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T13:08:31.839Z"
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
    body: "Start: removing only the non-upstream text-download toolbar surface while retaining File export."
events:
  -
    type: "status"
    at: "2026-08-11T13:08:32.275Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: removing only the non-upstream text-download toolbar surface while retaining File export."
doc_version: 3
doc_updated_at: "2026-08-11T13:08:32.275Z"
doc_updated_by: "CODER"
description: "Remove the browser-only Download text control from the Writer standard toolbar because pinned LibreOffice Writer standardbar has no corresponding generic text-download command. Keep the existing bounded export only under File as Save as text, update tests and placement documentation, and preserve the underlying browser download capability."
sections:
  Summary: |-
    Remove non-Writer text download toolbar command

    Remove the browser-only Download text control from the Writer standard toolbar because pinned LibreOffice Writer standardbar has no corresponding generic text-download command. Keep the existing bounded export only under File as Save as text, update tests and placement documentation, and preserve the underlying browser download capability.
  Scope: |-
    - In scope: Remove the Download text button and its toolbar-only callback surface; retain File Save as text and the underlying browser download implementation.
    - In scope: Update focused tests and Writer command-placement documentation using pinned standardbar evidence.
    - Out of scope: changing plain-text export format, adding native Writer export formats, or modifying File menu behavior.
  Plan: |-
    1. Remove the toolbar-only text-download command while retaining the File menu entry and workbench download handler.
    2. Update unit and browser-facing assertions so the standard toolbar contains only commands with upstream placement.
    3. Record pinned standardbar provenance, run fast checks and focused browser coverage, and document the approved aggregate-check deferral.
  Verify Steps: |-
    1. Run project format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass and local coverage remains 100 percent.
    2. Run the focused production Playwright check. Expected: Writer chrome remains accessible and no Download text toolbar command is present.
    3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs. Expected: no whitespace errors and policy checks pass.
    4. Defer static smoke, inventory, and aggregate verification to the user-approved ten-task cadence; record the residual risk in Findings.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task implementation commit to restore the prior standard-toolbar button.
    - Re-run the focused suite to confirm the previous placement is restored.
  Findings: ""
id_source: "generated"
---
## Summary

Remove non-Writer text download toolbar command

Remove the browser-only Download text control from the Writer standard toolbar because pinned LibreOffice Writer standardbar has no corresponding generic text-download command. Keep the existing bounded export only under File as Save as text, update tests and placement documentation, and preserve the underlying browser download capability.

## Scope

- In scope: Remove the Download text button and its toolbar-only callback surface; retain File Save as text and the underlying browser download implementation.
- In scope: Update focused tests and Writer command-placement documentation using pinned standardbar evidence.
- Out of scope: changing plain-text export format, adding native Writer export formats, or modifying File menu behavior.

## Plan

1. Remove the toolbar-only text-download command while retaining the File menu entry and workbench download handler.
2. Update unit and browser-facing assertions so the standard toolbar contains only commands with upstream placement.
3. Record pinned standardbar provenance, run fast checks and focused browser coverage, and document the approved aggregate-check deferral.

## Verify Steps

1. Run project format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass and local coverage remains 100 percent.
2. Run the focused production Playwright check. Expected: Writer chrome remains accessible and no Download text toolbar command is present.
3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs. Expected: no whitespace errors and policy checks pass.
4. Defer static smoke, inventory, and aggregate verification to the user-approved ten-task cadence; record the residual risk in Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task implementation commit to restore the prior standard-toolbar button.
- Re-run the focused suite to confirm the previous placement is restored.

## Findings
