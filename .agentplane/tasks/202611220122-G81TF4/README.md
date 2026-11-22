---
id: "202611220122-G81TF4"
title: "Preserve Writer ODT casing and character text flags"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run focused Writer ODT style, Worker and UNO property suites and the affected shared xmloff handlers."
  - "npm run check:dependencies && npm run check:source-provenance"
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:22:38.548Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T01:33:34.878Z"
  updated_by: "CODER"
  note: "Writer native casing, blinking, visibility, and no-hyphenation survive the supported ODT and Worker paths. 138 focused tests and all declared static checks pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T01:33:44.660Z"
  updated_by: "EVALUATOR"
  note: "The reviewed Writer ODT character-flag transport follows the pinned XML handlers, native UNO property rows, concrete item storage and generator precedence."
  evaluated_sha: "01295e3e2a1a8a2fae8682a47c9d7436aa7a78e2"
  blueprint_digest: "3eb4a94cb147ecee47161acdf8a474cdc0a4c73e8ff847317df5cef561fdf2ae"
  evidence_refs:
    - ".agentplane/tasks/202611220122-G81TF4/README.md"
    - ".agentplane/tasks/202611220122-G81TF4/quality/20261122-013344660-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220122-G81TF4/quality/20261122-013344660-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220122-G81TF4/quality/20261122-013344660-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220122-G81TF4/blueprint/resolved-snapshot.json"
    - "01295e3e2a1a plus 138 passing focused Writer, Calc, EditEngine and shared tests"
    - "docs/program/writer-upstream-suspected-issues.md#WRITER-735"
  findings:
    - "The character map admits no-hyphenation and the paragraph map omits that character property. Legacy metadata is classified before style import. Native casing remains a single property."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: preserve Writer casing and character flags through the pinned ODT property and generator rules."
events:
  -
    type: "status"
    at: "2026-11-22T01:22:43.410Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve Writer casing and character flags through the pinned ODT property and generator rules."
  -
    type: "verify"
    at: "2026-11-22T01:33:34.878Z"
    author: "CODER"
    state: "ok"
    note: "Writer native casing, blinking, visibility, and no-hyphenation survive the supported ODT and Worker paths. 138 focused tests and all declared static checks pass."
