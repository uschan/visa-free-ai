import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VisaRequirement, VisaStatus } from '../types';
import { STATUS_LABELS, getFlagUrl } from '../constants';

interface Props {
  req: VisaRequirement;
  passportCode?: string;
}

const VisaCard: React.FC<Props> = ({ req, passportCode }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (passportCode) {
      navigate(`/country/${req.isoCode}?passport=${passportCode}`);
    }
  };

  const getStatusColor = (status: VisaStatus) => {
      switch(status) {
          case VisaStatus.VISA_FREE: return 'text-cyber-cyan border-l-4 border-l-cyber-cyan';
          case VisaStatus.VISA_ON_ARRIVAL: return 'text-cyber-purple border-l-4 border-l-cyber-purple';
          case VisaStatus.ELECTRONIC_TRAVEL_AUTH: return 'text-amber-500 border-l-4 border-l-amber-500';
          default: return 'text-red-500 border-l-4 border-l-red-500';
      }
  }

  return (
    <div 
      onClick={handleClick}
      className={`bg-cyber-black border border-gray-800 hover:border-gray-600 p-0 flex items-stretch cursor-pointer transition-all group relative overflow-hidden h-14 ${getStatusColor(req.status)}`}
    >
      {/* Background Hover Glitch */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity"></div>
      
      {/* Flag Section */}
      <div className="w-16 bg-gray-900 relative transition-all duration-300 border-r border-gray-800">
         {req.iso2Code ? (
             <img 
                src={getFlagUrl(req.iso2Code, 'w80')} 
                alt={req.countryName} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                loading="lazy"
             />
         ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-xs text-gray-600 font-bold">
                {req.isoCode.slice(0,2)}
            </div>
         )}
      </div>
      
      {/* Text Section */}
      <div className="flex-grow min-w-0 p-2 flex flex-col justify-center pl-3">
         <div className="text-gray-200 text-sm font-sans font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors">
            {req.countryName}
         </div>
         <div className="flex justify-between items-center mt-0.5">
            <div className="text-[10px] font-mono opacity-80 uppercase tracking-wider">
                {STATUS_LABELS[req.status]?.replace('Visa ', '')}
            </div>
            <div className="text-[9px] font-mono text-gray-600 group-hover:text-cyber-cyan">
                ISO:{req.isoCode}
            </div>
         </div>
      </div>
    </div>
  );
};

export default VisaCard;