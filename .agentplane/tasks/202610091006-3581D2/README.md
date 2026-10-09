---
id: "202610091006-3581D2"
title: "Keep workbench presentation bound to the current native view owner"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T10:07:25.026Z"
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
    body: "Start: Rebind workbench presentation to its current original native view/store owner, keeping exact borrowed/owned lifetime and registered deviations."
events:
  -
    type: "status"
    at: "2026-10-09T10:07:25.914Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Rebind workbench presentation to its current original native view/store owner, keeping exact borrowed/owned lifetime and registered deviations."
doc_version: 3
doc_updated_at: "2026-10-09T10:15:06.351Z"
doc_updated_by: "CODER"
description: "Iteration254 under C9TN6M: fix stale useState-captured presentation store when native SwView or injected viewStore changes. Recompute the current store and retain exact borrowed/owned cleanup without model, layout or I/O/recovery/settings changes."
sections:
  Summary: "Keep actual workbench presentation and native edit/layout commands bound to the same current view owner."
  Scope: "Writer only: apps/office/src/sw/browser/presentation/writer-view.tsx; new native-workbench-view-owner.test.tsx in the same directory; two canonical runtime/provenance writer-view.tsx records, bounded leaf evidence and exact parent C9TN6M Findings append. No projection/core ownership port, prior acceptance migration, network/dependency/setup or registered I/O/recovery/settings changes."
  Plan: "Derive the current presentation store with useMemo over original view and optional injected store identity instead of capturing it once in useState. Preserve component-owned cleanup and never close a borrowed session store. Use current store for actual native notifier/bindings snapshots and renderer; no extra intermediate projection or generation adapter. Add real workbench view-change tests with supplied and local stores, subsequent original native model and format updates, owned/borrowed transitions and unmount cleanup. No prior acceptance changes. Update two canonical writer-view.tsx runtime/provenance records retaining every historical prefix/status/default/classification. Run new/related tests physically upstream-absent once with reportOnFailure; all-four100 current-source coverage via actual counters plus253 whole unchanged modules or complete unchanged declaration/body/enclosing branch/location proofs. Subsequent closures failed/new/unexecuted only. Scoped static build/type/format/lint/dependencies/docs/size upstream-absent finally restore clean pin; registry/provenance/tree/routing/doctor, bounded English counts/hashes, non-independent same-agent evaluator, scoped semantic commit/finish and append-only parent Findings. Last full247,next257; after full257 repair and verify all discovered failures then pause goal."
  Verify Steps: "1. Pinned native view.cxx view-shell ownership and original SwView/SwEditWin/WriterViewStore contracts: actual mounted workbench shows second original view text after owner/store changes; subsequent edits and native format notifications track only current owner. Original renderer root and current view identity preserved. Owned stores close exactly once on replacement/unmount; borrowed stores remain live and usable; transitions both directions preserve native model/state/history. 2. New and related actual workbench/editor/projection/native-format/session/layout/menu/dialog tests physically upstream-absent with reportOnFailure. Require changed/app all-four100, prior253 only whole byte-identical source/maps or complete unchanged declarations/signatures/bodies/enclosing branches/all exact locations; no counter sanitization/threshold weakening and only failed/new/unexecuted closures. No full254. 3. Scoped Prettier/ESLint/type/dependency/docs/size/static build upstream-absent finally restore clean exact pin; canonical full history-prefix proof, registry4views/Writer/global/provenance/tree/routing/doctor; all512 prior test files byte-identical. 4. Bounded English counts/hashes, non-independent same-agent evaluator, scoped semantic commit/finish/clean Writer checkout and exact parent append. Last full247,next257; after next full repair/verify all failures then pause goal. Broad native root/page/body/follows/layout lifetime and overall parity remain unverified."
  Verification: "Command: one upstream-absent reportOnFailure targeted Vitest profile over26files; strict source-bound certificate; scoped Prettier/ESLint; npm run typecheck/check:dependencies/check:docs/check:file-size/test:static; inventory:registry:build/inventory:parity:writer/inventory:registry:check/check:source-provenance/check:source-tree; routing; doctor. Result:216 unique cases including6 fresh actual native workbench owner/lifetime cases PASS,0 fail0 skip0 passing replay. Original supplied/local stores follow current SwView, native subsequent content/cell format notifications and shared layout; owned/borrowed transitions preserve document/history and close exactly component-owned stores. Source-bound changed1/app318 all-four100 binds actual changed owner-selection counters,317 whole byte-identical modules and81 complete unchanged declaration/body/enclosing condition/all exact location proofs from253. No changed outer body transfer/counter sanitization; raw partial V8 threshold exit retained. Evidence: bounded evidence/coverage.json and checks.json; raw/helpers ignored outside AgentPlane. Scope: writer-view.tsx store owner selection only; all512 prior tests byte-identical, two canonical history/status/default/classification/evidence prefixes preserved without promotion. Static/tests physically upstream-absent; restored exact clean pin. Registry4views,provenance321(230mapped74browser17infra),tree114+33retired,routing pass,doctor0errors2historicalwarnings. Same-agent evaluator non-independent. Render-time local store construction/native root/page/body/follows/lifetime/overall parity remain unverified. No full254; next full257 then repair/verify failures and pause goal."
  Rollback Plan: "Normal scoped revert only if requested; no reset, merge, upstream mutation or dependency setup."
  Findings: "Iteration253 actual workbench owner-change case produced first-owner text with second-owner view props. Source confirms useState captures viewStore or locally constructed WriterViewStore once, while current native commands/edit-window/layout read new view props; cleanup conditions can then target the wrong ownership. Fix this owner selection, keeping all native projection/notifier implementation unchanged. Render-time local store construction and complete root/page/body/follows lifetime are separate remaining architecture work; no whole-parity promotion."
