// src/components/WalletInfo.tsx
import React, { useState } from 'react';
import { WalletState } from '../types/index';

interface WalletInfoProps {
  walletState: WalletState;
  onRefresh: () => Promise<void>;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ walletState, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="animate-slide-down">
      {/* Main wallet card */}
      <div className="relative group mb-6">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple to-neon-green rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
        
        <div className="relative p-6 bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/10">
          {/* Status bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 bg-neon-green rounded-full" />
                <div className="absolute inset-0 w-3 h-3 bg-neon-green rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-neon-green text-sm font-medium">Connected</span>
            </div>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(walletState.publicKey || '');
              }}
              className="p-2 rounded-lg bg-glass-white hover:bg-glass-light transition-all duration-200 group/btn"
              title="Copy address"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover/btn:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Wallet address */}
          <div className="mb-4">
            <p className="text-gray-400 text-xs font-medium mb-1">Wallet Address</p>
            <p className="text-white font-mono text-sm bg-dark-700/50 rounded-lg px-3 py-2 border border-white/5">
              {walletState.publicKey && formatAddress(walletState.publicKey)}
            </p>
          </div>

          {/* Balance */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs font-medium">Balance</p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1 rounded-lg hover:bg-glass-white transition-all duration-200"
                title="Refresh balance"
              >
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-white to-neon-green">
                {walletState.balance.toFixed(4)}
              </span>
              <span className="text-xl text-gray-400 font-medium">SOL</span>
            </div>
            
            <p className="text-gray-500 text-xs mt-1">
              ≈ ${(walletState.balance * 145).toFixed(2)} USD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;