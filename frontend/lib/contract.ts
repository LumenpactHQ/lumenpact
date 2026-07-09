import { scValToNative, xdr } from "@stellar/stellar-sdk";
import {
  readOnly,
  sendTx,
  toAddressScVal,
  toI128,
  toU64,
  toStr,
  toBool,
  toEnum,
  CONTRACT_ID,
  XLM_CONTRACT_ID,
  BURN_ADDRESS,
} from "./stellar";
import {
  xlmToStroops,
  type Commitment,
  type CreateCommitmentInput,
  type PenaltyType,
} from "./types";

// `Option<T>` decodes to `null` for None, the raw value for Some.
function decodeOption<T>(raw: unknown): T | null {
  if (raw === null || raw === undefined) return null;
  if (Array.isArray(raw)) return raw.length ? ((raw[0] as T) ?? null) : null;
  return raw as T;
}

function decodeCommitment(scVal: xdr.ScVal | null): Commitment | null {
  if (!scVal) return null;

  const tag = scVal.switch().name;

  // None is encoded as `void`.
  if (tag === "scvVoid") return null;

  // Some variants may be wrapped in a Vec ([value]) — unwrap if so.
  if (tag === "scvVec") {
    const arr = scValToNative(scVal) as unknown[];
    if (!arr.length) return null;
    return decodeCommitment(arr[0] as xdr.ScVal);
  }

  const m = scValToNative(scVal) as Record<string, unknown>;

  const rawPenalty = Array.isArray(m.penalty_type)
    ? (m.penalty_type[0] as PenaltyType)
    : (m.penalty_type as PenaltyType);
  const rawStatus = Array.isArray(m.status)
    ? (m.status[0] as Commitment["status"])
    : (m.status as Commitment["status"]);
  // Option fields: `null` => None, raw value => Some.
  const rawOutcome = decodeOption<boolean>(m.outcome);
  const rawEvidence = decodeOption<string>(m.evidence_url);
  const rawResolved = decodeOption<number>(m.resolved_at);

  return {
    id: Number(m.id),
    creator: String(m.creator),
    judge: String(m.judge),
    amount: Number(m.amount),
    deadline: Number(m.deadline),
    gracePeriod: Number(m.grace_period ?? m.gracePeriod),
    description: String(m.description),
    penaltyAddress: String(m.penalty_address),
    penaltyType: rawPenalty,
    status: rawStatus,
    outcome: rawOutcome ?? null,
    evidenceUrl: rawEvidence ?? null,
    createdAt: Number(m.created_at),
    resolvedAt: rawResolved != null ? Number(rawResolved) : null,
  };
}

export async function getCommitment(id: number): Promise<Commitment | null> {
  const v = await readOnly("get_commitment", [toU64(id)]);
  return decodeCommitment(v);
}

export async function getUserCommitments(
  user: string
): Promise<Commitment[]> {
  const v = await readOnly("get_user_commitments", [toAddressScVal(user)]);
  const ids = (v ? (scValToNative(v) as unknown[]) : []) as number[];
  const commitments = await Promise.all(
    ids.map((id) => getCommitment(Number(id)))
  );
  return commitments.filter((c): c is Commitment => c !== null);
}

export async function getJudgeCommitments(
  judge: string
): Promise<Commitment[]> {
  const v = await readOnly("get_judge_commitments", [toAddressScVal(judge)]);
  const ids = (v ? (scValToNative(v) as unknown[]) : []) as number[];
  const commitments = await Promise.all(
    ids.map((id) => getCommitment(Number(id)))
  );
  return commitments.filter((c): c is Commitment => c !== null);
}

export async function getCommitmentCount(): Promise<number> {
  const v = await readOnly("get_commitment_count", []);
  if (!v) return 0;
  return Number(scValToNative(v));
}

export async function createCommitment(
  input: CreateCommitmentInput,
  sourceAddress: string,
  sign: (xdr: string) => Promise<string>
): Promise<string> {
  const amountStroops = xlmToStroops(input.stake);
  const penaltyType: PenaltyType = input.penaltyType === "burn" ? "Burn" : "Friend";
  const penaltyAddress =
    penaltyType === "Burn" ? BURN_ADDRESS : input.penaltyAddress;

  const args = [
    toAddressScVal(sourceAddress), // creator
    toAddressScVal(input.judge), // judge
    toAddressScVal(XLM_CONTRACT_ID), // token_address (native XLM SAC)
    toI128(amountStroops), // amount (stroops)
    toU64(input.deadlineUnix), // deadline
    toStr(input.goal), // description
    toAddressScVal(penaltyAddress), // penalty_address
    toEnum(penaltyType), // penalty_type
  ];

  await sendTx("create_commitment", args, sourceAddress, sign);
  return CONTRACT_ID;
}

export async function resolveCommitment(
  id: number,
  passed: boolean,
  sourceAddress: string,
  sign: (xdr: string) => Promise<string>
): Promise<void> {
  const args = [
    toAddressScVal(sourceAddress), // judge
    toU64(id), // commitment_id
    toAddressScVal(XLM_CONTRACT_ID), // token_address
    toBool(passed), // passed
  ];
  await sendTx("resolve", args, sourceAddress, sign);
}

export async function cancelCommitment(
  id: number,
  sourceAddress: string,
  sign: (xdr: string) => Promise<string>
): Promise<void> {
  const args = [
    toAddressScVal(sourceAddress), // creator
    toU64(id), // commitment_id
    toAddressScVal(XLM_CONTRACT_ID), // token_address
  ];
  await sendTx("cancel", args, sourceAddress, sign);
}

export async function submitEvidence(
  id: number,
  url: string,
  sourceAddress: string,
  sign: (xdr: string) => Promise<string>
): Promise<void> {
  const args = [
    toAddressScVal(sourceAddress), // creator
    toU64(id), // commitment_id
    toStr(url), // url
  ];
  await sendTx("submit_evidence", args, sourceAddress, sign);
}
