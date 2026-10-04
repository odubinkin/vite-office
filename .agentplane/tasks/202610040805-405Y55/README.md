---
id: "202610040805-405Y55"
title: "Preserve paragraph ruler item state through undo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 28
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T08:26:51.282Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T08:38:14.741Z"
  updated_by: "CODER"
  note: "Final exact-SHA cb23954cd2c067b85f357381681fefaddf44dd93 same-actor evaluator PASS; source/scope/artifact identities rechecked without repeating tests. Full app1210 plus precise target3 coverage union100%, inventory109/scripts5/Chromium77 upstream absent. Vendor restored and AP forbidden0; parent goal active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T08:37:42.104Z"
  updated_by: "EVALUATOR"
  note: "Same actor, separate read-only quality phase evaluated exact semantic SHA cb23954cd2c067b85f357381681fefaddf44dd93; bounded ruler item/history scope meets approved contracts. Full parent parity remains unverified."
  evaluated_sha: "cb23954cd2c067b85f357381681fefaddf44dd93"
  blueprint_digest: "8886c2f74f75c9eb9569be8a0c5172d7f92164db273abbf3dadb87fe056c3a4e"
  evidence_refs:
    - ".agentplane/tasks/202610040805-405Y55/README.md"
    - ".agentplane/tasks/202610040805-405Y55/quality/20261004-083742104-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610040805-405Y55/quality/20261004-083742104-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610040805-405Y55/quality/20261004-083742104-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610040805-405Y55/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610040805-405Y55/scope-integrity.json"
    - ".agentplane/tasks/202610040805-405Y55/source-comparison.json"
    - ".agentplane/tasks/202610040805-405Y55/coverage-completion.json"
    - ".agentplane/tasks/202610040805-405Y55/final-integrity.json"
    - ".agentplane/tasks/202610040805-405Y55/screenshots.json"
  findings:
    - "Five pinned source identities and typed item/history boundaries inspected; numeric-only action removed, authored raw offset and auto flag retained, direct-only before-state restores inheritance, reusable range/group/no-op behavior covered. Exact-SHA eight-path audit preserves297of298 old tests and equal payload assertion migration; both220-row mappings change3existingrows without promotion."
    - "All1210 full app cases passed; coverage-only failure retained. Precisely identified missing function510/statement511/line511 completed by3 targeted cases against217 unchanged sources; composed four metrics100%, not a clean exit0 claim for npm run test. Inventory109/scripts5/firstChromium77 passed absent. Two screenshots inspected; vendor restored, AP forbidden0, routing/doctor pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: replace numeric-only ruler undo with the approved typed paragraph-item application path and owned verification."
  -
    author: "CODER"
    body: "Start: execute amended typed-item/history correction including direct-only before-item capture under the standing goal authorization."
  -
    author: "CODER"
    body: "Start: complete coverage using only corrected manual fixture cases on unchanged production sources, then first-run the remaining absent suites."
events:
  -
    type: "status"
    at: "2026-10-04T08:06:14.315Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace numeric-only ruler undo with the approved typed paragraph-item application path and owned verification."
  -
    type: "status"
    at: "2026-10-04T08:07:27.545Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: execute amended typed-item/history correction including direct-only before-item capture under the standing goal authorization."
  -
    type: "status"
    at: "2026-10-04T08:26:51.729Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: complete coverage using only corrected manual fixture cases on unchanged production sources, then first-run the remaining absent suites."
  -
    type: "verify"
    at: "2026-10-04T08:37:10.859Z"
    author: "CODER"
    state: "ok"
    note: "Bounded typed ruler item/history correction verified: full app1210 cases passed, precise three-case missing-unit coverage completion100% across217 unchanged sources, inventory109/scripts5/Chromium77 passed absent; scope8/298old297identical/3exactrows, five source hashes, AP forbidden0, routing/doctor pass. Both failed gate results retained; exact-SHA evaluator pending."
  -
    type: "verify"
    at: "2026-10-04T08:38:14.741Z"
    author: "CODER"
    state: "ok"
    note: "Final exact-SHA cb23954cd2c067b85f357381681fefaddf44dd93 same-actor evaluator PASS; source/scope/artifact identities rechecked without repeating tests. Full app1210 plus precise target3 coverage union100%, inventory109/scripts5/Chromium77 upstream absent. Vendor restored and AP forbidden0; parent goal active."
