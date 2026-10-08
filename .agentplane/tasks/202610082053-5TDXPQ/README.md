---
id: "202610082053-5TDXPQ"
title: "Restore native format attribute delta notifications and inheritance filtering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 23
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T21:19:48.774Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-08T21:29:50.953Z"
  updated_by: "CODER"
  note: "Verified actual implementation 913bf782799155f0ab7ee9a72d1fd8f13b1733e7;1575unique app20fresh13Chromium;all-four100actual app/inventory;source/static/build/governance/artifact pass;660old byte-identical;317old metadata preserved;explicitly non-independent actual-SHA EVALUATOR pass. Full245 skipped user cadence237→247, whole goal ACTIVE."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-08T21:29:50.299Z"
  updated_by: "EVALUATOR"
  note: "Actual implementation 913bf782799155f0ab7ee9a72d1fd8f13b1733e7 reviewed by the current coding agent, explicitly non-independent;16 committed semantic paths and4 deterministic certificates reconstructed byte-identically.1575unique app/20fresh/13Chromium and app/inventory all-four100;660old acceptance and317old metadata preserved."
  evaluated_sha: "913bf782799155f0ab7ee9a72d1fd8f13b1733e7"
  blueprint_digest: "74175534f9db8e2d43597d0cb3f19bde10c6f8105ff1dcec695b09c1f5803606"
  evidence_refs:
    - ".agentplane/tasks/202610082053-5TDXPQ/README.md"
    - ".agentplane/tasks/202610082053-5TDXPQ/quality/20261008-212950299-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610082053-5TDXPQ/quality/20261008-212950299-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610082053-5TDXPQ/quality/20261008-212950299-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610082053-5TDXPQ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610082053-5TDXPQ/evidence/actual-sha-review.json"
  findings:
    - "Exact native deltas/locking/inherited filtering and pooled cell defaults verified. Existing device invalidation does not add model revisions.3 materially affected fresh revalidations disclosed; raw partial coverage threshold exits/skips retained. Complete native UI registration, formula calculation and frame geometry/invalidation remain partial; whole goal ACTIVE."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: native exact format change deltas, locking and inheritance filtering under standing upstream parity goal; preserve660prior tests and actual100coverage, one upstream-absent related runtime profile."
events:
  -
    type: "status"
    at: "2026-10-08T20:54:23.853Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native exact format change deltas, locking and inheritance filtering under standing upstream parity goal; preserve660prior tests and actual100coverage, one upstream-absent related runtime profile."
  -
    type: "verify"
    at: "2026-10-08T21:29:50.953Z"
    author: "CODER"
    state: "ok"
    note: "Verified actual implementation 913bf782799155f0ab7ee9a72d1fd8f13b1733e7;1575unique app20fresh13Chromium;all-four100actual app/inventory;source/static/build/governance/artifact pass;660old byte-identical;317old metadata preserved;explicitly non-independent actual-SHA EVALUATOR pass. Full245 skipped user cadence237→247, whole goal ACTIVE."
