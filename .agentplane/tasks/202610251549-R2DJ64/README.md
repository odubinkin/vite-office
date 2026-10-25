---
id: "202610251549-R2DJ64"
title: "Implement shared OOXML package relationships and filter infrastructure"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "ooxml"
verify:
  - "Focused OOXML package, ZIP, SAX and filter-routing tests; typecheck and relevant repository quality gates; doctor and routing."
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T15:51:20.234Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "needs_rework"
  updated_at: "2026-10-25T16:05:33.629Z"
  updated_by: "CODER"
  note: "Closure review found a leading-dot filename boundary in WriteContentTypes; preserve original DirectoryHelper positive-offset extension condition and refresh its focused coverage before closure."
  attempts: 1
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved shared OOXML package and fragment contracts from the local pinned LibreOffice source, with focused tests and unchanged product storage behavior."
events:
  -
    type: "status"
    at: "2026-10-25T15:51:20.681Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved shared OOXML package and fragment contracts from the local pinned LibreOffice source, with focused tests and unchanged product storage behavior."
  -
    type: "verify"
    at: "2026-10-25T16:04:58.860Z"
    author: "CODER"
    state: "ok"
    note: "PASS: 74 related cases; seven new complete modules fresh 100% S320 B186 F77 L297; complete changed ZipPackage fresh 100% S118 B66 F6 L104 through 40 cases; four pinned strict/transitional DOCX/XLSX package tests pass. Typecheck, build, scoped lint/format, architecture, docs, size, tree, provenance, inventory, static, doctor/routing/diff pass. Detailed commands, hashes, initial corrections and boundaries: evidence/verification.json. First task after full checkpoint; model/UI filters remain dependent work."
  -
    type: "verify"
    at: "2026-10-25T16:05:33.629Z"
    author: "CODER"
    state: "needs_rework"
    note: "Closure review found a leading-dot filename boundary in WriteContentTypes; preserve original DirectoryHelper positive-offset extension condition and refresh its focused coverage before closure."
