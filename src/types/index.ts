// src/types/index.ts
export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  isPhantomInstalled: boolean;
}

export interface TransactionState {
  status: 'idle' | 'processing' | 'confirming' | 'success' | 'error';
  signature: string | null;
  error: string | null;
  progress: number;
}

export interface ClaimRecord {
  walletAddress: string;
  transactionSignature: string;
  claimAmount: number;
  tokenValue: number;
  timestamp: string;
  status: 'pending_credit' | 'credited' | 'failed';
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
    solana?: PhantomProvider;
  }
}

export interface PhantomProvider {
  isPhantom: boolean;
  publicKey: { toString(): string } | null;
  isConnected: boolean;
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  signMessage(message: Uint8Array, encoding?: string): Promise<{ signature: Uint8Array; publicKey: { toString(): string } }>;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
}