doc_version: 3
doc_updated_at: "2026-10-08T21:29:51.009Z"
doc_updated_by: "CODER"
description: "Iteration245: replace generic row/cell format attribute notification overrides with native SwAttrSetChg and AttrSetChangeHint through SwModify locking, existing Put_BC/ClearItem_BC, original parent registration and native Differentiate filtering. Preserve original clients, document device notifications and registered I/O deviations. Verify actual original frame notification identity, inheritance, locking/reentrancy and real UI/history without upstream runtime; all prior tests byte-identical and actual100coverage, full cadence237to247."
sections:
  Summary: "Restore source-shaped native format attribute deltas, modify locking and parent filtering for original model/frame clients."
  Scope: |-
    apps/office/src/sw/inc/hints.ts
    apps/office/src/sw/inc/calbck.ts
    apps/office/src/sw/source/core/attr/format.ts
    apps/office/src/sw/inc/swtblfmt.ts
    apps/office/src/svl/source/items/itemset.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/svl/source/items/cintitem.ts
    apps/office/src/svl/source/items/intitem.ts
    apps/office/src/editeng/source/items/frmitems.ts
    apps/office/src/sw/source/core/attr/swatrset.ts
    apps/office/src/sw/source/core/attr/cellatr.ts
    apps/office/src/sw/source/core/attr/native-format-attribute-notify.test.ts
    apps/office/src/sw/source/core/undo/native-format-attribute-notify-history.test.ts
    apps/office/src/sw/browser/editor/native-format-attribute-notify.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration245 ports native SwAttrSetChg borrowed original/delta ownership and copy semantics, AttrSetChangeHint, ClientNotifyAttrChg and SwModify boolean modify locking. SwFormat SetFormatAttr/SetFormatAttrSet/reset-single-range/reset-all collect exact old/new effective values with existing SwAttrSet Put_BC/ClearItem_BC and notify actual registered format clients before existing document device signals; equal/empty/locked paths do not emit native notifications. Parent formats register actual child SwFormat clients; inherited attribute hints copy only deltas and native Differentiate removes every locally-present WhichId, including invalid/disabled, without copying or replacing original format owners. Row/cell generic attribute overrides are removed; original client/hint identities and full direct item/history owners remain. Native row/cell Claim locks copying before retargeting original frames. Preserve existing I/O/recovery/settings/whole writer-view/pin/stash and all660 prior acceptance files byte-identically. Three fresh files cover borrowed/copy native change sets, precise old/new defaults/direct/inherited/reset deltas, locking and reentrant mutation/exception release, actual parent registration/filtering/transaction, original physical row/cell notification clients, full Undo/Redo and real mounted UI styles. Sixteen scoped paths: five ancillary native pooled-item/default paths are necessary to collect effective old/new deltas for already supported opaque cell WhichIds. Port CntUInt32Item/SfxUInt32Item inheritance and mutable unsigned scalar contract, SvxProtectItem native three false defaults/flags/clone/equality, SwTableBoxNumFormat default100 and text-locale normalization modulo10000, non-shareable SwTableBoxFormula basic formula/defined-in ownership and clone reset, SwTableBoxValue double/NaN equality. Register actual native defaults127/157/158/159, with existing browser snapshot factories explicitly bounded. Full formula parser/calculation/name conversion/UNO remains unported; no placeholder defaults or notification bypass. All317metadata status/default/classification/order/evidence prefixes retained; append one new unverified cellatr module with sorted runtime insertion and provenance original order. Fresh tests exercise native item/default/clone/equality/restore and precise native deltas for these items. Full native cache/font/fill/outline/Sfx/VCL frame invalidation/geometry/content/follows/nested/UNO remains partial. Same current agent sequential roles with explicitly non-independent actual-SHA EVALUATOR, no network/global/subagents/AP copied source/raw evidence. New/related runtime/build once upstream physically absent/restored finally; failed/new/unexecuted-only closures; a materially changed production device path requires explicit revalidation of its affected fresh direct-device/UI scenarios, never an unchanged passing replay; actual all-four100 source/map/complete unchanged region counters from244. Last full237,next247,no full245. Meaningful clean closure, DONE immutable, parent exact-prefix713885/hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 append; goal ACTIVE."
  Verify Steps: |-
    1. Byte-bind native SwAttrSetChg/AttrSetChangeHint declarations in hints.hxx and implementation in hints.cxx, ClientNotifyAttrChg/SwModify lock dispatch in calbck.cxx/hxx, SwFormat Set/Reset/SwClientNotify inheritance filter in format.cxx, SfxItemSet Differentiate including INVALID/DISABLED in itemset.cxx, row/box locked claims in swtable.cxx; actual default registrations in init.cxx, unsigned32 base in cintitem.hxx/cxx and intitem.hxx, protection in protitem.hxx/frmitems.cxx, cellatr.hxx/cxx and numeric constants in zforlist.hxx. Pin9bc445578031fecf56086729d8e4940c77e14d65; no source copies in AP.
    2. Fresh item tests cover native default127/157/158/159, unsigned32 range/mutation, text-locale normalization, all protection flags, formula non-sharing/owner reset, double/NaN equality and browser snapshot restore; no opaque default substitution. Fresh direct tests assert exact original format/client/attribute-set identities and borrowed old/new delta sets; copy constructor only clones deltas. Effective parent/default old/new values, one multi-item delta, equality/empty/no-op and reset-single/range/all/locked semantics, boolean locking/reentrant suppression/exception unlock, actual child parent registration and all locally-present WhichId filtering including INVALID/DISABLED, transaction and inherited broadcast, original linked row/cell frames receive exact native hints. Real original table attribute Undo/Redo and mounted controls/styles retain graph/text/cursor, peer formats and no generic row/cell attribute shim.
    3. All660 prior acceptance files byte-identical; fresh files no only/skip/todo. All317 existing metadata records/status/default/classification/order/prefixes retained, no promotion; one new unverified native cellatr record. Source physical<1000lines and exact16semantic paths.
    4. Six statics/build/exact new and related format/itemset/registration/paragraph/style/table/list/layout/history/mounted/ODF/Chromium runtime once upstream physically absent/restored finally. No unchanged passing replay; failed/new/unexecuted-only closures and explicitly recorded fresh direct-device/UI scenarios affected by the corrected production paint notification contract retain partial raw threshold exits/skips. Full245 skipped per explicit user cadence last237,next247.
    5. Actual all-four100 app/inventory coverage reconstructed from244 whole identical source/maps or complete unchanged declaration/body/enclosing branch/all locations; no individual clamping/sanitization/weaker thresholds. Unchanged inventory/infra runtime not replayed.
    6. Restored source generator/source-tree/provenance/inventory invariants/parity, doctor/routing/diff/artifact audits. IO4/whole writer-view/pin/stash preserved. Raw scripts/maps/results/source snapshots only ignored app cache; AP bounded English MD/JSON identifiers/hashes/counts. Actual implementation-SHA explicitly non-independent current-agent EVALUATOR reconstructs4certificates byte-identically. Clean meaningful close, DONE immutable; parent exact-prefix713885/hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 append, goal ACTIVE.
  Verification: |-
    Command: npm run test:static; exact new/related runtime selections in evidence/targeted-profile.json, closure1.json, closure2.json.
    Result:1575 unique app cases passed including20 fresh cases;13 Chromium cases passed,0unhandled/flaky. Initial1538pass6fail; closure1 9pass30skip resolves6failures and explicitly revalidates3 materially affected fresh device/UI cases after production paint contract correction; closure2 31pass14skip only new/unexecuted related modules. No unchanged passing replay. Build/runtime upstream physically absent and restored finally; raw partial threshold exits1 retained.
    Command: actual source/map/complete contiguous native declaration/signature/body/enclosing branch/all-location coverage proof.
    Result: all-four100 app17953lines/19706statements/4515functions/14489branches across315sources; inventory1464/1523/384/1081 across38sources. Prior244 counters only whole-source/map or complete unchanged native-region bindings. V8 generated duplicate method display ordinal changes documented with full source hashes; no individual counter clamping/sanitization. Unchanged inventory/infra runtime not replayed.
    Command: npm run format:check;lint;typecheck;check:dependencies;check:docs;check:file-size; UI generator --check;check:source-tree;check:source-provenance;inventory:invariants;inventory:parity;ap doctor;node .agentplane/policy/check-routing.mjs;git diff --check.
    Result:pass.16native source files byte-bound to pin9bc445578031fecf56086729d8e4940c77e14d65. IO4/whole writer-view/stash/parent713885chars hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 preserved. Doctor two historical managed-hook/old DONE2Z3962 hash warnings unchanged; DONE leaves untouched.
    Evidence: bounded English MD/JSON identifiers/hashes/counts only; raw scripts/results/maps/source snapshots ignored app cache.660prior acceptance files byte-identical;663total files.317old metadata fields/status/default/classification/order/prefixes preserved;new cellatr record unverified. Native invalidation/geometry/full SwTableFormula calculation/second-base/UNO/direct native UI registration remain incomplete;goal ACTIVE.
    Skipped:full app/inventory/Chromium suite.
    Reason: explicit user cadence one full run per10AgentPlane tasks, last237,next247,current245.
    Risk: whole-project parity is not proven by the targeted leaf.
    Approval:user active goal.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-08T21:29:50.953Z — VERIFY — ok

    By: CODER

    Note: Verified actual implementation 913bf782799155f0ab7ee9a72d1fd8f13b1733e7;1575unique app20fresh13Chromium;all-four100actual app/inventory;source/static/build/governance/artifact pass;660old byte-identical;317old metadata preserved;explicitly non-independent actual-SHA EVALUATOR pass. Full245 skipped user cadence237→247, whole goal ACTIVE.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T21:28:25.447Z, excerpt_hash=sha256:86e4eb12ffe7fb605375a3f4f8bca84078943a8e626fa40a133c2de612870e60

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610082053-5TDXPQ/blueprint/resolved-snapshot.json
    - old_digest: 74175534f9db8e2d43597d0cb3f19bde10c6f8105ff1dcec695b09c1f5803606
    - current_digest: 74175534f9db8e2d43597d0cb3f19bde10c6f8105ff1dcec695b09c1f5803606
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610082053-5TDXPQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610082053-5TDXPQ -m 🧩 5TDXPQ task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf's semantic implementation commit; preserve previous completed leaves, parent exact prefix and registered document I/O deviations."
  Findings: |-
    Previous244 DONE actual8214d309ac4a7a67cee7724f59c20e49d0aef8c5; clean main/direct47b9d5853ab51daa3be1ba5e20172dc344c7025a. Read-only review found base SwFormat emits document-only generic signals and native row/cell formats supply separate generic client overrides; neither conveys native changed-item sets. Existing Put_BC/ClearItem_BC already collect exact native deltas and will be reused. This leaf replaces generic kernel shims with original native typed change sets and inheritance filtering, enabling subsequent frame invalidation work; it does not claim full frame parity. Standing user goal authorizes safe local implementation. No network/global/subagents/source copies/AP raw files.

    - Observation: Initial static typecheck rejected registering a SwClient at SwDoc, which is not SwModify; the fresh device assertion now uses actual DocumentStateManager registration. JSDoc closures were fixed. Initial targeted runtime:1538pass6fail;13Chromiumpass. Five unchanged old failures exposed extra model revision changes from the generic format device signal; native format notifications now invalidate the existing device broadcaster without recording another document mutation. One fresh parent test omitted the existing inheritance signal emitted at reparenting. A localeCompare metadata sort temporarily reordered old records; restored required binary sorted insertion and scope audit proves660old byte-identical/317old metadata preserved.
      Impact: No runtime calls upstream; original source restored finally. Passing results from the original device path cannot prove the materially changed native/device boundary. Preserve raw failures and coverage threshold exits.
      Resolution: Keep all660old tests unchanged. Failed-only closure also revalidates exactly3 fresh passing cases affected by the corrected production device semantics: direct-device ordering and both mounted main UI cases. This is recorded as affected-case revalidation, not claimed as zero replay. No full245;last237,next247. Native formula calculation/complete frame invalidation/UI registration remain partial.

    - Observation: Runtime census initially keyed only by rendered test names; two existing NaN/Infinity parameter cases render the same [1000,null] label. Name-only collection collapsed one distinct initial case. Shell batch continued read-only checks/evidence collection after the census error; route recomputed before further implementation.
      Impact: A name-only count would under-report unique acceptance and over-report unchanged replay. No tests or counters were altered.
      Resolution: Bind each file/fullName/occurrence index across complete result arrays including skips, exactly as prior verified census. Deterministic census now proves1575unique passes,20fresh,13Chromium and3explicit materially affected fresh revalidations. Generated V8 duplicate method labels normalized only trailing display ordinals while full declaration/signature/body/enclosing branch/all mapped locations and source hashes remain verified; actual coverage all-four100. Full clear delegated no-op guard uses an explicit dependency result stub, with restored real clear/default behavior also asserted.
