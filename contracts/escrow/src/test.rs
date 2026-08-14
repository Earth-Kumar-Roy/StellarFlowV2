#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token::{AdminClient as TokenAdminClient, Client as TokenClient},
    Address, Env, String, Vec,
};

fn create_token_contract<'a>(
    e: &'a Env,
    admin: &'a Address,
) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let contract_id = e.register_stellar_asset_contract_v2(admin.clone()).address();
    (
        TokenClient::new(e, &contract_id),
        TokenAdminClient::new(e, &contract_id),
    )
}

#[test]
fn test_standard_escrow_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&client, &1000);

    let contract_id = env.register(StellarFlowEscrow, ());
    let escrow_client = StellarFlowEscrowClient::new(&env, &contract_id);

    let mut milestones = Vec::new(&env);
    milestones.push_back(Milestone {
        id: 1,
        description: String::from_str(&env, "Design Phase"),
        amount: 400,
        is_completed: false,
        is_submitted: false,
        submitted_at: 0,
        is_denied: false,
        denial_reason: String::from_str(&env, ""),
        auto_released_amount: 0,
        votes: Vec::new(&env),
    });
    milestones.push_back(Milestone {
        id: 2,
        description: String::from_str(&env, "Smart Contract Development"),
        amount: 600,
        is_completed: false,
        is_submitted: false,
        submitted_at: 0,
        is_denied: false,
        denial_reason: String::from_str(&env, ""),
        auto_released_amount: 0,
        votes: Vec::new(&env),
    });

    let deadline = env.ledger().timestamp() + 86400 * 10;

    // 1. Create Escrow (Amount <= 5,000 XLM, no co-signers required)
    escrow_client.create_escrow(
        &client,
        &freelancer,
        &None,
        &None,
        &token.address,
        &1000,
        &deadline,
        &milestones,
    );

    assert_eq!(token.balance(&client), 0);
    assert_eq!(token.balance(&contract_id), 1000);

    // 2. Freelancer submits work for Milestone 1
    escrow_client.submit_work(&1);
    let state = escrow_client.get_escrow();
    assert!(state.milestones.get(0).unwrap().is_submitted);

    // 3. Client approves Milestone 1
    escrow_client.approve_milestone(&client, &1);
    assert_eq!(token.balance(&freelancer), 400);
    assert_eq!(token.balance(&contract_id), 600);

    // 4. Submit & approve Milestone 2
    escrow_client.submit_work(&2);
    escrow_client.approve_milestone(&client, &2);
    assert_eq!(token.balance(&freelancer), 1000);
    assert_eq!(token.balance(&contract_id), 0);

    let final_state = escrow_client.get_escrow();
    assert_eq!(final_state.status, EscrowStatus::Completed);
}

#[test]
fn test_multisig_threshold_voting() {
    let env = Env::default();
    env.mock_all_auths();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let cosigner_1 = Address::generate(&env);
    let cosigner_2 = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&client, &10000);

    let contract_id = env.register(StellarFlowEscrow, ());
    let escrow_client = StellarFlowEscrowClient::new(&env, &contract_id);

    let mut milestones = Vec::new(&env);
    milestones.push_back(Milestone {
        id: 1,
        description: String::from_str(&env, "High Value Enterprise Milestone"),
        amount: 10000,
        is_completed: false,
        is_submitted: false,
        submitted_at: 0,
        is_denied: false,
        denial_reason: String::from_str(&env, ""),
        auto_released_amount: 0,
        votes: Vec::new(&env),
    });

    let deadline = env.ledger().timestamp() + 86400 * 14;

    // 1. Create Escrow above 5,000 XLM threshold requiring 2 co-signers
    escrow_client.create_escrow(
        &client,
        &freelancer,
        &Some(cosigner_1.clone()),
        &Some(cosigner_2.clone()),
        &token.address,
        &10000,
        &deadline,
        &milestones,
    );

    // 2. Freelancer submits work
    escrow_client.submit_work(&1);

    // 3. Vote 1: Client approves (1-of-3 votes) -> Funds NOT released yet
    escrow_client.approve_milestone(&client, &1);
    assert_eq!(token.balance(&freelancer), 0);

    // 4. Vote 2: Co-signer 1 approves (2-of-3 votes threshold met) -> Funds released!
    escrow_client.approve_milestone(&cosigner_1, &1);
    assert_eq!(token.balance(&freelancer), 10000);

    let state = escrow_client.get_escrow();
    assert_eq!(state.status, EscrowStatus::Completed);
}

#[test]
fn test_denial_and_inactivity_payout() {
    let env = Env::default();
    env.mock_all_auths();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&client, &1000);

    let contract_id = env.register(StellarFlowEscrow, ());
    let escrow_client = StellarFlowEscrowClient::new(&env, &contract_id);

    let mut milestones = Vec::new(&env);
    milestones.push_back(Milestone {
        id: 1,
        description: String::from_str(&env, "Frontend Integration"),
        amount: 1000,
        is_completed: false,
        is_submitted: false,
        submitted_at: 0,
        is_denied: false,
        denial_reason: String::from_str(&env, ""),
        auto_released_amount: 0,
        votes: Vec::new(&env),
    });

    let deadline = env.ledger().timestamp() + 86400 * 10;

    escrow_client.create_escrow(
        &client,
        &freelancer,
        &None,
        &None,
        &token.address,
        &1000,
        &deadline,
        &milestones,
    );

    // 1. Submit work & client denies with feedback
    escrow_client.submit_work(&1);
    escrow_client.deny_milestone(&client, &1, &String::from_str(&env, "Fix UI layout alignment"));

    let state = escrow_client.get_escrow();
    assert!(state.milestones.get(0).unwrap().is_denied);

    // 2. Freelancer addresses feedback and resubmits work
    escrow_client.submit_work(&1);
    let resubmitted_state = escrow_client.get_escrow();
    assert!(!resubmitted_state.milestones.get(0).unwrap().is_denied);

    // 3. Advance ledger time by 2 days (172,800 seconds) without client response
    let current_ts = env.ledger().timestamp();
    env.ledger().set_timestamp(current_ts + TWO_DAYS_IN_SECONDS + 10);

    // 4. Claim 10% inactivity payout
    escrow_client.claim_inactivity_payout(&1);
    assert_eq!(token.balance(&freelancer), 100); // 10% of 1,000 XLM
}