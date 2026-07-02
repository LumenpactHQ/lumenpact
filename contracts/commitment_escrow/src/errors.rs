use soroban_sdk::contracterror;

#[contracterror]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum CommitmentError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    CommitmentNotFound = 3,
    NotAuthorized = 4,
    DeadlineNotReached = 5,
    GracePeriodNotReached = 6,
    CommitmentNotActive = 7,
    InvalidAmount = 8,
    InvalidDeadline = 9,
    AlreadyResolved = 10,
}