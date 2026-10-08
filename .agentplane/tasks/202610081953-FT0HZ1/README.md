---
id: "202610081953-FT0HZ1"
title: "Own shared native table box formats and preserve their item sets through history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T20:10:57.017Z"
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
    body: "Start: implement original native box format client ownership, direct cell items and indexed native item-set history under the approved standing parity goal; preserve registered deviations and targeted upstream-absent verification cadence."
  -
    author: "CODER"
    body: "Start: Resume native cell formats with two bounded prior-test expected-value captures before destructive Undo; unchanged acceptance literals and no production scope expansion."
events:
  -
    type: "status"
    at: "2026-10-08T19:54:15.951Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original native box format client ownership, direct cell items and indexed native item-set history under the approved standing parity goal; preserve registered deviations and targeted upstream-absent verification cadence."
  -
    type: "status"
    at: "2026-10-08T20:10:57.260Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: Resume native cell formats with two bounded prior-test expected-value captures before destructive Undo; unchanged acceptance literals and no production scope expansion."
doc_version: 3
doc_updated_at: "2026-10-08T20:16:53.351Z"
doc_updated_by: "CODER"
description: "Remove canonical cell geometry records and core/UI DTO round trips by registering original SwTableBox owners at native document frame formats, direct item publication, native history sharing and destructive client cleanup."
sections:
  Summary: "Iteration243 gives existing native table cells document-owned native box frame formats and original client ownership; removes cell record round trips from core/UI publication and attribute history. Standing user goal authorizes safe local parity implementation."
  Scope: |-
    apps/office/src/sw/inc/swtblfmt.ts
    apps/office/src/sw/inc/hints.ts
    apps/office/src/sw/inc/hintids.ts
    apps/office/src/sw/source/core/layout/atrfrm.ts
    apps/office/src/sw/source/core/attr/swatrset.ts
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/docnode/nodes.ts
    apps/office/src/sw/source/core/docnode/ndtbl1.ts
    apps/office/src/sw/source/core/undo/untbl.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/source/core/crsr/native-table-shell-owner.test.ts
    apps/office/src/sw/source/core/table/native-column-insertion.test.ts
    apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
    apps/office/src/sw/source/core/table/native-box-frame-format.test.ts
    apps/office/src/sw/source/core/undo/native-box-frame-format-history.test.ts
    apps/office/src/sw/browser/editor/native-box-frame-format.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/browser/editor/native-numeric-row-insertion.test.tsx
    apps/office/src/sw/source/core/table/native-independent-columns.test.ts
  Plan: "Iteration243 replaces canonical per-cell geometry records with document-owned native SwTableBoxFormat/SwFrameFormat/SfxItemSet and original SwTableBox SwClient registration. Exact aTableBoxSetRange/default-frame inheritance, native pool vertical default and frame box/vertical queries support existing borders, size and vertical alignment without reconstructed DTOs. SwTableBox CheckBoxFormat/ClaimFrameFormat preserve native exclusive/shared ownership and exclude direct formula/value attributes on shared claims; concrete calculation/value engines remain unimplemented. ChgFrameFormat uses TableBoxFormatChanged before original box registration; history uses distinct MoveTableBoxHint, independent unique direct item sets/indices and new shared owners. Native insertion shares source box formats; destructive actual row/column/table node removal releases box clients, ordinary RemoveBox remains nondestructive. SetSwTabBorders and vertical attribute publication write native items directly, reuse old-to-new owners within the operation (border nType grouping), preserve peers, one revision/history, and mounted main JSX reads original native cell formats directly. Explicit existing SwTableBoxFormat records remain construction/transport boundary types only to preserve protected codecs; no new translation path or dead-owner fallback. Five old tests change only required constructor calls and expected-box-value captures before native destruction; all654 prior acceptance assertions/literals/loops intact, untouched files byte-identical. Three fresh files validate ownership/defaults/inheritance/claim/sharing/hints, native full item-set history and deletion, real mounted borders/alignment without GetFormat/SetFormat wrapper publication, preserving original boxes/text/cursor. All316 metadata records/order/status/default/classification/evidence prefixes preserved, bounded append-only notes/no promotion. Full physical SwCellFrame client hierarchy/retargeting, calculations/UNO/nested/merged/pooling/modified-state remain partial. New/related runtime/build once upstream absent/restored finally; failed/new-only closures, no passing replay; all-four100% actual source-bound cumulative counters from242. Last full237,next247,no full243. Standing user goal authorizes safe in-repo work; same-agent sequential roles/non-independent actual-SHA EVALUATOR, no network/global/subagents/AP source/Python/scripts/raw artifacts or DONE mutation. Initial related run1299:1296passed3failed exclusively because two additional prior tests query deleted native box registrations after destructive Undo. Scope adds those two acceptance files for expected-value captures before deletion only; no production expansion, weakened assertions, current passing-case replay or new approval boundary."
  Verify Steps: |-
    1. Byte-bind native SwTableBox ctor/dtor/CheckBoxFormat/Claim/Chg/GetTableBox in swtable.cxx2025-2181/2741; swtblfmt.hxx box format; init.cxx aTableBoxSetRange/default109; docfmt.cxx MakeTableBoxFormat; ndtbl1.cxx SetBoxAttr1276/native border nType922; hints.hxx native TableBoxFormatChanged/MoveTableBoxHint and untbl.cxx NewFrameFormatForBox1124/SaveBoxRestore1236 at pinned9bc445578031fecf56086729d8e4940c77e14d65. No copied source/scripts in AgentPlane.
    2. Fresh literal native format registration/exact ranges/default parent/pool queries, independent complete direct items, exclusive/shared claims/peer retention/opaque formula-value exclusion, distinct borrowed native hints before registration and last-client disposal. Real attribute/insertion history preserves original model box/text/cursor and shared complete item sets without DTO GetFormat/SetFormat calls; numeric deletion releases actual old box clients and Redo creates new ones. Real main UI border/alignment/width rendering and command/Undo/Redo use native owners, leave transport calls unused, and retain original text/model graph. Full cell frame hierarchy/calculation/nested/merged/UNO remains partial.
    3. Baseline654 prior acceptance files; exactly five scoped tests may change required native constructor calls and capture original expected box values before destructive Undo only, all prior literal/identity/history assertions preserved. All unaffected files byte-identical; no only/skip/todo.316metadata fields/order/status/default/classification/evidence prefixes preserved, no promotion, sources<1000physical lines.
    4. Six static gates/build and new/related native border/vertical/cell geometry/table insertion/history/mounted/ODF/Chromium cases once physically upstream absent/restored finally. No passing runtime replay within leaf; failed/new-only closures retain partial raw threshold exits/skips. Full243 skipped per user cadence237 to247.
    5. All-four100% cumulative actual app/inventory counters only for whole identical source/maps or complete unchanged declaration/body/enclosing branch/all locations from242; no clamping/sanitization/weakened criteria. Unchanged inventory/infra runtime not replayed.
    6. Separate restored-vendor generator/source-tree/provenance/invariants/parity and doctor/routing/diff/artifact audits. IO4/whole writer-view/pin/stash preserved. Current-agent EVALUATOR explicitly non-independent binds actual implementation SHA, reconstructs four certificates byte-identically, clean meaningful close/DONE immutability; parent exact-prefix append706479/hash a6fec708ac0df532852be172468b2500ea7273b8654a2a60be08a1d65e37555b. Full goal remains ACTIVE.
  Verification: |-
    Command: npm run test:static; exact new/related runtime selections in evidence/targeted-profile.json,closure1.json,closure2.json.
    Result: pass for1301 unique app scenarios (11 fresh) and25 Chromium scenarios; zero passing runtime replay/unhandled errors/flaky cases. Initial1296passes/3failures; failed-only closure3pass13skip. Two new previously unexecuted shared-border/admission cases passed with5 earlier passes skipped. Runtime/build physically upstream absent, restored finally. Raw partial coverage threshold exits1 retained as partial coverage rather than whole-suite passes.
    Command: actual source/map-bound cumulative coverage reconstruction in evidence/final-coverage.json.
    Result: all-four100% app17722lines/19453statements/4440functions/14358branches and inventory1464/1523/384/1081;313app/38inventory sources. Prior242 counters accepted only for entire identical source/maps or complete unchanged declaration/body/enclosing branch/all branch locations;11 production region transfers. No clamping/sanitization. Unchanged inventory/infra runtime not replayed.
    Command: npm run format:check; lint; typecheck; check:dependencies; check:docs; check:file-size; UI generator --check; check:source-tree; check:source-provenance; inventory:invariants; inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass; source gates separately with upstream restored. Seven source files byte-bound to pin9bc445578031fecf56086729d8e4940c77e14d65; IO4/whole writer-view/stash retained. Doctor retains two historical warnings: managed hook readiness and old DONE2Z3962 missing implementation hash; no mutation of completed leaves.
    Evidence: bounded English JSON identifiers/hashes/counts in active evidence. Raw output/maps/results/source snapshots/reconstruction scripts only in ignored app cache; zero forbidden upstream/application/Python/scripts in AgentPlane.
    Scope: native shared cell formats/client ownership/exact ranges/default inheritance/complete direct items, formula/value sharing exclusion, change/history hint ordering, native border/vertical command sharing, full cell item-set attribute history, insertion/deletion lifetime, direct JSX item reads. Five exact prior constructor/expected-before-destruction migrations retain all literal/identity/history assertions;649of654 old files byte-identical; three fresh files/11cases. All316 metadata records/order/status/default/classification/evidence prefixes retained, no promotion. Sources under1000 physical lines.
    Skipped: full suite.
    Reason: user explicitly requires full suite once per10tasks, last237,next247.
    Risk: broader behavior outside related modules not re-executed this leaf; unchanged source/maps retain prior actual certified evidence.
    Approval: standing user goal and explicit test cadence.
    Residual gaps: full SwCellFrame hierarchy/invalidation/numeric-formatting/calculation/nested/merged/UNO/pooling/modified-state and whole core/browser parity remain partial; goal ACTIVE. Actual-SHA current-agent EVALUATOR remains explicitly non-independent.
  Rollback Plan: "Revert only this leaf's implementation commit after evidence identifies a regression; retain task traceability and prior immutable DONE leaves. No destructive history, registered I/O/recovery changes, network or outside-repository access."
  Findings: |-
    Previous242 DONE actual94ab0a92c04676614e7b869025c17943cfa687ae. Current243 preflight main/direct reused approved executable leaf under standing user authorization. Same current agent sequential roles; no network/global access/subagents. Parent706479characters/hash a6fec708ac0df532852be172468b2500ea7273b8654a2a60be08a1d65e37555b remains unchanged until final exact-prefix append.
    Native SwTableBoxFormat now owns exact native box-range item sets/default inheritance; SwTableBox registers as an original SwClient. Shared Claim/Check preserve complete unrelated direct items and exclude formula/value items as source does; concrete calculation engines remain absent. ChgFrameFormat publishes typed TableBoxFormatChanged before registration; history separately publishes MoveTableBoxHint before registration and destroys empty formats.
    SetSwTabBorders reuses owners by original format and native changed-side type; SetBoxAttr reuses per-operation shared native owners. SaveTable deduplicates full independent direct cell item sets and numeric indices, restoring shared owners without cell DTO reads/writes. Native insertion shares source formats; actual row/column/table section deletion releases clients. Main JSX reads original native cell items; no canonical geometry DTO or dead-format fallback.
    Observation: related runtime1299cases yielded1296pass3fail in two old acceptance files, all post-destructive-Undo dereferences of deleted box registrations. Resolution: scope/plan/Verify Steps refined within standing goal to add exactly two expected-before-deletion captures, increasing approved old files from3 to5 without production expansion. Failed-only closure3pass13skip. Every existing literal/identity/history assertion retained; no weaker expectations or live passing replay.
    Observation: strict cumulative coverage exposed native border old/type reuse plus unexecuted invalid InsertTable/DeleteTable admissions and native table frame query. Resolution: two new meaningful shared4x4border/admission cases passed2 with5 old cases skipped; all-four100% actual coverage, no altered counters. Source/maps/declaration/body/enclosing branch/all locations bound to242. Raw threshold exits1 retained honestly.
    Result:1301unique app passes,11fresh,25Chromium,zero passing replay.649old files byte-identical and5 exact native constructor or before-destruction captures;316metadata fields/order/default/status/classification/prefixes retained,no promotion. Six statics/build/source gates/governance passed; source7files byte-bound pin,IO4/wholewriter-view/stash preserved. No raw source/Python/scripts in AP.
    Local command recovery: a no-match optional user-instructions lookup, one mistaken native-line test filename and an incorrect workspace Prettier executable path were followed by route recomputation; existing root node_modules/.bin/prettier used. No installation/network or global access. Artifact persistence route checkpoints are lifecycle records, not goal blockers or implementation commits.
    Residual gaps: full physical SwCellFrame client hierarchy/retargeting/invalidation, native number formatting/calculation, width replacement/shared format arrays, nested/merged/UNO/pooling/default modified-state and whole project parity remain unverified. Goal remains ACTIVE. Full243 skipped per user last237,next247.
    Current-agent EVALUATOR must review actual implementation bytes and reconstruct four certificates byte-identically; evaluation explicitly non-independent. Do not mutate DONE leaves; meaningful close references actual implementation SHA.
