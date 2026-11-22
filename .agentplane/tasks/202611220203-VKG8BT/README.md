---
id: "202611220203-VKG8BT"
title: "Align shared Writer ODT and Calc ODS font member import"
result_summary: "Shared native font member mapping preserves three script families, declaration and inline handling, named-style export and Writer ODT and Calc ODS Worker round trips."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "odf"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T02:04:08.376Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T02:14:12.710Z"
  updated_by: "CODER"
  note: "Writer ODT and Calc ODS share original font member resolution and named-style export. 113 focused tests and all declared static checks pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T02:14:23.372Z"
  updated_by: "EVALUATOR"
  note: "The reviewed font maps follow the pinned three-script family/style/generic/pitch/charset contract across Writer ODT and Calc ODS."
  evaluated_sha: "b69569c9627554ecabcc989d1979147f83da7217"
  blueprint_digest: "0eb7aebfcfa5d844305bd4e6d995ed6fb0a147bd7ca8314680789416f65665b5"
  evidence_refs:
    - ".agentplane/tasks/202611220203-VKG8BT/README.md"
    - ".agentplane/tasks/202611220203-VKG8BT/quality/20261122-021423372-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220203-VKG8BT/quality/20261122-021423372-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220203-VKG8BT/quality/20261122-021423372-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220203-VKG8BT/blueprint/resolved-snapshot.json"
    - "b69569c96275 and 113 passing related tests"
    - "docs/program/writer-upstream-suspected-issues.md#WRITER-737"
    - "docs/program/calc-upstream-suspected-issues.md#CALC-820"
  findings:
    - "Direct families and declaration members share original lexical parsing and ordering. Named styles emit native compatibility attributes, automatic styles preserve references, and both Worker paths keep native font state."
commit:
  hash: "b69569c9627554ecabcc989d1979147f83da7217"
  message: "🧩 VKG8BT code: align native ODF font member maps"
comments:
  -
    author: "CODER"
    body: "Start: align the original shared font property selection, lexical conversions and defaults in the two ODF filters without changing font embedding or file lifecycle."
  -
    author: "CODER"
    body: "Verified: 113 focused tests, typecheck, lint, formatting, module boundaries, provenance, Writer and Calc registry invariants, policy routing and doctor."
events:
  -
    type: "status"
    at: "2026-11-22T02:04:14.057Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align the original shared font property selection, lexical conversions and defaults in the two ODF filters without changing font embedding or file lifecycle."
  -
    type: "verify"
    at: "2026-11-22T02:14:12.710Z"
    author: "CODER"
    state: "ok"
    note: "Writer ODT and Calc ODS share original font member resolution and named-style export. 113 focused tests and all declared static checks pass."
  -
    type: "status"
    at: "2026-11-22T02:16:10.533Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 113 focused tests, typecheck, lint, formatting, module boundaries, provenance, Writer and Calc registry invariants, policy routing and doctor."
