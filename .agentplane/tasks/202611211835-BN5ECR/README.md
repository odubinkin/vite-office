---
id: "202611211835-BN5ECR"
title: "Round-trip Writer ODT character line and relief effects"
result_summary: "Preserved ODT overline, glyph contour, shadow and relief with the native UNO and EditEngine values."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:36:03.963Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T18:42:17.884Z"
  updated_by: "CODER"
  note: "63 focused Writer tests, four Calc ODS reuse tests, office typechecking, lint and format checks, module boundaries, registry provenance and AgentPlane policy checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T18:42:19.066Z"
  updated_by: "EVALUATOR"
  note: "Writer retains overline, contour, shadow and relief in ODT using the native UNO properties and EditEngine items."
  evaluated_sha: "27f1e95037908d4877e680bd6c2658b6a2da0772"
  blueprint_digest: "9adca2c97518b301dc2ec314d0f0e40853426209780b22a195e4ea126357a6d0"
  evidence_refs:
    - ".agentplane/tasks/202611211835-BN5ECR/README.md"
    - ".agentplane/tasks/202611211835-BN5ECR/quality/20261121-184219066-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211835-BN5ECR/quality/20261121-184219066-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211835-BN5ECR/quality/20261121-184219066-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211835-BN5ECR/blueprint/resolved-snapshot.json"
    - "63 Writer tests, 4 Calc reuse tests, office typecheck, lint and format, 2978 provenance records, gateway checks"
  findings:
    - "The pinned paragraph-style fragment, authored named and automatic properties, package XML and pool-item assertions cover the real Writer and Worker path. The handler keeps native shadow and overline-color behavior as documented."
commit:
  hash: "27f1e95037908d4877e680bd6c2658b6a2da0772"
  message: "🧩 BN5ECR code: preserve Writer ODT character effects"
comments:
  -
    author: "CODER"
    body: "Start: port Writer character overline, contour, shadow and relief effects through the native item and ODF property maps."
  -
    author: "CODER"
    body: "Verified: named and automatic Writer text effects survive ODT and Worker round trips. All 67 focused Writer and Calc tests and static checks passed."
events:
  -
    type: "status"
    at: "2026-11-21T18:36:08.434Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port Writer character overline, contour, shadow and relief effects through the native item and ODF property maps."
  -
    type: "verify"
    at: "2026-11-21T18:42:17.884Z"
    author: "CODER"
    state: "ok"
    note: "63 focused Writer tests, four Calc ODS reuse tests, office typechecking, lint and format checks, module boundaries, registry provenance and AgentPlane policy checks passed."
  -
    type: "status"
    at: "2026-11-21T18:43:41.677Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: named and automatic Writer text effects survive ODT and Worker round trips. All 67 focused Writer and Calc tests and static checks passed."
doc_version: 3
doc_updated_at: "2026-11-21T18:43:41.678Z"
doc_updated_by: "CODER"
description: "Port the native character overline style, type, width and color mappings and the native contour, shadow and relief effects. Reuse EditEngine items, the Writer property maps and the xmloff handlers for named and automatic styles. Verify direct formatting and ODT package round trips."
sections:
  Summary: "Preserve native character overline, contour, shadow and relief through Writer ODT."
  Scope: "Shared xmloff character handlers and format projection, Writer UNO property maps and export, focused regression tests and source registry. Preserve native lexical conversion and defaults. Document suspicious upstream behavior where found."
  Plan: |-
    - Use the original mappings and the existing EditEngine types and xmloff property handlers.
    - Connect the properties for named, paragraph and automatic text styles and export from the native items.
    - Verify ODT XML, model values and package round trips, using reference regression scenarios where the model supports them.
  Verify Steps: |-
    - Run `npm run test:writer -- odt-property-roundtrip.test.ts txtprmap.test.ts native-import-style-contracts.test.ts native-text-import-api.test.ts odt-worker --maxWorkers 2 --testTimeout 120000`.
    - Run the office workspace typecheck and ESLint and Prettier on changed TypeScript.
    - Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T18:42:17.884Z — VERIFY — ok

    By: CODER

    Note: 63 focused Writer tests, four Calc ODS reuse tests, office typechecking, lint and format checks, module boundaries, registry provenance and AgentPlane policy checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:41:11.427Z, excerpt_hash=sha256:08541934fdd87308ead8e0256e8d9ced35cc0cb3c971926da3c57e860e341296

    Details:

    Command: npm run test:writer -- odt-property-roundtrip.test.ts txtprmap.test.ts native-import-style-contracts.test.ts native-text-import-api.test.ts odt-worker odt-native-character-values.test.ts --maxWorkers 2 --testTimeout 120000
    Result: pass
    Evidence: 63 tests across six files.
    Scope: named styles, direct formatting, pinned overline attributes, native effect normalization and Worker to ODT round-trip.

    Command: npm run test:calc -- ods-rich-text-fields.test.ts --maxWorkers 2 --testTimeout 120000
    Result: pass
    Evidence: four tests in one file.
    Scope: Calc rich text XML reuse of the shared property map.

    Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo
    Result: pass
    Evidence: exit zero.
    Scope: office TypeScript.

    Command: npx eslint and npx prettier --check on all eight changed TypeScript files
    Result: pass
    Evidence: no diagnostics or formatting issues.
    Scope: changed TypeScript.

    Command: npm run check:dependencies && npm run check:source-provenance
    Result: pass
    Evidence: 2977 dependency-checked sources and 2978 provenance records. The UNO FontRelief group preserves the native module boundary.
    Scope: dependencies and source registry.

    Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check
    Result: pass
    Evidence: routing OK, zero doctor errors, existing hook shim warning, no whitespace errors.
    Scope: gateway and implementation diff.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211835-BN5ECR/blueprint/resolved-snapshot.json
    - old_digest: 9adca2c97518b301dc2ec314d0f0e40853426209780b22a195e4ea126357a6d0
    - current_digest: 9adca2c97518b301dc2ec314d0f0e40853426209780b22a195e4ea126357a6d0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211835-BN5ECR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211835-BN5ECR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit."
  Findings: |-
    None recorded yet.

    - Observation: The dependency checker rejected using VCL font relief constants from xmloff.
      Impact: The ODF handler needs the original UNO short constants from offapi.
      Resolution: Port offapi/com/sun/star/text/FontRelief.idl as the existing TypeScript constant-group pattern. Keep VCL and UNO values in their native modules.
