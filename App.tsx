import React, { useState } from 'react';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { LandingPage } from './views/LandingPage';
import { EarnerDashboard } from './views/EarnerDashboard';
import { AdvertiserDashboard } from './views/AdvertiserDashboard';
import { SettingsPage } from './views/SettingsPage';
import { WalletState, UserRole, UserState, AppNotification, NotificationType, Language } from './types';
import { simulateXAuth } from './services/mockService';

// Mock Constants
const MOCK_INITIAL_BALANCE = 5.0;

export default function App() {
  // --- State Management ---
  
  // Language State (Default English)
  const [language, setLanguage] = useState<Language>('EN');
  
  // View State (Dashboard vs Settings)
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'SETTINGS'>('DASHBOARD');

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
  });

  // User Session State
  const [userState, setUserState] = useState<UserState>({
    role: UserRole.GUEST,
    xAccountLinked: false,
    xUsername: null,
    unclaimedBalance: 0,
    totalLifetimeEarnings: 0,
    reputationScore: 0,
    followerCount: 0,
    accountAgeDays: 0,
    referralCode: null,
    referralCount: 0,
    referralEarnings: 0,
    displayTwitterPublicly: true,
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // --- Handlers ---

  const addNotification = (type: NotificationType, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // General Wallet Connection (Header Button)
  const handleConnectWallet = () => {
    if (wallet.connected) return;
    
    addNotification('info', 'Connecting to Phantom Wallet...');
    // Simulating wallet connection delay
    setTimeout(() => {
      setWallet({
        connected: true,
        address: '8xqt...3f9a',
        balance: MOCK_INITIAL_BALANCE,
      });
      addNotification('success', 'Wallet Connected Successfully');
    }, 800);
  };

  const handleDisconnectWallet = () => {
    setWallet({ connected: false, address: null, balance: 0 });
    addNotification('info', 'Wallet Disconnected');
  };

  // Action-Specific Login/Navigation (Landing Page Buttons)
  const handleAuthAction = (targetRole: UserRole) => {
    if (wallet.connected) {
      handleRoleChange(targetRole);
    } else {
      addNotification('info', 'Connecting wallet to start...');
      setTimeout(() => {
        setWallet({
          connected: true,
          address: '8xqt...3f9a',
          balance: MOCK_INITIAL_BALANCE,
        });
        setUserState(prev => ({ ...prev, role: targetRole }));
        addNotification('success', 'Wallet Connected! Welcome.');
      }, 800);
    }
  };

  const handleDisconnect = () => {
    setWallet({ connected: false, address: null, balance: 0 });
    setUserState(prev => ({ 
      ...prev, 
      role: UserRole.GUEST, 
      xAccountLinked: false, 
      followerCount: 0,
      xUsername: null,
      referralCode: null,
      referralCount: 0,
      referralEarnings: 0
    }));
    setCurrentView('DASHBOARD');
    addNotification('info', 'Signed Out');
  };

  const handleRoleChange = (role: UserRole) => {
    setUserState(prev => ({ ...prev, role }));
    setCurrentView('DASHBOARD');
  };

  const handleSettingsClick = () => {
    setCurrentView('SETTINGS');
  };

  const linkXAccount = async () => {
    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const w = window.open('', 'Connect X', `width=${width},height=${height},top=${top},left=${left}`);
    if (w) {
      w.document.write('<body style="background:#020617;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;font-family:sans-serif;"><h1 style="color:#1da1f2">X (Twitter)</h1><p>Authorizing SolTask...</p></body>');
      
      try {
          const authData = await simulateXAuth(); // Fetch mock data
          setTimeout(() => {
            w.close();
            setUserState(prev => ({
              ...prev,
              xAccountLinked: true,
              ...authData
            }));
            addNotification('success', `Linked @${authData.xUsername} (${authData.followerCount} followers)`);
          }, 1500);
      } catch (e) {
          w.close();
          addNotification('error', 'Auth Failed');
      }
    }
  };

  const handleDisconnectX = () => {
    setUserState(prev => ({
        ...prev,
        xAccountLinked: false,
        xUsername: null,
        followerCount: 0
    }));
    addNotification('info', 'X Account Disconnected');
  };

  const updateBalance = (amount: number) => {
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + amount
    }));
  };

  const handleTogglePrivacy = () => {
    setUserState(prev => {
        const newState = !prev.displayTwitterPublicly;
        addNotification('info', `Twitter visibility set to ${newState ? 'Public' : 'Hidden'}`);
        return { ...prev, displayTwitterPublicly: newState };
    });
  };

  // --- Routing Logic ---
  
  const renderContent = () => {
    if (!wallet.connected || userState.role === UserRole.GUEST) {
      return (
        <LandingPage 
          language={language}
          onStartEarning={() => handleAuthAction(UserRole.EARNER)}
          onCreateCampaign={() => handleAuthAction(UserRole.ADVERTISER)}
        />
      );
    }

    if (currentView === 'SETTINGS') {
      return (
        <SettingsPage 
          userState={userState}
          wallet={wallet}
          onBack={() => setCurrentView('DASHBOARD')}
          onDisconnectWallet={handleDisconnectWallet}
          onDisconnectX={handleDisconnectX}
          onConnectX={linkXAccount}
          onTogglePrivacy={handleTogglePrivacy}
        />
      );
    }

    if (userState.role === UserRole.EARNER) {
      return (
        <EarnerDashboard 
          wallet={wallet} 
          updateBalance={updateBalance} 
          xLinked={userState.xAccountLinked}
          linkXAccount={linkXAccount}
          userState={userState}
          notify={addNotification}
        />
      );
    }

    if (userState.role === UserRole.ADVERTISER) {
      return (
        <AdvertiserDashboard 
          wallet={wallet} 
          updateBalance={updateBalance}
          notify={addNotification}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 font-inter">
      <Header 
        wallet={wallet}
        userState={userState}
        role={userState.role}
        language={language}
        setLanguage={setLanguage}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnect}
        onChangeRole={handleRoleChange}
        onLoginX={linkXAccount}
        onSettingsClick={handleSettingsClick}
      />
      
      <main className="relative">
        {renderContent()}
      </main>
      
      <ToastContainer notifications={notifications} removeNotification={removeNotification} />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 mt-auto bg-slate-950">
        <div className="container mx-auto px-4 text-center text-slate-600 text-sm">
          <p className="mb-2">© 2024 SolTask Protocol. Built on Solana.</p>
          <div className="flex justify-center gap-4 text-xs">
            <a href="#" className="hover:text-cyan-400">Terms</a>
            <a href="#" className="hover:text-cyan-400">Privacy</a>
            <a href="#" className="hover:text-cyan-400">Smart Contract</a>
          </div>
        </div>
      </footer>
    </div>
  );
}