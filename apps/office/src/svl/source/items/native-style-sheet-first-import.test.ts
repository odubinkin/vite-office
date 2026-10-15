/** @fileoverview Independent derived-owner-first import must not require prior facade or core-owner initialization. */
import { expect, it } from "vitest";
import { SfxStyleSheet, SfxStyleSheetPool } from "./style-sheet";
import { SfxItemPool } from "./itempool";
import { SfxStyleFamily } from "../../inc/style-values";
import { OUString } from "../../../sal/inc/rtl/ustring";
it("initializes actual derived owners from their implementation entry", /** Constructs the actual native field factory before any facade import. @returns Nothing. */ () => {
  const items = new SfxItemPool(),
    pool = new SfxStyleSheetPool(items),
    name = new OUString(),
    style = pool.Make(name, SfxStyleFamily.Char);
  expect(style).toBeInstanceOf(SfxStyleSheet);
  expect(style.GetPool()).toBe(pool);
  pool.Dispose();
  style.Dispose();
  name.dispose();
});