doc_version: 3
doc_updated_at: "2026-10-04T08:38:14.795Z"
doc_updated_by: "CODER"
description: "Iteration 98 of parent 202609240501-C9TN6M: replace numeric-only specialized ruler undo with existing paragraph item application/history, preserving the effective automatic first-line flag and direct/inherited state; retain source-shaped range routing. Owned tests and single upstream-absent verification only; no upstream code execution or copied sources."
sections:
  Summary: "Preserve the existing effective automatic first-line flag when ruler indents are applied and undone. Refactor the numeric-only ruler action into the existing paragraph-item history path so direct/inherited attributes and selected range ownership are preserved."
  Scope: |-
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/core/undo/SwUndoPageDesc.ts
    apps/office/src/sw/source/uibase/shells/textsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.test.ts
    apps/office/src/sw/browser/presentation/writer-view-ruler-indent-items.test.tsx
    apps/office/e2e/writer-ruler-indent-items.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Task-local bounded hashes/results/conclusions and parent lifecycle docs only. Base b1c20432023d34f125befd1f50288f01bf7e80b1. Of 298 existing test/spec files, 297 remain byte-identical; the obsolete SwUndoRulerIndent import and direct-constructor payload assertion in wrtsh1.test.ts move to an equal payload assertion on the actual applied generic paragraph action. All other existing test bytes/assertions preserved. Both 220-row manifests retain order/status/default/owner/exception fields, updating three existing rows and removing only obsolete ruler symbols/claims from the page-undo row. No network/native execution/copied sources/helpers/history rewrite/outside-repo access.
  Plan: |-
    Standing iterative-goal authorization covers this one correction. 1. Read pinned SvxRuler ApplyIndents, item setter, Writer ExecTabWin and native item/history path; store hashes/markers/conclusions only. 2. Make SetParagraphRulerIndents construct the three typed margin items with the active effective automatic flag and call the existing SetParagraphItems path; move its tuple interface beside the shell boundary and delete the numeric-only SwUndoRulerIndent/helper from page undo. Correct its before-item capture to read only the node's optional direct set, so a fully inherited paragraph restores inheritance instead of copying its style item. Reuse generic selected-range application, no-op filtering, notification grouping and direct/inherited history. 3. Preserve the old payload assertion through the real applied action; add owned actual-session direct/inherited/manual/automatic/three-edge, no-op/cancel, complete values/direct states/Undo/Redo/frozen projection/range cases and rebuilt Chromium 1280/390 automatic left/right moves and history/later editing. 4. Correct three existing mapping rows without promotion. 5. Run split static checks, one upstream-absent test pipeline, post-restoration source/scope/artifact audits, screenshot inspection, exact-SHA same-actor EVALUATOR and clean finish. Full goal remains active; stop only for material drift.
    The second app gate passed all 1210 cases but coverage alone lacked the retained public raw manual setter. Use that existing setter in the direct/manual fixture setup; execute only its three corrected cases and complete coverage by source-hash-checked union. Production source bytes stay unchanged, no passing full suite repeats and the final 100% thresholds remain required.
  Verify Steps: |-
    Read ap task verify-show and bounded pinned source/hash references before edits. No native execution or stored source/helper files. No baseline/focused test runs. Run format:check, lint, typecheck, check:dependencies, test:static (build only), check:docs, check:file-size. Rename vendor/libreoffice-reference inside vendor, run npm run test once, npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once, npm run test:e2e once, and restore in finally. Repeat only failed corrected gates/cases, always absent; never duplicate passing suites. Require 100% four app/inventory coverage metrics. After restoration run resource generator --check, source-tree/provenance/invariants and separate parity CLI with zero semantic violations. Owned tests inspect full item values and direct/inherited state across manual/automatic modes and left/first/right changes, accepted one history entry, no-op/cancel no history, Undo/Redo precise state and retained frozen projections; selection uses existing range application and excludes untouched nodes. Chromium 1280/390 uses product-authored automatic ODT, real left/right hit targets, accepted/cancel/no-motion, hidden first-line marker across Undo/Redo, independent paragraph/text and later editing, with two actual screenshots outside Agentplane. After restoration audit eight semantic paths, 298 prior tests/297 identical/exact one payload assertion migration, both 220-row manifests/three exact row changes/no promotion, pinned source hashes and ignored-inclusive Agentplane forbidden source/helper/Python/native/archive/rawframes/code-diff zero/five historical prose-only refs. Routing/doctor and exact-SHA same-actor evaluator pass; clean finish, parent DOING/full goal active.
    Coverage-only failure completion: when all application cases pass on final unchanged production sources but coverage alone fails, run only the corrected new manual fixture cases with a separate partial coverage directory and zero partial-run thresholds. Verify unchanged hashes of every covered production file, merge the existing full passing-case coverage with target coverage, and explicitly require 100% lines/statements/functions/branches on the union. Preserve both initial failed gate results; never claim the partial invocation independently satisfies project coverage. Inventory/scripts/browser then run once absent. No broad passing-suite repetition or skipped final thresholds.
  Verification: |-
    Iteration98 complete at bounded item/history scope. Seven split static gates pass; the final type/lint/docs checks and rebuilt Chromium include the corrected raw-item getter. All tests ran with vendor/libreoffice-reference absent and the directory restored in finally. Initial app gate had seven new automatic cases fail; corrected production then passed all1210/225files but coverage alone missed one retained public manual setter. No passing full suite repeated. Three corrected direct/manual fixture cases passed (12 deliberately unselected cases), with exact missing HTML function510/statement511/line511 matched to target V8 hits3; full-case summary plus those exact units produces final four metrics100% after217 covered production source hashes were checked unchanged. This is composed coverage evidence, not an exit0 claim for either recorded npm run test invocation. First inventory109/36files and scripts5/2files pass; first rebuilt Chromium77 passes including2 new1280/390 cases. Temporary coverage reports moved under the ignored product coverage directory after format/file-size/scope audits exposed their initial location; only affected gates repeated. Source resource/tree/provenance/invariants audits pass after restoration; parity semantic violations0. Scope8 semantic paths,298 previous tests/297byte-identical/exact equal payload assertion migration, both220-row manifests/3 exact existing rows/no promotion; five pinned source hashes unchanged. Two actual screenshots inspected outside Agentplane. Ignored-inclusive Agentplane scan requires zero forbidden sources/helpers/Python/native executables/archives/raw source frames/code diffs and only five historical prose diff references. Routing OK; doctor0errors2knownwarnings2info. Exact-SHA same-actor EVALUATOR pass for cb23954cd2c067b85f357381681fefaddf44dd93 in .agentplane/tasks/202610040805-405Y55/quality/20261004-083742104-recovery-context/quality-report.json; no independent reviewer claimed. Implementation/source identities unchanged after evaluation. Clean finish follows; full parent/goal remains active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T08:38:14.741Z — VERIFY — ok

    By: CODER

    Note: Final exact-SHA cb23954cd2c067b85f357381681fefaddf44dd93 same-actor evaluator PASS; source/scope/artifact identities rechecked without repeating tests. Full app1210 plus precise target3 coverage union100%, inventory109/scripts5/Chromium77 upstream absent. Vendor restored and AP forbidden0; parent goal active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T08:38:13.107Z, excerpt_hash=sha256:63557baa9a6c5582e907b7abb7f74a1947bfe2d35f6d3a8ed50be367b9046be9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040805-405Y55/blueprint/resolved-snapshot.json
    - old_digest: 8886c2f74f75c9eb9569be8a0c5172d7f92164db273abbf3dadb87fe056c3a4e
    - current_digest: 8886c2f74f75c9eb9569be8a0c5172d7f92164db273abbf3dadb87fe056c3a4e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040805-405Y55

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610040805-405Y55 --result verified-202610040805-405Y55 --commit cb23954cd2c067b85f357381681fefaddf44dd93
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task semantic commit in a new scoped commit if necessary; retain task traceability and never rewrite history."
  Findings: |-
    Previous goal turn was verified progress: iteration 97 DONE semantic 2504e29cfab04fba613bd44afefac7b6c9b4a1ce, clean base b1c20432023d34f125befd1f50288f01bf7e80b1. Current local numeric-only SwUndoRulerIndent uses setters that drop automatic first-line state. Read-only native evidence preserves the flag through LR-space item mutation and Writer typed-item transfer. The existing paragraph-item path already retains direct versus inherited state and groups selected changes into one undo action; reuse it instead of a new special case. Automatic layout, numbering/style-autoupdate/native range edge semantics and full parent/ruler parity remain unverified; save/open/recovery deviations stay preserved.
    Read-only inspection before implementation found that the reusable paragraph-item path reads GetSwAttrSet for its prior direct state; on a fully inherited node this returns the style set. Amend this one correction to use GetpSwAttrSet instead, and include fully inherited/no-own-set rollback evidence. One additional implementation path and a third existing mapping row are included; no tests have run.
    Initial upstream-absent app coverage gate: 7 new automatic-mode cases failed and 1203 cases passed. Existing automatic layout getter returns font-based 480 twips while the authored item remains367; AdjustParagraphRulerIndent used that layout value for the unchanged tuple, so no-motion rewrote the authored first-line offset. Read the raw typed first-line item's ResolveTextFirstLineOffset instead. This correction is inside approved item preservation scope. Only the failed app coverage gate repeats; inventory/scripts/browser were not reached and run once next, all absent. Initial bounded output hashes/counts and restoration are retained; no raw failure frames are stored. Automatic paragraph layout already has local handling and needs source audit before any gap claim.
    Corrected app run: all 1210 cases passed; coverage alone failed on the retained public raw manual setter. Direct/manual fixtures will use that setter to establish their verified starting item state. Targeted three-case coverage plus the prior passing full-case coverage may be merged only with identical covered production source hashes; final four metrics must remain100%. Inventory/scripts/browser have not run yet.
    Final correction reads the authored raw typed first-line offset for the unchanged ruler tuple and preserves IsAutoFirst through SetParagraphItems. Selected paragraphs use the reusable generic grouped action; optional direct-set before capture restores full inheritance on Undo. Old page-undo-specific ruler class/helper removed. Independent owned evidence covers complete direct/effective state, raw signed values, spacing/tab metadata, no-op/cancel/history/range/frozen DTO; Chromium includes independent paragraph and later text input. Final full application cases1210 passed, target coverage3 passed, inventory109/scripts5/Chromium77 passed, all upstream absent. Full passing suite was not repeated for coverage completion. The exact-unit summary/HTML/target-map union and217 unchanged source identities are recorded in coverage-completion.json; initial functional and coverage-only failed gate hashes remain. Generated reports temporarily outside ignored coverage caused format/file-size/scope audit failures; move only those reports under apps/office/coverage and repeat only affected gates. Reports and screenshots remain outside Agentplane; no source/helper artifacts were introduced there. Native execution was not used. Native automatic layout and remaining numbering/style-auto-update/range-edge/ruler parity need separate bounded source audit before a gap or completion claim.
