# Vite Office Upstream Parity Plan

Status: proposed remediation plan

Audit date: 2026-09-21

Pinned baseline: LibreOffice `libreoffice-26.8.0.2`, commit `9bc445578031fecf56086729d8e4940c77e14d65`

Local upstream tree: `vendor/libreoffice-reference/`

## 1. Executive conclusion

Vite Office currently contains a meaningful browser-native Writer vertical slice, not a generally equivalent LibreOffice office suite. Its strongest parts are the upstream-shaped Writer node skeleton, item/undo foundations, a bounded ODT pipeline, browser input/clipboard integration, and extensive local tests. Calc, Impress, Draw, Base, Math, and Chart are launch-surface placeholders and are not parity targets for the current implementation.

The current implementation nevertheless falls short of the requested architectural target in several material ways:

1. Command dispatch and frame responsibilities are assigned to `framework` even though their LibreOffice owners are primarily `sfx2`.
2. Browser event, projection, persistence, and React external-store concepts leak into Writer shell and document-facing modules.
3. Text-run DTOs and string paragraph IDs act as a second model beside `SwTextNode`, `SwPosition`, `SwPaM`, hints, and item sets.
4. Mutation logic is concentrated in large shell/text-node files and bypasses the upstream `IDocumentContentOperations` ownership model.
5. The paragraph-style catalogue preserves names and relationships but not the corresponding upstream item-set defaults; React CSS currently supplies part of the missing semantics.
6. Numbering, lifecycle, filtering, and recovery contracts cover useful subsets but are narrower or differently layered than their current parity claims imply.
7. The parity pipeline proves path and marker presence, not semantic contract, behavior, or default equivalence. It can therefore report 35/35 verified capabilities while the runtime inventory still marks most modules unverified.

The first remediation step must be to restore trustworthy inventory semantics. Architectural refactoring should then proceed from the lowest-level model and command contracts outward to browser adapters and React UI. UI cleanup before the model and state contracts are stable would merely move the current adapters around.

## 2. Goal and parity rules

The target is the closest practical TypeScript implementation of the corresponding pinned LibreOffice modules:

- preserve module ownership, public contracts, state transitions, data structures, defaults, and observable behavior where the capability exists locally;
- keep files under the closest matching LibreOffice module/path and keep unrelated browser code outside those paths;
- use stack-specific substitutions only at explicit browser boundaries;
- retain React as the presentation technology without moving Writer semantics into components;
- do not implement native-only facilities that have no browser product requirement;
- do not claim parity for a capability wider than the tested local subset.

For this plan, parity has four independent dimensions:

| Dimension | Required evidence |
| --- | --- |
| Contract | Equivalent callable surface, argument/result meaning, state ownership, and error semantics, allowing documented TypeScript representation changes. |
| Behavior | The same state transition and externally observable result for a defined operation and precondition. |
| Defaults | Values derived from the pinned upstream source or fixtures, including locale/script branches and initialization order. |
| Responsibility | Code lives in the equivalent module/layer, or a browser-only adapter is clearly separated and depends inward. |

A path, symbol, comment, or test-name match is provenance evidence only. It is not parity evidence by itself.

## 3. Audit scope and method

The audit covered:

- all 136 production modules listed in `docs/program/parity/runtime-inventory.json`;
- the application entry point and source trees under `apps/office/src/{editeng,framework,package,sfx2,svl,svtools,sw,vcl,xmloff}` (`svtools` currently contains no source files);
- package scripts, manifests, 73 colocated unit-test files, and eight Playwright specifications;
- Writer command metadata, parity records, source provenance, and source-tree enforcement;
- the pinned upstream implementations referenced below.

The following checks were used as structural evidence during the audit:

- `npm run inventory:parity`
- `npm run check:source-provenance`
- `npm run check:source-tree`
- `npm run check:dependencies`

All four passed. Their passing result is not treated as proof of semantic parity because their present contracts are narrower than that claim.

No content from the previously deleted version of this document was used.

## 4. Implemented-function inventory

### 4.1 Product-level inventory

