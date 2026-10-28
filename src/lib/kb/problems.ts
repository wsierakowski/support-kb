// The problems inside one merged ticket, counted with the desk's own view: causes.ts files each
// report by its tenant, so a report the desk read as a one-day move (desk-notes.json) still counts
// under its cause. A one-day move is not a flipped month, so it also gets a row of its own,
// marked `alsoIn` so nobody adds the rows up to more than the ticket holds.
import { groupByCause, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // Set on the one-day row: the cause its reports are counted under.
  alsoIn?: Problem[];
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
  const groups = groupByCause(merged, tenantOf).map((g) => summarize(g.cause, g.reports));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const alsoIn = groups.filter((g) => g.reports.some((r) => oneDayMove.includes(r.id))).map((g) => g.problem);
    groups.push({ ...summarize('one-day', moved), alsoIn });
  }
  return {
    rows: all.filter((r) => r.mergedInto === ticket).length,
    merged,
    groups: groups.sort((a, b) => b.reports.length - a.reports.length),
  };
}
