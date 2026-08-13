# Browser Command Registry

[`apps/office/src/framework/source/dispatch/commands.ts`](../../apps/office/src/framework/source/dispatch/commands.ts)
defines the initial shared command contract. It registers typed handlers sharing
a caller-defined context, validates stable IDs and shortcut collisions, and
normalizes modifier aliases and ordering deterministically. For example,
`shift + ctrl + g` becomes `Ctrl+Shift+G`.

`dispatchCommand` returns an explicit `executed`, `disabled`, or `missing`
outcome. It does not install browser key listeners, mutate application state,
or supply menus, toolbars, undo/redo, localization, persistence, macros, or
suite-specific commands. No upstream parity row is advanced by this foundation.

The Writer workbench uses a separate browser-event adapter before dispatching
through this registry. Ctrl or Meta Z invokes Undo; Ctrl or Meta Shift Z invokes
Redo when the matching history command is enabled. A browser default is
prevented only after a command executes. Custom bindings and other global
shortcuts remain separate work.