id_source: "generated"
---
## Summary

Restore source-shaped native format attribute deltas, modify locking and parent filtering for original model/frame clients.

## Scope

apps/office/src/sw/inc/hints.ts
apps/office/src/sw/inc/calbck.ts
apps/office/src/sw/source/core/attr/format.ts
apps/office/src/sw/inc/swtblfmt.ts
apps/office/src/svl/source/items/itemset.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/svl/source/items/cintitem.ts
apps/office/src/svl/source/items/intitem.ts
apps/office/src/editeng/source/items/frmitems.ts
apps/office/src/sw/source/core/attr/swatrset.ts
apps/office/src/sw/source/core/attr/cellatr.ts
apps/office/src/sw/source/core/attr/native-format-attribute-notify.test.ts
apps/office/src/sw/source/core/undo/native-format-attribute-notify-history.test.ts
apps/office/src/sw/browser/editor/native-format-attribute-notify.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration245 ports native SwAttrSetChg borrowed original/delta ownership and copy semantics, AttrSetChangeHint, ClientNotifyAttrChg and SwModify boolean modify locking. SwFormat SetFormatAttr/SetFormatAttrSet/reset-single-range/reset-all collect exact old/new effective values with existing SwAttrSet Put_BC/ClearItem_BC and notify actual registered format clients before existing document device signals; equal/empty/locked paths do not emit native notifications. Parent formats register actual child SwFormat clients; inherited attribute hints copy only deltas and native Differentiate removes every locally-present WhichId, including invalid/disabled, without copying or replacing original format owners. Row/cell generic attribute overrides are removed; original client/hint identities and full direct item/history owners remain. Native row/cell Claim locks copying before retargeting original frames. Preserve existing I/O/recovery/settings/whole writer-view/pin/stash and all660 prior acceptance files byte-identically. Three fresh files cover borrowed/copy native change sets, precise old/new defaults/direct/inherited/reset deltas, locking and reentrant mutation/exception release, actual parent registration/filtering/transaction, original physical row/cell notification clients, full Undo/Redo and real mounted UI styles. Sixteen scoped paths: five ancillary native pooled-item/default paths are necessary to collect effective old/new deltas for already supported opaque cell WhichIds. Port CntUInt32Item/SfxUInt32Item inheritance and mutable unsigned scalar contract, SvxProtectItem native three false defaults/flags/clone/equality, SwTableBoxNumFormat default100 and text-locale normalization modulo10000, non-shareable SwTableBoxFormula basic formula/defined-in ownership and clone reset, SwTableBoxValue double/NaN equality. Register actual native defaults127/157/158/159, with existing browser snapshot factories explicitly bounded. Full formula parser/calculation/name conversion/UNO remains unported; no placeholder defaults or notification bypass. All317metadata status/default/classification/order/evidence prefixes retained; append one new unverified cellatr module with sorted runtime insertion and provenance original order. Fresh tests exercise native item/default/clone/equality/restore and precise native deltas for these items. Full native cache/font/fill/outline/Sfx/VCL frame invalidation/geometry/content/follows/nested/UNO remains partial. Same current agent sequential roles with explicitly non-independent actual-SHA EVALUATOR, no network/global/subagents/AP copied source/raw evidence. New/related runtime/build once upstream physically absent/restored finally; failed/new/unexecuted-only closures; a materially changed production device path requires explicit revalidation of its affected fresh direct-device/UI scenarios, never an unchanged passing replay; actual all-four100 source/map/complete unchanged region counters from244. Last full237,next247,no full245. Meaningful clean closure, DONE immutable, parent exact-prefix713885/hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 append; goal ACTIVE.

