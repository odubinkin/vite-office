---
id: "202609090351-3F3ZY7"
title: "Round-trip all implemented Writer features through ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-09T03:51:59.970Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-09T04:43:43.019Z"
  updated_by: "CODER"
  note: "verified-202609090351-3F3ZY7"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-09T04:43:58.779Z"
  updated_by: "EVALUATOR"
  note: "Writer ODT round-trip preserves every currently modeled document semantic and uses canonical SwDoc list ownership without obsolete-schema compatibility."
  evaluated_sha: "6f77bd2daa9267213c256c13bc5954e9a8550954"
  blueprint_digest: "440514145ba03248ab5132216bd4a75eefd4a782ed71b1473e8f663e9c410c4f"
  evidence_refs:
    - ".agentplane/tasks/202609090351-3F3ZY7/README.md"
    - ".agentplane/tasks/202609090351-3F3ZY7/quality/20260909-044358779-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609090351-3F3ZY7/quality/20260909-044358779-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609090351-3F3ZY7/quality/20260909-044358779-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609090351-3F3ZY7/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "Nested bullet/decimal lists, rule identities, levels, styles, alignment, whitespace, and direct formatting are covered by unit, package, and browser tests; unsupported ODF semantics and pre-v3 snapshots fail explicitly."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: align Writer list contracts with LibreOffice and implement lossless ODT list import/export with full feature round-trip coverage."
events:
  -
    type: "status"
    at: "2026-09-09T03:52:07.936Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align Writer list contracts with LibreOffice and implement lossless ODT list import/export with full feature round-trip coverage."
  -
    type: "verify"
    at: "2026-09-09T04:43:28.125Z"
    author: "CODER"
    state: "ok"
    note: "npm run verify passed: 165 Writer/app tests and 74 inventory tests at 100% coverage, 8 Playwright E2E tests, production/static builds, formatting, lint, typecheck, JSDoc, and file-size checks. Agentplane routing policy, task lint, and git diff checks passed."
  -
    type: "verify"
    at: "2026-09-09T04:43:43.019Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609090351-3F3ZY7"
