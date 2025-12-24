import React, { useState } from 'react';
import PassportSelector from '../components/PassportSelector';
import { Passport, ComparisonResult, VisaStatus } from '../types';
import { POPULAR_PASSPORTS, getFlagUrl } from '../constants';
import { comparePassportAccess } from '../services/geminiService';
import { ArrowRightLeft, GitCompare, Zap } from 'lucide-react';

const Compare: React.FC = () => {
  const [passportA, setPassportA] = useState<Passport>(POPULAR_PASSPORTS[0]);
  const [passportB, setPassportB] = useState<Passport>(POPULAR_PASSPORTS[1]);
  const [comparison, setComparison] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    const res = await comparePassportAccess(passportA.name, passportB.name);
    setComparison(res);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center mb-8 border-b border-cyber-cyan/20 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-sans uppercase tracking-tight mb-2">
            Access <span className="text-cyber-purple">Diff</span> Engine
        </h1>
        <p className="text-gray-500 font-mono text-xs tracking-widest">
          // INITIATE COMPARATIVE ANALYSIS PROTOCOL
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-cyber-glass border border-cyber-cyan/30 p-8 grid md:grid-cols-[1fr,auto,1fr] gap-8 items-center backdrop-blur-md relative">
         {/* Decorative Lines */}
         <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan"></div>
         <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan"></div>

         <div className="space-y-4">
            <div className="text-cyber-cyan font-mono text-xs mb-1">SUBJECT_ALPHA</div>
            <PassportSelector selectedPassport={passportA} onSelect={setPassportA} label="SELECT_A" />
            <div className="h-1 w-full bg-cyber-cyan/20 overflow-hidden">
                <div className="h-full bg-cyber-cyan w-3/4"></div>
            </div>
         </div>

         <div className="flex flex-col items-center justify-center gap-2">
            <button 
                className="bg-cyber-black border border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-white p-4 transition-all duration-300 shadow-neon-purple group"
                onClick={handleCompare}
                disabled={loading}
            >
                {loading ? <Zap size={24} className="animate-spin" /> : <GitCompare size={24} />}
            </button>
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">{loading ? 'PROCESSING' : 'EXECUTE'}</span>
         </div>

         <div className="space-y-4 text-right">
            <div className="text-cyber-purple font-mono text-xs mb-1">SUBJECT_BETA</div>
            <div className="flex justify-end">
                <PassportSelector selectedPassport={passportB} onSelect={setPassportB} label="SELECT_B" />
            </div>
            <div className="h-1 w-full bg-cyber-purple/20 overflow-hidden">
                <div className="h-full bg-cyber-purple w-1/2 ml-auto"></div>
            </div>
         </div>
      </div>

      {/* Results Terminal */}
      {comparison.length > 0 && (
        <div className="bg-cyber-black border border-gray-800 font-mono text-xs relative">
           <div className="absolute -top-3 left-4 bg-cyber-black px-2 text-gray-500 border border-gray-800">RESULTS_MATRIX</div>
           
           <table className="w-full text-left border-collapse">
             <thead className="bg-gray-900/50 text-gray-400">
               <tr>
                 <th className="px-6 py-4 uppercase tracking-wider font-normal border-b border-gray-800">Target_Zone</th>
                 <th className="px-6 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-cyber-cyan">
                        [{passportA.code}]
                    </div>
                 </th>
                 <th className="px-6 py-4 border-b border-gray-800 text-right">
                    <div className="flex items-center justify-end gap-2 text-cyber-purple">
                         [{passportB.code}]
                    </div>
                 </th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-800/50">
                {comparison.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-300 group-hover:text-white uppercase">{row.countryName}</td>
                    <td className="px-6 py-4">
                       <StatusBadge status={row.passportAStatus} color="cyan" />
                    </td>
                    <td className="px-6 py-4 text-right">
                       <StatusBadge status={row.passportBStatus} color="purple" />
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{status: VisaStatus, color: 'cyan' | 'purple'}> = ({ status, color }) => {
    let label = '';
    let style = '';
    
    const baseColor = color === 'cyan' ? 'text-cyber-cyan border-cyber-cyan' : 'text-cyber-purple border-cyber-purple';
    const alertColor = 'text-gray-500 border-gray-700 decoration-line-through decoration-red-500';

    switch(status) {
        case VisaStatus.VISA_FREE: 
            style = `${baseColor} border bg-opacity-10`; 
            label='GRANTED'; 
            break;
        case VisaStatus.VISA_ON_ARRIVAL: 
            style = `${baseColor} border-dashed border`; 
            label='VOA_AUTH'; 
            break;
        case VisaStatus.ELECTRONIC_TRAVEL_AUTH: 
            style = `text-amber-500 border border-amber-500`; 
            label='E_VISA'; 
            break;
        case VisaStatus.VISA_REQUIRED: 
            style = alertColor; 
            label='DENIED'; 
            break;
        default: 
            style = 'text-gray-600'; 
            label = 'UNKNOWN';
    }
    return <span className={`px-2 py-1 text-[10px] tracking-wider font-bold ${style}`}>{label}</span>
};

export default Compare;
