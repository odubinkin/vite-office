/** @fileoverview Original additions.hxx list of configuration node paths; native vector storage syntax uses ordinary JS arrays, with value copies performed by actual consumers. */
import type { OUString } from "../../sal/inc/rtl/ustring";

/** Original vector<vector<OUString>> path-list responsibility; no allocator or implicit C++ copy/ABI emulation. */
export type Additions = OUString[][];
