---
id: "202610151630-XDV8G9"
title: "Port native text-object paragraph content values"
result_summary: "Implemented native ContentInfo/XEditAttribute/WrongList values, canonical EE/style declarations and shared Set/holder pool-copy contracts without native lifetime machinery; inventory and source quirks recorded. Higher-level text engine/Calc document/UI/ODS remain pending; goal active."
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
  updated_at: "2026-10-15T16:31:51.865Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T17:10:49.427Z"
  updated_by: "CODER"
  note: "Verified source 9f9f85dfc950:194 related and187Calc tests plus19browser cases and build pass; exact8shared/33Calc owners raw S/B/F/L100/every counter positive; all13gates/inventory0,19native pins/70EE declarations,46paths/4059hashes and4reference links restored. Base Clone runtime unchanged; same-agent quality pass. Full engine/Calc model/UI/ODS remain pending, goal active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T17:10:41.595Z"
  updated_by: "EVALUATOR"
  note: "Same-agent non-independent review of 9f9f85dfc950b0da4a75d10dcf1ba880c1679b14: bounded native paragraph content values and target-pool copy contracts satisfy approved scope."
  evaluated_sha: "9f9f85dfc950b0da4a75d10dcf1ba880c1679b14"
  blueprint_digest: "aba64c86c1a417361085b80776b96fb02778c6683d4fbef6fbb5a3cd07147d80"
  evidence_refs:
    - ".agentplane/tasks/202610151630-XDV8G9/README.md"
    - ".agentplane/tasks/202610151630-XDV8G9/quality/20261015-171041595-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151630-XDV8G9/quality/20261015-171041595-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151630-XDV8G9/quality/20261015-171041595-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151630-XDV8G9/blueprint/resolved-snapshot.json"
    - "output/playwright/task158-checks/final-verification.json"
    - "output/playwright/task158-checks/native-audit.json"
    - "output/playwright/task158-checks/base-clone-type-proof.json"
    - "output/playwright/task158-checks/source-gates.json"
  findings:
    - "Actual ContentInfo/XEditAttribute/WrongList values reuse real shared string/item/pool owners; complete measured shared and Calc raw counters are positive, with exact owner sets. Original slot/default/request/nonshareable cases, clear-first/self Set, parent ranges, separate spelling equality and source quirks have direct tests."
    - "No native ownership manager, refcount/cache/physical pointer interning, fake engine/provider, UI localization or guard algorithm change. Base Clone emitted runtime is identical; both complete boundary guard files match baseline. Native references are restored and final source hashes match the reviewed commit."
commit:
  hash: "9f9f85dfc950b0da4a75d10dcf1ba880c1679b14"
  message: "🚧 XDV8G9 core: port paragraph content values and pool-targeted copies"
comments:
  -
    author: "CODER"
    body: "Start: real native paragraph content and character/spell-state values, canonical item-set copies and GC value bindings; no high-level pool/text-engine facade."
  -
    author: "CODER"
    body: "Verified: native paragraph content and attribute values, target-pool copies and stored spelling ranges match the bounded source contracts;194related/187Calc/19browser tests, strict100coverage,13gates and exact hashes pass."
events:
  -
    type: "status"
    at: "2026-10-15T16:31:54.092Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: real native paragraph content and character/spell-state values, canonical item-set copies and GC value bindings; no high-level pool/text-engine facade."
  -
    type: "verify"
    at: "2026-10-15T17:10:49.427Z"
    author: "CODER"
    state: "ok"
    note: "Verified source 9f9f85dfc950:194 related and187Calc tests plus19browser cases and build pass; exact8shared/33Calc owners raw S/B/F/L100/every counter positive; all13gates/inventory0,19native pins/70EE declarations,46paths/4059hashes and4reference links restored. Base Clone runtime unchanged; same-agent quality pass. Full engine/Calc model/UI/ODS remain pending, goal active."
  -
    type: "status"
    at: "2026-10-15T17:11:08.170Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native paragraph content and attribute values, target-pool copies and stored spelling ranges match the bounded source contracts;194related/187Calc/19browser tests, strict100coverage,13gates and exact hashes pass."
