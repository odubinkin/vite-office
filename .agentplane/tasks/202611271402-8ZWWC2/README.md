---
id: "202611271402-8ZWWC2"
title: "Preserve native Writer ruby text and styled ranges through ODT"
result_summary: "Keep native Writer ruby properties and nesting through ODT and the Worker."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "ruby"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T14:03:17.920Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T15:11:02.459Z"
  updated_by: "CODER"
  note: "Tests  333 passed (333). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T15:11:04.043Z"
  updated_by: "EVALUATOR"
  note: "The original ruby-position.odt retains its inter-character ruby position through the Worker and ODT reopen. The original tdf168817 fixture retains the Unicode hyperlink inside the ruby base."
  evaluated_sha: "2eda752120c585c1a2e5ca7443f432a23470ad86"
  blueprint_digest: "9da2759dd9084e3f93ea0921d0e5043d7ec3b82d9b4b24d7e76ad510c46e822a"
  evidence_refs:
    - ".agentplane/tasks/202611271402-8ZWWC2/README.md"
    - ".agentplane/tasks/202611271402-8ZWWC2/quality/20261127-151104043-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271402-8ZWWC2/quality/20261127-151104043-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271402-8ZWWC2/quality/20261127-151104043-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271402-8ZWWC2/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/8ZWWC2/verification.md"
    - "2eda752120c585c1a2e5ca7443f432a23470ad86"
  findings:
    - "WRITER-768 records the accepted incompatible Any ruby values. Existing character, nested hyperlink, ODT and Worker tests pass."
commit:
  hash: "2eda752120c585c1a2e5ca7443f432a23470ad86"
  message: "🧩 8ZWWC2 writer: preserve native ruby ODT ranges"
comments:
  -
    author: "CODER"
    body: "Start: Trace the pinned Writer ruby attribute, ODF styles and containment of linked text."
  -
    author: "CODER"
    body: "Verified: The original ruby-position.odt retains its inter-character ruby position through the Worker and ODT reopen. The original tdf168817 fixture retains the Unicode hyperlink inside the ruby base."
events:
  -
    type: "status"
    at: "2026-11-27T14:03:18.526Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Trace the pinned Writer ruby attribute, ODF styles and containment of linked text."
  -
    type: "verify"
    at: "2026-11-27T15:11:02.459Z"
    author: "CODER"
    state: "ok"
    note: "Tests  333 passed (333). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  -
    type: "status"
    at: "2026-11-27T15:14:52.047Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: The original ruby-position.odt retains its inter-character ruby position through the Worker and ODT reopen. The original tdf168817 fixture retains the Unicode hyperlink inside the ruby base."
doc_version: 3
doc_updated_at: "2026-11-27T15:14:52.049Z"
doc_updated_by: "CODER"
description: "Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures."
sections:
  Summary: |-
    Preserve native Writer ruby text and styled ranges through ODT

    Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures.
  Scope: |-
    - In scope: Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures.
    - Out of scope: unrelated refactors not required for "Preserve native Writer ruby text and styled ranges through ODT".
  Plan: "Follow pinned SwFormatRuby, SwTextRuby, MakeTextAttr and the original Ruby UNO and ODF property contracts. Add the native nesting attribute to the represented pool/WhichId, style and edit paths. Apply the shared ruby base/text SAX contexts and chart the ordinary canonical Writer portion ordering, including a nested hyperlink. Transfer the independent footing, reading text and style through the genuine Writer graph and round-trip ODT. Port ruby-position.odt and the ODF markup of ruby+hyperlink.fodt and run focused hint, paragraph, ODT and Worker checks. Record any suspicious behavior from the pinned native implementation and keep current browser lifecycle."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Writer ruby text and styled ranges through ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Writer ruby text and styled ranges through ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T15:11:02.459Z — VERIFY — ok

    By: CODER

    Note: Tests  333 passed (333). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T14:03:18.526Z, excerpt_hash=sha256:4dfaa11a734c8fc8d5daccd19cf60fdde1819b888f8d840ee184c4f045938f06

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271402-8ZWWC2/blueprint/resolved-snapshot.json
    - old_digest: 9da2759dd9084e3f93ea0921d0e5043d7ec3b82d9b4b24d7e76ad510c46e822a
    - current_digest: 9da2759dd9084e3f93ea0921d0e5043d7ec3b82d9b4b24d7e76ad510c46e822a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271402-8ZWWC2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271402-8ZWWC2
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

Preserve native Writer ruby text and styled ranges through ODT

Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures.

## Scope

- In scope: Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures.
- Out of scope: unrelated refactors not required for "Preserve native Writer ruby text and styled ranges through ODT".

## Plan

Follow pinned SwFormatRuby, SwTextRuby, MakeTextAttr and the original Ruby UNO and ODF property contracts. Add the native nesting attribute to the represented pool/WhichId, style and edit paths. Apply the shared ruby base/text SAX contexts and chart the ordinary canonical Writer portion ordering, including a nested hyperlink. Transfer the independent footing, reading text and style through the genuine Writer graph and round-trip ODT. Port ruby-position.odt and the ODF markup of ruby+hyperlink.fodt and run focused hint, paragraph, ODT and Worker checks. Record any suspicious behavior from the pinned native implementation and keep current browser lifecycle.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Writer ruby text and styled ranges through ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Writer ruby text and styled ranges through ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T15:11:02.459Z — VERIFY — ok

By: CODER

Note: Tests  333 passed (333). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T14:03:18.526Z, excerpt_hash=sha256:4dfaa11a734c8fc8d5daccd19cf60fdde1819b888f8d840ee184c4f045938f06

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271402-8ZWWC2/blueprint/resolved-snapshot.json
- old_digest: 9da2759dd9084e3f93ea0921d0e5043d7ec3b82d9b4b24d7e76ad510c46e822a
- current_digest: 9da2759dd9084e3f93ea0921d0e5043d7ec3b82d9b4b24d7e76ad510c46e822a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271402-8ZWWC2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271402-8ZWWC2
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
