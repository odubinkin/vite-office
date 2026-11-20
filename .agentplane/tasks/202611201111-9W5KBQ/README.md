---
id: "202611201111-9W5KBQ"
title: "Preserve native Calc named cell styles through ODS"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "git diff --check; ap doctor; node .agentplane/policy/check-routing.mjs"
  - "npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 4"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T11:12:13.495Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T11:33:28.595Z"
  updated_by: "CODER"
  note: "Verified named Calc cell styles, forward parents, inherited number formats, automatic-style references, and the Worker round trip."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-20T11:19:30.197Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-20T11:33:28.595Z"
    author: "CODER"
    state: "ok"
    note: "Verified named Calc cell styles, forward parents, inherited number formats, automatic-style references, and the Worker round trip."
doc_version: 3
doc_updated_at: "2026-11-20T11:33:28.672Z"
doc_updated_by: "CODER"
description: "Import and export named Calc cell styles, parent links, and number format references through native owners and preserve identity through the existing Calc browser worker boundary."
sections:
  Summary: |-
    Preserve native Calc named cell styles through ODS

    Import and export named Calc cell styles, parent links, and number format references through native owners and preserve identity through the existing Calc browser worker boundary.
  Scope: "Calc ODS style SAX and export owners, native Calc stylesheet and pattern ownership, Calc document worker codec and targeted tests, corresponding evidence and source provenance."
  Plan: "Match LibreOffice named style creation and parent linking, native pattern ownership, number format references and automatic style parent emission. Reuse filter semantics at the worker boundary and port relevant assertions."
  Verify Steps: |-
    1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 4. Cover canonical style parent links, named and automatic cells, data-style inheritance and Worker round trip.
    2. npm run typecheck --workspace @vite-office/office. Check all style and Worker boundaries.
    3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T11:33:28.595Z — VERIFY — ok

    By: CODER

    Note: Verified named Calc cell styles, forward parents, inherited number formats, automatic-style references, and the Worker round trip.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T11:19:30.197Z, excerpt_hash=sha256:1a071184efed882b4a2616320a97f65ee41a4f4eaebd62498b937b8649ee8d8f

    Details:

    npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml src/sc/source/core/data/attarray.test.ts src/sc/source/core/tool/stylehelper.test.ts --maxWorkers 2 --testTimeout 120000: 106 passed in 23 files. Shared xmloff unit checks: 3 passed. Writer naming and DOCX style consumers: 15 passed initially, and the last pinned DOCX case passed its focused retry after the initial timeout. Application typecheck, module boundaries, scoped ESLint, diff check, policy routing and doctor passed. No whole-application suite at this cadence.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201111-9W5KBQ/blueprint/resolved-snapshot.json
    - old_digest: e011de0f91e347cd1d367bd5fde0540cfe43658a31d0f051cb17ac4c0288336a
    - current_digest: e011de0f91e347cd1d367bd5fde0540cfe43658a31d0f051cb17ac4c0288336a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201111-9W5KBQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201111-9W5KBQ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the named-style changes to Calc source owners and Worker transfer together with scoped regression cases."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve native Calc named cell styles through ODS

Import and export named Calc cell styles, parent links, and number format references through native owners and preserve identity through the existing Calc browser worker boundary.

## Scope

Calc ODS style SAX and export owners, native Calc stylesheet and pattern ownership, Calc document worker codec and targeted tests, corresponding evidence and source provenance.

## Plan

Match LibreOffice named style creation and parent linking, native pattern ownership, number format references and automatic style parent emission. Reuse filter semantics at the worker boundary and port relevant assertions.

## Verify Steps

1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 4. Cover canonical style parent links, named and automatic cells, data-style inheritance and Worker round trip.
2. npm run typecheck --workspace @vite-office/office. Check all style and Worker boundaries.
3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T11:33:28.595Z — VERIFY — ok

By: CODER

Note: Verified named Calc cell styles, forward parents, inherited number formats, automatic-style references, and the Worker round trip.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T11:19:30.197Z, excerpt_hash=sha256:1a071184efed882b4a2616320a97f65ee41a4f4eaebd62498b937b8649ee8d8f

Details:

npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml src/sc/source/core/data/attarray.test.ts src/sc/source/core/tool/stylehelper.test.ts --maxWorkers 2 --testTimeout 120000: 106 passed in 23 files. Shared xmloff unit checks: 3 passed. Writer naming and DOCX style consumers: 15 passed initially, and the last pinned DOCX case passed its focused retry after the initial timeout. Application typecheck, module boundaries, scoped ESLint, diff check, policy routing and doctor passed. No whole-application suite at this cadence.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201111-9W5KBQ/blueprint/resolved-snapshot.json
- old_digest: e011de0f91e347cd1d367bd5fde0540cfe43658a31d0f051cb17ac4c0288336a
- current_digest: e011de0f91e347cd1d367bd5fde0540cfe43658a31d0f051cb17ac4c0288336a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201111-9W5KBQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201111-9W5KBQ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the named-style changes to Calc source owners and Worker transfer together with scoped regression cases.

## Findings
