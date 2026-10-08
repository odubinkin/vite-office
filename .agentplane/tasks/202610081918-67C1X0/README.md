---
id: "202610081918-67C1X0"
title: "Register and release native row frame format clients through movement and history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T19:33:06.071Z"
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
    body: "Start: implement native row/frame client registration and typed owner movement, destruction after actual row/table deletion, and temporary UI/layout frame cleanup under standing user-approved parity scope."
events:
  -
    type: "status"
    at: "2026-10-08T19:19:30.609Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native row/frame client registration and typed owner movement, destruction after actual row/table deletion, and temporary UI/layout frame cleanup under standing user-approved parity scope."
doc_version: 3
doc_updated_at: "2026-10-08T19:38:50.663Z"
doc_updated_by: "CODER"
description: "Implement native row frame/line format registration and typed change/move hints, eliminate stale row registrations and temporary layout/UI frame leaks; preserve original graph and source-bound targeted verification."
sections:
  Summary: "Implement native row frame format client movement and represented flat-grid lifetime; preserve original document identity and direct native UI behavior."
  Scope: |-
    apps/office/src/sw/inc/hints.ts
    apps/office/src/sw/source/core/layout/tabfrm.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/undo/untbl.ts
    apps/office/src/sw/source/core/docnode/nodes.ts
    apps/office/src/sw/source/core/layout/newfrm.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/source/core/layout/native-row-format-client.test.ts
    apps/office/src/sw/source/core/undo/native-row-format-client-history.test.ts
    apps/office/src/sw/browser/editor/native-row-format-client.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
    apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
  Plan: "Iteration242 implements represented native row format client lifetime: SwRowFrame extends SwClient and registers at the original row frame format; GetFormat/RegisterToFormat/DestroyImpl and direct native frame item queries replace stateless row value reads. Native TableLineFormatChanged and MoveTableLineHint own exact original format/line references. ClaimFrameFormat directly retargets only original row frames matching its line before registering the row; ChgFrameFormat broadcasts the native change hint before moving the line. SaveTable restoration publishes MoveTableLineHint and re-registers rows, with native last-client format disposal. Row and frame cleanup disposes a format only after its final represented client is gone. Actual destructive native row/table node removal ends row registration; ordinary RemoveLine remains a nondestructive array detach because existing native callers retain/reinsert their original owner. Native row measurements and JSX construction explicitly destroy each temporary registered frame in finally; no registry/cache/extra scalar adapter. All649 unaffected old acceptance files remain byte-identical; two old insertion-history cases capture native construction-boundary expected values before destructive Undo instead of dereferencing deleted row owners after Redo. Their expected literals, original/new identity and history assertions remain unchanged; no dead-owner fallback/cache is introduced. add literal registration/typed hints/matching peer/claim/history/deletion/exclusive post-Undo tests and mounted repeated render/measurement/no leaked frames/current row fields tests. Existing316 metadata fields/status/default/evidence prefixes preserved, no new module or promotion. Full frame hierarchy/invalidation/repeated/follow/pooling/UNO/nested/merged/modified-state contracts remain partial. Targeted new/related runtime/build once upstream absent/restored, failed/new-only closures, actual source-bound cumulative all-four100% from241. Last full237,next247; no full242. Standing user goal authorizes safe in-repo implementation; same-agent sequential roles, explicitly non-independent actual-SHA EVALUATOR. No network/global/subagents, AP source/scripts/Python/raw artifacts or DONE mutation."
  Verify Steps: |-
    1. Byte-bind native sw/inc/hints.hxx MoveTableLineHint/TableLineFormatChanged, swtable.cxx1455-1519 row ctor/dtor/Claim/Chg, tabfrm.cxx4639-4770 ctor/DestroyImpl/SwClientNotify, untbl.cxx104/1107-1168 native KillEmpty/NewFrameFormatForLine, actual row deletion source and native frame registration at pin9bc445578031fecf56086729d8e4940c77e14d65; no copied sources/scripts/raw data in AgentPlane.
    2. Fresh literal cases prove original SwRowFrame registration/direct format items, matching line-only claim/frame migration, distinct native change/move hints before row re-registration, peer frames untouched, last-client format disposal/idempotent destruction, repeated attribute Undo/Redo re-registration/complete attributes/original rows-boxes-text-cursor, numeric row deletion/redo registration and exclusive source claim after Undo, complete table deletion cleanup. Mounted actual UI repeat render and layout measurements retain no temporary frame clients and native row updates/history still render literal heights/borders. Model graph and row references remain original.
    3. Baseline649 unaffected old acceptance files entire byte-identical; exactly two old insertion-history cases capture expected row construction values before destructive Undo, preserving all literal attribute/identity/history assertions, no only/skip/todo. Preserve all316 metadata fields/order/status/default/classification/evidence prefixes, no broad parity promotion. Source<1000physical lines.
    4. Six static gates/build plus new and related row/formats/items/history/insert/delete/callback/layout/ODF/mounted/Chromium tests once upstream absent/restored finally. No passing replay within leaf; failed/new-only closures preserve raw threshold exits/skips. No full242, user cadence237 to247.
    5. All-four100% cumulative actual app/inventory counters only by entire identical current source/maps or complete unchanged declaration/body/enclosing branch/all locations from241; no sanitization/clamping/weakening. Unchanged inventory/infra not replayed.
    6. Separate restored-vendor generator/source-tree/provenance/invariants/parity and doctor/routing/diff/artifact audits. ProtectedIO4/entire writer-view/pin/stash preserved. Current-agent EVALUATOR explicitly non-independent binds actual implementation SHA and four reconstructed certificates; meaningful clean tracked close/DONE immutability and parent exact-prefix append702566/hash9356459286ee4c72f5bfe127f7437675f32438e1643e6cf110c322ee455bd8d5. Full goal ACTIVE, full native layout/client hierarchy/pooling/UNO parity remains unverified.
  Verification: |-
    Command: npm run test:static and exact new/related application and Chromium selections recorded in evidence/targeted-profile.json,closure1.json,closure2.json.
    Result: pass for represented runtime behavior:1293 unique application scenarios (11 fresh) and11 Chromium scenarios, zero passing replay/unhandled errors/flaky cases. Initial1274 passes/four failures; the four failed cases passed with19 other cases skipped. A new render-exception cleanup case and previously unexecuted related alignment/headline modules passed15 cases with two already passing cases skipped. Runtime/build executed physically upstream-absent, restored in finally. Partial threshold exits1 are retained as partial coverage, not whole-suite passes.
    Command: actual-counter source-bound reconstruction in evidence/final-coverage.json.
    Result: pass. Application100%17592lines/19320statements/4422functions/14333branches, inventory100%1464/1523/384/1081;313app/38inventory sources. Prior241 counters accepted only for exact entire source/maps or complete unchanged declaration/body/enclosing branch/all locations. No clamping or sanitizing. Unchanged inventory/infra runtime not replayed.
    Command: npm run format:check; lint; typecheck; check:dependencies; check:docs; check:file-size; generator --check; check:source-tree; check:source-provenance; inventory:invariants; inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass. Source gates separately with upstream restored. Six upstream files byte-bound to pin9bc445578031fecf56086729d8e4940c77e14d65; protected IO4, entire writer-view and stash retained. Two existing historical doctor warnings remain unchanged.
    Evidence: bounded JSON certificates targeted-profile,closure1,closure2,runtime-census,final-coverage,static-final,source-gates,scope-integrity,native-source-review,governance,artifact-census. Raw maps/results/source snapshots/scripts only in ignored application cache.
    Scope: original native row frame registration/direct format access, matching-row claim migration, distinct native change/history hints before row registration, last-client format disposal, destructive flat row/table cleanup, temporary measurement/JSX success and exception cleanup.649of651 prior acceptance files byte-identical; two exact expected-value captures before destructive Undo preserve all literal/identity/history assertions. Three fresh files/11 cases, all316 metadata fields/order/status/default/classification/evidence prefixes preserved, append-only bounded notes and no promotion.
    Skipped: full suite.
    Reason: user cadence last237,next247; current leaf242 requires new/related tests and100% coverage.
    Risk: complete native frame hierarchy/invalidation/follows/pooling/nested/merged/UNO and whole core/browser parity remain incomplete.
    Approval: active user goal and testing instructions.
  Rollback Plan: "Revert only the intentional semantic implementation commit if needed, preserving task traceability, all prior DONE tasks, parent prefix, pin/stash and registered IO/recovery/settings deviations."
  Findings: |-
    Previous241 is DONE with actual implementation03809acf8c537da7db76c492b3882fbfd606c5cc. Current242 preflight main/direct, existing approved leaf continued under standing user goal, same-agent CODER/EVALUATOR roles and no delegation. Parent702566chars/hash9356459286ee4c72f5bfe127f7437675f32438e1643e6cf110c322ee455bd8d5 remains an exact unchanged prefix before final append.

    SwRowFrame now registers as the actual native SwClient of its line format and reads native frame items through its registration. ClaimFrameFormat directly retargets matching physical clients before row registration; ChgFrameFormat uses TableLineFormatChanged; SaveTable uses MoveTableLineHint and native KillEmptyFrameFormat. Destructive flat row/table removal releases frame clients before the row. Temporary real JSX/measurement frames always release in finally, including an observed projection exception; no registry or dead-owner cache.

    Observation: initial tests found two old history cases dereferencing deleted SwTableLine owners after numeric Undo/Redo and two invalid new graph fixtures (table without following body text; measurement without a body text frame). Impact: four cases failed, including legacy comparisons incompatible with native destruction. Resolution: refined approved scope/Verify Steps to exactly two expected-value captures before destructive Undo, preserving all literal attribute/identity/history assertions; fixed new fixtures to connected native body graph. No production dead-owner fallback or retained DTO/cache. Failed-only four-case closure passed,19 passing cases skipped.
    Observation: cumulative source-bound coverage initially lacked one JSX throw statement and five conditional branches because the complete JSX return gained try/finally. Resolution: add a meaningful actual-component exception cleanup case, run previously unexecuted related alignment/headline modules, and prove complete100% coverage. No passing runtime replay or altered counters; initial/focused raw partial threshold exits remain recorded.15new/unexecuted cases passed, two passing cases skipped.
    Result:1293 unique application passes,11fresh,11Chromium, zero passing replay; all-four100 app/inventory actual source-bound coverage, no full242.649old files entire byte-identical, two exact before-destruction captures only;316records/status/default/classification/order/evidence prefixes preserved. Registered I/O/recovery/settings, writer-view, pin and stash unchanged.
    Residual gaps: complete native frame tree/invalidation/follows/repeated frame lifetime/pooling/nested/merged/UNO and whole core/browser parity remain unverified. Flat DelFrames representation is not complete native hierarchy parity. Full goal must remain ACTIVE; next full suite247.
    Current-agent EVALUATOR review must be explicitly non-independent, bind actual implementation SHA and reconstruct four certificates byte-identically. No source/Python/scripts/raw maps/results in AgentPlane, external access or DONE-leaf mutation. Clean meaningful close and exact-prefix parent append remain lifecycle steps.
