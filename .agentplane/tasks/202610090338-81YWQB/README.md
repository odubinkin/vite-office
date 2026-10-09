---
id: "202610090338-81YWQB"
title: "Connect Writer UI to native format notifiers and remove generic attribute device bridge"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T03:40:05.166Z"
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
    body: "Start: approved native notifier/UI subscription scope under the user's continuing parity goal. Preserve IO/recovery exceptions and old acceptance; remove only generic format attribute-device bridge, verify original native ownership/order/lifetime/main UI without upstream runtime."
events:
  -
    type: "status"
    at: "2026-10-09T03:40:05.587Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved native notifier/UI subscription scope under the user's continuing parity goal. Preserve IO/recovery exceptions and old acceptance; remove only generic format attribute-device bridge, verify original native ownership/order/lifetime/main UI without upstream runtime."
doc_version: 3
doc_updated_at: "2026-10-09T04:04:08.323Z"
doc_updated_by: "CODER"
description: "Iteration246: port native Svt broadcaster/listener and BroadcastingModify notifier channel, subscribe original row/cell/style formats at WriterViewStore without keeping writer formats alive, and remove generic SwFormat attribute device signal. Preserve registered IO/recovery/settings deviations; exact native hints/lifetimes, structural rebind, history and main UI verified without upstream runtime. Full cadence237→247."
sections:
  Summary: "Connect the existing Writer UI directly to original native format notifiers and remove the generic attribute-device bridge."
  Scope: |-
    apps/office/src/svl/source/notify/broadcast.ts
    apps/office/src/svl/source/notify/listener.ts
    apps/office/src/sw/inc/calbck.ts
    apps/office/src/sw/source/core/attr/format.ts
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/browser/presentation/writer-native-format-observer.ts
    apps/office/src/sw/source/core/layout/tabfrm.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/undo/untbl.ts
    apps/office/src/sw/source/core/attr/native-format-attribute-notify.test.ts
    apps/office/src/svl/source/notify/native-svt-notifier.test.ts
    apps/office/src/sw/browser/presentation/native-format-notifier-store.test.ts
    apps/office/src/sw/browser/editor/native-format-notifier.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration246 ports the native SvtBroadcaster/SvtListener channel with reciprocal M:N ownership, normalization/tombstones, complete snapshot broadcast membership, copy/CopyAllBroadcasters, PrepareForDestruction and explicit JS destructor equivalents; native pointer ordering uses stable browser object allocation identities, actual memory addresses/bit tagging/performance remain unverified. BroadcasterMixin owns an independent notifier; BroadcastingModify forwards accepted hints after writer clients including existing bounded transaction flushes, and destroys its notifier. SwFormat derives from BroadcastingModify, removes NotifyAttributeSet and all generic attribute device signals; exact native hints remain unchanged. Native HasWriterListeners query and actual row/cell/history final-writer lifetime call sites retain native ownership. WriterViewStore owns a browser SvtListener subscribing directly to actual document row/cell/style GetNotifier sources. Rebind original notifier identities on structural/history/replacement/bindings changes; invalidate existing native root layout and Sfx bindings without document writes, text/item DTO copies, frame clones or writer registrations. Close detaches all original notifiers. Only one existing245 core case's obsolete generic-device assertions migrate to exact native notifier/lock/order/no-document-signal assertions, preserving all original attribute/identity/equality assertions;662other prior acceptance files byte-identical. Three fresh files cover native broadcaster/listener contracts, actual original shared formats/lifetime/claims/history/cleanup/rebinding, and mounted main UI direct row/cell/style updates without generic device signal. Preserve318existing metadata fields/status/default/classification/order/evidence prefixes; append2new unverified upstream notifier modules and1unverified browser observer module,321total. Fifteen scoped paths, normal sources<1000physical lines. Source pin9bc445578031fecf56086729d8e4940c77e14d65; IO4/whole writer-view/stash/parent exact-prefix717133/hash c6c4cc81526cf58740203fd8131532e46f03ae6f45ef10991cecac95a735bf3a preserved. New/related runtime/build upstream physically absent/restored finally once; failed/new/unexecuted-only closures, materially affected passing revalidation only explicitly justified. Actual all-four100 app/inventory coverage from245 whole identical source/maps or complete unchanged native declaration/signature/body/enclosing branch/all locations; no counter/threshold/skip sanitization. Full246 skipped explicit user cadence last237,next247. Same current agent sequential roles, explicitly non-independent actual-SHA EVALUATOR4byte-identical certificates, clean meaningful close and immutable DONE leaf; parent append, whole goal incomplete. No network/global/subagents/AP upstream/application/Python/raw snapshots/maps/results/scripts."
  Verify Steps: |-
    1. Byte-bind SvtBroadcaster/SvtListener in include/svl/broadcast.hxx/listener.hxx and svl/source/notify/broadcast.cxx/listener.cxx, BroadcasterMixin/BroadcastingModify/HasWriterListeners in sw/inc/calbck.hxx and core/attr/calbck.cxx, SwFormat inheritance/mutators in format.hxx/cxx, native row/cell final-writer destruction in tabfrm.cxx and box/row/SaveTable lifetime contracts in swtable.cxx/untbl.cxx. Source pin9bc445578031fecf56086729d8e4940c77e14d65, no copied source in AP.
    2. Fresh native notifier tests assert exact original hint/client/notifier identities, reciprocal M:N lifetime and sorted stable browser allocation identity order, snapshot membership during add/remove, tombstones/empty query/ListenersGone, copy/CopyAllBroadcasters including self, prepare vs destructor/Dying/unregister and removal during destruction. Native writer callback precedes notifier under original modify lock; transaction boundaries retain one exact original batch; UI notifier registrations do not enter HasWriterListeners or prevent last-writer format disposal. SwFormat has no generic NotifyAttributeSet override/bridge.
    3. Fresh actual store and main mounted UI tests forbid generic document device hints and assert immediate original row/cell/style default/direct/inherited/reset render/state changes, full shared claims/Undo/Redo/current-cell and sibling identities/text/cursor, original deletion/replacement/dying/rebinding, root/layout and Sfx bindings invalidation, callback unsubscription/store close/no retired-format updates. Exactly1old245 device case migrated only to stronger native notifier assertions;662other prior files byte-identical,663prior total. Fresh files no only/skip/todo.318old metadata preserved with3new unverified records; exact15semantic paths and physical<1000lines.
    4. Six statics, local build/static, exact new and related notify/format/style/table/list/history/render/ODF/Chromium runtime physically upstream absent/restored finally. No unchanged passing replay. Failed/new/unexecuted-only closures; materially changed production semantics may require explicitly recorded affected-case revalidation. Raw partial coverage threshold exits/skips retained. Full246 skipped user cadence last237,next247.
    5. Actual all-four100 app/inventory coverage reconstruction from245 whole exact source/maps or complete unchanged native declaration/signature/body/enclosing branch/all locations. V8 generated display ordinals may normalize only with complete original source/location proof; no individual counts/threshold weakening. Unchanged inventory/infra runtime not replayed.
    6. Restored generator/source-tree/provenance/inventory invariants/parity; doctor/routing/diff/artifact audits. Source/pin/IO4/whole writer-view/stash/parent717133/hash c6c4cc81526cf58740203fd8131532e46f03ae6f45ef10991cecac95a735bf3a retained. AP bounded English MD/JSON identifiers/hashes/counts only, raw ignored app cache. Actual implementation-SHA explicitly non-independent EVALUATOR reconstructs4certificates byte-identically. Clean meaningful close; DONE immutable; parent exact-prefix append, goal remains incomplete.
  Verification: "Pending implementation and exact new/related verification; full246 skipped by explicit user cadence237→247."
  Rollback Plan: "Revert only the scoped semantic implementation commit if required; preserve task history, previous DONE leaves and registered IO/recovery/settings deviations."
  Findings: |-
    Source inspection confirms separate native BroadcastingModify/GetNotifier/SvtListener channel and SwFormat inheritance. Svt listeners do not retain writer-client ownership. Existing SwModify transaction representation is a browser adaptation; exact native delivery ordering is preserved at terminal dispatch. Guessed read-only brdcst/rootfrm and TS writer-module paths failed; rg discovery resolved actual SfxBroadcaster/newfrm/TSX paths and route recomputed before mutation.

    Iteration246 implementation and targeted verification complete. Svt observers are separate from native Writer clients; SwFormat uses BroadcastingModify and no generic NotifyAttributeSet bridge remains. Direct row/cell/style native writes refresh original layout/Sfx/browser caches without document signals or revision changes. Native original shared claims/document history/replacement/deletion/close verified. Raw direct silent ClaimFrameFormat without final document invalidation and full native physical frame integration remain unverified, as upstream emits no Svt change on that silent claim. Browser Sync assumes current live native model owners instead of an unsupported disposed-format fallback.

    Observation: read-only guessed upstream path and two script syntax errors occurred before semantic mutations; route revalidated. Initial lint/JSDoc errors repaired within scope. Initial runtime1590passed4freshfailed:two fixtures lacked the native following paragraph needed for table deletion,one retained a detached DOM element after a fixed-height subtree remount,one independent observer expected Sync before calling it. All four corrected without changing old accepted values. Closure1 runs exactly4failed plus2new native Svt lower-bound/shallow-copy release-guard cases;6passed12skipped,no unchanged passing replay. Initial and closure threshold exit1 retained; final actual certificate all-four100. Source parity metadata initially used an invalid new browser divergence enum; corrected only the new record to native inventory B. Recoverable validation errors resolved; no genuine external blocker.

    Evidence:1596unique app cases,18fresh,13Chromium. App318files18105lines19876statements4554functions14568branches;inventory38files1464/1523/384/1081;all-four100. Six statics, final upstream-absent build/static and restored source/provenance/invariants/parity pass. Source pin11files verified against commit9bc445578031fecf56086729d8e4940c77e14d65;IO4/whole writer-view/stash retained.662other old acceptance files byte-identical;1exact original-native notifier contract migration,3newfiles666total.318old metadata fields/order/status/default/classification/evidenceprefixes preserved,3newunverified321total. No source/Python/scripts/raw maps/results in AP; raw cache ignored. Full suite intentionally skipped user cadence:last237,next247. Broad goal remains active/incomplete.