| Area | Current implementation | Upstream anchor | Assessment |
| --- | --- | --- | --- |
| Browser application shell | Launcher, module routing, localization, Writer composition in `framework/browser/app` and `sw/browser/composition` | No single upstream counterpart; desktop bootstrap is distributed across `desktop`, `framework`, and application modules | Justified browser infrastructure. Only Writer has a functional editor; other suite cards are placeholders. |
| Command surfaces | React menus/toolbars, generated Writer command resources, shortcuts, enablement and checked state | `sw/uiconfig/swriter/**`, `sw/sdi/swriter.sdi`, `sfx2/source/control/{dispatch,bindings}.cxx` | UI rendering is justified; command ownership and dispatch architecture are not yet aligned. |
| Sfx lifecycle | `SfxObjectShell`, `SfxMedium`, request/bindings, modified/save/recovery generations | `include/sfx2/{objsh,docfile,request,bindings}.hxx`, `sfx2/source/{doc,control}/**` | Useful subset; browser document DTOs and storage orchestration are mixed into upstream-shaped classes. |
| SVL foundations | Pool items, item pool/set, broadcaster/listener, undo manager, storage/recovery contracts | `include/svl/**`, `svl/source/{items,notify,undo}/**` | Best-aligned shared foundation, but the item universe remains too small for claimed Writer defaults. |
| Edit engine items | Font family/weight/posture/underline and paragraph-adjustment pool items in `editeng/source/items` | `editeng/source/items/{textitem,paraitem}.cxx` | Correct module family, but only a narrow subset of the item contracts and defaults required by Writer is implemented. |
| Writer document model | `SwDoc`, five sentinel sections, `SwNodes`, text nodes, positions, `SwPaM`, content-index registry, formats and style collections | `sw/inc/{doc,node,pam}.hxx`, `sw/source/core/{doc,docnode,crsr}/**` | Recognizably upstream-shaped, but stable string IDs and run DTOs have become competing canonical identities. |
| Writer editing | Insert/delete/replace, split/join/move, selections, undo/redo, character formatting, alignment, style assignment, lists, indent, hyperlinks | `sw/source/core/doc/DocumentContentOperationsManager.cxx`, `sw/source/uibase/wrtsh/**`, `sw/source/uibase/shells/**` | Functional, but too much behavior is in `SwWrtShell` and `SwTextNode` rather than upstream managers and shell partitions. |
| Style pool | 126 paragraph-style identities, parent/follow relations, style selection | `sw/inc/poolfmt.hxx`, `sw/source/core/doc/{poolfmt,DocumentStylePoolManager}.cxx` | Identity catalogue exists; default item sets and script/locale-dependent semantics do not. |
| Numbering | Bullet/numbered rules, list tree, levels, promote/demote, indent and marker projection | `sw/source/core/doc/{number,list}.cxx`, `sw/source/core/SwNumberTree/**` | Implements a small uniform-rule subset; data model and defaults are substantially narrower than `SwNumRule`/`SvxNumberFormat`. |
| Transfer | `SwTransferable`, plain/HTML serialization, browser clipboard and drag/drop-facing operations | `sw/source/uibase/dochdl/swdtflvr.cxx` | Browser integration is necessary, but contract parity is explicitly divergent in the runtime inventory and should remain unclaimed until the supported flavor/action contract is defined. |
| ODF/package | ZIP32 reader, STORE writer, CRC32, manifest, SAX parsing, styles/content import-export, lists, fonts, hyperlinks, worker execution | `package/source/{zipapi,manifest}/**`, `xmloff/source/**`, `sw/source/filter/xml/**` | Valuable bounded ODT subset. It does not justify broad ODF round-trip parity claims. |
| Persistence/recovery | JSON graph codec, IndexedDB primary snapshot, AutoRecovery, file picker and downloads | `sfx2/source/doc/**`, `framework/source/services/autorecovery.cxx`, `svl` storage interfaces | Browser storage is justified; one snapshot DTO currently serves too many roles and crosses model/filter/lifecycle boundaries. |
| Writer UI | Contenteditable paragraphs, DOM/model selection mapping, IME, geometry, menu, toolbar, sidebar, status, dialogs and recovery prompt | Native VCL UI plus `sw/source/uibase/docvw/edtwin*.cxx` | React/DOM architecture may differ. Functional state must still originate in Writer/Sfx contracts rather than CSS, string matching, or duplicated projections. |

### 4.2 Current inventory truth

`docs/program/parity/runtime-inventory.json` lists 136 production modules:

- 84 `upstream-mechanism` modules;
- 35 `browser-adaptation` modules;
- 17 `local-infrastructure` modules;
- 134 active and two foundation modules.

Its semantic status is materially less complete than the command-slice closure:

| Dimension | Parity | Unverified | Not applicable | Divergent |
| --- | ---: | ---: | ---: | ---: |
| Behavior | 8 | 110 | 18 | 0 |
| Contract | 7 | 76 | 52 | 1 |
| Defaults | 7 | 72 | 57 | 0 |

Only eight modules have any `parity` semantic dimension. The sole explicit contract divergence is `apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts`. By contrast, `docs/program/parity/writer-command-slice.json` marks all 35 records as implemented, contract-equivalent, behavior-equivalent, default-equivalent, and verified. `docs/program/parity-matrix.md` and `docs/program/parity/phase-8-closure.md` also disagree on the degree of independent attestation. These claims cannot simultaneously describe the same verification standard.

## 5. Deviations that are justified by the browser stack

The following deviations should be preserved, but their boundaries and contracts must be explicit:

