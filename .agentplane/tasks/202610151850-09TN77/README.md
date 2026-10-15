---
id: "202610151850-09TN77"
title: "Connect configured font candidates to browser faces"
result_summary: "Connected shared configured font roles/Locale to real registered browser faces and asynchronous preparation before Writer document construction; Calc uses the same generic boundary. Full physical/default-font services and Calc document/UI/ODS remain pending."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T18:50:37.052Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T19:13:22.987Z"
  updated_by: "CODER"
  note: "PASS:39 related/187 Calc tests, exact shared+main and Calc raw100,13 gates/43 boundary tests, build and20 browser cases.6 pinned blobs/7 roles audited,30 guard bodies unchanged, references restored; no full native device or UI/ODS readiness claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T19:14:26.262Z"
  updated_by: "EVALUATOR"
  note: "Generic configured native-role/Locale font matching now uses actual registered loaded browser faces, with preparation awaited before Writer document factories mount."
  evaluated_sha: "be822b78226a692b6d4b30c899b198a17a1e8a5d"
  blueprint_digest: "de5016982f07993c247168092b23186466b428e957aa061826688dacafe0b498"
  evidence_refs:
    - ".agentplane/tasks/202610151850-09TN77/README.md"
    - ".agentplane/tasks/202610151850-09TN77/quality/20261015-191426262-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151850-09TN77/quality/20261015-191426262-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151850-09TN77/quality/20261015-191426262-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151850-09TN77/blueprint/resolved-snapshot.json"
    - "output/playwright/task165-checks/final-verification.json"
    - "apps/office/e2e/shared/configured-font-device.spec.ts"
    - "apps/office/src/main.test.ts"
  findings:
    - "Same-agent review, not independent.39 related/187 Calc cases pass; exact4 related owners include main entrypoint explicitly and2 Writer owners. Shared+main/Calc raw100; Writer-only composition gaps exempt.13 gates/43 boundary cases, build,19 Writer and1 shared real-Chromium case pass.6 pinned blobs/7 roles audited;30 guard bodies unchanged and only source-backed dependency edges added. Real bundled fonts verify actual alias normalization, loaded-state synchronization, CSS family serialization, deletion and error/next candidate. Full physical best-match/substitution, remaining native Font/config services, Writer legacy fallback and Calc model/UI/ODS are explicit gaps; no full-goal promotion."
commit:
  hash: "f464b10dcee2b843267d2e9db0f882ad9f018e78"
  message: "🧩 09TN77 task: record browser configured font review"
comments:
  -
    author: "CODER"
    body: "Start: connect genuine configured candidate lists and normalization to browser FontFace preparation/matching before Writer document construction, preserving explicit native service gaps."
  -
    author: "CODER"
    body: "Verified:39 related/187 Calc tests, shared+entrypoint/Calc raw100,13 gates/43 boundary tests, build and20 browser cases pass; native source edges audited and4 references restored."
events:
  -
    type: "status"
    at: "2026-10-15T18:50:41.492Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect genuine configured candidate lists and normalization to browser FontFace preparation/matching before Writer document construction, preserving explicit native service gaps."
  -
    type: "verify"
    at: "2026-10-15T19:13:22.987Z"
    author: "CODER"
    state: "ok"
    note: "PASS:39 related/187 Calc tests, exact shared+main and Calc raw100,13 gates/43 boundary tests, build and20 browser cases.6 pinned blobs/7 roles audited,30 guard bodies unchanged, references restored; no full native device or UI/ODS readiness claim."
  -
    type: "status"
    at: "2026-10-15T19:14:34.386Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified:39 related/187 Calc tests, shared+entrypoint/Calc raw100,13 gates/43 boundary tests, build and20 browser cases pass; native source edges audited and4 references restored."
