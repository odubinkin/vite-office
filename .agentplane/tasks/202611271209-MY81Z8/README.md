---
id: "202611271209-MY81Z8"
title: "Implement native Writer index marks in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T12:10:19.486Z"
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
    body: "Start: preserve native contents, user and alphabetical index marks through the Writer ODT and Worker boundaries."
events:
  -
    type: "status"
    at: "2026-11-27T12:10:22.345Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve native contents, user and alphabetical index marks through the Writer ODT and Worker boundaries."
doc_version: 3
doc_updated_at: "2026-11-27T12:10:22.345Z"
doc_updated_by: "CODER"
description: "Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task."
sections:
  Summary: |-
    Implement native Writer index marks in ODT

    Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task.
  Scope: |-
    - In scope: Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task.
    - Out of scope: unrelated refactors not required for "Implement native Writer index marks in ODT".
  Plan: "1. Port SwTOXMark and SwTextTOXMark with native point/range hint ownership and descriptor attach. 2. Port the original xmloff mark import/export contexts, original property defaults and source pairing, using the existing text cursor and hint traversal. 3. Persist the normal native hints through the Worker and verify pinned cases and related existing tests. Interactive index generation and unsupported index section families remain outside this filter task."
  Verify Steps: "Verify connected native point and range index marks in the pinned Writer fixtures, including text boundaries, source properties and nested ranges. Verify the same marks and intentional whitespace through Worker graph transport and ODT export/reopen. Run existing relevant Writer hint, ODF marker, undo and Worker tests plus focused static, dependency, provenance and Writer/shared registry checks."
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

Implement native Writer index marks in ODT

Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task.

## Scope

- In scope: Port the native Writer pool item and anchored text hint for contents, user and alphabetical index marks. Route ODF point marks and start/end pairs through the original xmloff contexts, carry the native hints across Worker transport, and preserve visible text and link boundaries. Use pinned Writer ODT marks fixtures. Generated index refresh, nonlocal UNO selection operations and other index sections are outside this filter task.
- Out of scope: unrelated refactors not required for "Implement native Writer index marks in ODT".

## Plan

1. Port SwTOXMark and SwTextTOXMark with native point/range hint ownership and descriptor attach. 2. Port the original xmloff mark import/export contexts, original property defaults and source pairing, using the existing text cursor and hint traversal. 3. Persist the normal native hints through the Worker and verify pinned cases and related existing tests. Interactive index generation and unsupported index section families remain outside this filter task.

## Verify Steps

Verify connected native point and range index marks in the pinned Writer fixtures, including text boundaries, source properties and nested ranges. Verify the same marks and intentional whitespace through Worker graph transport and ODT export/reopen. Run existing relevant Writer hint, ODF marker, undo and Worker tests plus focused static, dependency, provenance and Writer/shared registry checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