id_source: "generated"
---
## Summary

Connect the existing Writer UI directly to original native format notifiers and remove the generic attribute-device bridge.

## Scope

apps/office/src/svl/source/notify/broadcast.ts
apps/office/src/svl/source/notify/listener.ts
apps/office/src/sw/inc/calbck.ts
apps/office/src/sw/source/core/attr/format.ts
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/browser/presentation/writer-native-format-observer.ts
apps/office/src/sw/source/core/layout/tabfrm.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/undo/untbl.ts
apps/office/src/sw/source/core/attr/native-format-attribute-notify.test.ts
apps/office/src/svl/source/notify/native-svt-notifier.test.ts
apps/office/src/sw/browser/presentation/native-format-notifier-store.test.ts
apps/office/src/sw/browser/editor/native-format-notifier.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration246 ports the native SvtBroadcaster/SvtListener channel with reciprocal M:N ownership, normalization/tombstones, complete snapshot broadcast membership, copy/CopyAllBroadcasters, PrepareForDestruction and explicit JS destructor equivalents; native pointer ordering uses stable browser object allocation identities, actual memory addresses/bit tagging/performance remain unverified. BroadcasterMixin owns an independent notifier; BroadcastingModify forwards accepted hints after writer clients including existing bounded transaction flushes, and destroys its notifier. SwFormat derives from BroadcastingModify, removes NotifyAttributeSet and all generic attribute device signals; exact native hints remain unchanged. Native HasWriterListeners query and actual row/cell/history final-writer lifetime call sites retain native ownership. WriterViewStore owns a browser SvtListener subscribing directly to actual document row/cell/style GetNotifier sources. Rebind original notifier identities on structural/history/replacement/bindings changes; invalidate existing native root layout and Sfx bindings without document writes, text/item DTO copies, frame clones or writer registrations. Close detaches all original notifiers. Only one existing245 core case's obsolete generic-device assertions migrate to exact native notifier/lock/order/no-document-signal assertions, preserving all original attribute/identity/equality assertions;662other prior acceptance files byte-identical. Three fresh files cover native broadcaster/listener contracts, actual original shared formats/lifetime/claims/history/cleanup/rebinding, and mounted main UI direct row/cell/style updates without generic device signal. Preserve318existing metadata fields/status/default/classification/order/evidence prefixes; append2new unverified upstream notifier modules and1unverified browser observer module,321total. Fifteen scoped paths, normal sources<1000physical lines. Source pin9bc445578031fecf56086729d8e4940c77e14d65; IO4/whole writer-view/stash/parent exact-prefix717133/hash c6c4cc81526cf58740203fd8131532e46f03ae6f45ef10991cecac95a735bf3a preserved. New/related runtime/build upstream physically absent/restored finally once; failed/new/unexecuted-only closures, materially affected passing revalidation only explicitly justified. Actual all-four100 app/inventory coverage from245 whole identical source/maps or complete unchanged native declaration/signature/body/enclosing branch/all locations; no counter/threshold/skip sanitization. Full246 skipped explicit user cadence last237,next247. Same current agent sequential roles, explicitly non-independent actual-SHA EVALUATOR4byte-identical certificates, clean meaningful close and immutable DONE leaf; parent append, whole goal incomplete. No network/global/subagents/AP upstream/application/Python/raw snapshots/maps/results/scripts.

