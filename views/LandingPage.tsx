import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Coins, Stars, Trophy, Sparkles, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Language } from '../types';
import { getTranslation } from '../services/translations';

interface LandingPageProps {
  language: Language;
  onStartEarning: () => void;
  onCreateCampaign: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ language, onStartEarning, onCreateCampaign }) => {
  const t = getTranslation(language);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center text-center px-4 pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        
        {/* Colorful Abstract Background Blobs - SolTask Theme (Cyan/Purple) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-full blur-[120px] -z-10 opacity-60 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -z-10"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-md text-sm text-cyan-300 mb-8 animate-[fade-in_1s_ease-out] hover:border-cyan-500/30 transition-colors cursor-default">
          <Sparkles size={14} className="text-yellow-300" />
          <span className="font-medium">{t.badge}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white max-w-5xl leading-[1.15]">
          {t.heroTitle} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-xl">
            {t.heroTitleHighlight}
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-light">
          {t.heroSubtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 mb-20">
          <Button onClick={onStartEarning} size="lg" className="text-lg px-10 py-4 shadow-[0_0_40px_rgba(34,211,238,0.3)] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-none">
            {t.ctaEarn} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button onClick={onCreateCampaign} variant="secondary" size="lg" className="text-lg px-10 py-4 bg-slate-900/50 backdrop-blur-md border-slate-700 hover:border-purple-500/50">
            {t.ctaCreate}
          </Button>
        </div>

        {/* Live Stats / Trust Section */}
        <div className="w-full max-w-6xl mx-auto px-4">
           <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
              
              <div className="text-center mb-8">
                <h3 className="text-lg font-medium text-slate-300 mb-2">{t.trust.title}</h3>
                <p className="text-slate-500 text-sm">{t.trust.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  <StatItem 
                    icon={<Coins className="text-yellow-400" size={24} />}
                    value="42,085+" 
                    label={t.stats.totalPaid} 
                  />
                  <StatItem 
                    icon={<CheckCircle className="text-green-400" size={24} />}
                    value="1.2M+" 
                    label={t.stats.tasksCompleted} 
                  />
                  <StatItem 
                    icon={<Users className="text-blue-400" size={24} />}
                    value="8,500+" 
                    label={t.stats.activeUsers} 
                  />
                  <StatItem 
                    icon={<TrendingUp className="text-purple-400" size={24} />}
                    value="~0.4 SOL" 
                    label={t.stats.avgPayout} 
                  />
              </div>
           </div>
        </div>

      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24 relative">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Zap className="text-yellow-400" size={32} />}
            title={t.features.verify.title}
            description={t.features.verify.desc}
            color="yellow"
          />
          <FeatureCard 
            icon={<Stars className="text-purple-400" size={32} />}
            title={t.features.referral.title}
            description={t.features.referral.desc}
            color="pink"
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-cyan-400" size={32} />}
            title={t.features.escrow.title}
            description={t.features.escrow.desc}
            color="cyan"
          />
        </div>
      </section>
    </div>
  );
};

// Sub-component for Stats
const StatItem: React.FC<{ icon: React.ReactNode, value: string, label: string }> = ({ icon, value, label }) => (
  <div className="flex flex-col items-center justify-center p-4">
    <div className="mb-3 p-3 bg-slate-800/50 rounded-full ring-1 ring-white/10">{icon}</div>
    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 font-mono tracking-tight mb-1">
      {value}
    </div>
    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
      {label}
    </div>
  </div>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'yellow' | 'pink' | 'cyan';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
  const colorStyles = {
    yellow: "group-hover:border-yellow-500/30 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]",
    pink: "group-hover:border-purple-500/30 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]",
    cyan: "group-hover:border-cyan-500/30 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]",
  };

  return (
    <div className={`p-8 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-sm transition-all duration-300 group ${colorStyles[color]}`}>
      <div className="mb-6 p-4 bg-slate-800/50 rounded-2xl inline-block border border-white/5">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-lg">
        {description}
      </p>
    </div>
  );
};