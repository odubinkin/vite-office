---
id: "202611271138-BPVCFM"
title: "Preserve Writer table of contents in ODT and Worker"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T11:38:32.720Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T11:53:07.148Z"
  updated_by: "CODER"
  note: "Tests  43 passed (43). Original SimpleTOC, typecheck, lint, formatting, dependencies, provenance and Writer/shared inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T11:53:07.603Z"
  updated_by: "EVALUATOR"
  note: "Verified the pinned TOC and its original generated title and linked contents across Writer Worker and ODT reopening."
  evaluated_sha: "361043929fcbc23ec34f01afc98849bfec78a449"
  blueprint_digest: "07d2c0bf943d31caba1c0af86c65114612dec8b25782c5e633beda96d4761a05"
  evidence_refs:
    - ".agentplane/tasks/202611271138-BPVCFM/README.md"
    - ".agentplane/tasks/202611271138-BPVCFM/quality/20261127-115307603-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271138-BPVCFM/quality/20261127-115307603-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271138-BPVCFM/quality/20261127-115307603-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271138-BPVCFM/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/BPVCFM/verification.md"
    - "361043929fcbc23ec34f01afc98849bfec78a449"
  findings:
    - "The filter preserves the native connected TOX and original form in the represented slice. Interactive rebuilding, other index kinds and PDF verification remain outside this task."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: preserve the native table-of-contents section and properties in the represented Writer ODT filter and Worker."
events:
  -
    type: "status"
    at: "2026-11-27T11:38:34.453Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve the native table-of-contents section and properties in the represented Writer ODT filter and Worker."
  -
    type: "verify"
    at: "2026-11-27T11:53:07.148Z"
    author: "CODER"
    state: "ok"
    note: "Tests  43 passed (43). Original SimpleTOC, typecheck, lint, formatting, dependencies, provenance and Writer/shared inventory passed."
doc_version: 3
doc_updated_at: "2026-11-27T11:53:07.201Z"
doc_updated_by: "CODER"
description: "Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task."
sections:
  Summary: |-
    Preserve Writer table of contents in ODT and Worker

    Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task.
  Scope: |-
    - In scope: Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task.
    - Out of scope: unrelated refactors not required for "Preserve Writer table of contents in ODT and Worker".
  Plan: "1. Port the represented Writer SwTOXBase, SwForm, SwTOXBaseSection and SwXDocumentIndex ownership, reusing native section nodes and paragraph import. 2. Route TOC index source, title, templates and cached body through the original xmloff contexts, section export and Worker records. 3. Verify the pinned SimpleTOC package and related existing suites, review original defaults and document any suspicious source behavior."
  Verify Steps: "Open the pinned SimpleTOC.odt without rewriting its package and check the existing native TOX count assertion, source properties, heading, cached entry and bookmark link. Verify the same TOC owner, level form and ordered body after Worker graph transport and ODT export/reopen. Run focused existing Writer section, text filter, bookmark and Worker tests, Office typecheck, focused lint and formatting, dependency, provenance, and Writer/shared registry checks."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T11:53:07.148Z — VERIFY — ok

    By: CODER

    Note: Tests  43 passed (43). Original SimpleTOC, typecheck, lint, formatting, dependencies, provenance and Writer/shared inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T11:38:34.453Z, excerpt_hash=sha256:5338c5bb585512c217a6b749bc5d5d6b45b70f7fd26c0c55a49091ad9f6656ca

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271138-BPVCFM/blueprint/resolved-snapshot.json
    - old_digest: 07d2c0bf943d31caba1c0af86c65114612dec8b25782c5e633beda96d4761a05
    - current_digest: 07d2c0bf943d31caba1c0af86c65114612dec8b25782c5e633beda96d4761a05
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271138-BPVCFM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271138-BPVCFM
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Preserve Writer table of contents in ODT and Worker

Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task.

## Scope

- In scope: Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task.
- Out of scope: unrelated refactors not required for "Preserve Writer table of contents in ODT and Worker".

## Plan

1. Port the represented Writer SwTOXBase, SwForm, SwTOXBaseSection and SwXDocumentIndex ownership, reusing native section nodes and paragraph import. 2. Route TOC index source, title, templates and cached body through the original xmloff contexts, section export and Worker records. 3. Verify the pinned SimpleTOC package and related existing suites, review original defaults and document any suspicious source behavior.

## Verify Steps

Open the pinned SimpleTOC.odt without rewriting its package and check the existing native TOX count assertion, source properties, heading, cached entry and bookmark link. Verify the same TOC owner, level form and ordered body after Worker graph transport and ODT export/reopen. Run focused existing Writer section, text filter, bookmark and Worker tests, Office typecheck, focused lint and formatting, dependency, provenance, and Writer/shared registry checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T11:53:07.148Z — VERIFY — ok

By: CODER

Note: Tests  43 passed (43). Original SimpleTOC, typecheck, lint, formatting, dependencies, provenance and Writer/shared inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T11:38:34.453Z, excerpt_hash=sha256:5338c5bb585512c217a6b749bc5d5d6b45b70f7fd26c0c55a49091ad9f6656ca

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271138-BPVCFM/blueprint/resolved-snapshot.json
- old_digest: 07d2c0bf943d31caba1c0af86c65114612dec8b25782c5e633beda96d4761a05
- current_digest: 07d2c0bf943d31caba1c0af86c65114612dec8b25782c5e633beda96d4761a05
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271138-BPVCFM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271138-BPVCFM
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
