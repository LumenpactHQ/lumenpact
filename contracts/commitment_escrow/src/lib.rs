#![no_std]

mod errors;
mod storage;
mod types;

use errors::CommitmentError;
use soroban_sdk::{
    contract, contractimpl, token, vec, Address, Env, String, Vec,
};
use storage::{
    get_admin, get_commitment_count, increment_commitment_count, set_admin, DataKey,
};
use types::{Commitment, CommitmentStatus, PenaltyType};

const GRACE_PERIOD: u64 = 86400; // 24 hours in seconds
const BURN_ADDRESS: &str = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

#[contract]
pub struct CommitmentEscrow;

#[contractimpl]
impl CommitmentEscrow {
    // ── Initialize ──────────────────────────────────────────────
    pub fn initialize(env: Env, admin: Address) -> Result<(), CommitmentError> {
        if get_admin(&env).is_some() {
            return Err(CommitmentError::AlreadyInitialized);
        }
        set_admin(&env, &admin);
        Ok(())
    }

    // ── Create Commitment ────────────────────────────────────────
    pub fn create_commitment(
        env: Env,
        creator: Address,
        judge: Address,
        token_address: Address,
        amount: i128,
        deadline: u64,
        description: String,
        penalty_address: Address,
        penalty_type: PenaltyType,
    ) -> Result<u64, CommitmentError> {
        creator.require_auth();

        if amount <= 0 {
            return Err(CommitmentError::InvalidAmount);
        }

        let now = env.ledger().timestamp();
        if deadline <= now {
            return Err(CommitmentError::InvalidDeadline);
        }

        // Transfer XLM from creator to contract
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&creator, &env.current_contract_address(), &amount);

        // Build commitment
        let id = increment_commitment_count(&env);
        let commitment = Commitment {
            id,
            creator: creator.clone(),
            judge: judge.clone(),
            amount,
            deadline,
            grace_period: GRACE_PERIOD,
            description,
            penalty_address,
            penalty_type,
            status: CommitmentStatus::Active,
            outcome: None,
            evidence_url: None,
            created_at: now,
            resolved_at: None,
        };

        // Store commitment
        env.storage()
            .persistent()
            .set(&DataKey::Commitment(id), &commitment);

        // Track by creator
        let mut user_commitments: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserCommitments(creator.clone()))
            .unwrap_or(vec![&env]);
        user_commitments.push_back(id);
        env.storage()
            .persistent()
            .set(&DataKey::UserCommitments(creator), &user_commitments);

        // Track by judge
        let mut judge_commitments: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::JudgeCommitments(judge.clone()))
            .unwrap_or(vec![&env]);
        judge_commitments.push_back(id);
        env.storage()
            .persistent()
            .set(&DataKey::JudgeCommitments(judge), &judge_commitments);

        Ok(id)
    }

    // ── Submit Evidence (v1.5) ───────────────────────────────────
    pub fn submit_evidence(
        env: Env,
        creator: Address,
        commitment_id: u64,
        url: String,
    ) -> Result<(), CommitmentError> {
        creator.require_auth();

        let mut commitment: Commitment = env
            .storage()
            .persistent()
            .get(&DataKey::Commitment(commitment_id))
            .ok_or(CommitmentError::CommitmentNotFound)?;

        if commitment.creator != creator {
            return Err(CommitmentError::NotAuthorized);
        }
        if commitment.status != CommitmentStatus::Active {
            return Err(CommitmentError::CommitmentNotActive);
        }

        commitment.evidence_url = Some(url);
        env.storage()
            .persistent()
            .set(&DataKey::Commitment(commitment_id), &commitment);

        Ok(())
    }

    // ── Resolve (Judge calls Pass or Fail) ───────────────────────
    pub fn resolve(
        env: Env,
        judge: Address,
        commitment_id: u64,
        token_address: Address,
        passed: bool,
    ) -> Result<(), CommitmentError> {
        judge.require_auth();

        let mut commitment: Commitment = env
            .storage()
            .persistent()
            .get(&DataKey::Commitment(commitment_id))
            .ok_or(CommitmentError::CommitmentNotFound)?;

        if commitment.judge != judge {
            return Err(CommitmentError::NotAuthorized);
        }
        if commitment.status != CommitmentStatus::Active {
            return Err(CommitmentError::CommitmentNotActive);
        }

        let now = env.ledger().timestamp();
        if now < commitment.deadline {
            return Err(CommitmentError::DeadlineNotReached);
        }

        let token_client = token::Client::new(&env, &token_address);

        if passed {
            // Return stake to creator
            token_client.transfer(
                &env.current_contract_address(),
                &commitment.creator,
                &commitment.amount,
            );
        } else {
            // Send stake to penalty address
            token_client.transfer(
                &env.current_contract_address(),
                &commitment.penalty_address,
                &commitment.amount,
            );
        }

        commitment.status = CommitmentStatus::Resolved;
        commitment.outcome = Some(passed);
        commitment.resolved_at = Some(now);

        env.storage()
            .persistent()
            .set(&DataKey::Commitment(commitment_id), &commitment);

        Ok(())
    }

    // ── Cancel (creator cancels after grace period) ──────────────
    pub fn cancel(
        env: Env,
        creator: Address,
        commitment_id: u64,
        token_address: Address,
    ) -> Result<(), CommitmentError> {
        creator.require_auth();

        let mut commitment: Commitment = env
            .storage()
            .persistent()
            .get(&DataKey::Commitment(commitment_id))
            .ok_or(CommitmentError::CommitmentNotFound)?;

        if commitment.creator != creator {
            return Err(CommitmentError::NotAuthorized);
        }
        if commitment.status != CommitmentStatus::Active {
            return Err(CommitmentError::CommitmentNotActive);
        }

        let now = env.ledger().timestamp();
        let grace_ends = commitment.deadline + commitment.grace_period;
        if now < grace_ends {
            return Err(CommitmentError::GracePeriodNotReached);
        }

        // Refund stake to creator
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(
            &env.current_contract_address(),
            &commitment.creator,
            &commitment.amount,
        );

        commitment.status = CommitmentStatus::Cancelled;
        commitment.resolved_at = Some(now);

        env.storage()
            .persistent()
            .set(&DataKey::Commitment(commitment_id), &commitment);

        Ok(())
    }

    // ── Read Functions ───────────────────────────────────────────
    pub fn get_commitment(env: Env, commitment_id: u64) -> Option<Commitment> {
        env.storage()
            .persistent()
            .get(&DataKey::Commitment(commitment_id))
    }

    pub fn get_user_commitments(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserCommitments(user))
            .unwrap_or(vec![&env])
    }

    pub fn get_judge_commitments(env: Env, judge: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::JudgeCommitments(judge))
            .unwrap_or(vec![&env])
    }

    pub fn get_commitment_count(env: Env) -> u64 {
        get_commitment_count(&env)
    }
}