id_source: "generated"
---
## Summary

Implement native row frame format client movement and represented flat-grid lifetime; preserve original document identity and direct native UI behavior.

## Scope

apps/office/src/sw/inc/hints.ts
apps/office/src/sw/source/core/layout/tabfrm.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/undo/untbl.ts
apps/office/src/sw/source/core/docnode/nodes.ts
apps/office/src/sw/source/core/layout/newfrm.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/source/core/layout/native-row-format-client.test.ts
apps/office/src/sw/source/core/undo/native-row-format-client-history.test.ts
apps/office/src/sw/browser/editor/native-row-format-client.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/browser/editor/native-table-document-row.test.tsx
apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts

## Plan

Iteration242 implements represented native row format client lifetime: SwRowFrame extends SwClient and registers at the original row frame format; GetFormat/RegisterToFormat/DestroyImpl and direct native frame item queries replace stateless row value reads. Native TableLineFormatChanged and MoveTableLineHint own exact original format/line references. ClaimFrameFormat directly retargets only original row frames matching its line before registering the row; ChgFrameFormat broadcasts the native change hint before moving the line. SaveTable restoration publishes MoveTableLineHint and re-registers rows, with native last-client format disposal. Row and frame cleanup disposes a format only after its final represented client is gone. Actual destructive native row/table node removal ends row registration; ordinary RemoveLine remains a nondestructive array detach because existing native callers retain/reinsert their original owner. Native row measurements and JSX construction explicitly destroy each temporary registered frame in finally; no registry/cache/extra scalar adapter. All649 unaffected old acceptance files remain byte-identical; two old insertion-history cases capture native construction-boundary expected values before destructive Undo instead of dereferencing deleted row owners after Redo. Their expected literals, original/new identity and history assertions remain unchanged; no dead-owner fallback/cache is introduced. add literal registration/typed hints/matching peer/claim/history/deletion/exclusive post-Undo tests and mounted repeated render/measurement/no leaked frames/current row fields tests. Existing316 metadata fields/status/default/evidence prefixes preserved, no new module or promotion. Full frame hierarchy/invalidation/repeated/follow/pooling/UNO/nested/merged/modified-state contracts remain partial. Targeted new/related runtime/build once upstream absent/restored, failed/new-only closures, actual source-bound cumulative all-four100% from241. Last full237,next247; no full242. Standing user goal authorizes safe in-repo implementation; same-agent sequential roles, explicitly non-independent actual-SHA EVALUATOR. No network/global/subagents, AP source/scripts/Python/raw artifacts or DONE mutation.