## Verify Steps

1. Byte-bind SvtBroadcaster/SvtListener in include/svl/broadcast.hxx/listener.hxx and svl/source/notify/broadcast.cxx/listener.cxx, BroadcasterMixin/BroadcastingModify/HasWriterListeners in sw/inc/calbck.hxx and core/attr/calbck.cxx, SwFormat inheritance/mutators in format.hxx/cxx, native row/cell final-writer destruction in tabfrm.cxx and box/row/SaveTable lifetime contracts in swtable.cxx/untbl.cxx. Source pin9bc445578031fecf56086729d8e4940c77e14d65, no copied source in AP.
2. Fresh native notifier tests assert exact original hint/client/notifier identities, reciprocal M:N lifetime and sorted stable browser allocation identity order, snapshot membership during add/remove, tombstones/empty query/ListenersGone, copy/CopyAllBroadcasters including self, prepare vs destructor/Dying/unregister and removal during destruction. Native writer callback precedes notifier under original modify lock; transaction boundaries retain one exact original batch; UI notifier registrations do not enter HasWriterListeners or prevent last-writer format disposal. SwFormat has no generic NotifyAttributeSet override/bridge.
3. Fresh actual store and main mounted UI tests forbid generic document device hints and assert immediate original row/cell/style default/direct/inherited/reset render/state changes, full shared claims/Undo/Redo/current-cell and sibling identities/text/cursor, original deletion/replacement/dying/rebinding, root/layout and Sfx bindings invalidation, callback unsubscription/store close/no retired-format updates. Exactly1old245 device case migrated only to stronger native notifier assertions;662other prior files byte-identical,663prior total. Fresh files no only/skip/todo.318old metadata preserved with3new unverified records; exact15semantic paths and physical<1000lines.
4. Six statics, local build/static, exact new and related notify/format/style/table/list/history/render/ODF/Chromium runtime physically upstream absent/restored finally. No unchanged passing replay. Failed/new/unexecuted-only closures; materially changed production semantics may require explicitly recorded affected-case revalidation. Raw partial coverage threshold exits/skips retained. Full246 skipped user cadence last237,next247.
5. Actual all-four100 app/inventory coverage reconstruction from245 whole exact source/maps or complete unchanged native declaration/signature/body/enclosing branch/all locations. V8 generated display ordinals may normalize only with complete original source/location proof; no individual counts/threshold weakening. Unchanged inventory/infra runtime not replayed.
6. Restored generator/source-tree/provenance/inventory invariants/parity; doctor/routing/diff/artifact audits. Source/pin/IO4/whole writer-view/stash/parent717133/hash c6c4cc81526cf58740203fd8131532e46f03ae6f45ef10991cecac95a735bf3a retained. AP bounded English MD/JSON identifiers/hashes/counts only, raw ignored app cache. Actual implementation-SHA explicitly non-independent EVALUATOR reconstructs4certificates byte-identically. Clean meaningful close; DONE immutable; parent exact-prefix append, goal remains incomplete.