doc_version: 3
doc_updated_at: "2026-10-25T16:05:33.684Z"
doc_updated_by: "CODER"
description: "User-approved first of three cohesive OOXML tasks. Implement upstream-owned OPC storage, content types, relationships, XML fragment import/export and format identities for Writer DOCX and Calc XLSX using existing ZIP/SAX and medium contracts. Preserve browser persistence decisions. Local pinned source research only; related tests and integration gates; no full suite due after SWRD7X checkpoint."
sections:
  Summary: |-
    Implement shared OOXML package relationships and filter infrastructure

    User-approved first of three cohesive OOXML tasks. Implement upstream-owned OPC storage, content types, relationships, XML fragment import/export and format identities for Writer DOCX and Calc XLSX using existing ZIP/SAX and medium contracts. Preserve browser persistence decisions. Local pinned source research only; related tests and integration gates; no full suite due after SWRD7X checkpoint.
  Scope: "Implement oox/source/core/{relations,relationshandler,fragmenthandler,xmlfilterbase}.ts, oox/source/helper/zipstorage.ts, comphelper/source/xml/ofopxmlhelper.ts and native package content-type responsibilities if required. Reuse ZIP and SAX infrastructure; update the dependency graph and paired shared registry records. Include related colocated tests, upstream fixture tests and shared suspected-issue evidence in the two user-requested issue documents when relevant. Approximately 8 production modules plus paired records and tests. No app feature/UI changes in this prerequisite; Writer/Calc integration follows in V4DQJW/J0Z0KF. No network, recovery, autosave, release or publication changes."
  Plan: "1. Compare pinned Relations, RelationsFragment, XmlFilterBase, ZipStorage, OFOPXMLHelper and ZipPackage contracts. 2. Translate the consumed package and XML-context responsibilities, preserving native first-ID ordering, type comparison, relative paths, optional fragment handling, output content types and relationship ownership. 3. Add real package roundtrips and pinned DOCX/XLSX package tests, including errors and strict/transitional relationships. 4. Update source ownership evidence, run scoped verification, record results and close locally. User approved all three tasks in chat on 2026-10-25. CODER owns implementation and verification; self-activate roles sequentially."
  Verify Steps: "Run npm run test:shared -- src/oox src/comphelper/source/xml/ofopxmlhelper.test.ts src/package/source/zipapi/ZipFile.test.ts src/sax/source/fastparser/fastparser.test.ts. Require tests for native sorted-ID/duplicate/type/relative-target contracts, missing/malformed fragments, caching, root and part relations, strict/transitional input and actual pinned DOCX/XLSX ZIP packages plus export/reopen and XML escaping. Measure new executable modules with unchanged 100% scoped coverage thresholds. Run npm run typecheck, scoped eslint/prettier, npm run build, npm run check:dependencies, npm run check:docs, npm run check:file-size, npm run check:source-tree, npm run check:source-provenance, npm run inventory:registry:build, npm run inventory:invariants, npm run inventory:parity, node scripts/check-static-build.mjs, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Full suite is not due: first task after the SWRD7X full checkpoint."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-25T16:04:58.860Z — VERIFY — ok

    By: CODER

    Note: PASS: 74 related cases; seven new complete modules fresh 100% S320 B186 F77 L297; complete changed ZipPackage fresh 100% S118 B66 F6 L104 through 40 cases; four pinned strict/transitional DOCX/XLSX package tests pass. Typecheck, build, scoped lint/format, architecture, docs, size, tree, provenance, inventory, static, doctor/routing/diff pass. Detailed commands, hashes, initial corrections and boundaries: evidence/verification.json. First task after full checkpoint; model/UI filters remain dependent work.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:04:58.343Z, excerpt_hash=sha256:1020160bed4cb07b6a9e8b212931553497d9cc404ac82e95d6ad5d5fc0ea0bf0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610251549-R2DJ64/blueprint/resolved-snapshot.json
    - old_digest: 1c48362813f7dbab1101c2fe5f0812fec7bcc75cf482ae1a70d140bb9365ef2e
    - current_digest: 1c48362813f7dbab1101c2fe5f0812fec7bcc75cf482ae1a70d140bb9365ef2e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251549-R2DJ64

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610251549-R2DJ64 -m 🧩 R2DJ64 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-25T16:05:33.629Z — VERIFY — needs_rework

    By: CODER

    Note: Closure review found a leading-dot filename boundary in WriteContentTypes; preserve original DirectoryHelper positive-offset extension condition and refresh its focused coverage before closure.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:05:33.070Z, excerpt_hash=sha256:1020160bed4cb07b6a9e8b212931553497d9cc404ac82e95d6ad5d5fc0ea0bf0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610251549-R2DJ64/blueprint/resolved-snapshot.json
    - old_digest: 1c48362813f7dbab1101c2fe5f0812fec7bcc75cf482ae1a70d140bb9365ef2e
    - current_digest: 1c48362813f7dbab1101c2fe5f0812fec7bcc75cf482ae1a70d140bb9365ef2e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251549-R2DJ64

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610251549-R2DJ64 --result verified-202610251549-R2DJ64 --commit 78a86b891cb3de2a24d5c26334e09d7f2e6cf0e9
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
    Preflight: clean main at 95c155081; direct mode; local pinned LibreOffice baseline 9bc445578031fecf56086729d8e4940c77e14d65. Existing ZIP32/SAX can be reused. Native imports use ZIP storage independent of ODF manifests. RelationsFragment ignores incomplete entries, retains the first duplicate ID and treats any non-Internal TargetMode as external. Relations traverses std::map lexical ID order and uses ASCII-only case folding. Preserve these contracts. No code has been implemented or verified yet.

    - Observation: Initial checks: typecheck found missing inert base callback parameters and an invalid PropertyValue.dispose call; both corrected using the existing Name/Value lifetime APIs. The authored package profile passed 74 tests; seven new modules reached fresh strict 100 percent coverage. Supplemental pinned package test found the hello.docx fixture contains lowercase hello, not Hello; JSDoc gate requires comments on eight assertion callbacks.
      Impact: These are local implementation/test authoring corrections inside the approved package task; no contract, scope or verification gate change is needed.
      Resolution: Preserve fixture bytes and source behavior; correct only the literal assertion and callback documentation, rerun the affected test/gate, then complete the pending local quality checks. No thresholds or exclusions changed.

    - Observation: Shared OOXML implementation verified. Command/results and current source SHA256 values: evidence/verification.json. First related profile: 74 tests passed. Fresh seven-module profile: 57 tests, S320 B186 F77 L297 all 100 percent. Full changed ZipPackage owner: 40 tests, S118 B66 F6 L104 all 100 percent. Four original pinned DOCX/XLSX package checks pass with no skips, including Strict. Initial supplemental profile had one wrong uppercase Hello expectation; corrected to exact lowercase fixture content. Typecheck/build/scoped format/lint/dependencies/docs/size/tree/provenance/registry/invariants/parity/static/doctor/routing/diff pass.
      Impact: The approved package prerequisite is functional and tested; it does not claim Writer or Calc feature/filter/UI support. No network, product autosave/recovery changes, parity promotions or full suite were performed. One pre-existing doctor hook-readiness warning remains outside scope.
      Resolution: Preserve native OFOPXMLHelper extension-first precedence and record WRITER093/CALC-285. Keep whole-module semantic parity unverified. Close this prerequisite with source/quality evidence and proceed to approved DOCX/XLSX application integration; full suite remains due at task ten.

    - Observation: Final source review of DirectoryHelper::splitAtLastToken found that a dot at offset zero does not produce an extension. The first WriteContentTypes translation treated .xml as extension xml and could omit a native-required override.
      Impact: One root leading-dot filename case differs inside the approved metadata responsibility. No scope expansion; existing ordinary path cases and all earlier evidence remain retained.
      Resolution: Restore the original positive-offset condition, add an explicit root .xml PropertyValue acceptance, and refresh the affected complete-owner coverage and source hashes before final verification.
