import React, { useEffect, useState } from 'react';
import { Twitter, RefreshCw, CheckCircle, ExternalLink, Filter, Trophy, Coins, Lock, UserCheck, Users, Loader2, ShieldCheck, ArrowRight, Wallet, Copy, Share2, Gem, ArrowUpCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Task, TaskStatus, TaskType, WalletState, QualityTier, UserState, Language } from '../types';
import * as MockService from '../services/mockService';
import { getTranslation } from '../services/translations';

interface EarnerDashboardProps {
  wallet: WalletState;
  updateBalance: (amount: number) => void;
  xLinked: boolean;
  linkXAccount: () => void;
  userState: UserState;
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

type VerificationStep = 'IDLE' | 'CHECKING_API' | 'UPDATING_BALANCE' | 'SUCCESS' | 'ERROR';

export const EarnerDashboard: React.FC<EarnerDashboardProps> = ({ 
  wallet, 
  updateBalance, 
  xLinked, 
  linkXAccount,
  userState,
  notify
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'history' | 'referrals'>('available');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [solPrice, setSolPrice] = useState(MockService.getSolPrice());
  const [isClaiming, setIsClaiming] = useState(false);

  // Verification State
  const [verifyingTask, setVerifyingTask] = useState<{id: string, step: VerificationStep} | null>(null);
  
  const [filterType, setFilterType] = useState<TaskType | 'ALL'>('ALL');

  // Hardcoded language for dashboard specific text for now, in a real app would be prop
  // But we can use English default or pass language prop from App.tsx. 
  // Assuming English context for logic messages, but components use the TRANSLATIONS.
  // For this snippet, I will read TRANSLATIONS['EN'] default or make it generic.
  // The App passes language to LandingPage, let's assume this view receives it too or we default.
  // Since I can't easily change App.tsx props in this single file view without breaking interface,
  // I will use a simple localized string lookup assuming 'EN' or simple logic.
  
  // Actually, let's just make the UI look good with the data we have.

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const data = await MockService.getTasks();
    setTasks(data);
    setLoading(false);
  };

  const handleVerify = async (task: Task) => {
    if (verifyingTask) return; 

    setVerifyingTask({ id: task.id, step: 'CHECKING_API' });
    
    try {
      await new Promise(r => setTimeout(r, 1000));

      const result = await MockService.verifyTask(task.id, userState.followerCount);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setVerifyingTask({ id: task.id, step: 'UPDATING_BALANCE' });
      await new Promise(r => setTimeout(r, 500)); 

      setVerifyingTask({ id: task.id, step: 'SUCCESS' });
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: TaskStatus.COMPLETED } : t
      ));
      
      notify('success', `Task Verified! Added ${task.reward} SOL to Unclaimed Balance`);

