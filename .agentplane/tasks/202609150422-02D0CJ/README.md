---
id: "202609150422-02D0CJ"
title: "Align Writer ODT font and style round-trip with LibreOffice"
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
  updated_at: "2026-09-15T04:22:42.446Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T04:49:01.606Z"
  updated_by: "CODER"
  note: "Full npm run verify passed after implementation commit f5e65e1470fc; 282 application tests and 84 inventory tests passed at 100% coverage, 9 browser E2E tests passed, static build and all repository gates passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T04:49:07.115Z"
  updated_by: "EVALUATOR"
  note: "Upstream-aligned Writer ODT font and paragraph-style round trip is implemented and fully verified."
  evaluated_sha: "f5e65e1470fce1a9e41edb606235bbd15fd72a05"
  blueprint_digest: "373d5ec2e8a802b1c815d1cc3be81357b628bc7247a2cbcca2a69898f9863f31"
  evidence_refs:
    - ".agentplane/tasks/202609150422-02D0CJ/README.md"
    - ".agentplane/tasks/202609150422-02D0CJ/quality/20260915-044907115-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150422-02D0CJ/quality/20260915-044907115-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150422-02D0CJ/quality/20260915-044907115-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150422-02D0CJ/blueprint/resolved-snapshot.json"
    - "npm run verify"
    - "commit f5e65e1470fc"
  findings:
    - "All 126 built-in styles retain encoded ODF identities, parent/follow links, and selected font families across open-save-reopen."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement upstream-compatible Writer ODT font-face declarations, style naming, hierarchy import/export, and open-save-reopen verification."
events:
  -
    type: "status"
    at: "2026-09-15T04:22:54.718Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-compatible Writer ODT font-face declarations, style naming, hierarchy import/export, and open-save-reopen verification."
  -
    type: "verify"
    at: "2026-09-15T04:49:01.606Z"
    author: "CODER"
    state: "ok"
    note: "Full npm run verify passed after implementation commit f5e65e1470fc; 282 application tests and 84 inventory tests passed at 100% coverage, 9 browser E2E tests passed, static build and all repository gates passed."
doc_version: 3
doc_updated_at: "2026-09-15T04:49:01.660Z"
doc_updated_by: "CODER"
description: "Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows."
sections:
  Summary: |-
    Align Writer ODT font and style round-trip with LibreOffice

    Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows.
  Scope: |-
    - In scope: Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows.
    - Out of scope: unrelated refactors not required for "Align Writer ODT font and style round-trip with LibreOffice".
  Plan: "1. Port LibreOffice-compatible ODF NCName encoding and decoding for built-in Writer paragraph style names. 2. Extend styles.xml and content.xml export with office:font-face-decls, style:font-face declarations, and style:font-name references while retaining fo:font-family compatibility. 3. Extend streaming import contexts to resolve declared font faces and all built-in paragraph parent/follow relationships from LibreOffice-shaped ODT. 4. Add fixture and round-trip tests for all built-ins, style hierarchy, style/direct fonts, open-save-reopen, and malformed declarations. 5. Update documentation, parity, runtime inventory, and provenance as required. 6. Run focused tests, npm run verify, ap doctor, and routing validation."
  Verify Steps: |-
    1. Run npm run test:coverage --workspace @vite-office/office. Expected: all Writer, xmloff, and UI tests pass with 100% statements, branches, functions, and lines.
    2. Run npm run typecheck and npm run lint. Expected: both complete without errors or warnings.
    3. Run npm run check:dependencies, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size. Expected: all repository structure gates pass.
    4. Run npm run test:e2e and npm run test:static. Expected: opening/editing/saving browser flows and the production static build pass.
    5. Inspect the ODT round-trip tests. Expected: all 126 built-in paragraph styles retain encoded ODF names, parent/follow hierarchy, and selected fonts through open-save-reopen using office:font-face-decls and style:font-name.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T04:49:01.606Z — VERIFY — ok

    By: CODER

    Note: Full npm run verify passed after implementation commit f5e65e1470fc; 282 application tests and 84 inventory tests passed at 100% coverage, 9 browser E2E tests passed, static build and all repository gates passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T04:39:43.121Z, excerpt_hash=sha256:5ffa19fe95dfdd89a166cc05ac896f90997f6156cb590e98f1edec0c902dbe48

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150422-02D0CJ/blueprint/resolved-snapshot.json
    - old_digest: 373d5ec2e8a802b1c815d1cc3be81357b628bc7247a2cbcca2a69898f9863f31
    - current_digest: 373d5ec2e8a802b1c815d1cc3be81357b628bc7247a2cbcca2a69898f9863f31
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150422-02D0CJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150422-02D0CJ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: Writer now imports pinned LibreOffice ODT font-face declarations and exports document-wide sorted font pools; all 126 built-in paragraph styles survive open-save-reopen with encoded names and hierarchy.
      Impact: Font selections and complete built-in style identity/hierarchy persist across ODT file workflows.
      Resolution: Added upstream-shaped font pool/import contexts, ODF name encoding, hierarchy validation, and dedicated round-trip coverage.
