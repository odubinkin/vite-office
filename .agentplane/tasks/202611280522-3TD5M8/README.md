---
id: "202611280522-3TD5M8"
title: "Port native Calc ODS workbook structure protection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T05:22:46.853Z"
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
    body: "Start: preserve native workbook structure protection in Calc ODS and Worker transport."
events:
  -
    type: "status"
    at: "2026-11-28T05:22:47.562Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve native workbook structure protection in Calc ODS and Worker transport."
doc_version: 3
doc_updated_at: "2026-11-28T05:22:47.562Z"
doc_updated_by: "CODER"
description: "Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior."
sections:
  Summary: |-
    Port native Calc ODS workbook structure protection

    Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior.
  Scope: |-
    - In scope: Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior.
    - Out of scope: unrelated refactors not required for "Port native Calc ODS workbook structure protection".
  Plan: "Introduce the native ScDocProtection owner and document contract using the sheet protection implementation for shared verifier and option behavior. Adopt office:spreadsheet protection after sheets, preserve both second-digest namespaces and the native hash preference on export, and carry workbook protection through the Calc graph codec. Guard the existing browser insert sheet action where the upstream DocFunc guards document structure; keep the lower-level import APIs and the existing save and password-retype policy. Port all five original LibreOffice ODS protection-key cases using the exact original fixtures and run only related Calc protection, Worker, and sheet checks."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port native Calc ODS workbook structure protection". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port native Calc ODS workbook structure protection". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

Port native Calc ODS workbook structure protection

Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior.

## Scope

- In scope: Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior.
- Out of scope: unrelated refactors not required for "Port native Calc ODS workbook structure protection".

## Plan

Introduce the native ScDocProtection owner and document contract using the sheet protection implementation for shared verifier and option behavior. Adopt office:spreadsheet protection after sheets, preserve both second-digest namespaces and the native hash preference on export, and carry workbook protection through the Calc graph codec. Guard the existing browser insert sheet action where the upstream DocFunc guards document structure; keep the lower-level import APIs and the existing save and password-retype policy. Port all five original LibreOffice ODS protection-key cases using the exact original fixtures and run only related Calc protection, Worker, and sheet checks.

## Verify Steps

PLANNER fallback scaffold for "Port native Calc ODS workbook structure protection". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port native Calc ODS workbook structure protection". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