1. React components and hooks under `framework/browser/**` and `sw/browser/**` replace VCL widgets and native layout code.
2. `InputEvent`, DOM selection, caret geometry, IME/composition, `ClipboardEvent`, and pointer adapters belong under `sw/browser/editor/**`.
3. File picker, download, IndexedDB, browser clipboard, and local-font discovery belong under `vcl/browser/**` or a similarly explicit browser platform layer.
4. Worker messages, cancellation, and structured-clone DTOs are legitimate adapters for expensive ODT work.
5. Browser launch/routing/composition has no obligation to mirror LibreOffice desktop bootstrap internals.
6. A JavaScript ZIP/SAX implementation may substitute for native libraries if it preserves the supported package/filter contract and limits are explicit.
7. A serializable recovery/storage representation is necessary, but it must not replace the live Writer graph as the canonical model.
8. Browser-only commands may exist under a clearly namespaced URL such as `vnd.vite-office.browser:*`; they must not masquerade as supported UNO commands.

The dependency rule is one-way: browser adapters may call upstream-shaped core modules; core modules must not import DOM, React, IndexedDB, worker protocols, browser command DTOs, or presentation projections.

## 6. Material unjustified deviations

### P0-1. Parity verification currently proves markers, not semantics

Local evidence:

- `scripts/libreoffice-inventory/parity-mapping-support.ts` accepts an assertion when referenced files exist and their contents contain configured markers.
- `scripts/libreoffice-inventory/parity-mappings.ts` derives closure from authored booleans and marker resolution.
- `docs/program/parity/writer-command-slice.json` consequently reports 35/35 verified capabilities.
- `docs/program/source-provenance.json` includes weak or unrelated mappings such as `SfxItemPool` to Calc/Writer color helpers, AutoRecovery to generic UNO lifetime symbols, `DocumentStateManager` to comment-ID generation, and `writercommands.ts` to drawing/tracked-change symbols.

Upstream evidence: the cited files exist in the pinned tree, but marker presence does not execute or compare `SfxItemPool`, AutoRecovery, Writer command, style, list, or XML behavior.

Target state: parity records are generated from executable assertions or reviewed contract/default tables. Provenance, implementation, verification, and parity are distinct maturity states. Every current `verified` record that lacks such evidence is reset to `mapped` or `implemented`.

### P0-2. Sfx dispatch and frame ownership is misplaced

Local evidence: `apps/office/src/framework/source/dispatch/dispatchprovider.ts` defines `CommandDefinition`, `CommandRegistry`, `SfxShell`, `SfxDispatcher`, and `OfficeFrame` in one custom 650-line module.

Upstream evidence:

- `framework/source/dispatch/dispatchprovider.cxx` is a UNO dispatch-provider implementation;
- `include/sfx2/dispatch.hxx` and `sfx2/source/control/dispatch.cxx` own `SfxDispatcher`;
- `include/sfx2/bindings.hxx` and `sfx2/source/control/bindings.cxx` own binding/state propagation;
- Sfx view-frame responsibilities live under `sfx2/source/view/**`.

Target state: implement upstream-shaped dispatcher, shell stack, view frame, bindings, request, and slot state under `sfx2`. Keep `framework` as an outer UNO/provider or application integration layer. Generated command metadata describes slots and presentation; it must not become a parallel execution framework.

### P0-3. Browser identities and events leak into Writer shell contracts

Local evidence:

- `apps/office/src/sw/source/uibase/wrtsh/wrtsh-selection.ts` exposes positions by `paragraphId: string`;
- `apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts` searches nodes by IDs and dispatches raw browser `beforeinput` strings in `HandleInput`;
- `apps/office/src/sw/source/core/docnode/node.ts` exposes UI-stable node IDs;
- `apps/office/src/sw/browser/editor/writer-edit-controller.ts` already exists as the natural browser translation boundary.

Upstream evidence:

- `sw/inc/pam.hxx` and `sw/inc/node.hxx` use node/content indexes and object relationships;
- `sw/source/uibase/inc/wrtsh.hxx` and `sw/source/uibase/wrtsh/{wrtsh1,select,delete}.cxx` expose Writer operations rather than DOM event names;
- native event translation belongs to `sw/source/uibase/docvw/edtwin*.cxx`, outside the core model.

Target state: DOM IDs exist only in projection/rendering maps. Browser events are translated once into shell methods or Sfx requests. All model and undo operations use `SwPosition`, `SwPaM`, node indexes/references, and Writer-native command arguments.

### P0-4. The text-run DTO is a competing canonical model

Local evidence: `apps/office/src/sw/source/core/txtnode/ndtxt.ts` combines `SwTextNode` with `WriterTextRun` normalization, grapheme helpers, direct-format manipulation, and alignment data; `writer-document-codec.ts`, UI projection, clipboard, and filters consume these runs directly.

Upstream evidence: `sw/source/core/txtnode/{ndtxt,ndhints,txatbase}.cxx` and their headers model text plus hints/attributes; formatting is represented through pool items and attribute sets rather than a primitive run schema.

Target state: text plus `SwpHints`/`SwTextAttr`/`SfxItemSet` is canonical. A run is a derived, immutable projection for React, HTML, or serialization only. It cannot carry authoritative state back into the core without conversion through Writer operations.

### P0-5. Style names exist without upstream style defaults

Local evidence:

