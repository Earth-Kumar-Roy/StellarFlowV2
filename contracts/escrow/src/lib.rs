#![no_std]

mod storage;
mod types;

#[cfg(test)]
mod test;

use crate::storage::{extend_contract_ttl, DataKey};
use crate::types::{Escrow, EscrowError, EscrowStatus, Milestone};
use soroban_sdk::{
    contract, contractimpl, token::Client as TokenClient, Address, Env, String, Vec,
};

// 5,000 XLM = 5,000 * 10,000,000 Stroops
pub const MULTISIG_THRESHOLD_AMOUNT: i128 = 50_000_000_000;
pub const TWO_DAYS_IN_SECONDS: u64 = 172_800;  // 2 days
pub const SEVEN_DAYS_IN_SECONDS: u64 = 604_800; // 7 days

#[contract]
pub struct StellarFlowEscrow;

#[contractimpl]
impl StellarFlowEscrow {
    /// Initializes a new escrow contract with optional multi-sig co-signers.
    pub fn create_escrow(
        env: Env,
        client: Address,
        freelancer: Address,
        cosigner_1: Option<Address>,
        cosigner_2: Option<Address>,
        token: Address,
        total_amount: i128,
        deadline: u64,
        milestones: Vec<Milestone>,
    ) -> Result<(), EscrowError> {
        client.require_auth();

        if total_amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }

        if deadline <= env.ledger().timestamp() {
            return Err(EscrowError::ContractExpired);
        }

        // Enforce 2 co-signers if total amount exceeds 5,000 XLM threshold
        if total_amount > MULTISIG_THRESHOLD_AMOUNT {
            if cosigner_1.is_none() || cosigner_2.is_none() {
                return Err(EscrowError::CosignerRequired);
            }
        }

        // Verify milestone sums match total contract amount
        let mut sum: i128 = 0;
        for i in 0..milestones.len() {
            if let Some(m) = milestones.get(i) {
                if m.amount <= 0 {
                    return Err(EscrowError::InvalidAmount);
                }
                sum = sum.checked_add(m.amount).ok_or(EscrowError::InvalidAmount)?;
            }
        }

        if sum != total_amount {
            return Err(EscrowError::MilestoneSumMismatch);
        }

