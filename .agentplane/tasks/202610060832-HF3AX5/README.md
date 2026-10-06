---
id: "202610060832-HF3AX5"
title: "Move table Tab append into native cursor shell and document history ownership"
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
  updated_at: "2026-10-06T08:33:03.320Z"
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
    body: "Start: implement the approved native cursor-shell and document row-history ownership slice under standing iterative authorization, preserving existing defaults and registered exceptions."
events:
  -
    type: "status"
    at: "2026-10-06T08:33:10.018Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved native cursor-shell and document row-history ownership slice under standing iterative authorization, preserving existing defaults and registered exceptions."
doc_version: 3
doc_updated_at: "2026-10-06T08:33:10.018Z"
doc_updated_by: "CODER"
description: "Iteration180: remove table traversal and appended-row graph/history construction from SwWrtShell. Introduce the inherited native SwCursorShell source owner and route the existing flat final-cell append through SwDoc.InsertRow, with native document history publication and ordinary subsequent cursor traversal. Preserve existing behavior and explicitly retain unverified broader native contracts."
sections:
  Summary: "Move existing Writer table Tab traversal into inherited SwCursorShell and default final-row insertion into SwDoc ownership, removing SwWrtShell graph/history construction."
  Scope: "Core crsr/trvltbl.ts (new), edit/ednumber.ts, doc/doc.ts, undo/untbl.ts, uibase/wrtsh/wrtsh1.ts; targeted new core and mounted acceptance and one Chromium acceptance file; source-provenance/runtime-inventory metadata and bounded task/parent checkpoint evidence. No registered save/open/recovery changes, upstream source copies, helper scripts or Python in AP. One leaf only, no subagents/network/outside-repository actions."
  Plan: "Standing user authorization covers iterative native UI/core refactoring. Port actual SwCursorShell inheritance and next/previous-cell ownership, route existing last-row default append through SwDoc.InsertRow and document-owned already-executed undo publication, then ordinary cursor traversal. Preserve cursor/pending attributes, graph identities, notification transactions and mixed history. Native non-default row insertion, complex table/layout/protection/readonly and full cursor hierarchy remain unverified. Preserve all old semantic statuses/defaults/classifications/evidence and existing tests. Run six static gates, ONE upstream-absent full profile with persisted exact failures before assertions, failure-only/new-case closures, restored source audits and same-agent exact-SHA quality; commit, verify, close leaf and append parent checkpoint."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
    2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
    3. New native and mounted/browser acceptance proves inherited cursor ownership, document row insertion/history with no shell ApplyAction, actual final-cell traversal, no insertion at forbidden boundaries, notification coherence, pending attribute undo, ordinary row identities and insertion-row-text repeated Undo/Redo. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
    4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.
  Verification: "Pending implementation and exact-source verification."
  Rollback Plan: "Revert the scoped implementation commit through a separate approved task if native default cell traversal/history regresses; preserve registered I/O deviations and immutable completed task evidence."
  Findings: "Previous goal turn made verified progress: iteration179 DONE with implementation a79ea63f62f50eaeed5697d813b9b6818713033d and parent checkpoint 5b81a30f40f4. Read-only discovery found the existing final-cell append directly prepares sections and SwUndoTableNdsChg inside SwWrtShell, unlike pinned trvltbl.cxx -> SwDoc::InsertRow -> document AppendUndo. Two initial source searches used a wrong browser path / wrong source unit and one config filename; nonzero routes were recomputed, then actual paths were resolved without mutation. No source/helpers were saved in AP."
id_source: "generated"
---
## Summary

Move existing Writer table Tab traversal into inherited SwCursorShell and default final-row insertion into SwDoc ownership, removing SwWrtShell graph/history construction.

## Scope

Core crsr/trvltbl.ts (new), edit/ednumber.ts, doc/doc.ts, undo/untbl.ts, uibase/wrtsh/wrtsh1.ts; targeted new core and mounted acceptance and one Chromium acceptance file; source-provenance/runtime-inventory metadata and bounded task/parent checkpoint evidence. No registered save/open/recovery changes, upstream source copies, helper scripts or Python in AP. One leaf only, no subagents/network/outside-repository actions.

## Plan

Standing user authorization covers iterative native UI/core refactoring. Port actual SwCursorShell inheritance and next/previous-cell ownership, route existing last-row default append through SwDoc.InsertRow and document-owned already-executed undo publication, then ordinary cursor traversal. Preserve cursor/pending attributes, graph identities, notification transactions and mixed history. Native non-default row insertion, complex table/layout/protection/readonly and full cursor hierarchy remain unverified. Preserve all old semantic statuses/defaults/classifications/evidence and existing tests. Run six static gates, ONE upstream-absent full profile with persisted exact failures before assertions, failure-only/new-case closures, restored source audits and same-agent exact-SHA quality; commit, verify, close leaf and append parent checkpoint.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
3. New native and mounted/browser acceptance proves inherited cursor ownership, document row insertion/history with no shell ApplyAction, actual final-cell traversal, no insertion at forbidden boundaries, notification coherence, pending attribute undo, ordinary row identities and insertion-row-text repeated Undo/Redo. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.

## Verification

Pending implementation and exact-source verification.

## Rollback Plan

Revert the scoped implementation commit through a separate approved task if native default cell traversal/history regresses; preserve registered I/O deviations and immutable completed task evidence.

## Findings

Previous goal turn made verified progress: iteration179 DONE with implementation a79ea63f62f50eaeed5697d813b9b6818713033d and parent checkpoint 5b81a30f40f4. Read-only discovery found the existing final-cell append directly prepares sections and SwUndoTableNdsChg inside SwWrtShell, unlike pinned trvltbl.cxx -> SwDoc::InsertRow -> document AppendUndo. Two initial source searches used a wrong browser path / wrong source unit and one config filename; nonzero routes were recomputed, then actual paths were resolved without mutation. No source/helpers were saved in AP.