doc_version: 3
doc_updated_at: "2026-10-15T19:14:34.387Z"
doc_updated_by: "CODER"
description: "Task165: replace Writer-specific hardcoded CSS check adapter with shared DefaultFontType/Locale matching against registered browser faces; prepare candidate fonts before real Writer document construction, reuse native normalization/query/token owners, and expose the same generic boundary for Calc."
sections:
  Summary: "Task165: generic shared configured-font device binding on actual registered/loaded browser faces, with real Writer bootstrap preparation."
  Scope: "Shared vcl/browser/default-font-device.ts and tests; Writer native role mapping/default-font tests, composition preparation and bootstrap main; a focused real-browser acceptance; related shared/Writer runtime/provenance/capability records and Calc docs (up to25 non-task paths, plus source-backed dependency edges if necessary). Retain explicit missing physical substitution/full OutputDevice/font metadata/config override services. No fake PhysicalFontCollection, guessed installed font list, new memory manager/native compiler or full-suite/UI readiness claim."
  Plan: "Inspect actual FontFace family/status/check behavior with bundled font data in a real browser. Implement generic DefaultFontType/Locale device query and async preparation over registered faces, using existing configured lists, native token parsing and search normalization. Match only successfully loaded faces synchronously; async preparation loads candidates in source order and can continue past failed resources. Use real platform CSS parsing/serialization behavior without guessing system font availability. Map Writer roles in Writer ownership, adapt its existing device port, and await required browser font preparation before main mounts document sessions. Test Calc spreadsheet role using the same generic device. Update original metadata boundaries honestly; strict raw100 on changed shared owners and whole Calc plus related Writer functional tests,13 gates, build and focused existing/new browser scenarios. No full app suite until minimum real UI/ODS milestone."
  Verify Steps: "Verify pinned OutputDevice GetDefaultFont matched-family loop, PhysicalFontCollection lookup normalization and Writer text/heading/fixed role mapping. Real browser: demonstrate missing-font check result, inspect quoted/unquoted FontFace family descriptors and load bundled fonts. Unit acceptance: exact configured order, normalized aliases, missing/errored/unloaded/loaded families, load failure/next candidate, live set changes and actual Locale values; Writer-to-native role mapping and bootstrap preparation; same generic spreadsheet role. Exact shared and Calc raw S/B/F/L100/all counters positive, related Writer tests with Writer-only coverage exemption.13 source gates and inventories, production build, focused browser flow with native refs absent/restored. Record any genuine platform limits; do not replace missing native best-match/substitution with invented fallback."
  Verification: |-
    Command: node output/playwright/task165-checks/portable.mjs (shared-only refresh uses strict-main.config.mjs removing only the existing main.tsx exclusion). Result:39 related tests/6 files PASS;187 Calc scenarios/76 files PASS. Exact related owner set includes Font device, main entrypoint and2 Writer owners. Shared raw S72/B30/F16/L65 and exact33 Calc owners S4179/B2731/F821/L3727 all100 with every raw counter positive. Writer-only composition coverage gaps exempt under user instruction. Command: node output/playwright/task165-checks/source-gates.mjs with scoped resumes/format-lint refresh. Result: all13 gates PASS including43 boundary tests; inventory/provenance pass, doctor OK with existing warning. All30 original guard function bodies unchanged; source-backed edges vcl-to-unotools/udkapi and sw-to-unotools recorded. Command: node output/playwright/task165-checks/build-browser-portable.mjs. Result: production build PASS,19 existing Writer cases PASS and1 shared real-Chromium configured-font case PASS,4 native links absent/restored. The shared browser case loads actual bundled fonts and verifies missing-family check false-positive, serialization/normalized spreadsheet role, synchronous absence before loading, live deletion, quoted family name and invalid-face/next-candidate behavior.6 pinned native blobs/7 Writer role mappings audited; no native compilation. Evidence: output/playwright/task165-checks/final-verification.json;21 intentional non-task paths/hashes. No full app suite or actual full physical/default-device/document/UI/ODS readiness claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T19:13:22.987Z — VERIFY — ok

    By: CODER

    Note: PASS:39 related/187 Calc tests, exact shared+main and Calc raw100,13 gates/43 boundary tests, build and20 browser cases.6 pinned blobs/7 roles audited,30 guard bodies unchanged, references restored; no full native device or UI/ODS readiness claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T19:13:22.226Z, excerpt_hash=sha256:3f7ced988f776ec95b67ad80712659dab0ec90f36089e210663477a5ed0769e8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151850-09TN77/blueprint/resolved-snapshot.json
    - old_digest: de5016982f07993c247168092b23186466b428e957aa061826688dacafe0b498
    - current_digest: de5016982f07993c247168092b23186466b428e957aa061826688dacafe0b498
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151850-09TN77

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610151850-09TN77
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task-specific source/tests/registry/docs commit together. Restore old synchronous browser entrypoint only by reverting the whole integration; preserve other task commits and source references."
  Findings: |-
    - Observation: Initial related run:24 cases passed,2 suites could not transform. New vcl/browser imports used ../../../ instead of ../../ to the shared source root.
      Impact: The generic adapter/composition tests did not execute; no coverage or behavior claim can be made for that attempt.
      Resolution: Correct the source and test relative imports, retain the failed log and rerun the related profile before Calc. Scope and acceptance criteria unchanged.

    - Observation: Related38 and Calc187 cases passed. The normal coverage config excludes main.tsx, so the first profile measured only the font device plus Writer owners. Source format gate then flagged formatting after relative-import correction.
      Impact: Entrypoint code requires explicit task coverage inclusion; formatting must be refreshed before static acceptance.
      Resolution: Use an ignored task config removing only main.tsx exclusion, keeping all other exclusions and strict raw owner checks; refreshed profile measures exact4 owners including main with shared raw100. Run Prettier on changed sources and resume gates; no repository thresholds weakened.

    - Observation: The added Arabic locale fixture initially assumed legacy Noto Naskh Arabic, but pinned ar/CTL_TEXT lists Tahoma/Lucidasans/Lucida Sans/Arial Unicode MS. The actual generic query correctly did not select the legacy family.
      Impact: Browser matching must use original configured lists rather than carry over the old hardcoded adapter assumption.
      Resolution: Use a registered Tahoma face in the source-backed locale fixture and expect Tahoma. Preserve the failed log; keep unsupported best-match/substitution explicit rather than adding the legacy font to the native list.

    - Observation: Static checks passed format/lint/typecheck; JSDoc gate flagged four short callbacks in the new browser-only fixture. The earlier format failure was specifically the E2E file, not the corrected import block.
      Impact: Browser acceptance is not complete until test documentation and all remaining gates pass.
      Resolution: Document the four callbacks and consume the intentionally broken FontFace loaded rejection, refresh changed-test format/lint and resume remaining gates. Core source/runtime behavior is unchanged.

    - Observation: Dependency gate rejected sw -> unotools for the actual shared DefaultFontType role IDs; native DocumentStylePoolManager includes unotools/fontdefs.hxx and Library_sw links utl.
      Impact: Writer must reuse the original shared enum rather than duplicate role constants or import browser policy into core.
      Resolution: Add only the original source-backed sw -> unotools edge, retaining runtime cycle and ownership checks, and refresh dependency/boundary gates.

    - Observation: Actual Chromium FontFaceSet.check accepts a nonexistent family; registered FontFace family descriptors are CSS serialized and require decoding before native search-key normalization. Actual bundled-font browser acceptance now validates this platform boundary.
      Impact: The previous hardcoded/unused-language adapter could report nonexistent fonts and could not be reused by Calc native roles.
      Resolution: Generic configured-role/prepared-Locale API now uses loaded registered faces and awaited preparation before main mounts document factories. Writer owns role mapping. Missing best-match/substitution/system enumeration/user configuration/full Font and legacy Writer requested-family policy remain explicit gaps, with no invented fallback or fake physical collection.