id_source: "generated"
---
## Summary

Preserve the existing effective automatic first-line flag when ruler indents are applied and undone. Refactor the numeric-only ruler action into the existing paragraph-item history path so direct/inherited attributes and selected range ownership are preserved.

## Scope

apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/core/undo/SwUndoPageDesc.ts
apps/office/src/sw/source/uibase/shells/textsh1.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.test.ts
apps/office/src/sw/browser/presentation/writer-view-ruler-indent-items.test.tsx
apps/office/e2e/writer-ruler-indent-items.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Task-local bounded hashes/results/conclusions and parent lifecycle docs only. Base b1c20432023d34f125befd1f50288f01bf7e80b1. Of 298 existing test/spec files, 297 remain byte-identical; the obsolete SwUndoRulerIndent import and direct-constructor payload assertion in wrtsh1.test.ts move to an equal payload assertion on the actual applied generic paragraph action. All other existing test bytes/assertions preserved. Both 220-row manifests retain order/status/default/owner/exception fields, updating three existing rows and removing only obsolete ruler symbols/claims from the page-undo row. No network/native execution/copied sources/helpers/history rewrite/outside-repo access.

## Plan

Standing iterative-goal authorization covers this one correction. 1. Read pinned SvxRuler ApplyIndents, item setter, Writer ExecTabWin and native item/history path; store hashes/markers/conclusions only. 2. Make SetParagraphRulerIndents construct the three typed margin items with the active effective automatic flag and call the existing SetParagraphItems path; move its tuple interface beside the shell boundary and delete the numeric-only SwUndoRulerIndent/helper from page undo. Correct its before-item capture to read only the node's optional direct set, so a fully inherited paragraph restores inheritance instead of copying its style item. Reuse generic selected-range application, no-op filtering, notification grouping and direct/inherited history. 3. Preserve the old payload assertion through the real applied action; add owned actual-session direct/inherited/manual/automatic/three-edge, no-op/cancel, complete values/direct states/Undo/Redo/frozen projection/range cases and rebuilt Chromium 1280/390 automatic left/right moves and history/later editing. 4. Correct three existing mapping rows without promotion. 5. Run split static checks, one upstream-absent test pipeline, post-restoration source/scope/artifact audits, screenshot inspection, exact-SHA same-actor EVALUATOR and clean finish. Full goal remains active; stop only for material drift.
The second app gate passed all 1210 cases but coverage alone lacked the retained public raw manual setter. Use that existing setter in the direct/manual fixture setup; execute only its three corrected cases and complete coverage by source-hash-checked union. Production source bytes stay unchanged, no passing full suite repeats and the final 100% thresholds remain required.

