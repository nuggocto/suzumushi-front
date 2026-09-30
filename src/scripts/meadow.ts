// The Player's night meadow, ported from the terminal player's src/ui/stage.rs,
// src/ui/rail.rs, and src/ui/palette.rs. Each frequency band is a grass stalk
// tipped with light; paused lights drift as fireflies; stars and a moon fill
// the sky. Shapes render into a dot field, then into braille-style cells drawn
// the way a terminal draws them: round dots, and hairlines for bare stalks.

export type Rgb = readonly [number, number, number];
export type PlayerStatus = "Stopped" | "Playing" | "Paused";

export const BANDS = 32;

// Bass to treble, and start to end of a track: peach, rose, lilac, powder blue, mint.
const PASTEL: ReadonlyArray<readonly [number, Rgb]> = [
  [0, [0xff, 0xbf, 0xa3]],
  [0.25, [0xf5, 0xa9, 0xc6]],
  [0.5, [0xcd, 0xb4, 0xf6]],
  [0.75, [0xa9, 0xcc, 0xf4]],
  [1, [0xa6, 0xe9, 0xd2]],
];
const FIREFLY: Rgb = [0xff, 0xf1, 0xa8];
const MOON: Rgb = [0xff, 0xf3, 0xd6];
const STAR: Rgb = [0xd9, 0xd6, 0xf2];
const TRACK: Rgb = [0x5a, 0x60, 0x66];
const HOT_CORE: Rgb = [255, 255, 240];
const WHITE: Rgb = [255, 255, 245];

const MAX_STEP = 0.1;
const STEM_RISE_RATE = 30;
const STEM_FALL_PER_SECOND = 1.3;
const GRAVITY = 6.5;
const KICK = 0.2;
const MAX_KICK = 2;
const MAX_BALL = 1.06;
const LIFT_SECONDS = 1.6;
const COLOR_TURN_SECONDS = 0.9;
const RETURN_SECONDS = 1.1;
const RETURN_STAGGER = 0.02;
const RETURN_ARC = 0.05;
const MIN_STEM_DOTS = 2;
const TOP_MARGIN_DOTS = 3;
const BALL_LIFT_DOTS = 1.5;
const CORE = 1.15;
const TRAIL = 0.9;
const DEW = 0.5;
const HALO_RADIUS = 3;
const SKY_CELLS_PER_STAR = 15;
const MAX_STARS = 96;
const BRIGHT_STAR_EVERY = 7;
const MOON_MIN_SKY_DOTS = 12;
const MOON_GLOW_DOTS = 2.4;
export const MEADOW_MAX_ROWS = 16;

export function pastel(position: number): Rgb {
  const p = clamp(position, 0, 1);
  let upper = PASTEL.findIndex(([stop]) => stop >= p);
  if (upper < 1) upper = upper === 0 ? 1 : PASTEL.length - 1;
  const [fromStop, from] = PASTEL[upper - 1];
  const [toStop, to] = PASTEL[upper];
  return mix(from, to, (p - fromStop) / (toStop - fromStop));
}

export function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  const a = clamp(amount, 0, 1);
  return [0, 1, 2].map((c) => Math.round(from[c] + (to[c] - from[c]) * a)) as unknown as Rgb;
}

/** Dims a color with its light, and whitens the hottest cores. */
export function shade(color: Rgb, light: number): Rgb {
  const brightness = 0.18 + 0.82 * clamp(light, 0, 1);
  const heat = clamp((light - 0.9) * 3, 0, 0.4);
  return [0, 1, 2].map((c) => {
    const base = color[c] * brightness;
    return Math.round(clamp(base + (HOT_CORE[c] - base) * heat, 0, 255));
  }) as unknown as Rgb;
}