- `apps/office/src/sw/inc/poolfmt.ts` enumerates 126 style identities and relations;
- `apps/office/src/sw/source/core/doc/DocumentStylePoolManager.ts` mainly instantiates those definitions;
- `apps/office/src/sw/source/core/doc/fmtcol.ts` supplies only a small fraction of actual properties;
- `apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx` hard-codes title, heading, caption, quotation, and other style CSS by slug.

Upstream evidence: `sw/inc/poolfmt.hxx`, `sw/source/core/doc/poolfmt.cxx`, and `sw/source/core/doc/DocumentStylePoolManager.cxx` construct item sets with fonts, size, language/script, margins, spacing, alignment, outline/list relationships, HTML-mode variants, and parent/follow semantics.

Target state: implemented styles are created from source-derived default item tables and normal Writer inheritance. React renders computed style/item state; it does not define Writer semantics. Unimplemented style families remain explicit and unavailable rather than name-only shells.

### P1-1. Document mutations bypass the upstream content-operations owner

Local evidence: `apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts` is a thin facade, while insert/delete/replace/split/join and snapshot logic live largely in `SwWrtShell`, `SwTextNode`, and bespoke undo actions.

Upstream evidence: `sw/inc/IDocumentContentOperations.hxx` and `sw/source/core/doc/DocumentContentOperationsManager.cxx` own core insert/delete/replace/copy operations; shells coordinate view and cursor behavior.

Target state: the manager owns all canonical model mutations and returns/updates Writer positions according to upstream rules. Shells group actions and maintain cursor/view state. Undo objects record Writer ranges and operation-specific state rather than UI projections.

### P1-2. Writer shell and command modules are catch-alls

Local evidence:

- `apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts` combines input dispatch, selection, editing, formatting, lists, hyperlink, indent, and history operations;
- `apps/office/src/sw/source/uibase/shells/writercommands.ts` registers most commands in a single module;
- `apps/office/src/sw/source/core/txtnode/ndtxt.ts` combines model and presentation helpers.

Upstream evidence: Writer separates `wrtsh1.cxx`, `select.cxx`, `delete.cxx`, `textsh*.cxx`, `listsh.cxx`, view functions, core operations, text attributes, and node logic. `sw/sdi/swriter.sdi` is declarative slot metadata, not a handler implementation.

Target state: split by upstream responsibility. Character/paragraph commands live in text shells, list commands in list shell, view actions in view functions, core mutations in the content manager, and generated SDI data remains declarative.

### P1-3. Numbering is a locally simplified model with overly broad claims

Local evidence: `apps/office/src/sw/source/core/doc/number.ts` represents a bullet/numbered `kind` and uniform formats; `DocumentListsManager.ts`, `list.ts`, and `SwNodeNum.ts` implement a bounded list tree and marker flow.

Upstream evidence: `sw/source/core/doc/number.cxx`, `sw/source/core/doc/list.cxx`, and `sw/source/core/SwNumberTree/**` include numbering types, label alignment modes, include-upper-levels, prefixes/suffixes/list formats, restart behavior, character styles, outline rules, and richer invalidation.

Target state: first define the exact numbering subset needed by current commands, then preserve the corresponding upstream `SwNumRule`/`SwNumFormat` fields and defaults without a second local abstraction. Unsupported rule types must round-trip opaquely where practical or be rejected explicitly before mutation.

### P1-4. Document lifecycle owns browser storage and filter orchestration

Local evidence: `apps/office/src/sw/source/uibase/app/docsh.ts` contains browser open/export ports, IndexedDB primary load/save, download orchestration, worker service calls, and recovery snapshot methods.

Upstream evidence: `sw/source/uibase/app/{docsh,docshini}.cxx` owns Writer document-shell lifecycle; `sfx2/source/doc/{docfile,objstor,objmisc}.cxx` owns medium/storage/load-save coordination; filters own import/export.

Target state: `SwDocShell` retains Writer lifecycle hooks and delegates medium/filter operations. Browser file/storage/worker ports adapt `SfxMedium` or filter services outside the shell. Recovery listens to shell state but serializes through a dedicated storage contract.

### P1-5. One graph codec serves persistence, worker transport, and filter staging

Local evidence: `apps/office/src/sw/source/filter/basflt/writer-document-codec.ts` defines a versioned graph snapshot used by storage and ODT worker flows.

Upstream evidence: LibreOffice distinguishes the live Writer graph, Sfx storage/medium lifecycle, filter import/export state, and AutoRecovery. There is no upstream counterpart to a single canonical JSON graph format.

Target state: distinguish three contracts: durable browser recovery/storage schema, narrow worker-transfer DTO, and live filter model access. Avoid encode/decode of the entire document merely to cross a worker boundary; if the worker must own the filter, give it a documented structured-clone boundary and reconstruct only through normal Writer import operations.

### P1-6. ODT capabilities are broader than their evidence

Local evidence: `apps/office/src/sw/source/filter/xml/**`, `xmloff/source/**`, and `package/source/**` support a useful subset: stored ZIP output, stored/raw-deflate input, manifest, paragraphs/styles/lists/basic character properties/fonts/hyperlinks, and limits. Several CAP records share the same broad implementation/test bundles.

