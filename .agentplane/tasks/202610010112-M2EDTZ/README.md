---
id: "202610010112-M2EDTZ"
title: "Restore native unnumbered list paragraph ODT transport"
result_summary: "Native list headers, first-paragraph item consumption, nested-return clearing and unnumbered continuation export now match the pinned bounded contract. No intentional document lifecycle deviations changed."
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
  updated_at: "2026-10-01T01:13:16.298Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-01T01:34:49.574Z"
  updated_by: "CODER"
  note: "Native transport oracle368 and genuine ODT/copy/Worker16 checks pass. Final unchanged npm run verify exit0 session62469:646 app,109 inventory,19 browser; both100% coverage and all remaining gates. Doctor0errors/two prior warnings,routing/diff pass. Bounded list transport only; wider ownership/default/UI obligations remain unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-01T01:35:22.514Z"
  updated_by: "EVALUATOR"
  note: "Scoped native header/item continuation transport is source-owned and verified; implementation fd0ede9f505568377bbcd15595938cb72dbfcf8c."
  evaluated_sha: "fd0ede9f505568377bbcd15595938cb72dbfcf8c"
  blueprint_digest: "dc155964b210398cdaffbaa43516bc2e28882341ededba19af4bdc708f95e765"
  evidence_refs:
    - ".agentplane/tasks/202610010112-M2EDTZ/README.md"
    - ".agentplane/tasks/202610010112-M2EDTZ/quality/20261001-013522514-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610010112-M2EDTZ/quality/20261001-013522514-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610010112-M2EDTZ/quality/20261001-013522514-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610010112-M2EDTZ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610010112-M2EDTZ/verify.log"
    - ".agentplane/tasks/202610010112-M2EDTZ/native-results.json"
    - "apps/office/src/sw/source/filter/xml/odt-list-headers-roundtrip.test.ts"
  findings:
    - "The real Writer projection preserves counted WhichId87 and omits uncounted restart/start metadata as native NumberingIsNumber does. XMLOFF tracks actual open tags and consumes ordinary item markers once; nested return clears restored outer state. Genuine common/automatic package cases assert text,counters,labels,vectors,owned copies,Worker16,structure and reopen. Legacy contradictory rejection expectations were updated without lowering gates."
commit:
  hash: "fd0ede9f505568377bbcd15595938cb72dbfcf8c"
  message: "🧩 M2EDTZ code: restore native unnumbered list ODT transport"
comments:
  -
    author: "CODER"
    body: "Start: restore source-owned ODT unnumbered paragraph/header/item consumption under the persistent approved goal."
  -
    author: "CODER"
    body: "Verified: native unnumbered list ODT transport,368 compiled-source event comparisons,genuine common/automatic packages,owned copies and Worker16; full unchanged verification646/109/19 and100% coverage. Quality pass; scoped code hash recorded; wider parent remains active."
events:
  -
    type: "status"
    at: "2026-10-01T01:13:16.801Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned ODT unnumbered paragraph/header/item consumption under the persistent approved goal."
  -
    type: "verify"
    at: "2026-10-01T01:34:49.574Z"
    author: "CODER"
    state: "ok"
    note: "Native transport oracle368 and genuine ODT/copy/Worker16 checks pass. Final unchanged npm run verify exit0 session62469:646 app,109 inventory,19 browser; both100% coverage and all remaining gates. Doctor0errors/two prior warnings,routing/diff pass. Bounded list transport only; wider ownership/default/UI obligations remain unverified."
  -
    type: "status"
    at: "2026-10-01T01:35:41.475Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native unnumbered list ODT transport,368 compiled-source event comparisons,genuine common/automatic packages,owned copies and Worker16; full unchanged verification646/109/19 and100% coverage. Quality pass; scoped code hash recorded; wider parent remains active."
