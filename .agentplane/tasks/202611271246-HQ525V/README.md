---
id: "202611271246-HQ525V"
title: "Round-trip native Writer alphabetical and user index sections in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "index"
  - "odt"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Verify the original alphabetical and user index properties, cached section contents and forms using pinned ODT inputs, Worker transfer, re-export and reopen. Run the related Writer contents-index, text sections, native mark, Worker and shared ODF checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T12:46:23.602Z"
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
    body: "Start: trace the actual user and alphabetical index sources and forms with the pinned graph and stage Writer changes independently of the running full verification."
events:
  -
    type: "status"
    at: "2026-11-27T12:46:27.670Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: trace the actual user and alphabetical index sources and forms with the pinned graph and stage Writer changes independently of the running full verification."
doc_version: 3
doc_updated_at: "2026-11-27T12:46:27.670Z"
doc_updated_by: "CODER"
description: "Generalize the existing native Writer TOX source, form and cached section path for alphabetical and user-defined index sections. Port the original index-type forms, source flags, sort locale and algorithm, title/templates and cached body ownership through Writer import, export and Worker graph transport. Keep index generation or UI updates and unrelated section families outside this task. Verify original LibreOffice fixtures and relevant Writer suites."
sections:
  Summary: |-
    Round-trip native Writer alphabetical and user index sections in ODT

    Generalize the existing native Writer TOX source, form and cached section path for alphabetical and user-defined index sections. Port the original index-type forms, source flags, sort locale and algorithm, title/templates and cached body ownership through Writer import, export and Worker graph transport. Keep index generation or UI updates and unrelated section families outside this task. Verify original LibreOffice fixtures and relevant Writer suites.
  Scope: |-
    - In scope: Generalize the existing native Writer TOX source, form and cached section path for alphabetical and user-defined index sections. Port the original index-type forms, source flags, sort locale and algorithm, title/templates and cached body ownership through Writer import, export and Worker graph transport. Keep index generation or UI updates and unrelated section families outside this task. Verify original LibreOffice fixtures and relevant Writer suites.
    - Out of scope: unrelated refactors not required for "Round-trip native Writer alphabetical and user index sections in ODT".
  Plan: "Follow the pinned index service, source base, type-specific forms and XML section export. Retain native alphabetical and user sections as genuine Writer TOX sections and preserve their original source attributes, templates and saved body through ODT and the Worker. Reuse existing TOC and named section paths. Scope verification to unchanged source fixtures and the associated native Writer and XML tests."
  Verify Steps: |-
    PLANNER fallback scaffold for "Round-trip native Writer alphabetical and user index sections in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Round-trip native Writer alphabetical and user index sections in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Round-trip native Writer alphabetical and user index sections in ODT

Generalize the existing native Writer TOX source, form and cached section path for alphabetical and user-defined index sections. Port the original index-type forms, source flags, sort locale and algorithm, title/templates and cached body ownership through Writer import, export and Worker graph transport. Keep index generation or UI updates and unrelated section families outside this task. Verify original LibreOffice fixtures and relevant Writer suites.

## Scope

- In scope: Generalize the existing native Writer TOX source, form and cached section path for alphabetical and user-defined index sections. Port the original index-type forms, source flags, sort locale and algorithm, title/templates and cached body ownership through Writer import, export and Worker graph transport. Keep index generation or UI updates and unrelated section families outside this task. Verify original LibreOffice fixtures and relevant Writer suites.
- Out of scope: unrelated refactors not required for "Round-trip native Writer alphabetical and user index sections in ODT".

## Plan

Follow the pinned index service, source base, type-specific forms and XML section export. Retain native alphabetical and user sections as genuine Writer TOX sections and preserve their original source attributes, templates and saved body through ODT and the Worker. Reuse existing TOC and named section paths. Scope verification to unchanged source fixtures and the associated native Writer and XML tests.

## Verify Steps

PLANNER fallback scaffold for "Round-trip native Writer alphabetical and user index sections in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Round-trip native Writer alphabetical and user index sections in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