Upstream evidence: `sw/source/filter/xml/{swxml,wrtxml,xmlexp,xmlimp}.cxx`, `xmloff/source/text/**`, and package ZIP code cover substantially more content and compatibility behavior.

Target state: split ODT inventory by stream and property. Each claim names the supported XML element/attribute, import behavior, export behavior, default, and lossless round-trip expectation. Unsupported tables, images, fields, sections, changes, embedded objects, signatures, encryption, and foreign content are not silently covered by a generic ODT claim.

### P2-1. `SwView` contains React/browser presentation responsibilities

Local evidence: `apps/office/src/sw/source/uibase/uiview/view.ts` contains presentation projections, workflow controllers, cut/paste adapter arguments, view snapshots, and external-store `Subscribe`/`GetSnapshot` concerns.

Upstream evidence: `sw/source/uibase/uiview/view*.cxx` and `sw/inc/view.hxx` own Writer view/shell/frame state and command coordination, not React projection DTOs.

Target state: keep `SwView` upstream-shaped. Move React snapshots/projectors/subscriptions to `sw/browser/presentation` and workflows to `sw/browser/workflows`; expose only a narrow observable adapter over Writer/Sfx state.

### P2-2. Source layout checks do not prove responsibility alignment

Local evidence:

- `scripts/check-lo-source-tree.mjs` checks a required-path list and retired paths, but not code responsibility;
- `scripts/check-module-boundaries.mjs` enforces coarse top-level edges and permits broad `sw` internal coupling;
- `docs/program/source-provenance.json` has filename-divergence allowances that can hide ownership errors.

Upstream evidence: the pinned tree provides direct responsibility anchors for Sfx dispatch, Writer shells, model managers, filters, and UI configuration.

Target state: add ownership rules for inner layers (`sw/core`, `sw/uibase`, `sw/browser`, filters, Sfx), forbid browser imports from core/upstream-mechanism files, and require each filename divergence to state a stack necessity rather than a TypeScript convenience.

## 7. UI and previous-refactor artifacts

These issues are lower-level symptoms of the ownership problems above and should be removed during the relevant work package:

| Artifact | Local evidence | Why it is a problem | Intended replacement |
| --- | --- | --- | --- |
| Style-by-slug CSS | `sw/browser/editor/WriterEditableParagraph.tsx` | React owns Writer style semantics and masks missing defaults. | Render computed item-set/style projection. |
| Duplicate list marker calculation | `WriterEditableParagraph.tsx` recomputes a marker although `writer-view-projection.ts` already exposes one | Two presentation paths can disagree and add unnecessary traversal. | One list-layout projection produced from `SwNodeNum` state. |
| `projectionVersion` consumed only to trigger rendering | `WriterEditableParagraph.tsx` | Version plumbing signals an unstable projection contract. | Stable immutable paragraph/run snapshots with referential change semantics. |
| O(n²) run-key generation | `WriterEditableParagraph.tsx` derives keys from preceding sliced runs | Avoidable UI work and fragile identity. | Projection supplies stable render-segment keys. |
| Fixed fake page geometry | `WriterWorkspaceChrome.tsx` uses a fixed page-like minimum height/width | It visually implies pagination without a Writer layout model. | Label as continuous web view, or add a separate layout/page projection before claiming page behavior. |
| English error-string switching | `sw/browser/presentation/writer-view.tsx` maps exact error messages to UI | Presentation depends on message text and cannot localize reliably. | Typed domain/filter error codes plus localized resources. |
| Recovery status embedded as prose | `writer-view.tsx`/recovery prompt flow | Conflates lifecycle state and status rendering. | Typed recovery state projected separately. |
| Toolbar computes style hierarchy | `WriterFormattingToolbar.tsx` walks the style pool in render | UI reconstructs model relationships and defaults. | A style-list/state controller backed by `SfxBindings` and style pool. |
| Assumed command presence/casts | `WriterFormattingToolbar.tsx` and command surfaces | Hides unsupported or incorrectly registered commands. | Typed generated slot IDs and explicit unavailable states. |
| Browser font fallback as Writer default | `vcl/browser/{font-list,default-font-device}.ts` and `sw/source/core/doc/default-font.ts` | Availability fallback and document default are different contracts. | Source-derived Writer default request followed by an explicit device substitution result. |
| `writercommands.ts` all-in-one registry | `sw/source/uibase/shells/writercommands.ts` | Preserves command names but erases upstream handler ownership. | Generated slot metadata plus handlers in text/list/view/document shells. |
| Graph snapshots in view state | `sw/source/uibase/uiview/view.ts` and storage workflow | Copies persistence concerns into presentation state. | Lightweight observable Writer/Sfx state; persistence is independent. |

## 8. Target module and dependency architecture

The intended dependency direction is:

