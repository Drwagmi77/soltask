import React, { useState } from 'react';
import { Wallet, LogOut, LayoutDashboard, Menu, Sparkles, Globe, User } from 'lucide-react';
import { Button } from './Button';
import { WalletState, UserRole, Language, UserState } from '../types';

interface HeaderProps {
  wallet: WalletState;
  userState: UserState;
  role: UserRole;
  language: Language;
  setLanguage: (lang: Language) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onChangeRole: (role: UserRole) => void;
  onLoginX: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  wallet, 
  userState,
  role, 
  language,
  setLanguage,
  onConnect, 
  onDisconnect,
  onChangeRole,
  onLoginX
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const isLoggedIn = userState.xAccountLinked || wallet.connected;

  const languages: {code: Language, label: string, flag: string}[] = [
    { code: 'EN', label: 'English', flag: '🇬🇧' },
    { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ES', label: 'Español', flag: '🇪🇸' },
    { code: 'TR', label: 'Türkçe', flag: '🇹🇷' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-18 flex items-center justify-between py-3">
        
        {/* Logo - SolTask Style */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onChangeRole(UserRole.GUEST)}>
          <div className="relative h-10 w-10 flex items-center justify-center">
            {/* Logo Glow */}
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            
            {/* SolTask Custom Logo SVG */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-md">
              <defs>
                <linearGradient id="soltask_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22D3EE" /> {/* Cyan */}
                  <stop offset="50%" stopColor="#818CF8" /> {/* Indigo */}
                  <stop offset="100%" stopColor="#C084FC" /> {/* Purple */}
                </linearGradient>
              </defs>
              
              {/* Outer Cycle Ring (Arrows) */}
              <path d="M20 4C11.163 4 4 11.163 4 20H8C8 13.373 13.373 8 20 8V4Z" fill="url(#soltask_grad)" />
              <path d="M20 36C28.837 36 36 28.837 36 20H32C32 26.627 26.627 32 20 32V36Z" fill="url(#soltask_grad)" />
              
              {/* Arrow Heads */}
              <path d="M20 0L24 6H16L20 0Z" fill="#22D3EE" transform="rotate(90 20 4)" /> 
              <path d="M20 40L24 34H16L20 40Z" fill="#C084FC" transform="rotate(-90 20 36)" />

              {/* Central 'S' Symbol */}
              <path d="M24.5 14H15.5C14.1 14 13 15.1 13 16.5C13 17.9 14.1 19 15.5 19H24.5C25.9 19 27 20.1 27 21.5C27 22.9 25.9 24 24.5 24H14M24.5 14C25.9 14 27 12.9 27 11.5M15.5 24C14.1 24 13 25.1 13 26.5" 
                    stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Small Dollar Badge inside S */}
               <circle cx="20" cy="20" r="1.5" fill="#22D3EE" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight hidden sm:block text-white">
            Sol<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Task</span>
          </span>
        </div>

        {/* Navigation & Wallet */}
        <div className="flex items-center gap-4">

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              <Globe size={16} />
              <span>{language}</span>
            </button>
            {isLangOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                 {languages.map(lang => (
                   <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors ${language === lang.code ? 'text-cyan-400 bg-slate-800/50' : 'text-slate-300'}`}
                   >
                     <span>{lang.flag}</span> {lang.code}
                   </button>
                 ))}
              </div>
            )}
            {/* Backdrop for click away */}
            {isLangOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsLangOpen(false)}></div>}
          </div>
          
          {/* Role Switcher (Only if logged in) */}
          {isLoggedIn && role !== UserRole.GUEST && (
             <div className="hidden md:flex items-center p-1 bg-slate-900/80 rounded-full border border-white/10">
                <button 
                  onClick={() => onChangeRole(UserRole.EARNER)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${role === UserRole.EARNER ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-sm border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Quests
                </button>
                <button 
                  onClick={() => onChangeRole(UserRole.ADVERTISER)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${role === UserRole.ADVERTISER ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-sm border border-purple-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Create
                </button>
             </div>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
               {/* Show Unclaimed Balance for Earners */}
               {role === UserRole.EARNER && userState.unclaimedBalance > 0 && (
                 <div className="hidden sm:flex flex-col items-end mr-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Unclaimed</span>
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">{userState.unclaimedBalance.toFixed(4)} SOL</span>
                 </div>
               )}

               <div className="relative group">
                <Button variant="secondary" size="sm" className="gap-2 font-mono rounded-xl border-slate-700 bg-slate-800/50 hover:bg-slate-800">
                   {wallet.connected ? (
                      <>
                        <Wallet size={16} className="text-green-400" />
                        {wallet.address?.slice(0, 4)}...{wallet.address?.slice(-4)}
                      </>
                   ) : (
                      <>
                        <User size={16} className="text-cyan-400" />
                        @{userState.xUsername}
                      </>
                   )}
                </Button>
                
                {/* Dropdown for disconnect */}
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                   {!wallet.connected && role === UserRole.EARNER && (
                      <button 
                        onClick={onConnect}
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-400 hover:bg-green-500/10 transition-colors font-medium mb-1"
                      >
                        <Wallet size={16} /> Connect Wallet
                      </button>
                   )}
                   <button 
                    onClick={onDisconnect}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                   >
                     <LogOut size={16} /> Sign Out
                   </button>
                </div>
               </div>
            </div>
          ) : (
            <div className="flex gap-2">
                <Button onClick={onLoginX} variant="primary" size="sm" className="gap-2 bg-[#1DA1F2] hover:bg-[#1a94df] border-none shadow-blue-500/20 from-transparent to-transparent">
                  <span className="font-bold">X</span>
                  Login
                </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && isLoggedIn && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex flex-col gap-2 p-1">
             <button 
                  onClick={() => { onChangeRole(UserRole.EARNER); setIsMenuOpen(false); }}
                  className={`w-full py-3 rounded-xl text-sm font-medium text-center border ${role === UserRole.EARNER ? 'bg-cyan-500/10 border-cyan-500/30 text-white' : 'border-transparent text-slate-400 bg-slate-900'}`}
                >
                  Quest Board
            </button>
            <button 
                  onClick={() => { onChangeRole(UserRole.ADVERTISER); setIsMenuOpen(false); }}
                  className={`w-full py-3 rounded-xl text-sm font-medium text-center border ${role === UserRole.ADVERTISER ? 'bg-purple-500/10 border-purple-500/30 text-white' : 'border-transparent text-slate-400 bg-slate-900'}`}
                >
                  Create Campaign
            </button>
          </div>
        </div>
      )}
    </header>
  );
};