doc_version: 3
doc_updated_at: "2026-11-22T02:16:10.534Z"
doc_updated_by: "CODER"
description: "Unify font declaration and inline property resolution through the original three-script xmloff font member map, preserving file export and Worker round trips."
sections:
  Summary: "Align the consumed xmloff five-member font property path for western, CJK, and CTL typography in Writer ODT and Calc ODS."
  Scope: |-
    - Port native family-list lexical handling and the font declaration/inline property map for family names, style, generic family, pitch, and character encoding.
    - Reuse the common mapper in Writer character and paragraph styles and Calc cell and edit-run styles. Retain valid declarations, import the source-supported inline fallback, and preserve native default and failed-conversion behavior.
    - Verify real ODT and ODS package and Worker round trips. Leave unrelated font embedding, browser font loading, unsupported text layout, and file lifecycle outside this task.
  Plan: |-
    1. Trace the pinned font handlers, XMLFontStylesContext, XMLTextImportPropertyMapper, Writer style/UNO path, and Calc edit/cell style paths.
    2. Replace the separate declaration-only or bare family handling with the represented common script font member conversion, exercising source-order interactions and defaults.
    3. Replay applicable LibreOffice regression inputs. Verify round trips, diagnostics on malformed values and exact lexical boundary cases. Record suspect source behavior where reproduced.
  Verify Steps: |-
    - Run related Writer ODT font, text-style and Worker cases and Calc ODS native font, rich-text, style and Worker cases.
    - Run shared sax/xmloff font-name and family/pitch/encoding tests.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer and Calc registry invariants, routing, AgentPlane doctor and git diff checks.
    - Record scoped verification, commit the implementation and evidence, then graph-refresh and close. This is the seventh task in the current ten-task cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T02:14:12.710Z — VERIFY — ok

    By: CODER

    Note: Writer ODT and Calc ODS share original font member resolution and named-style export. 113 focused tests and all declared static checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:04:14.057Z, excerpt_hash=sha256:256dcc52cb4ba73e19fd6688b3fb683cf084c35c2512996b797995418c431d3a

    Details:

    - Command: `npm run test:writer -- odt-font odt-roundtrip odt-worker odt-native-character-values odt-paragraph-hyphenation odt-embedded-fonts`.
      Result: pass. Evidence: 58 tests in 8 files. Scope: three script slots, native font declaration ordering, missing declarations with inline fallback, ODT and Worker, existing font resources and related style behavior.
    - Command: `npm run test:calc -- ods-native-fonts ods-rich-text-fields ods-style-routing ods-worker ods-xml-boundaries`.
      Result: pass. Evidence: 31 tests in 8 files. Scope: five-member named cell fonts, rich-text edit runs, styles and compatibility across ODS and Worker.
    - Command: `npm run test:shared -- txtimppr.test txtpara.test native-bullet-font native-legacy-bullet-symbol XMLFontAutoStylePool fonthdl converter.test`.
      Result: pass. Evidence: 24 tests in 7 files. Scope: the original font family lexical scanner, SAX order and defaulting, named and automatic font pool behavior and exact export quoting.
    - Commands: scoped `npx eslint --max-warnings 0`, `npx prettier --check`, Office workspace typecheck with `--singleThreaded --checkers 1 --incremental`, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run inventory:invariants -- --scope writer`, `npm run inventory:invariants -- --scope calc`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
      Result: pass. Evidence: 2,993 runtime sources in module boundaries, 2,994 source provenance modules, routing OK and 0 doctor errors with the existing hook shim warning.
    - WRITER-737 and CALC-820 record the encoding handler's presence-without-value behavior. Font embedding and installed system font handling stay outside this change. This is the seventh task in the ten-task cadence.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220203-VKG8BT/blueprint/resolved-snapshot.json
    - old_digest: 0eb7aebfcfa5d844305bd4e6d995ed6fb0a147bd7ca8314680789416f65665b5
    - current_digest: 0eb7aebfcfa5d844305bd4e6d995ed6fb0a147bd7ca8314680789416f65665b5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220203-VKG8BT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220203-VKG8BT
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit and source registry changes, then rerun both applications' ODF font and Worker regressions."
  Findings: ""
id_source: "generated"
---
## Summary

Align the consumed xmloff five-member font property path for western, CJK, and CTL typography in Writer ODT and Calc ODS.

## Scope

- Port native family-list lexical handling and the font declaration/inline property map for family names, style, generic family, pitch, and character encoding.
- Reuse the common mapper in Writer character and paragraph styles and Calc cell and edit-run styles. Retain valid declarations, import the source-supported inline fallback, and preserve native default and failed-conversion behavior.
- Verify real ODT and ODS package and Worker round trips. Leave unrelated font embedding, browser font loading, unsupported text layout, and file lifecycle outside this task.

## Plan

1. Trace the pinned font handlers, XMLFontStylesContext, XMLTextImportPropertyMapper, Writer style/UNO path, and Calc edit/cell style paths.
2. Replace the separate declaration-only or bare family handling with the represented common script font member conversion, exercising source-order interactions and defaults.
3. Replay applicable LibreOffice regression inputs. Verify round trips, diagnostics on malformed values and exact lexical boundary cases. Record suspect source behavior where reproduced.

## Verify Steps

- Run related Writer ODT font, text-style and Worker cases and Calc ODS native font, rich-text, style and Worker cases.
- Run shared sax/xmloff font-name and family/pitch/encoding tests.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer and Calc registry invariants, routing, AgentPlane doctor and git diff checks.
- Record scoped verification, commit the implementation and evidence, then graph-refresh and close. This is the seventh task in the current ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T02:14:12.710Z — VERIFY — ok

By: CODER

Note: Writer ODT and Calc ODS share original font member resolution and named-style export. 113 focused tests and all declared static checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:04:14.057Z, excerpt_hash=sha256:256dcc52cb4ba73e19fd6688b3fb683cf084c35c2512996b797995418c431d3a

Details:

- Command: `npm run test:writer -- odt-font odt-roundtrip odt-worker odt-native-character-values odt-paragraph-hyphenation odt-embedded-fonts`.
  Result: pass. Evidence: 58 tests in 8 files. Scope: three script slots, native font declaration ordering, missing declarations with inline fallback, ODT and Worker, existing font resources and related style behavior.
- Command: `npm run test:calc -- ods-native-fonts ods-rich-text-fields ods-style-routing ods-worker ods-xml-boundaries`.
  Result: pass. Evidence: 31 tests in 8 files. Scope: five-member named cell fonts, rich-text edit runs, styles and compatibility across ODS and Worker.
- Command: `npm run test:shared -- txtimppr.test txtpara.test native-bullet-font native-legacy-bullet-symbol XMLFontAutoStylePool fonthdl converter.test`.
  Result: pass. Evidence: 24 tests in 7 files. Scope: the original font family lexical scanner, SAX order and defaulting, named and automatic font pool behavior and exact export quoting.
- Commands: scoped `npx eslint --max-warnings 0`, `npx prettier --check`, Office workspace typecheck with `--singleThreaded --checkers 1 --incremental`, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run inventory:invariants -- --scope writer`, `npm run inventory:invariants -- --scope calc`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
  Result: pass. Evidence: 2,993 runtime sources in module boundaries, 2,994 source provenance modules, routing OK and 0 doctor errors with the existing hook shim warning.
- WRITER-737 and CALC-820 record the encoding handler's presence-without-value behavior. Font embedding and installed system font handling stay outside this change. This is the seventh task in the ten-task cadence.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220203-VKG8BT/blueprint/resolved-snapshot.json
- old_digest: 0eb7aebfcfa5d844305bd4e6d995ed6fb0a147bd7ca8314680789416f65665b5
- current_digest: 0eb7aebfcfa5d844305bd4e6d995ed6fb0a147bd7ca8314680789416f65665b5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220203-VKG8BT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220203-VKG8BT
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit and source registry changes, then rerun both applications' ODF font and Worker regressions.

## Findings