      setTimeout(() => {
        setVerifyingTask(null);
      }, 2000);

    } catch (error: any) {
      console.error(error);
      notify('error', error.message || "Verification failed.");
      setVerifyingTask({ id: task.id, step: 'ERROR' });
      setTimeout(() => setVerifyingTask(null), 2000);
    }
  };

  const handleClaim = async () => {
    if (userState.unclaimedBalance < MockService.MIN_WITHDRAWAL_SOL) {
      notify('error', `Minimum withdrawal is ${MockService.MIN_WITHDRAWAL_SOL} SOL.`);
      return;
    }
    
    if (!wallet.connected) {
      notify('info', "Please connect your wallet first to withdraw funds.");
      return;
    }

    setIsClaiming(true);
    try {
      await new Promise(r => setTimeout(r, 1500)); 
      updateBalance(userState.unclaimedBalance); 
      notify('success', `Successfully claimed ${userState.unclaimedBalance.toFixed(4)} SOL to your wallet!`);
    } catch (e) {
      notify('error', "Claim failed. Try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  const copyReferralLink = () => {
      const link = `https://soltask.app/invite/${userState.referralCode}`;
      navigator.clipboard.writeText(link);
      notify('success', 'Referral link copied to clipboard!');
  };

  if (!xLinked) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="relative w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 border border-slate-800 shadow-2xl">
            <Twitter size={48} className="text-[#1DA1F2]" />
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Identity First</h2>
        <p className="text-slate-400 max-w-md mb-8 text-lg leading-relaxed">
          Link your X account to start earning immediately. No wallet required until you are ready to withdraw.
        </p>
        <Button onClick={linkXAccount} size="lg" className="bg-[#1DA1F2] hover:bg-[#1a94df] text-white border-none shadow-lg shadow-blue-500/20 px-8">
          Connect X Account
        </Button>
      </div>
    );
  }

  // Filter logic
  const filteredTasks = tasks.filter(t => {
     if (activeTab === 'history') return t.status === TaskStatus.COMPLETED;
     if (activeTab === 'referrals') return false; 
     if (t.status === TaskStatus.COMPLETED) return false;
     return filterType === 'ALL' || t.type === filterType;
  });

  // Calculate Progress Logic
  const minWithdraw = MockService.MIN_WITHDRAWAL_SOL;
  const progressPercent = Math.min(100, (userState.unclaimedBalance / minWithdraw) * 100);
  const isWithdrawReady = userState.unclaimedBalance >= minWithdraw;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      
      {/* Profile & Balance Header */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Profile Card */}
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-24 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-5 relative z-10">
                <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-200 border border-slate-700 shadow-lg">
                    <img 
                    src={`https://ui-avatars.com/api/?name=${userState.xUsername}&background=random`} 
                    alt="Avatar" 
                    className="rounded-xl"
                    />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-white">{userState.xUsername}</h2>
                        {userState.followerCount > 500 && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold uppercase tracking-wide">
                            Premium Earner
                        </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><Users size={14}/> {userState.followerCount} Followers</span>
                        <span className="flex items-center gap-1"><ShieldCheck size={14}/> {userState.accountAgeDays} Days Old</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Unclaimed Balance Card with Progress Bar */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                   <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Unclaimed Earnings</div>
                   <div className="text-xs font-mono text-slate-500">Goal: {minWithdraw} SOL</div>
                </div>
                
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono mb-4">
                    {userState.unclaimedBalance.toFixed(4)} SOL
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                   <div 
                     className={`h-full transition-all duration-1000 ease-out ${isWithdrawReady ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}`} 
                     style={{ width: `${progressPercent}%` }}
                   ></div>
                </div>
                <div className="text-[10px] text-right text-slate-500 mb-4">
                   {progressPercent.toFixed(0)}% to payout
                </div>
            </div>

            <div className="mt-auto relative z-10">
                {wallet.connected ? (
                    <Button 
                        onClick={handleClaim} 
                        disabled={!isWithdrawReady || isClaiming}
                        className={`w-full justify-between transition-all ${isWithdrawReady ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border-green-500/30' : 'opacity-70 grayscale'}`}
                        variant={isWithdrawReady ? 'primary' : 'secondary'}
                        isLoading={isClaiming}
                    >
                        <span>{isWithdrawReady ? 'Withdraw Funds' : `Reach ${minWithdraw} SOL`}</span>
                        {isWithdrawReady ? <ArrowUpCircle size={18} /> : <Lock size={16} />}
                    </Button>
                ) : (
                    <div className="text-center">
                        <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-400 hover:text-white" disabled>
                            Connect Wallet to Withdraw
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Quest Board Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 border-b border-slate-800 pb-4">
        <div className="flex gap-6">
           <button 
             onClick={() => setActiveTab('available')} 
             className={`pb-4 text-sm font-medium transition-all relative ${activeTab === 'available' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             Available Quests
             {activeTab === 'available' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
           </button>
           <button 
             onClick={() => setActiveTab('history')} 
             className={`pb-4 text-sm font-medium transition-all relative ${activeTab === 'history' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             History
             {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
           </button>
           <button 
             onClick={() => setActiveTab('referrals')} 
             className={`pb-4 text-sm font-medium transition-all relative ${activeTab === 'referrals' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-bold' : 'text-slate-500 hover:text-pink-300'}`}
           >
             <span className="flex items-center gap-1">Referrals <Gem size={12} className={activeTab === 'referrals' ? 'text-purple-400' : 'text-slate-500'}/></span>
             {activeTab === 'referrals' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>}
           </button>
        </div>

        {activeTab === 'available' && (
          <div className="flex items-center gap-3">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Filter size={14} className="text-slate-500" />
                </div>
                <select 
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 p-2.5 appearance-none cursor-pointer hover:bg-slate-800 transition-colors"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                >
                   <option value="ALL">All Quests</option>
                   <option value="LIKE">Likes</option>
                   <option value="RETWEET">Retweets</option>
                   <option value="COMMENT">Replies</option>
                </select>
             </div>
             <Button variant="ghost" onClick={loadTasks} disabled={loading} size="sm" className="text-slate-400">
                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
             </Button>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      
      {/* Referral Tab Content */}
      {activeTab === 'referrals' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-900/20 border border-slate-800 rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
              
              <div className="max-w-2xl mx-auto relative z-10">
                 <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-800 border border-slate-700 mb-6 shadow-xl">
                    <Share2 size={32} className="text-purple-400" />
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-3">Invite Friends, Earn Crypto</h2>
                 <p className="text-slate-400 text-lg mb-8">
                    Share your unique link. Earn <span className="text-white font-bold">5%</span> of all rewards your friends earn, forever. Passive income on Solana.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto mb-10">
                    <div className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 font-mono text-sm truncate">
                       https://soltask.app/invite/{userState.referralCode}
                    </div>
                    <Button onClick={copyReferralLink} className="w-full sm:w-auto shrink-0 shadow-lg shadow-purple-500/20">
                       <Copy size={16} className="mr-2" /> Copy Link
                    </Button>
                 </div>

                 <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                       <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Referrals</div>
                       <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                          <Users size={20} className="text-blue-400" />
                          {userState.referralCount}
                       </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                       <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Referral Earnings</div>
                       <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
                          <Gem size={20} className="text-green-500" />
                          {userState.referralEarnings} SOL
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Task List (Zealy Style Rows) - Only for 'available' or 'history' */}
      {activeTab !== 'referrals' && (
        loading ? (
          <div className="space-y-3 animate-pulse">
             {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-900/50 rounded-xl border border-slate-800"></div>)}
          </div>
        ) : filteredTasks.length === 0 ? (
           <div className="text-center py-24 bg-slate-900/20 rounded-xl border border-slate-800 border-dashed">
              <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">No active quests found.</p>
              <p className="text-slate-600 text-sm">Check back later for new campaigns.</p>
           </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <QuestRow 
                key={task.id} 
                task={task} 
                userFollowers={userState.followerCount}
                onVerify={() => handleVerify(task)}
                verifyingState={verifyingTask?.id === task.id ? verifyingTask.step : 'IDLE'}
                solPrice={solPrice}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

interface QuestRowProps {
  task: Task;
  userFollowers: number;
  onVerify: () => void;
  verifyingState: VerificationStep;
  solPrice: number;
}

const QuestRow: React.FC<QuestRowProps> = ({ task, userFollowers, onVerify, verifyingState, solPrice }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isEligible = userFollowers >= task.requiredFollowers;
  const isVerifying = verifyingState !== 'IDLE';

  let buttonContent = (
      <>
        <span className="font-bold">Verify</span>
        <span className="hidden sm:inline text-xs opacity-70 ml-1">+{task.reward} SOL</span>
      </>
  );

  if (isCompleted) {
    buttonContent = <span className="flex items-center gap-1"><CheckCircle size={16}/> Done</span>;
  } else if (verifyingState === 'CHECKING_API') {
    buttonContent = <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin"/> Checking X...</span>;
  } else if (verifyingState === 'UPDATING_BALANCE') {
    buttonContent = <span className="flex items-center gap-2"><Coins size={16} className="animate-pulse"/> Paying...</span>;
  } else if (verifyingState === 'SUCCESS') {
    buttonContent = <span className="flex items-center gap-2 text-green-300"><CheckCircle size={16}/> Paid!</span>;
  } else if (!isEligible) {
    buttonContent = <span className="flex items-center gap-1"><Lock size={14}/> {task.requiredFollowers}+ Followers</span>;
  }

  const iconColors = {
      [TaskType.RETWEET]: 'bg-green-500/20 text-green-400 border-green-500/30',
      [TaskType.LIKE]: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      [TaskType.COMMENT]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const iconSymbols = {
      [TaskType.RETWEET]: '🔄',
      [TaskType.LIKE]: '❤️',
      [TaskType.COMMENT]: '💬',
  };

  return (
    <div className={`relative group p-4 rounded-xl border transition-all duration-300 ${isCompleted ? 'bg-slate-900/30 border-slate-800 opacity-60 grayscale-[0.5]' : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 hover:shadow-lg'}`}>
       <div className="flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 flex-1">
             <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl border ${iconColors[task.type]}`}>
                {iconSymbols[task.type]}
             </div>
             
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <h3 className="font-semibold text-slate-200 truncate pr-2">{task.description}</h3>
                   {task.qualityTier !== QualityTier.BASIC && (
                       <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${task.qualityTier === QualityTier.PREMIUM ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'}`}>
                           {task.qualityTier}
                       </span>
                   )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Coins size={12}/> {task.reward} SOL <span className="opacity-50">(${(task.reward * solPrice).toFixed(3)})</span></span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span>{task.currentCompletions}/{task.maxCompletions} claimed</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <a 
               href={task.targetLink} 
               target="_blank" 
               rel="noreferrer"
               className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-transparent hover:border-slate-600"
               title="Open Tweet"
             >
                <ExternalLink size={18} />
             </a>
             <Button 
                onClick={onVerify} 
                disabled={isCompleted || !isEligible || isVerifying}
                size="sm"
                className={`min-w-[120px] ${isCompleted ? 'bg-transparent border-slate-700 text-green-500' : ''}`}
                variant={!isEligible ? 'secondary' : 'primary'}
             >
                {buttonContent}
             </Button>
          </div>
       </div>
    </div>
  );
};