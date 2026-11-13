export type BoxSpec = {
  position: [number, number, number];
  size: [number, number, number];
};

export function subtractSpans(from: number, to: number, gaps: [number, number][]) {
  let spans: [number, number][] = [[Math.min(from, to), Math.max(from, to)]];
  for (const [gapA, gapB] of gaps) {
    const g0 = Math.min(gapA, gapB);
    const g1 = Math.max(gapA, gapB);
    const next: [number, number][] = [];
    for (const [a, b] of spans) {
      if (g1 <= a || g0 >= b) {
        next.push([a, b]);
        continue;
      }
      if (g0 > a) next.push([a, g0]);
      if (g1 < b) next.push([g1, b]);
    }
    spans = next.filter(([a, b]) => b - a > 0.08);
  }
  return spans;
}

export function wallRun(options: {
  axis: "x" | "z";
  fixed: number;
  from: number;
  to: number;
  gaps?: [number, number][];
  height: number;
  thickness?: number;
  y?: number;
}): BoxSpec[] {
  const thickness = options.thickness ?? 0.14;
  const y = options.y ?? options.height / 2;
  return subtractSpans(options.from, options.to, options.gaps ?? []).map(([a, b]) => {
    const mid = (a + b) / 2;
    const length = b - a;
    if (options.axis === "x") {
      return { position: [mid, y, options.fixed], size: [length, options.height, thickness] };
    }
    return { position: [options.fixed, y, mid], size: [thickness, options.height, length] };
  });
}

export function openingPanels(options: {
  axis: "x" | "z";
  fixed: number;
  gaps: [number, number][];
  height: number;
  thickness?: number;
  y?: number;
}): BoxSpec[] {
  const thickness = options.thickness ?? 0.05;
  const y = options.y ?? options.height / 2;
  return options.gaps.map(([a, b]) => {
    const mid = (a + b) / 2;
    const length = Math.abs(b - a);
    if (options.axis === "x") {
      return { position: [mid, y, options.fixed], size: [length, options.height, thickness] };
    }
    return { position: [options.fixed, y, mid], size: [thickness, options.height, length] };
  });
}