        // Lock client funds in the contract
        let contract_address = env.current_contract_address();
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&client, &contract_address, &total_amount);

        let escrow = Escrow {
            client,
            freelancer,
            cosigner_1,
            cosigner_2,
            token,
            total_amount,
            released_amount: 0,
            deadline,
            status: EscrowStatus::Active,
            milestones,
        };

        env.storage().instance().set(&DataKey::Escrow, &escrow);
        extend_contract_ttl(&env);

        Ok(())
    }

    /// Freelancer submits work for a milestone on-chain.
    pub fn submit_work(env: Env, milestone_id: u32) -> Result<(), EscrowError> {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow)
            .ok_or(EscrowError::NotInitialized)?;

        escrow.freelancer.require_auth();

        if escrow.status != EscrowStatus::Active {
            return Err(EscrowError::EscrowCompleted);
        }

        let mut milestone_found = false;
        let mut updated_milestones = Vec::new(&env);

        for i in 0..escrow.milestones.len() {
            if let Some(mut m) = escrow.milestones.get(i) {
                if m.id == milestone_id {
                    milestone_found = true;
                    if m.is_completed {
                        return Err(EscrowError::MilestoneAlreadyCompleted);
                    }
                    m.is_submitted = true;
                    m.submitted_at = env.ledger().timestamp();
                    m.is_denied = false; // Clear previous denial state upon resubmission
                }
                updated_milestones.push_back(m);
            }
        }

        if !milestone_found {
            return Err(EscrowError::MilestoneNotFound);
        }

        escrow.milestones = updated_milestones;
        env.storage().instance().set(&DataKey::Escrow, &escrow);
        extend_contract_ttl(&env);

        Ok(())
    }

    /// Client or Co-Signer approves a milestone.
    /// Handles 2-of-3 multi-sig voting when total amount > 5,000 XLM.
    pub fn approve_milestone(env: Env, approver: Address, milestone_id: u32) -> Result<(), EscrowError> {
        approver.require_auth();

        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow)
            .ok_or(EscrowError::NotInitialized)?;

        if escrow.status != EscrowStatus::Active {
            return Err(EscrowError::EscrowCompleted);
        }

        // Verify approver is authorized (Client, Co-Signer 1, or Co-Signer 2)
        let is_client = approver == escrow.client;
        let is_cosigner_1 = escrow.cosigner_1.as_ref() == Some(&approver);
        let is_cosigner_2 = escrow.cosigner_2.as_ref() == Some(&approver);

        if !is_client && !is_cosigner_1 && !is_cosigner_2 {
            return Err(EscrowError::Unauthorized);
        }

        let mut milestone_found = false;
        let mut amount_to_release: i128 = 0;
        let mut updated_milestones = Vec::new(&env);

        for i in 0..escrow.milestones.len() {
            if let Some(mut m) = escrow.milestones.get(i) {
                if m.id == milestone_id {
                    milestone_found = true;
                    if m.is_completed {
                        return Err(EscrowError::MilestoneAlreadyCompleted);
                    }

                    // For contracts <= 5,000 XLM, client single approval is sufficient
                    if escrow.total_amount <= MULTISIG_THRESHOLD_AMOUNT {
                        if !is_client {
                            return Err(EscrowError::Unauthorized);
                        }
                        m.is_completed = true;
                        amount_to_release = m.amount - m.auto_released_amount;
                    } else {
                        // For contracts > 5,000 XLM, enforce 2-of-3 voting threshold
                        for existing_vote in m.votes.iter() {
                            if existing_vote == approver {
                                return Err(EscrowError::AlreadyVoted);
                            }
                        }
                        m.votes.push_back(approver.clone());

                        if m.votes.len() >= 2 {
                            m.is_completed = true;
                            amount_to_release = m.amount - m.auto_released_amount;
                        }
                    }
                }
                updated_milestones.push_back(m);
            }
        }

        if !milestone_found {
            return Err(EscrowError::MilestoneNotFound);
        }

        // Execute token release if approval conditions are met
        if amount_to_release > 0 {
            let token_client = TokenClient::new(&env, &escrow.token);
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.freelancer,
                &amount_to_release,
            );
            escrow.released_amount += amount_to_release;
        }

        escrow.milestones = updated_milestones;

        if escrow.released_amount >= escrow.total_amount {
            escrow.status = EscrowStatus::Completed;
        }

        env.storage().instance().set(&DataKey::Escrow, &escrow);
        extend_contract_ttl(&env);

        Ok(())
    }

    /// Client or Co-Signer denies a milestone submission with feedback.
    pub fn deny_milestone(
        env: Env,
        reviewer: Address,
        milestone_id: u32,
        reason: String,
    ) -> Result<(), EscrowError> {
        reviewer.require_auth();

        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow)
            .ok_or(EscrowError::NotInitialized)?;

        let is_client = reviewer == escrow.client;
        let is_cosigner_1 = escrow.cosigner_1.as_ref() == Some(&reviewer);
        let is_cosigner_2 = escrow.cosigner_2.as_ref() == Some(&reviewer);

        if !is_client && !is_cosigner_1 && !is_cosigner_2 {
            return Err(EscrowError::Unauthorized);
        }

        let mut milestone_found = false;
        let mut updated_milestones = Vec::new(&env);

        for i in 0..escrow.milestones.len() {
            if let Some(mut m) = escrow.milestones.get(i) {
                if m.id == milestone_id {
                    milestone_found = true;
                    if m.is_completed {
                        return Err(EscrowError::MilestoneAlreadyCompleted);
                    }
                    m.is_denied = true;
                    m.denial_reason = reason.clone();
                }
                updated_milestones.push_back(m);
            }
        }

        if !milestone_found {
            return Err(EscrowError::MilestoneNotFound);
        }

        escrow.milestones = updated_milestones;
        env.storage().instance().set(&DataKey::Escrow, &escrow);
        extend_contract_ttl(&env);

        Ok(())
    }

    /// Triggers automated partial payouts if work was submitted and client is inactive.
    /// - After 2 days of inactivity: releases 10% of milestone amount.
    /// - After 7 days or contract expiration: releases up to 40% total of milestone amount.
    pub fn claim_inactivity_payout(env: Env, milestone_id: u32) -> Result<(), EscrowError> {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow)
            .ok_or(EscrowError::NotInitialized)?;

        if escrow.status != EscrowStatus::Active {
            return Err(EscrowError::EscrowCompleted);
        }

        let now = env.ledger().timestamp();
        let mut milestone_found = false;
        let mut amount_to_release: i128 = 0;
        let mut updated_milestones = Vec::new(&env);

        for i in 0..escrow.milestones.len() {
            if let Some(mut m) = escrow.milestones.get(i) {
                if m.id == milestone_id {
                    milestone_found = true;

                    if !m.is_submitted {
                        return Err(EscrowError::WorkNotSubmitted);
                    }
                    if m.is_completed {
                        return Err(EscrowError::MilestoneAlreadyCompleted);
                    }
                    if m.is_denied {
                        return Err(EscrowError::MilestoneDenied);
                    }

                    let time_elapsed = now.saturating_sub(m.submitted_at);

                    // Determine target auto-release percentage based on inactivity window
                    let target_amount = if time_elapsed >= SEVEN_DAYS_IN_SECONDS || now >= escrow.deadline {
                        (m.amount * 40) / 100 // 40% payout
                    } else if time_elapsed >= TWO_DAYS_IN_SECONDS {
                        (m.amount * 10) / 100 // 10% payout
                    } else {
                        return Err(EscrowError::InactivityWindowNotReached);
                    };

                    amount_to_release = target_amount.saturating_sub(m.auto_released_amount);

                    if amount_to_release <= 0 {
                        return Err(EscrowError::NothingToRelease);
                    }

                    m.auto_released_amount += amount_to_release;
                }
                updated_milestones.push_back(m);
            }
        }

        if !milestone_found {
            return Err(EscrowError::MilestoneNotFound);
        }

        // Execute partial payout release
        let token_client = TokenClient::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.freelancer,
            &amount_to_release,
        );

        escrow.released_amount += amount_to_release;
        escrow.milestones = updated_milestones;

        env.storage().instance().set(&DataKey::Escrow, &escrow);
        extend_contract_ttl(&env);

        Ok(())
    }

    /// Refunds remaining unreleased tokens to client if deadline has passed.
    pub fn refund_expired(env: Env) -> Result<(), EscrowError> {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow)
            .ok_or(EscrowError::NotInitialized)?;

        escrow.client.require_auth();

        if escrow.status != EscrowStatus::Active {
            return Err(EscrowError::EscrowCompleted);
        }

        if env.ledger().timestamp() < escrow.deadline {
            return Err(EscrowError::DeadlineNotPassed);
        }

        let remaining_balance = escrow.total_amount - escrow.released_amount;
        if remaining_balance > 0 {
            let token_client = TokenClient::new(&env, &escrow.token);
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.client,
                &remaining_balance,
            );
        }

        escrow.status = EscrowStatus::Refunded;
        env.storage().instance().set(&DataKey::Escrow, &escrow);
        extend_contract_ttl(&env);

        Ok(())
    }

    /// Fetches contract state.
    pub fn get_escrow(env: Env) -> Result<Escrow, EscrowError> {
        extend_contract_ttl(&env);
        env.storage()
            .instance()
            .get(&DataKey::Escrow)
            .ok_or(EscrowError::NotInitialized)
    }

    /// Bumps TTL.
    pub fn bump_ttl(env: Env) {
        extend_contract_ttl(&env);
    }
}