export const css = (rgb: Rgb) => `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;

function clamp(value: number, low: number, high: number) {
  return Math.min(Math.max(value, low), high);
}

const smoothstep = (v: number) => {
  const x = clamp(v, 0, 1);
  return x * x * (3 - 2 * x);
};
const smootherstep = (v: number) => {
  const x = clamp(v, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const easeOutCubic = (v: number) => 1 - (1 - clamp(v, 0, 1)) ** 3;

/** A deterministic 0..1 sequence per seed, like the player's splitmix. */
function sequence(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x9e3779b9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };
}

type Point = { x: number; y: number };
type Band = { stem: number; ball: number; velocity: number };
type Flight =
  | { kind: "attached" }
  | { kind: "drifting"; since: number }
  | { kind: "returning"; since: number; driftingSince: number };

type Firefly = {
  homeX: number;
  homeY: number;
  wander: [number, number, number];
  speed: [number, number, number];
  phase: [number, number, number, number];
  blink: number;
  arc: number;
};

const FIREFLIES: Firefly[] = Array.from({ length: BANDS }, (_, band) => {
  const next = sequence(band + 0x5eed);
  return {
    homeX: (next() - 0.5) * 0.12,
    homeY: 0.18 + 0.72 * next(),
    wander: [0.015 + 0.03 * next(), 0.03 + 0.05 * next(), 0.01 * next()],
    speed: [0.07 + 0.11 * next(), 0.1 + 0.15 * next(), 0.25 + 0.3 * next()],
    phase: [0, 0, 0, 0].map(() => Math.PI * 2 * next()) as Firefly["phase"],
    blink: 0.22 + 0.35 * next(),
    arc: next() * 2 - 1,
  };
});

type Field = { width: number; height: number; sky: number; meadow: number };

/** One stage frame: its grid, and the cells Suzu and the title keep clear. */
export type StageFrame = {
  columns: number;
  rows: number;
  titleRows: number;
  status: PlayerStatus;
  levels: number[];
  progress: number | null;
  mask: (column: number, row: number) => boolean;
};

export class Meadow {
  private bands: Band[] = Array.from({ length: BANDS }, () => ({ stem: 0, ball: 0, velocity: 0 }));
  private flight: Flight = { kind: "attached" };
  private flightFrom: Point[] = Array.from({ length: BANDS }, () => ({ x: 0, y: 0 }));
  private stalksFrom: number[] = new Array(BANDS).fill(0);
  private lastSeconds: number | null = null;
  private light = new Float32Array(0);
  private cover = new Float32Array(0);
  private color = new Uint8Array(0);

  /** Whether the scene is still moving after `status`, for frame pacing. */
  moving(status: PlayerStatus): boolean {
    return (
      status !== "Stopped" ||
      this.flight.kind !== "attached" ||
      this.bands.some((band) => band.stem > 0.002 || band.ball > 0.002)
    );
  }

  draw(
    ctx: CanvasRenderingContext2D,
    frame: StageFrame,
    cell: { width: number; height: number },
    seconds: number,
  ) {
    const meadowRows = Math.min(frame.rows - frame.titleRows, MEADOW_MAX_ROWS);
    const field: Field = {
      width: frame.columns * 2,
      height: frame.rows * 4,
      sky: (frame.rows - frame.titleRows - meadowRows) * 4,
      meadow: meadowRows * 4,
    };
    const size = field.width * field.height;
    if (this.light.length !== size) {
      this.light = new Float32Array(size);
      this.cover = new Float32Array(size);
      this.color = new Uint8Array(size * 3);
    }
    this.advance(frame.status, frame.levels, field, seconds);
    this.paint(field, seconds, frame.progress);
    ctx.clearRect(0, 0, frame.columns * cell.width, frame.rows * cell.height);
    for (let row = 0; row < frame.rows; row += 1) {
      for (let column = 0; column < frame.columns; column += 1) {
        if (frame.mask(column, row)) continue;
        drawCell(ctx, column, row, cell, (dx, dy) => {
          const index = (row * 4 + dy) * field.width + column * 2 + dx;
          return this.dotAt(index, (column * 2 + dx) % 4, (row * 4 + dy) % 4);
        });
      }
    }
  }

  private dotAt(index: number, x: number, y: number) {
    const cover = this.cover[index];
    const on = cover >= 1 || cover > ditherThreshold(x, y);
    return on
      ? {
          light: this.light[index],
          color: [
            this.color[index * 3],
            this.color[index * 3 + 1],
            this.color[index * 3 + 2],
          ] as Rgb,
        }
      : null;
  }

  private advance(status: PlayerStatus, levels: number[], field: Field, seconds: number) {
    const step = this.lastSeconds === null ? 0 : clamp(seconds - this.lastSeconds, 0, MAX_STEP);
    this.lastSeconds = seconds;
    const drifting = status === "Paused";
    const flight = this.flight;
    if (drifting && flight.kind !== "drifting") {
      this.flightFrom = this.bands.map((_, band) => this.lightAt(band, field, seconds).point);
      this.flight = { kind: "drifting", since: seconds };
    } else if (!drifting && flight.kind === "drifting") {
      this.stalksFrom = this.bands.map((band) => band.stem);
      this.flight = { kind: "returning", since: seconds, driftingSince: flight.since };
    } else if (
      flight.kind === "returning" &&
      seconds - flight.since >= RETURN_SECONDS + RETURN_STAGGER * BANDS
    ) {
      this.flight = { kind: "attached" };
    }
    const playing = status === "Playing";
    this.bands.forEach((band, index) => stepBand(band, playing ? levels[index] : 0, step));
  }

  private lightAt(
    band: number,
    field: Field,
    seconds: number,
  ): { point: Point; color: Rgb; glow: number } {
    const attached = this.attachedPoint(band, field);
    const hue = meadowColor(band);
    const flight = this.flight;
    if (flight.kind === "attached") return { point: attached, color: hue, glow: 1 };
    if (flight.kind === "drifting") return this.drift(band, seconds, flight.since);
    const drift = this.drift(band, seconds, flight.driftingSince);
    const progress = this.homecoming(band, seconds);
    const swing = Math.sin(Math.PI * progress) * RETURN_ARC * FIREFLIES[band].arc;
    return {
      point: {
        x: clamp(drift.point.x + (attached.x - drift.point.x) * progress + swing, 0, 1),
        y: drift.point.y + (attached.y - drift.point.y) * progress,
      },
      color: mix(drift.color, hue, progress),
      glow: drift.glow + (1 - drift.glow) * progress,
    };
  }

  private drift(band: number, seconds: number, since: number) {
    const elapsed = seconds - since;
    const firefly = FIREFLIES[band];
    const from = this.flightFrom[band];
    const tau = Math.PI * 2;
    const homeX =
      clamp(from.x + firefly.homeX, 0.04, 0.96) +
      firefly.wander[0] * Math.sin(tau * firefly.speed[0] * elapsed + firefly.phase[0]) +
      firefly.wander[2] * Math.sin(tau * firefly.speed[2] * elapsed + firefly.phase[2]);
    const homeY =
      firefly.homeY +
      firefly.wander[1] * Math.sin(tau * firefly.speed[1] * elapsed + firefly.phase[1]);
    const home = { x: clamp(homeX, 0.02, 0.98), y: clamp(homeY, 0.08, 0.95) };
    const lift = easeOutCubic(elapsed / LIFT_SECONDS);
    const wave = 0.5 + 0.5 * Math.sin(tau * firefly.blink * elapsed + firefly.phase[3]);
    return {
      point: { x: from.x + (home.x - from.x) * lift, y: from.y + (home.y - from.y) * lift },
      color: mix(meadowColor(band), FIREFLY, smoothstep(elapsed / COLOR_TURN_SECONDS)),
      glow: 0.7 + 0.45 * wave * wave * wave,
    };
  }

  private homecoming(band: number, seconds: number): number {
    const flight = this.flight;
    if (flight.kind === "attached") return 1;
    if (flight.kind === "drifting") return 0;
    return smootherstep((seconds - flight.since - RETURN_STAGGER * band) / RETURN_SECONDS);
  }

  private attachedPoint(band: number, field: Field): Point {
    return toPoint(field, bandX(field, band), lift(field, this.bands[band].ball) - BALL_LIFT_DOTS);
  }

  private paint(field: Field, seconds: number, progress: number | null) {
    this.light.fill(0);
    this.cover.fill(0);
    this.stars(field, seconds);
    if (field.sky >= MOON_MIN_SKY_DOTS) this.moon(field, progress);
    for (let band = 0; band < BANDS; band += 1) {
      const motion = this.bands[band];
      const color = meadowColor(band);
      const x = bandX(field, band);
      const { point, color: lightColor, glow } = this.lightAt(band, field, seconds);
      const [lightX, lightY] = toDots(field, point);
      const progressHome = this.homecoming(band, seconds);
      let top: number;
      if (this.flight.kind === "attached") top = lightY;
      else if (this.flight.kind === "drifting") top = lift(field, motion.stem);
      else {
        const from = lift(field, this.stalksFrom[band]);
        const landing = toDots(field, this.attachedPoint(band, field))[1];
        top = from + (landing - from) * progressHome;
      }
      this.stalk(field, x, top, color);
      const energy = 0.85 + (clamp(motion.ball, 0, 1) - 0.85) * progressHome;
      const halo = (0.12 + 0.36 * energy) * glow;
      if (this.flight.kind === "attached" && motion.velocity > 0.4) {
        const length = Math.min(motion.velocity * 2.2, 5);
        for (let step = 1; step <= length; step += 1) {
          this.splat(
            field,
            lightX,
            lightY + step + 1,
            TRAIL,
            0.55 * (1 - step / (length + 1)),
            0,
            lightColor,
          );
        }
      }
      if (energy < 0.02 && this.flight.kind === "attached") {
        this.splat(field, lightX, lightY, DEW, 0.45, 0, lightColor);
      } else {
        this.splat(field, lightX, lightY, CORE, glow, halo, lightColor);
      }
    }
  }

  private stars(field: Field, seconds: number) {
    const height = field.height - field.meadow;
    const count = Math.min(
      Math.floor(((field.width / 2) * Math.floor(height / 4)) / SKY_CELLS_PER_STAR),
      MAX_STARS,
    );
    for (let star = 0; star < count; star += 1) {
      const next = sequence(star * 7919 + 0x57a2);
      const x = Math.floor(next() * field.width);
      const y = Math.floor(next() * height);
      const rate = 0.06 + 0.16 * next();
      const phase = Math.PI * 2 * next();
      const pulse = 0.5 + 0.5 * Math.sin(Math.PI * 2 * rate * seconds + phase);
      const peak = star % BRIGHT_STAR_EVERY === 0 ? 0.62 : 0.34;
      this.merge(field, x, y, 1, 0.1 + peak * pulse * pulse, STAR);
    }
  }

  private moon(field: Field, progress: number | null) {
    const [x, y] = moonCenter(progress, field.width, field.sky);
    const radius = clamp(field.sky * 0.22, 2.2, 6);
    const biteX = x + radius * 0.55;
    const biteY = y - radius * 0.3;
    const reach = radius + MOON_GLOW_DOTS;
    for (
      let row = Math.max(Math.floor(y - reach), 0);
      row <= y + reach && row < field.sky;
      row += 1
    ) {
      for (
        let column = Math.max(Math.floor(x - reach), 0);
        column <= x + reach && column < field.width;
        column += 1
      ) {
        const cx = column + 0.5;
        const cy = row + 0.5;
        const distance = Math.hypot(cx - x, cy - y);
        const bitten = Math.hypot(cx - biteX, cy - biteY) < radius * 0.92;
        if (distance <= radius && !bitten) this.merge(field, column, row, 1, 0.95, MOON);
        else if (distance > radius && distance <= reach) {
          const falloff = 1 - (distance - radius) / MOON_GLOW_DOTS;
          const glow = 0.3 * falloff * falloff;
          this.merge(field, column, row, glow, glow, MOON);
        }
      }
    }
  }

  private stalk(field: Field, x: number, top: number, color: Rgb) {
    const ground = field.height - 1;
    const length = Math.max(ground - top, 1);
    const column = clamp(Math.round(x), 0, field.width - 1);
    for (let y = ground; y >= Math.max(top, 0); y -= 1) {
      const row = Math.round(y);
      if (row >= 0 && row < field.height)
        this.merge(field, column, row, 1, 0.3 + 0.42 * ((ground - y) / length), color);
    }
  }

  private splat(
    field: Field,
    x: number,
    y: number,
    radius: number,
    core: number,
    halo: number,
    color: Rgb,
  ) {
    const reach = halo > 0 ? HALO_RADIUS : radius;
    for (
      let row = Math.max(Math.floor(y - reach), 0);
      row <= y + reach && row < field.height;
      row += 1
    ) {
      for (
        let column = Math.max(Math.floor(x - reach), 0);
        column <= x + reach && column < field.width;
        column += 1
      ) {
        const distance = Math.hypot(column + 0.5 - x, row + 0.5 - y);
        if (distance <= radius) this.merge(field, column, row, 1, core * 1.1, color);
        else if (halo > 0 && distance <= HALO_RADIUS) {
          const falloff = 1 - (distance - radius) / (HALO_RADIUS - radius);
          const glow = halo * falloff * falloff;
          this.merge(field, column, row, glow, glow, color);
        }
      }
    }
  }

  private merge(field: Field, x: number, y: number, cover: number, light: number, color: Rgb) {
    const index = y * field.width + x;
    this.cover[index] = Math.max(this.cover[index], cover);
    if (light > this.light[index]) {
      this.light[index] = light;
      this.color.set(color, index * 3);
    }
  }
}

function stepBand(band: Band, target: number, seconds: number) {
  const previous = band.stem;
  if (target > band.stem)
    band.stem += (target - band.stem) * (1 - Math.exp(-STEM_RISE_RATE * seconds));
  else band.stem = Math.max(band.stem - STEM_FALL_PER_SECOND * seconds, target);
  if (seconds <= 0) return;
  if (band.stem >= band.ball) {
    const rise = clamp((band.stem - previous) / seconds, 0, MAX_KICK);
    band.ball = band.stem;
    band.velocity = Math.max(band.velocity, rise * KICK);
  } else {
    band.velocity -= GRAVITY * seconds;
    band.ball += band.velocity * seconds;
    if (band.ball <= band.stem) {
      band.ball = band.stem;
      band.velocity = 0;
    }
  }
  if (band.ball > MAX_BALL) {
    band.ball = MAX_BALL;
    band.velocity = Math.min(band.velocity, 0);
  }
}

const meadowColor = (band: number) => pastel(band / (BANDS - 1));
const bandX = (field: Field, band: number) => ((band + 0.5) / BANDS) * field.width;
const span = (field: Field) =>
  Math.max(field.meadow - 1 - MIN_STEM_DOTS - TOP_MARGIN_DOTS - BALL_LIFT_DOTS, 1);
const lift = (field: Field, height: number) =>
  field.height - 1 - MIN_STEM_DOTS - height * span(field);
const toPoint = (field: Field, x: number, y: number): Point => ({
  x: x / field.width,
  y: 1 - y / field.height,
});
const toDots = (field: Field, point: Point): [number, number] => [
  point.x * field.width,
  (1 - point.y) * field.height,
];

/** Rises on the left as a track starts, highest halfway, sets on the right. */
function moonCenter(progress: number | null, width: number, sky: number): [number, number] {
  if (progress === null) return [0.84 * width, 0.35 * sky];
  const p = clamp(progress, 0, 1);
  return [(0.12 + 0.76 * p) * width, (0.72 - 0.45 * Math.sin(Math.PI * p)) * sky];
}

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const ditherThreshold = (x: number, y: number) => ((BAYER[y][x] + 0.5) / 16) * 0.74 + 0.06;

type LitDot = { light: number; color: Rgb } | null;

/**
 * Draws one braille-style cell. A full single dot column is a stalk and draws
 * as a solid hairline, as a terminal draws its one-eighth block; otherwise the
 * lit dots draw as round dots in the color of the brightest.
 */
function drawCell(
  ctx: CanvasRenderingContext2D,
  column: number,
  row: number,
  cell: { width: number; height: number },
  dot: (dx: number, dy: number) => LitDot,
) {
  let brightest: { light: number; color: Rgb } | null = null;
  const lit: [number, number][] = [];
  for (let dx = 0; dx < 2; dx += 1) {
    for (let dy = 0; dy < 4; dy += 1) {
      const found = dot(dx, dy);
      if (!found) continue;
      lit.push([dx, dy]);
      if (!brightest || found.light > brightest.light) brightest = found;
    }
  }
  if (!brightest) return;
  ctx.fillStyle = css(shade(brightest.color, brightest.light));
  const x = column * cell.width;
  const y = row * cell.height;
  const columnOnly = (dx: number) => lit.length === 4 && lit.every(([litX]) => litX === dx);
  const hairline = Math.max(cell.width / 8, 1);
  if (columnOnly(0)) {
    ctx.fillRect(x, y, hairline, cell.height);
    return;
  }
  if (columnOnly(1)) {
    ctx.fillRect(x + cell.width - hairline, y, hairline, cell.height);
    return;
  }
  const radius = Math.max(cell.width * 0.16, 1);
  for (const [dx, dy] of lit) {
    ctx.beginPath();
    ctx.arc(
      x + cell.width * (dx === 0 ? 0.3 : 0.7),
      y + cell.height * (0.14 + dy * 0.24),
      radius,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

/** One cell of the progress rail: which of its braille dots are lit, and their color. */
export type RailCell = { dots: [number, number][]; color: Rgb };

/**
 * The progress rail as cells: dew ahead, a pastel trail behind, and a light at
 * the play position that breathes while playing and blinks while paused.
 */
export function railCells(
  cells: number,
  progress: number | null,
  status: PlayerStatus,
  seconds: number,
): RailCell[] {
  const width = cells * 2;
  const dots: ({ light: number; color: Rgb } | null)[][] = Array.from({ length: width }, () => [
    null,
    null,
    null,
    null,
  ]);
  const light = (x: number, y: number, value: number, color: Rgb) => {
    const current = dots[x][y];
    if (!current || value > current.light) dots[x][y] = { light: value, color };
  };
  const head = progress === null ? null : clamp(progress, 0, 1) * width;
  for (let x = 0; x < width; x += 1) {
    const center = x + 0.5;
    if (head !== null && center <= head) light(x, 2, 0.72, pastel(center / width));
    else if (x % 2 === 0) light(x, 2, 0.24, TRACK);
  }
  if (head !== null && status !== "Stopped") {
    const wave = (hertz: number) => 0.5 + 0.5 * Math.sin(Math.PI * 2 * hertz * seconds);
    const blink = wave(0.35);
    const [color, glow]: [Rgb, number] =
      status === "Paused"
        ? [FIREFLY, 0.7 + 0.3 * blink * blink * blink]
        : [mix(pastel(head / width), WHITE, 0.35), 0.85 + 0.15 * wave(0.6)];
    let nearest = 0;
    for (let x = 0; x < width; x += 1) {
      if (Math.abs(x + 0.5 - head) < Math.abs(nearest + 0.5 - head)) nearest = x;
    }
    for (let x = 0; x < width; x += 1) {
      const distance = Math.abs(x + 0.5 - head);
      let value: number;
      if (distance <= 0.8) value = glow;
      else if (distance <= 2.4) value = 0.5 * glow * (1 - (distance - 0.8) / 1.6) ** 2;
      else continue;
      light(x, 1, value, color);
      light(x, 2, value, color);
      if (x === nearest) {
        light(x, 0, 0.55 * glow, color);
        light(x, 3, 0.55 * glow, color);
      }
    }
  }
  return Array.from({ length: cells }, (_, column) => {
    const lit: [number, number][] = [];
    let brightest = { light: 0, color: TRACK as Rgb };
    for (let dx = 0; dx < 2; dx += 1) {
      for (let dy = 0; dy < 4; dy += 1) {
        const found = dots[column * 2 + dx][dy];
        if (!found || found.light < 0.12) continue;
        lit.push([dx, dy]);
        if (found.light > brightest.light) brightest = found;
      }
    }
    return { dots: lit, color: shade(brightest.color, brightest.light) };
  });
}

/** Draws the progress rail into a one-row canvas. */
export function drawRail(
  ctx: CanvasRenderingContext2D,
  cells: number,
  progress: number | null,
  status: PlayerStatus,
  seconds: number,
  cell: { width: number; height: number },
) {
  ctx.clearRect(0, 0, cells * cell.width, cell.height);
  const radius = Math.max(cell.width * 0.16, 1);
  railCells(cells, progress, status, seconds).forEach((shape, column) => {
    ctx.fillStyle = css(shape.color);
    for (const [dx, dy] of shape.dots) {
      ctx.beginPath();
      ctx.arc(
        column * cell.width + cell.width * (dx === 0 ? 0.3 : 0.7),
        cell.height * (0.14 + dy * 0.24),
        radius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  });
}
