// src/hooks/usePhantomWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletState, PhantomProvider } from '../types/index';
import { CONFIG } from '../config';

// Fallback RPC endpoints in case the primary fails
const RPC_ENDPOINTS = [
  CONFIG.RPC_ENDPOINT,
  'https://api.devnet.solana.com',
  'https://solana-mainnet.g.alchemy.com/v2/demo',
];

const createConnection = (endpoint: string) => {
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
};

export const usePhantomWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: 0,
    isPhantomInstalled: false
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [rpcError, setRpcError] = useState<string | null>(null);
  const [currentRpcIndex, setCurrentRpcIndex] = useState<number>(0);

  const connection = createConnection(RPC_ENDPOINTS[currentRpcIndex]);

  // Try different RPC endpoints
  const tryRpcEndpoints = async <T,>(
    operation: (conn: Connection) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> => {
    let lastError: Error | null = null;

    for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
      const endpoint = RPC_ENDPOINTS[i];
      const tempConnection = createConnection(endpoint);

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const result = await operation(tempConnection);
          // If successful with a different endpoint, switch to it
          if (i !== currentRpcIndex) {
            setCurrentRpcIndex(i);
            console.log(`Switched to RPC endpoint: ${endpoint}`);
          }
          setRpcError(null);
          return result;
        } catch (error: any) {
          lastError = error;
          console.warn(`RPC attempt ${attempt + 1} failed for ${endpoint}:`, error.message);
          
          if (error.message?.includes('403') || error.message?.includes('429')) {
            // Rate limited or forbidden, try next endpoint immediately
            break;
          }
          
          if (attempt < maxRetries - 1) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }
    }

    throw lastError || new Error('All RPC endpoints failed');
  };

  const getProvider = useCallback((): PhantomProvider | null => {
    try {
      if (window.phantom?.solana?.isPhantom) {
        return window.phantom.solana;
      }
      if (window.solana?.isPhantom) {
        return window.solana;
      }
      return null;
    } catch (error) {
      console.error('Error getting Phantom provider:', error);
      return null;
    }
  }, []);

  const fetchBalance = useCallback(async (publicKey: string): Promise<number> => {
    return tryRpcEndpoints(async (conn) => {
      const pubKey = new PublicKey(publicKey);
      const balance = await conn.getBalance(pubKey);
      return balance / LAMPORTS_PER_SOL;
    });
  }, []);

  const updateWalletState = useCallback(async (publicKey: string): Promise<void> => {
    try {
      const balance = await fetchBalance(publicKey);
      
      setWalletState({
        connected: true,
        publicKey,
        balance,
        isPhantomInstalled: true
      });
      setRpcError(null);
    } catch (error: any) {
      console.error('Error updating wallet state:', error);
      
      // Still set as connected even if balance fetch fails
      setWalletState(prev => ({
        ...prev,
        connected: true,
        publicKey,
        isPhantomInstalled: true
      }));
      
      setRpcError('Unable to fetch balance. Please check your connection.');
    }
  }, [fetchBalance]);

  const connectWallet = useCallback(async (): Promise<WalletState> => {
    try {
      const provider = getProvider();
      
      if (!provider) {
        throw new Error('Phantom wallet not installed. Please install Phantom wallet extension.');
      }

      const response = await provider.connect();
      const publicKey = response.publicKey.toString();
      
      await updateWalletState(publicKey);
      
      return {
        connected: true,
        publicKey,
        balance: walletState.balance,
        isPhantomInstalled: true
      };
    } catch (error: any) {
      console.error('Connection error:', error);
      
      if (error.message?.includes('not installed')) {
        window.open('https://phantom.app/', '_blank');
      }
      
      throw error;
    }
  }, [getProvider, updateWalletState, walletState.balance]);

  const disconnectWallet = useCallback(async (): Promise<void> => {
    try {
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setWalletState({
        connected: false,
        publicKey: null,
        balance: 0,
        isPhantomInstalled: true
      });
      setRpcError(null);
    }
  }, [getProvider]);

  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!walletState.publicKey) return;
    
    try {
      const balance = await fetchBalance(walletState.publicKey);
      setWalletState(prev => ({ ...prev, balance }));
      setRpcError(null);
    } catch (error: any) {
      console.error('Error refreshing balance:', error);
      setRpcError('Failed to refresh balance. Please try again.');
    }
  }, [walletState.publicKey, fetchBalance]);

  // Initialize wallet on mount
  useEffect(() => {
    let mounted = true;

    const checkPhantom = async () => {
      try {
        const provider = getProvider();
        
        if (!mounted) return;
        
        if (provider) {
          setWalletState(prev => ({ ...prev, isPhantomInstalled: true }));
          
          // Try to auto-connect if previously connected
          try {
            const resp = await provider.connect({ onlyIfTrusted: true });
            if (mounted && resp?.publicKey) {
              await updateWalletState(resp.publicKey.toString());
            }
          } catch (error: any) {
            // User hasn't authorized auto-connect or not previously connected
            if (error.message?.includes('not installed')) {
              setWalletState(prev => ({ ...prev, isPhantomInstalled: false }));
            }
          }
        } else {
          setWalletState(prev => ({ ...prev, isPhantomInstalled: false }));
        }
      } catch (error) {
        console.error('Error checking Phantom:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkPhantom();

    return () => {
      mounted = false;
    };
  }, [getProvider, updateWalletState]);

  // Setup event listeners
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const handleAccountChange = (publicKey: { toString(): string } | null) => {
      if (publicKey) {
        const address = publicKey.toString();
        updateWalletState(address);
      } else {
        setWalletState({
          connected: false,
          publicKey: null,
          balance: 0,
          isPhantomInstalled: true
        });
        setRpcError(null);
      }
    };

    const handleDisconnect = () => {
      setWalletState({
        connected: false,
        publicKey: null,
        balance: 0,
        isPhantomInstalled: true
      });
      setRpcError(null);
    };

    try {
      provider.on('accountChanged', handleAccountChange);
      provider.on('disconnect', handleDisconnect);
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }

    return () => {
      try {
        provider.removeListener('accountChanged', handleAccountChange);
        provider.removeListener('disconnect', handleDisconnect);
      } catch (error) {
        console.error('Error removing event listeners:', error);
      }
    };
  }, [getProvider, updateWalletState]);

  return {
    walletState,
    loading,
    rpcError,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    getProvider
  };
};