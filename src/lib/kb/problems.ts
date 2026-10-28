// The problems inside one merged ticket. causes.ts files a report by its tenant; the desk also
// reads some reports as a one-day move (desk-notes.json). A one-day move is not a flipped month,
// so here it is its own problem, not a footnote under `parser`.
import { groupByCause, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

function summarize(problem: Problem, rs: Report[]): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function problemsIn(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: number; merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const rest = merged.filter((r) => !oneDayMove.includes(r.id));
  const groups = groupByCause(rest, tenantOf).map((g) => summarize(g.cause, g.reports));
  if (moved.length) groups.push(summarize('one-day', moved));
  return {
    rows: all.filter((r) => r.mergedInto === ticket).length,
    merged,
    groups: groups.sort((a, b) => b.reports.length - a.reports.length),
  };
}
