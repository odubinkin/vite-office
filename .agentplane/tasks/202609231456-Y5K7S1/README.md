---
id: "202609231456-Y5K7S1"
title: "Preserve Writer construction defaults across document lifecycle"
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
  updated_at: "2026-09-23T14:57:26.235Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T15:07:46.810Z"
  updated_by: "CODER"
  note: "Verified Writer construction context across New, cache restore, ODT language import/export, and worker transfer. Focused tests, full application suite, typecheck, lint, docs, source checks, doctor, and routing validation pass."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Preserve session locale and font device through Writer New, ODT import/transfer, and browser cache restore with focused verification."
events:
  -
    type: "status"
    at: "2026-09-23T14:57:33.220Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Preserve session locale and font device through Writer New, ODT import/transfer, and browser cache restore with focused verification."
  -
    type: "verify"
    at: "2026-09-23T15:07:46.810Z"
    author: "CODER"
    state: "ok"
    note: "Verified Writer construction context across New, cache restore, ODT language import/export, and worker transfer. Focused tests, full application suite, typecheck, lint, docs, source checks, doctor, and routing validation pass."
doc_version: 3
doc_updated_at: "2026-09-23T15:07:46.890Z"
doc_updated_by: "CODER"
description: "Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults."
sections:
  Summary: |-
    Preserve Writer construction defaults across document lifecycle

    Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults.
  Scope: |-
    - In scope: Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults.
    - Out of scope: unrelated refactors not required for "Preserve Writer construction defaults across document lifecycle".
  Plan: "1. Preserve the session construction context in SwDocShell and use it for New and ODT Open. 2. Store document locale in the canonical graph record; inject current font device when decoding browser cache and ODT transfers, including worker import/export. 3. Keep ODT document language where imported/exported source supports it; align versioned schemas without legacy loading. 4. Add focused locale, font and paper lifecycle tests; run typecheck, relevant Vitest suites, doctor and routing validation."
  Verify Steps: "1. Run npm exec -- vitest run focused Writer shell, codec, storage, ODT filter and worker tests. Expected: all pass, including locale/device/page golden cases. 2. Run npm run typecheck --workspace @vite-office/office. Expected: no TypeScript errors. 3. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: both pass. 4. Review git diff and git status --short --untracked-files=all. Expected: only intentional task changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T15:07:46.810Z — VERIFY — ok

    By: CODER

    Note: Verified Writer construction context across New, cache restore, ODT language import/export, and worker transfer. Focused tests, full application suite, typecheck, lint, docs, source checks, doctor, and routing validation pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T15:07:30.711Z, excerpt_hash=sha256:d064a6265dfa0bd2edb071268ff6d05439964fda92f5140d1080c965b55835c7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231456-Y5K7S1/blueprint/resolved-snapshot.json
    - old_digest: 9da3f1605f623e92e86c39f7acab50e947bd761b254b892f1b584f287d2b2159
    - current_digest: 9da3f1605f623e92e86c39f7acab50e947bd761b254b892f1b584f287d2b2159
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231456-Y5K7S1

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609231456-Y5K7S1
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
  Findings: |-
    - Command: npm exec -- vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/core/doc/writer.test.ts apps/office/src/sw/source/core/doc/writer-attributes.test.ts apps/office/src/sw/browser/storage/writer-storage.test.ts apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts; Result: pass; Evidence: 6 files, 41 tests; Scope: New, codec, cache, ODT.
    - Command: npm exec -- vitest run apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts; Result: pass; Evidence: 1 file, 4 tests; Scope: Worker import language.
    - Command: npm run test:coverage --workspace @vite-office/office; Result: pass; Evidence: 93 files, 388 tests, 100% measured coverage; Scope: application regression suite before the final focused worker test was added.
    - Command: npm run typecheck --workspace @vite-office/office; Result: pass; Evidence: tsc --noEmit exited 0; Scope: application TypeScript.
    - Command: npm run format:check && npm run lint && npm run check:docs && npm run check:dependencies && npm run check:source-provenance && npm run check:file-size; Result: pass; Evidence: all exited 0; Scope: formatting, source hygiene, architecture, provenance.
    - Command: ap doctor && node .agentplane/policy/check-routing.mjs; Result: pass; Evidence: doctor OK with two pre-existing warnings, policy routing OK; Scope: task workflow and policy.
    - Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: changed patch.
id_source: "generated"
---
## Summary

Preserve Writer construction defaults across document lifecycle

Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults.

## Scope

- In scope: Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults.
- Out of scope: unrelated refactors not required for "Preserve Writer construction defaults across document lifecycle".

## Plan

1. Preserve the session construction context in SwDocShell and use it for New and ODT Open. 2. Store document locale in the canonical graph record; inject current font device when decoding browser cache and ODT transfers, including worker import/export. 3. Keep ODT document language where imported/exported source supports it; align versioned schemas without legacy loading. 4. Add focused locale, font and paper lifecycle tests; run typecheck, relevant Vitest suites, doctor and routing validation.

## Verify Steps

1. Run npm exec -- vitest run focused Writer shell, codec, storage, ODT filter and worker tests. Expected: all pass, including locale/device/page golden cases. 2. Run npm run typecheck --workspace @vite-office/office. Expected: no TypeScript errors. 3. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: both pass. 4. Review git diff and git status --short --untracked-files=all. Expected: only intentional task changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T15:07:46.810Z — VERIFY — ok

By: CODER

Note: Verified Writer construction context across New, cache restore, ODT language import/export, and worker transfer. Focused tests, full application suite, typecheck, lint, docs, source checks, doctor, and routing validation pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T15:07:30.711Z, excerpt_hash=sha256:d064a6265dfa0bd2edb071268ff6d05439964fda92f5140d1080c965b55835c7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231456-Y5K7S1/blueprint/resolved-snapshot.json
- old_digest: 9da3f1605f623e92e86c39f7acab50e947bd761b254b892f1b584f287d2b2159
- current_digest: 9da3f1605f623e92e86c39f7acab50e947bd761b254b892f1b584f287d2b2159
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231456-Y5K7S1

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609231456-Y5K7S1
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

- Command: npm exec -- vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/core/doc/writer.test.ts apps/office/src/sw/source/core/doc/writer-attributes.test.ts apps/office/src/sw/browser/storage/writer-storage.test.ts apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts; Result: pass; Evidence: 6 files, 41 tests; Scope: New, codec, cache, ODT.
- Command: npm exec -- vitest run apps/office/src/sw/source/filter/xml/odt-worker-runtime.test.ts; Result: pass; Evidence: 1 file, 4 tests; Scope: Worker import language.
- Command: npm run test:coverage --workspace @vite-office/office; Result: pass; Evidence: 93 files, 388 tests, 100% measured coverage; Scope: application regression suite before the final focused worker test was added.
- Command: npm run typecheck --workspace @vite-office/office; Result: pass; Evidence: tsc --noEmit exited 0; Scope: application TypeScript.
- Command: npm run format:check && npm run lint && npm run check:docs && npm run check:dependencies && npm run check:source-provenance && npm run check:file-size; Result: pass; Evidence: all exited 0; Scope: formatting, source hygiene, architecture, provenance.
- Command: ap doctor && node .agentplane/policy/check-routing.mjs; Result: pass; Evidence: doctor OK with two pre-existing warnings, policy routing OK; Scope: task workflow and policy.
- Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: changed patch.