doc_version: 3
doc_updated_at: "2026-10-01T01:35:41.476Z"
doc_updated_by: "CODER"
description: "Iteration30: carry existing SwTextNode counted state through ODT using native list-header versus list-item continuation and list-item consumption ownership. Preserve intentional save/open/recovery policies."
sections:
  Summary: "Restore ODT transport for existing counted/uncounted Writer list paragraphs with native header versus continuation structure and item-context consumption. Iteration30 under the persistent approved upstream goal."
  Scope: "xmloff text txtparai.ts/txtparae.ts and a source-owned txtlists.ts helper; Writer xmlimp.ts/xmlexp.ts bridges; focused helper/context tests and genuine ODT header/counter roundtrips; writer-odt-format.md and source provenance/runtime inventory; task-local native probes. Existing hierarchical Arabic/bullet lists only. Preserve registered save/open/recovery, ODF1.3, Worker v16 and unchanged mandatory gates. Broader list-style overrides, numbered-paragraph, whole UNO/import ownership, continuous/redline and other model/UI obligations remain separately unverified."
  Plan: "Pass IsCountedInList through the Writer-to-xmloff projection, allow the existing counted WhichId on export, and gate restart/start projection on numbered paragraphs as XMLTextNumRuleInfo does. Track actual open list item/header tags. Native opening uses list-item for skipped ancestors and list-header only at the final unnumbered level; same/decreasing-level unnumbered paragraphs append inside the existing item after closing deeper levels. Add native XMLTextListsHelper ownership for block/item context stack, clear the item signal after its first paragraph and after returning from nested lists, accept header contexts with ignored start values, and remove the current multi-paragraph rejection so subsequent paragraphs become uncounted as upstream. Confirm coupled selection/consumption using compiled unmodified pinned export/helper excerpts with explicit string/UNO/export shims; assert genuine common/automatic ODT states, literal structure, copies, Worker16 and reopen. Run unchanged full gates, record actual code hash, quality review and local task commits."
  Verify Steps: "Reproduce current WhichId87 export failure and prove Worker16/CaptureListItems retain false. Compare list/item/header open-close events and paragraph placement to compiled unmodified pinned exportListChange with explicit bounded export/string/metadata shims; verify native item-stack push/pop/set/top and source-derived first-paragraph consumption/outer clearing. Assert initial and nested headers, skipped ancestors, ordinary counted siblings, uncounted same/shallow continuations, ordinary multi-paragraph items, paragraphs before/after nested lists, ignored malformed/header start, counted restart0 and uncounted restart omission. Genuine common/automatic ODT fixtures must assert literal text/count/level/restart/number/vector/label state, independent owned rule/item copies, Worker16, selected XML structure and reopen for numbered and bullet lists. Run npm run verify unchanged with both100% coverage suites and all browser/source/provenance/ODT gates, ap doctor, routing validator and git diff --check. Record implementation commit and clean final tracked state; no whole-module/full-goal completion claim."
  Verification: |-
    Command: python3 .agentplane/tasks/202610010112-M2EDTZ/native-oracle.py and npx tsx .agentplane/tasks/202610010112-M2EDTZ/compare-native.ts.
    Result: pass.
    Evidence: compiled unmodified pinned exportListChange and native block/item stack bodies; all 368 list/item/header opening/closing and paragraph-placement sequences match. Explicit string/export/numbered-info/identity/no-continuation shims; no whole native/UNO build claim.
    Scope: existing hierarchical Arabic/bullet paragraph list transport, native final-level header choice, skipped ancestor wrappers, unnumbered continuation and item-stack restoration/clearing.

    Command: npx vitest run src/sw/source/filter/xml/odt-list-headers-roundtrip.test.ts src/xmloff/source/text/txtlists.test.ts (apps/office).
    Result: pass.
    Evidence: 3 tests/2 files; six literal common/automatic ODT inputs in both containers, copy/Worker16/selected XML/reopen states; ignored malformed header start, counted restart0 and native uncounted restart omission.
    Scope: paragraph text/count/level/restart/number/vector/labels and owned rule/item copies.

    Command: npm run verify.
    Result: pass, terminal session62469 exit0.
    Evidence: 646 app tests/140 files; 109 inventory tests/36 files; 19 browser scenarios. App100% statements9940/branches7498/functions2741/lines9140; inventory100%1523/1080/384/1464. Unchanged format/lint/types/dependencies/resources/static/docs/file-size/source-tree/provenance/invariants/parity gates pass. Provenance201 modules(125 mapped/60 browser/16 infrastructure),444 authored JSDoc files,34 valid invariants,semanticViolationCount0. Compact terminal log retains actual summaries. Earlier legacy-expectation failure retained in commit9c57cd190b33; format-only retry and partial coverage limitation are Findings.
    Scope: complete current repository gates; consistency is not whole semantic parity.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass.
    Evidence: doctor0errors/same2 old warnings; policy routing OK; final completed-log whitespace clean. An interim diff check against a still-growing log reported its transient blank EOF; final check passes after terminal log compaction.
    Scope: active task/workflow/policy and intentional scoped changes. No skips or changes to thresholds, schema or intentional save/open/recovery behavior.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T01:34:49.574Z — VERIFY — ok

    By: CODER

    Note: Native transport oracle368 and genuine ODT/copy/Worker16 checks pass. Final unchanged npm run verify exit0 session62469:646 app,109 inventory,19 browser; both100% coverage and all remaining gates. Doctor0errors/two prior warnings,routing/diff pass. Bounded list transport only; wider ownership/default/UI obligations remain unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T01:34:49.215Z, excerpt_hash=sha256:522a065ba99881b4262df0718eee90c8e5d529375d556979c2e941fb1736b427

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010112-M2EDTZ/blueprint/resolved-snapshot.json
    - old_digest: dc155964b210398cdaffbaa43516bc2e28882341ededba19af4bdc708f95e765
    - current_digest: dc155964b210398cdaffbaa43516bc2e28882341ededba19af4bdc708f95e765
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610010112-M2EDTZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610010112-M2EDTZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the scoped implementation through a new executable task if needed; keep DONE artifacts immutable and the parent goal active."
  Findings: |-
    Preflight is clean main/direct; only parent202609240501-C9TN6M DOING. Previous turn is progress: iteration29 PHRS94 DONE, implementation dd328458813306a78d7a9c6551ff7d3ec56dadee; quality b8c3529654d82592728796904e0c4625b05d426a; close430b8348921802071a91c4cdb2bc9cd45361b929; parent fb06d9eb1144. Native pin libreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Read-only reproduction: false counted flag survives Worker16 and has no marker, but ODT exporter rejects WhichId87. txtparai explicitly rejects header and second paragraph. Native XMLTextNumRuleInfo reads NumberingIsNumber and only reads restart/start when numbered; exportListChange opens header only for final newly opened unnumbered level and appends unnumbered same/decreasing-level paragraphs inside the current item. XMLTextListItemContext accepts header, ignores its start and sets list-item marker only for ordinary items; txtimp consumes this marker after a paragraph, XMLTextListBlockContext clears restored outer marker on nested return. One transport/ownership task covers this coupled contract. No network/outside access or delegation.

    - Observation: Focused header fixture fails on text projection: new test used nonexistent SwTextNode.text and record.version fields; counted/restart/number/vector/label values match the first literal source case.
      Impact: Fixture must use canonical GetText()/text insertion and the actual Worker record schema API; no runtime list mismatch is observed.
      Resolution: Correct the test to repository APIs, persist native evidence, rerun genuine package and unchanged mandatory gates.

    - Observation: A partial coverage run selected four list tests; all 10 tests passed, but unrelated txtparai/txtparae branches remained uncovered and the coverage gate exited 1.
      Impact: This partial selection cannot establish the mandatory whole-application coverage result.
      Resolution: Run npm run verify with unchanged full suites and 100% thresholds; retain actual terminal results.

    - Observation: Full npm run verify exited 1 at the application test suite: 645 tests passed, one txtparai context test still expects multiple paragraphs and an empty list-header to throw.
      Impact: These two legacy expectations contradict the approved native transport contract; all new genuine package tests passed.
      Resolution: Replace the two reject expectations with accepted paragraph-count checks, retain the failed terminal log, and rerun the unchanged full verification command.

    - Observation: The next full verify exited 1 immediately at format:check after moving the two context cases.
      Impact: Prettier requires the now-short reject-case array on one line; runtime was not tested in that attempt.
      Resolution: Format only the amended context test and rerun unchanged npm run verify. The prior full failing test log is retained at commit9c57cd190b33.
