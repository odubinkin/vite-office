# Browser document ports

`svl/source/misc/storage.ts` defines shell-neutral ports for choosing an
external file and exporting bytes or text through browser APIs. It does not
define a JSON snapshot format or a primary persistence adapter.

Primary Writer and Calc persistence uses raw XML streams documented in
[Browser IndexedDB XML storage](indexeddb-storage-adapter.md).
