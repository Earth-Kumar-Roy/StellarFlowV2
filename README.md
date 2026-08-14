<div align="center">

# ⭐ StellarFlow V2

### Multi-Sig Milestone Escrow, Inactivity Protection & Reputation dApp on Stellar Soroban

A production-ready decentralized escrow platform built with **React**, **TypeScript**, **Vite**, **Soroban Smart Contracts**, and the **Stellar Network**.

Securely lock funds in non-custodial smart contracts, enforce 2-of-3 governance for high-value agreements, protect freelancers via automated inactivity claims, export instant settlement PDF invoices, and maintain verifiable on-chain audit trails.

---

### 🌐 Live Demo
[stellar-flow-v2.vercel.app](https://stellar-flow-v2.vercel.app/)

### 📂 GitHub Repository
[github.com/Earth-Kumar-Roy/StellarFlowV2](https://github.com/Earth-Kumar-Roy/StellarFlowV2)

### 🔎 Testnet Contract Explorer
[stellar.expert — Testnet Contract](https://stellar.expert/explorer/testnet/contract/CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO)

### 🎥 Demo Presentation Video
[Watch on Google Drive](https://drive.google.com/file/d/1O3dk2ECn6y7M0LR0811sXVriUs0NWygM/view?usp=drive_link)

---

### 📝 Live Governance & Community Audit Logs

- **In-App Community Feedback Ledger (FeedbacksV2)**
  [Open Sheet](https://docs.google.com/spreadsheets/d/14RQ2lbUCWGO36NkopM9LQS3qh0IovK_A1FJGf32xE3U/edit?gid=1227724996#gid=1227724996)
  *(Verifiable log of direct on-chain counterparty reviews and wallet ratings)*

- **User Onboarding & Evaluation Ledger**
  [Open Sheet](https://docs.google.com/spreadsheets/d/14RQ2lbUCWGO36NkopM9LQS3qh0IovK_A1FJGf32xE3U/edit?gid=449051969#gid=449051969)
  *(Community feedback collected during live testnet evaluation)*

</div>

---

## 📖 Project Overview

**StellarFlow V2** is a non-custodial, milestone-based escrow platform built on Stellar's Soroban smart contract framework.

The platform enables clients and freelancers to securely establish milestone agreements where funds are cryptographically locked inside a Soroban smart contract vault. V2 introduces automated **2-of-3 multi-sig governance for high-budget agreements (>5,000 XLM)**, **freelancer inactivity auto-payout protection (10%/40%)**, and **single-page downloadable settlement PDF invoices**, backed by real-time dual audit indexing across Soroban RPC events and Google Apps Script microservices.

---

## ✨ Core Features

### 🛡️ Non-Custodial Multi-Sig Escrow
- **Soroban Smart Contract Vaults** — Funds are locked cryptographically in smart contracts on Stellar Testnet.
- **Granular Milestone Releases** — Programmatic payouts release milestone-by-milestone upon deliverable verification.
- **2-of-3 Governance Board (>5,000 XLM)** — High-value contracts assign 2 independent governance co-signers, requiring at least 2 approval votes before milestone capital transfers.

### ⏱️ Freelancer Inactivity Protection
- **Anti-Freeze Capital Security** — Protects freelancers from funds being indefinitely held by unresponsive clients after work submission.
- **Tier 1 Auto-Claim (48h)** — Unlocks an automated **10% partial payout** directly on-chain if review is inactive for 48 hours.
- **Tier 2 Auto-Claim (Extended Delay / Deadline)** — Unlocks up to a **40% maximum payout cap** if client inactivity persists.

### 📄 Settlement PDF Invoicing Engine
- **Direct PDF Export (`InvoiceMaker.tsx`)** — Generates single-page settlement invoices.
- **Deterministic Contract Auditing** — Includes immutable invoice IDs, timestamp verification, stacked wallet addresses, and milestone settlement logs.
- **Zero-Dependency Document Generation** — Operates fully client-side with clean typography and white-background paper print optimization.

### ⭐ Decentralized Reputation & Feedback
- **Bi-Directional Evaluation** — Clients rate freelancers on code quality and deadline compliance; freelancers rate clients on approval speed and requirement clarity.
- **Public FeedbacksV2 Feed** — Real-time counterparty ratings and aggregate analytics for participating wallets.

### 🔍 Dual-Layer Audit Trail & Wallet Integration
- **Freighter Wallet Integration** — Testnet account synchronization with live XLM balance tracking.
- **TransactionsV2 Logging** — Dual activity tracking via Soroban RPC events and persistent Google Sheets audit trails.

---

## 🏛 System Architecture

### Soroban V2 Governance & Settlement Flow

```text
   ┌───────────────────┐    Locks Tokens (>5k XLM)   ┌────────────────────────┐
   │   Client Wallet    │ ──────────────────────────► │  Soroban Escrow Vault  │
   └─────────┬──────────┘                             └───────────┬────────────┘
             │                                                    │
             │ (Work Deliverable Submitted)                       │
             ▼                                                    │
   ┌───────────────────┐    Inactivity Protection Timer           │
   │ Freelancer Wallet  │◄──────────────────────────────────────┤
   └─────────┬──────────┘    • 48 Hours Inactive  ─► Claim 10%    │
             │                • Extended Inactive  ─► Claim 40%    │
             │                                                    │
             │ (Direct Approval or 2-of-3 Governance Voting)       │
             ├────────────────────────────────────────────────────┤
             │                                                    │
   ┌─────────┴──────────┐    Governance Signatures                │
   │ Multi-Sig Signers   │ ────────────────────────────────────────┤
   │ (Co-Signer 1 & 2)   │    (Requires 2-of-3 Vote Threshold)     │
   └─────────────────────┘                                        │
                                                                    ▼
   ┌───────────────────┐    Settlement & PDF Generation   ┌────────────────────────┐
   │ Client Feedback &  │◄────────────────────────────────│  InvoiceMaker Engine   │
   │ Reputation Audit   │    (On-Chain Released Balance)   └────────────────────────┘
   └───────────────────┘
```

---

## 🔄 Execution Workflow Pipeline

**01. CREATE & LOCK**
Client initializes contract via Freighter. Tokens lock inside the Soroban Vault. Contracts exceeding 5,000 XLM register 2 designated governance co-signers.

**02. WORK SUBMISSION**
Freelancer completes milestone work and submits deliverables. The on-chain milestone state updates to review mode and triggers the 48-hour inactivity timer.

**03. MULTI-SIG VOTE / REVIEW**
Client or assigned co-signers review work. Contracts >5k XLM record approval votes on-chain until the 2-of-3 threshold is met.

**04. INACTIVITY CLAIM OR APPROVAL RELEASE**
If the client remains unresponsive for 48h, the freelancer can claim an automated 10% (or up to 40%) payout. Upon standard approval, 100% of the milestone funds transfer.

**05. PDF INVOICE & REPUTATION SETTLEMENT**
Upon complete agreement payout, counterparties submit on-chain ratings and export verified single-page PDF settlement invoices.

---

## ⚙ Technology Stack

| Layer | Technologies |
|---|---|
| **Smart Contracts** | Rust, Soroban SDK, WebAssembly (`wasm32-unknown-unknown`) |
| **Blockchain** | Stellar Testnet, Soroban RPC, Horizon API |
| **Web3 Client** | Freighter Wallet API, `@stellar/stellar-sdk` |
| **Frontend UI** | React, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Document Engine** | Client-Side PDF Generation Engine (`InvoiceMaker.tsx`) |
| **Audit Backend** | Google Apps Script REST API, Google Sheets (`TransactionsV2`, `FeedbacksV2`) |
| **Deployment** | Vercel (Frontend), Stellar Testnet (Smart Contracts) |

---

## 📂 Project Structure

```text
StellarFlow/
├── contracts/
│   └── escrow/
│       ├── Cargo.toml              <-- Rust Dependencies & Soroban SDK configuration
│       └── src/
│           ├── lib.rs              <-- Escrow Contract logic, Multi-Sig & Inactivity Payouts
│           ├── types.rs            <-- Data structures (Escrow, Milestone) & custom error enums
│           ├── storage.rs          <-- Soroban Instance Storage keys & persistence helpers
│           └── test.rs             <-- Soroban unit tests
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── config/
│   │   │   └── stellar.ts          <-- RPC, Contract ID & Apps Script endpoints
│   │   ├── types/
│   │   │   └── escrow.ts           <-- TypeScript interfaces for Escrow, Milestones & Audit Logs
│   │   ├── utils/
│   │   │   └── api.ts              <-- API fetchers for Google Apps Script sheet logs
│   │   ├── hooks/
│   │   │   ├── useWallet.ts        <-- Freighter integration & live XLM balance tracker
│   │   │   └── useEscrow.ts        <-- Soroban contract calls & V2 auto-logging triggers
│   │   ├── components/
│   │   │   ├── Navbar.tsx          <-- Multi-page Navigation, XLM Balance & Role Badges
│   │   │   ├── Toast.tsx           <-- On-chain transaction status toasts
│   │   │   ├── MilestoneTracker.tsx<-- Milestone submission, multi-sig voting & inactivity UI
│   │   │   ├── EscrowCard.tsx      <-- Primary contract management interface
│   │   │   ├── InvoiceMaker.tsx    <-- Single-page PDF settlement invoice generator
│   │   │   └── FeedbackModal.tsx   <-- On-chain reputation & sheet logger modal
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       <-- Main Operations Dashboard
│   │   │   ├── CreateEscrowPage.tsx<-- Full-page contract creation form
│   │   │   ├── HistoryPage.tsx     <-- Audit Logs (TransactionsV2 & Soroban RPC)
│   │   │   ├── FeedbackPage.tsx    <-- Public Counterparty Reputation Feed (FeedbacksV2)
│   │   │   └── DocsPage.tsx        <-- Interactive Technical Documentation
│   │   ├── App.tsx                 <-- React Router configuration & global layout
│   │   ├── main.tsx                <-- Entry point
│   │   └── index.css               <-- Tailwind CSS base directives
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Earth-Kumar-Roy/StellarFlowV2.git
cd StellarFlowV2
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Smart Contract Build & Test

```bash
cd contracts/escrow
cargo test
cargo build --target wasm32-unknown-unknown --release
```

---

## 🔒 Security & Verification

- **Non-Custodial Architecture** — Private keys and wallet authentication remain strictly inside the user's Freighter extension.
- **Contract Authorization Checks** — Only authorized counterparties or designated multi-sig co-signers can execute voting or release functions.
- **Deadline Refund Protection** — Clients retain `refund_expired` rights to retrieve unreleased capital if agreements lapse past deadlines.
- **Contract Verification** — Verify transactions live on [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO).

---

## 👨‍💻 Developer

**Earth Kumar Roy**
GitHub: [@Earth-Kumar-Roy](https://github.com/Earth-Kumar-Roy)
Repository: [StellarFlowV2](https://github.com/Earth-Kumar-Roy/StellarFlowV2)

---

## 🙏 Acknowledgements

- Stellar Development Foundation (SDF) & Soroban Framework
- Freighter Wallet Team
- Vercel Hosting Platform

---

<div align="center">

**⭐ StellarFlow V2 — Trustless Work Escrow on Stellar Soroban ⭐**

</div>