id_source: "generated"
---
## Summary

Restore ODT transport for existing counted/uncounted Writer list paragraphs with native header versus continuation structure and item-context consumption. Iteration30 under the persistent approved upstream goal.

## Scope

xmloff text txtparai.ts/txtparae.ts and a source-owned txtlists.ts helper; Writer xmlimp.ts/xmlexp.ts bridges; focused helper/context tests and genuine ODT header/counter roundtrips; writer-odt-format.md and source provenance/runtime inventory; task-local native probes. Existing hierarchical Arabic/bullet lists only. Preserve registered save/open/recovery, ODF1.3, Worker v16 and unchanged mandatory gates. Broader list-style overrides, numbered-paragraph, whole UNO/import ownership, continuous/redline and other model/UI obligations remain separately unverified.

## Plan

Pass IsCountedInList through the Writer-to-xmloff projection, allow the existing counted WhichId on export, and gate restart/start projection on numbered paragraphs as XMLTextNumRuleInfo does. Track actual open list item/header tags. Native opening uses list-item for skipped ancestors and list-header only at the final unnumbered level; same/decreasing-level unnumbered paragraphs append inside the existing item after closing deeper levels. Add native XMLTextListsHelper ownership for block/item context stack, clear the item signal after its first paragraph and after returning from nested lists, accept header contexts with ignored start values, and remove the current multi-paragraph rejection so subsequent paragraphs become uncounted as upstream. Confirm coupled selection/consumption using compiled unmodified pinned export/helper excerpts with explicit string/UNO/export shims; assert genuine common/automatic ODT states, literal structure, copies, Worker16 and reopen. Run unchanged full gates, record actual code hash, quality review and local task commits.

