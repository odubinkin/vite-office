---
id: "202609151136-8ZV6ZC"
title: "Complete Phase 1.3 generated Writer UI resources"
result_summary: "verified-202609151136-8ZV6ZC"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T11:37:16.988Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T12:16:40.491Z"
  updated_by: "CODER"
  note: "verified-202609151136-8ZV6ZC"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T12:15:45.831Z"
  updated_by: "EVALUATOR"
  note: "Generated Writer UI resources satisfy Phase 1.3 and default pipeline enforcement."
  evaluated_sha: "6d08db1fa326d155728ba71e1008ae111f2f5ccc"
  blueprint_digest: "1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93"
  evidence_refs:
    - ".agentplane/tasks/202609151136-8ZV6ZC/README.md"
    - ".agentplane/tasks/202609151136-8ZV6ZC/quality/20260915-121545831-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609151136-8ZV6ZC/quality/20260915-121545831-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609151136-8ZV6ZC/quality/20260915-121545831-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609151136-8ZV6ZC/blueprint/resolved-snapshot.json"
    - "commit 6d08db1fa326; npm run verify; npm run generate:writer-resources plus zero generated-artifact diff; npm run check:writer-resources"
  findings:
    - "Deterministic generator owns supported command identity, recursive placement order/context, labels, shortcuts, slots and structured X exclusions; runtime adapters consume generated surfaces without handwritten .uno command literals."
commit:
  hash: "0c944d24977fd9c365a2604994b8127b114d48a4"
  message: "🧩 8ZV6ZC task: record verification evidence"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: verified-202609151136-8ZV6ZC. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-15T11:37:22.156Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-15T12:15:36.314Z"
    author: "CODER"
    state: "ok"
    note: "Full npm run verify passed: 305 office tests and 88 inventory tests at 100% coverage, 10 Chromium e2e tests, static build, docs, provenance, invariant and parity gates. Writer resource generation is deterministic and the committed generated artifact remains unchanged after npm run generate:writer-resources. check:writer-resources now enforces stale output and closure tests in the default verify pipeline."
  -
    type: "verify"
    at: "2026-09-15T12:16:16.023Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609151136-8ZV6ZC"
  -
    type: "verify"
    at: "2026-09-15T12:16:40.491Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609151136-8ZV6ZC"
  -
    type: "status"
    at: "2026-09-15T12:16:40.683Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609151136-8ZV6ZC. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-15T12:16:40.684Z"
