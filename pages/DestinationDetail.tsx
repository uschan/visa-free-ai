import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { VisaRequirement, VisaStatus } from '../types';
import { fetchDestinationDetails } from '../services/geminiService';
import { POPULAR_PASSPORTS, getFlagUrl } from '../constants';
import { ArrowLeft, CheckSquare, Clock, Wind, Banknote, Users, Building2, FileText, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

const DestinationDetail: React.FC = () => {
  const { iso } = useParams<{ iso: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const passportCode = searchParams.get('passport') || 'Unknown';
  
  const [detail, setDetail] = useState<VisaRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<'NONE' | 'NETWORK' | 'CONFIG'>('NONE');

  // Get source passport details for visual
  const sourcePassport = POPULAR_PASSPORTS.find(p => p.code === passportCode);

  const load = async () => {
    // 1. Config Check: Immediate feedback if API Key is missing in build
    if (!process.env.API_KEY) {
        console.error("BUILD ERROR: API_KEY is missing.");
        setErrorType('CONFIG');
        setLoading(false);
        return;
    }

    setLoading(true);
    setErrorType('NONE');
    
    try {
        const start = Date.now();
        const data = await fetchDestinationDetails(passportCode, iso || '');
        const elapsed = Date.now() - start;
        
        // UX: Minimum loading time to prevent flicker
        if (elapsed < 600) await new Promise(r => setTimeout(r, 600 - elapsed));

        if (data) {
            setDetail(data);
        } else {
            setErrorType('NETWORK');
        }
    } catch (e) {
        console.error(e);
        setErrorType('NETWORK');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [iso, passportCode]);

  // --- RENDER STATES ---

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-cyber-cyan/30 rounded-full"></div>
            <div className="absolute inset-0 border-t-2 border-cyber-cyan rounded-full animate-spin"></div>
        </div>
        <div className="font-mono text-cyber-cyan text-sm animate-pulse tracking-widest text-center">
            ESTABLISHING SECURE CONNECTION...<br/>
            <span className="text-xs text-gray-500 mt-2 block">DECRYPTING VISA PROTOCOLS</span>
        </div>
    </div>
  );

  if (errorType === 'CONFIG') return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 border border-red-500/50 bg-red-950/30 rounded-lg text-center mt-10 max-w-lg mx-auto">
          <ShieldAlert size={48} className="text-red-500 mb-4 animate-pulse" />
          <h2 className="text-red-500 font-bold font-mono text-xl mb-2">SYSTEM CONFIGURATION ERROR</h2>
          <p className="text-gray-300 mb-4 font-mono text-sm">
              API Key missing in production environment.
          </p>
          <div className="bg-black/50 p-4 rounded text-left text-xs font-mono text-gray-400 w-full mb-6 border border-gray-800">
              <span className="text-red-400">root@server:~$</span> check env<br/>
              <span className="text-yellow-400">WARN:</span> process.env.API_KEY is undefined.<br/>
              <span className="text-blue-400">FIX:</span> Ensure .env exists on build server and 'vite build' loads it.
          </div>
          <button onClick={() => navigate('/')} className="px-6 py-2 border border-gray-600 hover:bg-gray-800 text-sm font-mono">RETURN_HOME</button>
      </div>
  );

  if (errorType === 'NETWORK' || !detail) return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 border border-amber-900/30 bg-amber-900/5 rounded-lg text-center mt-10">
          <AlertTriangle size={48} className="text-amber-500 mb-4" />
          <h2 className="text-amber-500 font-bold font-mono text-xl mb-2">CONNECTION INTERRUPTED</h2>
          <p className="text-gray-400 max-w-md mb-6 font-mono text-sm">
              Data packet loss detected. This often occurs when:
              <ul className="list-disc list-inside mt-2 text-left pl-4 text-xs text-gray-500 space-y-1">
                  <li>Client network blocks external AI services (VPN required?).</li>
                  <li>API Rate limit exceeded (Try again in 30s).</li>
                  <li>Signal interference on mobile networks.</li>
              </ul>
          </p>
          <button 
            onClick={load}
            className="flex items-center gap-2 px-6 py-3 bg-cyber-black border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black transition-all font-mono font-bold uppercase tracking-widest"
          >
              <RefreshCw size={16} /> RE-INITIALIZE UPLINK
          </button>
      </div>
  );

  const statusColor = 
      detail.status === VisaStatus.VISA_FREE ? 'text-cyber-cyan border-cyber-cyan' :
      detail.status === VisaStatus.VISA_ON_ARRIVAL ? 'text-cyber-purple border-cyber-purple' :
      'text-amber-500 border-amber-500';

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cyber-cyan/70 hover:text-cyber-cyan mb-8 font-mono text-xs uppercase tracking-widest hover:underline decoration-1 underline-offset-4">
        <ArrowLeft size={14} /> Terminate_Session
      </button>

      {/* 1. Connection Visualizer */}
      <div className="bg-cyber-black border border-cyber-cyan/30 p-8 md:p-12 mb-8 relative overflow-hidden group">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Source Node */}
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-cyber-cyan p-1 bg-black shadow-neon-cyan">
                     <img src={getFlagUrl(sourcePassport?.iso2, 'w160')} className="w-full h-full object-cover contrast-125" alt="Source" />
                </div>
                <div className="mt-4 font-mono text-center">
                    <div className="text-xl font-bold text-white tracking-widest">{sourcePassport?.code}</div>
                    <div className="text-xs text-cyber-cyan">SOURCE_NODE</div>
                </div>
            </div>

            {/* Connection Line */}
            <div className="flex-grow flex flex-col items-center w-full md:w-auto">
                <div className="font-mono text-xs text-cyber-cyan/50 mb-2 tracking-[0.3em]">ENCRYPTED_tunnel_v4</div>
                <div className="w-full h-px bg-cyber-cyan/30 relative flex items-center">
                    <div className="absolute w-2 h-2 bg-cyber-cyan left-0 animate-[glitch_2s_infinite]"></div>
                    <div className="absolute w-full h-px bg-cyber-cyan/50 animate-pulse"></div>
                    <div className="w-3 h-3 bg-black border border-cyber-cyan rotate-45 mx-auto z-10"></div>
                </div>
                <div className={`mt-4 px-6 py-2 border ${statusColor} bg-black/50 backdrop-blur-sm font-mono font-bold tracking-wider text-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                    {detail.status?.replace(/_/g, ' ') || 'UNKNOWN'}
                </div>
            </div>

            {/* Target Node */}
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-dashed border-gray-600 p-1 bg-black">
                     {detail.iso2Code ? (
                        <img src={getFlagUrl(detail.iso2Code, 'w160')} className="w-full h-full object-cover contrast-125" alt="Target" />
                     ) : (
                        <div className="w-full h-full bg-cyber-purple/20 flex items-center justify-center font-mono text-cyber-purple text-lg font-bold">{detail.isoCode}</div>
                     )}
                </div>
                <div className="mt-4 font-mono text-center">
                    <div className="text-xl font-bold text-white tracking-widest">{detail.isoCode}</div>
                    <div className="text-xs text-gray-500">TARGET_NODE</div>
                </div>
            </div>
         </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
          {/* 2. Requirements Module */}
          <div className="md:col-span-2 space-y-8">
              <div>
                  <h2 className="text-cyber-purple font-mono text-sm mb-4 flex items-center gap-2 border-b border-cyber-purple/30 pb-2">
                      <FileText size={16}/> REQUIRED_PROTOCOLS
                  </h2>
                  <div className="grid gap-3">
                    {(detail.documentsRequired?.length ? detail.documentsRequired : ['Valid Passport', 'Return Ticket', 'Proof of Accommodation']).map((req, i) => (
                        <div key={i} className="bg-cyber-glass border border-gray-800 p-4 flex gap-4 hover:border-cyber-cyan/50 transition-colors group">
                            <div className="mt-1">
                                <CheckSquare size={16} className="text-gray-600 group-hover:text-cyber-cyan transition-colors" />
                            </div>
                            <div>
                                <div className="text-gray-200 font-mono text-sm mb-1">{req.split(':')[0]}</div>
                                <div className="text-gray-500 text-xs font-mono">{req.includes(':') ? req.split(':')[1] : 'MANDATORY_DOCUMENT'}</div>
                            </div>
                        </div>
                    ))}
                  </div>
              </div>
          </div>

          {/* 3. Metadata Sidebar */}
          <div className="space-y-6">
               <div className="bg-cyber-black/80 border border-gray-800 p-6">
                   <h3 className="text-gray-500 font-mono text-xs mb-4 uppercase tracking-widest">Target_Intel</h3>
                   <div className="space-y-4">
                       <MetaRow icon={<Users size={14}/>} label="POPULATION" value={detail.metadata?.population} />
                       <MetaRow icon={<Building2 size={14}/>} label="CAPITAL" value={detail.metadata?.capital} />
                       <MetaRow icon={<Banknote size={14}/>} label="CURRENCY" value={detail.metadata?.currency} />
                       <MetaRow icon={<Clock size={14}/>} label="TIMEZONE" value={detail.metadata?.timezone} />
                       <div className="pt-4 border-t border-gray-800">
                           <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-2">
                               <Wind size={14} /> ATMOSPHERE_INDEX
                           </div>
                           <div className="bg-gray-900 h-2 w-full mb-1 overflow-hidden">
                               <div className="h-full bg-cyber-cyan w-2/3 animate-pulse"></div>
                           </div>
                           <div className="text-right text-xs text-cyber-cyan font-mono truncate">{detail.metadata?.airQuality || 'UNKNOWN'}</div>
                       </div>
                   </div>
               </div>
               
               {/* Airports Terminal Style */}
               {detail.metadata?.airports && detail.metadata.airports.length > 0 && (
                 <div className="bg-cyber-black/80 border border-gray-800 p-6">
                     <h3 className="text-gray-500 font-mono text-xs mb-4 uppercase tracking-widest">Entry_Ports [Air]</h3>
                     <div className="space-y-3">
                       {detail.metadata.airports.slice(0, 3).map((apt: any, i: number) => (
                           <div key={i} className="font-mono text-xs flex justify-between group cursor-help">
                               <span className="text-gray-300 group-hover:text-cyber-purple transition-colors">{apt.code}</span>
                               <span className="text-gray-600 truncate max-w-[120px]">{apt.city}</span>
                           </div>
                       ))}
                     </div>
                 </div>
               )}
          </div>
      </div>
    </div>
  );
};

const MetaRow = ({ icon, label, value }: any) => (
    <div className="flex justify-between items-center font-mono text-xs">
        <span className="text-gray-500 flex items-center gap-2">{icon} {label}</span>
        <span className="text-white text-right truncate max-w-[150px]" title={value}>{value || 'N/A'}</span>
    </div>
);

export default DestinationDetail;