id_source: "generated"
---
## Summary

Implement shared OOXML package relationships and filter infrastructure

User-approved first of three cohesive OOXML tasks. Implement upstream-owned OPC storage, content types, relationships, XML fragment import/export and format identities for Writer DOCX and Calc XLSX using existing ZIP/SAX and medium contracts. Preserve browser persistence decisions. Local pinned source research only; related tests and integration gates; no full suite due after SWRD7X checkpoint.

## Scope

Implement oox/source/core/{relations,relationshandler,fragmenthandler,xmlfilterbase}.ts, oox/source/helper/zipstorage.ts, comphelper/source/xml/ofopxmlhelper.ts and native package content-type responsibilities if required. Reuse ZIP and SAX infrastructure; update the dependency graph and paired shared registry records. Include related colocated tests, upstream fixture tests and shared suspected-issue evidence in the two user-requested issue documents when relevant. Approximately 8 production modules plus paired records and tests. No app feature/UI changes in this prerequisite; Writer/Calc integration follows in V4DQJW/J0Z0KF. No network, recovery, autosave, release or publication changes.

## Plan

1. Compare pinned Relations, RelationsFragment, XmlFilterBase, ZipStorage, OFOPXMLHelper and ZipPackage contracts. 2. Translate the consumed package and XML-context responsibilities, preserving native first-ID ordering, type comparison, relative paths, optional fragment handling, output content types and relationship ownership. 3. Add real package roundtrips and pinned DOCX/XLSX package tests, including errors and strict/transitional relationships. 4. Update source ownership evidence, run scoped verification, record results and close locally. User approved all three tasks in chat on 2026-10-25. CODER owns implementation and verification; self-activate roles sequentially.

## Verify Steps

Run npm run test:shared -- src/oox src/comphelper/source/xml/ofopxmlhelper.test.ts src/package/source/zipapi/ZipFile.test.ts src/sax/source/fastparser/fastparser.test.ts. Require tests for native sorted-ID/duplicate/type/relative-target contracts, missing/malformed fragments, caching, root and part relations, strict/transitional input and actual pinned DOCX/XLSX ZIP packages plus export/reopen and XML escaping. Measure new executable modules with unchanged 100% scoped coverage thresholds. Run npm run typecheck, scoped eslint/prettier, npm run build, npm run check:dependencies, npm run check:docs, npm run check:file-size, npm run check:source-tree, npm run check:source-provenance, npm run inventory:registry:build, npm run inventory:invariants, npm run inventory:parity, node scripts/check-static-build.mjs, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Full suite is not due: first task after the SWRD7X full checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-25T16:04:58.860Z — VERIFY — ok

By: CODER