## Verify Steps

1. Byte-bind native sw/inc/hints.hxx MoveTableLineHint/TableLineFormatChanged, swtable.cxx1455-1519 row ctor/dtor/Claim/Chg, tabfrm.cxx4639-4770 ctor/DestroyImpl/SwClientNotify, untbl.cxx104/1107-1168 native KillEmpty/NewFrameFormatForLine, actual row deletion source and native frame registration at pin9bc445578031fecf56086729d8e4940c77e14d65; no copied sources/scripts/raw data in AgentPlane.
2. Fresh literal cases prove original SwRowFrame registration/direct format items, matching line-only claim/frame migration, distinct native change/move hints before row re-registration, peer frames untouched, last-client format disposal/idempotent destruction, repeated attribute Undo/Redo re-registration/complete attributes/original rows-boxes-text-cursor, numeric row deletion/redo registration and exclusive source claim after Undo, complete table deletion cleanup. Mounted actual UI repeat render and layout measurements retain no temporary frame clients and native row updates/history still render literal heights/borders. Model graph and row references remain original.
3. Baseline649 unaffected old acceptance files entire byte-identical; exactly two old insertion-history cases capture expected row construction values before destructive Undo, preserving all literal attribute/identity/history assertions, no only/skip/todo. Preserve all316 metadata fields/order/status/default/classification/evidence prefixes, no broad parity promotion. Source<1000physical lines.
4. Six static gates/build plus new and related row/formats/items/history/insert/delete/callback/layout/ODF/mounted/Chromium tests once upstream absent/restored finally. No passing replay within leaf; failed/new-only closures preserve raw threshold exits/skips. No full242, user cadence237 to247.
5. All-four100% cumulative actual app/inventory counters only by entire identical current source/maps or complete unchanged declaration/body/enclosing branch/all locations from241; no sanitization/clamping/weakening. Unchanged inventory/infra not replayed.
6. Separate restored-vendor generator/source-tree/provenance/invariants/parity and doctor/routing/diff/artifact audits. ProtectedIO4/entire writer-view/pin/stash preserved. Current-agent EVALUATOR explicitly non-independent binds actual implementation SHA and four reconstructed certificates; meaningful clean tracked close/DONE immutability and parent exact-prefix append702566/hash9356459286ee4c72f5bfe127f7437675f32438e1643e6cf110c322ee455bd8d5. Full goal ACTIVE, full native layout/client hierarchy/pooling/UNO parity remains unverified.