id_source: "generated"
---
## Summary

Preserve native character overline, contour, shadow and relief through Writer ODT.

## Scope

Shared xmloff character handlers and format projection, Writer UNO property maps and export, focused regression tests and source registry. Preserve native lexical conversion and defaults. Document suspicious upstream behavior where found.

## Plan

- Use the original mappings and the existing EditEngine types and xmloff property handlers.
- Connect the properties for named, paragraph and automatic text styles and export from the native items.
- Verify ODT XML, model values and package round trips, using reference regression scenarios where the model supports them.

## Verify Steps

- Run `npm run test:writer -- odt-property-roundtrip.test.ts txtprmap.test.ts native-import-style-contracts.test.ts native-text-import-api.test.ts odt-worker --maxWorkers 2 --testTimeout 120000`.
- Run the office workspace typecheck and ESLint and Prettier on changed TypeScript.
- Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T18:42:17.884Z — VERIFY — ok

By: CODER

Note: 63 focused Writer tests, four Calc ODS reuse tests, office typechecking, lint and format checks, module boundaries, registry provenance and AgentPlane policy checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:41:11.427Z, excerpt_hash=sha256:08541934fdd87308ead8e0256e8d9ced35cc0cb3c971926da3c57e860e341296

Details:

Command: npm run test:writer -- odt-property-roundtrip.test.ts txtprmap.test.ts native-import-style-contracts.test.ts native-text-import-api.test.ts odt-worker odt-native-character-values.test.ts --maxWorkers 2 --testTimeout 120000
Result: pass
Evidence: 63 tests across six files.
Scope: named styles, direct formatting, pinned overline attributes, native effect normalization and Worker to ODT round-trip.

Command: npm run test:calc -- ods-rich-text-fields.test.ts --maxWorkers 2 --testTimeout 120000
Result: pass
Evidence: four tests in one file.
Scope: Calc rich text XML reuse of the shared property map.

Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo
Result: pass
Evidence: exit zero.
Scope: office TypeScript.

Command: npx eslint and npx prettier --check on all eight changed TypeScript files
Result: pass
Evidence: no diagnostics or formatting issues.
Scope: changed TypeScript.

Command: npm run check:dependencies && npm run check:source-provenance
Result: pass
Evidence: 2977 dependency-checked sources and 2978 provenance records. The UNO FontRelief group preserves the native module boundary.
Scope: dependencies and source registry.

Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check
Result: pass
Evidence: routing OK, zero doctor errors, existing hook shim warning, no whitespace errors.
Scope: gateway and implementation diff.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211835-BN5ECR/blueprint/resolved-snapshot.json
- old_digest: 9adca2c97518b301dc2ec314d0f0e40853426209780b22a195e4ea126357a6d0
- current_digest: 9adca2c97518b301dc2ec314d0f0e40853426209780b22a195e4ea126357a6d0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211835-BN5ECR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211835-BN5ECR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit.

## Findings

None recorded yet.

- Observation: The dependency checker rejected using VCL font relief constants from xmloff.
  Impact: The ODF handler needs the original UNO short constants from offapi.
  Resolution: Port offapi/com/sun/star/text/FontRelief.idl as the existing TypeScript constant-group pattern. Keep VCL and UNO values in their native modules.
