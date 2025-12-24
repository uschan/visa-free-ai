import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { VisaRequirement, VisaStatus, Passport } from '../types';
import { fetchVisaRequirements } from '../services/geminiService';
import { POPULAR_PASSPORTS, MOCK_VISA_DATA, STATUS_LABELS, getFlagUrl } from '../constants';
import VisaCard from '../components/VisaCard';
import { Users, Building2, MapPin, Banknote, Languages, Plane, Activity, ShieldCheck, Globe } from 'lucide-react';

const PassportDashboard: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<VisaRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VisaStatus | 'ALL'>('ALL');

  const passport = POPULAR_PASSPORTS.find(p => p.code === code) || { 
    name: code || 'Unknown', 
    code: code || 'UNK', 
    iso2: 'XX',
    flagEmoji: '🌍',
    metadata: { population: '-', capital: '-', currency: '-', languages: '-', visaFreeAccess: 0 }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (!process.env.API_KEY) {
        setData(MOCK_VISA_DATA);
      } else {
        const res = await fetchVisaRequirements(passport.name);
        setData(res.length ? res : MOCK_VISA_DATA);
      }
      setLoading(false);
    };
    loadData();
  }, [passport.name]);

  // Derived stats
  const stats = {
    [VisaStatus.VISA_FREE]: data.filter(d => d.status === VisaStatus.VISA_FREE).length,
    [VisaStatus.VISA_ON_ARRIVAL]: data.filter(d => d.status === VisaStatus.VISA_ON_ARRIVAL).length,
    [VisaStatus.ELECTRONIC_TRAVEL_AUTH]: data.filter(d => d.status === VisaStatus.ELECTRONIC_TRAVEL_AUTH).length,
    [VisaStatus.VISA_REQUIRED]: data.filter(d => d.status === VisaStatus.VISA_REQUIRED).length,
  };

  const filteredData = activeTab === 'ALL' ? data : data.filter(d => d.status === activeTab);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* 1. Header Card - Cyberpunk Style */}
      <div className="relative bg-cyber-glass border border-cyber-cyan/30 p-8 backdrop-blur-xl overflow-hidden">
         {/* Background decoration */}
         <div className="absolute top-0 right-0 p-4 opacity-10">
             <ShieldCheck size={200} className="text-cyber-cyan" />
         </div>
         <div className="absolute top-0 left-0 w-1 h-full bg-cyber-cyan"></div>

         <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            <div className="w-32 h-20 border-2 border-cyber-cyan/50 p-1 bg-cyber-black shadow-neon-cyan">
                <img 
                    src={getFlagUrl(passport.iso2, 'w320')} 
                    alt={passport.name} 
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 contrast-125 transition-all duration-700"
                />
            </div>
            <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-sans uppercase tracking-tight">{passport.name}</h1>
                    <span className="bg-cyber-cyan text-black px-2 py-0.5 font-mono text-sm font-bold">[{passport.code}]</span>
                </div>
                <p className="text-cyber-cyan font-mono text-xs mb-6 tracking-widest opacity-80">CITIZENSHIP_CLASS: A // ISSUER: GOV_{passport.iso2}</p>
                
                <div className="text-gray-300 font-mono text-sm leading-relaxed max-w-3xl border-l-2 border-gray-700 pl-4">
                    <span className="text-cyber-purple">>> ANALYSIS:</span> Holders possess global mobility index {passport.metadata?.visaFreeAccess}. 
                    Primary access granted to <span className="text-white text-glow">{stats[VisaStatus.VISA_FREE]} zones</span> via direct entry protocols.
                </div>
            </div>
         </div>

         {/* Tech Stats Grid */}
         <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-cyber-cyan/20 border border-cyber-cyan/20 mt-8">
             <TechStat label="POPULATION" value={passport.metadata?.population} />
             <TechStat label="CAPITAL" value={passport.metadata?.capital} />
             <TechStat label="ACCESS_SCORE" value={passport.metadata?.visaFreeAccess} highlight />
             <TechStat label="CURRENCY" value={passport.metadata?.currency} />
             <TechStat label="LANG_PACK" value={passport.metadata?.languages?.split(',')[0]} />
         </div>
      </div>

      {/* 2. Controls & Tabs */}
      <div>
          <div className="flex flex-wrap border-b border-gray-800 font-mono text-xs tracking-wider">
             <TabButton 
                active={activeTab === 'ALL'} 
                onClick={() => setActiveTab('ALL')} 
                label="FULL_DATABASE" count={data.length}
             />
             <TabButton 
                active={activeTab === VisaStatus.VISA_FREE} 
                onClick={() => setActiveTab(VisaStatus.VISA_FREE)} 
                label="VISA_FREE" count={stats[VisaStatus.VISA_FREE]} color="cyan"
             />
             <TabButton 
                active={activeTab === VisaStatus.VISA_ON_ARRIVAL} 
                onClick={() => setActiveTab(VisaStatus.VISA_ON_ARRIVAL)} 
                label="VOA_STATUS" count={stats[VisaStatus.VISA_ON_ARRIVAL]} color="purple"
             />
             <TabButton 
                active={activeTab === VisaStatus.ELECTRONIC_TRAVEL_AUTH} 
                onClick={() => setActiveTab(VisaStatus.ELECTRONIC_TRAVEL_AUTH)} 
                label="E_VISA_REQ" count={stats[VisaStatus.ELECTRONIC_TRAVEL_AUTH]} 
             />
             <TabButton 
                active={activeTab === VisaStatus.VISA_REQUIRED} 
                onClick={() => setActiveTab(VisaStatus.VISA_REQUIRED)} 
                label="RESTRICTED" count={stats[VisaStatus.VISA_REQUIRED]} 
             />
          </div>
      </div>

      {/* 3. Grid Content */}
      <div className="flex items-center gap-2 text-cyber-cyan/50 font-mono text-xs mb-4">
         <Activity size={14} className="animate-pulse" />
         <span>STREAMING_DATA...</span>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
           {[...Array(12)].map((_, i) => (
             <div key={i} className="h-14 bg-cyber-glass border border-cyber-cyan/10"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredData.map(req => (
                <VisaCard key={req.isoCode} req={req} passportCode={code} />
            ))}
        </div>
      )}
    </div>
  );
};

const TechStat = ({ label, value, highlight }: any) => (
    <div className="bg-cyber-black/80 p-3 hover:bg-cyber-cyan/10 transition-colors group">
        <div className="text-gray-500 text-[10px] font-mono mb-1 group-hover:text-cyber-cyan">{label}</div>
        <div className={`font-mono text-sm truncate ${highlight ? 'text-cyber-cyan text-glow' : 'text-white'}`}>{value || 'N/A'}</div>
    </div>
);

const TabButton = ({ active, onClick, label, count, color = 'gray' }: any) => {
    const activeColor = color === 'cyan' ? 'text-cyber-cyan border-cyber-cyan' : color === 'purple' ? 'text-cyber-purple border-cyber-purple' : 'text-white border-white';
    
    return (
        <button 
            onClick={onClick}
            className={`px-6 py-3 border-b-2 transition-all hover:bg-white/5 ${active ? `${activeColor} bg-white/5` : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
            {label} <span className="opacity-50">[{count}]</span>
        </button>
    )
};

export default PassportDashboard;