doc_version: 3
doc_updated_at: "2026-10-15T17:11:08.171Z"
doc_updated_by: "CODER"
description: "Task158 implements original ContentInfo and XEditAttribute text/style/paragraph/character value storage and pool-aware copies from editobj.cxx/editobj2.hxx, genuine WrongList range/value transformations required by copied spell state, original EE Which declarations and SfxStyleFamily, and required SfxItemSet.Set plus GC-owned item-holder value binding. Reuse OUString/SharedString and existing pools/items. Full actual EditTextObject/EditEngine pool, normalization provider and ContentNode-dependent spell operation remain subsequent owners, with no fake factories or memory manager."
sections:
  Summary: "Task158 ports actual paragraph content and character-attribute value owners used by EditTextObject, with their required range/spell-state values and shared item-set copy contract."
  Scope: "At most140intentional non-agent paths: original editeng editobj/editobj2/edtspell/misspellrange/eeitem owners; SfxStyleFamily declaration; existing SVL itemset/itempool/poolitem type signature and GC-owned SfxPoolItemHolder logical value binding only; relevant tests and canonical inventory/capability/provenance/docs. Correct the task157 numeric EE_PARA_JUST test/documentation assumption using actual declarations. No fake EditTextObject/ContentNode/SharedStringPool/EditEngine pool factory, translated UI resources, native compiler/probe, cache/refcount/deletion/ownership manager, or unrelated Writer feature. Normalization and ContentNode-dependent ClearWrongs stay absent until actual providers exist; do not implement no-op/empty success substitutes. Native physical pointer/cache identity and iterator ABI are not reproduced under JS GC."
  Plan: "Implement native EE Which and style-family declarations from actual source offsets; port ContentInfo text/style/family/paragraph/character/spell-state value storage and target-pool copy/equality with genuine XEditAttribute. Restore SfxItemSet.Set deep/shallow/clear semantics used by copy; implement only logical item/pool binding of SfxPoolItemHolder with native public value/access/copy/assignment behavior under ordinary JS references, erasing native memory machinery. Port real WrongList values, copy, query and non-ContentNode text-range transformations with exact unsigned64 invalid sentinel. Reuse existing shared Unicode/items/pools; no fake high-level class. Add direct nonempty/source-backed tests, strict whole-owner shared/Calc coverage, all source gates/build and related Writer tests, then review/verify/commit/finish. This coherent data boundary leads into real EditTextObject/pool/model work, not standalone declaration-only tasks."
  Verify Steps: "Pinned editeng/source/editeng/editobj.cxx and editobj2.hxx, editeng/inc/edtspell.hxx and edtspell.cxx, misspellrange.hxx/cxx, svl/itemset.hxx/itemset.cxx/globalpool.cxx/itempool.cxx and solar.hrc/eeitem.hxx/style.hxx authoritative. EE_ITEMS_START4021, PARA_JUST4037, CHAR_START4042, CHAR_END4077, feature4078..4081, complete61item IDs and9style-family values. ContentInfo default actual SharedString/OUString/Para family and fixed paragraph-character range, text UTF16/copy/stable style/shared views, independent target-pool paragraph/character copies, exact raw positions and feature boundaries, payload equality versus separate spelling equality. SfxItemSet.Set clears first including self-set, intersects declared ranges, deep copies effective SET-only parents, shallow reuses actual PutSet(false); preserve INVALID/DISABLED and return behavior. GC item holder is a logical pool/value binding with native empty/copy/assignment/query and borrowed getters, actual clone/copy/shareability/default cases, no counters/managers/native lifetime APIs. WrongList range/invalid-state constructors/copy/queries/insertion/deletion and all represented methods match source including native unsigned64 wrap and fixed original insertion loop bound; no spell service or fabricated ContentNode. Reuse actual OUString/SharedString/items and pools, not mock providers. All changed/new executable shared owners and all Calc measured raw S/B/F/L100, every raw counter positive and exact owner sets; type-only base Clone signature must prove unchanged emitted behavior or include whole-owner coverage. Related Writer tests, Writer-only coverage gaps exempt. All13source gates, inventory semanticViolationCount0, portable build and applicable related browser regression; source refs absent during tests/build/browser and restored finally, native source pins and <=140intentional paths/exact source hashes/clean calc proof. Full all-app run only on genuine minimum connected UI+same-model ODS readiness, then repairs and pause per user."
  Verification: |-
    Command: node output/playwright/task158-checks/portable.mjs. Result: pass. Evidence:194related tests/18files,187Calc tests/76files. Exact8changed/new shared executable owners raw S543/B362/F118/L471 and all33Calc owners S4179/B2731/F821/L3727 have S/B/F/L100 and every raw counter positive. Actual ContentInfo/XEditAttribute/default Which/style/range/spelling values and native Set/holder pool-targeted copies are exercised through genuine objects; related Writer format notification/history/browser and node-attribute-handle suites pass. The type-only base Clone signature has identical emitted-runtime SHA256 and explicit source hashes, so it is not falsely counted as runtime coverage. Pure header reexports contain no additional value algorithms.

    Command: exact13argv in source-gates.json; affected provenance/inventory/diff repeated after acceptance-only metadata text. Result: pass. Evidence:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and42module-boundary tests, semanticViolationCount0. No guard algorithm/exception changes; both complete boundary source/test files retain baseline hashes. Canonical solar.ts replaces native solar.hrc extension without an extra filename exception. All70EE declaration expressions are evaluated against the pinned native source and traced in registry. Old semantic status/history is retained, no broad parity promotion.

    Command: node output/playwright/task158-checks/build-browser-portable.mjs. Result: pass. Evidence:production build plus19Writer browser scenarios/7files, no skips/retries/flaky results. Scope: built-product automatic text layout, paragraph/list/cell history and ODT reopening, numbering/tab/ruler behavior. All4source references absent during suites/build/browser, restored to original symlink targets finally.

    Command: python3 output/playwright/task158-checks/audit-final.py. Result: pass. Evidence:4059exact non-agent source hashes against4025baseline,46intentional changed paths (12existing/34new) within approved140,19native pins at9bc445578031fecf56086729d8e4940c77e14d65, exact positive coverage owner sets,13source gates, build/browser and original4links restored on calc. CALC139..141 preserve/report source sentinel wrap, captured split-loop bound and self-Set clear-first behavior. Task157 mistaken4016constructor identity is corrected through real EE_PARA_JUST4037 declaration without editing closed task history.

    Limits: real SharedStringPool/CharClass normalization and ContentNode-dependent ClearWrongs remain absent rather than fake success methods. Full EditTextObject/EditEngine/default-font pool/Calc document/connected UI/same-model ODS are still pending. Native allocation/refcount/cache/surrogate/physical pointer interning and iterator ABI are deliberately erased under user JS-GC direction. Existing native string/item APIs are reused; no new lifetime manager/compiler/probe/sanitizer or UI localization. Source-derived parent engine copy/paste tests are context references, not claimed implemented scenarios. Writer-only coverage gaps exempt; none were repaired. Full all-app run remains deferred until genuine minimum connected UI+same-model ODS readiness, followed by applicable repairs and requested pause. Goal remains active. Quality review is same-agent, not independent.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T17:10:49.427Z — VERIFY — ok

    By: CODER

    Note: Verified source 9f9f85dfc950:194 related and187Calc tests plus19browser cases and build pass; exact8shared/33Calc owners raw S/B/F/L100/every counter positive; all13gates/inventory0,19native pins/70EE declarations,46paths/4059hashes and4reference links restored. Base Clone runtime unchanged; same-agent quality pass. Full engine/Calc model/UI/ODS remain pending, goal active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T17:10:15.083Z, excerpt_hash=sha256:b20e83e8efe804c3bbf649e8a1c5499dcfe8a8438a97b6d8cf5580257d5eb99f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151630-XDV8G9/blueprint/resolved-snapshot.json
    - old_digest: aba64c86c1a417361085b80776b96fb02778c6683d4fbef6fbb5a3cd07147d80
    - current_digest: aba64c86c1a417361085b80776b96fb02778c6683d4fbef6fbb5a3cd07147d80
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151630-XDV8G9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610151630-XDV8G9 -m 🧩 XDV8G9 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task intentional source and lifecycle artifacts. Preserve user merges and unrelated tasks; no destructive history operations."
  Findings: |-
    Preflight clean calc at266c0fcf76a838e5639513fb964370befa696f29. Actual getEditEngineItemPool uses dynamic_cast EditEngineItemPool across real secondary pools, then actual EditEngine.CreatePool. SfxItemPool has no full secondary-pool/font/default-engine producer yet; do not fabricate a named generic pool. Actual ContentInfo and XEditAttribute are absent; SharedString exists but SharedStringPool implementation currently only has StringWithHash, so NormalizeString cannot be faked. WrongList.ClearWrongs needs actual ContentNode.Len/GetChar/IsFeature; leave this absent until its owner exists. Native OWN_ATTR_VALUE_END4020 means EE_ITEMS_START4021 and PARA_JUST4037; task157 used arbitrary4016 in a constructor test but incorrectly described it as the actual EE identity. Correct via canonical constants; runtime pool/document was not implemented and unaffected. Earlier bounded read searches found no full field/bullet/font-variation/grab-bag defaults, so complete engine factory remains subsequent work. Native item-holder memory registration/refcounts/caches are deliberately erased under user JS-GC instruction; preserve logical value/pool/copy contracts without a memory-management library.

    - Command: initial typecheck and initial portable related selection. Result: fail. Evidence: the first holder overload needed an explicit nullable-item cast; Readonly mapped types hide private fields in TS7, and the new identity test guessed EE_ITEM_COUNT/EE_ITEMS_COUNT instead of actual EDITITEMCOUNT. Scope: newly introduced signatures/tests only. Resolution: retain const public input views, access original public getters instead of hidden fields, and use actual canonical EDITITEMCOUNT. Retained initial logs; subsequent typecheck passes and all165selected scenarios pass after the naming correction.
    - Command: portable related raw audit. Result: fail. Evidence: selected tests passed but coverage exposed existing Differentiate self/empty branches and the replacing Set return accumulator. Scope: strict whole-owner verification. Resolution: add real public empty/self cases and original Changed notification extension-point scenario; preserve source behavior and do not exclude counters. Integer comparisons in TextInserted prove its final original equality condition, so the last branch is expressed as else with the implication documented. No fabricated impossible BigInt/NaN state or native memory probe.
    - Command: scoped ESLint. Result: fail. Evidence: four forbidden test non-null assertions. Resolution: explicit concrete range/attribute casts, unchanged scenario meaning. Some initial read-only guessed paths did not exist; bounded rg found actual ItemInfo declarations in itempool.ts. No external access or source drift.
    - Observation: generic pools used by these actual internal value constructors do not implement the complete EditEngine default/font/secondary-pool services. Native normalization and ContentNode-dependent ClearWrongs remain absent, not empty-success facades. Current holder scope deliberately does not emulate global interning, memory/refcount/deletion or surrogate ownership. Suspected source quirks are recorded as CALC139..141. Task157 arbitrary constructor Which4016 was incorrectly described in its immutable task notes; this task adds actual EE constants and corrects the test/documentation assumption without rewriting closed history.

    - Command: source gates. Result: rework before acceptance. Evidence: provenance required a basename mapping for solar.hrc.ts and inventory required nonempty upstream tests. Resolution: use canonical TypeScript extension replacement solar.ts mapped to actual include/svl/solar.hrc, without a filename exception. Add inspected upstream editeng/qa/unit/core-test.cxx copy/paste references and explicit limits that the higher-level engine scenarios are not ported. Corrected inventory reports semanticViolationCount0. All70EE declarations are source-evaluated against the native expressions and traced in registry records. The first slot-fix script rejected a missing formatted substring before writing; reran an exact validated replacement, preserving scope.
    - Observation: final source inspection confirms native SlotId handling precedes shared-holder reuse; such holder copies clone even if the existing value is shareable. Resolution: add the actual IsSlot branch and direct slot/adoption regression. Extend related Writer coverage to real format notification/history/browser and node-handle suites; no native ownership/cycle algorithm is implemented. Final checks follow the complete source change.

    - Command: source-gate wrapper inventory capture. Result: infrastructure rework. Evidence: spawnSync buffered only1114112bytes of the approximately4.9MB successful inventory output and terminated the child at its buffer limit; direct file-redirected inventory had semanticViolationCount0. Resolution: capture gate output to file descriptors instead of bounded buffered strings, then rerun the affected inventory and remaining gates; all13pass. This is verification harness output handling, not an application or semantic-inventory failure.
    - Command: final portable related/Calc/build/browser checks and exact hash/native audit. Result: pass. Evidence:194related/187Calc/19browser scenarios; exact8shared and33Calc owners all raw positive100;46intentional paths/4059hashes/19native pins/70evaluated declarations/13source gates pass. Resolution: commit only approved source/task paths, same-agent quality review and canonical finish. Higher-level text engine/pool/Calc document/UI/same-model ODS are deliberately not claimed ready; goal remains active, no full all-app run or pause before user readiness condition.
