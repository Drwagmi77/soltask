import { Task, TaskType, TaskStatus, Transaction, QualityTier, UserState } from '../types';

// --- Economic Constants ---
export const PLATFORM_FEE_PERCENT = 0.15; // 15% Platform Commission
export const REFERRAL_BONUS_PERCENT = 0.05; // 5% Referral Bonus
export const MOCK_SOL_PRICE_USD = 145.00; // 1 SOL = $145 USD (Fixed for MVP)
export const MIN_WITHDRAWAL_SOL = 0.1; // Minimum balance required to claim

// Base Prices in USD
export const PRICES_USD = {
  [TaskType.LIKE]: 0.01,      // $0.01
  [TaskType.RETWEET]: 0.025,  // $0.025
  [TaskType.COMMENT]: 0.08    // $0.08
};

// Tier Multipliers (Advertiser pays more for better users)
export const TIER_MULTIPLIERS = {
  [QualityTier.BASIC]: 1.0,   // Standard Price
  [QualityTier.PREMIUM]: 1.10, // +10%
  [QualityTier.ELITE]: 1.25    // +25%
};

// In-memory storage
let TASKS: Task[] = [
  {
    id: 't1',
    creatorId: 'system',
    type: TaskType.RETWEET,
    qualityTier: QualityTier.BASIC,
    platform: 'X',
    reward: 0.00017, // ~$0.025 USD
    costPerAction: 0.00020, // Includes fee
    escrowBalance: 0.1, 
    targetLink: 'https://x.com/solana/status/123456789',
    description: 'Retweet Solana Summer Announcement',
    status: TaskStatus.OPEN,
    requiredFollowers: 50,
    minAccountAgeDays: 30,
    createdAt: Date.now() - 86400000,
    maxCompletions: 1000,
    currentCompletions: 450
  },
  {
    id: 't2',
    creatorId: 'system',
    type: TaskType.LIKE,
    qualityTier: QualityTier.PREMIUM,
    platform: 'X',
    reward: 0.000075, // ~$0.011 USD (Premium boost)
    costPerAction: 0.00009,
    escrowBalance: 0.05,
    targetLink: 'https://x.com/phantom/status/987654321',
    description: 'Like Phantom Wallet v3 Update',
    status: TaskStatus.OPEN,
    requiredFollowers: 500,
    minAccountAgeDays: 90,
    createdAt: Date.now() - 172800000,
    maxCompletions: 200,
    currentCompletions: 120
  }
];

let TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    type: 'DEPOSIT',
    amount: 10.0,
    date: Date.now() - 100000000,
    status: 'SUCCESS',
    description: 'Initial Wallet Funding via Solflare'
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSolPrice = (): number => {
  return MOCK_SOL_PRICE_USD;
};

export const getTasks = async (filter?: 'ALL' | 'MY_CAMPAIGNS', creatorId?: string): Promise<Task[]> => {
  await delay(400); 
  if (filter === 'MY_CAMPAIGNS' && creatorId) {
    return TASKS.filter(t => t.creatorId === creatorId).sort((a, b) => b.createdAt - a.createdAt);
  }
  return TASKS.filter(t => t.status === TaskStatus.OPEN && t.currentCompletions < t.maxCompletions);
};

export const verifyTask = async (taskId: string, userFollowers: number): Promise<{success: boolean, message?: string}> => {
  await delay(800);
  
  const task = TASKS.find(t => t.id === taskId);
  if (!task) return { success: false, message: "Task not found" };

  if (userFollowers < task.requiredFollowers) {
    return { success: false, message: "Eligibility criteria not met (Follower count)." };
  }

  if (task.escrowBalance < task.reward) {
      return { success: false, message: "Escrow contract empty. Please contact support." };
  }

  const success = Math.random() > 0.05;
  
  if (success) {
    task.currentCompletions += 1;
    task.escrowBalance -= task.reward; 
    
    if (task.currentCompletions >= task.maxCompletions || task.escrowBalance < task.reward) {
      task.status = TaskStatus.COMPLETED;
    }
  } else {
     return { success: false, message: "X API: Interaction not found. Did you Retweet?" };
  }
  return { success: true };
};

export const createCampaign = async (taskData: any): Promise<Task> => {
  await delay(1000); 
  
  const totalCost = taskData.costPerAction * taskData.maxCompletions;

  const newTask: Task = {
    ...taskData,
    id: `t${Date.now()}`,
    escrowBalance: totalCost, 
    status: TaskStatus.OPEN,
    createdAt: Date.now(),
    currentCompletions: 0
  };
  
  TASKS.unshift(newTask);
  return newTask;
};

export const cancelCampaign = async (taskId: string): Promise<number> => {
    await delay(1000);
    const taskIndex = TASKS.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error("Task not found");

    const task = TASKS[taskIndex];
    if (task.status === TaskStatus.CANCELLED || task.status === TaskStatus.COMPLETED) {
        throw new Error("Task cannot be cancelled");
    }

    const refundAmount = task.escrowBalance;

    TASKS[taskIndex].status = TaskStatus.CANCELLED;
    TASKS[taskIndex].escrowBalance = 0; 

    addTransaction({
        type: 'REFUND',
        amount: refundAmount,
        description: `Refund: Cancelled Task #${task.id.slice(-4)}`
    });

    return refundAmount;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  await delay(400);
  return [...TRANSACTIONS].sort((a, b) => b.date - a.date);
};

export const addTransaction = (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
  TRANSACTIONS.unshift({
    ...tx,
    id: `tx${Date.now()}`,
    date: Date.now(),
    status: 'SUCCESS'
  });
};

export const getAnalytics = async (creatorId: string) => {
  await delay(800);
  const myTasks = TASKS.filter(t => t.creatorId === creatorId);
  const totalSpent = myTasks.reduce((acc, t) => acc + (t.currentCompletions * t.costPerAction), 0);
  const totalEngagements = myTasks.reduce((acc, t) => acc + t.currentCompletions, 0);
  const activeCampaigns = myTasks.filter(t => t.status === TaskStatus.OPEN).length;
  
  return { totalSpent, totalEngagements, activeCampaigns };
};

export const simulateXAuth = async (): Promise<Partial<UserState>> => {
    await delay(1200);
    const isPremium = Math.random() > 0.5;
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return {
        xUsername: isPremium ? '@solana_whale' : '@crypto_newbie',
        followerCount: isPremium ? 1250 : 85,
        accountAgeDays: isPremium ? 500 : 45,
        referralCode: randomCode,
        referralCount: isPremium ? 12 : 0, 
        referralEarnings: isPremium ? 0.45 : 0 
    };
};