id_source: "generated"
---
## Summary

Align Writer ODT font and style round-trip with LibreOffice

Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows.

## Scope

- In scope: Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows.
- Out of scope: unrelated refactors not required for "Align Writer ODT font and style round-trip with LibreOffice".

## Plan

1. Port LibreOffice-compatible ODF NCName encoding and decoding for built-in Writer paragraph style names. 2. Extend styles.xml and content.xml export with office:font-face-decls, style:font-face declarations, and style:font-name references while retaining fo:font-family compatibility. 3. Extend streaming import contexts to resolve declared font faces and all built-in paragraph parent/follow relationships from LibreOffice-shaped ODT. 4. Add fixture and round-trip tests for all built-ins, style hierarchy, style/direct fonts, open-save-reopen, and malformed declarations. 5. Update documentation, parity, runtime inventory, and provenance as required. 6. Run focused tests, npm run verify, ap doctor, and routing validation.

## Verify Steps

1. Run npm run test:coverage --workspace @vite-office/office. Expected: all Writer, xmloff, and UI tests pass with 100% statements, branches, functions, and lines.
2. Run npm run typecheck and npm run lint. Expected: both complete without errors or warnings.
3. Run npm run check:dependencies, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size. Expected: all repository structure gates pass.
4. Run npm run test:e2e and npm run test:static. Expected: opening/editing/saving browser flows and the production static build pass.
5. Inspect the ODT round-trip tests. Expected: all 126 built-in paragraph styles retain encoded ODF names, parent/follow hierarchy, and selected fonts through open-save-reopen using office:font-face-decls and style:font-name.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T04:49:01.606Z — VERIFY — ok

By: CODER

Note: Full npm run verify passed after implementation commit f5e65e1470fc; 282 application tests and 84 inventory tests passed at 100% coverage, 9 browser E2E tests passed, static build and all repository gates passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T04:39:43.121Z, excerpt_hash=sha256:5ffa19fe95dfdd89a166cc05ac896f90997f6156cb590e98f1edec0c902dbe48

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150422-02D0CJ/blueprint/resolved-snapshot.json
- old_digest: 373d5ec2e8a802b1c815d1cc3be81357b628bc7247a2cbcca2a69898f9863f31
- current_digest: 373d5ec2e8a802b1c815d1cc3be81357b628bc7247a2cbcca2a69898f9863f31
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150422-02D0CJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150422-02D0CJ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: Writer now imports pinned LibreOffice ODT font-face declarations and exports document-wide sorted font pools; all 126 built-in paragraph styles survive open-save-reopen with encoded names and hierarchy.
  Impact: Font selections and complete built-in style identity/hierarchy persist across ODT file workflows.
  Resolution: Added upstream-shaped font pool/import contexts, ODF name encoding, hierarchy validation, and dedicated round-trip coverage.
