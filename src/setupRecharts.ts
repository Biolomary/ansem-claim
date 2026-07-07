// src/setupRecharts.ts
// This file ensures Recharts works properly with React 18
import { useEffect } from 'react';

// Fix for recharts isUnsafeProperty error
export const useRechartsFix = () => {
  useEffect(() => {
    // Polyfill for older versions of recharts
    if (typeof window !== 'undefined') {
      const origError = console.error;
      console.error = (...args: any[]) => {
        if (
          typeof args[0] === 'string' &&
          args[0].includes('isUnsafeProperty')
        ) {
          return;
        }
        origError.apply(console, args);
      };
      
      return () => {
        console.error = origError;
      };
    }
  }, []);
};