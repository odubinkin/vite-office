# Browser Command Registry

[`apps/office/src/framework/source/dispatch/dispatchprovider.ts`](../../apps/office/src/framework/source/dispatch/dispatchprovider.ts)
defines the initial shared command contract. It registers typed handlers sharing
a caller-defined context, validates stable IDs and shortcut collisions, and
normalizes modifier aliases and ordering deterministically. For example,
`shift + ctrl + g` becomes `Ctrl+Shift+G`.

`dispatchCommand` returns an explicit `executed`, `disabled`, or `missing`
outcome. It does not install browser key listeners, mutate application state,
or supply menus, toolbars, undo/redo, localization, persistence, macros, or
suite-specific commands. No upstream parity row is advanced by this foundation.

The Writer menu module also exports the complete `writerUserCommands` inventory:
31 visible command IDs, labels, and domain-agnostic capability IDs. The Stage 0
runtime validator rejects duplicate IDs, unknown capability references, or a
visible command omitted from that registry. This is an audit surface rather
than a second dispatch implementation; command handlers remain in their
existing Writer shells and view composition.

The Writer workbench uses a separate browser-event adapter before dispatching
through this registry. Ctrl or Meta Z invokes Undo; Ctrl or Meta Shift Z invokes
Redo when the matching history command is enabled. A browser default is
prevented only after a command executes. Custom bindings and other global
shortcuts remain separate work.
