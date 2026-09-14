# Browser Command Registry

[`apps/office/src/framework/source/dispatch/dispatchprovider.ts`](../../apps/office/src/framework/source/dispatch/dispatchprovider.ts)
defines the initial shared command contract. It registers typed handlers sharing
a caller-defined context, validates stable IDs and shortcut collisions, and
normalizes modifier aliases and ordering deterministically. For example,
`shift + ctrl + g` becomes `Ctrl+Shift+G`.

`dispatchCommand` returns an explicit `executed`, `disabled`, or `missing`
outcome. Descriptors also carry label keys, state/check/radio semantics,
argument contracts, resource placement references, keyboard bindings, and
execution-shell ownership. `SfxDispatcher` publishes pending and error state
for asynchronous commands through the same query contract.

The Writer menu module also exports the complete `writerUserCommands` inventory:
31 visible command IDs, labels, and domain-agnostic capability IDs. The Stage 0
runtime validator rejects duplicate IDs, unknown capability references, or a
visible command omitted from that registry. This is an audit surface rather
than a second dispatch implementation; command handlers remain in their
existing Writer shells and view composition.

The Writer workbench uses separate browser selection and accelerator adapters
before dispatching through this registry. Menus, toolbars, selectors, and
shortcuts resolve the same descriptors and state; `WriterWorkbench` does not
translate formatting values to command IDs or thread per-command callbacks
through the React tree.