## Verify Steps

1. Byte-bind native SwAttrSetChg/AttrSetChangeHint declarations in hints.hxx and implementation in hints.cxx, ClientNotifyAttrChg/SwModify lock dispatch in calbck.cxx/hxx, SwFormat Set/Reset/SwClientNotify inheritance filter in format.cxx, SfxItemSet Differentiate including INVALID/DISABLED in itemset.cxx, row/box locked claims in swtable.cxx; actual default registrations in init.cxx, unsigned32 base in cintitem.hxx/cxx and intitem.hxx, protection in protitem.hxx/frmitems.cxx, cellatr.hxx/cxx and numeric constants in zforlist.hxx. Pin9bc445578031fecf56086729d8e4940c77e14d65; no source copies in AP.
2. Fresh item tests cover native default127/157/158/159, unsigned32 range/mutation, text-locale normalization, all protection flags, formula non-sharing/owner reset, double/NaN equality and browser snapshot restore; no opaque default substitution. Fresh direct tests assert exact original format/client/attribute-set identities and borrowed old/new delta sets; copy constructor only clones deltas. Effective parent/default old/new values, one multi-item delta, equality/empty/no-op and reset-single/range/all/locked semantics, boolean locking/reentrant suppression/exception unlock, actual child parent registration and all locally-present WhichId filtering including INVALID/DISABLED, transaction and inherited broadcast, original linked row/cell frames receive exact native hints. Real original table attribute Undo/Redo and mounted controls/styles retain graph/text/cursor, peer formats and no generic row/cell attribute shim.
3. All660 prior acceptance files byte-identical; fresh files no only/skip/todo. All317 existing metadata records/status/default/classification/order/prefixes retained, no promotion; one new unverified native cellatr record. Source physical<1000lines and exact16semantic paths.
4. Six statics/build/exact new and related format/itemset/registration/paragraph/style/table/list/layout/history/mounted/ODF/Chromium runtime once upstream physically absent/restored finally. No unchanged passing replay; failed/new/unexecuted-only closures and explicitly recorded fresh direct-device/UI scenarios affected by the corrected production paint notification contract retain partial raw threshold exits/skips. Full245 skipped per explicit user cadence last237,next247.
5. Actual all-four100 app/inventory coverage reconstructed from244 whole identical source/maps or complete unchanged declaration/body/enclosing branch/all locations; no individual clamping/sanitization/weaker thresholds. Unchanged inventory/infra runtime not replayed.
6. Restored source generator/source-tree/provenance/inventory invariants/parity, doctor/routing/diff/artifact audits. IO4/whole writer-view/pin/stash preserved. Raw scripts/maps/results/source snapshots only ignored app cache; AP bounded English MD/JSON identifiers/hashes/counts. Actual implementation-SHA explicitly non-independent current-agent EVALUATOR reconstructs4certificates byte-identically. Clean meaningful close, DONE immutable; parent exact-prefix713885/hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 append, goal ACTIVE.

