
export enum UserRole {
  GUEST = 'GUEST',
  EARNER = 'EARNER',
  ADVERTISER = 'ADVERTISER',
}

export type Language = 'EN' | 'DE' | 'ES' | 'TR';

export enum TaskType {
  LIKE = 'LIKE',
  RETWEET = 'RETWEET',
  COMMENT = 'COMMENT',
}

export enum TaskStatus {
  OPEN = 'OPEN',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED' // Triggers refund
}

export enum QualityTier {
  BASIC = 'BASIC',       // Min 50 followers
  PREMIUM = 'PREMIUM',   // Min 500 followers
  ELITE = 'ELITE'        // Min 1000 followers (Future)
}

export interface Task {
  id: string;
  creatorId: string;
  type: TaskType;
  qualityTier: QualityTier;
  platform: 'X';
  reward: number; // in SOL (Paid to earner)
  costPerAction: number; // in SOL (Paid by advertiser including fee)
  escrowBalance: number; // New: Live balance in smart contract for this task
  targetLink: string;
  description: string;
  status: TaskStatus;
  requiredFollowers: number;
  minAccountAgeDays: number;
  createdAt: number;
  maxCompletions: number;
  currentCompletions: number;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number; // in SOL
}

export interface UserState {
  role: UserRole;
  xAccountLinked: boolean;
  xUsername: string | null;
  // Earnings Logic Update
  unclaimedBalance: number; // Off-chain balance waiting to be claimed
  totalLifetimeEarnings: number; // Historical data
  reputationScore: number;
  // X Profile Stats
  followerCount: number;
  accountAgeDays: number;
  // Referral System
  referralCode: string | null;
  referralCount: number;
  referralEarnings: number; // SOL earned from friends
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'EARNING' | 'SPEND' | 'REFUND' | 'REFERRAL_BONUS';
  amount: number;
  date: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  description: string;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
}