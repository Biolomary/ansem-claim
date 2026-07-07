// src/components/Navbar.tsx
import React from 'react';
import { CONFIG } from '../config';

const Navbar: React.FC = () => {
  return (
    <nav className="relative z-20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-neon-purple">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl opacity-50 blur-sm -z-10" />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">{CONFIG.TOKEN_NAME}</span>
              <span className="text-neon-purple/70 text-xs ml-2 font-medium">NETWORK</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium">
              Dashboard
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium">
              Claim
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium">
              Stake
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium">
              Docs
            </a>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-glass-white border border-white/10">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-gray-400">Solana Mainnet</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;