```text
React/Vite composition
  -> framework/browser and sw/browser adapters
    -> Sfx view frame, dispatcher, bindings, requests
      -> SwView and Writer shells
        -> SwDoc interfaces/managers, nodes, positions, hints, items
          -> svl/editeng foundations

Browser file/IndexedDB/worker ports
  -> SfxMedium/filter/recovery adapters
    -> Writer import/export and document operations
```

No arrow may point from a lower row back to React, DOM, browser storage, or presentation DTOs.

### 8.1 Required file/responsibility moves

| Current location | Target location/responsibility | Upstream anchor |
| --- | --- | --- |
| `framework/source/dispatch/dispatchprovider.ts` Sfx classes | `sfx2/source/control/dispatch.ts`, `sfx2/source/view/viewfrm.ts`; leave only provider facade in `framework` | `sfx2/source/control/dispatch.cxx`, `include/sfx2/dispatch.hxx`, `sfx2/source/view/**` |
| `sw/source/uibase/shells/writercommands.ts` | Declarative slots under `sw/sdi`; handlers in `textsh*.ts`, `listsh.ts`, `viewfunc.ts`, and document shell | `sw/sdi/swriter.sdi`, `sw/source/uibase/shells/{textsh1,listsh}.cxx` |
| Browser event switch in `wrtsh.ts` | `sw/browser/editor/writer-edit-controller.ts` | `sw/source/uibase/docvw/edtwin*.cxx` as responsibility analogue |
| Projection/workflow DTOs in `uibase/uiview/view.ts` | `sw/browser/presentation/**` and `sw/browser/workflows/**` | `sw/inc/view.hxx`, `sw/source/uibase/uiview/view*.cxx` |
| Run helpers in `core/txtnode/ndtxt.ts` | Derived projection/serialization helpers outside the canonical node implementation | `sw/source/core/txtnode/{ndtxt,ndhints,txatbase}.cxx` |
| Browser ports in `uibase/app/docsh.ts` | Browser platform adapters around `SfxMedium`, filters, and recovery | `sw/source/uibase/app/docsh*.cxx`, `sfx2/source/doc/**` |

Names do not have to reproduce `.cxx` mechanically, but every TypeScript file must have one upstream-equivalent responsibility. A TypeScript split is acceptable when it exposes the same owner and contract; combining unrelated upstream owners is not.

## 9. Dependency-ordered work plan

### WP0 — Rebuild inventory and parity truth

Priority: P0. Dependencies: none.

Work:

1. Replace boolean-authored parity closure with maturity states: `discovered`, `mapped`, `implemented`, `verified-contract`, `verified-behavior`, `verified-default`, `parity`.
2. Reset unsupported 35/35 closure claims to the highest evidenced state.
3. Make every assertion atomic and identify preconditions, operation, expected state/output, local executable test, and upstream oracle.
4. Separate provenance checks from semantic verification scripts and reports.
5. Remove irrelevant source-symbol mappings and review every filename-divergence allowance.
6. Generate contradiction checks between `runtime-inventory.json`, command-slice records, parity matrix, and closure reports.

Acceptance:

- a record cannot reach parity through marker presence or manually set booleans;
- no capability claims a wider behavior than its named tests;
- runtime and capability summaries agree by construction;
- all known deviations in this document appear as tracked gaps.

### WP1 — Restore Sfx command/frame contracts

Priority: P0. Dependencies: WP0 schema available.

Work:

1. Introduce upstream-owned `SfxDispatcher`, shell stack, slot lookup, `SfxRequest`, `SfxBindings`, and view frame under `sfx2`.
2. Replace custom `undoPolicy`, target, and presentation execution metadata with slot metadata plus handler/state methods.
3. Generate typed slot IDs/URLs and command resources from pinned SDI/HRC/XML inputs.
4. Keep React menu/toolbar adapters as consumers of binding state.
5. Treat browser-only actions as explicitly non-UNO slots.

Acceptance:

- Writer handlers expose upstream-like execute/state entry points;
- enablement and checked state come from bindings/shell state, not component-local inference;
- dispatch tests cover shell priority, disabled slots, arguments, result/error, and invalidation;
- `framework/source/dispatch` no longer owns Sfx core classes.

### WP2 — Canonicalize Writer positions, text, and mutations

Priority: P0. Dependencies: WP1 request/slot contract for command-facing tests.

Work:

1. Remove paragraph IDs from core shell APIs and use `SwPosition`/`SwPaM`/node indexes.
2. Make text plus hints/items canonical; reduce `WriterTextRun` to a derived boundary DTO.
3. Move insert/delete/replace/split/join/copy/move behavior into `DocumentContentOperationsManager` and corresponding upstream-shaped helpers.
4. Rebase undo objects on Writer ranges and operation state.
5. Translate DOM selections and `beforeinput` actions entirely in the browser editor controller.
6. Add index-registry tests for every mutation and undo/redo direction.

Acceptance:

- no `sw/source/core/**` or `sw/source/uibase/**` public model API accepts DOM input types or presentation IDs;
- all mutations flow through the content-operations interface;
- nested selections, grapheme boundaries, split/join, and index updates match source-derived golden cases;
- UI projection can be recreated from the document without loss of authoritative state.

