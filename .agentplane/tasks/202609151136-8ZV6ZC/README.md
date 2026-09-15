---
id: "202609151136-8ZV6ZC"
title: "Complete Phase 1.3 generated Writer UI resources"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-15T11:37:22.156Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-15T11:37:22.156Z"
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
  Verification: "Pending implementation. The verifier must record each declared command, pass/fail result, concise evidence, and covered scope through `ap verify` and task findings when needed."
  Rollback Plan: "Revert only the implementation commit(s) for this task using a non-destructive follow-up revert. Restore the previous generator, generated artifact schema, adapters, presenter consumption, tests, and package scripts together so generated/runtime contracts do not become mixed-version. Re-run the previous resource freshness check and npm verification after rollback. Do not delete or manually rewrite task history."
  Findings: "No findings yet. Record task-local implementation discoveries, approved deviations, residual risks, and structured verification evidence here."
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

## Rollback Plan

Revert only the implementation commit(s) for this task using a non-destructive follow-up revert. Restore the previous generator, generated artifact schema, adapters, presenter consumption, tests, and package scripts together so generated/runtime contracts do not become mixed-version. Re-run the previous resource freshness check and npm verification after rollback. Do not delete or manually rewrite task history.

## Findings

No findings yet. Record task-local implementation discoveries, approved deviations, residual risks, and structured verification evidence here.