doc_updated_by: "CODER"
description: "Make pinned LibreOffice resources the authoritative source for the supported Writer UI graph and enforce deterministic regeneration and command-resource closure in the verification pipeline."
sections:
  Summary: "Complete Phase 1.3 for the bounded, currently supported Writer command set. Generated artifacts derived from the pinned LibreOffice checkout must become the sole authoritative source for Writer menu, toolbar, popup placement, labels, shortcuts, slot identities, and explicit unsupported capability records. Add verification gates so any supported-command change requires deterministic resource regeneration and passes command/resource/UI closure checks."
  Scope: |-
    In scope:
    - Refactor the Writer resource generator and its declarative supported-command input.
    - Generate menu, toolbar, and popup resource graphs from pinned LibreOffice XML, preserving supported hierarchy, separators, ordering, surface/context provenance, and .uno: identities.
    - Generate locale-ready en-US labels with explicit fallback semantics and accelerator metadata from pinned XCU resources.
    - Generate structured X capability records for relevant filtered upstream entries, excluding XML container identifiers and recording source/context/reason or reason category.
    - Replace handwritten Writer-specific placement/order/label/shortcut metadata in application code with generated graph adapters while keeping browser-owned commands/extensions explicitly separate.
    - Enforce deterministic byte-for-byte freshness and closure among registered public commands, the supported manifest, generated resources, visible controls, slots, labels, placements, shortcuts where upstream defines them, and X exclusions.
    - Integrate these gates into the repository verification pipeline and document the required command-addition/regeneration workflow near the owning code or contributor documentation.
    - Add or update focused unit/integration tests for generation, adapters, presenters, dispatcher identity, and failure cases.

    Out of scope:
    - Adding new Writer behavior or widening the currently supported command set merely to populate UI.
    - Importing every LibreOffice Writer command, desktop-only UI surface, dynamic VCL runtime behavior, or every locale.
    - Changing the public Sfx command contract unless separately re-approved.
    - Network access or modification outside this repository.
  Plan: "Implement the nine-step plan in the task README for the bounded supported Writer command set. Success requires generated upstream-owned UI graphs and metadata to replace handwritten Writer placement data; explicit browser-only separation; structured X capability accounting; deterministic byte-for-byte regeneration; closure checks for manifest, registry, UI, slots, labels, placements, and exclusions; mandatory integration into npm run verify; contributor guidance for adding commands; focused tests and full repository verification. Stop and request re-approval before adding Writer functionality, changing the public Sfx contract, accessing the network/outside repository, modifying more than five additional files beyond the reviewed implementation scope, or weakening/changing the verification contract."
  Verify Steps: |-
    1. Run `ap task verify-show 202609151136-8ZV6ZC` and confirm this acceptance contract before verification.
    2. Run the focused Writer resource generator/check tests and relevant Writer UI/dispatcher tests identified by the repository test configuration; all must pass and cover nested menus, separators, surface ordering/context, labels, accelerators, slots, structured X records, browser-owned separation, and one .uno: identity through generated resource -> React dispatch -> slot execution/binding state.
    3. Run `npm run generate:writer-resources`, then `git diff --exit-code -- apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json` (or the actual committed generated artifact paths if the implementation intentionally splits outputs); regeneration must be deterministic and leave committed generated resources unchanged.
    4. Run `npm run check:writer-resources`; it must pass freshness and closure checks. Tests must also demonstrate failure fixtures or assertions for at least: stale generated output, supported/registered manifest mismatch, displayed control missing from generated graph, required upstream metadata missing, and unclassified relevant upstream entry.
    5. Run `npm run verify`; all repository verification checks must pass, proving resource freshness/closure is part of the default pipeline rather than an optional command.
    6. Run `git diff --check`; it must pass.
    7. Run `node .agentplane/policy/check-routing.mjs`; it must pass.
    8. Run `ap doctor`; it must pass or any unrelated pre-existing warning must be recorded with impact.
    9. Run `git status --short --untracked-files=all` and confirm only intentional task-scoped changes remain. Review `git diff` to confirm no handwritten Writer-specific placement/order/label/shortcut source remains for generated upstream commands and no unsupported command is presented as implemented parity.
  Verification: |-
    Pending implementation. The verifier must record each declared command, pass/fail result, concise evidence, and covered scope through `ap verify` and task findings when needed.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T12:15:36.314Z — VERIFY — ok

    By: CODER

    Note: Full npm run verify passed: 305 office tests and 88 inventory tests at 100% coverage, 10 Chromium e2e tests, static build, docs, provenance, invariant and parity gates. Writer resource generation is deterministic and the committed generated artifact remains unchanged after npm run generate:writer-resources. check:writer-resources now enforces stale output and closure tests in the default verify pipeline.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T11:37:22.156Z, excerpt_hash=sha256:1f07dd78536b5e41b177f08f0bb410378975c86b6b2fd0453a51a04fc20f878d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151136-8ZV6ZC/blueprint/resolved-snapshot.json
    - old_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
    - current_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151136-8ZV6ZC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609151136-8ZV6ZC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T12:16:16.023Z — VERIFY — ok

    By: CODER

    Note: verified-202609151136-8ZV6ZC
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T12:15:36.394Z, excerpt_hash=sha256:1f07dd78536b5e41b177f08f0bb410378975c86b6b2fd0453a51a04fc20f878d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151136-8ZV6ZC/blueprint/resolved-snapshot.json
    - old_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
    - current_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151136-8ZV6ZC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609151136-8ZV6ZC --result verified-202609151136-8ZV6ZC --commit 6d08db1fa326d155728ba71e1008ae111f2f5ccc
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T12:16:40.491Z — VERIFY — ok

    By: CODER

    Note: verified-202609151136-8ZV6ZC
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T12:16:16.107Z, excerpt_hash=sha256:1f07dd78536b5e41b177f08f0bb410378975c86b6b2fd0453a51a04fc20f878d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151136-8ZV6ZC/blueprint/resolved-snapshot.json
    - old_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
    - current_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151136-8ZV6ZC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609151136-8ZV6ZC --result verified-202609151136-8ZV6ZC --commit 0c944d24977fd9c365a2604994b8127b114d48a4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation commit(s) for this task using a non-destructive follow-up revert. Restore the previous generator, generated artifact schema, adapters, presenter consumption, tests, and package scripts together so generated/runtime contracts do not become mixed-version. Re-run the previous resource freshness check and npm verification after rollback. Do not delete or manually rewrite task history."
  Findings: |-
    No findings yet. Record task-local implementation discoveries, approved deviations, residual risks, and structured verification evidence here.

    - Observation: Existing UI and parity tests encoded manual menu placements and evidence markers.
      Impact: Those expectations would preserve duplicated command metadata and bypass generated upstream context.
      Resolution: Updated tests and invariant evidence to consume the generated resource graph; unsupported entries remain structured X records.