doc_version: 3
doc_updated_at: "2026-09-09T04:43:43.097Z"
doc_updated_by: "CODER"
description: "Align Writer list core contracts with LibreOffice and implement lossless ODT import/export for every currently implemented document-semantic editor feature, including nested bullet and numbered lists combined with styles, alignment, whitespace, and direct character formatting."
sections:
  Summary: |-
    Round-trip all implemented Writer features through ODT

    Align Writer list core contracts with LibreOffice and implement lossless ODT import/export for every currently implemented document-semantic editor feature, including nested bullet and numbered lists combined with styles, alignment, whitespace, and direct character formatting.
  Scope: |-
    - In scope: Align Writer list core contracts with LibreOffice and implement lossless ODT import/export for every currently implemented document-semantic editor feature, including nested bullet and numbered lists combined with styles, alignment, whitespace, and direct character formatting.
    - Out of scope: unrelated refactors not required for "Round-trip all implemented Writer features through ODT".
  Plan: |-
    Goal: make ODT import/export lossless for every document-semantic feature currently implemented by Writer.
    Scope:
    1. Align list state with LibreOffice ownership: SwNumRule name, paragraph list id, and zero-based list level remain distinct canonical values exposed by SwTextNode; keep the browser list projection derived from those items.
    2. Extend xmloff neutral text contracts with list rule/id/level data; export deterministic ODF list styles and nested text:list/text:list-item structures; import equivalent LibreOffice-style list structures recursively.
    3. Bridge the neutral representation to SwDoc without bypassing pooled RES_PARATR_NUMRULE, RES_PARATR_LIST_ID, or RES_PARATR_LIST_LEVEL items.
    4. Cover mixed bullet/numbered lists, nesting, list boundaries, headings, alignment, significant whitespace, and bold/italic/underline in unit and ODT package round-trip tests; update parity/provenance documentation if behavior changes.
    Success criteria:
    - Writer documents using every currently implemented document-semantic feature survive writeOdtDocument/readOdtDocument with equivalent canonical state.
    - Generated ODT contains valid ODF 1.3 list-style and list block markup accepted by the importer.
    - Representative LibreOffice-shaped nested list XML imports to the same canonical SwDoc state.
    - Unsupported ODF constructs still fail explicitly instead of being silently dropped.
    - npm run verify and policy routing checks pass.
    Constraints: no network; no compatibility layer for obsolete or incorrect stored-document schemas; no expansion to unimplemented numbering formats, tables, images, annotations, or page layout.
  Verify Steps: |-
    1. Run npm run verify. Expected: static checks, unit tests with 100% coverage, build, and Writer browser E2E all pass.
    2. Run node .agentplane/policy/check-routing.mjs. Expected: Agentplane routing policy passes.
    3. Inspect ODT list round-trip tests. Expected: nested mixed bullet/numbered lists, list continuation, list identities, styles, alignment, whitespace, and direct text formatting preserve canonical SwDoc state.
    4. Inspect strict rejection tests. Expected: obsolete Writer snapshots and unsupported or lossy ODF list constructs fail explicitly.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-09T04:43:28.125Z — VERIFY — ok

    By: CODER

    Note: npm run verify passed: 165 Writer/app tests and 74 inventory tests at 100% coverage, 8 Playwright E2E tests, production/static builds, formatting, lint, typecheck, JSDoc, and file-size checks. Agentplane routing policy, task lint, and git diff checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T04:39:10.633Z, excerpt_hash=sha256:9fd68c1a247a598819194f91d1fa9985b7be5e34b17ac1235394a557ea786747

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090351-3F3ZY7/blueprint/resolved-snapshot.json
    - old_digest: 440514145ba03248ab5132216bd4a75eefd4a782ed71b1473e8f663e9c410c4f
    - current_digest: 440514145ba03248ab5132216bd4a75eefd4a782ed71b1473e8f663e9c410c4f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609090351-3F3ZY7

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609090351-3F3ZY7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-09T04:43:43.019Z — VERIFY — ok

    By: CODER

    Note: verified-202609090351-3F3ZY7
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T04:43:28.210Z, excerpt_hash=sha256:9fd68c1a247a598819194f91d1fa9985b7be5e34b17ac1235394a557ea786747

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090351-3F3ZY7/blueprint/resolved-snapshot.json
    - old_digest: 440514145ba03248ab5132216bd4a75eefd4a782ed71b1473e8f663e9c410c4f
    - current_digest: 440514145ba03248ab5132216bd4a75eefd4a782ed71b1473e8f663e9c410c4f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609090351-3F3ZY7

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609090351-3F3ZY7 --result verified-202609090351-3F3ZY7 --commit 6f77bd2daa9267213c256c13bc5954e9a8550954
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
    The former saved-document compatibility paths represented the pre-canonical implementation and were removed. Storage now accepts only the current swModelVersion 3 shape. This deliberately follows the clarified scope: architectural cleanliness and LibreOffice-shaped contracts take precedence over backward compatibility at this stage.

    Implemented ODT list interoperability is intentionally limited to editor semantics already modeled by Writer: ten list levels using bullet or decimal numbering. Custom glyphs, alternative number formats, prefixes/suffixes, start values, tables, images, annotations, and page layout remain explicit unsupported boundaries rather than lossy conversions.
id_source: "generated"
---
## Summary

Round-trip all implemented Writer features through ODT

Align Writer list core contracts with LibreOffice and implement lossless ODT import/export for every currently implemented document-semantic editor feature, including nested bullet and numbered lists combined with styles, alignment, whitespace, and direct character formatting.

## Scope

- In scope: Align Writer list core contracts with LibreOffice and implement lossless ODT import/export for every currently implemented document-semantic editor feature, including nested bullet and numbered lists combined with styles, alignment, whitespace, and direct character formatting.
- Out of scope: unrelated refactors not required for "Round-trip all implemented Writer features through ODT".

## Plan

