---
id: "202609141614-R0Y17Q"
title: "Replace the XML intermediate architecture"
result_summary: "verified-202609141614-R0Y17Q"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T16:14:37.578Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T16:58:21.897Z"
  updated_by: "CODER"
  note: "verified-202609141614-R0Y17Q"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T16:57:44.999Z"
  updated_by: "EVALUATOR"
  note: "Workstream 6 implements the approved upstream-shaped streaming XML architecture and all declared verification gates pass."
  evaluated_sha: "8464f7f6a6157d9994ff3c73e8513269cb2b86c7"
  blueprint_digest: "1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc"
  evidence_refs:
    - ".agentplane/tasks/202609141614-R0Y17Q/README.md"
    - ".agentplane/tasks/202609141614-R0Y17Q/quality/20260914-165744999-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609141614-R0Y17Q/quality/20260914-165744999-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609141614-R0Y17Q/quality/20260914-165744999-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609141614-R0Y17Q/blueprint/resolved-snapshot.json"
    - "apps/office/src/xmloff/source/core/xml-parser.ts"
    - "apps/office/src/sw/source/filter/xml/odt-scale.test.ts"
    - "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts"
  findings:
    - "No retained XML tree or complete ODF paragraph document DTO remains; import/export operate against canonical Writer state with bounded contexts and explicit policies."
commit:
  hash: "4bb0aac72fc9260ed77591dd404488e9755a394c"
  message: "🧪 R0Y17Q task: persist verification evidence"
comments:
  -
    author: "CODER"
    body: "Start: Implementing Workstream 6 with tokenized SAX contexts, direct temporary-SwDoc import, direct model-aware export, and bounded scale/cancellation verification from the pinned LibreOffice reference."
  -
    author: "CODER"
    body: "Verified: verified-202609141614-R0Y17Q. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-14T16:14:43.633Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implementing Workstream 6 with tokenized SAX contexts, direct temporary-SwDoc import, direct model-aware export, and bounded scale/cancellation verification from the pinned LibreOffice reference."
  -
    type: "verify"
    at: "2026-09-14T16:57:38.291Z"
    author: "TESTER"
    state: "ok"
    note: "Workstream 6 verified: office and inventory suites at 100% coverage, 3 pinned LibreOffice ODT fixtures, 9 Playwright workflows, static build, type/lint/format/architecture/docs/provenance/parity/routing gates all pass."
  -
    type: "verify"
    at: "2026-09-14T16:57:56.077Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609141614-R0Y17Q"
  -
    type: "verify"
    at: "2026-09-14T16:58:21.897Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609141614-R0Y17Q"
  -
    type: "status"
    at: "2026-09-14T16:58:22.091Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609141614-R0Y17Q. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-14T16:58:22.092Z"
