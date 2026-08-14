export const EscrowStatus = {
  Active: 'Active',
  Completed: 'Completed',
  Refunded: 'Refunded',
} as const;

export type EscrowStatus = (typeof EscrowStatus)[keyof typeof EscrowStatus];

export interface Milestone {
  id: number;
  description: string;
  amount: string;
  isCompleted: boolean;
  isSubmitted?: boolean;
  isInReview?: boolean; // Legacy/UI work submission status
  submittedAt?: number; // Unix timestamp when work was submitted on-chain
  isDenied?: boolean;
  denialReason?: string;
  autoReleasedAmount?: string; // Stroops/Amount auto-released due to client inactivity
  votes?: string[]; // Addresses of approvers who voted for multi-sig (>5,000 threshold)
}

export interface Escrow {
  client: string;
  clientName?: string;
  clientEmail?: string;
  freelancer: string;
  freelancerName?: string;
  freelancerEmail?: string;
  cosigner1?: string | null;
  cosigner2?: string | null;
  token: string;
  currency?: string; // Token symbol (e.g., XLM, USDC, EURC)
  totalAmount: string;
  releasedAmount: string;
  deadline: number; // Unix timestamp in seconds
  status: EscrowStatus;
  milestones: Milestone[];
}

export interface UserFeedback {
  timestamp: string;
  userName?: string;
  userAddress: string;
  rating: number;
  comment: string;
  recipientAddress?: string;
}

export interface DbTransaction {
  timestamp: string;
  eventType: 
    | 'ESCROW_CREATED' 
    | 'WORK_SUBMITTED' 
    | 'MILESTONE_RELEASED' 
    | 'MILESTONE_DENIED'
    | 'PARTIAL_PAYOUT_RELEASED'
    | 'REFUNDED' 
    | string;
  clientName: string;
  clientAddress: string;
  clientEmail?: string;
  freelancerName: string;
  freelancerAddress: string;
  freelancerEmail?: string;
  cosigner1Address?: string;
  cosigner2Address?: string;
  totalAmount: string;
  currency?: string;
  milestoneId?: number | string;
  milestoneDescription?: string;
  milestoneAmount?: string;
  txHash: string;
  denialReason?: string;
  coSignInfo?: string;
}

export interface TestnetEvent {
  id: string;
  ledger: number;
  createdAt: string;
  topic: string[];
  txHash: string;
}