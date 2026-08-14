<div align="center">

# ⭐ StellarFlow V2

**Multi-Sig Milestone-Based Escrow, Inactivity Protection & On-Chain Reputation dApp on Stellar Soroban**

A production-ready decentralized escrow platform built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Soroban Smart Contracts**, and the **Stellar Network**.

Securely create milestone agreements, cryptographically lock funds inside on-chain smart contract vaults, enforce 2-of-3 multi-sig governance for high-value contracts, protect freelancers via programmatic inactivity auto-claims, generate downloadable settlement PDF invoices, and audit every transaction via real-time on-chain and off-chain data streams.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://stellar-flow-v2.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/github-repository-181717?style=for-the-badge&logo=github)](https://github.com/Earth-Kumar-Roy/StellarFlowV2)
[![Testnet Contract](https://img.shields.io/badge/stellar-testnet%20contract-08b5e5?style=for-the-badge)](https://stellar.expert/explorer/testnet/contract/CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO)
[![Video Demo](https://img.shields.io/badge/video-walkthrough-red?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/1O3dk2ECn6y7M0LR0811sXVriUs0NWygM/view?usp=drive_link)

</div>

---

## 📌 Quick Links

| Resource | Link |
|---|---|
| 🌐 Live Production Demo | [stellar-flow-v2.vercel.app](https://stellar-flow-v2.vercel.app/) |
| 📂 GitHub Repository | [Earth-Kumar-Roy/StellarFlowV2](https://github.com/Earth-Kumar-Roy/StellarFlowV2) |
| 🔎 Testnet Contract Explorer | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO) |
| 🎥 Live Video Demonstration | [Watch Walkthrough](https://drive.google.com/file/d/1O3dk2ECn6y7M0LR0811sXVriUs0NWygM/view?usp=drive_link) |
| 📝 Community Feedback Ledger | [FeedbacksV2 Sheet](https://docs.google.com/spreadsheets/d/14RQ2lbUCWGO36NkopM9LQS3qh0IovK_A1FJGf32xE3U/edit?gid=1227724996#gid=1227724996) |
| 📝 User Onboarding & Evaluation Ledger | [Evaluation Sheet](https://docs.google.com/spreadsheets/d/14RQ2lbUCWGO36NkopM9LQS3qh0IovK_A1FJGf32xE3U/edit?gid=449051969#gid=449051969) |

---

## 📖 Project Overview

**StellarFlow V2** is a non-custodial, milestone-based decentralized escrow and reputation platform engineered on Stellar's high-performance Soroban smart contract framework.

In traditional remote work and Web3 ecosystems, payment processes frequently suffer from payment delays, malicious chargebacks, lack of transparency, and unilateral custody risk. StellarFlow solves this by allowing clients and freelancers to establish cryptographically locked milestone escrow vaults on Stellar Testnet. Funds are locked directly within smart contract WASM bytecode and can only be distributed according to pre-agreed conditions.

### 🆕 What's New in V2?

1. **2-of-3 Multi-Sig Governance for High-Value Agreements** — Contracts exceeding **5,000 XLM** automatically assign 2 independent governance co-signers, requiring a minimum 2-of-3 threshold vote before funds release.
2. **Freelancer Inactivity Auto-Payout Protection** — Protects service providers from indefinite capital freezes by enabling an automated **10% claim after 48 hours** of client unresponsiveness (scaling up to a **40% maximum cap** for extended delays or expired contracts).
3. **Downloadable Single-Page PDF Settlement Invoices** (`InvoiceMaker.tsx`) — Generates deterministic, immutable settlement invoices on demand with clean white-background print optimization and stacked address formatting.
4. **Dual-Layer Audit Architecture** (`TransactionsV2` & `FeedbacksV2`) — Tracks transactions across live Soroban RPC events and concurrent Google Apps Script microservices for permanent logging.

---

## ✨ Comprehensive Features

### 🛡️ Escrow & Non-Custodial Fund Custody
- **Direct Soroban Vault Custody** — 100% of project funds are deposited directly into the smart contract instance. Neither the client, freelancer, nor platform admins hold private custody of funds.
- **Granular Milestone Allocations** — Contracts are broken into flexible milestone deliverables. Capital is released incrementally as each deliverable passes review.
- **Automated Expiration Tracking** — Contracts enforce clear expiration deadlines, monitored continuously via responsive countdown timers.

### 🏛️ High-Value 2-of-3 Multi-Sig Governance (>5,000 XLM)
- **Automated Governance Board Assignment** — Agreements exceeding 5,000 XLM require the client to specify two trusted governance co-signer wallet addresses during escrow creation.
- **Democratic Approval Thresholds** — Releasing milestone funds requires **at least 2 approval votes** across the 3 authorized parties (Client, Co-Signer 1, Co-Signer 2).
- **On-Chain Vote Auditability** — Every approval vote is permanently indexed on-chain, preventing double-voting and ensuring transparent execution.

### ⏱️ Freelancer Inactivity Protection Protocol
- **Anti-Freeze Capital Security** — Eliminates the risk of freelancers completing legitimate work only to have clients go indefinitely unresponsive.
- **Tier 1 Auto-Claim (48 Hours Inactive)** — If the client does not review or approve submitted work within 48 hours, the freelancer is programmatically authorized to claim a **10% partial payout**.
- **Tier 2 Extended Auto-Claim (7 Days / Deadline Passed)** — If client inactivity exceeds 7 days or the contract reaches its final deadline, the freelancer can claim up to a **40% cumulative payout cap**.
- **Deadline Boundary Protection** — Deliverables submitted within 48 hours of contract expiration are protected against malicious last-minute gaming.

### 📄 Automated Settlement PDF Invoicing Engine
- **Direct Single-Page PDF Export** — Upon contract settlement, counterparties can download a financial invoice generated client-side with zero external CDN dependencies.
- **Immutable Invoice Metadata** — Produces deterministic invoice identifiers (e.g., `INV-LNEDH-29913`), settlement dates, milestone itemizations, and token vault hashes.
- **Collision-Free Address Formatting** — Formats full 56-character Stellar wallet addresses using responsive stacked containers and `break-all` wrapping.
- **Print Optimization** — Automatically renders dark-mode UI previews on-screen while delivering crisp white paper backgrounds with high-contrast text during export.

### ⭐ Decentralized Reputation & Feedback System
- **Bi-Directional Evaluation**
  - **Clients rate freelancers on:** Code & Deliverable Quality, Deadline Adherence, and Communication.
  - **Freelancers rate clients on:** Approval Speed, Requirement Clarity, and Payment Promptness.
- **Public FeedbacksV2 Feed** — Real-time aggregate analytics displaying Total Feedback Count, Interacting Wallet Counters, and Average Star Ratings.

### 🔍 Dual-Layer Audit Trail & Activity Logging
- **On-Chain Event Streaming** — Real-time contract event tracking powered by Soroban RPC simulation and Horizon endpoints.
- **Off-Chain Audit Trail** (`TransactionsV2`) — Permanent transaction persistence via Google Apps Script and Google Sheets, visible globally even when no wallet is connected.
- **Automated Email Notifications** — Backend microservice dispatches automated notification emails to counterparties upon milestone submission, governance votes, and token releases.

### 🔒 Web3 Security & Validation
- **Freighter Wallet Integration** — Seamless authentication, public key extraction, and hardware-level transaction signing.
- **Strict Authorization Checks** — Invocations enforce Soroban `require_auth()` guarantees, ensuring only verified contract participants can initiate state transitions.
- **Client Refund Protection** — If a project expires without completion or deliverable approval, the client can invoke `refund_expired` to safely reclaim unreleased funds.

---

## 🏛 System Architecture & Governance Flow

```
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
             │ (Direct Approval or 2-of-3 Governance Voting)      │
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

### 🔄 Complete Execution Workflow Pipeline

| Step | Stage | Description |
|:---:|---|---|
| 01 | **Initialize & Lock** | Client creates the escrow agreement via Freighter. XLM tokens are transferred from the client wallet to the Soroban Contract Vault. Agreements exceeding 5,000 XLM register two designated governance co-signers. |
| 02 | **Work Submission** | Freelancer completes the assigned milestone and submits deliverables. The on-chain milestone state updates to "Under Review" and initializes the 48-hour inactivity protection clock. |
| 03 | **Multi-Sig Review & Voting** | For standard contracts (≤5,000 XLM), the client reviews and approves directly. For high-value contracts (>5,000 XLM), the client and co-signers vote on-chain until the 2-of-3 approval threshold is satisfied. |
| 04 | **Inactivity Auto-Claim or Standard Release** | If the client remains unresponsive for 48 hours, the freelancer can claim an automated 10% partial payout (scaling to 40% if inactivity persists). Upon standard approval, 100% of the milestone funds transfer to the freelancer. |
| 05 | **Invoicing & Reputation Settlement** | Once all milestones are completed and released, counterparties submit on-chain ratings to FeedbacksV2 and export official single-page PDF settlement invoices via InvoiceMaker.tsx. |
| 06 | **Refund Protection (If Expired)** | If the project deadline passes and deliverables are incomplete or unapproved, the client executes `refund_expired` to withdraw all remaining locked funds. |

---

## 📊 Live Feedback & Activity Proof

- **Comprehensive Feedback Analytics** — The live Feedback Page aggregates real-time metrics including total feedback counts, distinct participating wallet counters, and counterparty rating distributions.
- **High-Volume Multi-Wallet Testing** — Extensively verified across diverse testnet wallets, with contract state transitions viewable on both the in-app Activity Log and Stellar Expert.
- **Direct Explorer Verification** — [View Contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO)

---

## ⚙️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite | Reactive component architecture, type-safe state, fast bundling |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Responsive dark/light theme tokens, print-specific stylesheets |
| **Smart Contracts** | Rust, Soroban SDK | WASM milestone escrow logic, multi-sig voting, inactivity handlers |
| **Blockchain Network** | Stellar Testnet | Decentralized consensus, transaction finality (<5s), state storage |
| **Web3 Client Libraries** | Freighter API, `@stellar/stellar-sdk` | Wallet key management, XDR encoding, RPC contract simulation |
| **Document Generator** | Native DOM Iframe Engine (`InvoiceMaker.tsx`) | Zero-network, single-page PDF invoice rendering |
| **Audit Backend** | Google Apps Script REST API | Multi-sheet transaction indexing (TransactionsV2, FeedbacksV2) |
| **Hosting & CI/CD** | Vercel | Production edge deployment and automated continuous delivery |

---

## 📂 Project Structure

```
StellarFlow/
├── contracts/
│   └── escrow/
│       ├── Cargo.toml              # Rust dependencies & Soroban SDK configuration
│       └── src/
│           ├── lib.rs              # Escrow contract logic, multi-sig & inactivity payouts
│           ├── types.rs            # Data structures (Escrow, Milestone) & custom error enums
│           ├── storage.rs          # Soroban instance storage keys & persistence helpers
│           └── test.rs             # Soroban automated unit test suite
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg             # Web3 brand assets
│   ├── src/
│   │   ├── config/
│   │   │   └── stellar.ts          # RPC URL, contract ID & Apps Script endpoints
│   │   ├── types/
│   │   │   └── escrow.ts           # TypeScript interfaces for Escrow, Milestones & Audit Logs
│   │   ├── utils/
│   │   │   └── api.ts              # REST API fetchers for Google Apps Script sheet logs
│   │   ├── hooks/
│   │   │   ├── useWallet.ts        # Freighter integration & live XLM balance tracker
│   │   │   └── useEscrow.ts        # Soroban contract calls & V2 auto-logging triggers
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Multi-page navigation, XLM balance & role badges
│   │   │   ├── Toast.tsx           # On-chain transaction status notifications
│   │   │   ├── MilestoneTracker.tsx # Milestone submission, multi-sig voting & inactivity UI
│   │   │   ├── EscrowCard.tsx      # Primary contract management interface
│   │   │   ├── InvoiceMaker.tsx    # Single-page PDF settlement invoice generator
│   │   │   └── FeedbackModal.tsx   # On-chain reputation & sheet logger modal
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Main operations dashboard
│   │   │   ├── CreateEscrowPage.tsx # Full-page contract creation form with co-signers
│   │   │   ├── HistoryPage.tsx     # Audit logs (TransactionsV2 & Soroban RPC)
│   │   │   ├── FeedbackPage.tsx    # Public counterparty reputation feed (FeedbacksV2)
│   │   │   ├── DocsPage.tsx        # Interactive technical documentation
│   │   │   └── LandingPage.tsx     # Production landing page & feature overview
│   │   ├── App.tsx                 # React Router configuration & global layout
│   │   ├── main.tsx                # Application bootstrap entry point
│   │   └── index.css               # Tailwind CSS base directives & print styling
│   ├── index.html
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation & Local Setup

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** or **yarn**
- **Rust & Cargo** — latest stable toolchain (`rustup target add wasm32-unknown-unknown`)
- **Freighter Wallet Extension** — installed in your browser with Testnet network enabled

### 1. Clone the Repository

```bash
git clone https://github.com/Earth-Kumar-Roy/StellarFlowV2.git
cd StellarFlowV2
```

### 2. Smart Contract Testing & Compilation

```bash
cd contracts/escrow

# Run automated Rust unit tests
cargo test

# Compile WASM bytecode for deployment
cargo build --target wasm32-unknown-unknown --release
```

### 3. Frontend Installation & Execution

```bash
cd ../../frontend

# Install frontend dependencies
npm install

# Start local Vite development server
npm run dev
```

The application will be running locally at **http://localhost:5173**.

---

## 🔒 Security & Verification

- **Non-Custodial Architecture** — Private keys never leave the user's Freighter extension. All on-chain actions require explicit cryptographic signing.
- **Soroban Access Controls** — Critical contract functions enforce `require_auth()` verification, preventing unauthorized third parties from tampering with milestone states or executing unapproved withdrawals.
- **Deterministic Smart Contract Execution** — Milestone releases and timeout refund logic are executed immutably by smart contract bytecode on the Stellar ledger.
- **Contract Verification** — Verify all on-chain transactions directly on the [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO).

---

## 🔮 Future Roadmap

- [ ] **DAO-Based Dispute Arbitration** — Decentralized dispute resolution protocols with randomized community juror pools.
- [ ] **Cross-Asset Soroban Vaults** — Native support for USDC and other Stellar Asset Contract (SAC) tokens alongside XLM.
- [ ] **IPFS Deliverable Storage** — Decentralized, cryptographically pinned storage for milestone deliverable attachments.
- [ ] **Automated Subscription Escrows** — Recurring milestone vault logic for long-term retainer agreements.
- [ ] **Stellar Mainnet Deployment** — Production deployment to Stellar Public Network upon audit completion.

---

## 👨‍💻 Developer & Maintainer

**Earth Kumar Roy**

- GitHub: [@Earth-Kumar-Roy](https://github.com/Earth-Kumar-Roy)
- Repository: [StellarFlowV2](https://github.com/Earth-Kumar-Roy/StellarFlowV2)

---

## 🙏 Acknowledgements

- **Stellar Development Foundation (SDF)** — for pioneering the Soroban smart contract framework.
- **Soroban & Rust Developer Community** — for extensive developer tooling and SDK support.
- **Freighter Wallet Team** — for secure Web3 wallet signing integration.
- **Vercel** — for hosting infrastructure.

---

<div align="center">

### ⭐ Thank you for exploring StellarFlow V2 ⭐

*Built with precision for the global Web3 freelance and DAO ecosystem on Stellar Soroban.*

</div>
