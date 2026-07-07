// src/hooks/usePhantomWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletState, PhantomProvider } from '../types/index';
import { CONFIG } from '../config';

export const usePhantomWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: 0,
    isPhantomInstalled: false
  });
  
  const [loading, setLoading] = useState(true);
  const connection = new Connection(CONFIG.RPC_ENDPOINT, 'confirmed');

  const getProvider = useCallback((): PhantomProvider | null => {
    if (window.phantom?.solana?.isPhantom) return window.phantom.solana;
    if (window.solana?.isPhantom) return window.solana;
    return null;
  }, []);

  const updateWalletState = useCallback(async (publicKey: string) => {
    try {
      const pubKey = new PublicKey(publicKey);
      const balance = await connection.getBalance(pubKey);
      setWalletState({
        connected: true,
        publicKey,
        balance: balance / LAMPORTS_PER_SOL,
        isPhantomInstalled: true
      });
    } catch (error) {
      console.error('Error updating wallet:', error);
    }
  }, [connection]);

  const connectWallet = useCallback(async (): Promise<WalletState> => {
    const provider = getProvider();
    if (!provider) {
      window.open('https://phantom.app/', '_blank');
      throw new Error('Phantom wallet not installed');
    }
    const response = await provider.connect();
    await updateWalletState(response.publicKey.toString());
    return walletState;
  }, [getProvider, updateWalletState, walletState]);

  const disconnectWallet = useCallback(async () => {
    const provider = getProvider();
    if (provider) await provider.disconnect();
    setWalletState({
      connected: false,
      publicKey: null,
      balance: 0,
      isPhantomInstalled: true
    });
  }, [getProvider]);

  const refreshBalance = useCallback(async () => {
    if (walletState.publicKey) await updateWalletState(walletState.publicKey);
  }, [walletState.publicKey, updateWalletState]);

  useEffect(() => {
    const checkPhantom = async () => {
      const provider = getProvider();
      if (provider) {
        setWalletState(prev => ({ ...prev, isPhantomInstalled: true }));
        try {
          const resp = await provider.connect({ onlyIfTrusted: true });
          await updateWalletState(resp.publicKey.toString());
        } catch {}
      }
      setLoading(false);
    };
    checkPhantom();
  }, [getProvider, updateWalletState]);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const handleAccountChange = (publicKey: { toString(): string } | null) => {
      if (publicKey) updateWalletState(publicKey.toString());
      else setWalletState(prev => ({ ...prev, connected: false, publicKey: null, balance: 0 }));
    };

    const handleDisconnect = () => {
      setWalletState(prev => ({ ...prev, connected: false, publicKey: null, balance: 0 }));
    };

    provider.on('accountChanged', handleAccountChange);
    provider.on('disconnect', handleDisconnect);
    return () => {
      provider.removeListener('accountChanged', handleAccountChange);
      provider.removeListener('disconnect', handleDisconnect);
    };
  }, [getProvider, updateWalletState]);

  return { walletState, loading, connectWallet, disconnectWallet, refreshBalance, getProvider };
};