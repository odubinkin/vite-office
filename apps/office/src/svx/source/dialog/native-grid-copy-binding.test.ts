/** @fileoverview Native implicit base-copy construction does not invoke a hidden derived assignment method. */
import { expect, it } from "vitest";
import { SvxOptionsGrid } from "../../inc/optgrid";
it("copies actual base fields without invoking hidden derived assignment", /** Checks native nonvirtual constructor binding. @returns Nothing. */ () => {
  /** Legal derived API hiding over a real shared initialized base. */
  class Hidden extends SvxOptionsGrid {
    /** Hidden assignment must not be invoked by the base copy constructor. @param source - Value. @returns Never. */
    override copy_assign(source: Readonly<SvxOptionsGrid>): this {
      void source;
      throw Error("hidden assignment");
    }
    /** Hidden query cannot change copied native fields. @returns Distinct value. */
    override GetFieldDrawX(): number {
      return 999;
    }
  }
  const source = new SvxOptionsGrid();
  source.SetFieldDrawX(4321);
  source.SetUseGridSnap(true);
  const copy = new Hidden(source);
  expect(copy.GetFieldDrawX()).toBe(999);
  expect(SvxOptionsGrid.prototype.GetFieldDrawX.call(copy)).toBe(4321);
  expect(copy.GetUseGridSnap()).toBe(true);
  const other = new SvxOptionsGrid(copy);
  expect(other.GetFieldDrawX()).toBe(4321);
  expect(other.GetUseGridSnap()).toBe(true);
});
