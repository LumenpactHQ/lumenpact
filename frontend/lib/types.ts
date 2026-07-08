export type PenaltyType = "Friend" | "Burn";
export type CommitmentStatus = "Active" | "Resolved" | "Cancelled";

export interface Commitment {
  id: number;
  creator: string;
  judge: string;
  /** Amount in stroops (XLM * 1e7). */
  amount: number;
  /** Unix deadline (seconds). */
  deadline: number;
  gracePeriod: number;
  description: string;
  penaltyAddress: string;
  penaltyType: PenaltyType;
  status: CommitmentStatus;
  /** true = pass, false = fail, null = not yet resolved. */
  outcome: boolean | null;
  evidenceUrl: string | null;
  createdAt: number;
  resolvedAt: number | null;
}

export interface CreateCommitmentInput {
  goal: string;
  /** Unix deadline in seconds. */
  deadlineUnix: number;
  /** Stake amount in XLM (whole units). */
  stake: string;
  judge: string;
  penaltyType: "burn" | "friend";
  penaltyAddress: string;
}

export const STROOPS_PER_XLM = 1e7;

export function stroopsToXlm(stroops: number): number {
  return stroops / STROOPS_PER_XLM;
}

export function xlmToStroops(xlm: string | number): bigint {
  const value = typeof xlm === "string" ? parseFloat(xlm) : xlm;
  return BigInt(Math.round(value * STROOPS_PER_XLM));
}
