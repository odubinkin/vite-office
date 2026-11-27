---
id: "202611270722-HWX9NV"
title: "Align Writer ODT master-page style identity and references with LibreOffice"
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
  - "code"
verify:
  - "Run focused Writer ODT master-page, header/footer, paragraph-style and Worker round-trip tests."
  - "Run Office typecheck, scoped ESLint and format, dependency and provenance checks, Writer/shared registry invariants, routing and git diff checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:22:49.525Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:30:10.471Z"
  updated_by: "CODER"
  note: "101 focused Writer ODT, Worker and UNO cases pass, including the pinned default page-layout scenario; static and registry checks pass. See output/playwright/HWX9NV/verification.md."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:30:11.968Z"
  updated_by: "EVALUATOR"
  note: "Writer exports and resolves native master-page style identity consistently across ODT and Worker."
  evaluated_sha: "24dea702b5513a2556dbbf9c98f324b12c72305c"
  blueprint_digest: "c7a48cbca811caee052d14ccdd4bee5b5975f5c02304aa709b8f36f89fe9c098"
  evidence_refs:
    - ".agentplane/tasks/202611270722-HWX9NV/README.md"
    - ".agentplane/tasks/202611270722-HWX9NV/quality/20261127-073011968-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270722-HWX9NV/quality/20261127-073011968-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270722-HWX9NV/quality/20261127-073011968-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270722-HWX9NV/blueprint/resolved-snapshot.json"
    - "output/playwright/HWX9NV/verification.md"
    - "24dea702b5513a2556dbbf9c98f324b12c72305c"
  findings:
    - "Pinned master-page layout/follow fallback and paragraph PageDescName rules pass focused tests. Implementation: 24dea702b5513a2556dbbf9c98f324b12c72305c."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Align Writer ODT master-page identity and style links with the pinned native contracts."
events:
  -
    type: "status"
    at: "2026-11-27T07:22:49.910Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Align Writer ODT master-page identity and style links with the pinned native contracts."
  -
    type: "verify"
    at: "2026-11-27T07:30:10.471Z"
    author: "CODER"
    state: "ok"
    note: "101 focused Writer ODT, Worker and UNO cases pass, including the pinned default page-layout scenario; static and registry checks pass. See output/playwright/HWX9NV/verification.md."
doc_version: 3
doc_updated_at: "2026-11-27T07:30:10.627Z"
doc_updated_by: "CODER"
description: "Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks."
sections:
  Summary: |-
    Align Writer ODT master-page style identity and references with LibreOffice

    Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks.
  Scope: |-
    - In scope: Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks.
    - Out of scope: unrelated refactors not required for "Align Writer ODT master-page style identity and references with LibreOffice".
  Plan: |-
    1. Compare the native master-page context, display-name registration, layout lookup, FollowStyle and paragraph PageDescName assignment. Use the repository and pinned source graphs to locate the owners.
    2. Apply the original declarative master-page identity and resolution rules to the existing page-style, paragraph style and XML import/export entry points. Preserve the existing header/footer owner and package lifecycle.
    3. Update existing master-page assertions for the corrected behavior. Run the related Writer ODT, page-style and Worker tests and required static checks.
  Verify Steps: |-
    - Run existing Writer master-page, header/footer, paragraph style, declarations, ODT round-trip and related Worker filters. Exercise the pinned default page usage assertion and encoded page names through ODT and Worker.
    - Run Office typecheck, changed-file lint and format, dependencies, source provenance, Writer/shared inventory, routing, AgentPlane doctor and git diff checks.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:30:10.471Z — VERIFY — ok

    By: CODER

    Note: 101 focused Writer ODT, Worker and UNO cases pass, including the pinned default page-layout scenario; static and registry checks pass. See output/playwright/HWX9NV/verification.md.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:24:32.756Z, excerpt_hash=sha256:edb317690407b6c53a70cdcf6463efe7cc1f197f99fdba8fed2fe236942a250b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270722-HWX9NV/blueprint/resolved-snapshot.json
    - old_digest: c7a48cbca811caee052d14ccdd4bee5b5975f5c02304aa709b8f36f89fe9c098
    - current_digest: c7a48cbca811caee052d14ccdd4bee5b5975f5c02304aa709b8f36f89fe9c098
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270722-HWX9NV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270722-HWX9NV
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

Align Writer ODT master-page style identity and references with LibreOffice

Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks.

## Scope

- In scope: Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks.
- Out of scope: unrelated refactors not required for "Align Writer ODT master-page style identity and references with LibreOffice".

## Plan

1. Compare the native master-page context, display-name registration, layout lookup, FollowStyle and paragraph PageDescName assignment. Use the repository and pinned source graphs to locate the owners.
2. Apply the original declarative master-page identity and resolution rules to the existing page-style, paragraph style and XML import/export entry points. Preserve the existing header/footer owner and package lifecycle.
3. Update existing master-page assertions for the corrected behavior. Run the related Writer ODT, page-style and Worker tests and required static checks.

## Verify Steps

- Run existing Writer master-page, header/footer, paragraph style, declarations, ODT round-trip and related Worker filters. Exercise the pinned default page usage assertion and encoded page names through ODT and Worker.
- Run Office typecheck, changed-file lint and format, dependencies, source provenance, Writer/shared inventory, routing, AgentPlane doctor and git diff checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:30:10.471Z — VERIFY — ok

By: CODER

Note: 101 focused Writer ODT, Worker and UNO cases pass, including the pinned default page-layout scenario; static and registry checks pass. See output/playwright/HWX9NV/verification.md.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:24:32.756Z, excerpt_hash=sha256:edb317690407b6c53a70cdcf6463efe7cc1f197f99fdba8fed2fe236942a250b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270722-HWX9NV/blueprint/resolved-snapshot.json
- old_digest: c7a48cbca811caee052d14ccdd4bee5b5975f5c02304aa709b8f36f89fe9c098
- current_digest: c7a48cbca811caee052d14ccdd4bee5b5975f5c02304aa709b8f36f89fe9c098
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270722-HWX9NV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270722-HWX9NV
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
