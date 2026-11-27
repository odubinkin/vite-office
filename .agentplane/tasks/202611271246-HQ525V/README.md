---
id: "202611271246-HQ525V"
title: "Round-trip native Writer alphabetical and user index sections in ODT"
result_summary: "Preserve native alphabetical and user index sections."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
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
  state: "ok"
  updated_at: "2026-11-27T14:44:03.488Z"
  updated_by: "CODER"
  note: "Tests  32 passed (32). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T14:44:03.995Z"
  updated_by: "EVALUATOR"
  note: "The original tdf144672.odt and tdf153636.odt retained the original alphabetical separators and levels, the main-entry character style and collation settings, the user-index flags, and the stored title and entries across the Worker and ODT reopen."
  evaluated_sha: "ffda762b101061f6aa8ed68751278bb4ad13597d"
  blueprint_digest: "f019061d6475ed0a48208cc5553a28bbf94339927d4ae2ec1b92ecbb5cb9181c"
  evidence_refs:
    - ".agentplane/tasks/202611271246-HQ525V/README.md"
    - ".agentplane/tasks/202611271246-HQ525V/quality/20261127-144403995-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271246-HQ525V/quality/20261127-144403995-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271246-HQ525V/quality/20261127-144403995-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271246-HQ525V/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/HQ525V/verification.md"
    - "ffda762b101061f6aa8ed68751278bb4ad13597d"
  findings:
    - "This task covers the represented alphabetical and user index source and cached sections. Runtime index generation, bibliography and the other index sources remain outside its scope."
commit:
  hash: "ffda762b101061f6aa8ed68751278bb4ad13597d"
  message: "🧩 HQ525V writer: preserve native alphabetical and user index sections"
comments:
  -
    author: "CODER"
    body: "Start: trace the actual user and alphabetical index sources and forms with the pinned graph and stage Writer changes independently of the running full verification."
  -
    author: "CODER"
    body: "Verified: The original tdf144672.odt and tdf153636.odt retained the original alphabetical separators and levels, the main-entry character style and collation settings, the user-index flags, and the stored title and entries across the Worker and ODT reopen."
events:
  -
    type: "status"
    at: "2026-11-27T12:46:27.670Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: trace the actual user and alphabetical index sources and forms with the pinned graph and stage Writer changes independently of the running full verification."
  -
    type: "verify"
    at: "2026-11-27T14:44:03.488Z"
    author: "CODER"
    state: "ok"
    note: "Tests  32 passed (32). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  -
    type: "status"
    at: "2026-11-27T14:45:03.043Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: The original tdf144672.odt and tdf153636.odt retained the original alphabetical separators and levels, the main-entry character style and collation settings, the user-index flags, and the stored title and entries across the Worker and ODT reopen."
doc_version: 3
doc_updated_at: "2026-11-27T14:45:03.043Z"
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
    ### 2026-11-27T14:44:03.488Z — VERIFY — ok

    By: CODER

    Note: Tests  32 passed (32). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:46:27.670Z, excerpt_hash=sha256:92fb98059ddda4f276353e3f677d0953f55f3c1748873fc3e5b80167b9fa9e4f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271246-HQ525V/blueprint/resolved-snapshot.json
    - old_digest: f019061d6475ed0a48208cc5553a28bbf94339927d4ae2ec1b92ecbb5cb9181c
    - current_digest: f019061d6475ed0a48208cc5553a28bbf94339927d4ae2ec1b92ecbb5cb9181c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271246-HQ525V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271246-HQ525V
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
### 2026-11-27T14:44:03.488Z — VERIFY — ok

By: CODER

Note: Tests  32 passed (32). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:46:27.670Z, excerpt_hash=sha256:92fb98059ddda4f276353e3f677d0953f55f3c1748873fc3e5b80167b9fa9e4f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271246-HQ525V/blueprint/resolved-snapshot.json
- old_digest: f019061d6475ed0a48208cc5553a28bbf94339927d4ae2ec1b92ecbb5cb9181c
- current_digest: f019061d6475ed0a48208cc5553a28bbf94339927d4ae2ec1b92ecbb5cb9181c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271246-HQ525V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271246-HQ525V
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
