# Browser Command Registry

[`apps/office/src/domain/commands.ts`](../../apps/office/src/domain/commands.ts)
defines the initial shared command contract. It registers typed handlers sharing
a caller-defined context, validates stable IDs and shortcut collisions, and
normalizes modifier aliases and ordering deterministically. For example,
`shift + ctrl + g` becomes `Ctrl+Shift+G`.

`dispatchCommand` returns an explicit `executed`, `disabled`, or `missing`
outcome. It does not install browser key listeners, mutate application state,
or supply menus, toolbars, undo/redo, localization, persistence, macros, or
suite-specific commands. No upstream parity row is advanced by this foundation.