extensions:
  implementation_commit:
    hash: "6d08db1fa326d155728ba71e1008ae111f2f5ccc"
    message: "🧩 8ZV6ZC code: complete generated Writer UI resources"
id_source: "generated"
---
## Summary

Complete Phase 1.3 for the bounded, currently supported Writer command set. Generated artifacts derived from the pinned LibreOffice checkout must become the sole authoritative source for Writer menu, toolbar, popup placement, labels, shortcuts, slot identities, and explicit unsupported capability records. Add verification gates so any supported-command change requires deterministic resource regeneration and passes command/resource/UI closure checks.

## Scope

In scope:
- Refactor the Writer resource generator and its declarative supported-command input.
- Generate menu, toolbar, and popup resource graphs from pinned LibreOffice XML, preserving supported hierarchy, separators, ordering, surface/context provenance, and .uno: identities.
- Generate locale-ready en-US labels with explicit fallback semantics and accelerator metadata from pinned XCU resources.
- Generate structured X capability records for relevant filtered upstream entries, excluding XML container identifiers and recording source/context/reason or reason category.
- Replace handwritten Writer-specific placement/order/label/shortcut metadata in application code with generated graph adapters while keeping browser-owned commands/extensions explicitly separate.
- Enforce deterministic byte-for-byte freshness and closure among registered public commands, the supported manifest, generated resources, visible controls, slots, labels, placements, shortcuts where upstream defines them, and X exclusions.
- Integrate these gates into the repository verification pipeline and document the required command-addition/regeneration workflow near the owning code or contributor documentation.
- Add or update focused unit/integration tests for generation, adapters, presenters, dispatcher identity, and failure cases.

Out of scope:
- Adding new Writer behavior or widening the currently supported command set merely to populate UI.
- Importing every LibreOffice Writer command, desktop-only UI surface, dynamic VCL runtime behavior, or every locale.
- Changing the public Sfx command contract unless separately re-approved.
- Network access or modification outside this repository.

## Plan

Implement the nine-step plan in the task README for the bounded supported Writer command set. Success requires generated upstream-owned UI graphs and metadata to replace handwritten Writer placement data; explicit browser-only separation; structured X capability accounting; deterministic byte-for-byte regeneration; closure checks for manifest, registry, UI, slots, labels, placements, and exclusions; mandatory integration into npm run verify; contributor guidance for adding commands; focused tests and full repository verification. Stop and request re-approval before adding Writer functionality, changing the public Sfx contract, accessing the network/outside repository, modifying more than five additional files beyond the reviewed implementation scope, or weakening/changing the verification contract.

## Verify Steps