extensions:
  implementation_commit:
    hash: "be822b78226a692b6d4b30c899b198a17a1e8a5d"
    message: "🔧 09TN77 core: match configured fonts with registered browser faces"
id_source: "generated"
---
## Summary

Task165: generic shared configured-font device binding on actual registered/loaded browser faces, with real Writer bootstrap preparation.

## Scope

Shared vcl/browser/default-font-device.ts and tests; Writer native role mapping/default-font tests, composition preparation and bootstrap main; a focused real-browser acceptance; related shared/Writer runtime/provenance/capability records and Calc docs (up to25 non-task paths, plus source-backed dependency edges if necessary). Retain explicit missing physical substitution/full OutputDevice/font metadata/config override services. No fake PhysicalFontCollection, guessed installed font list, new memory manager/native compiler or full-suite/UI readiness claim.

## Plan

Inspect actual FontFace family/status/check behavior with bundled font data in a real browser. Implement generic DefaultFontType/Locale device query and async preparation over registered faces, using existing configured lists, native token parsing and search normalization. Match only successfully loaded faces synchronously; async preparation loads candidates in source order and can continue past failed resources. Use real platform CSS parsing/serialization behavior without guessing system font availability. Map Writer roles in Writer ownership, adapt its existing device port, and await required browser font preparation before main mounts document sessions. Test Calc spreadsheet role using the same generic device. Update original metadata boundaries honestly; strict raw100 on changed shared owners and whole Calc plus related Writer functional tests,13 gates, build and focused existing/new browser scenarios. No full app suite until minimum real UI/ODS milestone.

