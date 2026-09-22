---
id: "202609220708-G33WPE"
title: "Expand Writer ODF contexts for P1"
result_summary: "verified-202609220708-G33WPE"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202609220708-E20A7K"
tags:
  - "code"
  - "odt"
  - "parity"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check"
  - "npm run test:coverage && npm run test:e2e"
  - "npm run test:inventory:coverage && npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity"
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T07:09:55.415Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-22T10:53:36.110Z"
  updated_by: "CODER"
  note: "verified-202609220708-G33WPE"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-22T10:53:15.191Z"
  updated_by: "EVALUATOR"
  note: "P1.16 preserves canonical Writer ownership while completing the modeled ODT property surface."
  evaluated_sha: "0aef53dda666112fa057fc2c0c9a9b1054f348cc"
  blueprint_digest: "8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65"
  evidence_refs:
    - ".agentplane/tasks/202609220708-G33WPE/README.md"
    - ".agentplane/tasks/202609220708-G33WPE/quality/20260922-105315191-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609220708-G33WPE/quality/20260922-105315191-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609220708-G33WPE/quality/20260922-105315191-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609220708-G33WPE/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/xml/odt-property-roundtrip.test.ts"
    - "apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts"
    - "npm run verify"
  findings:
    - "Foreground/highlight colors and tab/keep/line-number paragraph items round-trip through upstream-shaped xmloff contexts; unsupported structural families remain rejected until SwDoc owners exist."
commit:
  hash: "0aef53dda666112fa057fc2c0c9a9b1054f348cc"
  message: "🚧 G33WPE task: implement upstream-shaped Writer ODT properties"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: verified-202609220708-G33WPE. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-22T10:12:40.796Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-22T10:52:51.322Z"
    author: "CODER"
    state: "ok"
    note: "Verified Writer ODT pooled-property import/export against pinned xmloff/sw mappings: 78 files and 370 application tests at 100% coverage; 34 inventory files and 96 tests at 100%; 11 browser E2E tests; build/static, lint, typecheck, dependency, docs, file-size, source-tree, source-provenance (154 modules/97 mapped), invariants (34), parity (45/45), formatting, and diff checks pass."
  -
    type: "verify"
    at: "2026-09-22T10:53:05.698Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220708-G33WPE"
  -
    type: "verify"
    at: "2026-09-22T10:53:36.110Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220708-G33WPE"
  -
    type: "status"
    at: "2026-09-22T10:53:36.248Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609220708-G33WPE. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-22T10:53:36.249Z"
doc_updated_by: "CODER"
description: "Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family."
sections:
  Summary: |-
    Expand Writer ODF contexts for P1

    Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family.
  Scope: |-
    - In scope: Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family.
    - Out of scope: unrelated refactors not required for "Expand Writer ODF contexts for P1".
  Plan: |-
    1. Audit the implemented Writer graph against pinned xmloff/sw import-export contexts and fixtures, then define dependency-ordered bounded additions.
    2. Extend paragraph/character properties, styles/automatic styles, lists/outline, sections, tables, fields, frames/images, annotations/redlines, metadata/settings, and supported embedded objects only after their upstream-shaped model owner exists.
    3. Reuse canonical graph serialization and keep Worker/browser envelopes outside filter/model contracts.
    4. Add pinned LibreOffice fixtures and differential import-export-import assertions for each supported addition.
    5. Update affected inventory/provenance/docs and record unsupported platform or feature boundaries explicitly.
  Verify Steps: |-
    1. Run focused ODF parser/context/filter and fixture round-trip tests. Expected: every added model item preserves supported LibreOffice semantics through import-export-import.
    2. Run npm run test:coverage && npm run test:e2e && npm run test:inventory:coverage. Expected: application, browser, and inventory suites pass.
    3. Run npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity. Expected: upstream owners, invariants, and evidence resolve.
    4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-22T10:52:51.322Z — VERIFY — ok

    By: CODER

    Note: Verified Writer ODT pooled-property import/export against pinned xmloff/sw mappings: 78 files and 370 application tests at 100% coverage; 34 inventory files and 96 tests at 100%; 11 browser E2E tests; build/static, lint, typecheck, dependency, docs, file-size, source-tree, source-provenance (154 modules/97 mapped), invariants (34), parity (45/45), formatting, and diff checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T10:12:40.796Z, excerpt_hash=sha256:8e8ae9eb3678b86a0bdad71a873221163aa824c2681fed3512e8480d589f76f1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-G33WPE/blueprint/resolved-snapshot.json
    - old_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
    - current_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220708-G33WPE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609220708-G33WPE
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T10:53:05.698Z — VERIFY — ok

    By: CODER

    Note: verified-202609220708-G33WPE
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T10:52:51.408Z, excerpt_hash=sha256:8e8ae9eb3678b86a0bdad71a873221163aa824c2681fed3512e8480d589f76f1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-G33WPE/blueprint/resolved-snapshot.json
    - old_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
    - current_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220708-G33WPE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220708-G33WPE --result verified-202609220708-G33WPE --commit 0aef53dda666112fa057fc2c0c9a9b1054f348cc
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T10:53:36.110Z — VERIFY — ok

    By: CODER

    Note: verified-202609220708-G33WPE
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T10:53:05.767Z, excerpt_hash=sha256:8e8ae9eb3678b86a0bdad71a873221163aa824c2681fed3512e8480d589f76f1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-G33WPE/blueprint/resolved-snapshot.json
    - old_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
    - current_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220708-G33WPE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220708-G33WPE --result verified-202609220708-G33WPE --commit e4c7f617fcb4939a445a925d3e6a61b610e1e86f
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
    - Observation: All currently modeled paragraph and character items now survive ODT import-export-import; unmodeled structural families remain explicitly unsupported.
      Impact: P1.16 closes without filter-owned tables, sections, fields, frames, redlines, or embedded-object DTOs.
      Resolution: Added upstream-shaped XMLTextPropertySetContext tab-stop ownership, color/highlight and paragraph-property mappings, strict validation, browser projections, differential tests, and updated inventory/provenance/docs.