### WP3 — Complete the implemented item, style, font, and numbering defaults

Priority: P0. Dependencies: WP2 canonical attributes.

Work:

1. Define the minimum upstream `WhichId`/pool-item set needed by every currently visible command and ODT property.
2. Port the corresponding style construction branches from `DocumentStylePoolManager.cxx` and `poolfmt.cxx`, including Western/CJK/CTL and HTML-mode choices where relevant.
3. Implement inheritance and computed item-set resolution; delete style-by-slug CSS semantics.
4. Model browser font substitution separately from requested Writer defaults.
5. Expand numbering structures only to the exact current feature surface, preserving upstream field names, defaults, invalidation, and restart behavior.

Acceptance:

- every implemented built-in style has a source-derived default table and differential test;
- paragraph rendering depends only on computed projection values;
- requested font, resolved device font, and serialized font are distinguishable;
- list marker, indent, restart, promote/demote, and undo tests cover all supported levels and defaults.

### WP4 — Decompose shells and view by upstream ownership

Priority: P1. Dependencies: WP1-WP3.

Work:

1. Split `writercommands.ts` into generated slot declarations and text/list/view/document handlers.
2. Split `wrtsh.ts` according to upstream Writer shell responsibilities.
3. Strip React projections, workflow ports, and storage snapshots from `SwView`.
4. Move text-run projection helpers out of `SwTextNode` implementation.
5. Add inner-module dependency enforcement for core, uibase, filter, and browser layers.

Acceptance:

- each upstream-shaped file has a documented one-to-one or narrowly justified many-to-one responsibility mapping;
- core and uibase pass a browser-import prohibition;
- no catch-all module remains responsible for unrelated command, persistence, presentation, and model behavior.

### WP5 — Align document lifecycle, filters, workers, and recovery

Priority: P1. Dependencies: WP2 canonical import operations and WP4 ownership.

Work:

1. Recenter load/save state transitions on `SfxObjectShell` and `SfxMedium`; retain Writer-specific hooks in `SwDocShell`.
2. Separate durable recovery schema, worker DTO, and live document graph.
3. Make filter services mutate/build documents only through canonical Writer operations.
4. Split ODT parity records by package stream and XML property; define preservation or rejection for unsupported content.
5. Test cancellation, malformed/oversized inputs, modified-state transitions, recovery generations, and failed-save rollback.
6. Decide whether unsupported but parseable XML is preserved opaquely or explicitly rejected; never silently drop it under a round-trip claim.

Acceptance:

- opening, saving, export, primary persistence, and recovery have distinct typed contracts;
- a worker round trip does not redefine canonical document identity;
- ODT verification identifies exactly which elements/attributes and defaults match upstream;
- lifecycle states and error behavior match source-derived transition tables.

### WP6 — Remove UI adapters that own domain behavior

Priority: P1. Dependencies: WP1, WP3-WP5.

Work:

1. Replace hard-coded style/list formatting with computed Writer projection data.
2. Make paragraph/run/list segment identities stable and remove version-only rerender plumbing and O(n²) keys.
3. Replace string-based error handling with typed localized errors.
4. Expose style lists, command availability, checked state, recovery state, and document status through binding-backed view models.
5. Choose and name the supported layout contract: continuous browser view now, paginated Writer layout only after a real layout model exists.
6. Keep React components declarative and free of Writer mutation/default logic.

Acceptance:

- component tests can render from typed projections without importing style pools or document managers;
- all visible command state is traceable to Sfx/Writer state;
- no UI CSS rule supplies a semantic default that is absent from the model;
- accessibility, IME, selection, clipboard, and keyboard e2e behavior remains intact.

### WP7 — Differential verification and parity promotion

Priority: P0 quality gate. Dependencies: each preceding package promotes its own records; final closure depends on all.

Work:

1. Build source-derived golden tables for constants/defaults and small deterministic state transitions.
2. Where buildable, run equivalent upstream tests or a minimal LibreOffice oracle that emits normalized fixtures.
3. Add contract-shape checks for slots, item IDs, style IDs, numbering values, filter properties, and lifecycle states.
4. Add behavioral traces for command -> request -> shell -> model -> undo -> state invalidation.
5. Require independent review of every parity promotion and store the exact baseline commit with evidence.

Acceptance:

- `parity` means all applicable dimensions pass executable evidence against the pinned baseline;
- no unresolved class-B architectural divergence remains in an upstream-mechanism module;
- class-A browser adaptations have explicit boundary tests and no reverse dependency;
- generated inventories fail on contradictory claims or stale evidence.

## 10. Verification strategy

Use the cheapest reliable oracle for each concern:

