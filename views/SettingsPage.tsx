import React, { useState } from 'react';
import { Twitter, Wallet, ChevronLeft, User, Shield, Key, Send, Video } from 'lucide-react';
import { Button } from '../components/Button';
import { UserState, WalletState } from '../types';

interface SettingsPageProps {
  userState: UserState;
  wallet: WalletState;
  onBack: () => void;
  onDisconnectWallet: () => void;
  onDisconnectX: () => void;
  onConnectX: () => void;
  onTogglePrivacy: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userState,
  wallet,
  onBack,
  onDisconnectWallet,
  onDisconnectX,
  onConnectX,
  onTogglePrivacy
}) => {
  const [activeSection, setActiveSection] = useState<'linked' | 'profile' | 'account'>('linked');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-80px)]">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-medium"
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          <h2 className="text-xl font-bold text-white mb-4 px-2">Settings</h2>
          
          <nav className="space-y-1">
            <SidebarItem 
              label="My account" 
              icon={<User size={18}/>} 
              active={activeSection === 'account'} 
              onClick={() => setActiveSection('account')}
            />
            <SidebarItem 
              label="Edit profile" 
              icon={<Shield size={18}/>} 
              active={activeSection === 'profile'} 
              onClick={() => setActiveSection('profile')}
            />
            <SidebarItem 
              label="Linked accounts" 
              icon={<Key size={18}/>} 
              active={activeSection === 'linked'} 
              onClick={() => setActiveSection('linked')}
            />
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeSection === 'linked' && (
            <div className="space-y-8 max-w-3xl">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Linked accounts</h3>
                <p className="text-slate-400">Manage the accounts connected to your SolTask profile.</p>
              </div>

              {/* X (Twitter) Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#1DA1F2]/10 rounded-lg text-[#1DA1F2]">
                      <Twitter size={24} fill="currentColor" />
                    </div>
                    <div>
                      {userState.xAccountLinked ? (
                        <>
                          <div className="font-bold text-white">@{userState.xUsername}</div>
                          <div className="text-xs text-green-400 flex items-center gap-1">● Connected</div>
                        </>
                      ) : (
                        <div className="font-bold text-slate-400">Not connected</div>
                      )}
                    </div>
                  </div>
                  <div>
                    {userState.xAccountLinked ? (
                      <Button variant="outline" size="sm" onClick={onDisconnectX} className="border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50">
                        Disconnect
                      </Button>
                    ) : (
                      <Button size="sm" onClick={onConnectX} className="bg-[#1DA1F2] hover:bg-[#1a94df] border-none text-white">
                        Connect X
                      </Button>
                    )}
                  </div>
                </div>

                {/* Privacy Toggle */}
                {userState.xAccountLinked && (
                  <div className="flex items-center justify-between px-2">
                    <div>
                      <div className="font-medium text-white">Display Twitter</div>
                      <div className="text-sm text-slate-500">Show Twitter info to other users on public leaderboards.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={userState.displayTwitterPublicly}
                        onChange={onTogglePrivacy}
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-800 w-full"></div>

              {/* Social Placeholders */}
              <div className="space-y-4">
                 <SocialPlaceholder 
                   icon={<span className="text-xl font-bold">Tk</span>} // Using text for TikTok to avoid extra dep
                   label="Connect your TikTok"
                   color="bg-pink-500/10 text-pink-500"
                 />
                 <SocialPlaceholder 
                   icon={<Send size={20} className="ml-0.5" />} 
                   label="Connect your Telegram"
                   color="bg-blue-500/10 text-blue-400"
                 />
              </div>

              <div className="h-px bg-slate-800 w-full"></div>

              {/* Wallet Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-white mb-1">Wallet</h4>
                  <p className="text-sm text-slate-400">Connect your Solana wallet to complete blockchain-based quests and withdraw earnings.</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                      <Wallet size={24} />
                    </div>
                    <div className="overflow-hidden">
                      {wallet.connected ? (
                        <>
                           <div className="font-mono text-white text-sm truncate max-w-[150px] sm:max-w-xs">{wallet.address}</div>
                           <div className="text-xs text-slate-500">Solana Network</div>
                        </>
                      ) : (
                        <div className="font-bold text-slate-400">No wallet connected</div>
                      )}
                    </div>
                  </div>
                  <div>
                    {wallet.connected ? (
                      <Button variant="outline" size="sm" onClick={onDisconnectWallet} className="border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50">
                        Disconnect
                      </Button>
                    ) : (
                      <div className="text-xs text-slate-500 italic">Connect via Header</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeSection !== 'linked' && (
             <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 bg-slate-800 rounded-full mb-4">
                   <Shield size={48} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                <p className="text-slate-400">This settings section is currently under development.</p>
                <Button variant="secondary" className="mt-6" onClick={() => setActiveSection('linked')}>
                   Go to Linked Accounts
                </Button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ label: string, icon: React.ReactNode, active: boolean, onClick: () => void }> = ({ label, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
  >
    {icon}
    {label}
  </button>
);

const SocialPlaceholder: React.FC<{ icon: React.ReactNode, label: string, color: string }> = ({ icon, label, color }) => (
  <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl opacity-75 hover:opacity-100 transition-opacity">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg flex items-center justify-center w-12 h-12 ${color}`}>
        {icon}
      </div>
      <div className="font-bold text-slate-300">{label}</div>
    </div>
    <Button variant="secondary" size="sm" className="bg-slate-800/50 text-pink-500/50 border-slate-800 cursor-not-allowed">
      Coming Soon
    </Button>
  </div>
);