## Verification

Pending implementation and exact new/related verification; full246 skipped by explicit user cadence237→247.

## Rollback Plan

Revert only the scoped semantic implementation commit if required; preserve task history, previous DONE leaves and registered IO/recovery/settings deviations.

## Findings

Source inspection confirms separate native BroadcastingModify/GetNotifier/SvtListener channel and SwFormat inheritance. Svt listeners do not retain writer-client ownership. Existing SwModify transaction representation is a browser adaptation; exact native delivery ordering is preserved at terminal dispatch. Guessed read-only brdcst/rootfrm and TS writer-module paths failed; rg discovery resolved actual SfxBroadcaster/newfrm/TSX paths and route recomputed before mutation.

Iteration246 implementation and targeted verification complete. Svt observers are separate from native Writer clients; SwFormat uses BroadcastingModify and no generic NotifyAttributeSet bridge remains. Direct row/cell/style native writes refresh original layout/Sfx/browser caches without document signals or revision changes. Native original shared claims/document history/replacement/deletion/close verified. Raw direct silent ClaimFrameFormat without final document invalidation and full native physical frame integration remain unverified, as upstream emits no Svt change on that silent claim. Browser Sync assumes current live native model owners instead of an unsupported disposed-format fallback.

Observation: read-only guessed upstream path and two script syntax errors occurred before semantic mutations; route revalidated. Initial lint/JSDoc errors repaired within scope. Initial runtime1590passed4freshfailed:two fixtures lacked the native following paragraph needed for table deletion,one retained a detached DOM element after a fixed-height subtree remount,one independent observer expected Sync before calling it. All four corrected without changing old accepted values. Closure1 runs exactly4failed plus2new native Svt lower-bound/shallow-copy release-guard cases;6passed12skipped,no unchanged passing replay. Initial and closure threshold exit1 retained; final actual certificate all-four100. Source parity metadata initially used an invalid new browser divergence enum; corrected only the new record to native inventory B. Recoverable validation errors resolved; no genuine external blocker.

Evidence:1596unique app cases,18fresh,13Chromium. App318files18105lines19876statements4554functions14568branches;inventory38files1464/1523/384/1081;all-four100. Six statics, final upstream-absent build/static and restored source/provenance/invariants/parity pass. Source pin11files verified against commit9bc445578031fecf56086729d8e4940c77e14d65;IO4/whole writer-view/stash retained.662other old acceptance files byte-identical;1exact original-native notifier contract migration,3newfiles666total.318old metadata fields/order/status/default/classification/evidenceprefixes preserved,3newunverified321total. No source/Python/scripts/raw maps/results in AP; raw cache ignored. Full suite intentionally skipped user cadence:last237,next247. Broad goal remains active/incomplete.