id_source: "generated"
---
## Summary

Task158 ports actual paragraph content and character-attribute value owners used by EditTextObject, with their required range/spell-state values and shared item-set copy contract.

## Scope

At most140intentional non-agent paths: original editeng editobj/editobj2/edtspell/misspellrange/eeitem owners; SfxStyleFamily declaration; existing SVL itemset/itempool/poolitem type signature and GC-owned SfxPoolItemHolder logical value binding only; relevant tests and canonical inventory/capability/provenance/docs. Correct the task157 numeric EE_PARA_JUST test/documentation assumption using actual declarations. No fake EditTextObject/ContentNode/SharedStringPool/EditEngine pool factory, translated UI resources, native compiler/probe, cache/refcount/deletion/ownership manager, or unrelated Writer feature. Normalization and ContentNode-dependent ClearWrongs stay absent until actual providers exist; do not implement no-op/empty success substitutes. Native physical pointer/cache identity and iterator ABI are not reproduced under JS GC.

## Plan

Implement native EE Which and style-family declarations from actual source offsets; port ContentInfo text/style/family/paragraph/character/spell-state value storage and target-pool copy/equality with genuine XEditAttribute. Restore SfxItemSet.Set deep/shallow/clear semantics used by copy; implement only logical item/pool binding of SfxPoolItemHolder with native public value/access/copy/assignment behavior under ordinary JS references, erasing native memory machinery. Port real WrongList values, copy, query and non-ContentNode text-range transformations with exact unsigned64 invalid sentinel. Reuse existing shared Unicode/items/pools; no fake high-level class. Add direct nonempty/source-backed tests, strict whole-owner shared/Calc coverage, all source gates/build and related Writer tests, then review/verify/commit/finish. This coherent data boundary leads into real EditTextObject/pool/model work, not standalone declaration-only tasks.

