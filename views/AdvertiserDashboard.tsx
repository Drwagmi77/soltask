import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, DollarSign, Wallet, Activity, ArrowUpRight, Shield, Users, AlertTriangle, PauseCircle, StopCircle, Receipt, Info } from 'lucide-react';
import { Button } from '../components/Button';
import { TaskType, WalletState, TaskStatus, QualityTier } from '../types';
import * as MockService from '../services/mockService';

interface AdvertiserDashboardProps {
  wallet: WalletState;
  updateBalance: (amount: number) => void;
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const AdvertiserDashboard: React.FC<AdvertiserDashboardProps> = ({ wallet, updateBalance, notify }) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'create'>('campaigns');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ totalSpent: 0, totalEngagements: 0, activeCampaigns: 0 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Economic State
  const [solPrice, setSolPrice] = useState(MockService.getSolPrice());
  
  // Form State
  const [formData, setFormData] = useState({
    type: TaskType.RETWEET,
    tier: QualityTier.BASIC,
    link: '',
    quantity: 100,
  });

  // --- Dynamic Cost Calculator ---
  const calculateCosts = () => {
     // 1. Get Base USD Price
     const baseUsd = MockService.PRICES_USD[formData.type];
     
     // 2. Apply Tier Multiplier
     const tierMultiplier = MockService.TIER_MULTIPLIERS[formData.tier];
     const earnerRewardUsd = baseUsd * tierMultiplier;
     
     // 3. Calculate Fee
     const platformFeeUsd = earnerRewardUsd * MockService.PLATFORM_FEE_PERCENT;
     
     // 4. Total USD Cost per Action
     const costPerActionUsd = earnerRewardUsd + platformFeeUsd;
     const totalCampaignCostUsd = costPerActionUsd * formData.quantity;
     
     // 5. Convert to SOL
     const earnerRewardSol = earnerRewardUsd / solPrice;
     const costPerActionSol = costPerActionUsd / solPrice;
     const totalCampaignCostSol = totalCampaignCostUsd / solPrice;

     return {
         baseUsd,
         earnerRewardUsd,
         platformFeeUsd,
         costPerActionUsd,
         totalCampaignCostUsd,
         earnerRewardSol,
         costPerActionSol,
         totalCampaignCostSol
     };
  };

  const costs = calculateCosts();

