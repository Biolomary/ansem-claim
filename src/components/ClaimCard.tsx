// src/components/ClaimCard.tsx
import React from 'react';
import { TransactionState } from '../types/index';
import { CONFIG } from '../config';

interface ClaimCardProps {
  transactionState: TransactionState;
  onClaim: () => Promise<void>;
  isProcessing: boolean;
}

const ClaimCard: React.FC<ClaimCardProps> = ({ transactionState, onClaim, isProcessing }) => {
  return (
    <div className="animate-slide-up">
      <div className="relative group">
        {/* Card glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
        
        <div className="relative p-6 bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Claim Your Tokens</h3>
              <p className="text-gray-400 text-sm mt-1">Transaction fee applies</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-green rounded-full blur-md opacity-50" />
              <div className="relative px-4 py-2 bg-dark-700 rounded-full border border-white/10">
                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green">
                  {CONFIG.TOKEN_SYMBOL}
                </span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-dark-700/50 border border-white/5">
              <p className="text-gray-400 text-xs mb-1">Transaction Fee</p>
              <p className="text-white font-bold text-lg">{CONFIG.CLAIM_AMOUNT_SOL} SOL</p>
              <p className="text-gray-500 text-xs mt-1">≈ $14.50 USD</p>
            </div>
            
            <div className="p-4 rounded-xl bg-dark-700/50 border border-white/5 relative overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/10 to-transparent animate-shimmer" />
              <p className="text-gray-400 text-xs mb-1">Token Value</p>
              <p className="text-neon-green font-bold text-lg">${CONFIG.TOKEN_VALUE_USD.toLocaleString()}</p>
              <p className="text-neon-green/70 text-xs mt-1">+{CONFIG.TOKEN_VALUE_USD / 10} {CONFIG.TOKEN_SYMBOL}</p>
            </div>
          </div>

          {/* Network info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-700/30 border border-white/5 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
              <span className="text-gray-400 text-sm">Network</span>
            </div>
            <span className="text-white text-sm font-medium">Solana Mainnet</span>
          </div>

          {/* Transaction Progress */}
          {transactionState.status !== 'idle' && (
            <div className="mb-6 animate-slide-down">
              {/* Progress bar */}
              <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${transactionState.progress}%` }}
                />
              </div>

              {/* Status messages */}
              {transactionState.status === 'processing' && (
                <div className="flex items-center space-x-2 text-neon-purple">
                  <div className="w-4 h-4 rounded-full border-2 border-neon-purple/30 border-t-neon-purple animate-spin" />
                  <span className="text-sm">Processing transaction...</span>
                </div>
              )}
              
              {transactionState.status === 'confirming' && (
                <div className="flex items-center space-x-2 text-neon-blue">
                  <div className="w-4 h-4 rounded-full border-2 border-neon-blue/30 border-t-neon-blue animate-spin" />
                  <span className="text-sm">Confirming on blockchain...</span>
                </div>
              )}
              
              {transactionState.status === 'success' && transactionState.signature && (
                <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-neon-green font-medium">Transaction Successful!</span>
                  </div>
                  <a 
                    href={`https://solscan.io/tx/${transactionState.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-purple text-sm hover:text-neon-green transition-colors inline-flex items-center space-x-1"
                  >
                    <span>View on Solscan</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
              
              {transactionState.status === 'error' && (
                <div className="p-4 rounded-xl bg-neon-pink/10 border border-neon-pink/20">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-neon-pink text-sm">{transactionState.error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claim Button */}
          <button
            onClick={onClaim}
            disabled={isProcessing || transactionState.status === 'success'}
            className="relative w-full group/btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple to-neon-green rounded-xl blur opacity-60 group-hover/btn:opacity-100 transition duration-300" />
            <div className="relative px-6 py-4 bg-dark-800 rounded-xl flex items-center justify-center space-x-3">
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-neon-green/30 border-t-neon-green animate-spin" />
                  <span className="text-white font-bold">Processing...</span>
                </>
              ) : transactionState.status === 'success' ? (
                <>
                  <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-neon-green font-bold">Claimed Successfully</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🚀</span>
                  <span className="text-white font-bold">
                    Claim ${CONFIG.TOKEN_VALUE_USD.toLocaleString()} {CONFIG.TOKEN_SYMBOL}
                  </span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimCard;