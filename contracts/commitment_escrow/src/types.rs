use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum PenaltyType {
    Friend,
    Burn,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum CommitmentStatus {
    Active,
    Resolved,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Commitment {
    pub id: u64,
    pub creator: Address,
    pub judge: Address,
    pub amount: i128,
    pub deadline: u64,
    pub grace_period: u64,
    pub description: String,
    pub penalty_address: Address,
    pub penalty_type: PenaltyType,
    pub status: CommitmentStatus,
    pub outcome: Option<bool>,
    pub evidence_url: Option<String>,
    pub created_at: u64,
    pub resolved_at: Option<u64>,
}