doc_version: 3
doc_updated_at: "2026-11-22T01:33:34.929Z"
doc_updated_by: "CODER"
description: "Port the represented Writer case-map, blinking, hidden and no-hyphenation items through native ODT property mapping, Worker records and UNO metadata, including the source legacy generator handling for visibility."
sections:
  Summary: "Preserve the represented Writer case mapping, blinking, hidden and no-hyphenation character values through ODT and the existing Worker record. Follow the pinned xmloff and Writer member contracts, including generator-based normalization for legacy hidden text."
  Scope: |-
    - Shared ODF handlers and Writer style contexts for the four existing character item types.
    - Native item conversion, UNO property metadata and Worker restoration, plus consumed document generator classification needed by the text display import context.
    - Package and handler regression verification, applicable original fixtures, and source registry evidence.
  Plan: |-
    1. Trace the original ODF casing and variant maps, the text display special import branch and the independent blinking and hyphenation flags. Use Graphify to locate existing item, context and document metadata owners.
    2. Implement the consumed source handlers and generator classification in the matching shared modules. Keep cases, defaults and direct-versus-inherited behavior native and adopt the actual pooled item types through existing UNO paths.
    3. Carry the same values through Writer styles, Worker transfer and ODT reopen. Cover applicable pinned documents and focused modern, legacy and explicit reset cases. Document suspect source rules while retaining their behavior.
    4. Verify the affected owner suites and refresh Graphify during closeout.
  Verify Steps: |-
    - Run focused Writer suites for the new character flag cases, existing native ODT character values and style round trips, Worker transport, UNO metadata and affected editeng items.
    - Run affected shared xmloff cases for native token handling, merge order and legacy generator classification.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing validation, AgentPlane doctor and git diff checks.
    - Record the task-scoped checkout and refresh the graph. The next complete regression follows the ten-task cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T01:33:34.878Z — VERIFY — ok

    By: CODER

    Note: Writer native casing, blinking, visibility, and no-hyphenation survive the supported ODT and Worker paths. 138 focused tests and all declared static checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:22:43.410Z, excerpt_hash=sha256:f7fe4a25c77f774e2a06e475da3229e6cffe1223bef94293846c1e24f8578c19

    Details:

    - Command: `npm run test:writer -- odt-native-character-values native-text-default-schema native-character-defaults odt-worker-runtime odt-worker-client odt-font-input-boundaries odt-style-family-roundtrip odt-roundtrip odt-import-diagnostics odt-xml-boundaries odt-property-roundtrip native-property-info`
      Result: pass. Evidence: 75 tests in 13 files. Scope: named and automatic ODT styles, native UNO metadata, Worker packages, legacy generator polarity, and modern ODT save/reopen.
    - Command: `npm run test:writer -- editeng/source/items/textitem.test`
      Result: pass. Evidence: 6 tests. Scope: pooled formatting item contracts.
    - Command: `npm run test:shared -- txtprmap.test xmlbahdl.test xmlimp.test xmlstyle.test textitem.test txtpara.test`
      Result: pass. Evidence: 24 tests in 5 files. Scope: shared XML token conversions and property map branches.
    - Command: `npm run test:calc -- ods-style-routing ods.test ods-xml-boundaries`
      Result: pass. Evidence: 33 tests in 5 files. Scope: ODS consumers of shared xmloff.
    - Commands: scoped `npx eslint --max-warnings 0` and `npx prettier --check` on all task implementation and registry paths, `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo`, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run inventory:invariants -- --scope writer`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, `git diff --check`.
      Result: pass. Evidence: boundary check 2,987 runtime sources, provenance 2,988 runtime modules, routing OK, doctor 0 errors with the existing managed hook shim warning.
    - The upstream tdf100492 fixture contributes the small-caps and flashing attributes to the supported Writer ODT round trip. The fixture's drawing/SVG testcase and the browser's layout of hidden or cased text are outside this checkpoint. WRITER-735 records the native duplicate casing-property ambiguity. Four tasks have been closed counting this task toward the next ten-task full regression cadence.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220122-G81TF4/blueprint/resolved-snapshot.json
    - old_digest: 3eb4a94cb147ecee47161acdf8a474cdc0a4c73e8ff847317df5cef561fdf2ae
    - current_digest: 3eb4a94cb147ecee47161acdf8a474cdc0a4c73e8ff847317df5cef561fdf2ae
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220122-G81TF4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220122-G81TF4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation and source witnesses as committed. Existing packages remain readable through their previous import paths."
  Findings: "This is the fourth implementation task after CMXMAC. The native item pool already defines the four defaults, while the current Writer properties and ODT paths do not transport them. The existing XML metadata reader recognizes and ignores meta:generator, and the pinned text display handler uses its version classification."
id_source: "generated"
---
## Summary

Preserve the represented Writer case mapping, blinking, hidden and no-hyphenation character values through ODT and the existing Worker record. Follow the pinned xmloff and Writer member contracts, including generator-based normalization for legacy hidden text.

## Scope

- Shared ODF handlers and Writer style contexts for the four existing character item types.
- Native item conversion, UNO property metadata and Worker restoration, plus consumed document generator classification needed by the text display import context.
- Package and handler regression verification, applicable original fixtures, and source registry evidence.

## Plan

1. Trace the original ODF casing and variant maps, the text display special import branch and the independent blinking and hyphenation flags. Use Graphify to locate existing item, context and document metadata owners.
2. Implement the consumed source handlers and generator classification in the matching shared modules. Keep cases, defaults and direct-versus-inherited behavior native and adopt the actual pooled item types through existing UNO paths.
3. Carry the same values through Writer styles, Worker transfer and ODT reopen. Cover applicable pinned documents and focused modern, legacy and explicit reset cases. Document suspect source rules while retaining their behavior.
4. Verify the affected owner suites and refresh Graphify during closeout.

## Verify Steps

- Run focused Writer suites for the new character flag cases, existing native ODT character values and style round trips, Worker transport, UNO metadata and affected editeng items.
- Run affected shared xmloff cases for native token handling, merge order and legacy generator classification.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing validation, AgentPlane doctor and git diff checks.
- Record the task-scoped checkout and refresh the graph. The next complete regression follows the ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T01:33:34.878Z — VERIFY — ok

By: CODER

Note: Writer native casing, blinking, visibility, and no-hyphenation survive the supported ODT and Worker paths. 138 focused tests and all declared static checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:22:43.410Z, excerpt_hash=sha256:f7fe4a25c77f774e2a06e475da3229e6cffe1223bef94293846c1e24f8578c19

Details:

- Command: `npm run test:writer -- odt-native-character-values native-text-default-schema native-character-defaults odt-worker-runtime odt-worker-client odt-font-input-boundaries odt-style-family-roundtrip odt-roundtrip odt-import-diagnostics odt-xml-boundaries odt-property-roundtrip native-property-info`
  Result: pass. Evidence: 75 tests in 13 files. Scope: named and automatic ODT styles, native UNO metadata, Worker packages, legacy generator polarity, and modern ODT save/reopen.
- Command: `npm run test:writer -- editeng/source/items/textitem.test`
  Result: pass. Evidence: 6 tests. Scope: pooled formatting item contracts.
- Command: `npm run test:shared -- txtprmap.test xmlbahdl.test xmlimp.test xmlstyle.test textitem.test txtpara.test`
  Result: pass. Evidence: 24 tests in 5 files. Scope: shared XML token conversions and property map branches.
- Command: `npm run test:calc -- ods-style-routing ods.test ods-xml-boundaries`
  Result: pass. Evidence: 33 tests in 5 files. Scope: ODS consumers of shared xmloff.
- Commands: scoped `npx eslint --max-warnings 0` and `npx prettier --check` on all task implementation and registry paths, `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo`, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run inventory:invariants -- --scope writer`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, `git diff --check`.
  Result: pass. Evidence: boundary check 2,987 runtime sources, provenance 2,988 runtime modules, routing OK, doctor 0 errors with the existing managed hook shim warning.
- The upstream tdf100492 fixture contributes the small-caps and flashing attributes to the supported Writer ODT round trip. The fixture's drawing/SVG testcase and the browser's layout of hidden or cased text are outside this checkpoint. WRITER-735 records the native duplicate casing-property ambiguity. Four tasks have been closed counting this task toward the next ten-task full regression cadence.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220122-G81TF4/blueprint/resolved-snapshot.json
- old_digest: 3eb4a94cb147ecee47161acdf8a474cdc0a4c73e8ff847317df5cef561fdf2ae
- current_digest: 3eb4a94cb147ecee47161acdf8a474cdc0a4c73e8ff847317df5cef561fdf2ae
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220122-G81TF4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220122-G81TF4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation and source witnesses as committed. Existing packages remain readable through their previous import paths.

## Findings

This is the fourth implementation task after CMXMAC. The native item pool already defines the four defaults, while the current Writer properties and ODT paths do not transport them. The existing XML metadata reader recognizes and ignores meta:generator, and the pinned text display handler uses its version classification.
