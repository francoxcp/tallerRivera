import { useState, useRef, useCallback } from 'react';

/**
 * Hook para prevenir envíos múltiples rápidos (Rate Limiting)
 * @param {number} delayMs - Milisegundos de espera entre requests (default: 2000)
 */
export const useRateLimit = (delayMs = 2000) => {
  const [isLoading, setIsLoading] = useState(false);
  const lastRequestRef = useRef(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const executeWithRateLimit = useCallback(
    async (callback) => {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestRef.current;

      if (timeSinceLastRequest < delayMs) {
        const remaining = Math.ceil((delayMs - timeSinceLastRequest) / 1000);
        setRemainingTime(remaining);
        console.warn(`⏱️ Rate limit: Espera ${remaining}s antes de intentar de nuevo`);
        return null;
      }

      setIsLoading(true);
      setRemainingTime(0);
      lastRequestRef.current = now;

      try {
        return await callback();
      } catch (error) {
        console.error('❌ Error en executeWithRateLimit:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [delayMs]
  );

  return {
    isLoading,
    executeWithRateLimit,
    remainingTime,
  };
};

export default useRateLimit;
