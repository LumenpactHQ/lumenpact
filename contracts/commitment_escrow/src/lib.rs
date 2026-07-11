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

        if get_admin(&env).is_none() {
            return Err(CommitmentError::NotInitialized);
        }

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
            // Send stake to the penalty destination.
            // For `Burn`, funds are sent to the provably unspendable burn
            // address regardless of the `penalty_address` supplied at creation.
            let destination = if commitment.penalty_type == PenaltyType::Burn {
                Address::from_string(&String::from_str(&env, BURN_ADDRESS))
            } else {
                commitment.penalty_address.clone()
            };
            token_client.transfer(
                &env.current_contract_address(),
                &destination,
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
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        Address, Env, String,
    };

    fn create_test_env() -> (Env, Address, Address, Address, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        let judge = Address::generate(&env);
        let penalty = Address::generate(&env);
        let token_admin = Address::generate(&env);
        let token = env.register_stellar_asset_contract_v2(token_admin);
        let token_address = token.address();

        let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_address);
        token_client.mint(&creator, &10000);

        (env, admin, creator, judge, penalty, token_address)
    }

    #[test]
    fn test_initialize() {
        let (env, admin, _, _, _, _) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
    }

    #[test]
    #[should_panic]
    fn test_initialize_twice_fails() {
        let (env, admin, _, _, _, _) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        client.initialize(&admin);
    }

    #[test]
    fn test_create_commitment() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let deadline = 2000u64;
        let description = String::from_str(&env, "Ship the landing page by Friday");
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &deadline,
            &description, &penalty, &PenaltyType::Friend,
        );
        assert_eq!(id, 1);
        let commitment = client.get_commitment(&id).unwrap();
        assert_eq!(commitment.creator, creator);
        assert_eq!(commitment.judge, judge);
        assert_eq!(commitment.amount, 100);
        assert_eq!(commitment.status, CommitmentStatus::Active);
        assert_eq!(commitment.outcome, None);
    }

    #[test]
    #[should_panic]
    fn test_create_commitment_invalid_amount() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test");
        client.create_commitment(
            &creator, &judge, &token, &0, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
    }

    #[test]
    #[should_panic]
    fn test_create_commitment_past_deadline() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 5000);
        let description = String::from_str(&env, "Test");
        client.create_commitment(
            &creator, &judge, &token, &100, &1000,
            &description, &penalty, &PenaltyType::Friend,
        );
    }

    #[test]
    fn test_resolve_pass() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        env.ledger().with_mut(|l| l.timestamp = 3000);
        client.resolve(&judge, &id, &token, &true);
        let commitment = client.get_commitment(&id).unwrap();
        assert_eq!(commitment.status, CommitmentStatus::Resolved);
        assert_eq!(commitment.outcome, Some(true));
    }

    #[test]
    fn test_resolve_fail() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        env.ledger().with_mut(|l| l.timestamp = 3000);
        client.resolve(&judge, &id, &token, &false);
        let commitment = client.get_commitment(&id).unwrap();
        assert_eq!(commitment.status, CommitmentStatus::Resolved);
        assert_eq!(commitment.outcome, Some(false));
    }

    #[test]
    #[should_panic]
    fn test_resolve_before_deadline_fails() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        client.resolve(&judge, &id, &token, &true);
    }

    #[test]
    #[should_panic]
    fn test_resolve_wrong_judge_fails() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        let fake_judge = Address::generate(&env);
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        env.ledger().with_mut(|l| l.timestamp = 3000);
        client.resolve(&fake_judge, &id, &token, &true);
    }

    #[test]
    fn test_cancel_after_grace_period() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        env.ledger().with_mut(|l| l.timestamp = 2000 + 86400 + 1);
        client.cancel(&creator, &id, &token);
        let commitment = client.get_commitment(&id).unwrap();
        assert_eq!(commitment.status, CommitmentStatus::Cancelled);
    }

    #[test]
    #[should_panic]
    fn test_cancel_before_grace_period_fails() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        env.ledger().with_mut(|l| l.timestamp = 3000);
        client.cancel(&creator, &id, &token);
    }

    #[test]
    #[should_panic]
    fn test_cancel_after_resolve_fails() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        // Resolve the commitment
        env.ledger().with_mut(|l| l.timestamp = 3000);
        client.resolve(&judge, &id, &token, &true);
        // Attempt to cancel after resolved should panic
        client.cancel(&creator, &id, &token);
    }

    #[test]
    #[should_panic]
    fn test_cancel_by_non_creator_fails() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let other = Address::generate(&env);
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        // Advance past grace period
        env.ledger().with_mut(|l| l.timestamp = 2000 + 86400 + 1);
        // Non-creator attempts cancellation
        client.cancel(&other, &id, &token);
    }

    #[test]
    fn test_submit_evidence() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        let id = client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        let url = String::from_str(&env, "https://strava.com/activity/123456");
        client.submit_evidence(&creator, &id, &url);
        let commitment = client.get_commitment(&id).unwrap();
        assert_eq!(commitment.evidence_url, Some(url));
    }

    #[test]
    fn test_get_user_commitments() {
        let (env, admin, creator, judge, penalty, token) = create_test_env();
        let contract_id = env.register_contract(None, CommitmentEscrow);
        let client = CommitmentEscrowClient::new(&env, &contract_id);
        client.initialize(&admin);
        env.ledger().with_mut(|l| l.timestamp = 1000);
        let description = String::from_str(&env, "Test goal");
        client.create_commitment(
            &creator, &judge, &token, &100, &2000,
            &description, &penalty, &PenaltyType::Friend,
        );
        client.create_commitment(
            &creator, &judge, &token, &200, &3000,
            &description, &penalty, &PenaltyType::Burn,
        );
        let commitments = client.get_user_commitments(&creator);
        assert_eq!(commitments.len(), 2);
    }
}
