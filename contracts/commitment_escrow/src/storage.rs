use soroban_sdk::{contracttype, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    CommitmentCount,
    Commitment(u64),
    UserCommitments(soroban_sdk::Address),
    JudgeCommitments(soroban_sdk::Address),
}

pub fn get_commitment_count(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::CommitmentCount)
        .unwrap_or(0)
}

pub fn increment_commitment_count(env: &Env) -> u64 {
    let count = get_commitment_count(env) + 1;
    env.storage()
        .instance()
        .set(&DataKey::CommitmentCount, &count);
    count
}

pub fn get_admin(env: &Env) -> Option<soroban_sdk::Address> {
    env.storage().instance().get(&DataKey::Admin)
}

pub fn set_admin(env: &Env, admin: &soroban_sdk::Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}