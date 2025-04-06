
import { useState, useEffect, useRef } from 'react';

export function useLoadingProgress(isLoading: boolean, hasData: boolean) {
  const [progressValue, setProgressValue] = useState(30);
  const [hideProgress, setHideProgress] = useState(false);
  
  // Handle progress bar animation and hiding
  useEffect(() => {
    let interval: number | null = null;
    
    if (isLoading && progressValue < 90 && !hideProgress) {
      interval = window.setInterval(() => {
        setProgressValue(prev => Math.min(prev + 10, 90));
      }, 1000);
    } else if (!isLoading) {
      setProgressValue(100);
      setTimeout(() => {
        setHideProgress(true);
      }, 500);
    }
    
    // Force hide progress after 5 seconds if still loading but we have data
    if (hasData && isLoading && !hideProgress) {
      const forceHideTimeout = setTimeout(() => {
        setHideProgress(true);
      }, 5000);
      
      return () => {
        clearTimeout(forceHideTimeout);
        if (interval) clearInterval(interval);
      };
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, progressValue, hasData, hideProgress]);

  // Reset progress bar when starting new load with no data
  useEffect(() => {
    if (isLoading && !hasData) {
      setHideProgress(false);
      setProgressValue(30);
    }
  }, [isLoading, hasData]);

  return { progressValue, hideProgress };
}
