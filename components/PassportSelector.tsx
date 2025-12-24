import React, { useState } from 'react';
import { Passport } from '../types';
import { POPULAR_PASSPORTS, getFlagUrl } from '../constants';
import { Search, ChevronDown, Terminal } from 'lucide-react';

interface Props {
  selectedPassport: Passport | null;
  onSelect: (p: Passport) => void;
  label?: string;
}

const PassportSelector: React.FC<Props> = ({ selectedPassport, onSelect, label = "SOURCE_PASSPORT" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = POPULAR_PASSPORTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-md font-mono">
      <label className="block text-[10px] font-bold text-cyber-cyan mb-1 tracking-widest uppercase pl-1">{label}</label>
      
      {/* Input Box */}
      <div 
        className="relative group cursor-pointer bg-cyber-black border border-cyber-cyan/30 hover:border-cyber-cyan transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center p-3">
            <div className="mr-3 w-6 h-4 bg-gray-800 border border-gray-600 overflow-hidden">
                {selectedPassport ? (
                    <img src={getFlagUrl(selectedPassport.iso2, 'w40')} className="w-full h-full object-cover" alt="" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] bg-cyber-purple">ERR</div>
                )}
            </div>
            <input
                type="text"
                readOnly
                value={selectedPassport ? `${selectedPassport.code} // ${selectedPassport.name.toUpperCase()}` : "SELECT_TARGET"}
                className="bg-transparent flex-grow text-white text-sm focus:outline-none cursor-pointer placeholder-gray-600 font-bold"
            />
            <ChevronDown className={`w-4 h-4 text-cyber-cyan transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-cyber-black border border-cyber-cyan shadow-neon-cyan max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-cyber-cyan">
           <div className="p-2 sticky top-0 bg-cyber-black border-b border-gray-800 z-10">
             <div className="flex items-center px-2 bg-gray-900/50 border border-gray-700">
                <Search className="w-3 h-3 text-gray-500 mr-2" />
                <input 
                    autoFocus
                    className="w-full bg-transparent p-2 text-xs text-white focus:outline-none uppercase"
                    placeholder="SEARCH_DB..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                />
             </div>
           </div>
           {filtered.map((p) => (
             <div
                key={p.code}
                className="cursor-pointer select-none relative py-2 pl-3 pr-4 hover:bg-cyber-cyan/20 text-gray-400 hover:text-white flex items-center gap-3 border-l-2 border-transparent hover:border-cyber-cyan transition-all"
                onClick={() => {
                  onSelect(p);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
             >
                <div className="w-5 h-3.5 bg-gray-700 overflow-hidden">
                    <img src={getFlagUrl(p.iso2, 'w40')} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt={p.name} />
                </div>
                <span className="font-bold text-xs">{p.name.toUpperCase()}</span>
                <span className="ml-auto text-[10px] text-cyber-cyan">{p.code}</span>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default PassportSelector;