id_source: "generated"
---
## Summary

Expand Writer ODF contexts for P1

Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family.

## Scope

- In scope: Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family.
- Out of scope: unrelated refactors not required for "Expand Writer ODF contexts for P1".

## Plan

1. Audit the implemented Writer graph against pinned xmloff/sw import-export contexts and fixtures, then define dependency-ordered bounded additions.
2. Extend paragraph/character properties, styles/automatic styles, lists/outline, sections, tables, fields, frames/images, annotations/redlines, metadata/settings, and supported embedded objects only after their upstream-shaped model owner exists.
3. Reuse canonical graph serialization and keep Worker/browser envelopes outside filter/model contracts.
4. Add pinned LibreOffice fixtures and differential import-export-import assertions for each supported addition.
5. Update affected inventory/provenance/docs and record unsupported platform or feature boundaries explicitly.

## Verify Steps

1. Run focused ODF parser/context/filter and fixture round-trip tests. Expected: every added model item preserves supported LibreOffice semantics through import-export-import.
2. Run npm run test:coverage && npm run test:e2e && npm run test:inventory:coverage. Expected: application, browser, and inventory suites pass.
3. Run npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity. Expected: upstream owners, invariants, and evidence resolve.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-22T10:52:51.322Z — VERIFY — ok

By: CODER

Note: Verified Writer ODT pooled-property import/export against pinned xmloff/sw mappings: 78 files and 370 application tests at 100% coverage; 34 inventory files and 96 tests at 100%; 11 browser E2E tests; build/static, lint, typecheck, dependency, docs, file-size, source-tree, source-provenance (154 modules/97 mapped), invariants (34), parity (45/45), formatting, and diff checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T10:12:40.796Z, excerpt_hash=sha256:8e8ae9eb3678b86a0bdad71a873221163aa824c2681fed3512e8480d589f76f1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-G33WPE/blueprint/resolved-snapshot.json
- old_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
- current_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220708-G33WPE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609220708-G33WPE
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T10:53:05.698Z — VERIFY — ok

By: CODER

Note: verified-202609220708-G33WPE
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T10:52:51.408Z, excerpt_hash=sha256:8e8ae9eb3678b86a0bdad71a873221163aa824c2681fed3512e8480d589f76f1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-G33WPE/blueprint/resolved-snapshot.json
- old_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
- current_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220708-G33WPE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220708-G33WPE --result verified-202609220708-G33WPE --commit 0aef53dda666112fa057fc2c0c9a9b1054f348cc
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T10:53:36.110Z — VERIFY — ok

By: CODER

Note: verified-202609220708-G33WPE
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T10:53:05.767Z, excerpt_hash=sha256:8e8ae9eb3678b86a0bdad71a873221163aa824c2681fed3512e8480d589f76f1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-G33WPE/blueprint/resolved-snapshot.json
- old_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
- current_digest: 8777af47a54c09a3642acf3fb488c8f7cabe76cbf9009d40a23acb2defeb1f65
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220708-G33WPE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220708-G33WPE --result verified-202609220708-G33WPE --commit e4c7f617fcb4939a445a925d3e6a61b610e1e86f
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

- Observation: All currently modeled paragraph and character items now survive ODT import-export-import; unmodeled structural families remain explicitly unsupported.
  Impact: P1.16 closes without filter-owned tables, sections, fields, frames, redlines, or embedded-object DTOs.
  Resolution: Added upstream-shaped XMLTextPropertySetContext tab-stop ownership, color/highlight and paragraph-property mappings, strict validation, browser projections, differential tests, and updated inventory/provenance/docs.
