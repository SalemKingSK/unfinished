/**
 * v89 pair-indexed famous-birthday cohort.
 *
 * These are calculated Direct/Classic snapshots, not forensic cases.
 * They never invent an event, outcome, or shadow fact. The engine uses
 * them as same-pair contemporaries so a reading can name people who
 * actually carried this pair in a real calendar year.
 */
import raw from '@/lib/numerology/data/cohort-snapshots.json';
import meta from '@/lib/numerology/data/cohort-meta.json';

export interface CohortSnapshot {
  n: string;
  y: number;
  a: number;
  d: number;
  c: number;
  dr: number;
  cr: number;
  o: string;
  v: string;
}

export const COHORT_META = meta as {
  version: string;
  cohortSnapshots: number;
  cohortPeople: number;
  cohortPairs: number;
  forensicNew: number;
  karmicHits: number;
};

const ROWS = raw as CohortSnapshot[];

let pairIndex: Map<string, CohortSnapshot[]> | null = null;

function index(): Map<string, CohortSnapshot[]> {
  if (pairIndex) return pairIndex;
  const map = new Map<string, CohortSnapshot[]>();
  for (const row of ROWS) {
    const key = `${row.d}-${row.c}`;
    const bucket = map.get(key);
    if (bucket) bucket.push(row);
    else map.set(key, [row]);
  }
  pairIndex = map;
  return map;
}

export function cohortSize(): number {
  return ROWS.length;
}

export function cohortForPair(direct: number, classic: number): CohortSnapshot[] {
  return index().get(`${direct}-${classic}`) ?? [];
}

export function cohortMirrors(args: {
  direct: number;
  classic: number;
  targetYear: number;
  limit?: number;
}): CohortSnapshot[] {
  const limit = args.limit ?? 8;
  const bucket = cohortForPair(args.direct, args.classic);
  if (!bucket.length) return [];
  const scored = bucket.map((row) => {
    let score = 70;
    if (row.y === args.targetYear) score += 25;
    else score += Math.max(0, 12 - Math.abs(row.y - args.targetYear));
    return { row, score };
  });
  scored.sort((a, b) => b.score - a.score || a.row.n.localeCompare(b.row.n));
  const seen = new Set<string>();
  const out: CohortSnapshot[] = [];
  for (const item of scored) {
    if (seen.has(item.row.n)) continue;
    seen.add(item.row.n);
    out.push(item.row);
    if (out.length >= limit) break;
  }
  return out;
}