## Verification

Command: npm run test:static and exact new/related application and Chromium selections recorded in evidence/targeted-profile.json,closure1.json,closure2.json.
Result: pass for represented runtime behavior:1293 unique application scenarios (11 fresh) and11 Chromium scenarios, zero passing replay/unhandled errors/flaky cases. Initial1274 passes/four failures; the four failed cases passed with19 other cases skipped. A new render-exception cleanup case and previously unexecuted related alignment/headline modules passed15 cases with two already passing cases skipped. Runtime/build executed physically upstream-absent, restored in finally. Partial threshold exits1 are retained as partial coverage, not whole-suite passes.
Command: actual-counter source-bound reconstruction in evidence/final-coverage.json.
Result: pass. Application100%17592lines/19320statements/4422functions/14333branches, inventory100%1464/1523/384/1081;313app/38inventory sources. Prior241 counters accepted only for exact entire source/maps or complete unchanged declaration/body/enclosing branch/all locations. No clamping or sanitizing. Unchanged inventory/infra runtime not replayed.
Command: npm run format:check; lint; typecheck; check:dependencies; check:docs; check:file-size; generator --check; check:source-tree; check:source-provenance; inventory:invariants; inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass. Source gates separately with upstream restored. Six upstream files byte-bound to pin9bc445578031fecf56086729d8e4940c77e14d65; protected IO4, entire writer-view and stash retained. Two existing historical doctor warnings remain unchanged.
Evidence: bounded JSON certificates targeted-profile,closure1,closure2,runtime-census,final-coverage,static-final,source-gates,scope-integrity,native-source-review,governance,artifact-census. Raw maps/results/source snapshots/scripts only in ignored application cache.
Scope: original native row frame registration/direct format access, matching-row claim migration, distinct native change/history hints before row registration, last-client format disposal, destructive flat row/table cleanup, temporary measurement/JSX success and exception cleanup.649of651 prior acceptance files byte-identical; two exact expected-value captures before destructive Undo preserve all literal/identity/history assertions. Three fresh files/11 cases, all316 metadata fields/order/status/default/classification/evidence prefixes preserved, append-only bounded notes and no promotion.
Skipped: full suite.
Reason: user cadence last237,next247; current leaf242 requires new/related tests and100% coverage.
Risk: complete native frame hierarchy/invalidation/follows/pooling/nested/merged/UNO and whole core/browser parity remain incomplete.
Approval: active user goal and testing instructions.