id_source: "generated"
---
## Summary

Iteration243 gives existing native table cells document-owned native box frame formats and original client ownership; removes cell record round trips from core/UI publication and attribute history. Standing user goal authorizes safe local parity implementation.

## Scope

apps/office/src/sw/inc/swtblfmt.ts
apps/office/src/sw/inc/hints.ts
apps/office/src/sw/inc/hintids.ts
apps/office/src/sw/source/core/layout/atrfrm.ts
apps/office/src/sw/source/core/attr/swatrset.ts
apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/docnode/nodes.ts
apps/office/src/sw/source/core/docnode/ndtbl1.ts
apps/office/src/sw/source/core/undo/untbl.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/source/core/crsr/native-table-shell-owner.test.ts
apps/office/src/sw/source/core/table/native-column-insertion.test.ts
apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
apps/office/src/sw/source/core/table/native-box-frame-format.test.ts
apps/office/src/sw/source/core/undo/native-box-frame-format-history.test.ts
apps/office/src/sw/browser/editor/native-box-frame-format.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/browser/editor/native-numeric-row-insertion.test.tsx
apps/office/src/sw/source/core/table/native-independent-columns.test.ts

## Plan

Iteration243 replaces canonical per-cell geometry records with document-owned native SwTableBoxFormat/SwFrameFormat/SfxItemSet and original SwTableBox SwClient registration. Exact aTableBoxSetRange/default-frame inheritance, native pool vertical default and frame box/vertical queries support existing borders, size and vertical alignment without reconstructed DTOs. SwTableBox CheckBoxFormat/ClaimFrameFormat preserve native exclusive/shared ownership and exclude direct formula/value attributes on shared claims; concrete calculation/value engines remain unimplemented. ChgFrameFormat uses TableBoxFormatChanged before original box registration; history uses distinct MoveTableBoxHint, independent unique direct item sets/indices and new shared owners. Native insertion shares source box formats; destructive actual row/column/table node removal releases box clients, ordinary RemoveBox remains nondestructive. SetSwTabBorders and vertical attribute publication write native items directly, reuse old-to-new owners within the operation (border nType grouping), preserve peers, one revision/history, and mounted main JSX reads original native cell formats directly. Explicit existing SwTableBoxFormat records remain construction/transport boundary types only to preserve protected codecs; no new translation path or dead-owner fallback. Five old tests change only required constructor calls and expected-box-value captures before native destruction; all654 prior acceptance assertions/literals/loops intact, untouched files byte-identical. Three fresh files validate ownership/defaults/inheritance/claim/sharing/hints, native full item-set history and deletion, real mounted borders/alignment without GetFormat/SetFormat wrapper publication, preserving original boxes/text/cursor. All316 metadata records/order/status/default/classification/evidence prefixes preserved, bounded append-only notes/no promotion. Full physical SwCellFrame client hierarchy/retargeting, calculations/UNO/nested/merged/pooling/modified-state remain partial. New/related runtime/build once upstream absent/restored finally; failed/new-only closures, no passing replay; all-four100% actual source-bound cumulative counters from242. Last full237,next247,no full243. Standing user goal authorizes safe in-repo work; same-agent sequential roles/non-independent actual-SHA EVALUATOR, no network/global/subagents/AP source/Python/scripts/raw artifacts or DONE mutation. Initial related run1299:1296passed3failed exclusively because two additional prior tests query deleted native box registrations after destructive Undo. Scope adds those two acceptance files for expected-value captures before deletion only; no production expansion, weakened assertions, current passing-case replay or new approval boundary.