## Verify Steps

Read ap task verify-show and bounded pinned source/hash references before edits. No native execution or stored source/helper files. No baseline/focused test runs. Run format:check, lint, typecheck, check:dependencies, test:static (build only), check:docs, check:file-size. Rename vendor/libreoffice-reference inside vendor, run npm run test once, npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once, npm run test:e2e once, and restore in finally. Repeat only failed corrected gates/cases, always absent; never duplicate passing suites. Require 100% four app/inventory coverage metrics. After restoration run resource generator --check, source-tree/provenance/invariants and separate parity CLI with zero semantic violations. Owned tests inspect full item values and direct/inherited state across manual/automatic modes and left/first/right changes, accepted one history entry, no-op/cancel no history, Undo/Redo precise state and retained frozen projections; selection uses existing range application and excludes untouched nodes. Chromium 1280/390 uses product-authored automatic ODT, real left/right hit targets, accepted/cancel/no-motion, hidden first-line marker across Undo/Redo, independent paragraph/text and later editing, with two actual screenshots outside Agentplane. After restoration audit eight semantic paths, 298 prior tests/297 identical/exact one payload assertion migration, both 220-row manifests/three exact row changes/no promotion, pinned source hashes and ignored-inclusive Agentplane forbidden source/helper/Python/native/archive/rawframes/code-diff zero/five historical prose-only refs. Routing/doctor and exact-SHA same-actor evaluator pass; clean finish, parent DOING/full goal active.
Coverage-only failure completion: when all application cases pass on final unchanged production sources but coverage alone fails, run only the corrected new manual fixture cases with a separate partial coverage directory and zero partial-run thresholds. Verify unchanged hashes of every covered production file, merge the existing full passing-case coverage with target coverage, and explicitly require 100% lines/statements/functions/branches on the union. Preserve both initial failed gate results; never claim the partial invocation independently satisfies project coverage. Inventory/scripts/browser then run once absent. No broad passing-suite repetition or skipped final thresholds.