  useEffect(() => {
    loadData();
    // Simulate live price update every 30s
    const interval = setInterval(() => {
        setSolPrice(MockService.getSolPrice());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const tasks = await MockService.getTasks('MY_CAMPAIGNS', 'current_user'); 
    const stats = await MockService.getAnalytics('current_user');
    setCampaigns(tasks);
    setAnalytics(stats);
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wallet.balance < costs.totalCampaignCostSol) {
      notify('error', "Insufficient funds for Escrow deposit!");
      return;
    }

    notify('info', "Interacting with Smart Contract...");
    
    try {
      const newTask = await MockService.createCampaign({
        creatorId: 'current_user',
        type: formData.type,
        qualityTier: formData.tier,
        targetLink: formData.link,
        reward: costs.earnerRewardSol,
        costPerAction: costs.costPerActionSol,
        description: `${formData.tier === QualityTier.PREMIUM ? 'Premium' : formData.tier === QualityTier.ELITE ? 'Elite' : 'Basic'} ${formData.type} Campaign`,
        platform: 'X',
        requiredFollowers: formData.tier === QualityTier.PREMIUM ? 500 : formData.tier === QualityTier.ELITE ? 5000 : 50,
        minAccountAgeDays: formData.tier === QualityTier.PREMIUM ? 90 : 30,
        maxCompletions: formData.quantity
      });

      MockService.addTransaction({
        type: 'SPEND',
        amount: -costs.totalCampaignCostSol,
        description: `Escrow Lock: Task #${newTask.id.slice(-4)}`
      });
      
      updateBalance(-costs.totalCampaignCostSol);
      notify('success', `Campaign Created! Locked ${costs.totalCampaignCostSol.toFixed(4)} SOL`);
      
      setActiveTab('campaigns');
      loadData();
    } catch (err) {
      console.error(err);
      notify('error', 'Transaction failed.');
    }
  };

  const handleCancel = async (taskId: string) => {
      if(!confirm("Are you sure? Unspent funds will be refunded to your wallet.")) return;
      notify('info', "Processing refund via Escrow...");
      try {
          const refundAmount = await MockService.cancelCampaign(taskId);
          updateBalance(refundAmount);
          notify('success', `Campaign Cancelled. Refunded: ${refundAmount.toFixed(4)} SOL`);
          loadData();
      } catch (e: any) {
          notify('error', e.message);
      }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<DollarSign className="text-indigo-400" />} label="Total Invested" value={`${analytics.totalSpent.toFixed(3)} SOL`} />
        <StatCard icon={<Activity className="text-green-400" />} label="Total Engagements" value={analytics.totalEngagements.toString()} />
        <StatCard icon={<BarChart3 className="text-purple-400" />} label="Active Campaigns" value={analytics.activeCampaigns.toString()} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
             <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button onClick={() => setActiveTab('campaigns')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'campaigns' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Active Campaigns</button>
                <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>+ New Campaign</button>
             </div>
             <div className="text-xs text-slate-500 font-mono hidden sm:block">
                 Oracle: 1 SOL = ${solPrice.toFixed(2)}
             </div>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
               <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Create Engagement Campaign</h2>
                    <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-indigo-400 border border-indigo-500/20">
                        USD-Pegged Pricing
                    </div>
               </div>
               
               <form onSubmit={handleCreate} className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                     
                     {/* Interaction Type */}
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">1. Interaction Type</label>
                        <div className="grid grid-cols-3 gap-3">
                           {[TaskType.RETWEET, TaskType.LIKE, TaskType.COMMENT].map(type => (
                              <button
                                type="button"
                                key={type}
                                onClick={() => setFormData({...formData, type})}
                                className={`relative py-4 px-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2 ${formData.type === type ? 'bg-indigo-600 border-indigo-500 text-white ring-1 ring-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                              >
                                 <span className="text-xl">{type === 'LIKE' ? '❤️' : type === 'RETWEET' ? '🔄' : '💬'}</span>
                                 <span>{type}</span>
                                 <span className="text-[10px] opacity-70 bg-black/20 px-2 py-0.5 rounded-full">
                                     ~${MockService.PRICES_USD[type]}
                                 </span>
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Quality Tier */}
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">2. Quality Tier</label>
                        <div className="grid grid-cols-3 gap-3">
                           <TierOption 
                             title="Basic"
                             tier={QualityTier.BASIC}
                             selected={formData.tier === QualityTier.BASIC}
                             onSelect={() => setFormData({...formData, tier: QualityTier.BASIC})}
                             multiplier="1.0x"
                             requirements={["50+ Followers", "30+ Days Old"]}
                           />
                           <TierOption 
                             title="Premium"
                             tier={QualityTier.PREMIUM}
                             selected={formData.tier === QualityTier.PREMIUM}
                             onSelect={() => setFormData({...formData, tier: QualityTier.PREMIUM})}
                             multiplier="1.1x"
                             requirements={["500+ Followers", "90+ Days Old"]}
                             isPopular
                           />
                           <TierOption 
                             title="Elite"
                             tier={QualityTier.ELITE}
                             selected={formData.tier === QualityTier.ELITE}
                             onSelect={() => setFormData({...formData, tier: QualityTier.ELITE})}
                             multiplier="1.25x"
                             requirements={["5k+ Followers", "High Impact"]}
                           />
                        </div>
                     </div>

                     {/* Details */}
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-400 mb-1">Target X Post URL</label>
                           <input 
                              required
                              type="url"
                              placeholder="https://x.com/username/status/..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:outline-none text-white"
                              value={formData.link}
                              onChange={e => setFormData({...formData, link: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label>
                           <input 
                              type="number"
                              min="10"
                              max="10000"
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:outline-none text-white"
                              value={formData.quantity}
                              onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Summary Panel (Receipt) */}
                  <div className="bg-slate-950 rounded-xl p-0 border border-slate-800 flex flex-col h-full shadow-xl shadow-black/20 overflow-hidden relative">
                     {/* Receipt Header */}
                     <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                         <span className="text-sm font-bold text-white flex items-center gap-2"><Receipt size={16}/> COST SUMMARY</span>
                         <span className="text-[10px] font-mono text-slate-500">Live Quote</span>
                     </div>

                     <div className="p-6 space-y-4 text-sm flex-1">
                        <div className="flex justify-between items-center group relative">
                           <span className="text-slate-400 flex items-center gap-1">Earner Reward <Info size={12} className="text-slate-600"/></span>
                           <span className="font-mono text-slate-200">${costs.earnerRewardUsd.toFixed(4)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                           <span className="text-slate-400">Platform Fee (15%)</span>
                           <span className="font-mono text-slate-200">${costs.platformFeeUsd.toFixed(5)}</span>
                        </div>
                        
                        <div className="h-px bg-slate-800 border-t border-dashed border-slate-700 my-2"></div>
                        
                        <div className="flex justify-between items-center font-medium">
                           <span className="text-indigo-300">Cost per Action</span>
                           <span className="font-mono text-white">${costs.costPerActionUsd.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-slate-400">Quantity</span>
                           <span className="font-mono text-slate-200">x {formData.quantity}</span>
                        </div>

                         <div className="bg-slate-900/50 p-3 rounded-lg mt-4 border border-slate-800">
                             <div className="flex justify-between text-xs text-slate-500 mb-1">
                                 <span>Subtotal (USD)</span>
                                 <span>${costs.totalCampaignCostUsd.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-xs text-slate-500">
                                 <span>Exchange Rate</span>
                                 <span>${solPrice} / SOL</span>
                             </div>
                         </div>
                     </div>

                     <div className="p-6 bg-slate-900/50 border-t border-slate-800">
                        <div className="flex justify-between items-end mb-6">
                           <span className="text-slate-300 font-medium">Total Escrow</span>
                           <div className="text-right">
                               <div className="text-3xl font-bold text-white font-mono">{costs.totalCampaignCostSol.toFixed(4)} <span className="text-lg text-slate-500">SOL</span></div>
                               <div className="text-xs text-slate-500">≈ ${costs.totalCampaignCostUsd.toFixed(2)} USD</div>
                           </div>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full py-4 text-lg" 
                          isLoading={false}
                          disabled={wallet.balance < costs.totalCampaignCostSol}
                        >
                           <Wallet className="mr-2 h-5 w-5" /> 
                           {wallet.balance < costs.totalCampaignCostSol ? 'Insufficient Balance' : 'Lock Funds & Launch'}
                        </Button>
                        <p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1">
                           <Shield size={10} /> Smart Contract secured. Refundable.
                        </p>
                     </div>
                  </div>
               </form>
           </div>
        </div>
      ) : (
        <div className="space-y-4">
           {isLoading ? (
             <div className="py-20 text-center text-slate-500">Syncing with blockchain...</div>
           ) : campaigns.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                 <h4 className="text-lg font-medium text-slate-300">No active campaigns</h4>
                 <Button variant="outline" className="mt-4" onClick={() => setActiveTab('create')}>Create First Campaign</Button>
              </div>
           ) : (
              <div className="grid gap-4">
                 {campaigns.map((c) => (
                    <CampaignRow key={c.id} campaign={c} onCancel={() => handleCancel(c.id)} solPrice={solPrice} />
                 ))}
              </div>
           )}
        </div>
      )}
    </div>
  );
};

const TierOption: React.FC<{
    title: string; 
    tier: QualityTier; 
    selected: boolean; 
    onSelect: () => void; 
    multiplier: string;
    requirements: string[];
    isPopular?: boolean;
}> = ({ title, tier, selected, onSelect, multiplier, requirements, isPopular }) => (
   <div 
      onClick={onSelect}
      className={`cursor-pointer relative p-4 rounded-xl border transition-all h-full ${selected ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
   >
      {isPopular && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Popular</div>}
      <div className="flex justify-between items-start mb-2">
          <span className={`font-bold ${selected ? 'text-white' : 'text-slate-300'}`}>{title}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${selected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>{multiplier} Cost</span>
      </div>
      <ul className="text-xs text-slate-400 space-y-1">
         {requirements.map((r, i) => <li key={i} className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-slate-600"></span>{r}</li>)}
      </ul>
   </div>
);

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">{icon}</div>
    <div>
      <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{label}</div>
      <div className="text-xl font-bold text-white font-mono mt-0.5">{value}</div>
    </div>
  </div>
);

const CampaignRow: React.FC<{ campaign: any, onCancel: () => void, solPrice: number }> = ({ campaign, onCancel, solPrice }) => {
   const progress = (campaign.currentCompletions / campaign.maxCompletions) * 100;
   const isActive = campaign.status === TaskStatus.OPEN;
   const usdValue = (campaign.costPerAction * campaign.maxCompletions * solPrice);
   
   return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  {campaign.type === TaskType.LIKE ? '❤️' : campaign.type === TaskType.RETWEET ? '🔄' : '💬'}
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="font-medium text-slate-200">{campaign.description}</span>
                     {campaign.qualityTier === QualityTier.PREMIUM && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold">PREMIUM</span>
                     )}
                     {campaign.qualityTier === QualityTier.ELITE && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold">ELITE</span>
                     )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                     <span className={`px-2 py-0.5 rounded-full border ${isActive ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                        {campaign.status}
                     </span>
                     <a href={campaign.targetLink} target="_blank" rel="noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                        View Tweet <ArrowUpRight size={10} />
                     </a>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-8 min-w-[350px]">
               <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                     <span>Progress</span>
                     <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                     <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex justify-between">
                     <span>{campaign.currentCompletions}/{campaign.maxCompletions}</span>
                     <span className="font-mono text-slate-400">Total: {usdValue.toFixed(2)} USD</span>
                  </div>
               </div>
               
               {isActive && (
                   <button 
                    onClick={onCancel}
                    title="Cancel & Refund"
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                   >
                       <StopCircle size={20} />
                   </button>
               )}
            </div>
         </div>
      </div>
   )
}