## Verify Steps

Verify pinned OutputDevice GetDefaultFont matched-family loop, PhysicalFontCollection lookup normalization and Writer text/heading/fixed role mapping. Real browser: demonstrate missing-font check result, inspect quoted/unquoted FontFace family descriptors and load bundled fonts. Unit acceptance: exact configured order, normalized aliases, missing/errored/unloaded/loaded families, load failure/next candidate, live set changes and actual Locale values; Writer-to-native role mapping and bootstrap preparation; same generic spreadsheet role. Exact shared and Calc raw S/B/F/L100/all counters positive, related Writer tests with Writer-only coverage exemption.13 source gates and inventories, production build, focused browser flow with native refs absent/restored. Record any genuine platform limits; do not replace missing native best-match/substitution with invented fallback.

## Verification

Command: node output/playwright/task165-checks/portable.mjs (shared-only refresh uses strict-main.config.mjs removing only the existing main.tsx exclusion). Result:39 related tests/6 files PASS;187 Calc scenarios/76 files PASS. Exact related owner set includes Font device, main entrypoint and2 Writer owners. Shared raw S72/B30/F16/L65 and exact33 Calc owners S4179/B2731/F821/L3727 all100 with every raw counter positive. Writer-only composition coverage gaps exempt under user instruction. Command: node output/playwright/task165-checks/source-gates.mjs with scoped resumes/format-lint refresh. Result: all13 gates PASS including43 boundary tests; inventory/provenance pass, doctor OK with existing warning. All30 original guard function bodies unchanged; source-backed edges vcl-to-unotools/udkapi and sw-to-unotools recorded. Command: node output/playwright/task165-checks/build-browser-portable.mjs. Result: production build PASS,19 existing Writer cases PASS and1 shared real-Chromium configured-font case PASS,4 native links absent/restored. The shared browser case loads actual bundled fonts and verifies missing-family check false-positive, serialization/normalized spreadsheet role, synchronous absence before loading, live deletion, quoted family name and invalid-face/next-candidate behavior.6 pinned native blobs/7 Writer role mappings audited; no native compilation. Evidence: output/playwright/task165-checks/final-verification.json;21 intentional non-task paths/hashes. No full app suite or actual full physical/default-device/document/UI/ODS readiness claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T19:13:22.987Z — VERIFY — ok