## Verify Steps

1. Byte-bind native SwTableBox ctor/dtor/CheckBoxFormat/Claim/Chg/GetTableBox in swtable.cxx2025-2181/2741; swtblfmt.hxx box format; init.cxx aTableBoxSetRange/default109; docfmt.cxx MakeTableBoxFormat; ndtbl1.cxx SetBoxAttr1276/native border nType922; hints.hxx native TableBoxFormatChanged/MoveTableBoxHint and untbl.cxx NewFrameFormatForBox1124/SaveBoxRestore1236 at pinned9bc445578031fecf56086729d8e4940c77e14d65. No copied source/scripts in AgentPlane.
2. Fresh literal native format registration/exact ranges/default parent/pool queries, independent complete direct items, exclusive/shared claims/peer retention/opaque formula-value exclusion, distinct borrowed native hints before registration and last-client disposal. Real attribute/insertion history preserves original model box/text/cursor and shared complete item sets without DTO GetFormat/SetFormat calls; numeric deletion releases actual old box clients and Redo creates new ones. Real main UI border/alignment/width rendering and command/Undo/Redo use native owners, leave transport calls unused, and retain original text/model graph. Full cell frame hierarchy/calculation/nested/merged/UNO remains partial.
3. Baseline654 prior acceptance files; exactly five scoped tests may change required native constructor calls and capture original expected box values before destructive Undo only, all prior literal/identity/history assertions preserved. All unaffected files byte-identical; no only/skip/todo.316metadata fields/order/status/default/classification/evidence prefixes preserved, no promotion, sources<1000physical lines.
4. Six static gates/build and new/related native border/vertical/cell geometry/table insertion/history/mounted/ODF/Chromium cases once physically upstream absent/restored finally. No passing runtime replay within leaf; failed/new-only closures retain partial raw threshold exits/skips. Full243 skipped per user cadence237 to247.
5. All-four100% cumulative actual app/inventory counters only for whole identical source/maps or complete unchanged declaration/body/enclosing branch/all locations from242; no clamping/sanitization/weakened criteria. Unchanged inventory/infra runtime not replayed.
6. Separate restored-vendor generator/source-tree/provenance/invariants/parity and doctor/routing/diff/artifact audits. IO4/whole writer-view/pin/stash preserved. Current-agent EVALUATOR explicitly non-independent binds actual implementation SHA, reconstructs four certificates byte-identically, clean meaningful close/DONE immutability; parent exact-prefix append706479/hash a6fec708ac0df532852be172468b2500ea7273b8654a2a60be08a1d65e37555b. Full goal remains ACTIVE.