## Verify Steps

Reproduce current WhichId87 export failure and prove Worker16/CaptureListItems retain false. Compare list/item/header open-close events and paragraph placement to compiled unmodified pinned exportListChange with explicit bounded export/string/metadata shims; verify native item-stack push/pop/set/top and source-derived first-paragraph consumption/outer clearing. Assert initial and nested headers, skipped ancestors, ordinary counted siblings, uncounted same/shallow continuations, ordinary multi-paragraph items, paragraphs before/after nested lists, ignored malformed/header start, counted restart0 and uncounted restart omission. Genuine common/automatic ODT fixtures must assert literal text/count/level/restart/number/vector/label state, independent owned rule/item copies, Worker16, selected XML structure and reopen for numbered and bullet lists. Run npm run verify unchanged with both100% coverage suites and all browser/source/provenance/ODT gates, ap doctor, routing validator and git diff --check. Record implementation commit and clean final tracked state; no whole-module/full-goal completion claim.

## Verification

Command: python3 .agentplane/tasks/202610010112-M2EDTZ/native-oracle.py and npx tsx .agentplane/tasks/202610010112-M2EDTZ/compare-native.ts.
Result: pass.
Evidence: compiled unmodified pinned exportListChange and native block/item stack bodies; all 368 list/item/header opening/closing and paragraph-placement sequences match. Explicit string/export/numbered-info/identity/no-continuation shims; no whole native/UNO build claim.
Scope: existing hierarchical Arabic/bullet paragraph list transport, native final-level header choice, skipped ancestor wrappers, unnumbered continuation and item-stack restoration/clearing.

Command: npx vitest run src/sw/source/filter/xml/odt-list-headers-roundtrip.test.ts src/xmloff/source/text/txtlists.test.ts (apps/office).
Result: pass.
Evidence: 3 tests/2 files; six literal common/automatic ODT inputs in both containers, copy/Worker16/selected XML/reopen states; ignored malformed header start, counted restart0 and native uncounted restart omission.
Scope: paragraph text/count/level/restart/number/vector/labels and owned rule/item copies.