Goal: make ODT import/export lossless for every document-semantic feature currently implemented by Writer.
Scope:
1. Align list state with LibreOffice ownership: SwNumRule name, paragraph list id, and zero-based list level remain distinct canonical values exposed by SwTextNode; keep the browser list projection derived from those items.
2. Extend xmloff neutral text contracts with list rule/id/level data; export deterministic ODF list styles and nested text:list/text:list-item structures; import equivalent LibreOffice-style list structures recursively.
3. Bridge the neutral representation to SwDoc without bypassing pooled RES_PARATR_NUMRULE, RES_PARATR_LIST_ID, or RES_PARATR_LIST_LEVEL items.
4. Cover mixed bullet/numbered lists, nesting, list boundaries, headings, alignment, significant whitespace, and bold/italic/underline in unit and ODT package round-trip tests; update parity/provenance documentation if behavior changes.
Success criteria:
- Writer documents using every currently implemented document-semantic feature survive writeOdtDocument/readOdtDocument with equivalent canonical state.
- Generated ODT contains valid ODF 1.3 list-style and list block markup accepted by the importer.
- Representative LibreOffice-shaped nested list XML imports to the same canonical SwDoc state.
- Unsupported ODF constructs still fail explicitly instead of being silently dropped.
- npm run verify and policy routing checks pass.
Constraints: no network; no compatibility layer for obsolete or incorrect stored-document schemas; no expansion to unimplemented numbering formats, tables, images, annotations, or page layout.

## Verify Steps

1. Run npm run verify. Expected: static checks, unit tests with 100% coverage, build, and Writer browser E2E all pass.
2. Run node .agentplane/policy/check-routing.mjs. Expected: Agentplane routing policy passes.
3. Inspect ODT list round-trip tests. Expected: nested mixed bullet/numbered lists, list continuation, list identities, styles, alignment, whitespace, and direct text formatting preserve canonical SwDoc state.
4. Inspect strict rejection tests. Expected: obsolete Writer snapshots and unsupported or lossy ODF list constructs fail explicitly.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-09T04:43:28.125Z — VERIFY — ok

By: CODER

Note: npm run verify passed: 165 Writer/app tests and 74 inventory tests at 100% coverage, 8 Playwright E2E tests, production/static builds, formatting, lint, typecheck, JSDoc, and file-size checks. Agentplane routing policy, task lint, and git diff checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T04:39:10.633Z, excerpt_hash=sha256:9fd68c1a247a598819194f91d1fa9985b7be5e34b17ac1235394a557ea786747

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090351-3F3ZY7/blueprint/resolved-snapshot.json
- old_digest: 440514145ba03248ab5132216bd4a75eefd4a782ed71b1473e8f663e9c410c4f
- current_digest: 440514145ba03248ab5132216bd4a75eefd4a782ed71b1473e8f663e9c410c4f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609090351-3F3ZY7

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609090351-3F3ZY7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-09T04:43:43.019Z — VERIFY — ok

By: CODER

Note: verified-202609090351-3F3ZY7
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T04:43:28.210Z, excerpt_hash=sha256:9fd68c1a247a598819194f91d1fa9985b7be5e34b17ac1235394a557ea786747

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090351-3F3ZY7/blueprint/resolved-snapshot.json
- old_digest: 440514145ba03248ab5132216bd4a75eefd4a782ed71b1473e8f663e9c410c4f
- current_digest: 440514145ba03248ab5132216bd4a75eefd4a782ed71b1473e8f663e9c410c4f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609090351-3F3ZY7

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609090351-3F3ZY7 --result verified-202609090351-3F3ZY7 --commit 6f77bd2daa9267213c256c13bc5954e9a8550954
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

The former saved-document compatibility paths represented the pre-canonical implementation and were removed. Storage now accepts only the current swModelVersion 3 shape. This deliberately follows the clarified scope: architectural cleanliness and LibreOffice-shaped contracts take precedence over backward compatibility at this stage.

Implemented ODT list interoperability is intentionally limited to editor semantics already modeled by Writer: ten list levels using bullet or decimal numbering. Custom glyphs, alternative number formats, prefixes/suffixes, start values, tables, images, annotations, and page layout remain explicit unsupported boundaries rather than lossy conversions.
