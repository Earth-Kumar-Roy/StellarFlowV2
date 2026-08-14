use soroban_sdk::{contracterror, contracttype, Address, String, Vec};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    MilestoneNotFound = 4,
    MilestoneAlreadyCompleted = 5,
    DeadlineNotPassed = 6,
    EscrowCompleted = 7,
    InvalidAmount = 8,
    ContractExpired = 9,
    MilestoneSumMismatch = 10,
    WorkNotSubmitted = 11,
    AlreadyVoted = 12,
    InsufficientVotes = 13,
    InactivityWindowNotReached = 14,
    MilestoneDenied = 15,
    CosignerRequired = 16,
    NothingToRelease = 17,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Active,
    Completed,
    Refunded,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub id: u32,
    pub description: String,
    pub amount: i128,
    pub is_completed: bool,
    pub is_submitted: bool,
    pub submitted_at: u64,
    pub is_denied: bool,
    pub denial_reason: String,
    pub auto_released_amount: i128,
    pub votes: Vec<Address>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub client: Address,
    pub freelancer: Address,
    pub cosigner_1: Option<Address>,
    pub cosigner_2: Option<Address>,
    pub token: Address,
    pub total_amount: i128,
    pub released_amount: i128,
    pub deadline: u64,
    pub status: EscrowStatus,
    pub milestones: Vec<Milestone>,
}