## Verification

Command: npm run test:static; exact new/related runtime selections in evidence/targeted-profile.json,closure1.json,closure2.json.
Result: pass for1301 unique app scenarios (11 fresh) and25 Chromium scenarios; zero passing runtime replay/unhandled errors/flaky cases. Initial1296passes/3failures; failed-only closure3pass13skip. Two new previously unexecuted shared-border/admission cases passed with5 earlier passes skipped. Runtime/build physically upstream absent, restored finally. Raw partial coverage threshold exits1 retained as partial coverage rather than whole-suite passes.
Command: actual source/map-bound cumulative coverage reconstruction in evidence/final-coverage.json.
Result: all-four100% app17722lines/19453statements/4440functions/14358branches and inventory1464/1523/384/1081;313app/38inventory sources. Prior242 counters accepted only for entire identical source/maps or complete unchanged declaration/body/enclosing branch/all branch locations;11 production region transfers. No clamping/sanitization. Unchanged inventory/infra runtime not replayed.
Command: npm run format:check; lint; typecheck; check:dependencies; check:docs; check:file-size; UI generator --check; check:source-tree; check:source-provenance; inventory:invariants; inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass; source gates separately with upstream restored. Seven source files byte-bound to pin9bc445578031fecf56086729d8e4940c77e14d65; IO4/whole writer-view/stash retained. Doctor retains two historical warnings: managed hook readiness and old DONE2Z3962 missing implementation hash; no mutation of completed leaves.
Evidence: bounded English JSON identifiers/hashes/counts in active evidence. Raw output/maps/results/source snapshots/reconstruction scripts only in ignored app cache; zero forbidden upstream/application/Python/scripts in AgentPlane.
Scope: native shared cell formats/client ownership/exact ranges/default inheritance/complete direct items, formula/value sharing exclusion, change/history hint ordering, native border/vertical command sharing, full cell item-set attribute history, insertion/deletion lifetime, direct JSX item reads. Five exact prior constructor/expected-before-destruction migrations retain all literal/identity/history assertions;649of654 old files byte-identical; three fresh files/11cases. All316 metadata records/order/status/default/classification/evidence prefixes retained, no promotion. Sources under1000 physical lines.
Skipped: full suite.
Reason: user explicitly requires full suite once per10tasks, last237,next247.
Risk: broader behavior outside related modules not re-executed this leaf; unchanged source/maps retain prior actual certified evidence.
Approval: standing user goal and explicit test cadence.
Residual gaps: full SwCellFrame hierarchy/invalidation/numeric-formatting/calculation/nested/merged/UNO/pooling/modified-state and whole core/browser parity remain partial; goal ACTIVE. Actual-SHA current-agent EVALUATOR remains explicitly non-independent.