doc_updated_by: "CODER"
description: "Implement Workstream 6 (P6.1-P6.4) from docs/program/vite-office-upstream-parity-plan.md using the pinned LibreOffice source as the behavioral and structural reference: tokenized SAX contexts, direct canonical SwDoc import, model-aware export, and scale/compatibility verification; no legacy stored-model compatibility."
sections:
  Summary: "Replace the retained ODF XML tree and OdfParagraph DTO pipeline with bounded SAX fast contexts that import directly into a temporary canonical SwDoc and export directly from Writer model state."
  Scope: "Implement P6.1-P6.4 in apps/office/src/xmloff/source/core, apps/office/src/xmloff/source/text, and apps/office/src/sw/source/filter/xml, plus focused tests and directly related program documentation/provenance mappings when required. Preserve the supported ODF behavior, transaction boundary, ZIP safety, and Worker cancellation. Use vendor/libreoffice-reference at the pinned baseline as the structural and behavioral reference. Remove obsolete intermediate-model code without backward compatibility for prior stored document representations."
  Plan: "1. Introduce namespace/local-name token tables, fast attributes, SAX context callbacks, unknown-element policy, resource limits, and deterministic stack ownership over saxes. 2. Rework styles, numbering, metadata, paragraphs, inline spans, whitespace, and lists into Writer import contexts that mutate only a temporary SwDoc. 3. Rework XML export contexts to read named styles, numbering rules, text nodes, pooled paragraph items, and inline hints directly from SwDoc. 4. Remove the OdfParagraph and retained OdfXmlElement/OdfXmlDocument paths. 5. Add parser ordering/limit tests, scale cases, malformed inputs, Worker cancellation, upstream fixtures, and semantic import-export-import assertions. 6. Run focused and repository-wide verification, record evidence, and finish the task."
  Verify Steps: "1. Run npm run test:coverage --workspace @vite-office/office -- --runInBand if supported, otherwise npm run test:coverage --workspace @vite-office/office. Expected: XML parser/context, ODT round-trip, Worker runtime/client, filter service, Writer model, and existing UI unit tests pass with coverage thresholds. 2. Run npm run typecheck. Expected: all workspace and tooling TypeScript checks pass. 3. Run npm run lint && npm run format:check && npm run check:dependencies && npm run check:docs && npm run check:file-size && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: architectural, documentation, size, provenance, and parity checks pass. 4. Run npm run test:e2e && npm run test:static. Expected: browser ODT workflows and production static build checks pass. 5. Run npm run test:inventory:coverage. Expected: inventory tooling remains green. 6. Run node .agentplane/policy/check-routing.mjs && ap doctor. Expected: repository workflow policy and Agentplane state pass. 7. Inspect git status --short --untracked-files=all. Expected: only intentional Workstream 6 artifacts plus the pre-existing Workstream 5 task README modification remain."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    - PASS: office Vitest coverage — 52 files, 261 tests, 100% statements/branches/functions/lines.
    - PASS: inventory Vitest coverage — 32 files, 84 tests, 100% statements/branches/functions/lines; all three pinned LibreOffice feature_text ODT fixtures pass semantic import/round-trip.
    - PASS: typecheck, ESLint, Prettier, dependency boundaries, JSDoc, file size, source tree, source provenance, and parity inventory.
    - PASS: Playwright — 9 browser workflows; static production build smoke.
    - PASS: Agentplane routing policy and doctor (no errors; one pre-existing workflow warning).

    ### 2026-09-14T16:57:38.291Z — VERIFY — ok

    By: TESTER

    Note: Workstream 6 verified: office and inventory suites at 100% coverage, 3 pinned LibreOffice ODT fixtures, 9 Playwright workflows, static build, type/lint/format/architecture/docs/provenance/parity/routing gates all pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:14:43.633Z, excerpt_hash=sha256:d41812695bb2684ee5916640ad363d2409c7b16159a1b23df64b191aa3478f97

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141614-R0Y17Q/blueprint/resolved-snapshot.json
    - old_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
    - current_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141614-R0Y17Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609141614-R0Y17Q
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T16:57:56.077Z — VERIFY — ok

    By: CODER

    Note: verified-202609141614-R0Y17Q
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:57:38.372Z, excerpt_hash=sha256:d41812695bb2684ee5916640ad363d2409c7b16159a1b23df64b191aa3478f97

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141614-R0Y17Q/blueprint/resolved-snapshot.json
    - old_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
    - current_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141614-R0Y17Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609141614-R0Y17Q --result verified-202609141614-R0Y17Q --commit 8464f7f6a6157d9994ff3c73e8513269cb2b86c7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T16:58:21.897Z — VERIFY — ok

    By: CODER

    Note: verified-202609141614-R0Y17Q
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:57:56.154Z, excerpt_hash=sha256:d41812695bb2684ee5916640ad363d2409c7b16159a1b23df64b191aa3478f97

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141614-R0Y17Q/blueprint/resolved-snapshot.json
    - old_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
    - current_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141614-R0Y17Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609141614-R0Y17Q --result verified-202609141614-R0Y17Q --commit 4bb0aac72fc9260ed77591dd404488e9755a394c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the Workstream 6 implementation and task artifacts through a new approved change. The pre-existing Workstream 5 README modification must remain untouched. No migration or compatibility layer is required because the old intermediate/stored representation is intentionally unsupported."
  Findings: |-
    Implementation follows the pinned LibreOffice fast-parser/context split and keeps only bounded active-context, style-table, and numbering-rule state. The retained XML tree and complete OdfParagraph document DTO are removed; import mutates a temporary SwDoc and publishes only after success, while export performs definition and body passes over live model views. Known non-model ODF style/page/metadata subtrees use explicit ignore contexts; unknown content remains rejected. No stored document schema migration or backward-compatibility path was added. The pre-existing Workstream 5 README change was not included in this task's implementation diff.

    - Observation: Streaming SAX contexts import directly into a temporary SwDoc and export from live Writer views without the retained XML tree or complete paragraph DTO.
      Impact: P6.1-P6.4 acceptance criteria are covered, including scale, deep/many spans, malformed input, cancellation, list/style resolution, and semantic round-trip.
      Resolution: No residual blocker; explicit ignore contexts remain limited to known non-model ODF subtrees and unknown content is rejected.
extensions:
  implementation_commit:
    hash: "8464f7f6a6157d9994ff3c73e8513269cb2b86c7"
    message: "🚧 R0Y17Q task: implement Workstream 6 XML contexts"
id_source: "generated"
---
## Summary

Replace the retained ODF XML tree and OdfParagraph DTO pipeline with bounded SAX fast contexts that import directly into a temporary canonical SwDoc and export directly from Writer model state.

## Scope

Implement P6.1-P6.4 in apps/office/src/xmloff/source/core, apps/office/src/xmloff/source/text, and apps/office/src/sw/source/filter/xml, plus focused tests and directly related program documentation/provenance mappings when required. Preserve the supported ODF behavior, transaction boundary, ZIP safety, and Worker cancellation. Use vendor/libreoffice-reference at the pinned baseline as the structural and behavioral reference. Remove obsolete intermediate-model code without backward compatibility for prior stored document representations.

## Plan

