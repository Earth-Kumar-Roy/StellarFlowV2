# ⭐ StellarFlow V2

<div align="center">

# StellarFlow V2

### Multi-Sig Milestone-Based Escrow, Inactivity Protection & On-Chain Reputation dApp on Stellar Soroban

A production-ready decentralized escrow platform built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Soroban Smart Contracts**, and the **Stellar Network**.

Securely create milestone agreements, cryptographically lock funds inside on-chain smart contract vaults, enforce 2-of-3 multi-sig governance for high-value contracts, protect freelancers via programmatic inactivity auto-claims, generate downloadable settlement PDF invoices, and audit every transaction via real-time on-chain and off-chain data streams.

---

### 🌐 Live Demo

https://stellar-flow-v2.vercel.app/

### 📂 GitHub Repository

https://github.com/Earth-Kumar-Roy/StellarFlowV2

### 🔎 Testnet Contract Explorer

https://stellar.expert/explorer/testnet/contract/CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO

### 🎥 Demo Video

https://drive.google.com/file/d/1Pcxuvv1ndbkt7Kd9M9xjwV5DWXD8ZEFE/view?usp=drive_link

### 📺 Application Screenshots

https://github.com/Earth-Kumar-Roy/StellarFlowV2/tree/main/frontend/public/screenshots

### 📽 PPT link

https://docs.google.com/presentation/d/1WEC3J_Z2Bjo8hUsZjZebJixIetrs9Nz2/edit?usp=drive_link&ouid=111902574578733458808&rtpof=true&sd=true

---

### 📝 Community Feedback & Evaluation Ledgers

- **Community Feedback Ledger**: https://docs.google.com/spreadsheets/d/14RQ2lbUCWGO36NkopM9LQS3qh0IovK_A1FJGf32xE3U/edit?gid=1227724996#gid=1227724996  
  *(Verifiable log of direct on-chain and dApp counterparty reviews.)*
- **User Onboarding & Evaluation Sheet**: https://docs.google.com/spreadsheets/d/14RQ2lbUCWGO36NkopM9LQS3qh0IovK_A1FJGf32xE3U/edit?gid=449051969#gid=449051969  
  *(Responses collected from community testers via the onboarding & evaluation form.)*

</div>

---

## 📈 Feedback-Driven Product Improvements & Next Phase Evolution