1. **Constants and defaults:** extract normalized JSON from pinned enums, constructors, style builders, and command resources; compare exact values locally.
2. **Pure state transitions:** run table-driven local tests from upstream cases for nodes, positions, hints, lists, undo, dispatcher, and lifecycle.
3. **Round trips:** maintain minimal ODT fixtures per supported XML property and compare normalized model/XML results, not byte identity.
4. **Command traces:** assert slot ID, state query, request arguments, handler owner, model delta, undo delta, and invalidation sequence.
5. **Boundary tests:** prove that DOM/React/browser storage types terminate at their adapters.
6. **Static architecture:** enforce imports and responsibility mappings, including negative checks for browser types in core/uibase.
7. **UI/e2e:** preserve user-visible parity for supported commands, selection, IME, clipboard, lists, hyperlinks, open/save/recovery, and accessibility.
8. **Evidence integrity:** hash the upstream file/commit and local test artifact; invalidate verification when either changes.

Each capability record must link one local executable assertion to one of:

- an upstream executable test and normalized result;
- an extracted source-derived default/contract table;
- a reviewed behavioral trace whose upstream branches are cited precisely.

Manual inspection may establish mapping and responsibility but cannot alone establish behavior parity.

## 11. Explicit exclusions for the current program

The following are not required to bring the currently implemented portion to parity:

- Calc, Impress, Draw, Base, Math, and Chart functionality beyond honest placeholder/unsupported presentation;
- native VCL widget architecture, native accessibility bridges, desktop window management, and platform menu integration;
- native printing, system dialogs, OS clipboard internals, and native file locking where no browser equivalent is required;
- UNO extension loading, macros, scripting, Java integration, and desktop plugin discovery;
- database, collaboration server, mail merge, and other modules with no implemented browser feature;
- complete Writer pagination/layout, tables, images, fields, change tracking, comments, embedded objects, signatures, and encryption until a product requirement adds them.

Exclusion means “not implemented and not claimed,” not “implemented with different defaults.” Shared lower-level contracts needed by the current slice remain in scope even if their broader consumers are excluded.

## 12. Risks and controls

| Risk | Control |
| --- | --- |
| Large refactors break already working browser behavior | Land dependency-ordered slices with old/new trace comparison and e2e gates. |
| Blind C++ transliteration produces unusable TypeScript | Preserve contracts, ownership, data, defaults, and state machines; adapt memory/lifetime syntax explicitly. |
| React needs stable identities not exposed by upstream | Keep identity maps in the projection adapter, keyed by node object/index generations, never in the canonical API. |
| Browser APIs force async contracts | Put async at medium/filter/platform boundaries; do not make core Writer operations browser-aware. |
| ODT scope expands accidentally | Use property-level capability records and explicit unsupported-content policy. |
| Generated upstream data becomes stale | Pin generators and evidence to the baseline commit and make drift fail CI. |
| “Upstream-like” paths hide local semantics | Require responsibility review plus executable parity evidence, not path checks alone. |
| Default parity varies by locale/font availability | Test requested upstream default separately from device substitution and cover Western/CJK/CTL branches. |

## 13. Completion criteria

The current implemented scope is upstream-parity-ready only when all of the following are true:

1. Every production module is classified as upstream mechanism, browser adaptation, or local infrastructure with a reviewed responsibility boundary.
2. Every implemented capability has non-contradictory contract, behavior, default, and responsibility evidence.
3. No core or uibase module depends on React, DOM event names, IndexedDB, browser workers, or presentation IDs.
4. Writer state is canonical in `SwDoc`/nodes/positions/hints/items/managers; runs and snapshots are derived boundary representations.
5. Commands flow through Sfx slots, requests, shells, bindings, and state invalidation owned by the corresponding modules.
6. Current style, font, and numbering behavior is produced by source-derived model defaults rather than UI CSS or local convenience defaults.
7. Writer document mutations flow through the upstream-equivalent content-operations interface and preserve indexes and undo semantics.
8. `SwDocShell`, `SfxObjectShell`, `SfxMedium`, filters, workers, storage, and recovery have distinct upstream-aligned responsibilities.
9. ODT claims are property-level, loss behavior is explicit, and each verified property has import/export/default evidence.
10. React remains a replaceable presentation adapter and retains functional parity for all supported user-visible operations.
11. Source-tree and dependency checks enforce inner-layer ownership, not merely file presence.
12. The parity report contains no manually asserted green status, unresolved contradictory inventory, or unjustified architectural divergence.

## 14. Recommended execution order

Start with WP0 and do not use the existing 35/35 result as a release gate. Then execute WP1 and WP2 in sequence, followed by WP3. Those packages establish the command, identity, mutation, and default contracts on which the remaining cleanup depends. WP4 and WP5 may proceed in parallel only after those contracts stabilize. WP6 follows their public adapters. WP7 is continuous for every package and becomes the final promotion gate.

The immediate first implementation milestone should be deliberately small: one end-to-end text command (for example `.uno:Bold`) must travel through the new Sfx slot/request/bindings path, operate on `SwPaM` via canonical content/attribute operations, derive its UI state from bindings, undo correctly, serialize correctly, and pass a source-derived contract/default trace. That slice establishes the pattern before the remaining commands are migrated.