By: CODER

Note: PASS:39 related/187 Calc tests, exact shared+main and Calc raw100,13 gates/43 boundary tests, build and20 browser cases.6 pinned blobs/7 roles audited,30 guard bodies unchanged, references restored; no full native device or UI/ODS readiness claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T19:13:22.226Z, excerpt_hash=sha256:3f7ced988f776ec95b67ad80712659dab0ec90f36089e210663477a5ed0769e8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151850-09TN77/blueprint/resolved-snapshot.json
- old_digest: de5016982f07993c247168092b23186466b428e957aa061826688dacafe0b498
- current_digest: de5016982f07993c247168092b23186466b428e957aa061826688dacafe0b498
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151850-09TN77

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610151850-09TN77
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task-specific source/tests/registry/docs commit together. Restore old synchronous browser entrypoint only by reverting the whole integration; preserve other task commits and source references.

## Findings

- Observation: Initial related run:24 cases passed,2 suites could not transform. New vcl/browser imports used ../../../ instead of ../../ to the shared source root.
  Impact: The generic adapter/composition tests did not execute; no coverage or behavior claim can be made for that attempt.
  Resolution: Correct the source and test relative imports, retain the failed log and rerun the related profile before Calc. Scope and acceptance criteria unchanged.

- Observation: Related38 and Calc187 cases passed. The normal coverage config excludes main.tsx, so the first profile measured only the font device plus Writer owners. Source format gate then flagged formatting after relative-import correction.
  Impact: Entrypoint code requires explicit task coverage inclusion; formatting must be refreshed before static acceptance.
  Resolution: Use an ignored task config removing only main.tsx exclusion, keeping all other exclusions and strict raw owner checks; refreshed profile measures exact4 owners including main with shared raw100. Run Prettier on changed sources and resume gates; no repository thresholds weakened.

- Observation: The added Arabic locale fixture initially assumed legacy Noto Naskh Arabic, but pinned ar/CTL_TEXT lists Tahoma/Lucidasans/Lucida Sans/Arial Unicode MS. The actual generic query correctly did not select the legacy family.
  Impact: Browser matching must use original configured lists rather than carry over the old hardcoded adapter assumption.
  Resolution: Use a registered Tahoma face in the source-backed locale fixture and expect Tahoma. Preserve the failed log; keep unsupported best-match/substitution explicit rather than adding the legacy font to the native list.

- Observation: Static checks passed format/lint/typecheck; JSDoc gate flagged four short callbacks in the new browser-only fixture. The earlier format failure was specifically the E2E file, not the corrected import block.
  Impact: Browser acceptance is not complete until test documentation and all remaining gates pass.
  Resolution: Document the four callbacks and consume the intentionally broken FontFace loaded rejection, refresh changed-test format/lint and resume remaining gates. Core source/runtime behavior is unchanged.

- Observation: Dependency gate rejected sw -> unotools for the actual shared DefaultFontType role IDs; native DocumentStylePoolManager includes unotools/fontdefs.hxx and Library_sw links utl.
  Impact: Writer must reuse the original shared enum rather than duplicate role constants or import browser policy into core.
  Resolution: Add only the original source-backed sw -> unotools edge, retaining runtime cycle and ownership checks, and refresh dependency/boundary gates.

- Observation: Actual Chromium FontFaceSet.check accepts a nonexistent family; registered FontFace family descriptors are CSS serialized and require decoding before native search-key normalization. Actual bundled-font browser acceptance now validates this platform boundary.
  Impact: The previous hardcoded/unused-language adapter could report nonexistent fonts and could not be reused by Calc native roles.
  Resolution: Generic configured-role/prepared-Locale API now uses loaded registered faces and awaited preparation before main mounts document factories. Writer owns role mapping. Missing best-match/substitution/system enumeration/user configuration/full Font and legacy Writer requested-family policy remain explicit gaps, with no invented fallback or fake physical collection.