## Rollback Plan

Revert only the intentional semantic implementation commit if needed, preserving task traceability, all prior DONE tasks, parent prefix, pin/stash and registered IO/recovery/settings deviations.

## Findings

Previous241 is DONE with actual implementation03809acf8c537da7db76c492b3882fbfd606c5cc. Current242 preflight main/direct, existing approved leaf continued under standing user goal, same-agent CODER/EVALUATOR roles and no delegation. Parent702566chars/hash9356459286ee4c72f5bfe127f7437675f32438e1643e6cf110c322ee455bd8d5 remains an exact unchanged prefix before final append.

SwRowFrame now registers as the actual native SwClient of its line format and reads native frame items through its registration. ClaimFrameFormat directly retargets matching physical clients before row registration; ChgFrameFormat uses TableLineFormatChanged; SaveTable uses MoveTableLineHint and native KillEmptyFrameFormat. Destructive flat row/table removal releases frame clients before the row. Temporary real JSX/measurement frames always release in finally, including an observed projection exception; no registry or dead-owner cache.

Observation: initial tests found two old history cases dereferencing deleted SwTableLine owners after numeric Undo/Redo and two invalid new graph fixtures (table without following body text; measurement without a body text frame). Impact: four cases failed, including legacy comparisons incompatible with native destruction. Resolution: refined approved scope/Verify Steps to exactly two expected-value captures before destructive Undo, preserving all literal attribute/identity/history assertions; fixed new fixtures to connected native body graph. No production dead-owner fallback or retained DTO/cache. Failed-only four-case closure passed,19 passing cases skipped.
Observation: cumulative source-bound coverage initially lacked one JSX throw statement and five conditional branches because the complete JSX return gained try/finally. Resolution: add a meaningful actual-component exception cleanup case, run previously unexecuted related alignment/headline modules, and prove complete100% coverage. No passing runtime replay or altered counters; initial/focused raw partial threshold exits remain recorded.15new/unexecuted cases passed, two passing cases skipped.
Result:1293 unique application passes,11fresh,11Chromium, zero passing replay; all-four100 app/inventory actual source-bound coverage, no full242.649old files entire byte-identical, two exact before-destruction captures only;316records/status/default/classification/order/evidence prefixes preserved. Registered I/O/recovery/settings, writer-view, pin and stash unchanged.
Residual gaps: complete native frame tree/invalidation/follows/repeated frame lifetime/pooling/nested/merged/UNO and whole core/browser parity remain unverified. Flat DelFrames representation is not complete native hierarchy parity. Full goal must remain ACTIVE; next full suite247.
Current-agent EVALUATOR review must be explicitly non-independent, bind actual implementation SHA and reconstruct four certificates byte-identically. No source/Python/scripts/raw maps/results in AgentPlane, external access or DONE-leaf mutation. Clean meaningful close and exact-prefix parent append remain lifecycle steps.
