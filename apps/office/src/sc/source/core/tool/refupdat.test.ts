/** @fileoverview Differential acceptance for original reference transpose and growth operations with native aliases and width boundaries. */
import { describe, expect, it } from "vitest";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScRefUpdate, ScRefUpdateRes } from "../inc/refupdat";
import type { ScAddressDocument } from "./address";
import native from "./native-ref-update-geometry-cases.json";

/** Builds the existing document getter view for native sheet wrapping. @param count - Positive native sheet count. @returns Getter view. */
function document(count: number): ScAddressDocument {
  return {
    /** Reads native column maximum. @returns Column bound. */
    MaxCol: () => 16383,
    /** Reads native row maximum. @returns Row bound. */
    MaxRow: () => 1048575,
    /** Reads actual table count. @returns Count. */
    GetTableCount: () => count,
  };
}
/** Restores raw six-coordinate constructor ordering. @param values - Native inputs. @returns Independent range. */
function range(values: number[]): ScRange {
  return new ScRange(...(values as [number, number, number, number, number, number]));
}

describe("ScRefUpdate original geometry", /** Registers defined native geometry acceptance. @returns Nothing. */ () => {
  it("matches every original native transpose growth and alias outcome", /** Compares complete saved outcomes through the public owner with stable receiving endpoints. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.cases).toHaveLength(20203);
    for (const state of native.cases) {
      const area = range(state.area),
        ref = range(state.what),
        dest = new ScAddress(...(state.dest as [number, number, number])),
        doc = document(state.tables);
      const first = ref.aStart,
        last = ref.aEnd;
      let output: unknown;
      switch (state.op) {
        case "D":
          output = [ScRefUpdate.DoTranspose(...first.GetVars(), doc, area, dest)];
          break;
        case "T":
          output = [ScRefUpdate.UpdateTranspose(doc, area, dest, ref), ref.GetVars()];
          break;
        case "S":
          output = [ScRefUpdate.UpdateTranspose(doc, ref, dest, ref), ref.GetVars()];
          break;
        case "B":
          output = [ScRefUpdate.UpdateTranspose(doc, area, ref.aStart, ref), ref.GetVars()];
          break;
        case "E":
          output = [ScRefUpdate.UpdateTranspose(doc, ref, ref.aEnd, ref), ref.GetVars()];
          break;
        case "A":
          output = [ScRefUpdate.UpdateGrow(ref, state.dx, state.dy, ref), ref.GetVars()];
          break;
        case "G":
          output = [ScRefUpdate.UpdateGrow(area, state.dx, state.dy, ref), ref.GetVars()];
          break;
        default:
          throw new Error(`Unknown native geometry operation ${state.op}`);
      }
      expect(output).toEqual(state.output);
      expect(ref.aStart).toBe(first);
      expect(ref.aEnd).toBe(last);
      expect(area.GetVars()).toEqual(state.area);
      expect(dest.GetVars()).toEqual(state.dest);
    }
  });
  it("retains original result values source containment and inclusive no-op updates", /** Checks native result contract and source-only updates independently of fixture machinery. @returns Nothing. */ () => {
    expect([
      ScRefUpdateRes.UR_NOTHING,
      ScRefUpdateRes.UR_UPDATED,
      ScRefUpdateRes.UR_INVALID,
      ScRefUpdateRes.UR_STICKY,
    ]).toEqual([0, 1, 2, 3]);
    const source = new ScRange(0, 0, 0, 3, 3, 0),
      outside = new ScRange(5, 5, 0, 6, 6, 0),
      doc = document(3);
    expect(ScRefUpdate.UpdateTranspose(doc, source, new ScAddress(5, 5, 0), outside)).toBe(
      ScRefUpdateRes.UR_NOTHING,
    );
    expect(outside.GetVars()).toEqual([5, 5, 0, 6, 6, 0]);
    const point = new ScRange(2, 2, 0, 2, 2, 0);
    expect(ScRefUpdate.UpdateTranspose(doc, source, new ScAddress(), point)).toBe(
      ScRefUpdateRes.UR_UPDATED,
    );
    expect(point.GetVars()).toEqual([2, 2, 0, 2, 2, 0]);
  });
  it("retains growth headers pre-mutation predicates and unclipped signed narrowing", /** Checks both growth predicates before mutation including aliased area/reference and native coordinate widths. @returns Nothing. */ () => {
    const area = new ScRange(1, 1, 0, 4, 5, 0),
      header = new ScRange(1, 2, 0, 4, 5, 0);
    expect(ScRefUpdate.UpdateGrow(area, 2, 3, header)).toBe(ScRefUpdateRes.UR_UPDATED);
    expect(header.GetVars()).toEqual([1, 2, 0, 6, 8, 0]);
    expect(area.GetVars()).toEqual([1, 1, 0, 4, 5, 0]);
    expect(ScRefUpdate.UpdateGrow(area, 2, 3, area)).toBe(ScRefUpdateRes.UR_UPDATED);
    expect(area.GetVars()).toEqual([1, 1, 0, 6, 8, 0]);
    const width = new ScRange(32760, 0, 0, 32767, 0, 0);
    expect(ScRefUpdate.UpdateGrow(width, 1, 0, width)).toBe(ScRefUpdateRes.UR_UPDATED);
    expect(width.aEnd.Col()).toBe(-32768);
    expect(
      ScRefUpdate.DoTranspose(0, 65536, 0, document(3), new ScRange(), new ScAddress()),
    ).toEqual([0, 0, 0]);
    expect(
      ScRefUpdate.DoTranspose(2, 3, 0, document(3), new ScRange(), new ScAddress(5, 6, -7)),
    ).toEqual([8, 8, 2]);
  });
});
