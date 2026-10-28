/** @fileoverview Original ICU78.3 CalendarAstronomer solar/lunar algorithms and event solver from astro.cpp. Constants, operation order, convergence thresholds and original recursive divergence retry are retained. */
import { uprv_getUTCtime } from "../common/putil";
export { CalendarCache } from "./astro.cache";
const PI = Math.PI,
  PI2 = PI * 2,
  DAY_MS = 86400000,
  TROPICAL_YEAR = 365.242191;
/** Original floor-based normalization. @param value - Value. @param range - Period. @returns Normalized value. */
function normalize(value: number, range: number): number {
  return value - range * Math.floor(value / range);
}
/** Original zero-to-two-pi angle. @param angle - Radians. @returns Normalized angle. */
function norm2PI(angle: number): number {
  return normalize(angle, PI2);
}
/** Original minus-pi-to-pi angle. @param angle - Radians. @returns Normalized angle. */
function normPI(angle: number): number {
  return normalize(angle + PI, PI2) - PI;
}
/** Original Kepler iteration and true anomaly. @param meanAnomaly - Angle. @param eccentricity - Orbit parameter. @returns True anomaly. */
function trueAnomaly(meanAnomaly: number, eccentricity: number): number {
  let delta: number,
    E = meanAnomaly;
  do {
    delta = E - eccentricity * Math.sin(E) - meanAnomaly;
    E = E - delta / (1 - eccentricity * Math.cos(E));
  } while (Math.abs(delta) > 1e-5);
  return 2 * Math.atan(Math.tan(E / 2) * Math.sqrt((1 + eccentricity) / (1 - eccentricity)));
}
/** Original coordinate value retained as one cached subobject. */
export class Equatorial {
  /** Original coordinate construction. @param ascension - Right ascension. @param declination - Declination. @returns Coordinates. */
  constructor(
    public ascension = 0,
    public declination = 0,
  ) {}
  /** Original coordinate setter. @param ascension - Right ascension. @param declination - Declination. @returns Nothing. */
  set(ascension: number, declination: number): void {
    this.ascension = ascension;
    this.declination = declination;
  }
}
/** Original MoonAge value. */
export class MoonAge {
  /** Original value construction. @param value - Angle. @returns Value. */
  constructor(public value: number) {}
  /** Original setter. @param value - Angle. @returns Nothing. */
  set(value: number): void {
    this.value = value;
  }
}
/** Original polymorphic event-angle callback. */
export abstract class AngleFunc {
  /** Evaluates the original astronomer. @param a - Owner. @returns Radians. */
  abstract eval(a: CalendarAstronomer): number;
}
/** Original solar event callback. */
class SunTimeAngleFunc extends AngleFunc {
  /** Original solar longitude query. @param a - Owner. @returns Radians. */
  eval(a: CalendarAstronomer): number {
    return a.getSunLongitude();
  }
}
/** Original lunar event callback. */
class MoonTimeAngleFunc extends AngleFunc {
  /** Original moon age query. @param a - Owner. @returns Radians. */
  eval(a: CalendarAstronomer): number {
    return a.getMoonAge();
  }
}
/** Original astronomer, retaining cache invalidation and event-solver time mutation. */
export class CalendarAstronomer {
  static readonly PI = PI;
  static readonly SYNODIC_MONTH = 29.530588853;
  private fTime: number;
  private julianDay = NaN;
  private sunLongitude = NaN;
  private meanAnomalySun = NaN;
  private moonEclipLong = NaN;
  private readonly moonPosition = new Equatorial(0, 0);
  private moonPositionSet = false;
  /** Original default platform-clock or explicit-time construction. @param time - UTC milliseconds. @returns Owner. */
  constructor(time = uprv_getUTCtime()) {
    this.fTime = time;
    this.clearCache();
  }
  /** Original time setter invalidates all scalar caches and moon-position flag. @param time - UTC milliseconds. @returns Nothing. */
  setTime(time: number): void {
    this.fTime = time;
    this.clearCache();
  }
  /** Original stored-time query. @returns UTC milliseconds. */
  getTime(): number {
    return this.fTime;
  }
  /** Original cached Julian day. @returns Fractional Julian day. */
  getJulianDay(): number {
    if (Number.isNaN(this.julianDay)) this.julianDay = (this.fTime - -210866760000000) / DAY_MS;
    return this.julianDay;
  }
  /** Original ecliptic-to-equatorial conversion writes the supplied coordinate value. @param result - Output owner. @param longitude - Ecliptic longitude. @param latitude - Ecliptic latitude. @returns Same output. */
  eclipticToEquatorial(result: Equatorial, longitude: number, latitude: number): Equatorial {
    const obliq = this.eclipticObliquity(),
      sinE = Math.sin(obliq),
      cosE = Math.cos(obliq),
      sinL = Math.sin(longitude),
      cosL = Math.cos(longitude),
      sinB = Math.sin(latitude),
      cosB = Math.cos(latitude),
      tanB = Math.tan(latitude);
    result.set(
      Math.atan2(sinL * cosE - tanB * sinE, cosL),
      Math.asin(sinB * cosE + cosB * sinE * sinL),
    );
    return result;
  }
  /** Original cached solar longitude. @returns Radians. */
  getSunLongitude(): number;
  /** Original explicit-day solar longitude/anomaly outputs. @param day - Julian day. @param longitude - Longitude output. @param meanAnomaly - Anomaly output. @returns Nothing. */
  getSunLongitude(day: number, longitude: [number], meanAnomaly: [number]): void;
  /** Original overload implementation retains cached computation through the explicit-day overload. @param day - Optional Julian day. @param longitude - Optional output. @param meanAnomaly - Optional output. @returns Cached radians or nothing. */
  getSunLongitude(day?: number, longitude?: [number], meanAnomaly?: [number]): number | void {
    if (day === undefined) {
      if (Number.isNaN(this.sunLongitude)) {
        const lon: [number] = [0],
          mean: [number] = [0];
        this.getSunLongitude(this.getJulianDay(), lon, mean);
        this.sunLongitude = lon[0];
        this.meanAnomalySun = mean[0];
      }
      return this.sunLongitude;
    }
    const elapsed = day - 2447891.5,
      epochAngle = norm2PI((PI2 / TROPICAL_YEAR) * elapsed),
      mean = norm2PI(epochAngle + (279.403303 * PI) / 180 - (282.768422 * PI) / 180);
    (meanAnomaly as [number])[0] = mean;
    (longitude as [number])[0] = norm2PI(trueAnomaly(mean, 0.016713) + (282.768422 * PI) / 180);
  }
  /** Original winter-solstice angle. @returns Radians. */
  static WINTER_SOLSTICE(): number {
    return (PI * 3) / 2;
  }
  /** Original solar event search to a one-minute threshold. @param desired - Target angle. @param next - Direction. @returns Event UTC and updated stored time. */
  getSunTime(desired: number, next: boolean): number {
    return this.timeOfAngle(new SunTimeAngleFunc(), desired, TROPICAL_YEAR, 60000, next);
  }
  /** Original moon-position calculation retains all correction terms and cached coordinate identity. @returns Borrowed const coordinates. */
  getMoonPosition(): Readonly<Equatorial> {
    if (!this.moonPositionSet) {
      this.getSunLongitude();
      const day = this.getJulianDay() - 2447891.5;
      const meanLongitude = norm2PI(((13.1763966 * PI) / 180) * day + (318.351648 * PI) / 180);
      let anomaly = norm2PI(meanLongitude - ((0.1114041 * PI) / 180) * day - (36.34041 * PI) / 180);
      const evection =
          ((1.2739 * PI) / 180) * Math.sin(2 * (meanLongitude - this.sunLongitude) - anomaly),
        annual = ((0.1858 * PI) / 180) * Math.sin(this.meanAnomalySun),
        a3 = ((0.37 * PI) / 180) * Math.sin(this.meanAnomalySun);
      anomaly += evection - annual - a3;
      const center = ((6.2886 * PI) / 180) * Math.sin(anomaly),
        a4 = ((0.214 * PI) / 180) * Math.sin(2 * anomaly);
      let longitude = meanLongitude + evection + center - annual + a4;
      const variation = ((0.6583 * PI) / 180) * Math.sin(2 * (longitude - this.sunLongitude));
      longitude += variation;
      let node = norm2PI((318.510107 * PI) / 180 - ((0.0529539 * PI) / 180) * day);
      node -= ((0.16 * PI) / 180) * Math.sin(this.meanAnomalySun);
      const y = Math.sin(longitude - node),
        x = Math.cos(longitude - node);
      this.moonEclipLong = Math.atan2(y * Math.cos((5.145366 * PI) / 180), x) + node;
      const latitude = Math.asin(y * Math.sin((5.145366 * PI) / 180));
      this.eclipticToEquatorial(this.moonPosition, this.moonEclipLong, latitude);
      this.moonPositionSet = true;
    }
    return this.moonPosition;
  }
  /** Original moon age forces position calculation before reading its scalar cache. @returns Radians0..2pi. */
  getMoonAge(): number {
    this.getMoonPosition();
    return norm2PI(this.moonEclipLong - this.sunLongitude);
  }
  /** Original new-moon value. @returns Owned angle. */
  static NEW_MOON(): MoonAge {
    return new MoonAge(0);
  }
  /** Original lunar event search. @param desired - Phase. @param next - Direction. @returns Event UTC and updated stored time. */
  getMoonTime(desired: Readonly<MoonAge>, next: boolean): number {
    return this.timeOfAngle(
      new MoonTimeAngleFunc(),
      desired.value,
      CalendarAstronomer.SYNODIC_MONTH,
      60000,
      next,
    );
  }
  /** Original iterative event solver, including its source divergence retry by one-eighth period. @param func - Actual callback. @param desired - Desired angle. @param periodDays - Source average period. @param epsilon - Source threshold. @param next - Direction. @returns Event UTC. */
  private timeOfAngle(
    func: AngleFunc,
    desired: number,
    periodDays: number,
    epsilon: number,
    next: boolean,
  ): number {
    let lastAngle = func.eval(this);
    const deltaAngle = norm2PI(desired - lastAngle);
    let deltaT = ((deltaAngle + (next ? 0 : -PI2)) * (periodDays * DAY_MS)) / PI2,
      lastDeltaT = deltaT;
    const startTime = this.fTime;
    this.setTime(this.fTime + Math.ceil(deltaT));
    do {
      const angle = func.eval(this),
        factor = Math.abs(deltaT / normPI(angle - lastAngle));
      deltaT = normPI(desired - angle) * factor;
      if (Math.abs(deltaT) > Math.abs(lastDeltaT)) {
        const delta = Math.ceil((periodDays * DAY_MS) / 8);
        this.setTime(startTime + (next ? delta : -delta));
        return this.timeOfAngle(func, desired, periodDays, epsilon, next);
      }
      lastDeltaT = deltaT;
      lastAngle = angle;
      this.setTime(this.fTime + Math.ceil(deltaT));
    } while (Math.abs(deltaT) > epsilon);
    return this.fTime;
  }
  /** Original ecliptic obliquity polynomial, retaining operation grouping. @returns Radians. */
  private eclipticObliquity(): number {
    const T = (this.getJulianDay() - 2451545) / 36525,
      e = 23.439292 - (46.815 / 3600) * T - (0.0006 / 3600) * T * T + (0.00181 / 3600) * T * T * T;
    return e * (PI / 180);
  }
  /** Original invalidation leaves coordinate storage intact while clearing its validity flag. @returns Nothing. */
  private clearCache(): void {
    this.julianDay = this.sunLongitude = this.meanAnomalySun = this.moonEclipLong = NaN;
    this.moonPositionSet = false;
  }
}