1. Introduce namespace/local-name token tables, fast attributes, SAX context callbacks, unknown-element policy, resource limits, and deterministic stack ownership over saxes. 2. Rework styles, numbering, metadata, paragraphs, inline spans, whitespace, and lists into Writer import contexts that mutate only a temporary SwDoc. 3. Rework XML export contexts to read named styles, numbering rules, text nodes, pooled paragraph items, and inline hints directly from SwDoc. 4. Remove the OdfParagraph and retained OdfXmlElement/OdfXmlDocument paths. 5. Add parser ordering/limit tests, scale cases, malformed inputs, Worker cancellation, upstream fixtures, and semantic import-export-import assertions. 6. Run focused and repository-wide verification, record evidence, and finish the task.

## Verify Steps

1. Run npm run test:coverage --workspace @vite-office/office -- --runInBand if supported, otherwise npm run test:coverage --workspace @vite-office/office. Expected: XML parser/context, ODT round-trip, Worker runtime/client, filter service, Writer model, and existing UI unit tests pass with coverage thresholds. 2. Run npm run typecheck. Expected: all workspace and tooling TypeScript checks pass. 3. Run npm run lint && npm run format:check && npm run check:dependencies && npm run check:docs && npm run check:file-size && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: architectural, documentation, size, provenance, and parity checks pass. 4. Run npm run test:e2e && npm run test:static. Expected: browser ODT workflows and production static build checks pass. 5. Run npm run test:inventory:coverage. Expected: inventory tooling remains green. 6. Run node .agentplane/policy/check-routing.mjs && ap doctor. Expected: repository workflow policy and Agentplane state pass. 7. Inspect git status --short --untracked-files=all. Expected: only intentional Workstream 6 artifacts plus the pre-existing Workstream 5 task README modification remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
- PASS: office Vitest coverage — 52 files, 261 tests, 100% statements/branches/functions/lines.
- PASS: inventory Vitest coverage — 32 files, 84 tests, 100% statements/branches/functions/lines; all three pinned LibreOffice feature_text ODT fixtures pass semantic import/round-trip.
- PASS: typecheck, ESLint, Prettier, dependency boundaries, JSDoc, file size, source tree, source provenance, and parity inventory.
- PASS: Playwright — 9 browser workflows; static production build smoke.
- PASS: Agentplane routing policy and doctor (no errors; one pre-existing workflow warning).

### 2026-09-14T16:57:38.291Z — VERIFY — ok

By: TESTER

Note: Workstream 6 verified: office and inventory suites at 100% coverage, 3 pinned LibreOffice ODT fixtures, 9 Playwright workflows, static build, type/lint/format/architecture/docs/provenance/parity/routing gates all pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:14:43.633Z, excerpt_hash=sha256:d41812695bb2684ee5916640ad363d2409c7b16159a1b23df64b191aa3478f97

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141614-R0Y17Q/blueprint/resolved-snapshot.json
- old_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
- current_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141614-R0Y17Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609141614-R0Y17Q
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T16:57:56.077Z — VERIFY — ok

By: CODER

Note: verified-202609141614-R0Y17Q
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:57:38.372Z, excerpt_hash=sha256:d41812695bb2684ee5916640ad363d2409c7b16159a1b23df64b191aa3478f97

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141614-R0Y17Q/blueprint/resolved-snapshot.json
- old_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
- current_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141614-R0Y17Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609141614-R0Y17Q --result verified-202609141614-R0Y17Q --commit 8464f7f6a6157d9994ff3c73e8513269cb2b86c7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T16:58:21.897Z — VERIFY — ok

By: CODER

Note: verified-202609141614-R0Y17Q
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:57:56.154Z, excerpt_hash=sha256:d41812695bb2684ee5916640ad363d2409c7b16159a1b23df64b191aa3478f97

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141614-R0Y17Q/blueprint/resolved-snapshot.json
- old_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
- current_digest: 1376578e5affdb6b86cbe37e5f1f94dfb5be8116fd750b18c5d97c5e2f20e2cc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141614-R0Y17Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609141614-R0Y17Q --result verified-202609141614-R0Y17Q --commit 4bb0aac72fc9260ed77591dd404488e9755a394c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the Workstream 6 implementation and task artifacts through a new approved change. The pre-existing Workstream 5 README modification must remain untouched. No migration or compatibility layer is required because the old intermediate/stored representation is intentionally unsupported.

## Findings

Implementation follows the pinned LibreOffice fast-parser/context split and keeps only bounded active-context, style-table, and numbering-rule state. The retained XML tree and complete OdfParagraph document DTO are removed; import mutates a temporary SwDoc and publishes only after success, while export performs definition and body passes over live model views. Known non-model ODF style/page/metadata subtrees use explicit ignore contexts; unknown content remains rejected. No stored document schema migration or backward-compatibility path was added. The pre-existing Workstream 5 README change was not included in this task's implementation diff.

- Observation: Streaming SAX contexts import directly into a temporary SwDoc and export from live Writer views without the retained XML tree or complete paragraph DTO.
  Impact: P6.1-P6.4 acceptance criteria are covered, including scale, deep/many spans, malformed input, cancellation, list/style resolution, and semantic round-trip.
  Resolution: No residual blocker; explicit ignore contexts remain limited to known non-model ODF subtrees and unknown content is rejected.