Based on comprehensive evaluation and feedback collected from 50+ testnet users across our [User Onboarding & Feedback Sheet](https://docs.google.com/spreadsheets/d/14RQ2lbUCWGO36NkopM9LQS3qh0IovK_A1FJGf32xE3U/edit?gid=449051969#gid=449051969), we implemented immediate core architectural upgrades and established our next-phase development roadmap.

---

### 🛠️ Key Improvements Implemented in this Phase (with Commits)

1. **Single-Page PDF Settlement Invoicing Engine (`InvoiceMaker.tsx`)**
   * **User Feedback Addressed**: Users reported browser print issues where entire background dashboards were captured across multiple pages with missing dark/light styles and clipped text.
   * **Implemented Solution**: Built an isolated, client-side PDF export engine that generates a single-page, white-background settlement invoice with responsive stacked wallet address formatting and zero external CDN dependency.
   * **Git Commit**: [`b6711943b5697ebf49758bbcda748961734ce634`](https://github.com/Earth-Kumar-Roy/StellarFlowV2/commit/b6711943b5697ebf49758bbcda748961734ce634) — *`feat(ui): build isolated single-page pdf settlement invoice generator`*

2. **Interactive 2-of-3 Multi-Sig Governance & Voting Interface (`MilestoneTracker.tsx`)**
   * **User Feedback Addressed**: Testers requested clear visual indicators showing how many votes were recorded and who had already voted for contracts exceeding 5,000 XLM.
   * **Implemented Solution**: Added dynamic voting indicators (`voteCount/2`), disabled double-voting states per active wallet address, and integrated explicit governance badge tags across milestones.
   * **Git Commit**: [`f61f8da2d5388e14e876da11508a21a94ddb58a5`](https://github.com/Earth-Kumar-Roy/StellarFlowV2/commit/f61f8da2d5388e14e876da11508a21a94ddb58a5) — *`feat(ui): build interactive milestone review cards with multi-sig governance voting`*

---

### 🔮 Next-Phase Evolution Roadmap (Driven by User Feedback)

1. **Multi-Asset Support (USDC / SAC Custom Tokens)**:
   * Expand Soroban smart contract vaults beyond native XLM to allow locking and releasing of stablecoins (USDC) via the Stellar Asset Contract (SAC) standard.
2. **Automated Notification Dispatch & Inactivity Alerts**:
   * Integrate Web3 push notifications and automated email reminders to alert clients 12 hours before the 48-hour freelancer inactivity claim threshold expires.
3. **Advanced Dashboard Search, Filter & Tagging**:
   * Add real-time client-side search and filtering across active, under review, completed, and expired escrow agreements.
4. **Decentralized Dispute Mediation & DAO Arbitration**:
   * Implement independent decentralized arbitrator pools to resolve contested milestone deliverables on-chain.

---


# 📖 Project Overview

StellarFlow V2 is a non-custodial, milestone-based decentralized escrow and reputation platform engineered on Stellar's high-performance Soroban smart contract framework.

In traditional remote work and Web3 ecosystems, payment processes frequently suffer from payment delays, malicious chargebacks, lack of transparency, and unilateral custody risk. StellarFlow solves this by allowing clients and freelancers to establish cryptographically locked milestone escrow vaults on Stellar Testnet. Funds are locked directly within smart contract WASM bytecode and can only be distributed according to pre-agreed conditions.

The platform builds on the original StellarFlow foundation by introducing multi-signature governance for high-value agreements, automated inactivity-based freelancer protection, downloadable settlement invoicing, and a dual-layer audit architecture spanning both on-chain and off-chain data.

---


# 🆕 What's New in V2?

1. **2-of-3 Multi-Sig Governance for High-Value Agreements** — Contracts exceeding **5,000 XLM** automatically assign 2 independent governance co-signers, requiring a minimum 2-of-3 threshold vote before funds release.
2. **Freelancer Inactivity Auto-Payout Protection** — Protects service providers from indefinite capital freezes by enabling an automated **10% claim after 48 hours** of client unresponsiveness (scaling up to a **40% maximum cap** for extended delays or expired contracts).
3. **Downloadable Single-Page PDF Settlement Invoices** (`InvoiceMaker.tsx`) — Generates deterministic, immutable settlement invoices on demand with clean white-background print optimization and stacked address formatting.
4. **Dual-Layer Audit Architecture** (`TransactionsV2` & `FeedbacksV2`) — Tracks transactions across live Soroban RPC events and concurrent Google Apps Script microservices for permanent logging.

---

# ✨ Features

## Escrow & Non-Custodial Fund Custody

- Direct Soroban vault custody — 100% of project funds are deposited directly into the smart contract instance
- Granular milestone allocations released incrementally as each deliverable passes review
- Automated expiration tracking via responsive countdown timers

---

## High-Value 2-of-3 Multi-Sig Governance (>5,000 XLM)

- Automated governance board assignment — client specifies two trusted co-signer wallet addresses at creation
- Democratic approval thresholds — releasing milestone funds requires at least 2 approval votes across Client, Co-Signer 1, and Co-Signer 2
- On-chain vote auditability preventing double-voting and ensuring transparent execution

---

## Freelancer Inactivity Protection Protocol

- Anti-freeze capital security eliminating indefinite client unresponsiveness risk
- Tier 1 auto-claim — 10% partial payout after 48 hours of client inactivity
- Tier 2 extended auto-claim — up to a 40% cumulative payout cap after 7 days of inactivity or contract deadline expiry
- Deadline boundary protection against malicious last-minute gaming

---

## Automated Settlement PDF Invoicing Engine

- Direct single-page PDF export generated client-side with zero external CDN dependencies
- Immutable invoice metadata — deterministic invoice IDs, settlement dates, milestone itemizations, token vault hashes
- Collision-free address formatting for full 56-character Stellar wallet addresses
- Print optimization — dark-mode UI preview on-screen, crisp white paper output on export

---

## Decentralized Reputation & Feedback System

- Clients rate freelancers on Code & Deliverable Quality, Deadline Adherence, and Communication
- Freelancers rate clients on Approval Speed, Requirement Clarity, and Payment Promptness
- Public FeedbacksV2 feed with real-time aggregate analytics — Total Feedback Count, Interacting Wallet Counters, Average Star Ratings

---

## Dual-Layer Audit Trail & Activity Logging

- Real-time on-chain event tracking powered by Soroban RPC simulation and Horizon endpoints
- Off-chain audit trail (`TransactionsV2`) via Google Apps Script and Google Sheets, visible globally even without a connected wallet
- Automated email notifications dispatched on milestone submission, governance votes, and token releases

---

## Wallet & Security

- Freighter Wallet integration with seamless authentication and hardware-level transaction signing
- Strict authorization checks enforcing Soroban `require_auth()` guarantees
- Client refund protection via `refund_expired` for incomplete or unapproved expired projects

---

# 🏛 System Architecture

## Governance & Settlement Flow

```text
   ┌───────────────────┐   Locks Tokens (>5k XLM)   ┌────────────────────────┐
   │   Client Wallet    │ ─────────────────────────►│  Soroban Escrow Vault  │
   └─────────┬──────────┘                            └───────────┬────────────┘
             │                                                   │
             │ (Work Deliverable Submitted)                      │
             ▼                                                   │
   ┌───────────────────┐    Inactivity Protection Timer          │
   │ Freelancer Wallet  │◄──────────────────────────────────────┤
   └─────────┬──────────┘    • 48 Hours Inactive  ─► Claim 10%   │
             │                • Extended Inactive  ─► Claim 40%  │
             │                                                   │
             │ (Direct Approval or 2-of-3 Governance Voting)     │
             ├───────────────────────────────────────────────────┤
             │                                                   │
   ┌─────────┴──────────┐   Governance Signatures                │
   │  Multi-Sig Signers  │ ────────────────────────────────────►│
   │ (Co-Signer 1 & 2)   │   (Requires 2-of-3 Vote Threshold)     │
   └─────────────────────┘                                       │
                                                                  ▼
   ┌───────────────────┐   Settlement & PDF Generation  ┌────────────────────────┐
   │ Client Feedback &  │◄────────────────────────────── │   InvoiceMaker Engine  │
   │ Reputation Audit   │   (On-Chain Released Balance)  └────────────────────────┘
   └─────────────────────┘
```

## Workflow (Between Client and Freelancer)

**01. Initialize & Lock**
Client creates the escrow agreement via Freighter. XLM tokens transfer from the client wallet to the Soroban Contract Vault. Agreements exceeding 5,000 XLM register two designated governance co-signers.

**02. Work Submission**
Freelancer completes the assigned milestone and submits deliverables. The on-chain milestone state updates to "Under Review" and initializes the 48-hour inactivity protection clock.

**03. Multi-Sig Review & Voting**
For standard contracts (≤5,000 XLM), the client reviews and approves directly. For high-value contracts (>5,000 XLM), the client and co-signers vote on-chain until the 2-of-3 approval threshold is satisfied.

**04. Inactivity Auto-Claim or Standard Release**
If the client remains unresponsive for 48 hours, the freelancer can claim an automated 10% partial payout (scaling to 40% if inactivity persists). Upon standard approval, 100% of the milestone funds transfer to the freelancer.

**05. Invoicing & Reputation Settlement**
Once all milestones are completed and released, counterparties submit on-chain ratings to FeedbacksV2 and export official single-page PDF settlement invoices via InvoiceMaker.tsx.

**06. Refund Protection (If Expired)**
If the project deadline passes and deliverables are incomplete or unapproved, the client executes `refund_expired` to withdraw all remaining locked funds.

---

# 📊 Live Feedback & Activity Proof

- Comprehensive feedback analytics — the live Feedback Page aggregates total feedback counts, distinct participating wallet counters, and counterparty rating distributions.
- High-volume multi-wallet testing — extensively verified across diverse testnet wallets, with contract state transitions viewable on both the in-app Activity Log and Stellar Expert.
- Live on-chain contract activity can be verified directly on Stellar Expert:
  https://stellar.expert/explorer/testnet/contract/CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO

---

# ⚙ Technology Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

---

## Smart Contracts

- Rust
- Soroban SDK

---

## Blockchain

- Stellar Testnet
- Soroban
- Horizon RPC

---

## Web3

- Freighter Wallet API
- `@stellar/stellar-sdk`

---

## Document Generation

- Native DOM Iframe Engine (`InvoiceMaker.tsx`) — zero-network, single-page PDF invoice rendering

---

## Off-Chain Services

- Google Apps Script REST API
- Google Sheets (`TransactionsV2`, `FeedbacksV2` multi-sheet indexing)

---

## Development

- GitHub Actions
- Vercel
- VS Code

---

# 📂 Project Structure

```text
StellarFlow/
├── contracts/
│   └── escrow/
│       ├── Cargo.toml              <-- Rust dependencies & Soroban SDK configuration
│       └── src/
│           ├── lib.rs              <-- Escrow contract logic, multi-sig & inactivity payouts
│           ├── types.rs            <-- Data structures (Escrow, Milestone) & custom error enums
│           ├── storage.rs          <-- Soroban instance storage keys & persistence helpers
│           └── test.rs             <-- Soroban automated unit test suite
├── frontend/
│   ├── public/
│   │   └── favicon.svg             <-- Web3 brand assets
│   ├── src/
│   │   ├── config/
│   │   │   └── stellar.ts          <-- RPC URL, contract ID & Apps Script endpoints
│   │   ├── types/
│   │   │   └── escrow.ts           <-- TypeScript interfaces for Escrow, Milestones & Audit Logs
│   │   ├── utils/
│   │   │   └── api.ts              <-- REST API fetchers for Google Apps Script sheet logs
│   │   ├── hooks/
│   │   │   ├── useWallet.ts        <-- Freighter integration & live XLM balance tracker
│   │   │   └── useEscrow.ts        <-- Soroban contract calls & V2 auto-logging triggers
│   │   ├── components/
│   │   │   ├── Navbar.tsx          <-- Multi-page navigation, XLM balance & role badges
│   │   │   ├── Toast.tsx           <-- On-chain transaction status notifications
│   │   │   ├── MilestoneTracker.tsx<-- Milestone submission, multi-sig voting & inactivity UI
│   │   │   ├── EscrowCard.tsx      <-- Primary contract management interface
│   │   │   ├── InvoiceMaker.tsx    <-- Single-page PDF settlement invoice generator
│   │   │   └── FeedbackModal.tsx   <-- On-chain reputation & sheet logger modal
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       <-- Main operations dashboard
│   │   │   ├── CreateEscrowPage.tsx<-- Full-page contract creation form with co-signers
│   │   │   ├── HistoryPage.tsx     <-- Audit logs (TransactionsV2 & Soroban RPC)
│   │   │   ├── FeedbackPage.tsx    <-- Public counterparty reputation feed (FeedbacksV2)
│   │   │   ├── DocsPage.tsx        <-- Interactive technical documentation
│   │   │   └── LandingPage.tsx     <-- Production landing page & feature overview
│   │   ├── App.tsx                 <-- React Router configuration & global layout
│   │   ├── main.tsx                <-- Application bootstrap entry point
│   │   └── index.css               <-- Tailwind CSS base directives & print styling
│   ├── index.html
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

# 🚀 Installation

Clone the repository.

```bash
git clone https://github.com/Earth-Kumar-Roy/StellarFlowV2.git
```

```bash
cd StellarFlowV2
```

Run smart contract tests and compile WASM bytecode.

```bash
cd contracts/escrow
cargo test
cargo build --target wasm32-unknown-unknown --release
```

Install and start the frontend.

```bash
cd ../../frontend
npm install
npm run dev
```

---

# 🔒 Security

- Non-custodial architecture — private keys never leave the user's Freighter extension
- Soroban access controls — critical contract functions enforce `require_auth()` verification
- Deterministic smart contract execution — milestone releases and timeout refund logic executed immutably on the Stellar ledger
- Contract verification available directly on the Stellar Expert Explorer

Private keys never leave the user's wallet.

---

# 🌍 Deployment

**Frontend**

Vercel

**Blockchain**

Stellar Testnet (Soroban)

**Contract Explorer**

https://stellar.expert/explorer/testnet/contract/CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO

---

# 🔮 Future Roadmap

- DAO-based dispute arbitration with randomized community juror pools
- Cross-asset Soroban vaults — native support for USDC and other Stellar Asset Contract (SAC) tokens alongside XLM
- IPFS deliverable storage — decentralized, cryptographically pinned storage for milestone attachments
- Automated subscription escrows for long-term retainer agreements
- Stellar Mainnet deployment upon audit completion

---

# 👨‍💻 Developer

**Earth Kumar Roy**

GitHub

https://github.com/Earth-Kumar-Roy

Repository

https://github.com/Earth-Kumar-Roy/StellarFlowV2

---

# 🙏 Acknowledgements

- Stellar Development Foundation (SDF)
- Soroban & Rust Developer Community
- Freighter Wallet Team
- React
- Vite
- Vercel

---

<div align="center">

### ⭐ Thank you for exploring StellarFlow V2 ⭐

Built with precision by EKR for the global Web3 freelance and DAO ecosystem on Stellar Soroban.

</div>