id_source: "generated"
---
## Summary

Keep actual workbench presentation and native edit/layout commands bound to the same current view owner.

## Scope

Writer only: apps/office/src/sw/browser/presentation/writer-view.tsx; new native-workbench-view-owner.test.tsx in the same directory; two canonical runtime/provenance writer-view.tsx records, bounded leaf evidence and exact parent C9TN6M Findings append. No projection/core ownership port, prior acceptance migration, network/dependency/setup or registered I/O/recovery/settings changes.

## Plan

Derive the current presentation store with useMemo over original view and optional injected store identity instead of capturing it once in useState. Preserve component-owned cleanup and never close a borrowed session store. Use current store for actual native notifier/bindings snapshots and renderer; no extra intermediate projection or generation adapter. Add real workbench view-change tests with supplied and local stores, subsequent original native model and format updates, owned/borrowed transitions and unmount cleanup. No prior acceptance changes. Update two canonical writer-view.tsx runtime/provenance records retaining every historical prefix/status/default/classification. Run new/related tests physically upstream-absent once with reportOnFailure; all-four100 current-source coverage via actual counters plus253 whole unchanged modules or complete unchanged declaration/body/enclosing branch/location proofs. Subsequent closures failed/new/unexecuted only. Scoped static build/type/format/lint/dependencies/docs/size upstream-absent finally restore clean pin; registry/provenance/tree/routing/doctor, bounded English counts/hashes, non-independent same-agent evaluator, scoped semantic commit/finish and append-only parent Findings. Last full247,next257; after full257 repair and verify all discovered failures then pause goal.

## Verify Steps

1. Pinned native view.cxx view-shell ownership and original SwView/SwEditWin/WriterViewStore contracts: actual mounted workbench shows second original view text after owner/store changes; subsequent edits and native format notifications track only current owner. Original renderer root and current view identity preserved. Owned stores close exactly once on replacement/unmount; borrowed stores remain live and usable; transitions both directions preserve native model/state/history. 2. New and related actual workbench/editor/projection/native-format/session/layout/menu/dialog tests physically upstream-absent with reportOnFailure. Require changed/app all-four100, prior253 only whole byte-identical source/maps or complete unchanged declarations/signatures/bodies/enclosing branches/all exact locations; no counter sanitization/threshold weakening and only failed/new/unexecuted closures. No full254. 3. Scoped Prettier/ESLint/type/dependency/docs/size/static build upstream-absent finally restore clean exact pin; canonical full history-prefix proof, registry4views/Writer/global/provenance/tree/routing/doctor; all512 prior test files byte-identical. 4. Bounded English counts/hashes, non-independent same-agent evaluator, scoped semantic commit/finish/clean Writer checkout and exact parent append. Last full247,next257; after next full repair/verify all failures then pause goal. Broad native root/page/body/follows/layout lifetime and overall parity remain unverified.

## Verification

Command: one upstream-absent reportOnFailure targeted Vitest profile over26files; strict source-bound certificate; scoped Prettier/ESLint; npm run typecheck/check:dependencies/check:docs/check:file-size/test:static; inventory:registry:build/inventory:parity:writer/inventory:registry:check/check:source-provenance/check:source-tree; routing; doctor. Result:216 unique cases including6 fresh actual native workbench owner/lifetime cases PASS,0 fail0 skip0 passing replay. Original supplied/local stores follow current SwView, native subsequent content/cell format notifications and shared layout; owned/borrowed transitions preserve document/history and close exactly component-owned stores. Source-bound changed1/app318 all-four100 binds actual changed owner-selection counters,317 whole byte-identical modules and81 complete unchanged declaration/body/enclosing condition/all exact location proofs from253. No changed outer body transfer/counter sanitization; raw partial V8 threshold exit retained. Evidence: bounded evidence/coverage.json and checks.json; raw/helpers ignored outside AgentPlane. Scope: writer-view.tsx store owner selection only; all512 prior tests byte-identical, two canonical history/status/default/classification/evidence prefixes preserved without promotion. Static/tests physically upstream-absent; restored exact clean pin. Registry4views,provenance321(230mapped74browser17infra),tree114+33retired,routing pass,doctor0errors2historicalwarnings. Same-agent evaluator non-independent. Render-time local store construction/native root/page/body/follows/lifetime/overall parity remain unverified. No full254; next full257 then repair/verify failures and pause goal.

## Rollback Plan

Normal scoped revert only if requested; no reset, merge, upstream mutation or dependency setup.

## Findings

Iteration253 actual workbench owner-change case produced first-owner text with second-owner view props. Source confirms useState captures viewStore or locally constructed WriterViewStore once, while current native commands/edit-window/layout read new view props; cleanup conditions can then target the wrong ownership. Fix this owner selection, keeping all native projection/notifier implementation unchanged. Render-time local store construction and complete root/page/body/follows lifetime are separate remaining architecture work; no whole-parity promotion.
