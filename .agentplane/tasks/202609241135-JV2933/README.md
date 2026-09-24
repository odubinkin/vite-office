---
id: "202609241135-JV2933"
title: "F4 Place SAX parser and platform adaptations at correct boundaries"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202609241135-RF2T8B"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T12:17:26.165Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T12:28:47.484Z"
  updated_by: "CODER"
  note: "F4 ownership split and exact provenance/inventory mappings verified by npm run verify and git diff --check."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T12:29:11.387Z"
  updated_by: "EVALUATOR"
  note: "F4 ownership split verified."
  evaluated_sha: "e61c9c767ae6e3a2c39d8a7ec190d991ae6987c1"
  blueprint_digest: "f7accd33451087f531e61ab009eed69748f5717d135641f58e63d68e8c10f0ba"
  evidence_refs:
    - ".agentplane/tasks/202609241135-JV2933/README.md"
    - ".agentplane/tasks/202609241135-JV2933/quality/20260924-122911387-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241135-JV2933/quality/20260924-122911387-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241135-JV2933/quality/20260924-122911387-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241135-JV2933/blueprint/resolved-snapshot.json"
    - "apps/office/src/sax/source/fastparser/fastparser.ts"
    - "apps/office/src/xmloff/source/core/xml-parser.ts"
    - "docs/program/source-provenance.json"
  findings:
    - "SAX event engine now resides under sax; ODF contexts stay under xmloff; browser keyboard, locale and Worker adapters reside under framework/browser with exact provenance and inventory records."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: correct F4 SAX and framework platform ownership against pinned modules while retaining xmloff contexts."
events:
  -
    type: "status"
    at: "2026-09-24T12:17:27.077Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct F4 SAX and framework platform ownership against pinned modules while retaining xmloff contexts."
  -
    type: "verify"
    at: "2026-09-24T12:28:47.484Z"
    author: "CODER"
    state: "ok"
    note: "F4 ownership split and exact provenance/inventory mappings verified by npm run verify and git diff --check."
doc_version: 3
doc_updated_at: "2026-09-24T12:28:48.247Z"
doc_updated_by: "CODER"
description: "Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories."
sections:
  Summary: |-
    F4 Place SAX parser and platform adaptations at correct boundaries

    Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories.
  Scope: |-
    - In scope: Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories.
    - Out of scope: unrelated refactors not required for "F4 Place SAX parser and platform adaptations at correct boundaries".
  Plan: |-
    1. Compare F4 files with pinned sax fastparser and framework accelerator/service owners, identifying platform-only code.
    2. Split and move only actual parser engine or browser adaptation; update imports and remove stale modules.
    3. Update existing provenance/inventory/source-tree data and run focused plus full verification.
  Verify Steps: |-
    1. General SAX parser and parser tests resolve under sax/source/fastparser; xmloff import contexts stay in xmloff. DOM keyboard, Intl fallback and Worker protocol resolve under framework/browser without upstream model imports from browser.
    2. Existing parser, keyboard, localization and Worker tests pass; provenance, source-tree and runtime inventory data reference active exact owners.
    3. npm run verify and git diff --check pass.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T12:28:47.484Z — VERIFY — ok

    By: CODER

    Note: F4 ownership split and exact provenance/inventory mappings verified by npm run verify and git diff --check.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:28:42.475Z, excerpt_hash=sha256:324c4e2a448c6575c9fb15267c97d75f74e4ada39c92c00992ada605e23f6e59

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-JV2933/blueprint/resolved-snapshot.json
    - old_digest: f7accd33451087f531e61ab009eed69748f5717d135641f58e63d68e8c10f0ba
    - current_digest: f7accd33451087f531e61ab009eed69748f5717d135641f58e63d68e8c10f0ba
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241135-JV2933

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241135-JV2933
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
  Findings: "F4 split: SAX event delivery and limits moved to sax/source/fastparser/fastparser.ts; tokenized ODF import contexts remain in xmloff/source/core/xml-parser.ts. Browser keyboard, locale and Worker adapters moved under framework/browser. Updated imports, source-tree, provenance and runtime inventory data; added sax to the static dependency graph. Focused tests: 13 passed. npm run verify: passed (482 office tests, 98 inventory tests, 14 browser E2E tests, both coverage suites 100%, build and all gates). git diff --check: passed. No network used."
id_source: "generated"
---
## Summary

F4 Place SAX parser and platform adaptations at correct boundaries

Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories.

## Scope

- In scope: Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories.
- Out of scope: unrelated refactors not required for "F4 Place SAX parser and platform adaptations at correct boundaries".

## Plan

1. Compare F4 files with pinned sax fastparser and framework accelerator/service owners, identifying platform-only code.
2. Split and move only actual parser engine or browser adaptation; update imports and remove stale modules.
3. Update existing provenance/inventory/source-tree data and run focused plus full verification.

## Verify Steps

1. General SAX parser and parser tests resolve under sax/source/fastparser; xmloff import contexts stay in xmloff. DOM keyboard, Intl fallback and Worker protocol resolve under framework/browser without upstream model imports from browser.
2. Existing parser, keyboard, localization and Worker tests pass; provenance, source-tree and runtime inventory data reference active exact owners.
3. npm run verify and git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T12:28:47.484Z — VERIFY — ok

By: CODER

Note: F4 ownership split and exact provenance/inventory mappings verified by npm run verify and git diff --check.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:28:42.475Z, excerpt_hash=sha256:324c4e2a448c6575c9fb15267c97d75f74e4ada39c92c00992ada605e23f6e59

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-JV2933/blueprint/resolved-snapshot.json
- old_digest: f7accd33451087f531e61ab009eed69748f5717d135641f58e63d68e8c10f0ba
- current_digest: f7accd33451087f531e61ab009eed69748f5717d135641f58e63d68e8c10f0ba
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241135-JV2933

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241135-JV2933
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

F4 split: SAX event delivery and limits moved to sax/source/fastparser/fastparser.ts; tokenized ODF import contexts remain in xmloff/source/core/xml-parser.ts. Browser keyboard, locale and Worker adapters moved under framework/browser. Updated imports, source-tree, provenance and runtime inventory data; added sax to the static dependency graph. Focused tests: 13 passed. npm run verify: passed (482 office tests, 98 inventory tests, 14 browser E2E tests, both coverage suites 100%, build and all gates). git diff --check: passed. No network used.
