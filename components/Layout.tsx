import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Menu, X as CloseIcon, Cpu, Github, Instagram, Globe } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path 
    ? "text-cyber-cyan border-b-2 border-cyber-cyan text-glow" 
    : "text-gray-400 hover:text-cyber-cyan transition-colors";

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col font-sans relative overflow-x-hidden">
      {/* Dynamic Grid Background Layer */}
      <div className="fixed inset-0 bg-cyber-grid pointer-events-none z-0"></div>

      <nav className="bg-cyber-glass backdrop-blur-md border-b border-cyber-cyan/20 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo Area */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="text-cyber-black bg-cyber-cyan p-1.5 transition-transform group-hover:rotate-180 duration-500 rounded-none">
                <Terminal size={24} fill="currentColor" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-bold text-lg tracking-wider text-cyber-cyan">VISA_FREE_AI</span>
                <span className="text-[10px] text-cyber-purple tracking-[0.2em] font-bold">SYSTEM.READY</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-10 font-mono text-sm tracking-widest">
              <Link to="/" className={`py-1 ${isActive('/')}`}>[ RANKING ]</Link>
              <Link to="/compare" className={`py-1 ${isActive('/compare')}`}>[ COMPARE ]</Link>
              <Link to="/guide" className={`py-1 ${isActive('/guide')}`}>[ DATA_LOGS ]</Link>
            </div>

            {/* Mobile Button */}
            <button className="md:hidden p-2 text-cyber-cyan border border-cyber-cyan/30 bg-cyber-dim" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-cyber-black border-b border-cyber-cyan/20 p-4 space-y-4 font-mono">
            <Link to="/" onClick={() => setIsOpen(false)} className="block text-cyber-cyan hover:bg-cyber-cyan/10 p-2 border-l-2 border-transparent hover:border-cyber-cyan">RANKING</Link>
            <Link to="/compare" onClick={() => setIsOpen(false)} className="block text-cyber-cyan hover:bg-cyber-cyan/10 p-2 border-l-2 border-transparent hover:border-cyber-cyan">COMPARE</Link>
            <Link to="/guide" onClick={() => setIsOpen(false)} className="block text-cyber-cyan hover:bg-cyber-cyan/10 p-2 border-l-2 border-transparent hover:border-cyber-cyan">DATA_LOGS</Link>
          </div>
        )}
      </nav>

      <main className="flex-grow container mx-auto px-6 py-12 relative z-10">
        {children}
      </main>

      <footer className="border-t border-cyber-cyan/20 mt-12 py-8 relative z-10 bg-cyber-black/80">
        <div className="container mx-auto px-4 text-center flex flex-col items-center">
           
           {/* System Info / Copyright */}
           <div className="flex flex-col items-center gap-1 text-gray-500 font-mono text-[10px] uppercase tracking-wider mb-4">
            <div className="flex items-center gap-2 text-cyber-purple/70">
                <Cpu size={12} /> 
                <span>PROCESSING NODE: GEMINI-3-FLASH</span>
            </div>
            <span>© {new Date().getFullYear()} PROTOCOL: VISA_FREE_LIST // 野盐Vibe Coding </span>
          </div>

           {/* Social Links Network - Compact Container */}
           <div className="inline-flex flex-wrap items-center justify-center gap-5 bg-black/40 border border-gray-800/60 rounded-full py-2 px-6 backdrop-blur-sm hover:border-cyber-cyan/30 transition-colors shadow-lg">
              <SocialLink href="https://x.com/uschan" label="X" hoverColor="hover:text-white">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </SocialLink>
              
              <SocialLink href="https://github.com/uschan" label="Github" hoverColor="hover:text-white">
                <Github size={16} />
              </SocialLink>

              <SocialLink href="https://www.instagram.com/bujjun" label="Instagram" hoverColor="hover:text-[#E4405F]">
                <Instagram size={16} />
              </SocialLink>

              <SocialLink href="https://bsky.app/profile/wildsalt.bsky.social" label="Bluesky" hoverColor="hover:text-[#0085ff]">
                 <svg viewBox="0 0 512 512" className="w-4 h-4 fill-current"><path d="M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2c42.1-31.6 110.3-56 110.3 21.8c0 15.5-8.9 130.5-14.1 149.2C478.2 298 412 314.6 353.1 304.5c102.9 17.5 129.1 75.5 72.5 133.5c-107.4 110.5-154.3-27.6-166.3-62.9l0 0c-11.9 35.2-59 173.4-166.3 62.9c-56.5-58-30.4-116 72.5-133.5C60 314.6-6.2 298 15.6 233.2c-5.2-18.7-14.1-133.7-14.1-149.2c0-77.8 68.2-53.4 110.3-21.8z"/></svg>
              </SocialLink>

              <SocialLink href="https://paypal.me/wildsaltme?utm_source=wildsalt.me" label="PayPal" hoverColor="hover:text-[#00457C]">
                 <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-3.691 6.884-6.911 7.21a.574.574 0 0 1 .158.077c.216.136.57.432.496 1.254l-.448 3.555a1.275 1.275 0 0 1-1.266 1.115H7.55a.64.64 0 0 1-.626-.525l-.837-5.32h.989z"/></svg>
              </SocialLink>

              <SocialLink href="https://discord.gg/26nJEhq6Yj" label="Discord" hoverColor="hover:text-[#5865F2]">
                 <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              </SocialLink>

              <div className="w-px h-4 bg-gray-700 mx-1"></div>

              <SocialLink href="https://wildsalt.me/" label="野盐WildSalt" hoverColor="hover:text-cyber-cyan">
                <Globe size={16} />
              </SocialLink>
           </div>
        </div>
      </footer>
    </div>
  );
};

const SocialLink: React.FC<{ href: string; children: React.ReactNode; label: string; hoverColor?: string }> = ({ href, children, label, hoverColor = "hover:text-cyber-cyan" }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`text-gray-500 transition-all duration-300 transform hover:scale-110 ${hoverColor}`}
        aria-label={label}
        title={label}
    >
        {children}
    </a>
);