## Verify Steps

Pinned editeng/source/editeng/editobj.cxx and editobj2.hxx, editeng/inc/edtspell.hxx and edtspell.cxx, misspellrange.hxx/cxx, svl/itemset.hxx/itemset.cxx/globalpool.cxx/itempool.cxx and solar.hrc/eeitem.hxx/style.hxx authoritative. EE_ITEMS_START4021, PARA_JUST4037, CHAR_START4042, CHAR_END4077, feature4078..4081, complete61item IDs and9style-family values. ContentInfo default actual SharedString/OUString/Para family and fixed paragraph-character range, text UTF16/copy/stable style/shared views, independent target-pool paragraph/character copies, exact raw positions and feature boundaries, payload equality versus separate spelling equality. SfxItemSet.Set clears first including self-set, intersects declared ranges, deep copies effective SET-only parents, shallow reuses actual PutSet(false); preserve INVALID/DISABLED and return behavior. GC item holder is a logical pool/value binding with native empty/copy/assignment/query and borrowed getters, actual clone/copy/shareability/default cases, no counters/managers/native lifetime APIs. WrongList range/invalid-state constructors/copy/queries/insertion/deletion and all represented methods match source including native unsigned64 wrap and fixed original insertion loop bound; no spell service or fabricated ContentNode. Reuse actual OUString/SharedString/items and pools, not mock providers. All changed/new executable shared owners and all Calc measured raw S/B/F/L100, every raw counter positive and exact owner sets; type-only base Clone signature must prove unchanged emitted behavior or include whole-owner coverage. Related Writer tests, Writer-only coverage gaps exempt. All13source gates, inventory semanticViolationCount0, portable build and applicable related browser regression; source refs absent during tests/build/browser and restored finally, native source pins and <=140intentional paths/exact source hashes/clean calc proof. Full all-app run only on genuine minimum connected UI+same-model ODS readiness, then repairs and pause per user.