Note: PASS: 74 related cases; seven new complete modules fresh 100% S320 B186 F77 L297; complete changed ZipPackage fresh 100% S118 B66 F6 L104 through 40 cases; four pinned strict/transitional DOCX/XLSX package tests pass. Typecheck, build, scoped lint/format, architecture, docs, size, tree, provenance, inventory, static, doctor/routing/diff pass. Detailed commands, hashes, initial corrections and boundaries: evidence/verification.json. First task after full checkpoint; model/UI filters remain dependent work.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:04:58.343Z, excerpt_hash=sha256:1020160bed4cb07b6a9e8b212931553497d9cc404ac82e95d6ad5d5fc0ea0bf0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610251549-R2DJ64/blueprint/resolved-snapshot.json
- old_digest: 1c48362813f7dbab1101c2fe5f0812fec7bcc75cf482ae1a70d140bb9365ef2e
- current_digest: 1c48362813f7dbab1101c2fe5f0812fec7bcc75cf482ae1a70d140bb9365ef2e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251549-R2DJ64

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610251549-R2DJ64 -m 🧩 R2DJ64 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-25T16:05:33.629Z — VERIFY — needs_rework

By: CODER

Note: Closure review found a leading-dot filename boundary in WriteContentTypes; preserve original DirectoryHelper positive-offset extension condition and refresh its focused coverage before closure.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:05:33.070Z, excerpt_hash=sha256:1020160bed4cb07b6a9e8b212931553497d9cc404ac82e95d6ad5d5fc0ea0bf0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610251549-R2DJ64/blueprint/resolved-snapshot.json
- old_digest: 1c48362813f7dbab1101c2fe5f0812fec7bcc75cf482ae1a70d140bb9365ef2e
- current_digest: 1c48362813f7dbab1101c2fe5f0812fec7bcc75cf482ae1a70d140bb9365ef2e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251549-R2DJ64

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610251549-R2DJ64 --result verified-202610251549-R2DJ64 --commit 78a86b891cb3de2a24d5c26334e09d7f2e6cf0e9
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

Preflight: clean main at 95c155081; direct mode; local pinned LibreOffice baseline 9bc445578031fecf56086729d8e4940c77e14d65. Existing ZIP32/SAX can be reused. Native imports use ZIP storage independent of ODF manifests. RelationsFragment ignores incomplete entries, retains the first duplicate ID and treats any non-Internal TargetMode as external. Relations traverses std::map lexical ID order and uses ASCII-only case folding. Preserve these contracts. No code has been implemented or verified yet.

- Observation: Initial checks: typecheck found missing inert base callback parameters and an invalid PropertyValue.dispose call; both corrected using the existing Name/Value lifetime APIs. The authored package profile passed 74 tests; seven new modules reached fresh strict 100 percent coverage. Supplemental pinned package test found the hello.docx fixture contains lowercase hello, not Hello; JSDoc gate requires comments on eight assertion callbacks.
  Impact: These are local implementation/test authoring corrections inside the approved package task; no contract, scope or verification gate change is needed.
  Resolution: Preserve fixture bytes and source behavior; correct only the literal assertion and callback documentation, rerun the affected test/gate, then complete the pending local quality checks. No thresholds or exclusions changed.

- Observation: Shared OOXML implementation verified. Command/results and current source SHA256 values: evidence/verification.json. First related profile: 74 tests passed. Fresh seven-module profile: 57 tests, S320 B186 F77 L297 all 100 percent. Full changed ZipPackage owner: 40 tests, S118 B66 F6 L104 all 100 percent. Four original pinned DOCX/XLSX package checks pass with no skips, including Strict. Initial supplemental profile had one wrong uppercase Hello expectation; corrected to exact lowercase fixture content. Typecheck/build/scoped format/lint/dependencies/docs/size/tree/provenance/registry/invariants/parity/static/doctor/routing/diff pass.
  Impact: The approved package prerequisite is functional and tested; it does not claim Writer or Calc feature/filter/UI support. No network, product autosave/recovery changes, parity promotions or full suite were performed. One pre-existing doctor hook-readiness warning remains outside scope.
  Resolution: Preserve native OFOPXMLHelper extension-first precedence and record WRITER093/CALC-285. Keep whole-module semantic parity unverified. Close this prerequisite with source/quality evidence and proceed to approved DOCX/XLSX application integration; full suite remains due at task ten.

- Observation: Final source review of DirectoryHelper::splitAtLastToken found that a dot at offset zero does not produce an extension. The first WriteContentTypes translation treated .xml as extension xml and could omit a native-required override.
  Impact: One root leading-dot filename case differs inside the approved metadata responsibility. No scope expansion; existing ordinary path cases and all earlier evidence remain retained.
  Resolution: Restore the original positive-offset condition, add an explicit root .xml PropertyValue acceptance, and refresh the affected complete-owner coverage and source hashes before final verification.
