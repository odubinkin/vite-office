/** @fileoverview Browser controls for the Rotation and Scaling group of the native Character Position page. */
import { useState } from "react";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";

/** Presents the original rotation radios, available Fit to Line item and scale field. @param props - Values from the native input set. @returns Rotation and Scaling group. */
export function WriterCharacterScalingControls({
  rotation,
  fitToLine,
  fitScale,
  scale,
  showRotation,
}: Readonly<{
  rotation: number | undefined;
  fitToLine: boolean;
  fitScale: number | undefined;
  scale: number;
  showRotation: boolean;
}>): React.JSX.Element {
  const localization = useBrowserLocalization();
  const [angle, setAngle] = useState(rotation);
  const [fit, setFit] = useState(fitToLine);
  const [width, setWidth] = useState(String(scale));
  return (
    <fieldset className="mt-3 grid gap-2">
      <legend>
        {showRotation
          ? localization.GetText("writer.character.rotation-scaling", "Rotation / Scaling")
          : localization.GetText("writer.character.scale-width", "Scaling")}
      </legend>
      {showRotation && (
        <>
          <div
            role="group"
            aria-label={localization.GetText("writer.character.rotation", "Rotation")}
            className="flex flex-wrap gap-3"
          >
            {[0, 900, 2700].map(
              /** Renders one original degree choice. @param value - Angle in tenths of a degree. @returns Rotation radio. */
              (value) => (
                <label key={value} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="rotation"
                    value={value}
                    checked={angle === value}
                    onChange={
                      /** Changes the native rotation angle. @returns Nothing. */
                      () => setAngle(value)
                    }
                  />
                  {value / 10}°
                </label>
              ),
            )}
          </div>
          <input type="hidden" name="rotationFit" value={String(fit)} />
          {fitScale !== undefined && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fit}
                disabled={angle === 0}
                onChange={
                  /** Switches between the supplied selection scale and the original scale. @param event - Native checkbox event. @returns Nothing. */
                  (event) => {
                    const checked = event.currentTarget.checked;
                    setFit(checked);
                    setWidth(String(checked ? fitScale : scale));
                  }
                }
              />
              {localization.GetText("writer.character.fit-to-line", "Fit to line")}
            </label>
          )}
        </>
      )}
      <label className="grid gap-1 text-sm">
        {localization.GetText("writer.character.scale-width", "Scaling")}
        <input
          type="number"
          name="scaleWidth"
          min={1}
          max={999}
          step={1}
          value={width}
          className="rounded border border-slate-300 px-2 py-1"
          onChange={
            /** Stores the current scale spin text. @param event - Native numeric input. @returns Nothing. */
            (event) => setWidth(event.currentTarget.value)
          }
        />
      </label>
    </fieldset>
  );
}