## Verification

Command: node output/playwright/task158-checks/portable.mjs. Result: pass. Evidence:194related tests/18files,187Calc tests/76files. Exact8changed/new shared executable owners raw S543/B362/F118/L471 and all33Calc owners S4179/B2731/F821/L3727 have S/B/F/L100 and every raw counter positive. Actual ContentInfo/XEditAttribute/default Which/style/range/spelling values and native Set/holder pool-targeted copies are exercised through genuine objects; related Writer format notification/history/browser and node-attribute-handle suites pass. The type-only base Clone signature has identical emitted-runtime SHA256 and explicit source hashes, so it is not falsely counted as runtime coverage. Pure header reexports contain no additional value algorithms.

Command: exact13argv in source-gates.json; affected provenance/inventory/diff repeated after acceptance-only metadata text. Result: pass. Evidence:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and42module-boundary tests, semanticViolationCount0. No guard algorithm/exception changes; both complete boundary source/test files retain baseline hashes. Canonical solar.ts replaces native solar.hrc extension without an extra filename exception. All70EE declaration expressions are evaluated against the pinned native source and traced in registry. Old semantic status/history is retained, no broad parity promotion.

Command: node output/playwright/task158-checks/build-browser-portable.mjs. Result: pass. Evidence:production build plus19Writer browser scenarios/7files, no skips/retries/flaky results. Scope: built-product automatic text layout, paragraph/list/cell history and ODT reopening, numbering/tab/ruler behavior. All4source references absent during suites/build/browser, restored to original symlink targets finally.