Command: npm run verify.
Result: pass, terminal session62469 exit0.
Evidence: 646 app tests/140 files; 109 inventory tests/36 files; 19 browser scenarios. App100% statements9940/branches7498/functions2741/lines9140; inventory100%1523/1080/384/1464. Unchanged format/lint/types/dependencies/resources/static/docs/file-size/source-tree/provenance/invariants/parity gates pass. Provenance201 modules(125 mapped/60 browser/16 infrastructure),444 authored JSDoc files,34 valid invariants,semanticViolationCount0. Compact terminal log retains actual summaries. Earlier legacy-expectation failure retained in commit9c57cd190b33; format-only retry and partial coverage limitation are Findings.
Scope: complete current repository gates; consistency is not whole semantic parity.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass.
Evidence: doctor0errors/same2 old warnings; policy routing OK; final completed-log whitespace clean. An interim diff check against a still-growing log reported its transient blank EOF; final check passes after terminal log compaction.
Scope: active task/workflow/policy and intentional scoped changes. No skips or changes to thresholds, schema or intentional save/open/recovery behavior.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T01:34:49.574Z — VERIFY — ok

By: CODER

Note: Native transport oracle368 and genuine ODT/copy/Worker16 checks pass. Final unchanged npm run verify exit0 session62469:646 app,109 inventory,19 browser; both100% coverage and all remaining gates. Doctor0errors/two prior warnings,routing/diff pass. Bounded list transport only; wider ownership/default/UI obligations remain unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T01:34:49.215Z, excerpt_hash=sha256:522a065ba99881b4262df0718eee90c8e5d529375d556979c2e941fb1736b427

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010112-M2EDTZ/blueprint/resolved-snapshot.json
- old_digest: dc155964b210398cdaffbaa43516bc2e28882341ededba19af4bdc708f95e765
- current_digest: dc155964b210398cdaffbaa43516bc2e28882341ededba19af4bdc708f95e765
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610010112-M2EDTZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610010112-M2EDTZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the scoped implementation through a new executable task if needed; keep DONE artifacts immutable and the parent goal active.

## Findings

Preflight is clean main/direct; only parent202609240501-C9TN6M DOING. Previous turn is progress: iteration29 PHRS94 DONE, implementation dd328458813306a78d7a9c6551ff7d3ec56dadee; quality b8c3529654d82592728796904e0c4625b05d426a; close430b8348921802071a91c4cdb2bc9cd45361b929; parent fb06d9eb1144. Native pin libreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Read-only reproduction: false counted flag survives Worker16 and has no marker, but ODT exporter rejects WhichId87. txtparai explicitly rejects header and second paragraph. Native XMLTextNumRuleInfo reads NumberingIsNumber and only reads restart/start when numbered; exportListChange opens header only for final newly opened unnumbered level and appends unnumbered same/decreasing-level paragraphs inside the current item. XMLTextListItemContext accepts header, ignores its start and sets list-item marker only for ordinary items; txtimp consumes this marker after a paragraph, XMLTextListBlockContext clears restored outer marker on nested return. One transport/ownership task covers this coupled contract. No network/outside access or delegation.

- Observation: Focused header fixture fails on text projection: new test used nonexistent SwTextNode.text and record.version fields; counted/restart/number/vector/label values match the first literal source case.
  Impact: Fixture must use canonical GetText()/text insertion and the actual Worker record schema API; no runtime list mismatch is observed.
  Resolution: Correct the test to repository APIs, persist native evidence, rerun genuine package and unchanged mandatory gates.

- Observation: A partial coverage run selected four list tests; all 10 tests passed, but unrelated txtparai/txtparae branches remained uncovered and the coverage gate exited 1.
  Impact: This partial selection cannot establish the mandatory whole-application coverage result.
  Resolution: Run npm run verify with unchanged full suites and 100% thresholds; retain actual terminal results.

- Observation: Full npm run verify exited 1 at the application test suite: 645 tests passed, one txtparai context test still expects multiple paragraphs and an empty list-header to throw.
  Impact: These two legacy expectations contradict the approved native transport contract; all new genuine package tests passed.
  Resolution: Replace the two reject expectations with accepted paragraph-count checks, retain the failed terminal log, and rerun the unchanged full verification command.

- Observation: The next full verify exited 1 immediately at format:check after moving the two context cases.
  Impact: Prettier requires the now-short reject-case array on one line; runtime was not tested in that attempt.
  Resolution: Format only the amended context test and rerun unchanged npm run verify. The prior full failing test log is retained at commit9c57cd190b33.
