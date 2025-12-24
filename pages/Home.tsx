import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { POPULAR_PASSPORTS, getFlagUrl } from '../constants';
import { Search, MapPin, Radio, Hash, Users } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = POPULAR_PASSPORTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-10">
      {/* Hero Header */}
      <div className="space-y-8 pt-6 relative">
        <div className="flex items-center gap-2 text-cyber-cyan font-mono text-xs tracking-widest animate-pulse-fast">
             <span className="w-2 h-2 bg-cyber-cyan"></span> SYSTEM_ONLINE // WAITING_FOR_INPUT
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-none font-sans uppercase">
          Decode <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-purple text-glow">Global</span><br />
          Mobility <span className="text-cyber-cyan text-4xl align-top">v2.0</span>
        </h1>
        
        <p className="text-lg text-gray-400 max-w-xl font-mono border-l-2 border-cyber-purple pl-4">
          &gt;&gt; Access real-time visa protocols.<br/>
          &gt;&gt; Initialize passport analysis sequence.
        </p>

        {/* Terminal Search Bar */}
        <div className="relative max-w-2xl mt-12 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-cyan to-cyber-purple opacity-30 group-hover:opacity-100 transition duration-200 blur"></div>
          <div className="relative flex items-center bg-cyber-black border border-cyber-cyan/50 p-4">
            <span className="text-cyber-cyan font-mono mr-3 text-lg">{'>'}</span>
            <input 
              type="text" 
              placeholder="ENTER_COUNTRY_CODE_OR_NAME..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white font-mono text-lg placeholder-gray-600 focus:outline-none caret-cyber-cyan uppercase"
              autoFocus
            />
            <div className="hidden md:block text-xs font-mono text-cyber-purple animate-pulse">
                [CURSOR_ACTIVE]
            </div>
          </div>
        </div>

        {/* Filter Chips - Tech Style */}
        <div className="flex flex-wrap gap-3 pt-2 font-mono text-xs">
            {['ALL_ZONES', 'ASIA', 'EUROPE', 'AMERICAS', 'OCEANIA', 'AFRICA'].map((r, i) => (
                <button key={r} className={`px-4 py-2 border transition-all uppercase tracking-wider hover:shadow-neon-cyan ${i === 0 ? 'bg-cyber-cyan text-black border-cyber-cyan font-bold' : 'bg-transparent text-gray-400 border-gray-700 hover:border-cyber-cyan hover:text-cyber-cyan'}`}>
                    {r}
                </button>
            ))}
        </div>
      </div>

      {/* Grid Stats Bar */}
      <div className="flex justify-between items-end border-b border-cyber-cyan/20 pb-2 font-mono text-xs text-cyber-cyan/70">
         <span>QUERY_RESULT: {filtered.length} ENTITIES FOUND</span>
         <div className="hidden md:flex items-center gap-4">
            <span>SORT_ALGORITHM: DEFAULT</span>
            <span>DATA_SOURCE: ENCRYPTED</span>
         </div>
      </div>

      {/* Cyber Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filtered.map(passport => (
             <div 
                key={passport.code} 
                className="bg-cyber-glass border border-gray-800 hover:border-cyber-cyan transition-all group cursor-pointer relative overflow-hidden backdrop-blur-sm"
                onClick={() => navigate(`/passport/${passport.code}`)}
             >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-cyber-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-cyan opacity-50"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-cyan opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-cyan opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-cyan opacity-50"></div>

                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gray-900 border border-gray-700 overflow-hidden relative transition-all duration-500">
                                <img 
                                    src={getFlagUrl(passport.iso2)} 
                                    alt={passport.name} 
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                                />
                                {/* Grid overlay on flag */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white font-sans uppercase tracking-wide group-hover:text-cyber-cyan transition-colors">{passport.name}</h3>
                                <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500 mt-1">
                                    <MapPin size={10} /> ZONE: {passport.metadata?.region?.toUpperCase()}
                                </div>
                            </div>
                         </div>
                         <div className="text-2xl font-mono font-bold text-gray-700 group-hover:text-cyber-purple transition-colors">
                            {passport.code}
                         </div>
                    </div>

                    {/* Stats Matrix */}
                    <div className="space-y-1 pt-2 border-t border-dashed border-gray-800">
                        <DataRow label="ACCESS_LEVEL" value={passport.metadata?.visaFreeAccess} icon={<Radio size={12}/>} highlight />
                        <DataRow label="POPULATION" value={passport.metadata?.population} icon={<Users size={12}/>} />
                        <DataRow label="CAPITAL_NODE" value={passport.metadata?.capital} icon={<Hash size={12}/>} />
                    </div>
                </div>

                {/* Footer Action */}
                <div className="bg-cyber-black/50 border-t border-gray-800 py-2 text-center text-[10px] font-mono text-gray-500 group-hover:text-cyber-cyan group-hover:bg-cyber-cyan/10 transition-colors uppercase tracking-widest">
                    &gt;&gt; Initialize Detail Scan
                </div>
             </div>
         ))}
      </div>
    </div>
  );
};

const DataRow = ({ label, value, icon, highlight = false }: any) => (
    <div className="flex justify-between items-center py-1 font-mono text-xs">
        <span className="text-gray-500 flex items-center gap-2">{icon} {label}</span>
        <span className={`${highlight ? 'text-cyber-cyan text-glow' : 'text-gray-300'}`}>{value || 'N/A'}</span>
    </div>
);

export default Home;