## Rollback Plan

Revert only this leaf's implementation commit after evidence identifies a regression; retain task traceability and prior immutable DONE leaves. No destructive history, registered I/O/recovery changes, network or outside-repository access.

## Findings

Previous242 DONE actual94ab0a92c04676614e7b869025c17943cfa687ae. Current243 preflight main/direct reused approved executable leaf under standing user authorization. Same current agent sequential roles; no network/global access/subagents. Parent706479characters/hash a6fec708ac0df532852be172468b2500ea7273b8654a2a60be08a1d65e37555b remains unchanged until final exact-prefix append.
Native SwTableBoxFormat now owns exact native box-range item sets/default inheritance; SwTableBox registers as an original SwClient. Shared Claim/Check preserve complete unrelated direct items and exclude formula/value items as source does; concrete calculation engines remain absent. ChgFrameFormat publishes typed TableBoxFormatChanged before registration; history separately publishes MoveTableBoxHint before registration and destroys empty formats.
SetSwTabBorders reuses owners by original format and native changed-side type; SetBoxAttr reuses per-operation shared native owners. SaveTable deduplicates full independent direct cell item sets and numeric indices, restoring shared owners without cell DTO reads/writes. Native insertion shares source formats; actual row/column/table section deletion releases clients. Main JSX reads original native cell items; no canonical geometry DTO or dead-format fallback.
Observation: related runtime1299cases yielded1296pass3fail in two old acceptance files, all post-destructive-Undo dereferences of deleted box registrations. Resolution: scope/plan/Verify Steps refined within standing goal to add exactly two expected-before-deletion captures, increasing approved old files from3 to5 without production expansion. Failed-only closure3pass13skip. Every existing literal/identity/history assertion retained; no weaker expectations or live passing replay.
Observation: strict cumulative coverage exposed native border old/type reuse plus unexecuted invalid InsertTable/DeleteTable admissions and native table frame query. Resolution: two new meaningful shared4x4border/admission cases passed2 with5 old cases skipped; all-four100% actual coverage, no altered counters. Source/maps/declaration/body/enclosing branch/all locations bound to242. Raw threshold exits1 retained honestly.
Result:1301unique app passes,11fresh,25Chromium,zero passing replay.649old files byte-identical and5 exact native constructor or before-destruction captures;316metadata fields/order/default/status/classification/prefixes retained,no promotion. Six statics/build/source gates/governance passed; source7files byte-bound pin,IO4/wholewriter-view/stash preserved. No raw source/Python/scripts in AP.
Local command recovery: a no-match optional user-instructions lookup, one mistaken native-line test filename and an incorrect workspace Prettier executable path were followed by route recomputation; existing root node_modules/.bin/prettier used. No installation/network or global access. Artifact persistence route checkpoints are lifecycle records, not goal blockers or implementation commits.
Residual gaps: full physical SwCellFrame client hierarchy/retargeting/invalidation, native number formatting/calculation, width replacement/shared format arrays, nested/merged/UNO/pooling/default modified-state and whole project parity remain unverified. Goal remains ACTIVE. Full243 skipped per user last237,next247.
Current-agent EVALUATOR must review actual implementation bytes and reconstruct four certificates byte-identically; evaluation explicitly non-independent. Do not mutate DONE leaves; meaningful close references actual implementation SHA.