## Verification

Command: npm run test:static; exact new/related runtime selections in evidence/targeted-profile.json, closure1.json, closure2.json.
Result:1575 unique app cases passed including20 fresh cases;13 Chromium cases passed,0unhandled/flaky. Initial1538pass6fail; closure1 9pass30skip resolves6failures and explicitly revalidates3 materially affected fresh device/UI cases after production paint contract correction; closure2 31pass14skip only new/unexecuted related modules. No unchanged passing replay. Build/runtime upstream physically absent and restored finally; raw partial threshold exits1 retained.
Command: actual source/map/complete contiguous native declaration/signature/body/enclosing branch/all-location coverage proof.
Result: all-four100 app17953lines/19706statements/4515functions/14489branches across315sources; inventory1464/1523/384/1081 across38sources. Prior244 counters only whole-source/map or complete unchanged native-region bindings. V8 generated duplicate method display ordinal changes documented with full source hashes; no individual counter clamping/sanitization. Unchanged inventory/infra runtime not replayed.
Command: npm run format:check;lint;typecheck;check:dependencies;check:docs;check:file-size; UI generator --check;check:source-tree;check:source-provenance;inventory:invariants;inventory:parity;ap doctor;node .agentplane/policy/check-routing.mjs;git diff --check.
Result:pass.16native source files byte-bound to pin9bc445578031fecf56086729d8e4940c77e14d65. IO4/whole writer-view/stash/parent713885chars hash b266920d76eed2c8340488da9ed6d669859e293dd2c1c58695b5770e2b96ad17 preserved. Doctor two historical managed-hook/old DONE2Z3962 hash warnings unchanged; DONE leaves untouched.
Evidence: bounded English MD/JSON identifiers/hashes/counts only; raw scripts/results/maps/source snapshots ignored app cache.660prior acceptance files byte-identical;663total files.317old metadata fields/status/default/classification/order/prefixes preserved;new cellatr record unverified. Native invalidation/geometry/full SwTableFormula calculation/second-base/UNO/direct native UI registration remain incomplete;goal ACTIVE.
Skipped:full app/inventory/Chromium suite.
Reason: explicit user cadence one full run per10AgentPlane tasks, last237,next247,current245.
Risk: whole-project parity is not proven by the targeted leaf.
Approval:user active goal.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-08T21:29:50.953Z — VERIFY — ok