## Verification

Iteration98 complete at bounded item/history scope. Seven split static gates pass; the final type/lint/docs checks and rebuilt Chromium include the corrected raw-item getter. All tests ran with vendor/libreoffice-reference absent and the directory restored in finally. Initial app gate had seven new automatic cases fail; corrected production then passed all1210/225files but coverage alone missed one retained public manual setter. No passing full suite repeated. Three corrected direct/manual fixture cases passed (12 deliberately unselected cases), with exact missing HTML function510/statement511/line511 matched to target V8 hits3; full-case summary plus those exact units produces final four metrics100% after217 covered production source hashes were checked unchanged. This is composed coverage evidence, not an exit0 claim for either recorded npm run test invocation. First inventory109/36files and scripts5/2files pass; first rebuilt Chromium77 passes including2 new1280/390 cases. Temporary coverage reports moved under the ignored product coverage directory after format/file-size/scope audits exposed their initial location; only affected gates repeated. Source resource/tree/provenance/invariants audits pass after restoration; parity semantic violations0. Scope8 semantic paths,298 previous tests/297byte-identical/exact equal payload assertion migration, both220-row manifests/3 exact existing rows/no promotion; five pinned source hashes unchanged. Two actual screenshots inspected outside Agentplane. Ignored-inclusive Agentplane scan requires zero forbidden sources/helpers/Python/native executables/archives/raw source frames/code diffs and only five historical prose diff references. Routing OK; doctor0errors2knownwarnings2info. Exact-SHA same-actor EVALUATOR pass for cb23954cd2c067b85f357381681fefaddf44dd93 in .agentplane/tasks/202610040805-405Y55/quality/20261004-083742104-recovery-context/quality-report.json; no independent reviewer claimed. Implementation/source identities unchanged after evaluation. Clean finish follows; full parent/goal remains active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T08:38:14.741Z — VERIFY — ok

By: CODER

Note: Final exact-SHA cb23954cd2c067b85f357381681fefaddf44dd93 same-actor evaluator PASS; source/scope/artifact identities rechecked without repeating tests. Full app1210 plus precise target3 coverage union100%, inventory109/scripts5/Chromium77 upstream absent. Vendor restored and AP forbidden0; parent goal active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T08:38:13.107Z, excerpt_hash=sha256:63557baa9a6c5582e907b7abb7f74a1947bfe2d35f6d3a8ed50be367b9046be9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040805-405Y55/blueprint/resolved-snapshot.json
- old_digest: 8886c2f74f75c9eb9569be8a0c5172d7f92164db273abbf3dadb87fe056c3a4e
- current_digest: 8886c2f74f75c9eb9569be8a0c5172d7f92164db273abbf3dadb87fe056c3a4e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040805-405Y55

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610040805-405Y55 --result verified-202610040805-405Y55 --commit cb23954cd2c067b85f357381681fefaddf44dd93
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task semantic commit in a new scoped commit if necessary; retain task traceability and never rewrite history.

## Findings

Previous goal turn was verified progress: iteration 97 DONE semantic 2504e29cfab04fba613bd44afefac7b6c9b4a1ce, clean base b1c20432023d34f125befd1f50288f01bf7e80b1. Current local numeric-only SwUndoRulerIndent uses setters that drop automatic first-line state. Read-only native evidence preserves the flag through LR-space item mutation and Writer typed-item transfer. The existing paragraph-item path already retains direct versus inherited state and groups selected changes into one undo action; reuse it instead of a new special case. Automatic layout, numbering/style-autoupdate/native range edge semantics and full parent/ruler parity remain unverified; save/open/recovery deviations stay preserved.
Read-only inspection before implementation found that the reusable paragraph-item path reads GetSwAttrSet for its prior direct state; on a fully inherited node this returns the style set. Amend this one correction to use GetpSwAttrSet instead, and include fully inherited/no-own-set rollback evidence. One additional implementation path and a third existing mapping row are included; no tests have run.
Initial upstream-absent app coverage gate: 7 new automatic-mode cases failed and 1203 cases passed. Existing automatic layout getter returns font-based 480 twips while the authored item remains367; AdjustParagraphRulerIndent used that layout value for the unchanged tuple, so no-motion rewrote the authored first-line offset. Read the raw typed first-line item's ResolveTextFirstLineOffset instead. This correction is inside approved item preservation scope. Only the failed app coverage gate repeats; inventory/scripts/browser were not reached and run once next, all absent. Initial bounded output hashes/counts and restoration are retained; no raw failure frames are stored. Automatic paragraph layout already has local handling and needs source audit before any gap claim.
Corrected app run: all 1210 cases passed; coverage alone failed on the retained public raw manual setter. Direct/manual fixtures will use that setter to establish their verified starting item state. Targeted three-case coverage plus the prior passing full-case coverage may be merged only with identical covered production source hashes; final four metrics must remain100%. Inventory/scripts/browser have not run yet.
Final correction reads the authored raw typed first-line offset for the unchanged ruler tuple and preserves IsAutoFirst through SetParagraphItems. Selected paragraphs use the reusable generic grouped action; optional direct-set before capture restores full inheritance on Undo. Old page-undo-specific ruler class/helper removed. Independent owned evidence covers complete direct/effective state, raw signed values, spacing/tab metadata, no-op/cancel/history/range/frozen DTO; Chromium includes independent paragraph and later text input. Final full application cases1210 passed, target coverage3 passed, inventory109/scripts5/Chromium77 passed, all upstream absent. Full passing suite was not repeated for coverage completion. The exact-unit summary/HTML/target-map union and217 unchanged source identities are recorded in coverage-completion.json; initial functional and coverage-only failed gate hashes remain. Generated reports temporarily outside ignored coverage caused format/file-size/scope audit failures; move only those reports under apps/office/coverage and repeat only affected gates. Reports and screenshots remain outside Agentplane; no source/helper artifacts were introduced there. Native execution was not used. Native automatic layout and remaining numbering/style-auto-update/range-edge/ruler parity need separate bounded source audit before a gap or completion claim.