1. Run `ap task verify-show 202609151136-8ZV6ZC` and confirm this acceptance contract before verification.
2. Run the focused Writer resource generator/check tests and relevant Writer UI/dispatcher tests identified by the repository test configuration; all must pass and cover nested menus, separators, surface ordering/context, labels, accelerators, slots, structured X records, browser-owned separation, and one .uno: identity through generated resource -> React dispatch -> slot execution/binding state.
3. Run `npm run generate:writer-resources`, then `git diff --exit-code -- apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json` (or the actual committed generated artifact paths if the implementation intentionally splits outputs); regeneration must be deterministic and leave committed generated resources unchanged.
4. Run `npm run check:writer-resources`; it must pass freshness and closure checks. Tests must also demonstrate failure fixtures or assertions for at least: stale generated output, supported/registered manifest mismatch, displayed control missing from generated graph, required upstream metadata missing, and unclassified relevant upstream entry.
5. Run `npm run verify`; all repository verification checks must pass, proving resource freshness/closure is part of the default pipeline rather than an optional command.
6. Run `git diff --check`; it must pass.
7. Run `node .agentplane/policy/check-routing.mjs`; it must pass.
8. Run `ap doctor`; it must pass or any unrelated pre-existing warning must be recorded with impact.
9. Run `git status --short --untracked-files=all` and confirm only intentional task-scoped changes remain. Review `git diff` to confirm no handwritten Writer-specific placement/order/label/shortcut source remains for generated upstream commands and no unsupported command is presented as implemented parity.

## Verification

Pending implementation. The verifier must record each declared command, pass/fail result, concise evidence, and covered scope through `ap verify` and task findings when needed.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T12:15:36.314Z — VERIFY — ok

By: CODER

Note: Full npm run verify passed: 305 office tests and 88 inventory tests at 100% coverage, 10 Chromium e2e tests, static build, docs, provenance, invariant and parity gates. Writer resource generation is deterministic and the committed generated artifact remains unchanged after npm run generate:writer-resources. check:writer-resources now enforces stale output and closure tests in the default verify pipeline.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T11:37:22.156Z, excerpt_hash=sha256:1f07dd78536b5e41b177f08f0bb410378975c86b6b2fd0453a51a04fc20f878d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151136-8ZV6ZC/blueprint/resolved-snapshot.json
- old_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
- current_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151136-8ZV6ZC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609151136-8ZV6ZC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T12:16:16.023Z — VERIFY — ok

By: CODER

Note: verified-202609151136-8ZV6ZC
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T12:15:36.394Z, excerpt_hash=sha256:1f07dd78536b5e41b177f08f0bb410378975c86b6b2fd0453a51a04fc20f878d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151136-8ZV6ZC/blueprint/resolved-snapshot.json
- old_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
- current_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151136-8ZV6ZC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609151136-8ZV6ZC --result verified-202609151136-8ZV6ZC --commit 6d08db1fa326d155728ba71e1008ae111f2f5ccc
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T12:16:40.491Z — VERIFY — ok

By: CODER

Note: verified-202609151136-8ZV6ZC
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T12:16:16.107Z, excerpt_hash=sha256:1f07dd78536b5e41b177f08f0bb410378975c86b6b2fd0453a51a04fc20f878d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151136-8ZV6ZC/blueprint/resolved-snapshot.json
- old_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
- current_digest: 1862b759b741580d011414159612be35875d9dcc03ec52f557063d7995913e93
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151136-8ZV6ZC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609151136-8ZV6ZC --result verified-202609151136-8ZV6ZC --commit 0c944d24977fd9c365a2604994b8127b114d48a4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation commit(s) for this task using a non-destructive follow-up revert. Restore the previous generator, generated artifact schema, adapters, presenter consumption, tests, and package scripts together so generated/runtime contracts do not become mixed-version. Re-run the previous resource freshness check and npm verification after rollback. Do not delete or manually rewrite task history.

## Findings

No findings yet. Record task-local implementation discoveries, approved deviations, residual risks, and structured verification evidence here.

- Observation: Existing UI and parity tests encoded manual menu placements and evidence markers.
  Impact: Those expectations would preserve duplicated command metadata and bypass generated upstream context.
  Resolution: Updated tests and invariant evidence to consume the generated resource graph; unsupported entries remain structured X records.
