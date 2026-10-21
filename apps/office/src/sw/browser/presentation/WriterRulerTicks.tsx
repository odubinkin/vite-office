/** @fileoverview Browser font measurement and native ruler tick presentation. */
import { useCallback, useState } from "react";
import type { RulerUnitData } from "../../../svtools/source/control/ruler";
import { getRulerMaximumLabel, projectWriterRulerTicks } from "./writer-ruler-ticks";

/** Projects source tick density using actual browser label measurement. @param props - Native unit and physical axis. @returns Tick layer. */
export function WriterRulerTicks({
  lengthTwips,
  orientation,
  originTwips,
  unitData,
}: Readonly<{
  lengthTwips: number;
  orientation: "horizontal" | "vertical";
  originTwips: number;
  unitData: RulerUnitData;
}>): React.JSX.Element {
  const [measurement, setMeasurement] = useState({ textWidth: 0, crossSize: 32 });
  const measure = useCallback(
    /** Measures native maximum-number text in this ruler's actual browser font. @param element - Measured label node. @returns Optional observer cleanup. */
    (surface: HTMLDivElement | null) => {
      if (surface === null) return;
      // This component always authors the font sample as its first child.
      const measuredSurface = surface;
      const label = measuredSurface.firstElementChild as HTMLSpanElement;
      /** Reads browser layout after font or geometry changes. @returns Nothing. */
      function update(): void {
        const bounds = measuredSurface.getBoundingClientRect();
        setMeasurement({
          textWidth: label.getBoundingClientRect().width,
          crossSize: orientation === "horizontal" ? bounds.height : bounds.width,
        });
      }
      update();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(update);
      observer.observe(label);
      observer.observe(measuredSurface);
      return /** Releases the label's layout observer. @returns Nothing. */ () =>
        observer.disconnect();
    },
    [orientation],
  );
  const ticks = projectWriterRulerTicks(
    unitData,
    lengthTwips,
    originTwips,
    measurement.textWidth,
    measurement.crossSize,
  );
  return (
    <div ref={measure} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="invisible absolute whitespace-nowrap">
        {getRulerMaximumLabel(unitData, lengthTwips)}
      </span>
      {ticks.map(
        /** Paints one admitted native tick. @param tick - Browser projection. @returns Tick node. */ (
          tick,
        ) => (
          <span
            className="absolute border-slate-400"
            key={tick.index}
            data-ruler-tick={tick.index}
            style={
              orientation === "horizontal"
                ? { left: tick.position, top: 0, height: "100%", width: 0 }
                : { top: tick.position, left: 0, width: "100%", height: 0 }
            }
          >
            {tick.label === "" ? (
              <span
                className="absolute border-slate-400"
                style={
                  orientation === "horizontal"
                    ? {
                        borderLeftWidth: 1,
                        height: tick.length,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }
                    : {
                        borderTopWidth: 1,
                        width: tick.length,
                        left: "50%",
                        transform: "translateX(-50%)",
                      }
                }
              />
            ) : (
              <>
                <span
                  className="absolute border-slate-400"
                  style={
                    orientation === "horizontal"
                      ? { borderLeftWidth: 1, height: 1, top: 3 }
                      : { borderTopWidth: 1, width: 1, left: 3 }
                  }
                />
                <span
                  className="absolute border-slate-400"
                  style={
                    orientation === "horizontal"
                      ? { borderLeftWidth: 1, height: 1, bottom: 3 }
                      : { borderTopWidth: 1, width: 1, right: 3 }
                  }
                />
                <span
                  className="absolute"
                  style={
                    orientation === "horizontal"
                      ? { top: "50%", transform: "translate(-50%, -50%)" }
                      : { left: "50%", transform: "translate(-50%, -50%) rotate(-90deg)" }
                  }
                >
                  {tick.label}
                </span>
              </>
            )}
          </span>
        ),
      )}
    </div>
  );
}
