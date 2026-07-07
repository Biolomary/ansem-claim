// src/components/WalletConnect.tsx
import React, { useState } from 'react';
import { WalletState } from '../types/index';

interface WalletConnectProps {
  walletState: WalletState;
  loading: boolean;
  onConnect: () => Promise<WalletState>;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ walletState, loading, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const handleConnect = async (): Promise<void> => {
    setIsConnecting(true);
    try {
      await onConnect();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-neon-purple/20 border-t-neon-purple animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 backdrop-blur-sm" />
          </div>
        </div>
        <p className="mt-6 text-gray-400 animate-pulse">Initializing wallet connection...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12 animate-scale-in">
      {/* Floating wallet icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-green rounded-full blur-2xl opacity-20 animate-pulse-glow" />
        <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-neon-purple via-neon-blue to-neon-green p-[1px]">
          <div className="w-full h-full rounded-2xl bg-dark-900 flex items-center justify-center backdrop-blur-xl">
            <svg 
              className="w-16 h-16 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-3">
        Connect Your Wallet
      </h2>
      <p className="text-gray-400 mb-8 text-center max-w-sm">
        Link your Phantom wallet to access the {isConnecting ? 'protocol' : 'ecosystem'}
      </p>

      {/* Connect Button */}
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="relative group"
      >
        {/* Button glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple to-neon-green rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
        
        {/* Button content */}
        <div className="relative px-8 py-4 bg-dark-800 rounded-2xl leading-none flex items-center space-x-3">
          {isConnecting ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-neon-purple/30 border-t-neon-purple animate-spin" />
              <span className="text-white font-semibold">Connecting...</span>
            </>
          ) : walletState.isPhantomInstalled ? (
            <>
              <img src="/phantom-icon.png" alt="Phantom" className="w-6 h-6" />
              <span className="text-white font-semibold">Connect Phantom</span>
              <svg className="w-5 h-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          ) : (
            <>
              <img src="/phantom-icon.png" alt="Phantom" className="w-6 h-6" />
              <span className="text-white font-semibold">Install Phantom</span>
              <svg className="w-5 h-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </>
          )}
        </div>
      </button>

      {/* Install link */}
      {!walletState.isPhantomInstalled && (
        <a
          href="https://phantom.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 text-neon-purple hover:text-neon-green transition-colors duration-200 text-sm font-medium flex items-center space-x-1 group"
        >
          <span>Get Phantom Wallet</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      )}
    </div>
  );
};

export default WalletConnect;