Command: python3 output/playwright/task158-checks/audit-final.py. Result: pass. Evidence:4059exact non-agent source hashes against4025baseline,46intentional changed paths (12existing/34new) within approved140,19native pins at9bc445578031fecf56086729d8e4940c77e14d65, exact positive coverage owner sets,13source gates, build/browser and original4links restored on calc. CALC139..141 preserve/report source sentinel wrap, captured split-loop bound and self-Set clear-first behavior. Task157 mistaken4016constructor identity is corrected through real EE_PARA_JUST4037 declaration without editing closed task history.

Limits: real SharedStringPool/CharClass normalization and ContentNode-dependent ClearWrongs remain absent rather than fake success methods. Full EditTextObject/EditEngine/default-font pool/Calc document/connected UI/same-model ODS are still pending. Native allocation/refcount/cache/surrogate/physical pointer interning and iterator ABI are deliberately erased under user JS-GC direction. Existing native string/item APIs are reused; no new lifetime manager/compiler/probe/sanitizer or UI localization. Source-derived parent engine copy/paste tests are context references, not claimed implemented scenarios. Writer-only coverage gaps exempt; none were repaired. Full all-app run remains deferred until genuine minimum connected UI+same-model ODS readiness, followed by applicable repairs and requested pause. Goal remains active. Quality review is same-agent, not independent.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T17:10:49.427Z — VERIFY — ok

By: CODER

Note: Verified source 9f9f85dfc950:194 related and187Calc tests plus19browser cases and build pass; exact8shared/33Calc owners raw S/B/F/L100/every counter positive; all13gates/inventory0,19native pins/70EE declarations,46paths/4059hashes and4reference links restored. Base Clone runtime unchanged; same-agent quality pass. Full engine/Calc model/UI/ODS remain pending, goal active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T17:10:15.083Z, excerpt_hash=sha256:b20e83e8efe804c3bbf649e8a1c5499dcfe8a8438a97b6d8cf5580257d5eb99f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151630-XDV8G9/blueprint/resolved-snapshot.json
- old_digest: aba64c86c1a417361085b80776b96fb02778c6683d4fbef6fbb5a3cd07147d80
- current_digest: aba64c86c1a417361085b80776b96fb02778c6683d4fbef6fbb5a3cd07147d80
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151630-XDV8G9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610151630-XDV8G9 -m 🧩 XDV8G9 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task intentional source and lifecycle artifacts. Preserve user merges and unrelated tasks; no destructive history operations.

## Findings

Preflight clean calc at266c0fcf76a838e5639513fb964370befa696f29. Actual getEditEngineItemPool uses dynamic_cast EditEngineItemPool across real secondary pools, then actual EditEngine.CreatePool. SfxItemPool has no full secondary-pool/font/default-engine producer yet; do not fabricate a named generic pool. Actual ContentInfo and XEditAttribute are absent; SharedString exists but SharedStringPool implementation currently only has StringWithHash, so NormalizeString cannot be faked. WrongList.ClearWrongs needs actual ContentNode.Len/GetChar/IsFeature; leave this absent until its owner exists. Native OWN_ATTR_VALUE_END4020 means EE_ITEMS_START4021 and PARA_JUST4037; task157 used arbitrary4016 in a constructor test but incorrectly described it as the actual EE identity. Correct via canonical constants; runtime pool/document was not implemented and unaffected. Earlier bounded read searches found no full field/bullet/font-variation/grab-bag defaults, so complete engine factory remains subsequent work. Native item-holder memory registration/refcounts/caches are deliberately erased under user JS-GC instruction; preserve logical value/pool/copy contracts without a memory-management library.

