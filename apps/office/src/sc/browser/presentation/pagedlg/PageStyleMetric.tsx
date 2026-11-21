/** @fileoverview Native metric field presentation shared by Calc page-style tabs. */
import { MetricSpinButton } from "../../../../svtools/browser/control/MetricSpinButton";
import { FieldUnit } from "../../../../tools/inc/fldunit";

/** Metric binding for original page style lengths in twips. */
interface PageStyleMetricProps {
  readonly label: string;
  readonly value: number;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly unit: FieldUnit;
  readonly onChange: (value: number) => void;
}

/** Presents the shared native metric spinner with a visible label. @param props - Field values and limits. @returns Metric widget. */
export function PageStyleMetric({
  label,
  value,
  minimum = 0,
  maximum = 65535,
  unit,
  onChange,
}: PageStyleMetricProps): React.JSX.Element {
  return (
    <label className="grid min-w-0 gap-1">
      {label}
      <MetricSpinButton
        aria-label={label}
        unit={unit}
        value={value}
        minimum={minimum}
        maximum={maximum}
        onValueChange={onChange}
        className="min-w-0 rounded-md border border-slate-300 px-2 py-1.5 disabled:bg-slate-100"
      />
    </label>
  );
}