By: CODER

Note: Verified actual implementation 913bf782799155f0ab7ee9a72d1fd8f13b1733e7;1575unique app20fresh13Chromium;all-four100actual app/inventory;source/static/build/governance/artifact pass;660old byte-identical;317old metadata preserved;explicitly non-independent actual-SHA EVALUATOR pass. Full245 skipped user cadence237→247, whole goal ACTIVE.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T21:28:25.447Z, excerpt_hash=sha256:86e4eb12ffe7fb605375a3f4f8bca84078943a8e626fa40a133c2de612870e60

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610082053-5TDXPQ/blueprint/resolved-snapshot.json
- old_digest: 74175534f9db8e2d43597d0cb3f19bde10c6f8105ff1dcec695b09c1f5803606
- current_digest: 74175534f9db8e2d43597d0cb3f19bde10c6f8105ff1dcec695b09c1f5803606
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610082053-5TDXPQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610082053-5TDXPQ -m 🧩 5TDXPQ task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf's semantic implementation commit; preserve previous completed leaves, parent exact prefix and registered document I/O deviations.

## Findings

Previous244 DONE actual8214d309ac4a7a67cee7724f59c20e49d0aef8c5; clean main/direct47b9d5853ab51daa3be1ba5e20172dc344c7025a. Read-only review found base SwFormat emits document-only generic signals and native row/cell formats supply separate generic client overrides; neither conveys native changed-item sets. Existing Put_BC/ClearItem_BC already collect exact native deltas and will be reused. This leaf replaces generic kernel shims with original native typed change sets and inheritance filtering, enabling subsequent frame invalidation work; it does not claim full frame parity. Standing user goal authorizes safe local implementation. No network/global/subagents/source copies/AP raw files.