- Command: initial typecheck and initial portable related selection. Result: fail. Evidence: the first holder overload needed an explicit nullable-item cast; Readonly mapped types hide private fields in TS7, and the new identity test guessed EE_ITEM_COUNT/EE_ITEMS_COUNT instead of actual EDITITEMCOUNT. Scope: newly introduced signatures/tests only. Resolution: retain const public input views, access original public getters instead of hidden fields, and use actual canonical EDITITEMCOUNT. Retained initial logs; subsequent typecheck passes and all165selected scenarios pass after the naming correction.
- Command: portable related raw audit. Result: fail. Evidence: selected tests passed but coverage exposed existing Differentiate self/empty branches and the replacing Set return accumulator. Scope: strict whole-owner verification. Resolution: add real public empty/self cases and original Changed notification extension-point scenario; preserve source behavior and do not exclude counters. Integer comparisons in TextInserted prove its final original equality condition, so the last branch is expressed as else with the implication documented. No fabricated impossible BigInt/NaN state or native memory probe.
- Command: scoped ESLint. Result: fail. Evidence: four forbidden test non-null assertions. Resolution: explicit concrete range/attribute casts, unchanged scenario meaning. Some initial read-only guessed paths did not exist; bounded rg found actual ItemInfo declarations in itempool.ts. No external access or source drift.
- Observation: generic pools used by these actual internal value constructors do not implement the complete EditEngine default/font/secondary-pool services. Native normalization and ContentNode-dependent ClearWrongs remain absent, not empty-success facades. Current holder scope deliberately does not emulate global interning, memory/refcount/deletion or surrogate ownership. Suspected source quirks are recorded as CALC139..141. Task157 arbitrary constructor Which4016 was incorrectly described in its immutable task notes; this task adds actual EE constants and corrects the test/documentation assumption without rewriting closed history.

- Command: source gates. Result: rework before acceptance. Evidence: provenance required a basename mapping for solar.hrc.ts and inventory required nonempty upstream tests. Resolution: use canonical TypeScript extension replacement solar.ts mapped to actual include/svl/solar.hrc, without a filename exception. Add inspected upstream editeng/qa/unit/core-test.cxx copy/paste references and explicit limits that the higher-level engine scenarios are not ported. Corrected inventory reports semanticViolationCount0. All70EE declarations are source-evaluated against the native expressions and traced in registry records. The first slot-fix script rejected a missing formatted substring before writing; reran an exact validated replacement, preserving scope.
- Observation: final source inspection confirms native SlotId handling precedes shared-holder reuse; such holder copies clone even if the existing value is shareable. Resolution: add the actual IsSlot branch and direct slot/adoption regression. Extend related Writer coverage to real format notification/history/browser and node-handle suites; no native ownership/cycle algorithm is implemented. Final checks follow the complete source change.

- Command: source-gate wrapper inventory capture. Result: infrastructure rework. Evidence: spawnSync buffered only1114112bytes of the approximately4.9MB successful inventory output and terminated the child at its buffer limit; direct file-redirected inventory had semanticViolationCount0. Resolution: capture gate output to file descriptors instead of bounded buffered strings, then rerun the affected inventory and remaining gates; all13pass. This is verification harness output handling, not an application or semantic-inventory failure.
- Command: final portable related/Calc/build/browser checks and exact hash/native audit. Result: pass. Evidence:194related/187Calc/19browser scenarios; exact8shared and33Calc owners all raw positive100;46intentional paths/4059hashes/19native pins/70evaluated declarations/13source gates pass. Resolution: commit only approved source/task paths, same-agent quality review and canonical finish. Higher-level text engine/pool/Calc document/UI/same-model ODS are deliberately not claimed ready; goal remains active, no full all-app run or pause before user readiness condition.