- Observation: Initial static typecheck rejected registering a SwClient at SwDoc, which is not SwModify; the fresh device assertion now uses actual DocumentStateManager registration. JSDoc closures were fixed. Initial targeted runtime:1538pass6fail;13Chromiumpass. Five unchanged old failures exposed extra model revision changes from the generic format device signal; native format notifications now invalidate the existing device broadcaster without recording another document mutation. One fresh parent test omitted the existing inheritance signal emitted at reparenting. A localeCompare metadata sort temporarily reordered old records; restored required binary sorted insertion and scope audit proves660old byte-identical/317old metadata preserved.
  Impact: No runtime calls upstream; original source restored finally. Passing results from the original device path cannot prove the materially changed native/device boundary. Preserve raw failures and coverage threshold exits.
  Resolution: Keep all660old tests unchanged. Failed-only closure also revalidates exactly3 fresh passing cases affected by the corrected production device semantics: direct-device ordering and both mounted main UI cases. This is recorded as affected-case revalidation, not claimed as zero replay. No full245;last237,next247. Native formula calculation/complete frame invalidation/UI registration remain partial.

- Observation: Runtime census initially keyed only by rendered test names; two existing NaN/Infinity parameter cases render the same [1000,null] label. Name-only collection collapsed one distinct initial case. Shell batch continued read-only checks/evidence collection after the census error; route recomputed before further implementation.
  Impact: A name-only count would under-report unique acceptance and over-report unchanged replay. No tests or counters were altered.
  Resolution: Bind each file/fullName/occurrence index across complete result arrays including skips, exactly as prior verified census. Deterministic census now proves1575unique passes,20fresh,13Chromium and3explicit materially affected fresh revalidations. Generated V8 duplicate method labels normalized only trailing display ordinals while full declaration/signature/body/enclosing branch/all mapped locations and source hashes remain verified; actual coverage all-four100. Full clear delegated no-op guard uses an explicit dependency result stub, with restored real clear/default behavior also asserted.
